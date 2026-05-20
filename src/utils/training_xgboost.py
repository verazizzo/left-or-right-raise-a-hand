import os
import pandas as pd
import numpy as np
import itertools
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import LeaveOneGroupOut
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score
from xgboost import XGBClassifier

# Importiamo la funzione SHAP
from src.utils.shap_analysis_xgb import shap_analysis_xgboost

def train_XGBoost(df, is_real):
    x = df.drop(columns=['Target_Label', 'User'])
    # Mappatura fondamentale per XGBoost (richiede etichette 0 e 1)
    y = df['Target_Label'].map({2: 0, 3: 1}) 
    groups = df['User']
    feature_names = x.columns.tolist()

    f1_totale = []
    auc_totale = []

    logo = LeaveOneGroupOut()
    
    # Griglia ottimizzata per XGBoost (alberi, profondità, velocità di apprendimento)
    param_grid = {
        'n_estimators': [50, 100],
        'max_depth': [2], # Fissiamo a 2. Solo "stump" (alberi nani)
        'learning_rate': [0.01, 0.05],
        'reg_lambda': [10, 50], # Regolarizzazione L2 massiccia
        'colsample_bytree': [0.1, 0.2], # Usa solo il 10% o 20% delle colonne!
        'subsample': [0.5, 0.7], # Usa solo il 50% o 70% delle righe ad ogni albero!
        'min_child_weight': [5, 10] # Vieta di isolare campioni singoli
    }
    param_combinations = list(itertools.product(*param_grid.values()))

    # =================================================================
    # VERO CICLO NESTED: Isoliamo un utente per il test fin dall'inizio
    # =================================================================
    for outer_train_idx, outer_test_idx in logo.split(x, y, groups=groups):
        
        # 1. Separazione
        x_train_outer = x.iloc[outer_train_idx]
        y_train_outer = y.iloc[outer_train_idx].values
        groups_train_outer = groups.iloc[outer_train_idx].values
        
        x_test_outer = x.iloc[outer_test_idx]
        y_test_outer = y.iloc[outer_test_idx].values
        
        test_user = groups.iloc[outer_test_idx].iloc[0]
        print(f"\n[{test_user}] Inizio ottimizzazione XGBoost sui 29 utenti rimanenti...")

        # 2. RICERCA PARAMETRI 
        best_params = None
        best_f1 = -1

        for params in param_combinations:
            n_estimators, max_depth, learning_rate, reg_lambda, colsample_bytree, subsample, min_child_weight = params
            fold_f1_scores = []
            
            inner_logo = LeaveOneGroupOut()
            for inner_train_idx, inner_test_idx in inner_logo.split(x_train_outer, y_train_outer, groups=groups_train_outer):
                
                x_train_inner = x_train_outer.iloc[inner_train_idx]
                y_train_inner = y_train_outer[inner_train_idx]
                x_test_inner = x_train_outer.iloc[inner_test_idx]
                y_test_inner = y_train_outer[inner_test_idx]

                scaler_inner = StandardScaler()
                x_train_inner_s = scaler_inner.fit_transform(x_train_inner)
                x_test_inner_s = scaler_inner.transform(x_test_inner)

                # --- MODIFICA 1: Tolto CUDA, aggiunto n_jobs=-2 ---
                xgb = XGBClassifier(
                    n_estimators=n_estimators, 
                    max_depth=max_depth, 
                    learning_rate=learning_rate,
                    reg_lambda=reg_lambda,
                    colsample_bytree=colsample_bytree,
                    subsample=subsample,
                    min_child_weight=min_child_weight,
                    tree_method='hist',
                    n_jobs=-2, 
                    random_state=42,
                    eval_metric='logloss'
                )
                
                xgb.fit(x_train_inner_s, y_train_inner)
                y_pred_inner = xgb.predict(x_test_inner_s)
                
                fold_f1 = f1_score(y_test_inner, y_pred_inner, average='weighted')
                fold_f1_scores.append(fold_f1)

            avg_f1 = np.mean(fold_f1_scores)
            if avg_f1 > best_f1:
                best_params = {
                    'n_estimators': n_estimators, 
                    'max_depth': max_depth, 
                    'learning_rate': learning_rate,
                    'reg_lambda': reg_lambda,
                    'colsample_bytree': colsample_bytree,
                    'subsample': subsample,
                    'min_child_weight': min_child_weight
                }
                best_f1 = avg_f1

        print(f"[{test_user}] Parametri scelti: {best_params} (Validation F1: {best_f1:.4f})")

        # 3. ADDESTRAMENTO FINALE SUI 29 UTENTI
        scaler_outer = StandardScaler()
        x_train_outer_s = scaler_outer.fit_transform(x_train_outer)
        x_test_outer_s = scaler_outer.transform(x_test_outer)

        # --- MODIFICA 2: Tolto CUDA, aggiunto n_jobs=-2 ---
        best_xgb = XGBClassifier(
            n_estimators=best_params['n_estimators'], 
            max_depth=best_params['max_depth'], 
            learning_rate=best_params['learning_rate'],
            reg_lambda=best_params['reg_lambda'],
            colsample_bytree=best_params['colsample_bytree'],
            subsample=best_params['subsample'],
            min_child_weight=best_params['min_child_weight'],
            tree_method='hist',
            n_jobs=-2,
            random_state=42,
            eval_metric='logloss'
        )
        best_xgb.fit(x_train_outer_s, y_train_outer)

        train_acc = best_xgb.score(x_train_outer_s, y_train_outer)
        train_loss = 1 - train_acc

        # 4. TEST SULL'UTENTE ISOLATO 
        y_pred = best_xgb.predict(x_test_outer_s)
        y_prob = best_xgb.predict_proba(x_test_outer_s)[:, 1]
        
        test_acc = accuracy_score(y_test_outer, y_pred)
        test_loss = 1 - test_acc
        f1 = f1_score(y_test_outer, y_pred, average='weighted')
        auc = roc_auc_score(y_test_outer, y_prob)

        f1_totale.append(f1)
        auc_totale.append(auc)
        
        print(f"[{test_user}] F1: {f1:.4f} | AUC: {auc:.4f}")
        print(f"    -> Train Acc: {train_acc:.4f} (Loss: {train_loss:.4f})")
        print(f"    -> Test  Acc: {test_acc:.4f}  (Loss: {test_loss:.4f})\n")

        # 5. SHAP ANALYSIS
        shap_analysis_xgboost(best_xgb, x_test_outer_s, feature_names, test_user, is_real)

    print(f"F1-score medio ± standard deviation su tutti gli utenti: {np.mean(f1_totale):.4f} ± {np.std(f1_totale):.4f}")
    print(f"AUC medio ± standard deviation su tutti gli utenti: {np.mean(auc_totale):.4f} ± {np.std(auc_totale):.4f}")
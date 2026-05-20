import os
import pandas as pd
import numpy as np
import shap
import matplotlib.pyplot as plt
import seaborn as sns
import itertools

from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import LeaveOneGroupOut
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score

from src.utils.shap_analysis import shap_analysis_svm


def train_SVM(df, is_real):
    x = df.drop(columns=['Target_Label', 'User'])
    # Assicurati di mappare y a 0 e 1, altrimenti roc_auc_score potrebbe dare problemi
    y = df['Target_Label'].map({2: 0, 3: 1}) 
    groups = df['User']
    feature_names = x.columns.tolist()

    f1_totale = []
    auc_totale = []

    # Inizializziamo la LOGO. random_state non serve in LeaveOneGroupOut perché è deterministico
    logo = LeaveOneGroupOut()
    
    param_grid = {
        'kernel': ['linear', 'poly'],
        'C': [0.0001, 0.001, 0.01],
        'degree': [2, 3, 4]
    }
    param_combinations = list(itertools.product(*param_grid.values()))

    # =================================================================
    # VERO CICLO NESTED: Isoliamo un utente per il test fin dall'inizio
    # =================================================================
    for outer_train_idx, outer_test_idx in logo.split(x, y, groups=groups):
        
        # 1. Separazione "Sacra"
        x_train_outer = x.iloc[outer_train_idx]
        y_train_outer = y.iloc[outer_train_idx].values
        groups_train_outer = groups.iloc[outer_train_idx].values
        
        x_test_outer = x.iloc[outer_test_idx]
        y_test_outer = y.iloc[outer_test_idx].values
        
        test_user = groups.iloc[outer_test_idx].iloc[0]
        print(f"\n[{test_user}] Inizio ottimizzazione sui 29 utenti rimanenti...")

        # 2. RICERCA PARAMETRI (Solo sui 29 utenti)
        best_params = None
        best_f1 = -1

        for params in param_combinations:
            kernel, C, degree = params
            fold_f1_scores = []
            
            # Ciclo interno LOGO (sui 29 utenti per simulare i test)
            inner_logo = LeaveOneGroupOut()
            for inner_train_idx, inner_test_idx in inner_logo.split(x_train_outer, y_train_outer, groups=groups_train_outer):
                
                # BUG FIXATO: Uso di iloc
                x_train_inner = x_train_outer.iloc[inner_train_idx]
                y_train_inner = y_train_outer[inner_train_idx]
                x_test_inner = x_train_outer.iloc[inner_test_idx]
                y_test_inner = y_train_outer[inner_test_idx]

                # Scaling locale per l'inner loop
                scaler_inner = StandardScaler()
                x_train_inner_s = scaler_inner.fit_transform(x_train_inner)
                x_test_inner_s = scaler_inner.transform(x_test_inner)

                svm = SVC(kernel=kernel, C=C, degree=degree, random_state=42)
                svm.fit(x_train_inner_s, y_train_inner)
                
                # ---> CALCOLO F1-SCORE INVECE DELL'ACCURACY <---
                y_pred_inner = svm.predict(x_test_inner_s)
                fold_f1 = f1_score(y_test_inner, y_pred_inner, average='weighted')
                fold_f1_scores.append(fold_f1)

            avg_f1 = np.mean(fold_f1_scores)
            if avg_f1 > best_f1:
                best_params = {'kernel': kernel, 'C': C, 'degree': degree}
                best_f1 = avg_f1

        print(f"[{test_user}] Parametri scelti: {best_params} (Validation F1: {best_f1:.4f})")

        # 3. ADDESTRAMENTO FINALE (Sui 29 utenti con i parametri migliori)
        scaler_outer = StandardScaler()
        x_train_outer_s = scaler_outer.fit_transform(x_train_outer)
        x_test_outer_s = scaler_outer.transform(x_test_outer)

        best_svm = SVC(kernel=best_params['kernel'], C=best_params['C'],degree=best_params['degree'], probability=True, random_state=42)
        best_svm.fit(x_train_outer_s, y_train_outer)

        train_acc = best_svm.score(x_train_outer_s, y_train_outer)
        train_loss = 1 - train_acc

        # 4. TEST SULL'UTENTE ISOLATO 
        # ---> 1° PASSO: IL MODELLO FA LE PREVISIONI <---
        y_pred = best_svm.predict(x_test_outer_s)
        y_prob = best_svm.predict_proba(x_test_outer_s)[:, 1]
        
        # ---> 2° PASSO: ORA POSSIAMO CALCOLARE LE METRICHE <---
        test_acc = accuracy_score(y_test_outer, y_pred)
        test_loss = 1 - test_acc
        f1 = f1_score(y_test_outer, y_pred, average='weighted')
        auc = roc_auc_score(y_test_outer, y_prob)

        f1_totale.append(f1)
        auc_totale.append(auc)
        
        # ---> 3° PASSO: STAMPIAMO I RISULTATI <---
        print(f"[{test_user}] F1: {f1:.4f} | AUC: {auc:.4f}")
        print(f"    -> Train Acc: {train_acc:.4f} (Loss: {train_loss:.4f})")
        print(f"    -> Test  Acc: {test_acc:.4f}  (Loss: {test_loss:.4f})\n")

        # 5. SHAP ANALYSIS (Passiamo i nomi delle feature e l'ID utente

        shap_analysis_svm(best_svm, x_test_outer_s, x_train_outer_s, feature_names, test_user, is_real)

    print(f"F1-score medio ± standard deviation su tutti gli utenti: {np.mean(f1_totale):.4f} ± {np.std(f1_totale):.4f}")

    print(f"AUC medio ± standard deviation su tutti gli utenti: {np.mean(auc_totale):.4f} ± {np.std(auc_totale):.4f}")


    








"""   grid_search = GridSearchCV(
        estimator=svm, 
        param_grid=param_grid, 
        cv=logo, 
        scoring='accuracy',
        n_jobs=-1 
    )

    grid_search.fit(x_scaled, y, groups=groups)
    print(f"Best parameters (LOGO): {grid_search.best_params_}")    # Best parameters found: kernel='linear', C=00.1
    print(f"Accuracy on Validation (LOGO): {grid_search.best_score_}")

    best_svm = grid_search.best_estimator_
    print(f"Accuracy on pure Train set: {best_svm.score(x_scaled, y)}") 

    return best_svm, scaler

def train_xgboost(df):

    x = df.drop(columns=['Target_Label', 'User'])
    
    # Binary mapping
    y = df['Target_Label'].map({2: 0, 3: 1})
    groups = df['User']
    
    scaler = StandardScaler()
    x_scaled = scaler.fit_transform(x)
    x_scaled_df = pd.DataFrame(x_scaled, columns=x.columns)   # only useful for SHAP plots

    output_dir = 'temp/shap_plots/xgboost'
    os.makedirs(output_dir, exist_ok=True)

    # Leave-One-Group-Out Cross-Validation
    logo = LeaveOneGroupOut()

    xgb = XGBClassifier(eval_metric='logloss', random_state=42)
    
    # Hyperparameter grid for XGBoost
    param_grid = {
        'n_estimators': [100, 200],
        'max_depth': [3, 5, 7],
        'learning_rate': [0.01, 0.1]
    }

    print("\nStarting Grid Search with LOGO for XGBoost")
    grid_search = GridSearchCV(
        estimator=xgb, 
        param_grid=param_grid, 
        cv=logo, 
        scoring='accuracy',
        n_jobs=-1 
    )

    grid_search.fit(x_scaled, y, groups=groups)
    print(f"Best parameters (LOGO): {grid_search.best_params_}")
    print(f"Best accuracy on train set: {grid_search.best_score_}")

    best_xgb = grid_search.best_estimator_

    # Best parameters found: {'learning_rate': 0.01, 'max_depth': 5, 'n_estimators': 200}

    return best_xgb, scaler"""
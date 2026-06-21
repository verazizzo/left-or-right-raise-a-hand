import os
import pandas as pd
import numpy as np
import itertools

from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import LeaveOneGroupOut
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score

from src.utils.shap_analysis import shap_analysis_svm, shap_analysis_xgboost, esporta_json_dashboard, genera_topoplot_statico_mne
from xgboost import XGBClassifier

import json



def train_SVM(df, is_real):
    x = df.drop(columns=['Target_Label', 'User'])
    # Assicurati di mappare y a 0 e 1, altrimenti roc_auc_score potrebbe dare problemi
    y = df['Target_Label'].map({2: 0, 3: 1}) 
    groups = df['User']
    feature_names = x.columns.tolist()

    f1_totale = []
    auc_totale = []

    shap_dfs_totali = []
    performance_utenti = {}

    # Inizializziamo la LOGO. random_state non serve in LeaveOneGroupOut perché è deterministico
    logo = LeaveOneGroupOut()
    
    param_grid = {
        'kernel': ['linear', 'poly'],
        'C': [0.0001, 0.001, 0.01],
        'degree': [2, 3, 4]
    }
    param_combinations = list(itertools.product(*param_grid.values()))

    user_counter = 1

    # Isoliamo un utente per il test fin dall'inizio
    for outer_train_idx, outer_test_idx in logo.split(x, y, groups=groups):
        
        # 1. Separazione
        x_train_outer = x.iloc[outer_train_idx]
        y_train_outer = y.iloc[outer_train_idx].values
        groups_train_outer = groups.iloc[outer_train_idx].values
        
        x_test_outer = x.iloc[outer_test_idx]
        y_test_outer = y.iloc[outer_test_idx].values
        
        test_user = groups.iloc[outer_test_idx].iloc[0]
        anon_user = f"user_{user_counter}"

        print(f"\n[{anon_user}] ) [{test_user}] Inizio ottimizzazione sui 29 utenti rimanenti...")

        # 2. RICERCA PARAMETRI (Solo sui 29 utenti)
        best_params = None
        best_f1 = -1

        for params in param_combinations:
            kernel, C, degree = params
            fold_f1_scores = []
            
            # Ciclo interno LOGO (sui 29 utenti per simulare i test)
            inner_logo = LeaveOneGroupOut()
            for inner_train_idx, inner_test_idx in inner_logo.split(x_train_outer, y_train_outer, groups=groups_train_outer):
                
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
                
                # CALCOLO F1-SCORE 
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
        y_pred = best_svm.predict(x_test_outer_s)
        y_prob = best_svm.predict_proba(x_test_outer_s)[:, 1]
        
        test_acc = accuracy_score(y_test_outer, y_pred)
        test_loss = 1 - test_acc
        f1 = f1_score(y_test_outer, y_pred, average='weighted')
        auc = roc_auc_score(y_test_outer, y_prob)

        f1_totale.append(f1)
        auc_totale.append(auc)

        performance_utenti[anon_user] = {
            "f1_score": float(f1),
            "auc_score": float(auc)
        }
        
        print(f"[{anon_user}] F1: {f1:.4f} | AUC: {auc:.4f}")
        print(f"    -> Train Acc: {train_acc:.4f} (Loss: {train_loss:.4f})")
        print(f"    -> Test  Acc: {test_acc:.4f}  (Loss: {test_loss:.4f})\n")

        # 5. SHAP ANALYSIS 

        df_shap_utente = shap_analysis_svm(best_svm, x_test_outer_s, x_train_outer_s, y_test_outer, feature_names, anon_user, is_real)
        if df_shap_utente is not None:
            shap_dfs_totali.append(df_shap_utente)

        # INCREMENTIAMO IL CONTATORE A FINE CICLO
        user_counter += 1

    f1_mean = np.mean(f1_totale)
    f1_std = np.std(f1_totale)
    auc_mean = np.mean(auc_totale)
    auc_std = np.std(auc_totale)

    struttura_metriche = {
        "modello": "SVM",
        "is_real_session": bool(is_real),
        "global_metrics": {
            "f1_mean": f1_mean,
            "f1_std": f1_std,
            "auc_mean": auc_mean,
            "auc_std": auc_std
        },
        "per_user_metrics": performance_utenti
    }

    # Definiamo dove salvarlo (es: temp/shap_plots/svm/real/ o in una cartella dedicata)
    tipo_task = "real" if is_real else "imm"
    dir_metriche = f'temp/shap_plots/svm/{tipo_task}'
    os.makedirs(dir_metriche, exist_ok=True)
    
    path_json_metriche = f'{dir_metriche}/performance_metrics.json'
    with open(path_json_metriche, 'w', encoding='utf-8') as f:
        json.dump(struttura_metriche, f, indent=4, ensure_ascii=False)
        
    print(f"[METRICHE OK] File delle performance salvato in: {path_json_metriche}")



    print(f"F1-score medio ± standard deviation: {f1_mean:.4f} ± {f1_std:.4f}")
    print(f"AUC medio ± standard deviation: {auc_mean:.4f} ± {auc_std:.4f}")

    # PAZIENTE BLOBALE (MEDIE DI TUTTI I UTENTI)
    if shap_dfs_totali:
        print(f"\n[INFO] Calcolo della media globale SHAP in corso...")
        df_unito = pd.concat(shap_dfs_totali)
        
        # Raggruppa per feature e calcola la media matematica di tutti i valori
        df_globale = df_unito.groupby('Feature_Name').mean(numeric_only=True).reset_index()
        # Ricrea le colonne necessarie
        df_globale[['Channel', 'FeatureType', 'Window']] = df_globale['Feature_Name'].str.split('_', expand=True)

        tipo_task = "real" if is_real else "imm"
        # Per XGBoost ricordati di cambiare "svm" in "xgboost" nel path qui sotto
        dir_globale = f'temp/shap_plots/svm/{tipo_task}/user_GLOBALE' 
        os.makedirs(dir_globale, exist_ok=True)

        # 1. Esporta i file per la Dashboard fingendo che sia un paziente normale
        esporta_json_dashboard(df_globale, dir_globale, "GLOBALE", is_real)
        
        # 2. Esporta i due Topoplot MNE Statici (Left e Right con scala RdBu_r classica)
        if 'SHAP_Dir_Left' in df_globale.columns and 'SHAP_Dir_Right' in df_globale.columns:
            genera_topoplot_statico_mne(df_globale['SHAP_Dir_Left'].values, df_globale['Feature_Name'].values, dir_globale, "GLOBALE", "Left")
            genera_topoplot_statico_mne(df_globale['SHAP_Dir_Right'].values, df_globale['Feature_Name'].values, dir_globale, "GLOBALE", "Right")

        # 3. CALCOLO E STAMPA DEI GRAFICI A BARRE SEABORN (Canali, Feature, Finestre)
        import matplotlib.pyplot as plt
        import seaborn as sns

        # Specifica quale colonna usare per l'importanza (SVM usa SHAP_Value_Abs, XGBoost usa SHAP_Value)
        col_importanza = 'SHAP_Value_Abs' if 'SHAP_Value_Abs' in df_globale.columns else 'SHAP_Value'

        # Usiamo le colonne direzionali e prendiamo l'assoluto della somma netta
        channel_imp_glob_left = df_globale.groupby('Channel')['SHAP_Dir_Left'].sum().abs().sort_values(ascending=False)
        channel_imp_glob_right = df_globale.groupby('Channel')['SHAP_Dir_Right'].sum().abs().sort_values(ascending=False)
        
        feature_imp_glob = df_globale.groupby('FeatureType')[col_importanza].sum().sort_values(ascending=False)
        window_imp_glob = df_globale.groupby('Window')[col_importanza].sum().sort_values(ascending=False)

        # Plot 1L: Canali Globale LEFT (Blu)
        plt.figure(figsize=(10, 6))
        sns.barplot(x=channel_imp_glob_left.values, y=channel_imp_glob_left.index, hue=channel_imp_glob_left.index, palette="Blues_r", legend=False)
        plt.title(f"Channel Importance GLOBALE LEFT (Tutti gli Utenti)", fontsize=14)
        plt.xlabel("Mean Absolute SHAP Value (Left Class)")
        plt.ylabel("EEG Channel")
        plt.tight_layout()
        plt.savefig(f'{dir_globale}/shap_1_channels_left.png', dpi=300)
        plt.close()

        # Plot 1R: Canali Globale RIGHT (Rosso)
        plt.figure(figsize=(10, 6))
        sns.barplot(x=channel_imp_glob_right.values, y=channel_imp_glob_right.index, hue=channel_imp_glob_right.index, palette="Reds_r", legend=False)
        plt.title(f"Channel Importance GLOBALE RIGHT (Tutti gli Utenti)", fontsize=14)
        plt.xlabel("Mean Absolute SHAP Value (Right Class)")
        plt.ylabel("EEG Channel")
        plt.tight_layout()
        plt.savefig(f'{dir_globale}/shap_1_channels_right.png', dpi=300)
        plt.close()

        # Plot 2: Feature Importance GLOBALE
        plt.figure(figsize=(12, 8))
        sns.barplot(x=feature_imp_glob.values, y=feature_imp_glob.index, hue=feature_imp_glob.index, palette="mako", legend=False)
        plt.title(f"Feature Importance GLOBALE (Tutti gli Utenti)", fontsize=14)
        plt.xlabel("Mean Absolute SHAP Value (Predictive Impact)")
        plt.ylabel("Feature Type")
        plt.tight_layout()
        plt.savefig(f'{dir_globale}/shap_2_features.png', dpi=300)
        plt.close()

        # Plot 3: Temporal Window Importance GLOBALE
        plt.figure(figsize=(8, 4))
        sns.barplot(x=window_imp_glob.values, y=window_imp_glob.index, hue=window_imp_glob.index, palette="rocket", legend=False)
        plt.title(f"Temporal Window Importance GLOBALE (Tutti gli Utenti)", fontsize=14)
        plt.xlabel("Mean Absolute SHAP Value (Predictive Impact)")
        plt.ylabel("Temporal Window")
        plt.tight_layout()
        plt.savefig(f'{dir_globale}/shap_3_windows.png', dpi=300)
        plt.close()

        print(f"[OK] Paziente GLOBALE salvato (Grafici e Dati) in {dir_globale}")




    results = {
        'F1_Mean': f1_mean,
        'F1_Std': f1_std,
        'AUC_Mean': auc_mean,
        'AUC_Std': auc_std,
        'F1_Per_User': f1_totale, 
        'AUC_Per_User': auc_totale
    }
    
    return results


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

    # Isoliamo un utente per il test fin dall'inizio
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
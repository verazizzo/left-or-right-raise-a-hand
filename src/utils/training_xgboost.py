import os
import pandas as pd
import shap
import joblib
import matplotlib.pyplot as plt

from sklearn.model_selection import LeaveOneGroupOut, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.base import clone
from xgboost import XGBClassifier # <-- Importiamo XGBoost

def training(df):
    # ==========================================
    # 1. PULIZIA DATI E FEATURE SELECTION
    # ==========================================
    # Eliminiamo le colonne relative alla corteccia visiva/parietale (O1, O2, P7, P8)
    # per evitare che il modello impari dai movimenti oculari.
    cols_to_drop = [c for c in df.columns if any(vis in c for vis in ['O1_', 'O2_', 'P7_', 'P8_'])]
    print(f"Elimino {len(cols_to_drop)} features visive/parietali per ridurre il rumore...")
    
    # Rimuoviamo anche User e Target_Label per creare la matrice X
    x = df.drop(columns=['Target_Label', 'User'] + cols_to_drop)
    
    # MAPPATURA OBBLIGATORIA PER XGBOOST (2 -> 0, 3 -> 1)
    y = df['Target_Label'].map({2: 0, 3: 1})
    groups = df['User']
    
    # Standardizzazione
    scaler = StandardScaler()
    x_scaled = scaler.fit_transform(x)
    x_scaled_df = pd.DataFrame(x_scaled, columns=x.columns) # Utile per i plot SHAP

    output_dir = 'temp/shap_plots'
    os.makedirs(output_dir, exist_ok=True)

    # ==========================================
    # 2. GRID SEARCH CV (LOGO) CON XGBOOST
    # ==========================================
    logo = LeaveOneGroupOut()
    
    # XGBoost Classifier
    xgb = XGBClassifier(eval_metric='logloss', random_state=42)
    
    # Parametri tipici da ottimizzare per XGBoost
    param_grid = {
        'n_estimators': [100, 200],
        'max_depth': [3, 5, 7],
        'learning_rate': [0.01, 0.1]
    }

    print("\nAvvio della Grid Search con XGBoost...")
    grid_search = GridSearchCV(
        estimator=xgb, 
        param_grid=param_grid, 
        cv=logo, 
        scoring='accuracy',
        n_jobs=-1 
    )

    grid_search.fit(x_scaled, y, groups=groups)
    print(f"Migliori parametri (LOGO): {grid_search.best_params_}")

    best_xgb = grid_search.best_estimator_
    all_shap_values = []
    test_indices = []

    # ==========================================
    # 3. EXPLAINABLE AI CON TREE_EXPLAINER
    # ==========================================
    print("\nCalcolo dei valori SHAP per ogni utente (TreeExplainer)...")

    for train_idx, test_idx in logo.split(x_scaled, y, groups=groups):
        X_train, X_test = x_scaled[train_idx], x_scaled[test_idx]
        y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]

        raw_user_id = str(groups.iloc[test_idx].values[0])
        current_user = raw_user_id.replace('\\', '/').split('/')[-1]
        
        # Clone del miglior XGBoost
        model_fold = clone(best_xgb)
        model_fold.fit(X_train, y_train)
        
        # MAGIA DI XGBOOST: Usiamo TreeExplainer! 
        # È infinitamente più veloce e preciso del KernelExplainer e non ha bisogno del K-Means
        explainer = shap.TreeExplainer(model_fold)
        shap_vals = explainer.shap_values(X_test)
        
        all_shap_values.append(shap_vals)
        test_indices.extend(test_idx)

        # Generazione Plot SHAP per il Fold corrente
        plt.figure()
        shap.summary_plot(shap_vals, x_scaled_df.iloc[test_idx], show=False)
        plot_path = os.path.join(output_dir, f'shap_summary_user_{current_user}.png')
        plt.savefig(plot_path, bbox_inches='tight', dpi=300)
        plt.close() 

    os.makedirs('dataset', exist_ok=True)
    joblib.dump(all_shap_values, 'temp/shap_values_matrix.pkl')
    print("Analisi SHAP completata e salvata.")

    return best_xgb, scaler
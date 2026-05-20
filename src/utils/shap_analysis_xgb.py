import os
import shap
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

def shap_analysis_xgboost(best_xgb, x_test_s, feature_names, user_id, is_real):
    """
    Esegue l'analisi SHAP per il modello XGBoost in una frazione di secondo
    usando il TreeExplainer, e salva i grafici per il singolo utente.
    """
    # Creiamo la cartella dedicata a questo utente

    if is_real:
        save_dir = f'temp/shap_plots/xgboost/real/user_{user_id}'
    else:        
        save_dir = f'temp/shap_plots/xgboost/imm/user_{user_id}'

    os.makedirs(save_dir, exist_ok=True)

    # 1. Calcolo SHAP (Istantaneo grazie al TreeExplainer)
    explainer_xgb = shap.TreeExplainer(best_xgb)
    shap_vals_xgb = explainer_xgb.shap_values(x_test_s)

    # Gestione del formato di ritorno di SHAP in base alla versione
    if isinstance(shap_vals_xgb, list):
        shap_vals_xgb = shap_vals_xgb[1]

    # Media assoluta dei valori SHAP per capire l'importanza globale
    mean_abs_shap_xgb = np.abs(shap_vals_xgb).mean(axis=0)

    # 2. Creazione del DataFrame SHAP
    shap_df_xgb = pd.DataFrame({
        'Feature_Name': feature_names,
        'SHAP_Value': mean_abs_shap_xgb
    })

    # Dividiamo il nome della feature nei suoi 3 componenti
    try:
        shap_df_xgb[['Channel', 'FeatureType', 'Window']] = shap_df_xgb['Feature_Name'].str.split('_', expand=True)
    except ValueError:
        print(f"[SHAP WARNING] Alcune feature per {user_id} non seguono il formato 'Canale_Tipo_Finestra'.")

    # 3. Raggruppamenti statistici
    channel_imp = shap_df_xgb.groupby('Channel')['SHAP_Value'].sum().sort_values(ascending=False)
    feature_imp = shap_df_xgb.groupby('FeatureType')['SHAP_Value'].sum().sort_values(ascending=False)
    window_imp = shap_df_xgb.groupby('Window')['SHAP_Value'].sum().sort_values(ascending=False)

    # --- PLOT 1: CANALI ---
    plt.figure(figsize=(10, 6))
    sns.barplot(x=channel_imp.values, y=channel_imp.index, hue=channel_imp.index, palette="viridis", legend=False)
    plt.title(f"Channel Importance - XGBoost (User: {user_id})", fontsize=14)
    plt.xlabel("Mean Absolute SHAP Value")
    plt.ylabel("EEG Channel")
    plt.tight_layout()
    plt.savefig(f'{save_dir}/shap_1_channels.png', dpi=300)
    plt.close()

    # --- PLOT 2: FEATURES ---
    plt.figure(figsize=(12, 8))
    sns.barplot(x=feature_imp.values, y=feature_imp.index, hue=feature_imp.index, palette="mako", legend=False)
    plt.title(f"Feature Importance - XGBoost (User: {user_id})", fontsize=14)
    plt.xlabel("Mean Absolute SHAP Value")
    plt.ylabel("Feature Type")
    plt.tight_layout()
    plt.savefig(f'{save_dir}/shap_2_features.png', dpi=300)
    plt.close()

    # --- PLOT 3: FINESTRE TEMPORALI ---
    plt.figure(figsize=(8, 4))
    sns.barplot(x=window_imp.values, y=window_imp.index, hue=window_imp.index, palette="rocket", legend=False)
    plt.title(f"Temporal Window Importance - XGBoost (User: {user_id})", fontsize=14)
    plt.xlabel("Mean Absolute SHAP Value")
    plt.ylabel("Temporal Window")
    plt.tight_layout()
    plt.savefig(f'{save_dir}/shap_3_windows.png', dpi=300)
    plt.close()
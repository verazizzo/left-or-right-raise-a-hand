import shap
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import pandas as pd
import os

def shap_analysis_svm(best_svm, x_test_scaled_svm, x_train_scaled_svm, feature_names, user_id, is_real):
    np.random.seed(42)

    if is_real:
        save_dir = f'temp/shap_plots/svm/real/user_{user_id}'
    else:        
        save_dir = f'temp/shap_plots/svm/imm/user_{user_id}'

    os.makedirs(save_dir, exist_ok=True)

    background_svm = shap.kmeans(x_train_scaled_svm, 10)

    explainer_svm = shap.KernelExplainer(best_svm.predict, background_svm)

    shap_vals_svm = explainer_svm.shap_values(x_test_scaled_svm, silent=True)

    if isinstance(shap_vals_svm, list):
        shap_vals_svm = shap_vals_svm[1]

    # Calculate mean absolute SHAP values for each feature across all test samples
    mean_abs_shap_svm = np.abs(shap_vals_svm).mean(axis=0)

    shap_df_svm = pd.DataFrame({
        'Feature_Name': feature_names,
        'SHAP_Value': mean_abs_shap_svm
    })

    try:
        shap_df_svm[['Channel', 'FeatureType', 'Window']] = shap_df_svm['Feature_Name'].str.split('_', expand=True)
    except ValueError:
        print("\nWARNING: Some features do not follow the 'Channel_Feature_Window' format.")

    # Gropuing by categories to get overall importance
    channel_imp_svm = shap_df_svm.groupby('Channel')['SHAP_Value'].sum().sort_values(ascending=False)
    feature_imp_svm = shap_df_svm.groupby('FeatureType')['SHAP_Value'].sum().sort_values(ascending=False)
    window_imp_svm = shap_df_svm.groupby('Window')['SHAP_Value'].sum().sort_values(ascending=False)

    # Plot 1: Channel Importance (SVM)
    plt.figure(figsize=(10, 6))
    sns.barplot(x=channel_imp_svm.values, y=channel_imp_svm.index, hue=channel_imp_svm.index, palette="viridis", legend=False)
    plt.title(f"Channel Importance - SVM (User: {user_id})", fontsize=14)
    plt.xlabel("Mean Absolute SHAP Value (Predictive Impact)")
    plt.ylabel("EEG Channel")
    plt.tight_layout()
    plt.savefig(f'{save_dir}/shap_1_channels.png', dpi=300)
    plt.close()

    # Plot 2: Feature Importance (SVM)
    plt.figure(figsize=(12, 8))
    sns.barplot(x=feature_imp_svm.values, y=feature_imp_svm.index, hue=feature_imp_svm.index, palette="mako", legend=False)
    plt.title(f"Shap analysis - Feature Importance (SVM) (User: {user_id})", fontsize=14)
    plt.xlabel("Mean Absolute SHAP Value (Predictive Impact)")
    plt.ylabel("Feature Type")
    plt.tight_layout()
    plt.savefig(f'{save_dir}/shap_2_features.png', dpi=300)
    plt.close()

    # Plot 3: Temporal Window Importance (SVM)
    plt.figure(figsize=(8, 4))
    sns.barplot(x=window_imp_svm.values, y=window_imp_svm.index, hue=window_imp_svm.index, palette="rocket", legend=False)
    plt.title(f"Shap analysis - Temporal Window Importance (SVM) (User: {user_id})", fontsize=14)
    plt.xlabel("Mean Absolute SHAP Value (Predictive Impact)")
    plt.ylabel("Temporal Window")
    plt.tight_layout()
    plt.savefig(f'{save_dir}/shap_3_windows.png', dpi=300)
    plt.close()

    print("Shap analysis for SVM completed! Plots saved in 'temp/shap_plots/svm' directory.")


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
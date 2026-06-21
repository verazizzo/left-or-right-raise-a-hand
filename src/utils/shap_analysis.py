import json
import mne
import shap
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import pandas as pd
import os



def genera_topoplot_statico_mne(mean_directional_shap, feature_names, save_dir, user_id, task_name=""):
    """ Disegna e salva fisicamente la foto PNG del topoplot scientifico bicolore (RdBu_r) """
    emotiv_channels = ['AF3', 'F7', 'F3', 'FC5', 'T7', 'P7', 'O1', 'O2', 'P8', 'T8', 'FC6', 'F4', 'F8', 'AF4']
    channel_importance = {ch: 0.0 for ch in emotiv_channels}
    
    # Aggreghiamo i valori SHAP direzionali per ciascuno dei 14 canali Emotiv
    for feat_name, peso in zip(feature_names, mean_directional_shap):
        for ch in emotiv_channels:
            if feat_name.startswith(ch + '_'):
                channel_importance[ch] += peso
                break
                
    data_to_plot = np.array([channel_importance[ch] for ch in emotiv_channels])
    
    # Configurazione del montaggio standard 10-20 di MNE Python
    info = mne.create_info(ch_names=emotiv_channels, sfreq=128, ch_types='eeg')
    montage = mne.channels.make_standard_montage('standard_1020')
    info.set_montage(montage)
    
    fig, ax = plt.subplots(figsize=(7, 7))
    limite = np.max(np.abs(data_to_plot))
    if limite == 0: limite = 1 
    
    # Generazione della mappa topografica 2D bicolore (Pura con i segni originali)
    im, _ = mne.viz.plot_topomap(
        data_to_plot, info, axes=ax, show=False, cmap='RdBu_r',          
        vlim=(-limite, limite), contours=0, extrapolate='head', names=emotiv_channels
    )
    
    titolo = f"Mappa SHAP - Utente: {user_id}"
    if task_name:
        titolo += f" | Task: {task_name}"
    plt.title(titolo, fontsize=14)
    
    # Barra laterale dei colori
    from mpl_toolkits.axes_grid1 import make_axes_locatable
    divider = make_axes_locatable(ax)
    cax = divider.append_axes("right", size="5%", pad=0.2)
    plt.colorbar(im, cax=cax, label="Spinta verso Sinistra (Blu) <-- SHAP --> Spinta verso Destra (Rosso)")
    
    plot_path = f"{save_dir}/topoplot_{user_id}_{task_name}.png"
    plt.savefig(plot_path, bbox_inches='tight', dpi=300)
    plt.close(fig)
    print(f"[FOTO OK] Topoplot statico MNE ({task_name}) salvato in: {plot_path}")


def esporta_json_dashboard(shap_df, save_dir, user_id, is_real):
    """ Salva la struttura JSON formattata per popolare i grafici React della Dashboard """
    channel_imp_left = shap_df.groupby('Channel')['SHAP_Dir_Left'].sum()
    channel_imp_right = shap_df.groupby('Channel')['SHAP_Dir_Right'].sum()
    feature_imp_abs = shap_df.groupby('FeatureType')['SHAP_Value_Abs'].sum()
    window_imp_abs = shap_df.groupby('Window')['SHAP_Value_Abs'].sum()

    struttura_json = {
        "user_id": str(user_id),
        "is_real_session": bool(is_real),
        "channels": [
            {
                "id": ch,
                "shap_left": float(channel_imp_left.get(ch, 0.0)),
                "shap_right": float(channel_imp_right.get(ch, 0.0)),
            } for ch in channel_imp_left.index if ch != "Session"
        ],
        "features": [
            {
                "id": f_type,
                "shap_absolute": float(feature_imp_abs.get(f_type, 0)),
            } for f_type in feature_imp_abs.index
        ],
        "windows": [
            {
                "id": win,
                "shap_absolute": float(window_imp_abs.get(win, 0)),
            } for win in window_imp_abs.index
        ]
    }

    json_path = f'{save_dir}/{user_id}.json'
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(struttura_json, f, indent=4, ensure_ascii=False)
    print(f"[JSON OK] Dati per la Dashboard React salvati in: {json_path}")

def shap_analysis_svm(best_svm, x_test_scaled_svm, x_train_scaled_svm, y_test, feature_names, user_id, is_real):
    np.random.seed(42)

    if is_real:
        save_dir = f'temp/shap_plots/svm/real/{user_id}'
    else:        
        save_dir = f'temp/shap_plots/svm/imm/{user_id}'

    os.makedirs(save_dir, exist_ok=True)

    background_svm = shap.kmeans(x_train_scaled_svm, 10)
    explainer_svm = shap.KernelExplainer(best_svm.predict, background_svm)
    shap_vals_svm = explainer_svm.shap_values(x_test_scaled_svm, silent=True)

    if isinstance(shap_vals_svm, list):
        shap_vals_svm = shap_vals_svm[1]

    # Calculate mean absolute SHAP values for each feature across all test samples (Features and Windows)
    mean_abs_shap_svm = np.abs(shap_vals_svm).mean(axis=0)
    # mean_directional_shap_svm = shap_vals_svm.mean(axis=0)

    # Separazione per epoche
    idx_left = (y_test == 0)
    idx_right = (y_test == 1)

    shap_vals_left = shap_vals_svm[idx_left]
    shap_vals_right = shap_vals_svm[idx_right]

    # 1. Medie direzionali pure per i Topoplot (con il segno)
    mean_dir_left = shap_vals_left.mean(axis=0) if len(shap_vals_left) > 0 else np.zeros(len(feature_names))
    mean_dir_right = shap_vals_right.mean(axis=0) if len(shap_vals_right) > 0 else np.zeros(len(feature_names))
    
    # 2. Medie assolute per classe per i grafici a barre sdoppiati dei canali
    mean_abs_left = np.abs(shap_vals_left).mean(axis=0) if len(shap_vals_left) > 0 else np.zeros(len(feature_names))
    mean_abs_right = np.abs(shap_vals_right).mean(axis=0) if len(shap_vals_right) > 0 else np.zeros(len(feature_names))

    # Generazione dei due Topoplot bicolore separati
    if len(shap_vals_left) > 0:
        genera_topoplot_statico_mne(mean_dir_left, feature_names, save_dir, user_id, "Left")
    if len(shap_vals_right) > 0:
        genera_topoplot_statico_mne(mean_dir_right, feature_names, save_dir, user_id, "Right")

    shap_df_svm = pd.DataFrame({
        'Feature_Name': feature_names,
        'SHAP_Value_Abs': mean_abs_shap_svm,   # Per Seaborn (Grafici a barre globali)
        'SHAP_Abs_Left': mean_abs_left,        # Per il grafico a barre Left
        'SHAP_Abs_Right': mean_abs_right,      # Per il grafico a barre Right
        'SHAP_Dir_Left': mean_dir_left,        # Per il JSON e Topoplot Globale
        'SHAP_Dir_Right': mean_dir_right       # Per il JSON e Topoplot Globale
    })

    try:
        shap_df_svm[['Channel', 'FeatureType', 'Window']] = shap_df_svm['Feature_Name'].str.split('_', expand=True)
    except ValueError:
        print("\nWARNING: Some features do not follow the 'Channel_Feature_Window' format.")

    # 1. Esporta il JSON per Next.js
    esporta_json_dashboard(shap_df_svm, save_dir, user_id, is_real)

    # 2. STAMPA LA FOTO DEL TOPOPLOT CON MNE PYTHON (Aggiunta inserita)
    # genera_topoplot_statico_mne(mean_directional_shap_svm, feature_names, save_dir, user_id)

    # Gropuing by categories to get overall importance
    # Raggruppiamo la colonna DIREZIONALE (la stessa del JSON e Topoplot) 
    # e applichiamo .abs() solo alla fine per avere la lunghezza della barra
    channel_imp_left = shap_df_svm.groupby('Channel')['SHAP_Dir_Left'].sum().abs().sort_values(ascending=False)
    channel_imp_right = shap_df_svm.groupby('Channel')['SHAP_Dir_Right'].sum().abs().sort_values(ascending=False)
    
    feature_imp_svm = shap_df_svm.groupby('FeatureType')['SHAP_Value_Abs'].sum().sort_values(ascending=False)
    window_imp_svm = shap_df_svm.groupby('Window')['SHAP_Value_Abs'].sum().sort_values(ascending=False)

    # Plot 1L: Canali Left (Sfumature di blu per coerenza visiva)
    plt.figure(figsize=(10, 6))
    sns.barplot(x=channel_imp_left.values, y=channel_imp_left.index, hue=channel_imp_left.index, palette="Blues_r", legend=False)
    plt.title(f"Channel Importance LEFT - SVM (User: {user_id})", fontsize=14)
    plt.xlabel("Mean Absolute SHAP Value (Left Class)")
    plt.ylabel("EEG Channel")
    plt.tight_layout()
    plt.savefig(f'{save_dir}/channels_left_{user_id}.png', dpi=300)
    plt.close()

    # Plot 1R: Canali Right (Sfumature di rosso per coerenza visiva)
    plt.figure(figsize=(10, 6))
    sns.barplot(x=channel_imp_right.values, y=channel_imp_right.index, hue=channel_imp_right.index, palette="Reds_r", legend=False)
    plt.title(f"Channel Importance RIGHT - SVM (User: {user_id})", fontsize=14)
    plt.xlabel("Mean Absolute SHAP Value (Right Class)")
    plt.ylabel("EEG Channel")
    plt.tight_layout()
    plt.savefig(f'{save_dir}/channels_right_{user_id}.png', dpi=300)
    plt.close()

    # Plot 2: Feature Importance (SVM)
    plt.figure(figsize=(12, 8))
    sns.barplot(x=feature_imp_svm.values, y=feature_imp_svm.index, hue=feature_imp_svm.index, palette="mako", legend=False)
    plt.title(f"Shap analysis - Feature Importance (SVM) (User: {user_id})", fontsize=14)
    plt.xlabel("Mean Absolute SHAP Value (Predictive Impact)")
    plt.ylabel("Feature Type")
    plt.tight_layout()
    plt.savefig(f'{save_dir}/features_{user_id}.png', dpi=300)
    plt.close()

    # Plot 3: Temporal Window Importance (SVM)
    plt.figure(figsize=(8, 4))
    sns.barplot(x=window_imp_svm.values, y=window_imp_svm.index, hue=window_imp_svm.index, palette="rocket", legend=False)
    plt.title(f"Shap analysis - Temporal Window Importance (SVM) (User: {user_id})", fontsize=14)
    plt.xlabel("Mean Absolute SHAP Value (Predictive Impact)")
    plt.ylabel("Temporal Window")
    plt.tight_layout()
    plt.savefig(f'{save_dir}/windows_{user_id}.png', dpi=300)
    plt.close()

    print("Shap analysis for SVM completed! Plots saved in 'temp/shap_plots/svm' directory.")

    return shap_df_svm


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
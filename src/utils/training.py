import os
import pandas as pd
import shap
import joblib
import matplotlib.pyplot as plt

from sklearn.model_selection import LeaveOneGroupOut, GridSearchCV
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.base import clone

def training(df):
    x = df.drop(columns=['Target_Label', 'User'])
    y = df['Target_Label']
    groups = df['User']
    
    scaler = StandardScaler()
    x_scaled = scaler.fit_transform(x)
    x_scaled_df = pd.DataFrame(x_scaled, columns=x.columns) # only useful for SHAP plots

    output_dir = 'temp/shap_plots'
    os.makedirs(output_dir, exist_ok=True)

    logo = LeaveOneGroupOut()
    svm = SVC(probability=True)
    param_grid = {
        'kernel': ['linear', 'rbf'],
        'C': [0.1, 1, 10]
    }

    grid_search = GridSearchCV(
        estimator=svm, 
        param_grid=param_grid, 
        cv=logo, 
        scoring='accuracy',
        n_jobs=-1 
    )

    grid_search.fit(x_scaled, y, groups=groups)
    print(f"Best parameters (LOGO): {grid_search.best_params_}")

    best_svm = grid_search.best_estimator_
    all_shap_values = []
    test_indices = []

    print("\nCalculating SHAP values for each user:")

    for train_idx, test_idx in logo.split(x_scaled, y, groups=groups):
        X_train, X_test = x_scaled[train_idx], x_scaled[test_idx]
        y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]

        raw_user_id = str(groups.iloc[test_idx].values[0])
        current_user = raw_user_id.replace('\\', '/').split('/')[-1]
        
        # Uso un clone per non sovrascrivere l'estimatore globale ottimizzato
        model_fold = clone(best_svm)
        model_fold.fit(X_train, y_train)
        
        X_train_summary = shap.kmeans(X_train, 10) 
        explainer = shap.KernelExplainer(model_fold.predict, X_train_summary)
        
        shap_vals = explainer.shap_values(X_test)
        all_shap_values.append(shap_vals)
        test_indices.extend(test_idx)

        # 3. Generazione e salvataggio del plot SHAP isolato per il Fold corrente
        plt.figure()
        
        shap.summary_plot(shap_vals, x_scaled_df.iloc[test_idx], show=False)
        
        # Definizione del path di salvataggio. Usiamo bbox_inches='tight' per 
        # evitare il troncamento delle etichette delle feature sull'asse Y
        plot_path = os.path.join(output_dir, f'shap_summary_user_{current_user}.png')
        plt.savefig(plot_path, bbox_inches='tight', dpi=300)
        
        # Deallocazione della figura corrente per prevenire memory leak nel ciclo for
        plt.close() 
        

    os.makedirs('temp', exist_ok=True)
    joblib.dump(all_shap_values, 'temp/shap_values_matrix.pkl')
    print(" SHAP analysis completed and saved to 'temp/shap_values_matrix.pkl'.")

    return best_svm, scaler

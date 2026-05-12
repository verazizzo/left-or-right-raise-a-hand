import os
import pandas as pd
import shap
import joblib
import matplotlib.pyplot as plt

from sklearn.model_selection import LeaveOneGroupOut, GridSearchCV
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.base import clone
from xgboost import XGBClassifier


def train_SVM(df):
    x = df.drop(columns=['Target_Label', 'User'])
    y = df['Target_Label']
    groups = df['User']
    
    scaler = StandardScaler()
    x_scaled = scaler.fit_transform(x)
    x_scaled_df = pd.DataFrame(x_scaled, columns=x.columns) # only useful for SHAP plots

    output_dir = 'temp/shap_plots/svm'
    os.makedirs(output_dir, exist_ok=True)

    logo = LeaveOneGroupOut()
    svm = SVC(probability=True, random_state=42)
    param_grid = {
        'kernel': ['linear', 'rbf'],
        'C': [0.001, 0.01, 0.1]
    }

    grid_search = GridSearchCV(
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

    return best_xgb, scaler
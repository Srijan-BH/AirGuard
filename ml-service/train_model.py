import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor

from preprocessing import preprocess_data
from feature_analysis import generate_correlation_heatmap, calculate_feature_importance
from model_evaluation import evaluate_model, generate_performance_table

def create_dummy_data():
    """Generates dummy data if the real dataset is not found."""
    import numpy as np
    np.random.seed(42)
    n_samples = 2000
    
    dummy_data = {
        'PM2.5': np.random.uniform(0, 300, n_samples),
        'PM10': np.random.uniform(0, 400, n_samples),
        'NO2': np.random.uniform(0, 100, n_samples),
        'SO2': np.random.uniform(0, 100, n_samples),
        'CO': np.random.uniform(0, 50, n_samples),
        'O3': np.random.uniform(0, 100, n_samples),
        'Temperature': np.random.uniform(-10, 40, n_samples),
        'Humidity': np.random.uniform(20, 100, n_samples),
        'Wind Speed': np.random.uniform(0, 20, n_samples)
    }
    
    df = pd.DataFrame(dummy_data)
    # Target AQI simulation (linear combination with noise + non-linear effects)
    df['AQI'] = (df['PM2.5'] * 0.5 + df['PM10'] * 0.3 + 
                 df['NO2'] * 0.1 + np.random.normal(0, 10, n_samples))
    return df

# ── Column name normaliser ──────────────────────────────────────────
# Handles datasets where columns have units embedded, e.g. "PM2.5 (µg/m³)"
COLUMN_RENAME_MAP = {
    'PM2.5 (µg/m³)': 'PM2.5',
    'PM10 (µg/m³)':  'PM10',
    'NO2 (ppb)':     'NO2',
    'SO2 (ppb)':     'SO2',
    'CO (ppm)':      'CO',
    'O3 (ppb)':      'O3',
    'Temperature (°C)': 'Temperature',
    'Humidity (%)':  'Humidity',
    'Wind Speed (m/s)': 'Wind Speed',
    # Alternate encodings sometimes present in CSV exports
    'PM2.5 (\ufffdg/m\ufffd)': 'PM2.5',
    'PM10 (\ufffdg/m\ufffd)':  'PM10',
    'Temperature (\ufffdC)':   'Temperature',
}

def main():
    data_path = 'data/air_quality_dataset.csv'
    
    print("Starting ML Pipeline...")
    
    # 1 & 2 & 3 & 4. Data Cleaning, Missing Values, Outliers, Feature Engineering
    if os.path.exists(data_path):
        df = preprocess_data(data_path)
        # Normalise column names so units don't break feature selection
        df.rename(columns=COLUMN_RENAME_MAP, inplace=True)
        print(f"Dataset loaded. Columns found: {list(df.columns)}")
    else:
        print(f"Dataset not found at {data_path}. Generating dummy data...")
        df = create_dummy_data()
    
    features = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3', 'Temperature', 'Humidity', 'Wind Speed']
    target = 'AQI'
    
    X = df[features]
    y = df[target]

    # 5. Correlation Heatmap & 6. Feature Importance
    print("Generating Feature Analysis...")
    generate_correlation_heatmap(df)
    calculate_feature_importance(X, y)
    
    # 7. Train/Test Split
    print("Splitting dataset into train and test sets...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Initialize Models to Compare
    models = {
        'Linear Regression': LinearRegression(),
        'Decision Tree Regressor': DecisionTreeRegressor(random_state=42),
        'Random Forest Regressor': RandomForestRegressor(n_estimators=100, random_state=42),
        'XGBoost Regressor': XGBRegressor(n_estimators=100, random_state=42)
    }
    
    # Train and Evaluate
    results = []
    trained_models = {}
    
    for name, model in models.items():
        print(f"Training {name}...")
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        
        metrics = evaluate_model(y_test, y_pred, name)
        results.append(metrics)
        trained_models[name] = model
        
    # Generate Performance Comparison Table
    df_results = generate_performance_table(results)
    
    # Select Best Model Automatically (Highest R2 Score)
    best_model_name = df_results.iloc[0]['Model']
    best_model = trained_models[best_model_name]
    
    print(f"\nBest Model Selected Automatically: {best_model_name}")
    print(f"Metrics -> R2 Score: {df_results.iloc[0]['R2 Score']:.4f}, RMSE: {df_results.iloc[0]['RMSE']:.4f}")
    
    # Save the best model
    model_filename = 'aqi_model.pkl'
    joblib.dump(best_model, model_filename)
    print(f"Best model saved successfully as {model_filename}")

if __name__ == "__main__":
    main()

import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestRegressor

def generate_correlation_heatmap(df, output_path='correlation_heatmap.png'):
    """Generate and save a correlation heatmap."""
    features = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3', 'Temperature', 'Humidity', 'Wind Speed', 'AQI']
    
    # Keep only available features
    available_features = [f for f in features if f in df.columns]
    corr = df[available_features].corr()
    
    plt.figure(figsize=(12, 8))
    sns.heatmap(corr, annot=True, cmap='coolwarm', fmt=".2f", vmin=-1, vmax=1)
    plt.title("Correlation Heatmap: Air Quality Features")
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()
    print(f"Correlation heatmap saved to {output_path}")

def calculate_feature_importance(X, y, output_path='feature_importance.png'):
    """Calculate and plot feature importance using Random Forest."""
    rf = RandomForestRegressor(n_estimators=100, random_state=42)
    rf.fit(X, y)
    
    importance = pd.DataFrame({
        'Feature': X.columns,
        'Importance': rf.feature_importances_
    }).sort_values(by='Importance', ascending=False)
    
    plt.figure(figsize=(10, 6))
    sns.barplot(x='Importance', y='Feature', data=importance)
    plt.title("Feature Importance for AQI Prediction")
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()
    
    print(f"Feature importance plot saved to {output_path}")
    return importance

import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error
import joblib
import os

print("Loading dataset...")
df = pd.read_csv(r"C:\Users\Srija\Desktop\air_quality_dataset.csv.csv")

print(f"Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")
print("Columns:", df.columns.tolist())

# Drop non-numeric columns (Date, City, Country)
features = ['PM2.5 (µg/m³)', 'PM10 (µg/m³)', 'NO2 (ppb)', 'SO2 (ppb)',
            'CO (ppm)', 'O3 (ppb)', 'Temperature (°C)', 'Humidity (%)', 'Wind Speed (m/s)']
target = 'AQI'

# Drop rows with missing values
df = df.dropna(subset=features + [target])
print(f"After dropping nulls: {df.shape[0]} rows")

X = df[features]
y = df[target]

# 80/20 train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
print(f"Training samples: {len(X_train)}, Testing samples: {len(X_test)}")

# Train Random Forest Regressor
print("Training Random Forest Regressor...")
model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
r2 = r2_score(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)
print(f"\nModel Performance:")
print(f"  R² Score  : {r2:.4f}  ({round(r2*100, 2)}% accuracy)")
print(f"  Mean Absolute Error: {mae:.2f} AQI points")

# Feature importance
print("\nFeature Importance:")
for feat, imp in sorted(zip(features, model.feature_importances_), key=lambda x: -x[1]):
    print(f"  {feat}: {round(imp*100, 2)}%")

# Save the trained model
model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
joblib.dump(model, model_path)
print(f"\nModel saved to: {model_path}")
print("Training complete!")

import pandas as pd
import numpy as np

def load_data(filepath):
    """Load the dataset."""
    return pd.read_csv(filepath)

def handle_missing_values(df):
    """Fill missing values with median for numerical columns."""
    df_clean = df.copy()
    features = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3', 'Temperature', 'Humidity', 'Wind Speed']
    for col in features:
        if col in df_clean.columns:
            df_clean[col] = df_clean[col].fillna(df_clean[col].median())
    
    if 'AQI' in df_clean.columns:
        df_clean['AQI'] = df_clean['AQI'].fillna(df_clean['AQI'].median())
        
    return df_clean

def handle_outliers(df, columns):
    """Cap outliers using the Interquartile Range (IQR) method."""
    df_out = df.copy()
    for col in columns:
        if col in df_out.columns:
            Q1 = df_out[col].quantile(0.25)
            Q3 = df_out[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            # Cap values
            df_out[col] = np.where(df_out[col] < lower_bound, lower_bound, df_out[col])
            df_out[col] = np.where(df_out[col] > upper_bound, upper_bound, df_out[col])
    return df_out

def preprocess_data(filepath):
    """Execute the full preprocessing pipeline."""
    df = load_data(filepath)
    df = handle_missing_values(df)
    
    features = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3', 'Temperature', 'Humidity', 'Wind Speed']
    df = handle_outliers(df, features)
    
    # Feature Engineering Example: Add Air Quality Severity categorical feature (optional)
    if 'AQI' in df.columns:
        df['AQI_Severity'] = pd.cut(df['AQI'], bins=[0, 50, 100, 150, 200, 300, 500], 
                                    labels=['Good', 'Moderate', 'Unhealthy for Sensitive', 'Unhealthy', 'Very Unhealthy', 'Hazardous'])
    
    return df

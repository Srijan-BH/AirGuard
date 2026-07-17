from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import numpy as np
import pandas as pd

def evaluate_model(y_true, y_pred, model_name):
    """Calculate MAE, MSE, RMSE, and R2 Score."""
    mae = mean_absolute_error(y_true, y_pred)
    mse = mean_squared_error(y_true, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_true, y_pred)
    
    return {
        'Model': model_name,
        'MAE': mae,
        'MSE': mse,
        'RMSE': rmse,
        'R2 Score': r2
    }

def generate_performance_table(results, output_csv='model_performance_comparison.csv'):
    """Generate and print a comparison table for model performances."""
    df_results = pd.DataFrame(results)
    # Sort by R2 score in descending order
    df_results = df_results.sort_values(by='R2 Score', ascending=False).reset_index(drop=True)
    
    print("\n--- Model Performance Comparison ---")
    print(df_results.to_markdown(index=False))
    print("------------------------------------\n")
    
    # Save table to CSV
    df_results.to_csv(output_csv, index=False)
    print(f"Performance comparison table saved to {output_csv}")
    
    return df_results

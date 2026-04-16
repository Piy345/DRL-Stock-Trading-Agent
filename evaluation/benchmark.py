import pandas as pd
import os
import sys

# Add parent directory to path to import environments
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from evaluation.evaluate import calculate_all_metrics

def run_benchmark(test_df, initial_balance=10000.0):
    """
    Buy and Hold strategy: buy at start of test period, hold to end. 
    NO commission. Use as benchmark for all 4 metrics.
    """
    if len(test_df) == 0:
        return {}
        
    portfolio_values = []
    
    # Buy at the very first step
    initial_price = test_df.iloc[0]['Close_Raw']
    shares = initial_balance / initial_price
    
    # Hold until the end
    for i in range(len(test_df)):
        current_price = test_df.iloc[i]['Close_Raw']
        portfolio_value = shares * current_price
        portfolio_values.append(portfolio_value)
        
    metrics = calculate_all_metrics(portfolio_values)
    
    return {
        "portfolio_values": portfolio_values,
        "metrics": metrics
    }

if __name__ == "__main__":
    # Test the benchmark
    base_dir = os.path.dirname(os.path.dirname(__file__))
    data_path = os.path.join(base_dir, "data", "AAPL_features_test.csv")
    
    if os.path.exists(data_path):
        test_df = pd.read_csv(data_path)
        result = run_benchmark(test_df)
        print("Benchmark (Buy & Hold) Metrics on Test Set:")
        for k, v in result['metrics'].items():
            print(f"{k}: {v:.4f}")
    else:
        print("Test data not found. Please run feature_engineering.py first.")

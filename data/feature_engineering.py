import pandas as pd
import pandas_ta as ta
from sklearn.preprocessing import MinMaxScaler
import os

def engineer_features():
    """
    Processes raw AAPL data to generate RSI, MACD and normalizes features.
    """
    print("Engineering features...")
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    input_file = os.path.join(base_dir, "AAPL_raw.csv")
    
    if not os.path.exists(input_file):
        raise FileNotFoundError(f"Raw data file {input_file} not found. Please run download_data.py first.")
    
    df = pd.read_csv(input_file)
    
    # Ensure 'Date' is datetime
    df['Date'] = pd.to_datetime(df['Date'])
    
    # Sort by date
    df.sort_values('Date', inplace=True)
    df.reset_index(drop=True, inplace=True)
    
    # Ensure correct column names from yfinance ('Open', 'High', 'Low', 'Close', 'Volume')
    # Sometimes it's lowercase depending on yfinance versions, so we map them if needed
    col_mapping = {col: col.capitalize() for col in df.columns if col.lower() in ['open', 'high', 'low', 'close', 'volume']}
    df.rename(columns=col_mapping, inplace=True)
    
    # Calculate RSI (14-period)
    df['RSI'] = df.ta.rsi(close='Close', length=14)
    
    # Calculate MACD (12, 26, 9)
    macd = df.ta.macd(close='Close', fast=12, slow=26, signal=9)
    df['MACD'] = macd['MACD_12_26_9']
    df['MACD_Hist'] = macd['MACDh_12_26_9']
    df['MACD_Signal'] = macd['MACDs_12_26_9']
    
    # Drop NaNs that appeared due to rolling window calculations
    df.dropna(inplace=True)
    df.reset_index(drop=True, inplace=True)
    
    # Observation vector (9 features)
    features = ['Open', 'High', 'Low', 'Close', 'Volume', 'RSI', 'MACD', 'MACD_Signal', 'MACD_Hist']
    
    # Keep raw close for portfolio calculations
    df['Close_Raw'] = df['Close']
    
    # Split train and test
    # 80% train (2012-2021), 20% test (2021-2023)
    # We'll use Dec 31, 2020 as the cutoff for train/test as requested
    train_df = df[df['Date'] < '2021-01-01'].copy()
    test_df = df[df['Date'] >= '2021-01-01'].copy()
    
    print(f"Train size: {len(train_df)} | Test size: {len(test_df)}")
    
    # Normalize ALL features to [0, 1] using MinMaxScaler
    # Fit the scaler on the train set only to prevent data leakage!
    scaler = MinMaxScaler()
    
    # Apply to train
    train_df[features] = scaler.fit_transform(train_df[features])
    
    # Apply to test
    test_df[features] = scaler.transform(test_df[features])
    
    # Save to CSV
    train_output = os.path.join(base_dir, "AAPL_features_train.csv")
    test_output = os.path.join(base_dir, "AAPL_features_test.csv")
    
    # We keep the Date and Close_Raw column so we can calculate real portfolio values, 
    # but the observation space for RL will only use the 9 normalized features
    train_df[['Date', 'Close_Raw'] + features].to_csv(train_output, index=False)
    test_df[['Date', 'Close_Raw'] + features].to_csv(test_output, index=False)
    
    print("Feature engineering complete. Saved to:")
    print(f"  - {train_output}")
    print(f"  - {test_output}")

if __name__ == "__main__":
    engineer_features()

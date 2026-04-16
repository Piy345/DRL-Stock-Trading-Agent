import yfinance as yf
import pandas as pd
import os

def download_aapl_data():
    """
    Downloads AAPL stock data from Yahoo Finance.
    Date: 2012-01-01 to 2023-12-31, interval: 1d
    """
    print("Downloading AAPL stock data from Yahoo Finance...")
    
    # Define parameters
    ticker = "AAPL"
    start_date = "2012-01-01"
    end_date = "2023-12-31"
    interval = "1d"
    
    # Download data
    data = yf.download(ticker, start=start_date, end=end_date, interval=interval)
    
    if data.empty:
        raise ValueError("No data downloaded. Please check your internet connection or the yfinance API.")
    
    # Make sure we have a directory to save to
    os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)
    
    # yfinance sometimes uses MultiIndex for columns, we flatten it if needed
    if isinstance(data.columns, pd.MultiIndex):
        data.columns = [col[0] for col in data.columns]
        
    # Reset index to have 'Date' as a column
    data.reset_index(inplace=True)
    
    # Save to CSV
    output_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "AAPL_raw.csv")
    data.to_csv(output_file, index=False)
    print(f"Data successfully saved to {output_file}")
    print(f"Total rows: {len(data)}")

if __name__ == "__main__":
    download_aapl_data()

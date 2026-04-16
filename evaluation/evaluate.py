import numpy as np
import scipy.stats as stats

def cumulative_return(portfolio_values):
    """
    (final - initial) / initial
    """
    if len(portfolio_values) < 2:
        return 0.0
    initial = portfolio_values[0]
    final = portfolio_values[-1]
    return (final - initial) / initial

def sharpe_ratio(returns):
    """
    mean(excess) / std(excess) * sqrt(252)
    Assuming risk-free rate is 0 for simplicity or implicit within excess.
    Paper: Sharpe = Average Return / Standard Deviation * sqrt(252)
    """
    if len(returns) < 2:
        return 0.0
    returns_arr = np.array(returns)
    std = np.std(returns_arr)
    if std == 0:
        return 0.0
    return (np.mean(returns_arr) / std) * np.sqrt(252)

def probabilistic_sharpe_ratio(returns, benchmark_sr=0.0):
    """
    Probabilistic Sharpe Ratio
    Paper definition references scipy stats norm.cdf
    Formula: cdf( (SR - SR*) / sqrt( (1 - skew*SR + kurtosis*SR^2/4) / (n - 1) ) )
    We will use a standard PSR calculation.
    """
    if len(returns) < 3:
        return 0.0
        
    sr = sharpe_ratio(returns) / np.sqrt(252) # daily SR
    benchmark_sr_daily = benchmark_sr / np.sqrt(252)
    
    n = len(returns)
    returns_arr = np.array(returns)
    skew = stats.skew(returns_arr)
    kurtosis = stats.kurtosis(returns_arr, fisher=True) # excess kurtosis
    
    std = np.std(returns_arr)
    if std == 0:
        return 0.0
        
    sr_var = (1 - skew * sr + (kurtosis / 4) * (sr ** 2)) / (n - 1)
    
    if sr_var <= 0:
        return 1.0 # Edge case, certainty
        
    z_score = (sr - benchmark_sr_daily) / np.sqrt(sr_var)
    psr = stats.norm.cdf(z_score)
    
    return psr

def max_drawdown(portfolio_values):
    """
    Largest peak-to-trough decline.
    """
    if len(portfolio_values) < 2:
        return 0.0
        
    peak = portfolio_values[0]
    max_dd = 0.0
    
    for value in portfolio_values:
        if value > peak:
            peak = value
        dd = (peak - value) / peak
        if dd > max_dd:
            max_dd = dd
            
    return max_dd

def calculate_all_metrics(portfolio_values):
    """
    Utility wrapper to calculate all 4 metrics.
    """
    # Calculate daily returns from portfolio values
    returns = []
    for i in range(1, len(portfolio_values)):
        ret = (portfolio_values[i] - portfolio_values[i-1]) / portfolio_values[i-1]
        returns.append(ret)
        
    cr = cumulative_return(portfolio_values)
    sr = sharpe_ratio(returns)
    psr = probabilistic_sharpe_ratio(returns)
    mdd = max_drawdown(portfolio_values)
    
    return {
        "Cumulative Return": cr,
        "Sharpe Ratio": sr,
        "Probabilistic Sharpe Ratio": psr,
        "Max Drawdown": mdd
    }

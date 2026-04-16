# GUIDELINES — DRL Stock Trading

## Implementation Guidelines for Antigravity Agent

These guidelines define HOW to build the project step by step.
The agent must follow these strictly and generate code in the exact order listed below.

---

## Project Folder Structure to Generate

```
RL_Project/
├── data/
│   ├── download_data.py          # yfinance AAPL/SPY data download
│   └── feature_engineering.py   # RSI, MACD calculation + normalization
│
├── environment/
│   ├── trading_env_rsi.py        # Custom Gym env with RSI reward
│   ├── trading_env_macd.py       # Custom Gym env with MACD reward
│   └── trading_env_ensemble.py   # Custom Gym env with MACDRSI ensemble
│
├── models/
│   ├── train_rsi.py              # Train A2C, PPO, DQN on RSI env
│   ├── train_macd.py             # Train A2C, PPO, DQN on MACD env
│   └── train_ensemble.py         # Train best model on ensemble env
│
├── evaluation/
│   ├── evaluate.py               # CR, Sharpe, PSR, MaxDD metrics
│   └── benchmark.py              # Buy and Hold comparison
│
├── hyperparameter/
│   └── grid_search.py            # Grid search for all algorithms
│
├── dashboard/
│   └── app.py                    # Streamlit dashboard UI
│
├── results/
│   ├── plots/                    # Training curves, action plots
│   └── metrics/                  # CSV output of all metrics
│
├── System_Instruction.md         # (this project's system instructions)
├── Guidelines.md                 # (this file)
├── Implementation.md             # (auto-generated implementation tracker)
└── requirements.txt              # All Python dependencies
```

---

## Step-by-Step Build Order

### STEP 1 — Environment Setup
Generate `requirements.txt` with exact versions:
```
stable-baselines3==2.2.1
gymnasium==0.29.1
yfinance==0.2.36
pandas==2.1.4
numpy==1.26.2
pandas-ta==0.3.14b
scikit-learn==1.3.2
matplotlib==3.8.2
streamlit==1.30.0
plotly==5.18.0
scipy==1.11.4
```

---

### STEP 2 — Data Pipeline (`data/`)

**`download_data.py`**
- Download AAPL ticker using yfinance
- Date range: 2012-01-01 to 2023-12-31
- Interval: 1d (daily)
- Save as CSV: `data/AAPL_raw.csv`
- Also download SPY for correlation check

**`feature_engineering.py`**
- Load raw CSV
- Calculate RSI (14-period) using pandas-ta
- Calculate MACD (12, 26, 9) using pandas-ta → MACD, MACD_Signal, MACD_Hist
- Normalize ALL features to [0, 1] using MinMaxScaler
- Observation vector: `[O, H, L, C, V, RSI, MACD, MACD_Signal, MACD_Hist]`
- Train/test split: 80% train (2012–2021), 20% test (2021–2023)
- Save: `data/AAPL_features_train.csv`, `data/AAPL_features_test.csv`

---

### STEP 3 — Custom Gym Environments (`environment/`)

**All environments must inherit from `gymnasium.Env`**

**Common structure for all envs:**
```python
class TradingEnv(gym.Env):
    def __init__(self, df, commission=0.01):
        # Action space: Discrete(3) → {0=BUY, 1=SELL, 2=HOLD}
        # Observation space: Box(9,) normalized [0,1]
        
    def step(self, action):
        # Apply reward function (RSI or MACD or Ensemble)
        # Apply 1% commission on BUY/SELL
        # Return: obs, reward, done, truncated, info
        
    def reset(self):
        # Reset to start of data
        # Return: obs, info
```

**`trading_env_rsi.py` — RSI Reward:**
```python
# Section IV-E-4 from paper
def _rsi_reward(self, action, obs):
    rsi_val = obs[5]  # normalized RSI feature
    bias_buy  = 0.1
    bias_sell = 0.9
    bias_hold = 0.5
    d = lambda val, target, bias: (1 - abs(val - target)) + bias
    if action == 0:   return d(rsi_val, 0.1, bias_buy)
    elif action == 1: return d(rsi_val, 0.9, bias_sell)
    else:             return d(rsi_val, 0.5, bias_hold)
```

**`trading_env_macd.py` — MACD Reward:**
```python
# Section IV-E-5 from paper
def _macd_reward(self, action, obs):
    macd_val  = obs[6]  # normalized MACD
    macd_hist = obs[8]  # normalized MACD histogram
    bias_buy  = 0.1
    d = lambda val, target, bias: (1 - abs(val - target)) + bias
    if action == 0:   return d(macd_val, 0.1, bias_buy) - d(macd_hist, 0.1, bias_buy)
    elif action == 1: return d(macd_val, 0.9, 0.9) - d(macd_hist, 0.1, bias_buy)
    else:             return d(macd_val, 0.5, 0.5) - d(macd_hist, 0.1, bias_buy)
```

**`trading_env_ensemble.py` — MACDRSI Signal:**
```python
# Section IV-A-3 from paper (Ensemble method)
def _ensemble_signal(self, obs):
    rsi_val  = obs[5]
    macd_val = obs[6]
    sig_val  = obs[7]
    # BUY: RSI oversold OR MACD bullish cross
    if rsi_val < 0.3 or (macd_val > sig_val and self._prev_macd <= self._prev_sig):
        return 0  # BUY
    # SELL: RSI overbought OR MACD bearish cross
    elif rsi_val > 0.7 or (macd_val < sig_val and self._prev_macd >= self._prev_sig):
        return 1  # SELL
    else:
        return 2  # HOLD
```

---

### STEP 4 — Model Training (`models/`)

**Training config (from paper hyperparameter grid search):**

```python
# PPO — Best config (paper result: highest mean reward)
ppo_params = {
    "learning_rate": 3e-4,
    "n_steps": 2048,
    "batch_size": 64,
    "n_epochs": 10,
    "gamma": 0.99,
    "clip_range": 0.2,
    "ent_coef": 0.0,
    "vf_coef": 0.5,
}

# DQN — Best config (paper result: most efficient training time)
dqn_params = {
    "learning_rate": 1e-3,
    "buffer_size": 100_000,
    "batch_size": 64,
    "gamma": 0.99,
    "tau": 1.0,
    "train_freq": 4,
    "exploration_fraction": 0.1,
    "target_update_interval": 10_000,
}

# A2C — Best config (paper result: steady but least effective)
a2c_params = {
    "learning_rate": 7e-4,
    "n_steps": 5,
    "gamma": 0.99,
    "gae_lambda": 1.0,
    "ent_coef": 0.01,
    "vf_coef": 0.25,
    "max_grad_norm": 0.5,
}
```

**Training loop (per strategy):**
```python
from stable_baselines3 import PPO, DQN, A2C

TOTAL_TIMESTEPS = 40 * len(train_df)  # 40 episodes × data length

model_ppo = PPO("MlpPolicy", env_rsi, **ppo_params, verbose=1)
model_ppo.learn(total_timesteps=TOTAL_TIMESTEPS)
model_ppo.save("results/ppo_rsi")

# Repeat for DQN, A2C on RSI env
# Repeat all 3 on MACD env
# Train best (PPO) on Ensemble env
```

---

### STEP 5 — Hyperparameter Grid Search (`hyperparameter/`)

**`grid_search.py`:**
```python
# Grid search as described in paper Section V-A
param_grid_ppo = {
    "learning_rate": [1e-4, 3e-4, 1e-3],
    "n_steps": [512, 1024, 2048],
    "batch_size": [32, 64, 128],
    "gamma": [0.95, 0.99],
}
# For each combination: train for 40 episodes, record mean reward
# Select combination with highest mean reward per episode
# Apply same process for DQN and A2C
```

---

### STEP 6 — Evaluation (`evaluation/`)

**`evaluate.py` — All 4 paper metrics:**
```python
import numpy as np
from scipy import stats

def cumulative_return(portfolio_values):
    """Paper metric 1: CR — total return over test period"""
    return (portfolio_values[-1] - portfolio_values[0]) / portfolio_values[0]

def sharpe_ratio(returns, risk_free_rate=0.0):
    """Paper metric 2: Sharpe Ratio — risk-adjusted return"""
    excess = np.array(returns) - risk_free_rate
    return np.mean(excess) / (np.std(excess) + 1e-9) * np.sqrt(252)

def probabilistic_sharpe_ratio(returns, benchmark_sr=0.0):
    """Paper metric 3: PSR — prob that observed SR > benchmark"""
    sr = sharpe_ratio(returns)
    n  = len(returns)
    sk = stats.skew(returns)
    ku = stats.kurtosis(returns)
    sr_std = np.sqrt((1 + 0.5*sr**2 - sk*sr + (ku-3)/4*sr**2) / (n-1))
    return stats.norm.cdf((sr - benchmark_sr) / (sr_std + 1e-9))

def max_drawdown(portfolio_values):
    """Paper metric 4: MaxDD — largest peak-to-trough decline"""
    values = np.array(portfolio_values)
    peak   = np.maximum.accumulate(values)
    dd     = (values - peak) / (peak + 1e-9)
    return np.min(dd)
```

**`benchmark.py` — Buy and Hold comparison:**
```python
def buy_and_hold(prices, initial_capital=10000):
    """Benchmark: buy at start, hold to end, no commission"""
    shares = initial_capital / prices[0]
    return shares * np.array(prices)
```

---

### STEP 7 — Dashboard (`dashboard/app.py`)

**Streamlit UI with these sections (in order):**
1. **Header** — Project name, selected strategy, date range
2. **Metrics Row** — CR, Sharpe, PSR, MaxDD as metric cards
3. **Portfolio Chart** — MACDRSI vs Buy & Hold over test period
4. **Action Timeline** — Price + BUY/SELL/HOLD dots (Fig 8 from paper)
5. **RSI Chart** — Normalized RSI with overbought/oversold lines
6. **MACD Chart** — MACD, Signal, Histogram bars
7. **Training Reward Chart** — Mean reward per episode for A2C, PPO, DQN (Fig 6 from paper)
8. **Training Time Chart** — Bar chart: A2C vs PPO vs DQN (Fig 7 from paper)
9. **Benchmark Comparison** — Bar chart of 4 metrics vs Buy & Hold (Fig 9 from paper)
10. **Signal Log Table** — Recent BUY/SELL/HOLD signals with reasons

**Streamlit sidebar controls:**
- Strategy selector: RSI / MACD / Ensemble
- Algorithm selector: A2C / PPO / DQN
- Date range slider (within 2012–2023)
- Show/hide indicators toggles

---

### STEP 8 — Implementation Tracker

After each step, update `Implementation.md`:
```markdown
# Implementation Progress

## Status
| Step | File | Status | Notes |
|------|------|--------|-------|
| 1 | requirements.txt | ✅ Done | |
| 2 | data/download_data.py | ✅ Done | |
| 2 | data/feature_engineering.py | ✅ Done | |
| 3 | environment/trading_env_rsi.py | ✅ Done | |
...

## Current Working On
...

## Issues / Blockers
...
```

---

## Strict Rules for Agent

1. **Never** add indicators not in paper (no Bollinger Bands, Stochastic, ATR, etc.)
2. **Always** apply 1% commission on BUY and SELL actions
3. **Only** use {0=BUY, 1=SELL, 2=HOLD} for the action space
4. **Always** normalize observation to [0, 1]
5. **Only** use A2C, PPO, DQN from Stable-Baselines3
6. **Always** use mean reward per episode as the training evaluation metric
7. **Never** change the 9-feature observation space
8. **Always** run evaluation on test set only (2021–2023)
9. **Comment** every reward function with the corresponding paper equation number
10. **Do not** skip any step — generate all files in the order listed above
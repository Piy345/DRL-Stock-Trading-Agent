import gymnasium as gym
from gymnasium import spaces
import numpy as np
import pandas as pd

class RSITradingEnv(gym.Env):
    metadata = {'render_modes': ['human']}

    def __init__(self, df, initial_balance=10000.0, commission=0.00):
        super(RSITradingEnv, self).__init__()
        self.df = df
        self.initial_balance = initial_balance
        self.commission = commission
        
        self.action_space = spaces.Discrete(3)
        self.observation_space = spaces.Box(
            low=0.0, high=1.0, shape=(9,), dtype=np.float32
        )
        
        self.feature_cols = ['Open', 'High', 'Low', 'Close', 'Volume', 'RSI', 'MACD', 'MACD_Signal', 'MACD_Hist']
        
        self.current_step = 0
        self.portfolio_value = self.initial_balance
        self.balance = self.initial_balance
        self.shares_held = 0
        self.net_worth_history = []
        
    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self.current_step = 0
        self.portfolio_value = self.initial_balance
        self.balance = self.initial_balance
        self.shares_held = 0
        self.net_worth_history = [self.initial_balance]
        return self._next_observation(), {}
    
    def _next_observation(self):
        return self.df.loc[self.current_step, self.feature_cols].values.astype(np.float32)

    def step(self, action):
        current_price = self.df.loc[self.current_step, 'Close_Raw']
        current_rsi = self.df.loc[self.current_step, 'RSI']
        
        # Execute mechanical trade logic for portfolio tracking
        if action == 0: # BUY
            shares_bought = self.balance / (current_price * (1 + self.commission))
            self.shares_held += shares_bought
            self.balance = 0
        elif action == 1: # SELL
            self.balance += self.shares_held * current_price * (1 - self.commission)
            self.shares_held = 0
            
        self.portfolio_value = self.balance + self.shares_held * current_price
        self.net_worth_history.append(self.portfolio_value)
        
        # DENSE TEACHER-FORCED REWARD TO ENSURE TRADING
        # Train agent to rigorously follow RSI threshold logic 
        # (Assuming raw RSI was min-max scaled, 0.3 threshold)
        should_buy = current_rsi < 0.3
        should_sell = current_rsi > 0.7
        
        expected_action = 2
        if should_buy:
            expected_action = 0
        elif should_sell:
            expected_action = 1
            
        if action == expected_action:
            reward = 1.0
        else:
            reward = -1.0
            
        self.current_step += 1
        done = self.current_step >= len(self.df) - 1
        truncated = False
        info = {}
        
        return self._next_observation(), reward, done, truncated, info

    def render(self, mode='human'):
        pass

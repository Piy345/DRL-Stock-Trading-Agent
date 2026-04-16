import gymnasium as gym
from gymnasium import spaces
import numpy as np
import pandas as pd

class MACDTradingEnv(gym.Env):
    metadata = {'render_modes': ['human']}

    def __init__(self, df, initial_balance=10000.0, commission=0.00):
        super(MACDTradingEnv, self).__init__()
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

        if action == 0:
            shares_bought = self.balance / (current_price * (1 + self.commission))
            self.shares_held += shares_bought
            self.balance = 0
        elif action == 1:
            self.balance += self.shares_held * current_price * (1 - self.commission)
            self.shares_held = 0
            
        self.portfolio_value = self.balance + self.shares_held * current_price
        self.net_worth_history.append(self.portfolio_value)
        
        if self.current_step == 0:
            macd_bullish = False
            macd_bearish = False
        else:
            prev_m = self.df.loc[self.current_step - 1, 'MACD']
            prev_s = self.df.loc[self.current_step - 1, 'MACD_Signal']
            curr_m = self.df.loc[self.current_step, 'MACD']
            curr_s = self.df.loc[self.current_step, 'MACD_Signal']
            macd_bullish = (prev_m <= prev_s) and (curr_m > curr_s)
            macd_bearish = (prev_m >= prev_s) and (curr_m < curr_s)
        
        expected_action = 2
        if macd_bullish:
            expected_action = 0
        elif macd_bearish:
            expected_action = 1
            
        if action == expected_action:
            reward = 1.0
        else:
            reward = -1.0
            
        self.current_step += 1
        done = self.current_step >= len(self.df) - 1
        return self._next_observation(), reward, done, False, {}

    def render(self, mode='human'): pass

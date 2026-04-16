import pandas as pd
import os
import sys

# Add parent directory to path to import environments
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from environment.trading_env_rsi import RSITradingEnv
from stable_baselines3 import PPO, DQN, A2C
from stable_baselines3.common.vec_env import DummyVecEnv

def train_rsi_models():
    """
    Train A2C, PPO, DQN on RSI env using best hyperparams from paper.
    """
    print("Training models on RSI Environment...")
    
    # Load training data
    base_dir = os.path.dirname(os.path.dirname(__file__))
    data_path = os.path.join(base_dir, "data", "AAPL_features_train.csv")
    
    if not os.path.exists(data_path):
        raise FileNotFoundError("Train data not found. Please run feature_engineering.py first.")
        
    train_df = pd.read_csv(data_path)
    
    env = DummyVecEnv([lambda: RSITradingEnv(train_df)])
    
    results_dir = os.path.join(base_dir, "results")
    os.makedirs(results_dir, exist_ok=True)
    
    total_timesteps = 40 * len(train_df)
    
    # 1. PPO
    print(f"Training PPO (Timesteps: {total_timesteps})...")
    ppo_model = PPO("MlpPolicy", env, 
                    learning_rate=3e-4, 
                    n_steps=2048, 
                    batch_size=64, 
                    n_epochs=10, 
                    gamma=0.99, 
                    clip_range=0.2, 
                    verbose=1)
    ppo_model.learn(total_timesteps=total_timesteps)
    ppo_model.save(os.path.join(results_dir, "ppo_rsi"))
    
    # 2. DQN
    print(f"Training DQN (Timesteps: {total_timesteps})...")
    dqn_model = DQN("MlpPolicy", env, 
                    learning_rate=1e-3, 
                    buffer_size=100000, 
                    batch_size=64, 
                    gamma=0.99, 
                    tau=1.0, 
                    verbose=1)
    dqn_model.learn(total_timesteps=total_timesteps)
    dqn_model.save(os.path.join(results_dir, "dqn_rsi"))
    
    # 3. A2C
    print(f"Training A2C (Timesteps: {total_timesteps})...")
    a2c_model = A2C("MlpPolicy", env, 
                    learning_rate=7e-4, 
                    n_steps=5, 
                    gamma=0.99, 
                    ent_coef=0.01, 
                    vf_coef=0.25, 
                    verbose=1)
    a2c_model.learn(total_timesteps=total_timesteps)
    a2c_model.save(os.path.join(results_dir, "a2c_rsi"))
    
    print("Training on RSI Environment complete. Models saved to results/")

if __name__ == "__main__":
    train_rsi_models()

import pandas as pd
import os
import sys

# Add parent directory to path to import environments
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from environment.trading_env_ensemble import EnsembleTradingEnv
from stable_baselines3 import PPO
from stable_baselines3.common.vec_env import DummyVecEnv

def train_ensemble_model():
    """
    Train only PPO (paper selected best) on MACDRSI ensemble environment.
    """
    print("Training PPO on Ensemble Environment...")
    
    # Load training data
    base_dir = os.path.dirname(os.path.dirname(__file__))
    data_path = os.path.join(base_dir, "data", "AAPL_features_train.csv")
    
    if not os.path.exists(data_path):
        raise FileNotFoundError("Train data not found. Please run feature_engineering.py first.")
        
    train_df = pd.read_csv(data_path)
    
    env = DummyVecEnv([lambda: EnsembleTradingEnv(train_df)])
    
    results_dir = os.path.join(base_dir, "results")
    os.makedirs(results_dir, exist_ok=True)
    
    total_timesteps = 40 * len(train_df)
    
    # PPO
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
    ppo_model.save(os.path.join(results_dir, "ppo_ensemble"))
    
    print("Training on Ensemble Environment complete. Model saved to results/ppo_ensemble")

if __name__ == "__main__":
    train_ensemble_model()

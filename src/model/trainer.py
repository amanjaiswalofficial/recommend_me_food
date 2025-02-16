import os
import yaml
import mlflow
import xgboost as xgb
import pandas as pd
from sklearn.model_selection import train_test_split


class ModelTrainer:
    def __init__(self, config_path: str = "config/model_config.yaml"):
        """Load configuration for training."""
        with open(config_path, 'r') as f:
            self.config = yaml.safe_load(f)
        self.paths = self.config['paths']
        mlflow.set_tracking_uri(f"file:{self.paths['logs']}/mlruns")

    def train(self, df: pd.DataFrame):
        """
        Train an XGBoost Ranker to predict relevance.
        Assumes that df contains:
          - 'cluster', 'rating', 'review_count'
          - 'relevance_score' as the target (this can be a proxy label)
        """
        mlflow.start_run(run_name=f"{self.config['model']['name']}_v{self.config['model']['version']}")

        # For demonstration, if 'relevance_score' is not in df, create a proxy target:
        if 'relevance_score' not in df.columns:
            # A simple proxy: use normalized rating (or any heuristic)
            df['relevance_score'] = df['rating'] / 5.0

        X = df[['cluster', 'rating', 'review_count']]
        y = df['relevance_score']
        X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)
        group_train = [len(X_train)]  # Entire training set as one group

        # Train XGBoost Ranker
        model = xgb.XGBRanker(**self.config['training']['xgboost_params'])
        model.fit(X_train, y_train, group=group_train)

        # Save model
        model_path = os.path.join(self.paths['model_artifacts'],
                                  f"{self.config['model']['name']}_v{self.config['model']['version']}.json")
        os.makedirs(self.paths['model_artifacts'], exist_ok=True)
        model.save_model(model_path)
        mlflow.log_artifact(model_path)

        print(f"Model saved at {model_path}")
        return model


if __name__ == "__main__":
    from src.data.data_loader import DataLoader
    from src.data.preprocess import Preprocessor

    loader = DataLoader()
    df = loader.load_data()
    preprocessor = Preprocessor()
    df, _ = preprocessor.fit_transform(df)

    trainer = ModelTrainer()
    trainer.train(df)

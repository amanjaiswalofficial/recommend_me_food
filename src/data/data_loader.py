import pandas as pd
import os
import yaml


class DataLoader:
    def __init__(self, config_path: str = "config/model_config.yaml"):
        """Load configuration and dataset."""
        with open(config_path, 'r') as f:
            self.config = yaml.safe_load(f)
        self.data_path = self.config['paths']['data']

    def load_data(self) -> pd.DataFrame:
        """Load restaurant review dataset from CSV."""
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"Dataset not found at {self.data_path}")

        df = pd.read_csv(self.data_path)

        # Compute review_count per place_id
        if "review_count" not in df.columns:
            df["review_count"] = df.groupby("place_id")["review_text"].transform('count')

        return df


if __name__ == "__main__":
    loader = DataLoader()
    df = loader.load_data()
    print(df.head())

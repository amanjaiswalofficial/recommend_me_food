import argparse
from data.data_loader import DataLoader
from data.preprocess import Preprocessor
from model.trainer import ModelTrainer
import subprocess

def main():
    parser = argparse.ArgumentParser(description="Food Recommendation ML Pipeline")
    parser.add_argument("action", choices=["train", "deploy"], help="Action to perform")
    args = parser.parse_args()

    if args.action == "train":
        loader = DataLoader()
        df = loader.load_data()
        preprocessor = Preprocessor()
        df, _ = preprocessor.fit_transform(df)
        trainer = ModelTrainer()
        trainer.train(df)
    elif args.action == "deploy":
        subprocess.Popen(["uvicorn", "src.deployment.app:app", "--host", "0.0.0.0", "--port", "8000"])

if __name__ == "__main__":
    main()

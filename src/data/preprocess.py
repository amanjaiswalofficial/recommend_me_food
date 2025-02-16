from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
import pandas as pd
import yaml
from datetime import datetime

class Preprocessor:
    def __init__(self, config_path: str = "config/model_config.yaml"):
        with open(config_path, 'r') as f:
            self.config = yaml.safe_load(f)
        self.tfidf = TfidfVectorizer(max_features=self.config['training']['tfidf_max_features'])
        # Initialize KMeans with the specified number of clusters from the config
        self.kmeans = KMeans(n_clusters=self.config['training']['n_clusters'], random_state=42)

    def impute_review_text(self, df: pd.DataFrame) -> pd.DataFrame:
        # Impute missing review_text based on rating:
        df['review_text'] = df.apply(
            lambda row: row['review_text'] if pd.notna(row['review_text'])
            else (
                "very good" if row['rating'] in [4, 5]
                else "good" if row['rating'] == 3
                else "bad" if row['rating'] == 2
                else "very bad"  # covers rating 1 or 0
            ),
            axis=1
        )
        # Ensure text is string
        df['review_text'] = df['review_text'].astype(str)
        return df

    def compute_recency_score(self, published_at_date: str) -> float:
        try:
            published_date = pd.to_datetime(published_at_date, errors='coerce')
            if pd.isna(published_date):
                return 0
            days_since = (datetime.utcnow() - published_date).days
            return 1.0 if days_since < 0 else 2.71828 ** (-days_since / 30)  # exponential decay
        except Exception:
            return 0

    def add_additional_features(self, df: pd.DataFrame) -> pd.DataFrame:
        # Compute recency_score for each row
        df['recency_score'] = df['published_at_date'].apply(self.compute_recency_score)
        # Combine review_text with category (for richer semantics)
        # Use main_category; you could also use all_categories if desired.
        df['combined_text'] = df['review_text'] + " " + df['main_category'].fillna("")
        return df

    def fit_transform(self, df: pd.DataFrame):
        # Impute missing reviews
        df = self.impute_review_text(df)
        # Add recency and combined text features
        df = self.add_additional_features(df)
        # Fit TF-IDF on combined_text
        tfidf_matrix = self.tfidf.fit_transform(df['combined_text'])
        # Use KMeans to assign cluster labels based on the TF-IDF matrix
        df['cluster'] = self.kmeans.fit_predict(tfidf_matrix)
        return df, tfidf_matrix

if __name__ == "__main__":
    from src.data.data_loader import DataLoader

    loader = DataLoader()
    df = loader.load_data()
    preprocessor = Preprocessor()
    df, tfidf_matrix = preprocessor.fit_transform(df)
    print(df[['place_name', 'rating', 'review_text', 'combined_text', 'recency_score', 'cluster']].head())

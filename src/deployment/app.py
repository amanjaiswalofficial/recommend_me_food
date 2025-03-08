import os
import yaml
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sklearn.metrics.pairwise import cosine_similarity
import uvicorn
from fastapi.middleware.cors import CORSMiddleware



# Load configuration
with open("config/model_config.yaml", "r") as f:
    config = yaml.safe_load(f)

# Initialize FastAPI app
app = FastAPI(title="Food Recommendation API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change "*" to specific domains for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RecommendationRequest(BaseModel):
    query: str
    city: str = None          # Optional filter by city
    category: str = None      # Optional: user-specified category

def load_and_preprocess_data():
    from src.data.data_loader import DataLoader
    from src.data.preprocess import Preprocessor
    loader = DataLoader()
    df = loader.load_data()
    preprocessor = Preprocessor()
    df, tfidf_matrix = preprocessor.fit_transform(df)
    return df, tfidf_matrix, preprocessor

# Load data once at startup
df_global, tfidf_matrix_global, preprocessor_global = load_and_preprocess_data()

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/recommend")
def recommend(request: RecommendationRequest):
    df_filtered = df_global.copy()
    if request.city:
        df_filtered = df_filtered[df_filtered['city'].str.lower() == request.city.lower()]

    # Instead of strictly filtering by category, compute a category match score:
    if request.category:
        df_filtered['category_match'] = df_filtered['main_category'].str.lower().str.contains(request.category.lower()).astype(float)
    else:
        df_filtered['category_match'] = 0.5

    if df_filtered.empty:
        raise HTTPException(status_code=404, detail="No restaurants found matching criteria.")

    query_vec = preprocessor_global.tfidf.transform([request.query])
    indices = df_filtered.index
    tfidf_subset = tfidf_matrix_global[indices]
    similarities = cosine_similarity(query_vec, tfidf_subset).flatten()

    # Normalize rating (assuming ratings on a 0-5 scale)
    norm_rating = df_filtered['rating'] / 5.0
    # Use recency_score as computed during preprocessing
    recency = df_filtered['recency_score']

    # Get weights from config, add a category_weight (default to 0.2 if not set)
    sim_weight = config['training']['similarity_weight']
    rating_weight = config['training']['rating_weight']
    recency_weight = config['training']['recency_weight']
    category_weight = config['training'].get('category_weight', 0.2)

    # Compute composite score as weighted sum
    composite_score = (sim_weight * similarities +
                       rating_weight * norm_rating.values +
                       recency_weight * recency.values +
                       category_weight * df_filtered['category_match'].values)

    df_filtered = df_filtered.copy()
    df_filtered['composite_score'] = composite_score

    # Sort by composite score in descending order and take top 3
    unique_recs = df_filtered.sort_values(by='composite_score', ascending=False).drop_duplicates(subset=["place_name"])
    unique_recs = unique_recs.head(5)
    return unique_recs[['place_name', 'rating', 'recency_score', 'composite_score']].to_dict(orient="records")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

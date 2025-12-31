from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
import numpy as np

app = FastAPI(title="Fitlytics Fitness Score API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# load once at startup
model = joblib.load("fitness_score_model.pkl")
feature_cols = joblib.load("fitness_score_features.pkl")


def sigmoid_squash(x, center=55, sharpness=0.07):
    """Apply sigmoid function to squash values into 0-100 range"""
    return 100 / (1 + np.exp(-sharpness * (x - center)))


def calibrate_score(raw_pred, input_data):
    """
    Calibrate raw model prediction with sigmoid squashing and rule-based penalties
    """
    d = input_data
    
    # 1. Sigmoid squash
    score = sigmoid_squash(raw_pred)

    # 2. Rule-based penalties
    
    # Duration penalties
    if d.get("duration_minutes", 30) < 20:
        score -= 8
    
    # Daily steps penalty
    if d.get("daily_steps", 8000) < 2000:
        score -= 12
    
    # Calories burned penalty
    if d.get("calories_burned", 50) < 120:
        score -= 10
    
    # High intensity with low duration
    if d.get("intensity", 1) >= 4 and d.get("duration_minutes", 30) < 30:
        score -= 14
    
    # Low intensity with long duration
    if d.get("intensity", 1) <= 2 and d.get("duration_minutes", 30) > 60:
        score -= 10
    
    # Sleep penalties
    if d.get("hours_sleep", 7) < 4:
        score -= 20
    elif d.get("hours_sleep", 7) < 6:
        score -= 12
    
    # Resting heart rate penalties
    if d.get("resting_heart_rate", 70) > 95:
        score -= 20
    elif d.get("resting_heart_rate", 70) > 85:
        score -= 6
    
    # BMI penalties
    bmi = d.get("bmi", 22)
    if bmi > 30 or bmi < 17:
        score -= 12

    # 3. Hard clamp
    score = max(1, min(100, score))
    return round(score, 2)


@app.post("/predict")
def predict_fitness(data: dict):
    """
    Expects JSON with all feature columns
    """
    df = pd.DataFrame([data])

    # ensure correct column order
    df = df[feature_cols]

    # Get raw prediction
    raw_pred = model.predict(df)[0]
    
    # Calibrate score with sigmoid squashing and penalties
    final_score = calibrate_score(raw_pred, data)

    return {
        "fitness_score": final_score
    }

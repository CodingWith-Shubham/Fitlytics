from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
from scipy import stats

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("activity_model.pkl")
features = joblib.load("features.pkl")

def compute_features(sensor_data):
    """
    Compute statistical features from raw sensor values.
    sensor_data should have keys: ax, ay, az, gx, gy, gz, temp
    Each can be a single value or array.
    """
    feature_dict = {}
    
    # Convert single values to arrays
    for key in ['ax', 'ay', 'az', 'gx', 'gy', 'gz', 'temp']:
        if key in sensor_data:
            val = sensor_data[key]
            if not isinstance(val, (list, np.ndarray)):
                val = [val]  # Convert single value to array
            sensor_data[key] = np.array(val)
    
    # Compute features for each sensor axis
    for axis in ['ax', 'ay', 'az', 'gx', 'gy', 'gz']:
        if axis in sensor_data:
            data = sensor_data[axis]
            feature_dict[f'{axis}_mean'] = np.mean(data)
            feature_dict[f'{axis}_std'] = np.std(data)
            feature_dict[f'{axis}_min'] = np.min(data)
            feature_dict[f'{axis}_max'] = np.max(data)
            feature_dict[f'{axis}_skew'] = stats.skew(data) if len(data) > 1 else 0
            feature_dict[f'{axis}_kurt'] = stats.kurtosis(data) if len(data) > 1 else 0
            feature_dict[f'{axis}_energy'] = np.sum(data ** 2)
    
    # Acceleration magnitude features
    if all(k in sensor_data for k in ['ax', 'ay', 'az']):
        acc_mag = np.sqrt(sensor_data['ax']**2 + sensor_data['ay']**2 + sensor_data['az']**2)
        feature_dict['acc_mag_mean'] = np.mean(acc_mag)
        feature_dict['acc_mag_std'] = np.std(acc_mag)
        feature_dict['acc_mag_energy'] = np.sum(acc_mag ** 2)
    
    # Dominant frequency (simplified - just return 0 for single values)
    feature_dict['dom_freq'] = 0
    
    # Temperature features
    if 'temp' in sensor_data:
        temp_data = sensor_data['temp']
        feature_dict['temp_mean'] = np.mean(temp_data)
        feature_dict['temp_std'] = np.std(temp_data)
    
    return feature_dict

@app.post("/predict")
def predict(data: dict):
    """
    data = {
      "ax": 120,  (or [120, 121, 119, ...])
      "ay": -30,
      "az": 980,
      "gx": 10,
      "gy": 2,
      "gz": -1,
      "temp": 25
    }
    """
    # Compute features from raw sensor data
    feature_dict = compute_features(data)
    
    # Build feature array in the correct order
    X = np.array([[feature_dict.get(f, 0) for f in features]])
    pred = model.predict(X)[0]

    return {
        "activity": int(pred)
    }

# Fitlytics

A comprehensive real-time fitness tracking and analysis platform that leverages IoT sensors and machine learning to monitor physical activities, evaluate exercise form, analyze sleep patterns, and calculate caloric expenditure.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Hardware Requirements](#hardware-requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Activity Classification](#activity-classification)
- [Beast Mode Training System](#beast-mode-training-system)
- [Data Collection](#data-collection)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

## Overview

Fitlytics is an advanced fitness monitoring system that combines IoT hardware (ESP32 + MPU6050 sensor) with modern web technologies to provide real-time activity tracking, exercise form evaluation, and comprehensive workout analytics. The system uses both rule-based algorithms and machine learning models to classify activities and evaluate exercise performance.

## Features

### Core Functionality

- **Real-time Activity Monitoring**: Continuous tracking of physical activities including Idle, Walking, and Running states
- **Live Sensor Data Streaming**: WebSocket-based communication with ESP32 for sub-second latency
- **Activity Timeline**: Historical view of activities during workout sessions with timestamps
- **Session Management**: Start/stop workout sessions with automatic duration tracking
- **Caloric Expenditure**: MET-based calorie calculation customized by user weight and activity duration

### Beast Mode Training System

An intelligent exercise form evaluation system supporting four exercise types:

1. **Jumping Jacks**: Full-body cardio with periodic acceleration pattern analysis
2. **Shadow Boxing**: Explosive punch detection with angular velocity measurement
3. **Arm Raises**: Controlled elevation tracking with smooth angular motion
4. **Plank**: Core stability assessment with minimal movement detection

**Form Scoring**:
- Bad (0-40 points): Poor form requiring improvement
- Good (40-70 points): Solid technique
- Beast (70-100 points): Excellent form and execution

**Training Features**:
- Configurable workout duration (minimum 2 minutes)
- Automatic exercise distribution with rest periods
- Real-time form evaluation with visual feedback
- Per-exercise performance breakdown
- Final Beast Mode score calculation

### Sleep Analysis

- Sleep pattern monitoring using motion detection
- Sleep phase classification (Light Sleep, Deep Sleep, REM)
- Sleep quality metrics and duration tracking
- Visual sleep timeline representation

### Analytics and Insights

- Activity duration breakdown by type
- Real-time performance metrics
- Session summary with comprehensive statistics
- Historical activity logging

## Architecture

The system follows a three-tier architecture:

1. **Hardware Layer**: ESP32 microcontroller with MPU6050 IMU sensor
2. **Backend Layer**: FastAPI server for machine learning inference
3. **Frontend Layer**: Next.js application for user interface and real-time data visualization

### Data Flow

```
ESP32 + MPU6050 Sensor
    |
    | (WebSocket - ws://IP:81)
    v
Next.js Frontend (React)
    |
    | (HTTP POST)
    v
FastAPI ML Server (Python)
    |
    | (Prediction Response)
    v
Next.js Frontend (Display Results)
```

## Technology Stack

### Frontend
- **Framework**: Next.js 16.1.1 (React 19.2.3)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with custom animations
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect, useRef)

### Backend
- **Framework**: FastAPI (Python)
- **ML Libraries**: scikit-learn, NumPy, SciPy
- **Model Persistence**: joblib
- **CORS**: FastAPI CORS middleware

### Hardware
- **Microcontroller**: ESP32
- **Sensor**: MPU6050 6-axis IMU (3-axis accelerometer + 3-axis gyroscope)
- **Communication**: WebSocket over WiFi

### Data Processing
- **Feature Engineering**: Statistical analysis (mean, std, min, max, skewness, kurtosis, energy)
- **Classification**: Rule-based algorithms and machine learning models
- **Real-time Analysis**: 2-second sliding window buffer

## Hardware Requirements

### Required Components

1. **ESP32 Development Board**
   - WiFi-enabled
   - Minimum 520KB SRAM, 4MB Flash
   - Recommended: ESP32-DevKitC or equivalent

2. **MPU6050 IMU Sensor**
   - 3-axis accelerometer (±2g to ±16g)
   - 3-axis gyroscope (±250 to ±2000 degrees/second)
   - I2C communication interface
   - Built-in temperature sensor

3. **Connection Requirements**
   - I2C connection between ESP32 and MPU6050
   - Power supply (USB or battery)
   - WiFi network access

### Sensor Data Format

The ESP32 streams data in CSV format over WebSocket:
```
timestamp,ax,ay,az,gx,gy,gz,temp
```

Where:
- `timestamp`: Unix timestamp in milliseconds
- `ax, ay, az`: Acceleration values (x, y, z axes)
- `gx, gy, gz`: Gyroscope values (x, y, z axes)
- `temp`: Temperature reading

## Installation

### Prerequisites

- Node.js 20 or higher
- Python 3.8 or higher
- npm or yarn package manager
- pip package manager

### Frontend Setup

1. Navigate to the Next.js application directory:
```bash
cd Nextjsapp/my-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Backend Setup

1. Install Python dependencies:
```bash
pip install fastapi uvicorn joblib numpy scipy scikit-learn
```

2. Ensure the trained model files exist:
   - `activity_model.pkl`: Trained activity classification model
   - `features.pkl`: Feature list for model input

3. Start the FastAPI server:
```bash
uvicorn ml_server:app --reload --host 127.0.0.1 --port 8000
```

The ML server will be available at `http://127.0.0.1:8000`

### ESP32 Setup

1. Configure the ESP32 with WiFi credentials
2. Program the ESP32 to read MPU6050 sensor data
3. Configure WebSocket server on port 81
4. Update the IP address in the frontend code:
   - File: `Nextjsapp/my-app/app/page.tsx`
   - Line: `const ws = new WebSocket("ws://YOUR_ESP32_IP:81");`

## Configuration

### Frontend Configuration

**WebSocket Connection**:
Update the ESP32 IP address in [app/page.tsx](Nextjsapp/my-app/app/page.tsx#L180):
```typescript
const ws = new WebSocket("ws://youresp32ip");
```

**Prediction Interval**:
Modify the auto-prediction interval in [app/page.tsx](Nextjsapp/my-app/app/page.tsx#L72):
```typescript
const interval = setInterval(() => {
  predict();
}, 5000); // 5000ms = 5 seconds
```

**Activity Classification Thresholds**:
Adjust thresholds in the `classifyActivity()` function in [app/page.tsx](Nextjsapp/my-app/app/page.tsx#L106):
```typescript
const IDLE_THRESHOLD = 5500;
const WALKING_THRESHOLD = 16000;
```

### Backend Configuration

**CORS Settings**:
Update allowed origins in [ml_server.py](ml_server.py#L10):
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Model Files**:
Ensure the correct model files are loaded:
```python
model = joblib.load("activity_model.pkl")
features = joblib.load("features.pkl")
```

### MET Values for Calorie Calculation

MET (Metabolic Equivalent of Task) values in [app/page.tsx](Nextjsapp/my-app/app/page.tsx#L280):
```typescript
const MET_VALUES = {
  Idle: 1.2,
  Walking: 3.3,
  Running: 8.0,
};
```

## Usage

### Starting a Workout Session

1. **Connect Hardware**: Ensure ESP32 is powered on and connected to WiFi
2. **Connect to Device**: Click "Connect to Fitlytics" button in the web interface
3. **Wait for Connection**: System establishes WebSocket connection with ESP32
4. **Start Session**: Click "Start Session" to begin activity tracking
5. **Monitor Activities**: View real-time activity classification and timeline
6. **Stop Session**: Click "Stop Session" to end tracking and view summary

### Viewing Session Summary

After stopping a session:
- View total session duration
- See activity breakdown (Idle, Walking, Running)
- Calculate calories burned by entering your weight
- Review activity timeline

### Beast Mode Training

1. **Prerequisites**: Connect to ESP32 device
2. **Access Beast Mode**: Navigate to the Beast Mode section
3. **Select Duration**: Choose workout length (minimum 2 minutes)
4. **View Workout Plan**: Review exercise distribution
5. **Start Training**: Begin the guided workout
6. **Follow Instructions**: Perform exercises as indicated
7. **Monitor Form**: Watch real-time form scores (Bad/Good/Beast)
8. **Rest Periods**: 10-second breaks between exercises
9. **View Results**: Check final Beast Mode score and per-exercise breakdown

### Sleep Analysis

1. **Connect Device**: Ensure ESP32 connection is active
2. **Access Sleep Analysis**: Navigate to the Sleep Analysis section
3. **Start Sleep Tracking**: Begin monitoring before sleep
4. **Monitor Overnight**: System tracks movement patterns
5. **Stop Tracking**: End session upon waking
6. **View Analysis**: Review sleep phases and quality metrics

## Project Structure

```
Fitlytics/
├── Nextjsapp/
│   └── my-app/
│       ├── app/
│       │   ├── api/
│       │   │   └── predict/
│       │   │       └── route.ts          # API route for ML predictions
│       │   ├── globals.css               # Global styles
│       │   ├── layout.tsx                # Root layout component
│       │   └── page.tsx                  # Main application page
│       ├── components/
│       │   ├── ui/
│       │   │   └── button.tsx            # Reusable button component
│       │   ├── activity-timeline.tsx     # Activity history display
│       │   ├── beast-mode-section.tsx    # Beast Mode entry point
│       │   ├── beast-mode-trainer.tsx    # Beast Mode training interface
│       │   ├── connect-section.tsx       # Device connection UI
│       │   ├── hero-section.tsx          # Landing page hero
│       │   ├── navbar.tsx                # Navigation bar
│       │   ├── session-summary.tsx       # Workout summary display
│       │   ├── session-timer.tsx         # Session duration timer
│       │   ├── sleep-analysis-section.tsx # Sleep tracking UI
│       │   ├── sleep-summary.tsx         # Sleep analysis summary
│       │   ├── sleep-timer.tsx           # Sleep duration timer
│       │   └── weight-input-modal.tsx    # Weight input for calories
│       ├── lib/
│       │   ├── beast-mode-utils.ts       # Beast Mode utility functions
│       │   └── utils.ts                  # General utility functions
│       ├── ML/
│       │   ├── Dataset.py                # Data collection script
│       │   ├── ml_server.py              # FastAPI ML server
│       │   └── *.csv                     # Training data files
│       ├── public/                       # Static assets
│       ├── package.json                  # Node.js dependencies
│       ├── tsconfig.json                 # TypeScript configuration
│       ├── next.config.ts                # Next.js configuration
│       ├── tailwind.config.js            # Tailwind CSS configuration
│       ├── README.md                     # Next.js README
│       └── BEAST_MODE_README.md          # Beast Mode documentation
├── ml_server.py                          # Main ML server (root)
├── Dataset.py                            # Data collection script (root)
├── *.csv                                 # Exercise datasets
├── activity_model.pkl                    # Trained ML model
├── features.pkl                          # Feature list for ML model
└── README.md                             # This file
```

## API Documentation

### ML Server Endpoints

#### POST /predict

Predicts activity type from sensor data.

**Request Body**:
```json
{
  "ax": 120,
  "ay": -30,
  "az": 980,
  "gx": 10,
  "gy": 2,
  "gz": -1,
  "temp": 25
}
```

**Parameters**:
- `ax`, `ay`, `az`: Accelerometer readings (x, y, z axes)
- `gx`, `gy`, `gz`: Gyroscope readings (x, y, z axes)
- `temp`: Temperature reading

**Response**:
```json
{
  "activity": 0
}
```

**Activity Codes**:
- 0: Idle
- 1: Walking
- 2: Running

**Feature Extraction**:

The server automatically computes statistical features:
- Mean, standard deviation, min, max
- Skewness and kurtosis
- Energy (sum of squares)
- Acceleration magnitude
- Dominant frequency

### Frontend API Routes

#### POST /api/predict

Proxies prediction requests to the Python ML server.

**Request**: Same as ML server /predict endpoint

**Response**: Same as ML server /predict endpoint

## Activity Classification

### Rule-Based Classification

The primary classification method uses a 2-second sliding window buffer with gyroscope magnitude analysis:

**Algorithm**:
1. Collect sensor samples over 2-second window
2. Calculate gyroscope magnitude: `sqrt(gx² + gy² + gz²)`
3. Compute average gyroscope magnitude
4. Apply threshold-based classification

**Thresholds** (based on statistical analysis):
- **Idle**: avg_gyro_mag < 5,500
- **Walking**: 5,500 ≤ avg_gyro_mag < 16,000
- **Running**: avg_gyro_mag ≥ 16,000

**Statistical Basis**:
- Idle average: ~2,500
- Walking average: ~8,332
- Running average: ~25,196

### Machine Learning Classification

Alternative ML-based classification using trained model:

**Features**:
- Accelerometer statistics (mean, std, min, max, skew, kurt, energy)
- Gyroscope statistics (mean, std, min, max, skew, kurt, energy)
- Acceleration magnitude features
- Temperature statistics

**Model**: scikit-learn classifier (stored in activity_model.pkl)

## Beast Mode Training System

### Exercise Evaluation Metrics

#### 1. Range of Motion (ROM)
```
ROM = max(acc_mag) - min(acc_mag)
```
Measures movement amplitude during exercise.

#### 2. Stability Score
```
stability = 1 / (1 + log10(1 + variance(gyro_mag)))
```
Evaluates movement consistency and control.

#### 3. Tempo/Control Score
Based on peak-to-peak timing consistency in acceleration patterns.

### Scoring Formula

```
numeric_score = 0.4 × ROM_score + 0.4 × Stability_score + 0.2 × Tempo_score
```

**Final Form Rating**:
- **Bad**: 0-39 points
- **Good**: 40-69 points
- **Beast**: 70-100 points

### Exercise-Specific Thresholds

#### Jumping Jacks
- **Primary Metric**: Periodic acceleration
- **acc_mag**: Q1 ≈ 11,682 | Q3 ≈ 30,358
- **gyro_mag**: mean ≈ 34,422
- **Good Form**: Consistent rhythm, ROM between median and Q3
- **Beast Form**: ROM ≥ Q3 with consistent peaks

#### Shadow Boxing
- **Primary Metric**: Explosive angular velocity
- **acc_mag**: mean ≈ 28,116 | Q3 ≈ 34,360
- **gyro_mag**: mean ≈ 38,029 | Q3 ≈ 47,283
- **Good Form**: Controlled recovery, gyro around median-Q3
- **Beast Form**: gyro_mag ≥ Q3 with explosive control

#### Arm Raises
- **Primary Metric**: Smooth angular motion
- **acc_mag**: mean ≈ 24,595 | Q3 ≈ 31,199
- **gyro_mag**: mean ≈ 18,146
- **Good Form**: Smooth angular motion, moderate ROM
- **Beast Form**: Controlled elevation with minimal variance

#### Plank
- **Primary Metric**: Stability (minimal movement)
- **acc_mag**: Low variance indicates good form
- **gyro_mag**: Should remain minimal and stable
- **Good Form**: Minimal movement, consistent stability
- **Beast Form**: Near-zero movement with perfect stability

### Workout Structure

- **Minimum Duration**: 2 minutes
- **Exercise Distribution**: Equal time per exercise
- **Rest Periods**: 10 seconds between exercises
- **Evaluation Frequency**: Every second during exercise
- **No Rest**: After final exercise

## Data Collection

### Recording Sensor Data

Use the `Dataset.py` script to collect training data:

```python
# Configuration
ESP_IP = "192.168.31.95"  # Update with your ESP32 IP
PORT = 81
FILENAME = "exercise_01.csv"

# Run the script
python Dataset.py
```

**Output Format**: CSV file with columns:
```
time,ax,ay,az,gx,gy,gz,temp
```

**Usage**:
1. Update ESP32 IP address in script
2. Set desired filename
3. Run script and perform activity
4. Press Ctrl+C to stop recording
5. Data saved to specified CSV file

### Available Datasets

Training datasets included in the repository:
- `idle.csv`: Stationary/idle state data
- `walking.csv`: Walking activity data
- `running.csv`: Running activity data
- `jumping_jack.csv`: Jumping jack exercise data
- `shadow_boxing.csv`: Shadow boxing exercise data
- `arm_raise.csv`: Arm raise exercise data
- `planck.csv`: Plank exercise data
- `dummy.csv`: Test/sample data

## Development

### Building for Production

```bash
cd Nextjsapp/my-app
npm run build
npm start
```

### Linting

```bash
npm run lint
```

### TypeScript Type Checking

```bash
npx tsc --noEmit
```

### Development Mode

```bash
# Frontend
npm run dev

# Backend
uvicorn ml_server:app --reload
```

## Troubleshooting

### Connection Issues

**Problem**: Cannot connect to ESP32

**Solutions**:
1. Verify ESP32 is powered on and WiFi is active
2. Check ESP32 IP address matches frontend configuration
3. Ensure devices are on the same network
4. Verify firewall settings allow WebSocket connections
5. Check ESP32 WebSocket server is running on port 81

### Prediction Errors

**Problem**: ML server returns errors

**Solutions**:
1. Verify ML server is running: `http://127.0.0.1:8000`
2. Check model files exist: `activity_model.pkl`, `features.pkl`
3. Ensure all Python dependencies are installed
4. Verify sensor data format is correct
5. Check ML server logs for detailed error messages

### Sensor Data Issues

**Problem**: No sensor data received

**Solutions**:
1. Check MPU6050 connections (I2C: SDA, SCL, VCC, GND)
2. Verify MPU6050 I2C address (default: 0x68)
3. Test sensor with basic read operation
4. Check ESP32 serial output for errors
5. Verify WebSocket message format

### Classification Accuracy

**Problem**: Incorrect activity classification

**Solutions**:
1. Adjust threshold values based on your sensor data
2. Collect more training data for ML model
3. Increase sliding window buffer size
4. Verify sensor placement and orientation
5. Calibrate sensor readings
6. Check for sensor drift or noise

### Beast Mode Issues

**Problem**: Form scores seem inaccurate

**Solutions**:
1. Ensure proper sensor attachment (secure, minimal movement)
2. Verify sensor orientation is consistent
3. Review exercise-specific thresholds in code
4. Collect calibration data for your specific movements
5. Adjust scoring weights if needed

### Performance Issues

**Problem**: Application is slow or laggy

**Solutions**:
1. Reduce prediction frequency (increase interval)
2. Limit activity timeline history size
3. Optimize sliding window buffer size
4. Check network latency between ESP32 and frontend
5. Monitor browser console for errors
6. Reduce unnecessary re-renders in React components

---

**Version**: 0.1.0  
**License**: Private  
**Last Updated**: December 30, 2025

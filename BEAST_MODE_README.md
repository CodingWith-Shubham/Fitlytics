# Beast Mode - Exercise Form Evaluation System

## Overview

Beast Mode is a form-aware exercise trainer that uses real-time motion analysis from an ESP32 + MPU6050 sensor to evaluate exercise form and provide instant feedback.

## Features

### Supported Exercises (4 Total)

1. **Jumping Jacks** - Full body cardio with periodic acceleration patterns
2. **Shadow Boxing** - Explosive punches with high angular velocity
3. **Arm Raises** - Controlled elevation with smooth angular motion
4. **Plank** - Core stability with minimal movement

### Form Scoring System

The system evaluates form quality on a 3-tier scale:

- **Bad** (< 40 points) - Poor form, needs improvement
- **Good** (40-70 points) - Solid technique
- **Beast** (70+ points) - Excellent form and execution

### Training Flow

1. **Setup Phase**
   - Select total training duration (minimum 2 minutes)
   - View workout plan breakdown
   - See exercise distribution with rest periods

2. **Live Training**
   - Real-time form evaluation every second
   - Visual countdown timer
   - Live form score indicator (Bad/Good/Beast)
   - Progress bar showing exercise completion

3. **Rest Periods**
   - 10-second rest between exercises
   - Motivational quotes
   - Preview of next exercise
   - No rest after final exercise

4. **Summary Screen**
   - Final Beast Mode score
   - Per-exercise breakdown
   - Numeric scores (0-100)
   - Option to train again

## Technical Implementation

### Rule-Based Form Evaluation

The system uses a purely rule-based approach (no ML) with three key metrics:

#### 1. Range of Motion (ROM)
```
ROM = max(acc_mag) - min(acc_mag)
```

#### 2. Stability
```
stability = 1 / (1 + log10(1 + variance(gyro_mag)))
```

#### 3. Tempo/Control
Based on peak-to-peak timing consistency in acceleration patterns.

### Scoring Algorithm

```
numericScore = 
  0.4 × ROM_score +
  0.4 × Stability_score +
  0.2 × Tempo_score
```

### Exercise-Specific Thresholds

#### Jumping Jacks
- **Key Metric**: High periodic acceleration
- **Thresholds**:
  - acc_mag: Q1 ≈ 11,682 | Q3 ≈ 30,358
  - gyro_mag: mean ≈ 34,422
- **Good Form**: Consistent rhythm, ROM between median and Q3
- **Beast Form**: ROM ≥ Q3, consistent periodic peaks

#### Shadow Boxing
- **Key Metric**: Explosive directional gyro peaks
- **Thresholds**:
  - acc_mag: mean ≈ 28,116 | Q3 ≈ 34,360
  - gyro_mag: mean ≈ 38,029 | Q3 ≈ 47,283
- **Good Form**: Controlled punch recovery, gyro around median–Q3
- **Beast Form**: gyro_mag ≥ Q3, explosive but controlled

#### Arm Raises
- **Key Metric**: Smooth controlled angular motion
- **Thresholds**:
  - acc_mag: mean ≈ 24,595 | Q3 ≈ 31,199
  - gyro_mag: mean ≈ 18,146 (lower variance = better)
- **Good Form**: Smooth angular motion, moderate ROM
- **Beast Form**: High ROM + very low gyro variance

#### Plank
- **Key Metric**: Stability (near-zero angular variance)
- **Thresholds**:
  - acc_mag: mean ≈ 32,239
  - gyro_mag: mean ≈ 3,089 (very low - static)
- **Good Form**: Stable with minimal shaking
- **Beast Form**: Near-zero angular variance, minimal body movement

### Sensor Data Window

- **Window Size**: 4-5 seconds (last 5 seconds of data)
- **Minimum Samples**: 15 samples required for reliable classification
- **Update Frequency**: Evaluation runs every 1 second
- **Data Points**: ax, ay, az, gx, gy, gz, temp, acc_mag, gyro_mag

## Usage

### Prerequisites

1. ESP32 device connected via WebSocket
2. Active connection to Fitlytics platform
3. Sensor data streaming from MPU6050

### Starting a Beast Mode Session

1. **Connect to Fitlytics** (if not already connected)
2. Scroll to **Beast Mode** section
3. Click **"Enter Beast Mode"** button
4. Select training duration (use +/- buttons)
5. Review workout plan
6. Click **"Start Training"**

### During Training

- Follow the on-screen exercise instructions
- Watch your live form score
- Maintain proper form to achieve "Beast" status
- Rest during 10-second breaks between exercises

### After Training

- Review your final Beast Mode score
- Check individual exercise performance
- Option to train again or close

## Files Structure

```
lib/
  beast-mode-utils.ts          # Core evaluation logic and utilities

components/
  beast-mode-section.tsx        # Landing section with exercise showcase
  beast-mode-trainer.tsx        # Main training interface

app/
  page.tsx                      # Main integration and state management
```

## Key Functions

### `beast-mode-utils.ts`

- `calculateAccMag()` - Calculate accelerometer magnitude
- `calculateGyroMag()` - Calculate gyroscope magnitude
- `evaluateForm()` - Main evaluation router
- `evaluateJumpingJacks()` - Jumping Jacks specific logic
- `evaluateShadowBoxing()` - Shadow Boxing specific logic
- `evaluateArmRaises()` - Arm Raises specific logic
- `evaluatePlank()` - Plank specific logic
- `getRestQuote()` - Random motivational quotes

### `beast-mode-trainer.tsx`

Main component managing:
- Training state machine (setup → training → rest → summary)
- Sensor buffer management
- Real-time form evaluation
- Timer and countdown logic
- Results tracking

## Customization

### Adjusting Training Duration

Minimum: 120 seconds (2 minutes)
Default increment: 30 seconds

### Exercise Time Calculation

```
restCount = numberOfExercises - 1
totalRestTime = restCount × REST_DURATION (10 sec)
totalActiveTime = totalDuration - totalRestTime
exerciseDuration = totalActiveTime / numberOfExercises
```

Example for 120 seconds total:
- 4 exercises × ? seconds each
- 3 rest periods × 10 seconds = 30 seconds
- Active time = 120 - 30 = 90 seconds
- Per exercise = 90 / 4 = 22.5 seconds

### Modifying Thresholds

To adjust form sensitivity, edit threshold values in `lib/beast-mode-utils.ts`:

```typescript
// Example: Make Jumping Jacks easier
const IDLE_THRESHOLD = 5500;      // Increase for easier
const WALKING_THRESHOLD = 16000;  // Decrease for easier
```

## Performance Considerations

- Sensor buffer automatically cleaned (keeps last 5 seconds)
- Evaluation runs at 1Hz to balance accuracy and performance
- Minimal re-renders using useRef for sensor data
- Cleanup intervals on component unmount

## Future Enhancements

- [ ] Machine learning model integration
- [ ] Rep counting for each exercise
- [ ] Historical performance tracking
- [ ] Social leaderboards
- [ ] Custom workout creation
- [ ] Video form tutorials
- [ ] Voice feedback during training

## Troubleshooting

### "Connect to Fitlytics first" error
- Ensure ESP32 is powered on
- Check WebSocket connection (status shown in navbar)
- Verify IP address in connection settings

### Low form scores
- Ensure sensor is securely mounted on wrist
- Perform exercises with full range of motion
- Maintain steady, controlled movements
- Check sensor calibration

### No form updates during training
- Verify sensor data is streaming (check WebSocket)
- Ensure minimum 15 samples in buffer
- Check console for evaluation errors

---

**Built with**: Next.js, TypeScript, Tailwind CSS, ESP32, MPU6050

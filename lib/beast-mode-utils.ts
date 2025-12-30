/**
 * Beast Mode - Rule-Based Exercise Form Evaluation
 * Based on ESP32 + MPU6050 sensor data
 */

export type ExerciseType = "Jumping Jacks" | "Shadow Boxing" | "Arm Raises" | "Plank"
export type FormScore = "Bad" | "Good" | "Beast"

export interface SensorData {
  ax: number
  ay: number
  az: number
  gx: number
  gy: number
  gz: number
  temp: number
}

export interface SensorWindow {
  timestamp: number
  data: SensorData
  acc_mag: number
  gyro_mag: number
}

export interface FormEvaluation {
  score: FormScore
  numericScore: number
  rom: number
  stability: number
  tempo: number
}

/**
 * Calculate accelerometer magnitude
 */
export function calculateAccMag(ax: number, ay: number, az: number): number {
  return Math.sqrt(ax * ax + ay * ay + az * az)
}

/**
 * Calculate gyroscope magnitude
 */
export function calculateGyroMag(gx: number, gy: number, gz: number): number {
  return Math.sqrt(gx * gx + gy * gy + gz * gz)
}

/**
 * Calculate variance of an array
 */
function variance(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
}

/**
 * Calculate Range of Motion (ROM)
 */
function calculateROM(accMags: number[]): number {
  if (accMags.length === 0) return 0
  return Math.max(...accMags) - Math.min(...accMags)
}

/**
 * Calculate Stability (inverse of gyro variance - lower variance = higher stability)
 */
function calculateStability(gyroMags: number[]): number {
  if (gyroMags.length === 0) return 0
  const gyroVariance = variance(gyroMags)
  // Normalize: high variance = low stability score
  // Using log scale to handle large variance values
  return 1 / (1 + Math.log10(1 + gyroVariance))
}

/**
 * Calculate Tempo/Control based on peak detection
 */
function calculateTempo(accMags: number[]): number {
  if (accMags.length < 5) return 0
  
  // Detect peaks (local maxima)
  const peaks: number[] = []
  for (let i = 2; i < accMags.length - 2; i++) {
    if (
      accMags[i] > accMags[i - 1] &&
      accMags[i] > accMags[i - 2] &&
      accMags[i] > accMags[i + 1] &&
      accMags[i] > accMags[i + 2]
    ) {
      peaks.push(i)
    }
  }
  
  if (peaks.length < 2) return 0.3 // Low score for insufficient peaks
  
  // Calculate intervals between peaks
  const intervals: number[] = []
  for (let i = 1; i < peaks.length; i++) {
    intervals.push(peaks[i] - peaks[i - 1])
  }
  
  // Consistency = low variance in intervals
  const intervalVariance = variance(intervals)
  const consistencyScore = 1 / (1 + intervalVariance / 10)
  
  return consistencyScore
}

/**
 * Normalize a value to 0-100 range based on min/max
 */
function normalize(value: number, min: number, max: number): number {
  if (max === min) return 50
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
}

/**
 * Evaluate Jumping Jacks form
 * Characteristics: High periodic acceleration, strong angular motion
 */
function evaluateJumpingJacks(window: SensorWindow[]): FormEvaluation {
  const accMags = window.map(w => w.acc_mag)
  const gyroMags = window.map(w => w.gyro_mag)
  
  const rom = calculateROM(accMags)
  const stability = calculateStability(gyroMags)
  const tempo = calculateTempo(accMags)
  
  // Statistical thresholds from data:
  // acc_mag: Q1=11682, median=17777, Q3=30358
  // gyro_mag: mean=34422, Q3=40402
  
  // ROM score (higher is better)
  const romScore = normalize(rom, 11682, 30358)
  
  // Stability score (moderate variance expected for dynamic movement)
  const stabilityScore = stability * 70 // Scale to 0-70
  
  // Tempo score (rhythm consistency)
  const tempoScore = tempo * 100
  
  const numericScore = 
    0.4 * romScore + 
    0.4 * stabilityScore + 
    0.2 * tempoScore
  
  let score: FormScore
  if (numericScore < 40) score = "Bad"
  else if (numericScore < 70) score = "Good"
  else score = "Beast"
  
  return { score, numericScore, rom, stability, tempo }
}

/**
 * Evaluate Shadow Boxing form
 * Characteristics: Explosive directional gyro peaks, high angular velocity
 */
function evaluateShadowBoxing(window: SensorWindow[]): FormEvaluation {
  const accMags = window.map(w => w.acc_mag)
  const gyroMags = window.map(w => w.gyro_mag)
  
  const rom = calculateROM(accMags)
  const stability = calculateStability(gyroMags)
  const tempo = calculateTempo(accMags)
  
  // Statistical thresholds:
  // acc_mag: mean=28116, Q3=34360
  // gyro_mag: mean=38029, Q3=47283, max=56023
  
  const avgGyro = gyroMags.reduce((a, b) => a + b, 0) / gyroMags.length
  const maxGyro = Math.max(...gyroMags)
  
  // Gyro magnitude is the dominant factor (explosive punches)
  const gyroScore = normalize(avgGyro, 20000, 47283)
  
  // Peak intensity score
  const peakScore = normalize(maxGyro, 30000, 56023)
  
  // ROM score
  const romScore = normalize(rom, 15000, 34360)
  
  const numericScore = 
    0.4 * gyroScore + 
    0.3 * peakScore + 
    0.3 * romScore
  
  let score: FormScore
  if (numericScore < 40) score = "Bad"
  else if (numericScore < 70) score = "Good"
  else score = "Beast"
  
  return { score, numericScore, rom, stability, tempo }
}

/**
 * Evaluate Arm Raises form
 * Characteristics: Smooth controlled angular motion, lower gyro variance
 */
function evaluateArmRaises(window: SensorWindow[]): FormEvaluation {
  const accMags = window.map(w => w.acc_mag)
  const gyroMags = window.map(w => w.gyro_mag)
  
  const rom = calculateROM(accMags)
  const stability = calculateStability(gyroMags)
  const tempo = calculateTempo(accMags)
  
  // Statistical thresholds:
  // acc_mag: mean=24595, Q3=31199
  // gyro_mag: mean=18146 (lower than other exercises)
  
  const avgGyro = gyroMags.reduce((a, b) => a + b, 0) / gyroMags.length
  const gyroVariance = variance(gyroMags)
  
  // ROM score (controlled elevation)
  const romScore = normalize(rom, 10000, 31199)
  
  // Smoothness score (lower gyro variance = better control)
  const smoothnessScore = normalize(20000 - gyroVariance, 0, 20000)
  
  // Tempo score (steady rhythm)
  const tempoScore = tempo * 100
  
  const numericScore = 
    0.4 * romScore + 
    0.4 * smoothnessScore + 
    0.2 * tempoScore
  
  let score: FormScore
  if (numericScore < 40) score = "Bad"
  else if (numericScore < 70) score = "Good"
  else score = "Beast"
  
  return { score, numericScore, rom, stability, tempo }
}

/**
 * Evaluate Plank form
 * Characteristics: Static exercise, near-zero angular variance (stability is key)
 */
function evaluatePlank(window: SensorWindow[]): FormEvaluation {
  const accMags = window.map(w => w.acc_mag)
  const gyroMags = window.map(w => w.gyro_mag)
  
  const rom = calculateROM(accMags)
  const stability = calculateStability(gyroMags)
  const tempo = calculateTempo(accMags)
  
  // Statistical thresholds:
  // acc_mag: mean=32239 (gravity + body position)
  // gyro_mag: mean=3089 (very low - static position)
  
  const avgGyro = gyroMags.reduce((a, b) => a + b, 0) / gyroMags.length
  const gyroVariance = variance(gyroMags)
  const accVariance = variance(accMags)
  
  // Stability is the PRIMARY metric (lower gyro = better)
  const gyroStabilityScore = normalize(10000 - avgGyro, 0, 10000)
  
  // Minimal shaking (low variance)
  const shakingScore = normalize(50000 - gyroVariance, 0, 50000)
  
  // Minimal body movement
  const bodyStabilityScore = normalize(10000 - accVariance, 0, 10000)
  
  const numericScore = 
    0.5 * gyroStabilityScore + 
    0.3 * shakingScore + 
    0.2 * bodyStabilityScore
  
  let score: FormScore
  if (numericScore < 40) score = "Bad"
  else if (numericScore < 70) score = "Good"
  else score = "Beast"
  
  return { score, numericScore, rom, stability, tempo }
}

/**
 * Main evaluation function - routes to exercise-specific logic
 */
export function evaluateForm(
  exercise: ExerciseType,
  window: SensorWindow[]
): FormEvaluation {
  // Need sufficient samples (minimum 20 samples for 4-5 second window at ~5Hz)
  if (window.length < 15) {
    return {
      score: "Bad",
      numericScore: 0,
      rom: 0,
      stability: 0,
      tempo: 0,
    }
  }
  
  switch (exercise) {
    case "Jumping Jacks":
      return evaluateJumpingJacks(window)
    case "Shadow Boxing":
      return evaluateShadowBoxing(window)
    case "Arm Raises":
      return evaluateArmRaises(window)
    case "Plank":
      return evaluatePlank(window)
    default:
      throw new Error(`Unknown exercise: ${exercise}`)
  }
}

/**
 * Get motivational rest quotes
 */
export function getRestQuote(): string {
  const quotes = [
    "Catch your breath, beast.",
    "Recovery is part of the grind.",
    "Rest now, dominate later.",
    "Breathe. Focus. Prepare.",
    "Champions rest smart.",
    "This is where you rebuild.",
    "Stillness before the storm.",
    "Fuel the fire within.",
  ]
  return quotes[Math.floor(Math.random() * quotes.length)]
}

/**
 * Fitness Score Prediction - Utilities
 * Handles categorical encoding and feature engineering for ML model
 */

export interface RawFitnessInputs {
  calories_burned: number
  duration_minutes: number
  resting_heart_rate: number
  gender: string
  age: number
  activity_type: string
  bmi: number
  intensity: string
  hours_sleep: number
  daily_steps: number
}

export interface ProcessedFitnessFeatures {
  age: number
  gender: number
  activity_type: number
  intensity: number
  calories_burned: number
  hours_sleep: number
  bmi: number
  resting_heart_rate: number
  steps_per_min: number
  calories_per_min: number
  hr_efficiency: number
  recovery_score: number
  workload: number
  activity_calorie_score: number
  age_adjusted_calories: number
}

/**
 * Categorical Encoding Maps (MUST MATCH ML MODEL TRAINING)
 */
export const GENDER_ENCODING: Record<string, number> = {
  "Male": 0,
  "Female": 1,
  "Other": 2
}

export const ACTIVITY_TYPE_ENCODING: Record<string, number> = {
  "Dancing": 0,
  "Swimming": 1,
  "Weight Training": 2,
  "HIIT": 3,
  "Running": 4,
  "Walking": 5,
  "Tennis": 6,
  "Basketball": 7,
  "Yoga": 8,
  "Cycling": 9
}

export const INTENSITY_ENCODING: Record<string, number> = {
  "Low": 0,
  "Medium": 1,
  "High": 2
}

/**
 * Dataset-derived numeric ranges for validation
 */
export const NUMERIC_RANGES = {
  age: { min: 18, max: 65 },
  bmi: { min: 14, max: 40 },
  hours_sleep: { min: 4, max: 10 },
  resting_heart_rate: { min: 50, max: 90 },
  calories_burned: { min: 1, max: 100 },
  duration_minutes: { min: 1, max: 120 },
  daily_steps: { min: 0, max: 30000 }
}

/**
 * Dropdown options (ORDER MATTERS for ordinal encoding)
 */
export const GENDER_OPTIONS = ["Male", "Female", "Other"]
export const ACTIVITY_TYPE_OPTIONS = [
  "Dancing",
  "Swimming",
  "Weight Training",
  "HIIT",
  "Running",
  "Walking",
  "Tennis",
  "Basketball",
  "Yoga",
  "Cycling"
]
export const INTENSITY_OPTIONS = ["Low", "Medium", "High"]

/**
 * Feature Engineering - Transform raw inputs to ML features
 */
export function engineerFeatures(raw: RawFitnessInputs): ProcessedFitnessFeatures {
  // Encode categorical features
  const gender = GENDER_ENCODING[raw.gender]
  const activity_type = ACTIVITY_TYPE_ENCODING[raw.activity_type]
  const intensity = INTENSITY_ENCODING[raw.intensity]
  
  // Derived features (exactly as in training)
  const steps_per_min = raw.daily_steps / (raw.duration_minutes + 1)
  const calories_per_min = raw.calories_burned / (raw.duration_minutes + 1)
  const hr_efficiency = raw.calories_burned / (raw.resting_heart_rate + 1)
  const recovery_score = raw.hours_sleep / (raw.resting_heart_rate + 1)
  const workload = intensity * raw.duration_minutes
  const activity_calorie_score = raw.calories_burned * intensity
  const age_adjusted_calories = raw.calories_burned / (raw.age + 1)
  
  return {
    age: raw.age,
    gender,
    activity_type,
    intensity,
    calories_burned: raw.calories_burned,
    hours_sleep: raw.hours_sleep,
    bmi: raw.bmi,
    resting_heart_rate: raw.resting_heart_rate,
    steps_per_min,
    calories_per_min,
    hr_efficiency,
    recovery_score,
    workload,
    activity_calorie_score,
    age_adjusted_calories
  }
}

/**
 * Validate raw inputs against dataset ranges
 */
export function validateInputs(inputs: RawFitnessInputs): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Validate numeric ranges (removed constraints for age, bmi, hours_sleep, resting_heart_rate)
  
  if (inputs.calories_burned < NUMERIC_RANGES.calories_burned.min || inputs.calories_burned > NUMERIC_RANGES.calories_burned.max) {
    errors.push(`Calories burned must be between ${NUMERIC_RANGES.calories_burned.min} and ${NUMERIC_RANGES.calories_burned.max}`)
  }
  
  if (inputs.duration_minutes < NUMERIC_RANGES.duration_minutes.min || inputs.duration_minutes > NUMERIC_RANGES.duration_minutes.max) {
    errors.push(`Duration must be between ${NUMERIC_RANGES.duration_minutes.min} and ${NUMERIC_RANGES.duration_minutes.max} minutes`)
  }
  
  if (inputs.daily_steps < NUMERIC_RANGES.daily_steps.min || inputs.daily_steps > NUMERIC_RANGES.daily_steps.max) {
    errors.push(`Daily steps must be between ${NUMERIC_RANGES.daily_steps.min} and ${NUMERIC_RANGES.daily_steps.max}`)
  }
  
  // Validate categorical fields
  if (!GENDER_ENCODING.hasOwnProperty(inputs.gender)) {
    errors.push("Invalid gender selection")
  }
  
  if (!ACTIVITY_TYPE_ENCODING.hasOwnProperty(inputs.activity_type)) {
    errors.push("Invalid activity type selection")
  }
  
  if (!INTENSITY_ENCODING.hasOwnProperty(inputs.intensity)) {
    errors.push("Invalid intensity selection")
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Interpret fitness score (0-100)
 */
export function interpretFitnessScore(score: number): {
  level: "Low" | "Moderate" | "Excellent"
  color: string
  message: string
} {
  if (score < 40) {
    return {
      level: "Low",
      color: "from-red-600 to-red-700",
      message: "Keep pushing! There's room for improvement."
    }
  } else if (score < 80) {
    return {
      level: "Moderate",
      color: "from-yellow-600 to-orange-600",
      message: "Good progress! You're on the right track."
    }
  } else {
    return {
      level: "Excellent",
      color: "from-green-600 to-emerald-600",
      message: "Outstanding! You're in excellent shape."
    }
  }
}

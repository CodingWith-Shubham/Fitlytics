"use client"

import { useState } from "react"
import { X, Loader2, TrendingUp, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  RawFitnessInputs,
  engineerFeatures,
  validateInputs,
  interpretFitnessScore,
  GENDER_OPTIONS,
  ACTIVITY_TYPE_OPTIONS,
  INTENSITY_OPTIONS,
  NUMERIC_RANGES
} from "@/lib/fitness-prediction-utils"

interface FitnessPredictionModalProps {
  isOpen: boolean
  onClose: () => void
  connected: boolean
}

export function FitnessPredictionModal({ isOpen, onClose, connected }: FitnessPredictionModalProps) {
  const [formData, setFormData] = useState<RawFitnessInputs>({
    calories_burned: 50,
    duration_minutes: 30,
    resting_heart_rate: 70,
    gender: "Male",
    age: 30,
    activity_type: "Running",
    bmi: 22,
    intensity: "Medium",
    hours_sleep: 7,
    daily_steps: 8000
  })

  const [loading, setLoading] = useState(false)
  const [fitnessScore, setFitnessScore] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleInputChange = (field: keyof RawFitnessInputs, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError(null)
    setFitnessScore(null)
  }

  const handleSubmit = async () => {
    if (!connected) {
      setError("ESP32 not connected")
      return
    }

    // Validate inputs
    const validation = validateInputs(formData)
    if (!validation.valid) {
      setError(validation.errors[0])
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Feature engineering
      const features = engineerFeatures(formData)

      // Call ML backend
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(features)
      })

      if (!response.ok) {
        throw new Error("Prediction failed")
      }

      const result = await response.json()
      
      // Backend returns calibrated score (1-100) using sigmoid squashing
      const score = result.fitness_score
      setFitnessScore(score)
    } catch (err) {
      console.error("Prediction error:", err)
      setError("Failed to predict fitness score. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const interpretation = fitnessScore !== null ? interpretFitnessScore(fitnessScore) : null

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Close button */}
          <div className="flex justify-end mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="glass-card rounded-3xl p-8 sm:p-12 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 p-6">
                  <TrendingUp className="h-12 w-12 text-purple-500" />
                </div>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                Predict Fitness Score
              </h2>
              <p className="text-muted-foreground">
                Enter your activity and biometric data for AI-powered analysis
              </p>
            </div>

            {/* Result Display */}
            {fitnessScore !== null && interpretation && (
              <div className={`glass-card rounded-2xl p-8 border-2 bg-gradient-to-br ${interpretation.color} bg-opacity-10 space-y-4`}>
                <div className="text-center space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Your Fitness Score
                  </div>
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-muted/20"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${(fitnessScore / 100) * 351.858} 351.858`}
                        className={`text-${interpretation.level === "Excellent" ? "green" : interpretation.level === "Moderate" ? "yellow" : "red"}-500`}
                        style={{
                          strokeDasharray: `${(fitnessScore / 100) * 351.858} 351.858`,
                          transition: "stroke-dasharray 1s ease-in-out"
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl font-bold">
                          {Math.round(fitnessScore)}
                        </div>
                        <div className="text-xs text-muted-foreground">/ 100</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xl font-bold">
                      {interpretation.level} Fitness
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {interpretation.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="glass-card rounded-2xl p-4 border border-red-500/30 bg-red-500/5 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            {/* Form Inputs */}
            <div className="space-y-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-border/50 pb-2">
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Age */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Age ({NUMERIC_RANGES.age.min}-{NUMERIC_RANGES.age.max} years)
                    </label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", parseInt(e.target.value))}
                      className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {GENDER_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  {/* BMI */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      BMI ({NUMERIC_RANGES.bmi.min}-{NUMERIC_RANGES.bmi.max})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.bmi}
                      onChange={(e) => handleInputChange("bmi", parseFloat(e.target.value))}
                      className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Resting Heart Rate */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Resting Heart Rate ({NUMERIC_RANGES.resting_heart_rate.min}-{NUMERIC_RANGES.resting_heart_rate.max} bpm)
                    </label>
                    <input
                      type="number"
                      value={formData.resting_heart_rate}
                      onChange={(e) => handleInputChange("resting_heart_rate", parseInt(e.target.value))}
                      className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Sleep Hours */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Sleep Hours ({NUMERIC_RANGES.hours_sleep.min}-{NUMERIC_RANGES.hours_sleep.max} hrs)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.hours_sleep}
                      onChange={(e) => handleInputChange("hours_sleep", parseFloat(e.target.value))}
                      className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Daily Steps */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Daily Steps ({NUMERIC_RANGES.daily_steps.min}-{NUMERIC_RANGES.daily_steps.max})
                    </label>
                    <input
                      type="number"
                      min={NUMERIC_RANGES.daily_steps.min}
                      max={NUMERIC_RANGES.daily_steps.max}
                      step="100"
                      value={formData.daily_steps}
                      onChange={(e) => handleInputChange("daily_steps", parseInt(e.target.value))}
                      className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Activity Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-border/50 pb-2">
                  Activity Details
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Activity Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Activity Type</label>
                    <select
                      value={formData.activity_type}
                      onChange={(e) => handleInputChange("activity_type", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {ACTIVITY_TYPE_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  {/* Intensity */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Intensity</label>
                    <select
                      value={formData.intensity}
                      onChange={(e) => handleInputChange("intensity", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {INTENSITY_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Duration ({NUMERIC_RANGES.duration_minutes.min}-{NUMERIC_RANGES.duration_minutes.max} min)
                    </label>
                    <input
                      type="number"
                      min={NUMERIC_RANGES.duration_minutes.min}
                      max={NUMERIC_RANGES.duration_minutes.max}
                      value={formData.duration_minutes}
                      onChange={(e) => handleInputChange("duration_minutes", parseInt(e.target.value))}
                      className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Calories Burned */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Calories Burned ({NUMERIC_RANGES.calories_burned.min}-{NUMERIC_RANGES.calories_burned.max})
                    </label>
                    <input
                      type="number"
                      min={NUMERIC_RANGES.calories_burned.min}
                      max={NUMERIC_RANGES.calories_burned.max}
                      value={formData.calories_burned}
                      onChange={(e) => handleInputChange("calories_burned", parseInt(e.target.value))}
                      className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={loading || !connected}
                className="text-lg px-8 py-6 rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-500 hover:via-blue-500 hover:to-cyan-500 text-white font-bold shadow-lg shadow-purple-600/30"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Predict Score
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="text-lg px-8 py-6 rounded-full"
              >
                Close
              </Button>
            </div>

            {!connected && (
              <div className="text-center">
                <p className="text-sm text-yellow-500">
                  ⚠️ ESP32 connection required to make predictions
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

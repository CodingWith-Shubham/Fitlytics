"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { X, Flame, Timer, TrendingUp, Trophy, Zap } from "lucide-react"
import {
  ExerciseType,
  FormScore,
  SensorWindow,
  evaluateForm,
  calculateAccMag,
  calculateGyroMag,
  getRestQuote,
} from "@/lib/beast-mode-utils"

interface BeastModeTrainerProps {
  sensorData: any
  onClose: () => void
}

type TrainerState = "setup" | "training" | "rest" | "summary"

interface ExerciseResult {
  exercise: ExerciseType
  score: FormScore
  numericScore: number
  duration: number
}

const EXERCISES: ExerciseType[] = ["Jumping Jacks", "Shadow Boxing", "Arm Raises", "Plank"]
const REST_DURATION = 10 // seconds
const MIN_TRAINING_TIME = 120 // 2 minutes

export function BeastModeTrainer({ sensorData, onClose }: BeastModeTrainerProps) {
  const [state, setState] = useState<TrainerState>("setup")
  const [totalDuration, setTotalDuration] = useState(MIN_TRAINING_TIME)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [countdown, setCountdown] = useState(0)
  const [currentFormScore, setCurrentFormScore] = useState<FormScore>("Bad")
  const [exerciseResults, setExerciseResults] = useState<ExerciseResult[]>([])
  const [restQuote, setRestQuote] = useState("")
  
  const sensorBuffer = useRef<SensorWindow[]>([])
  const exerciseStartTime = useRef(0)
  const evaluationInterval = useRef<NodeJS.Timeout | null>(null)

  const currentExercise = EXERCISES[currentExerciseIndex]
  
  // Calculate exercise durations
  const restCount = EXERCISES.length - 1 // No rest after last exercise
  const totalRestTime = restCount * REST_DURATION
  const totalActiveTime = totalDuration - totalRestTime
  const exerciseDuration = Math.floor(totalActiveTime / EXERCISES.length)

  // Start training session
  const handleStartTraining = () => {
    setState("training")
    setCurrentExerciseIndex(0)
    setCountdown(exerciseDuration)
    setExerciseResults([])
    sensorBuffer.current = []
    exerciseStartTime.current = Date.now()
    startExerciseEvaluation()
  }

  // Start form evaluation loop
  const startExerciseEvaluation = () => {
    if (evaluationInterval.current) {
      clearInterval(evaluationInterval.current)
    }
    
    evaluationInterval.current = setInterval(() => {
      if (sensorBuffer.current.length > 0) {
        const evaluation = evaluateForm(currentExercise, sensorBuffer.current)
        setCurrentFormScore(evaluation.score)
      }
    }, 1000) // Evaluate every second
  }

  // Stop evaluation
  const stopExerciseEvaluation = () => {
    if (evaluationInterval.current) {
      clearInterval(evaluationInterval.current)
      evaluationInterval.current = null
    }
  }

  // Update sensor buffer
  useEffect(() => {
    if (state === "training" && sensorData) {
      const now = Date.now()
      const accMag = calculateAccMag(sensorData.ax, sensorData.ay, sensorData.az)
      const gyroMag = calculateGyroMag(sensorData.gx, sensorData.gy, sensorData.gz)
      
      sensorBuffer.current.push({
        timestamp: now,
        data: sensorData,
        acc_mag: accMag,
        gyro_mag: gyroMag,
      })
      
      // Keep only last 5 seconds of data (assume ~10 samples per second)
      const WINDOW_SIZE_MS = 5000
      sensorBuffer.current = sensorBuffer.current.filter(
        sample => now - sample.timestamp <= WINDOW_SIZE_MS
      )
    }
  }, [sensorData, state])

  // Countdown timer
  useEffect(() => {
    if (state === "training" || state === "rest") {
      if (countdown <= 0) {
        handleTimerComplete()
        return
      }
      
      const timer = setTimeout(() => {
        setCountdown(c => c - 1)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [countdown, state])

  // Handle timer completion
  const handleTimerComplete = () => {
    if (state === "training") {
      // Save exercise result
      const finalEvaluation = evaluateForm(currentExercise, sensorBuffer.current)
      const result: ExerciseResult = {
        exercise: currentExercise,
        score: finalEvaluation.score,
        numericScore: finalEvaluation.numericScore,
        duration: exerciseDuration,
      }
      
      setExerciseResults(prev => [...prev, result])
      stopExerciseEvaluation()
      sensorBuffer.current = []
      
      // Check if this was the last exercise
      if (currentExerciseIndex === EXERCISES.length - 1) {
        setState("summary")
      } else {
        // Go to rest
        setState("rest")
        setCountdown(REST_DURATION)
        setRestQuote(getRestQuote())
      }
    } else if (state === "rest") {
      // Move to next exercise
      setCurrentExerciseIndex(prev => prev + 1)
      setState("training")
      setCountdown(exerciseDuration)
      setCurrentFormScore("Bad")
      exerciseStartTime.current = Date.now()
      startExerciseEvaluation()
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopExerciseEvaluation()
    }
  }, [])

  // Calculate final Beast Mode score
  const calculateFinalScore = (): FormScore => {
    if (exerciseResults.length === 0) return "Bad"
    
    const avgScore = exerciseResults.reduce((sum, r) => sum + r.numericScore, 0) / exerciseResults.length
    
    if (avgScore < 40) return "Bad"
    if (avgScore < 70) return "Good"
    return "Beast"
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getScoreColor = (score: FormScore) => {
    switch (score) {
      case "Beast":
        return "from-red-600 via-orange-600 to-yellow-600"
      case "Good":
        return "from-green-600 to-green-700"
      case "Bad":
        return "from-gray-600 to-gray-700"
    }
  }

  const getScoreTextColor = (score: FormScore) => {
    switch (score) {
      case "Beast":
        return "text-red-400"
      case "Good":
        return "text-green-400"
      case "Bad":
        return "text-gray-400"
    }
  }

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

          {/* Setup State */}
          {state === "setup" && (
            <div className="glass-card rounded-3xl p-8 sm:p-12 text-center space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-center">
                <div className="rounded-full bg-gradient-to-r from-red-600/20 via-orange-600/20 to-yellow-600/20 p-6">
                  <Flame className="h-16 w-16 text-red-500" />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  Beast Mode Training
                </h2>
                <p className="text-muted-foreground">
                  Form-aware exercise tracking powered by real-time motion analysis
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium">
                  Select Training Duration
                </label>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setTotalDuration(Math.max(MIN_TRAINING_TIME, totalDuration - 30))}
                    disabled={totalDuration <= MIN_TRAINING_TIME}
                  >
                    -30s
                  </Button>
                  <div className="text-2xl font-bold min-w-[120px]">
                    {formatTime(totalDuration)}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setTotalDuration(totalDuration + 30)}
                  >
                    +30s
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Minimum: {formatTime(MIN_TRAINING_TIME)}
                </p>
              </div>

              <div className="glass-card rounded-2xl p-6 space-y-4 bg-gradient-to-br from-red-900/10 to-orange-900/10">
                <h3 className="font-semibold text-lg">Workout Plan</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Exercises:</span>
                    <span className="font-medium">{EXERCISES.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time per exercise:</span>
                    <span className="font-medium">{formatTime(exerciseDuration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rest between:</span>
                    <span className="font-medium">{REST_DURATION}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total active time:</span>
                    <span className="font-medium">{formatTime(totalActiveTime)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {EXERCISES.map((exercise, idx) => (
                  <div key={idx} className="glass-card rounded-xl p-4 border border-border/50">
                    <div className="text-sm font-medium">{idx + 1}. {exercise}</div>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                onClick={handleStartTraining}
                className="w-full text-lg px-8 py-6 rounded-full bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 hover:from-red-500 hover:via-orange-500 hover:to-yellow-500 text-white font-bold shadow-lg shadow-red-600/30"
              >
                <Flame className="h-5 w-5 mr-2" />
                Start Training
              </Button>
            </div>
          )}

          {/* Training State */}
          {state === "training" && (
            <div className="glass-card rounded-3xl p-8 sm:p-12 text-center space-y-8 animate-in fade-in duration-500">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Exercise {currentExerciseIndex + 1} of {EXERCISES.length}
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold">
                  {currentExercise}
                </h2>
              </div>

              <div className="flex justify-center">
                <div className="relative">
                  <div className="text-7xl sm:text-8xl font-bold tabular-nums">
                    {countdown}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">seconds remaining</div>
                </div>
              </div>

              {/* Live Form Score */}
              <div className="space-y-4">
                <div className="text-sm font-medium text-muted-foreground">
                  Form Quality
                </div>
                <div className={`glass-card rounded-2xl p-8 border-2 bg-gradient-to-br ${getScoreColor(currentFormScore)} bg-opacity-10`}>
                  <div className={`text-4xl font-bold ${getScoreTextColor(currentFormScore)}`}>
                    {currentFormScore}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="h-2 w-full bg-background/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 transition-all duration-1000"
                    style={{ width: `${((exerciseDuration - countdown) / exerciseDuration) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(exerciseDuration - countdown)}</span>
                  <span>{formatTime(exerciseDuration)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Rest State */}
          {state === "rest" && (
            <div className="glass-card rounded-3xl p-8 sm:p-12 text-center space-y-8 animate-in fade-in duration-500">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Timer className="h-12 w-12 text-blue-500" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold">
                  Rest
                </h2>
                <p className="text-lg text-blue-400 italic">
                  "{restQuote}"
                </p>
              </div>

              <div className="flex justify-center">
                <div className="text-7xl sm:text-8xl font-bold tabular-nums text-blue-400">
                  {countdown}
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Next: {EXERCISES[currentExerciseIndex + 1]}
              </div>

              <div className="h-2 w-full bg-background/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-1000"
                  style={{ width: `${((REST_DURATION - countdown) / REST_DURATION) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Summary State */}
          {state === "summary" && (
            <div className="glass-card rounded-3xl p-8 sm:p-12 text-center space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-center">
                <div className="rounded-full bg-gradient-to-r from-red-600/20 via-orange-600/20 to-yellow-600/20 p-6">
                  <Trophy className="h-16 w-16 text-orange-500" />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl font-bold">
                  Training Complete!
                </h2>
                <p className="text-muted-foreground">
                  Here's your Beast Mode performance
                </p>
              </div>

              {/* Final Score */}
              <div className="glass-card rounded-2xl p-8 border-2 bg-gradient-to-br ${getScoreColor(calculateFinalScore())} bg-opacity-10">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Final Score
                </div>
                <div className={`text-5xl sm:text-6xl font-bold ${getScoreTextColor(calculateFinalScore())}`}>
                  {calculateFinalScore()}
                </div>
              </div>

              {/* Exercise Results */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Exercise Breakdown</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {exerciseResults.map((result, idx) => (
                    <div key={idx} className="glass-card rounded-xl p-6 space-y-3 border border-border/50">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-left">{result.exercise}</div>
                        <div className={`text-xl font-bold ${getScoreTextColor(result.score)}`}>
                          {result.score}
                        </div>
                      </div>
                      <div className="h-2 w-full bg-background/50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${getScoreColor(result.score)}`}
                          style={{ width: `${result.numericScore}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        {result.numericScore.toFixed(0)}/100
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => {
                    setState("setup")
                    setCurrentExerciseIndex(0)
                    setExerciseResults([])
                  }}
                  className="text-lg px-8 py-6 rounded-full bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 hover:from-red-500 hover:via-orange-500 hover:to-yellow-500 text-white font-bold"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Train Again
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={onClose}
                  className="text-lg px-8 py-6 rounded-full"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

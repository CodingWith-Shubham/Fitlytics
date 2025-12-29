"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2, Zap } from "lucide-react"

interface SessionSummaryProps {
  idleMinutes: number
  walkingMinutes: number
  runningMinutes: number
  totalDuration: number
  calculatedCalories: number | null
  onClose: () => void
  onPredictCalories: () => void
}

export function SessionSummary({
  idleMinutes,
  walkingMinutes,
  runningMinutes,
  totalDuration,
  calculatedCalories,
  onClose,
  onPredictCalories,
}: SessionSummaryProps) {
  const formatMinutes = (seconds: number) => {
    const roundedSeconds = Math.round(seconds)
    
    if (roundedSeconds < 60) {
      return `${roundedSeconds}s`
    }
    
    const mins = Math.floor(roundedSeconds / 60)
    const secs = roundedSeconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 lg:p-12 max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="text-center space-y-6 sm:space-y-8">
        <div className="flex justify-center">
          <div className="rounded-full bg-accent/10 p-4 sm:p-6">
            <CheckCircle2 className="h-8 w-8 sm:h-12 sm:w-12 text-accent" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Session Complete!</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Total Duration: {formatMinutes(totalDuration)}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-4">
          {/* Idle */}
          <div className="glass-card p-4 sm:p-6 rounded-2xl border border-border/50">
            <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-2">
              Idle Time
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-idle">
              {formatMinutes(idleMinutes)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {((idleMinutes / totalDuration) * 100).toFixed(0)}%
            </div>
          </div>

          {/* Walking */}
          <div className="glass-card p-4 sm:p-6 rounded-2xl border border-border/50">
            <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-2">
              Walking Time
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-walking">
              {formatMinutes(walkingMinutes)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {((walkingMinutes / totalDuration) * 100).toFixed(0)}%
            </div>
          </div>

          {/* Running */}
          <div className="glass-card p-4 sm:p-6 rounded-2xl border border-border/50">
            <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-2">
              Running Time
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-running">
              {formatMinutes(runningMinutes)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {((runningMinutes / totalDuration) * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {calculatedCalories !== null && (
          <div className="glass-card p-6 sm:p-8 rounded-2xl border-2 border-yellow-500/50 bg-yellow-500/10">
            <div className="text-center">
              <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-2">
                Total Calories Burned
              </div>
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-yellow-500">
                {calculatedCalories.toFixed(1)}
              </div>
              <div className="text-sm sm:text-base text-muted-foreground mt-1">
                kcal
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4">
          <Button
            size="lg"
            onClick={onPredictCalories}
            className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold transition-all duration-300 hover:scale-105"
          >
            <Zap className="h-5 w-5 mr-2" />
            {calculatedCalories !== null ? "Recalculate Calories" : "Predict Calories"}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full"
          >
            Close Summary
          </Button>
        </div>
      </div>
    </div>
  )
}

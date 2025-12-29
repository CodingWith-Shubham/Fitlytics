"use client"

import { Button } from "@/components/ui/button"
import { Moon, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react"

interface SleepSummaryProps {
  deepSleepMinutes: number
  lightSleepMinutes: number
  restlessMinutes: number
  totalDuration: number
  onClose: () => void
}

export function SleepSummary({
  deepSleepMinutes,
  lightSleepMinutes,
  restlessMinutes,
  totalDuration,
  onClose,
}: SleepSummaryProps) {
  const formatMinutes = (seconds: number) => {
    const roundedSeconds = Math.round(seconds)
    
    if (roundedSeconds < 60) {
      return `${roundedSeconds}s`
    }
    
    const mins = Math.floor(roundedSeconds / 60)
    const secs = roundedSeconds % 60
    
    if (mins >= 60) {
      const hours = Math.floor(mins / 60)
      const remainingMins = mins % 60
      return `${hours}h ${remainingMins}m`
    }
    
    return `${mins}m ${secs}s`
  }

  // Calculate sleep quality score (0-100)
  const deepSleepPercentage = (deepSleepMinutes / totalDuration) * 100
  const restlessPercentage = (restlessMinutes / totalDuration) * 100
  
  // Good sleep: high deep sleep, low restless
  const sleepScore = Math.round(
    (deepSleepPercentage * 0.7) + 
    ((100 - restlessPercentage) * 0.3)
  )

  const getSleepQuality = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "text-purple-400" }
    if (score >= 60) return { label: "Good", color: "text-blue-400" }
    if (score >= 40) return { label: "Fair", color: "text-yellow-400" }
    return { label: "Poor", color: "text-red-400" }
  }

  const quality = getSleepQuality(sleepScore)

  // Generate insights
  const getInsights = () => {
    const insights = []
    
    // Deep sleep insights
    if (deepSleepPercentage >= 60) {
      insights.push({ type: "positive", text: "Great deep sleep duration! Your body is recovering well." })
    } else if (deepSleepPercentage >= 40 && deepSleepPercentage < 60) {
      insights.push({ type: "warning", text: "Moderate deep sleep. Aim for more restorative rest." })
    } else if (deepSleepPercentage > 0) {
      insights.push({ type: "warning", text: "Low deep sleep. Try reducing screen time before bed." })
    }
    
    // Restlessness insights - only add if there was restlessness
    if (restlessPercentage > 30) {
      insights.push({ type: "warning", text: "High restlessness detected. Consider improving sleep environment." })
    } else if (restlessPercentage > 10 && restlessPercentage <= 30) {
      insights.push({ type: "warning", text: "Moderate restlessness. Try to minimize disturbances during sleep." })
    } else if (restlessPercentage > 0 && restlessPercentage <= 10) {
      insights.push({ type: "positive", text: "Low restlessness - you slept peacefully!" })
    } else if (restlessPercentage === 0) {
      insights.push({ type: "positive", text: "No restlessness detected - excellent sleep stability!" })
    }
    
    // Duration insights
    const totalHours = totalDuration / 3600
    if (totalHours < 6) {
      insights.push({ type: "warning", text: "Sleep duration is below recommended 7-9 hours." })
    } else if (totalHours >= 7 && totalHours <= 9) {
      insights.push({ type: "positive", text: "Sleep duration is within the optimal range!" })
    } else if (totalHours > 9) {
      insights.push({ type: "warning", text: "Sleep duration exceeds 9 hours. Oversleeping may indicate other issues." })
    }
    
    return insights
  }

  const insights = getInsights()

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 lg:p-12 max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="text-center space-y-6 sm:space-y-8">
        <div className="flex justify-center">
          <div className="rounded-full bg-purple-500/10 p-4 sm:p-6">
            <Moon className="h-8 w-8 sm:h-12 sm:w-12 text-purple-400" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Sleep Analysis Complete!</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Total Sleep Time: {formatMinutes(totalDuration)}
          </p>
        </div>

        {/* Sleep Quality Score */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl border-2 border-purple-500/50 bg-purple-500/10">
          <div className="text-center">
            <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-2">
              Sleep Quality Score
            </div>
            <div className={`text-5xl sm:text-6xl md:text-7xl font-bold ${quality.color} mb-2`}>
              {sleepScore}
            </div>
            <div className={`text-xl sm:text-2xl font-semibold ${quality.color}`}>
              {quality.label}
            </div>
          </div>
        </div>

        {/* Sleep Phases Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-4">
          {/* Deep Sleep */}
          <div className="glass-card p-4 sm:p-6 rounded-2xl border border-border/50">
            <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-2">
              Deep Sleep
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-purple-400">
              {formatMinutes(deepSleepMinutes)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {totalDuration > 0 ? ((deepSleepMinutes / totalDuration) * 100).toFixed(0) : 0}%
            </div>
            <div className="text-xs text-purple-400 mt-2">
              Restorative
            </div>
          </div>

          {/* Light Sleep */}
          <div className="glass-card p-4 sm:p-6 rounded-2xl border border-border/50">
            <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-2">
              Light Sleep
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-400">
              {formatMinutes(lightSleepMinutes)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {totalDuration > 0 ? ((lightSleepMinutes / totalDuration) * 100).toFixed(0) : 0}%
            </div>
            <div className="text-xs text-blue-400 mt-2">
              Transitional
            </div>
          </div>

          {/* Restless */}
          <div className="glass-card p-4 sm:p-6 rounded-2xl border border-border/50">
            <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-2">
              Restless
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-yellow-400">
              {formatMinutes(restlessMinutes)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {totalDuration > 0 ? ((restlessMinutes / totalDuration) * 100).toFixed(0) : 0}%
            </div>
            <div className="text-xs text-yellow-400 mt-2">
              Disturbed
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="text-left space-y-3 pt-4">
          <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Insights & Recommendations
          </div>
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-4 rounded-xl ${
                insight.type === "positive" 
                  ? "bg-purple-500/10 border border-purple-500/30" 
                  : "bg-yellow-500/10 border border-yellow-500/30"
              }`}
            >
              {insight.type === "positive" ? (
                <CheckCircle2 className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              )}
              <p className="text-sm text-foreground">{insight.text}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4">
          <Button
            size="lg"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full border-purple-500/50 hover:bg-purple-500/10"
          >
            Close Summary
          </Button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Moon, Square } from "lucide-react"

interface SleepTimerProps {
  active: boolean
  seconds: number
  currentActivity: string
  onStop: () => void
}

export function SleepTimer({ active, seconds, currentActivity, onStop }: SleepTimerProps) {
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    
    if (hours > 0) {
      return `${hours}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getSleepQuality = (activity: string) => {
    if (activity.toLowerCase().includes("idle")) {
      return { label: "Deep Sleep", color: "text-purple-400" }
    }
    if (activity.toLowerCase().includes("walking")) {
      return { label: "Light Sleep", color: "text-blue-400" }
    }
    if (activity.toLowerCase().includes("running")) {
      return { label: "Restless", color: "text-yellow-400" }
    }
    return { label: "Analyzing...", color: "text-muted-foreground" }
  }

  const quality = getSleepQuality(currentActivity)

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center">
        <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3">
          Sleep Duration
        </div>
        <div className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight font-mono tabular-nums">
          {formatTime(seconds)}
        </div>
      </div>

      {currentActivity && currentActivity !== "—" && currentActivity !== "Collecting data..." && (
        <div className="text-center">
          <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3">
            Current State
          </div>
          <div className={`text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight ${quality.color}`}>
            {quality.label}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground mt-2">
            Based on movement patterns
          </div>
        </div>
      )}
      
      {(!currentActivity || currentActivity === "—" || currentActivity === "Collecting data...") && (
        <div className="text-center">
          <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3">
            Current State
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-muted-foreground animate-pulse">
            Collecting data...
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground mt-2">
            Building sensor buffer...
          </div>
        </div>
      )}

      <div className="flex items-center justify-center">
        <Button
          variant="outline"
          size="lg"
          onClick={onStop}
          disabled={!active}
          className="w-full sm:w-auto rounded-full px-6 sm:px-8 py-4 sm:py-5 bg-transparent border-purple-500/50 hover:bg-purple-500/10"
        >
          <Square className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Stop Sleep Analysis
        </Button>
      </div>

      <div className="glass-card rounded-2xl p-4 sm:p-6 text-center">
        <p className="text-xs sm:text-sm text-muted-foreground">
          <Moon className="h-4 w-4 inline mr-2" />
          Sleep tracking in progress. Keep your device nearby while you sleep.
        </p>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Pause, RotateCcw } from "lucide-react"

interface SessionTimerProps {
  active: boolean
  seconds: number
  currentActivity: string
  onStop: () => void
}

export function SessionTimer({ active, seconds, currentActivity, onStop }: SessionTimerProps) {
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getActivityColor = (activity: string) => {
    if (activity.toLowerCase().includes("idle")) return "text-idle"
    if (activity.toLowerCase().includes("walking")) return "text-walking"
    if (activity.toLowerCase().includes("running")) return "text-running"
    return "text-muted-foreground"
  }

  const handleStop = () => {
    onStop()
  }

  const handleReset = () => {
    // Reset will be handled by parent component
    onStop()
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3">
          Session Duration
        </div>
        <div className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight font-mono tabular-nums">
          {formatTime(seconds)}
        </div>
      </div>

      {currentActivity && currentActivity !== "—" && (
        <div>
          <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3">
            Current Activity
          </div>
          <div className={`text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight ${getActivityColor(currentActivity)}`}>
            {currentActivity}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handleStop}
          disabled={!active}
          className="w-full sm:w-auto rounded-full px-6 sm:px-8 py-4 sm:py-5 bg-transparent"
        >
          <Pause className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Stop Session
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={handleReset}
          className="w-full sm:w-auto rounded-full px-6 sm:px-8 py-4 sm:py-5 bg-transparent"
        >
          <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  )
}

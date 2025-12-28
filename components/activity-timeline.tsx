"use client"

import { Circle } from "lucide-react"

type ActivityType = "Idle" | "Walking" | "Running"

interface Activity {
  id: number
  type: ActivityType
  timestamp: string
  elapsed: number
}

interface ActivityTimelineProps {
  activities: Activity[]
  currentActivity: string
}

const activityColors: Record<ActivityType, string> = {
  Idle: "text-idle",
  Walking: "text-walking",
  Running: "text-running",
}

export function ActivityTimeline({ activities, currentActivity }: ActivityTimelineProps) {
  const formatElapsed = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 lg:p-12 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Live Activity Feed</h3>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs sm:text-sm text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Current Activity Display */}
      {currentActivity && currentActivity !== "—" && currentActivity !== "Collecting data..." && (
        <div className="mb-6 p-4 sm:p-6 rounded-xl bg-primary/10 border border-primary/20">
          <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-2">
            Current Activity
          </div>
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold">
            {currentActivity}
          </div>
        </div>
      )}

      {/* <div className="space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-2">
        {activities.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm sm:text-base">Waiting for activity data...</p>
            <p className="text-xs sm:text-sm mt-2">ESP32 is collecting sensor data and will classify activities every 5 seconds.</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-secondary/50 backdrop-blur-sm transition-all duration-300 hover:bg-secondary/70 animate-in fade-in slide-in-from-top-2"
            >
              <Circle className={`h-3 w-3 sm:h-4 sm:w-4 fill-current ${activityColors[activity.type]}`} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <span className={`font-semibold text-sm sm:text-base ${activityColors[activity.type]}`}>
                    {activity.type}
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground">{activity.timestamp}</span>
                </div>
              </div>
              <div className="text-xs sm:text-sm font-mono text-muted-foreground tabular-nums">
                {formatElapsed(activity.elapsed)}
              </div>
            </div>
          ))
        )}
      </div> */}
    </div>
  )
}

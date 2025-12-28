"use client"

import { Button } from "@/components/ui/button"
import { Zap, CheckCircle2, Play, Loader2, AlertCircle } from "lucide-react"
import { SessionTimer } from "@/components/session-timer"
import { ActivityTimeline } from "@/components/activity-timeline"

interface ConnectSectionProps {
  connected: boolean
  connecting: boolean
  connectionError: string | null
  sessionActive: boolean
  sessionElapsed: number
  currentActivity: string
  activities: Array<{
    id: number
    type: "Idle" | "Walking" | "Running"
    timestamp: string
    elapsed: number
  }>
  onConnect: () => void
  onStartSession: () => void
  onStopSession: () => void
  onDisconnect: () => void
}

export function ConnectSection({
  connected,
  connecting,
  connectionError,
  sessionActive,
  sessionElapsed,
  currentActivity,
  activities,
  onConnect,
  onStartSession,
  onStopSession,
  onDisconnect,
}: ConnectSectionProps) {
  return (
    <section id="dashboard" className="pb-16 sm:pb-24 space-y-8 sm:space-y-12">
      {!connected && !connecting ? (
        <div className="glass-card rounded-3xl p-8 sm:p-12 lg:p-16 max-w-2xl mx-auto text-center space-y-6 sm:space-y-8 animate-in fade-in duration-500">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-4 sm:p-6">
              <Zap className="h-8 w-8 sm:h-12 sm:w-12 text-primary" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">Ready to track your fitness?</h2>

          <p className="text-sm sm:text-base text-muted-foreground text-pretty">
            Connect with Fitlytics to start monitoring your activity in real-time via ESP32.
          </p>

          {connectionError && (
            <div className="flex items-center justify-center gap-2 text-destructive bg-destructive/10 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{connectionError}</span>
            </div>
          )}

          <Button
            size="lg"
            onClick={onConnect}
            className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-300 hover:scale-105"
          >
            Connect with Fitlytics
          </Button>
        </div>
      ) : connecting ? (
        <div className="glass-card rounded-3xl p-8 sm:p-12 lg:p-16 max-w-2xl mx-auto text-center space-y-6 sm:space-y-8 animate-in fade-in duration-500">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-4 sm:p-6">
              <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 text-primary animate-spin" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">Connecting to ESP32...</h2>

          <p className="text-sm sm:text-base text-muted-foreground text-pretty">
            Please wait while we establish connection with your device.
          </p>
        </div>
      ) : connected && !sessionActive ? (
        <div className="glass-card rounded-3xl p-8 sm:p-12 lg:p-16 max-w-2xl mx-auto text-center space-y-6 sm:space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
            <span className="text-base sm:text-lg font-semibold text-accent">ESP32 Connection Established</span>
          </div>

          <div className="flex justify-center">
            <div className="rounded-full bg-accent/10 p-4 sm:p-6">
              <Play className="h-8 w-8 sm:h-12 sm:w-12 text-accent" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">Ready to begin?</h2>

          <p className="text-sm sm:text-base text-muted-foreground text-pretty">
            Start your fitness session to track your activities in real-time.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button
              size="lg"
              onClick={onStartSession}
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold transition-all duration-300 hover:scale-105"
            >
              <Play className="h-5 w-5 mr-2" />
              Start Fitness Session
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onDisconnect}
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full"
            >
              Disconnect
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8 sm:space-y-12 animate-in fade-in duration-700">
          <div className="glass-card rounded-3xl p-6 sm:p-8 lg:p-12 max-w-2xl mx-auto text-center space-y-4 sm:space-y-6">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
              <span className="text-base sm:text-lg font-semibold text-accent">Session Active</span>
            </div>

            <SessionTimer 
              active={sessionActive} 
              seconds={sessionElapsed}
              currentActivity={currentActivity}
              onStop={onStopSession}
            />
          </div>

          <ActivityTimeline activities={activities} currentActivity={currentActivity} />
        </div>
      )}
    </section>
  )
}

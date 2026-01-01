"use client"

import { useState, useEffect, useRef } from "react"
import { Moon, Calendar, Award, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SleepTimer } from "@/components/sleep-timer"
import { SleepSummary } from "@/components/sleep-summary"

interface SleepAnalysisSectionProps {
  connected: boolean
  currentActivity: string
  onSleepModeChange: (sleepMode: boolean) => void
}

export function SleepAnalysisSection({ connected, currentActivity, onSleepModeChange }: SleepAnalysisSectionProps) {
  const [sleepActive, setSleepActive] = useState(false)
  const [sleepElapsed, setSleepElapsed] = useState(0)
  const [showSleepSummary, setShowSleepSummary] = useState(false)
  const [sleepPhases, setSleepPhases] = useState({
    deepSleep: 0,     // Idle
    lightSleep: 0,    // Walking
    restless: 0,      // Running
  })
  
  const lastSleepActivityRef = useRef<string>("")
  const sleepActivityStartTimeRef = useRef<number>(0)

  // Sleep timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (sleepActive) {
      interval = setInterval(() => {
        setSleepElapsed((e) => e + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [sleepActive])

  // Track sleep phases based on current activity
  useEffect(() => {
    if (!sleepActive || !currentActivity || currentActivity === "—" || currentActivity === "Collecting data...") {
      return
    }

    console.log(`👤 Sleep tracking: Current activity = ${currentActivity}`)

    const now = Date.now()
    
    if (!lastSleepActivityRef.current) {
      lastSleepActivityRef.current = currentActivity
      sleepActivityStartTimeRef.current = now
      console.log(`🏁 Started tracking: ${currentActivity}`)
    } else if (lastSleepActivityRef.current !== currentActivity && sleepActivityStartTimeRef.current > 0) {
      const duration = (now - sleepActivityStartTimeRef.current) / 1000
      
      console.log(`🔄 Activity changed from ${lastSleepActivityRef.current} to ${currentActivity}. Duration: ${duration.toFixed(2)}s`)
      
      if (lastSleepActivityRef.current.toLowerCase().includes("idle")) {
        setSleepPhases(prev => {
          const updated = { ...prev, deepSleep: prev.deepSleep + duration }
          console.log(`👤 Deep Sleep: ${updated.deepSleep.toFixed(2)}s`)
          return updated
        })
      } else if (lastSleepActivityRef.current.toLowerCase().includes("walking")) {
        setSleepPhases(prev => {
          const updated = { ...prev, lightSleep: prev.lightSleep + duration }
          console.log(`💤 Light Sleep: ${updated.lightSleep.toFixed(2)}s`)
          return updated
        })
      } else if (lastSleepActivityRef.current.toLowerCase().includes("running")) {
        setSleepPhases(prev => {
          const updated = { ...prev, restless: prev.restless + duration }
          console.log(`⚡ Restless: ${updated.restless.toFixed(2)}s`)
          return updated
        })
      }
      
      lastSleepActivityRef.current = currentActivity
      sleepActivityStartTimeRef.current = now
    }
  }, [currentActivity, sleepActive])

  const handleStartSleepAnalysis = () => {
    if (!connected) {
      return
    }
    
    console.log("🌙 ============ STARTING SLEEP ANALYSIS ============")
    setSleepActive(true)
    setSleepElapsed(0)
    setSleepPhases({ deepSleep: 0, lightSleep: 0, restless: 0 })
    setShowSleepSummary(false)
    lastSleepActivityRef.current = ""
    sleepActivityStartTimeRef.current = 0
    
    // Enable sleep mode for more sensitive thresholds
    onSleepModeChange(true)
    console.log("🌙 Sleep mode ENABLED - Using sensitive thresholds")
    console.log("📊 Waiting for activity detection...")
  }

  const handleStopSleepAnalysis = () => {
    console.log("🛑 ============ STOPPING SLEEP ANALYSIS ============")
    
    // Calculate final phase duration
    if (lastSleepActivityRef.current && sleepActivityStartTimeRef.current > 0) {
      const now = Date.now()
      const duration = (now - sleepActivityStartTimeRef.current) / 1000
      
      console.log(`📊 Final activity: ${lastSleepActivityRef.current}, Duration: ${duration.toFixed(2)}s`)
      
      if (lastSleepActivityRef.current.toLowerCase().includes("idle")) {
        setSleepPhases(prev => {
          const updated = { ...prev, deepSleep: prev.deepSleep + duration }
          console.log(`👤 Final Deep Sleep: ${updated.deepSleep.toFixed(2)}s`)
          return updated
        })
      } else if (lastSleepActivityRef.current.toLowerCase().includes("walking")) {
        setSleepPhases(prev => {
          const updated = { ...prev, lightSleep: prev.lightSleep + duration }
          console.log(`💤 Final Light Sleep: ${updated.lightSleep.toFixed(2)}s`)
          return updated
        })
      } else if (lastSleepActivityRef.current.toLowerCase().includes("running")) {
        setSleepPhases(prev => {
          const updated = { ...prev, restless: prev.restless + duration }
          console.log(`⚡ Final Restless: ${updated.restless.toFixed(2)}s`)
          return updated
        })
      }
    } else {
      console.warn("⚠️ No activity was tracked during sleep session!")
    }
    
    setSleepActive(false)
    setShowSleepSummary(true)
    
    // Disable sleep mode
    onSleepModeChange(false)
    console.log("☀️ Sleep mode DISABLED - Using standard thresholds")
  }

  const handleCloseSleepSummary = () => {
    setShowSleepSummary(false)
    onSleepModeChange(false)
  }

  const features = [
    {
      icon: Moon,
      title: "Sleep Duration Tracking",
      description: "Monitor your total sleep time and understand your sleep patterns across days, weeks, and months.",
      gradient: "from-purple-500/20 to-blue-500/20",
      iconColor: "text-purple-400",
    },
    {
      icon: Sparkles,
      title: "Sleep Quality Insights",
      description: "Analyze deep sleep, light sleep, and REM cycles to understand how well you're truly resting.",
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-400",
    },
    {
      icon: Calendar,
      title: "Sleep Consistency Trends",
      description: "Track your sleep schedule consistency and identify patterns that impact your daily performance.",
      gradient: "from-cyan-500/20 to-teal-500/20",
      iconColor: "text-cyan-400",
    },
    {
      icon: Award,
      title: "Recovery & Readiness Score",
      description: "Get personalized insights on your recovery status and readiness for the day ahead based on sleep quality.",
      gradient: "from-teal-500/20 to-green-500/20",
      iconColor: "text-teal-400",
    },
  ]

  return (
    <section id="sleep-analysis" className="pb-16 sm:pb-24 lg:pb-32">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 sm:space-y-6 mb-12 sm:mb-16">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-purple-500/10 p-3 sm:p-4 animate-pulse">
              <Moon className="h-8 w-8 sm:h-10 sm:w-10 text-purple-400" />
            </div>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Sleep Analysis
          </h2>
          
          <p className="text-lg sm:text-xl md:text-2xl text-accent font-medium">
            Analyze your sleep effectively
          </p>
          
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
            Fitlytics helps you understand and improve your sleep through comprehensive analytics. 
            Track sleep duration, quality, and patterns to optimize your recovery and daily performance. 
            Gain insights into deep sleep phases, light sleep cycles, consistency trends, and overall readiness.
          </p>
        </div>

        {/* Sleep Tracking Interface */}
        {!sleepActive && !showSleepSummary ? (
          <div className="glass-card rounded-3xl p-8 sm:p-12 lg:p-16 max-w-2xl mx-auto text-center space-y-6 sm:space-y-8 mb-12 sm:mb-16 animate-in fade-in duration-500">
            {!connected ? (
              <>
                <div className="flex justify-center">
                  <div className="rounded-full bg-yellow-500/10 p-4 sm:p-6">
                    <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-yellow-500" />
                  </div>
                </div>

                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">
                  Connect to Fitlytics First
                </h3>

                <p className="text-sm sm:text-base text-muted-foreground text-pretty">
                  Please connect your ESP32 device before starting sleep analysis. 
                  Scroll up to the "Ready to track your fitness?" section to connect.
                </p>

                <Button
                  size="lg"
                  disabled
                  className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full bg-purple-500 hover:bg-purple-600 text-white font-semibold opacity-50 cursor-not-allowed"
                >
                  <Moon className="h-5 w-5 mr-2" />
                  Start Sleep Analysis
                </Button>
              </>
            ) : (
              <>
                <div className="flex justify-center">
                  <div className="rounded-full bg-purple-500/10 p-4 sm:p-6">
                    <CheckCircle2 className="h-8 w-8 sm:h-12 sm:w-12 text-purple-400" />
                  </div>
                </div>

                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance">
                  Ready for Sleep Analysis
                </h3>

                <p className="text-sm sm:text-base text-muted-foreground text-pretty">
                  Start tracking your sleep patterns. Keep your ESP32 device nearby to monitor 
                  movement and detect deep sleep, light sleep, and restlessness throughout the night.
                </p>

                <Button
                  size="lg"
                  onClick={handleStartSleepAnalysis}
                  className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full bg-purple-500 hover:bg-purple-600 text-white font-semibold transition-all duration-300 hover:scale-105"
                >
                  <Moon className="h-5 w-5 mr-2" />
                  Start Sleep Analysis
                </Button>

                <div className="glass-card rounded-2xl p-4 text-xs sm:text-sm text-muted-foreground">
                  <p>
                    💡 <span className="font-semibold">Tip:</span> Place your device on the mattress near your pillow 
                    for best results. Movement patterns will be analyzed to determine sleep quality.
                  </p>
                </div>
              </>
            )}
          </div>
        ) : sleepActive ? (
          <div className="glass-card rounded-3xl p-6 sm:p-8 lg:p-12 max-w-2xl mx-auto text-center space-y-4 sm:space-y-6 mb-12 sm:mb-16 animate-in fade-in duration-700">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
              <span className="text-base sm:text-lg font-semibold text-purple-400">Sleep Analysis Active</span>
            </div>

            <SleepTimer 
              active={sleepActive} 
              seconds={sleepElapsed}
              currentActivity={currentActivity}
              onStop={handleStopSleepAnalysis}
            />
          </div>
        ) : (
          showSleepSummary && (
            <div className="mb-12 sm:mb-16">
              <SleepSummary
                deepSleepMinutes={sleepPhases.deepSleep}
                lightSleepMinutes={sleepPhases.lightSleep}
                restlessMinutes={sleepPhases.restless}
                totalDuration={sleepElapsed}
                onClose={handleCloseSleepSummary}
              />
            </div>
          )
        )}

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="glass-card rounded-2xl p-6 sm:p-8 hover:scale-[1.02] transition-all duration-300 group"
              >
                <div className={`rounded-2xl bg-gradient-to-br ${feature.gradient} p-6 mb-6 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-background/20" />
                  <Icon className={`h-10 w-10 sm:h-12 sm:w-12 ${feature.iconColor} relative z-10 group-hover:scale-110 transition-transform duration-300`} />
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 sm:mt-16 text-center">
          <div className="glass-card rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto">
            <p className="text-sm sm:text-base text-muted-foreground">
              <span className="font-semibold text-foreground">Pro Tip:</span> Quality sleep is just as important as exercise. 
              Combined with activity tracking, sleep analysis provides a complete picture of your health and fitness journey.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

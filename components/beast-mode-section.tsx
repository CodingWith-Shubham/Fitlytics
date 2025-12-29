"use client"

import { Button } from "@/components/ui/button"
import { Flame, Zap, TrendingUp, Trophy, ArrowUp, MoveVertical, Activity, Timer, Wind, Target, Smartphone } from "lucide-react"

export function BeastModeSection() {
  const exercises = [
    {
      name: "Push-ups",
      icon: ArrowUp,
      description: "Upper body strength",
    },
    {
      name: "Squats",
      icon: MoveVertical,
      description: "Lower body power",
    },
    {
      name: "Sit-ups",
      icon: Activity,
      description: "Core strength",
    },
    {
      name: "Planks",
      icon: Timer,
      description: "Core stability",
    },
    {
      name: "Lunges",
      icon: Wind,
      description: "Leg endurance",
    },
    {
      name: "Jumping Jacks",
      icon: Target,
      description: "Cardio blast",
    },
  ]

  const activityScores = [
    {
      level: "Bad",
      color: "from-gray-600 to-gray-700",
      borderColor: "border-gray-600/50",
      textColor: "text-gray-400",
      glow: "shadow-gray-600/20",
    },
    {
      level: "Normal",
      color: "from-yellow-600 to-yellow-700",
      borderColor: "border-yellow-600/50",
      textColor: "text-yellow-400",
      glow: "shadow-yellow-600/20",
    },
    {
      level: "Good",
      color: "from-green-600 to-green-700",
      borderColor: "border-green-600/50",
      textColor: "text-green-400",
      glow: "shadow-green-600/20",
    },
    {
      level: "Beast",
      color: "from-red-600 via-orange-600 to-yellow-600",
      borderColor: "border-red-600/50",
      textColor: "text-red-400",
      glow: "shadow-red-600/40",
    },
  ]

  return (
    <section id="beast-mode" className="pb-16 sm:pb-24 lg:pb-32">
      <div className="max-w-6xl mx-auto">
        {/* Header with Background Video */}
        <div className="relative overflow-hidden rounded-3xl mb-12 sm:mb-16">
          {/* Background Video Layer - Only in header */}
          <div className="absolute inset-0 -z-10">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover opacity-95 pointer-events-none"
              aria-hidden="true"
            >
              <source
                src="https://res.cloudinary.com/ddjxsqetl/video/upload/v1766903830/Beast_Mode_Fitness_Video_Generation_echxej.mp4"
                type="video/mp4"
              />
            </video>
            
            {/* Dark gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background pointer-events-none" />
          </div>

          <div className="text-center space-y-4 sm:space-y-6 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 relative z-10">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-gradient-to-r from-red-600/20 via-orange-600/20 to-yellow-600/20 p-3 sm:p-4 relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 opacity-20 blur-xl animate-pulse" />
                <Flame className="h-8 w-8 sm:h-10 sm:w-10 text-red-500 relative z-10" />
              </div>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Beast Mode
            </h2>
            
            <p className="text-lg sm:text-xl md:text-2xl text-red-400 font-semibold">
              Train harder. Move better. Unleash the beast.
            </p>
            
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
              Beast Mode is an advanced exercise tracking feature powered by real-time motion analysis. 
              Perfect your form in high-intensity bodyweight workouts with intelligent feedback. 
              Track your performance, improve your technique, and earn your Beast status.
            </p>
          </div>
        </div>

        {/* Activity Score Display */}
        <div className="mb-12 sm:mb-16">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-bold mb-2 flex items-center justify-center gap-2">
              <Trophy className="h-6 w-6 text-orange-500" />
              Performance Scoring
            </h3>
            <p className="text-sm text-muted-foreground">
              Real-time form analysis based on movement quality
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {activityScores.map((score, index) => (
              <div
                key={index}
                className={`glass-card rounded-2xl p-6 border-2 ${score.borderColor} bg-gradient-to-br ${score.color} bg-opacity-10 hover:scale-105 transition-all duration-300 ${score.glow} relative overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 text-center">
                  <div className={`text-2xl sm:text-3xl font-bold ${score.textColor} mb-2`}>
                    {score.level}
                  </div>
                  <div className="h-2 w-full bg-background/50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${score.color} transition-all duration-500`}
                      style={{ width: `${(index + 1) * 25}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exercise Grid */}
        <div className="mb-12 sm:mb-16">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-bold mb-2 flex items-center justify-center gap-2">
              <Zap className="h-6 w-6 text-yellow-500" />
              Supported Exercises
            </h3>
            <p className="text-sm text-muted-foreground">
              Form-aware tracking for high-intensity bodyweight movements
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {exercises.map((exercise, index) => {
              const Icon = exercise.icon
              return (
                <div
                  key={index}
                  className="glass-card rounded-2xl p-6 sm:p-8 hover:scale-105 transition-all duration-300 group cursor-pointer border border-border/50 hover:border-orange-500/50 relative overflow-hidden"
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600/0 via-orange-600/0 to-yellow-600/0 group-hover:from-red-600/10 group-hover:via-orange-600/10 group-hover:to-yellow-600/10 transition-all duration-300" />
                  
                  <div className="relative z-10">
                    <div className="flex justify-center mb-4">
                      <div className="rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 p-4 sm:p-5 transform group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-orange-500" />
                      </div>
                    </div>
                    
                    <h4 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-orange-400 transition-colors text-center">
                      {exercise.name}
                    </h4>
                    
                    <p className="text-xs sm:text-sm text-muted-foreground text-center">
                      {exercise.description}
                    </p>
                  </div>

                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-500/20 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              )
            })}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-12 sm:mb-16">
          <div className="glass-card rounded-3xl p-8 sm:p-12 border border-orange-500/30 bg-gradient-to-br from-red-900/10 via-orange-900/10 to-yellow-900/10">
            <div className="text-center mb-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                <TrendingUp className="h-6 w-6 text-red-500" />
                How Beast Mode Works
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <div className="rounded-full bg-red-500/20 p-4 sm:p-5">
                    <Smartphone className="h-8 w-8 text-red-500" />
                  </div>
                </div>
                <h4 className="font-semibold text-base sm:text-lg">1. Connect Device</h4>
                <p className="text-sm text-muted-foreground">
                  Attach your ESP32 sensor to track movement patterns in real-time
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <div className="rounded-full bg-orange-500/20 p-4 sm:p-5">
                    <Target className="h-8 w-8 text-orange-500" />
                  </div>
                </div>
                <h4 className="font-semibold text-base sm:text-lg">2. Select Exercise</h4>
                <p className="text-sm text-muted-foreground">
                  Choose your workout and start performing with proper form
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <div className="rounded-full bg-yellow-500/20 p-4 sm:p-5">
                    <Zap className="h-8 w-8 text-yellow-500" />
                  </div>
                </div>
                <h4 className="font-semibold text-base sm:text-lg">3. Get Scored</h4>
                <p className="text-sm text-muted-foreground">
                  Receive instant feedback on form quality and performance level
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="glass-card rounded-3xl p-8 sm:p-12 max-w-2xl mx-auto border border-red-500/30 bg-gradient-to-br from-red-900/10 to-orange-900/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 via-orange-600/5 to-yellow-600/5 animate-pulse" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex justify-center">
                <Flame className="h-12 w-12 text-red-500 animate-pulse" />
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-bold">
                Ready to Go Beast Mode?
              </h3>
              
              <p className="text-sm sm:text-base text-muted-foreground">
                Advanced motion tracking and form analysis coming soon. 
                Perfect your technique and dominate your workouts.
              </p>
              
              <Button
                size="lg"
                disabled
                className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-12 py-6 sm:py-7 rounded-full bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 hover:from-red-500 hover:via-orange-500 hover:to-yellow-500 text-white font-bold shadow-lg shadow-red-600/30 opacity-50 cursor-not-allowed"
              >
                <Flame className="h-5 w-5 mr-2" />
                Enter Beast Mode
              </Button>
              
              <p className="text-xs text-muted-foreground">
                Feature in development • Stay tuned for updates
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

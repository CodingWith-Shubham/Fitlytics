"use client"

import { Brain, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FitnessScoreSectionProps {
  connected: boolean
  onPredict: () => void
}

export function FitnessScoreSection({ connected, onPredict }: FitnessScoreSectionProps) {
  return (
    <section className="pb-16 sm:pb-24">
      <div className="glass-card rounded-3xl p-8 sm:p-12">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Icon */}
          <div className="rounded-full bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 p-6">
            <Brain className="h-12 w-12 text-purple-500" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Predict Fitness Score
            </h2>
            <p className="text-sm text-muted-foreground">
              Powered by Fitlytics AI
            </p>
          </div>

          {/* Description */}
          <p className="text-muted-foreground max-w-2xl">
            Get an AI-powered fitness score (0-100) based on your activity data, 
            biometrics, and workout patterns. Our machine learning model analyzes 
            your personalized metrics to provide accurate fitness insights.
          </p>

          {/* Connection Gate */}
          {!connected && (
            <div className="glass-card rounded-2xl p-6 border border-yellow-500/30 bg-yellow-500/5">
              <p className="text-sm text-yellow-500 font-medium">
                ⚠️ Connect ESP32 to enable fitness prediction
              </p>
            </div>
          )}

          {/* CTA Button */}
          <Button
            size="lg"
            onClick={onPredict}
            disabled={!connected}
            className="text-lg px-8 py-6 rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-500 hover:via-blue-500 hover:to-cyan-500 text-white font-bold shadow-lg shadow-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            Predict Fitness Score
          </Button>

          {connected && (
            <p className="text-xs text-muted-foreground">
              Fill in your activity details to get your personalized fitness score
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

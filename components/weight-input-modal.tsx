"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Scale } from "lucide-react"

interface WeightInputModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (weight: number) => void
}

export function WeightInputModal({ isOpen, onClose, onSubmit }: WeightInputModalProps) {
  const [weight, setWeight] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (isOpen) {
      setWeight("")
      setError("")
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const weightNum = parseFloat(weight)
    
    if (!weight || isNaN(weightNum) || weightNum <= 0) {
      setError("Please enter a valid weight")
      return
    }
    
    if (weightNum < 20 || weightNum > 300) {
      setError("Please enter a realistic weight (20-300 kg)")
      return
    }
    
    onSubmit(weightNum)
    onClose()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setWeight(value)
    setError("")
  }

  const handleClose = () => {
    setWeight("")
    setError("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full animate-in zoom-in duration-300 shadow-2xl border border-border/50">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-accent/10 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-yellow-500/10 p-4">
              <Scale className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Enter Your Weight</h2>
          <p className="text-sm text-muted-foreground">
            We'll use this to calculate your calories burned
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={handleChange}
                placeholder="70"
                autoFocus
                className={`w-full px-6 py-4 text-center text-3xl font-bold rounded-2xl bg-background/50 border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 ${
                  error 
                    ? "border-red-500/50 focus:border-red-500" 
                    : "border-border/50 focus:border-yellow-500"
                }`}
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-semibold text-muted-foreground">
                kg
              </div>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-500 text-center animate-in fade-in duration-200">
                {error}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="w-full sm:w-1/2 rounded-full py-6 text-base"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-1/2 rounded-full py-6 text-base bg-yellow-500 hover:bg-yellow-600 text-black font-semibold transition-all duration-300 hover:scale-105"
            >
              Calculate Calories
            </Button>
          </div>
        </form>

        {/* Quick suggestions */}
        <div className="mt-6 pt-6 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center mb-3">Quick select:</p>
          <div className="flex gap-2 justify-center flex-wrap">
            {[50, 60, 70, 80, 90, 100].map((suggestedWeight) => (
              <button
                key={suggestedWeight}
                type="button"
                onClick={() => setWeight(suggestedWeight.toString())}
                className="px-4 py-2 rounded-full text-sm font-medium bg-accent/10 hover:bg-accent/20 transition-colors border border-border/30"
              >
                {suggestedWeight} kg
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

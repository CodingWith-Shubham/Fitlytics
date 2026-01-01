"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Activity, Menu, X } from "lucide-react"

interface NavbarProps {
  connected: boolean
}

export function Navbar({ connected }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-card shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Fitlytics</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#home" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </a>
            <a href="#dashboard" className="text-sm font-medium transition-colors hover:text-primary">
              Dashboard
            </a>
            <a href="#sleep-analysis" className="text-sm font-medium transition-colors hover:text-primary">
              Sleep
            </a>
            <a href="#beast-mode" className="text-sm font-medium transition-colors hover:text-primary">
              Beast Mode
            </a>
            <Link href="/documentation" className="text-sm font-medium transition-colors hover:text-primary">
              Documentation
            </Link>
            <a href="/documentation" className="text-sm font-medium transition-colors hover:text-primary">
              About
            </a>
          </div>

          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2 rounded-full bg-secondary/50 px-3 py-1.5 text-sm">
              <div className={`h-2 w-2 rounded-full ${connected ? 'bg-accent' : 'bg-destructive'} animate-pulse`} />
              <span className="hidden sm:inline">{connected ? 'Connected' : 'Disconnected'}</span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <div className="relative w-6 h-6">
                <Menu
                  className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${
                    mobileMenuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
                  }`}
                />
                <X
                  className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${
                    mobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 space-y-3 border-t border-border/50 mt-2">
            <a
              href="#home"
              onClick={closeMobileMenu}
              className="block px-4 py-2 text-base font-medium transition-colors hover:text-primary hover:bg-secondary/30 rounded-lg"
            >
              Home
            </a>
            <a
              href="#dashboard"
              onClick={closeMobileMenu}
              className="block px-4 py-2 text-base font-medium transition-colors hover:text-primary hover:bg-secondary/30 rounded-lg"
            >
              Dashboard
            </a>
            <a
              href="#sleep-analysis"
              onClick={closeMobileMenu}
              className="block px-4 py-2 text-base font-medium transition-colors hover:text-primary hover:bg-secondary/30 rounded-lg"
            >
              Sleep
            </a>
            <a
              href="#beast-mode"
              onClick={closeMobileMenu}
              className="block px-4 py-2 text-base font-medium transition-colors hover:text-primary hover:bg-secondary/30 rounded-lg"
            >
              Beast Mode
            </a>
            <Link
              href="/documentation"
              onClick={closeMobileMenu}
              className="block px-4 py-2 text-base font-medium transition-colors hover:text-primary hover:bg-secondary/30 rounded-lg"
            >
              Documentation
            </Link>
            <a
              href="#about"
              onClick={closeMobileMenu}
              className="block px-4 py-2 text-base font-medium transition-colors hover:text-primary hover:bg-secondary/30 rounded-lg"
            >
              About
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}

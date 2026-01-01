import Link from "next/link";
import { Heart, Github, Linkedin, FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Documentation Button */}
        <div className="flex justify-center mb-12">
          <Link 
            href="/documentation"
            className="group relative inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <FileText className="w-6 h-6 relative z-10" />
            <span className="relative z-10">View Full Documentation</span>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
              <div className="absolute inset-0 bg-white animate-pulse" />
            </div>
          </Link>
        </div>

        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
          {/* Made with Heart */}
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-white/70">Made with</span>
            <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
            <span className="text-white font-semibold">by Shubham Mamgain</span>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-6">
            <a
              href="https://github.com/CodingWith-Shubham/Fitlytics"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300"
            >
              <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors duration-300">
                <Github className="w-5 h-5" />
              </div>
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <a
              href="https://linkedin.com/in/shubham-mamgain-843248147/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300"
            >
              <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors duration-300">
                <Linkedin className="w-5 h-5" />
              </div>
              <span className="hidden sm:inline">LinkedIn</span>
            </a>
          </div>

          {/* Copyright */}
          <div className="text-white/50 text-sm text-center md:text-right">
            © {new Date().getFullYear()} Fitlytics. All rights reserved.
          </div>
        </div>

        {/* Tagline */}
        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-white/60 text-sm italic">
            "Fitness intelligence built with sensors, math, thresholds, and machine learning—each used only where it makes sense."
          </p>
        </div>
      </div>
    </footer>
  );
}

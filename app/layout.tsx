import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Fitlytics",
  description: "Smart fitness analytics platform that visualizes human activity in real time",
  generator: "v0.app",
  icons: {
    icon: "/fitlyticsicon.jpg",
    apple: "/fitlyticsicon.jpg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}

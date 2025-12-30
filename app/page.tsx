"use client";
import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { ConnectSection } from "@/components/connect-section";
import { SessionSummary } from "@/components/session-summary";
import { WeightInputModal } from "@/components/weight-input-modal";
import { SleepAnalysisSection } from "@/components/sleep-analysis-section";
import { BeastModeSection } from "@/components/beast-mode-section";
import { BeastModeTrainer } from "@/components/beast-mode-trainer";

export default function Home() {
  const [activity, setActivity] = useState<string>("—");
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [sensorData, setSensorData] = useState<any>(null);
  const [autoPredictEnabled, setAutoPredictEnabled] = useState(true);
  const [sessionActive, setSessionActive] = useState(false);
  const [activities, setActivities] = useState<Array<{
    id: number;
    type: "Idle" | "Walking" | "Running";
    timestamp: string;
    elapsed: number;
  }>>([]);
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [activityDurations, setActivityDurations] = useState({
    Idle: 0,
    Walking: 0,
    Running: 0,
  });
  const [calculatedCalories, setCalculatedCalories] = useState<number | null>(null);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showBeastMode, setShowBeastMode] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const lastActivityRef = useRef<string>("");
  const activityStartTimeRef = useRef<number>(0);
  
  // Sliding window buffer for 2-second analysis
  const sensorBuffer = useRef<Array<{ timestamp: number; data: any }>>([]);
  const WINDOW_SIZE_MS = 2000; // 2 seconds

  // Session elapsed timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (sessionActive) {
      interval = setInterval(() => {
        setSessionElapsed((e) => e + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionActive]);

  // ESP32 WebSocket Connection - Managed by handleConnect function
  // No auto-connection on mount

  // Auto-predict every 5 seconds
  useEffect(() => {
    if (!autoPredictEnabled || !connected || !sensorData || !sessionActive) {
      return;
    }

    const interval = setInterval(() => {
      predict();
    }, 5000);

    // Initial prediction
    predict();

    return () => clearInterval(interval);
  }, [autoPredictEnabled, connected, sensorData, sessionActive]);

  function classifyActivity(): string {
    // Need sufficient samples in the window (minimum 10 samples for reliable classification)
    if (sensorBuffer.current.length < 10) {
      return "Collecting data...";
    }
    
    // Calculate gyroscope magnitude for all samples in the 2-second window
    const gyroMagnitudes = sensorBuffer.current.map(sample => {
      const { gx, gy, gz } = sample.data;
      return Math.sqrt(gx * gx + gy * gy + gz * gz);
    });
    
    // Calculate statistics over the window
    const avgGyroMag = gyroMagnitudes.reduce((a, b) => a + b, 0) / gyroMagnitudes.length;
    const maxGyroMag = Math.max(...gyroMagnitudes);
    const minGyroMag = Math.min(...gyroMagnitudes);
    
    // Rule-based classification using windowed gyro_mag (HIGHEST DIFFERENTIATING FACTOR)
    // Thresholds based on statistical analysis of recorded sensor data
    // Idle: ~2500, Walking: ~8332, Running: ~25196
    const IDLE_THRESHOLD = 5500;      // Idle avg: 2500, Walking avg: 8332
    const WALKING_THRESHOLD = 16000;  // Walking avg: 8332, Running avg: 25196
    
    // console.log(`Window [${sensorBuffer.current.length} samples]: AvgGyro=${avgGyroMag.toFixed(2)}, Max=${maxGyroMag.toFixed(2)}, Min=${minGyroMag.toFixed(2)}`);
    
    // Use average for stable classification
    if (avgGyroMag < IDLE_THRESHOLD) {
      return "Idle";
    } else if (avgGyroMag < WALKING_THRESHOLD) {
      return "Walking";
    } else {
      return "Running";
    }
  }

  async function predict() {
    if (!sensorData || loading) {
      return;
    }

    setLoading(true);

    try {
      // Use rule-based classification with 2-second sliding window
      const detectedActivity = classifyActivity();
      
      if (detectedActivity !== "Collecting data...") {
        // Track activity duration changes
        const now = Date.now();
        
        // If this is the first activity or activity changed
        if (!lastActivityRef.current) {
          // First activity detection - start tracking
          lastActivityRef.current = detectedActivity;
          activityStartTimeRef.current = now;
        } else if (lastActivityRef.current !== detectedActivity && activityStartTimeRef.current > 0) {
          // Activity changed - record duration of previous activity
          const duration = (now - activityStartTimeRef.current) / 1000; // in seconds
          const activityType = lastActivityRef.current as "Idle" | "Walking" | "Running";
          setActivityDurations(prev => ({
            ...prev,
            [activityType]: prev[activityType] + duration
          }));
          
          // Start tracking new activity
          lastActivityRef.current = detectedActivity;
          activityStartTimeRef.current = now;
        }
        
        setActivity(detectedActivity);
        
        // Add to activities timeline
        const newActivity = {
          id: Date.now(),
          type: detectedActivity as "Idle" | "Walking" | "Running",
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          elapsed: sessionElapsed
        };
        
        setActivities((prev) => [newActivity, ...prev].slice(0, 10));
        // console.log(`Classified as: ${detectedActivity}`);
      }
    } catch (error) {
      console.error("Classification error:", error);
      setActivity("Error");
    } finally {
      setLoading(false);
    }
  }

  const handleConnect = () => {
    setConnecting(true);
    setConnectionError(null);
    
    // Connect to ESP32 WebSocket
    const ws = new WebSocket("ws://192.168.31.95:81");
    
    ws.onopen = () => {
      console.log("✅ Connected to ESP32");
      setConnected(true);
      setConnecting(false);
      setConnectionError(null);
    };

    ws.onmessage = (event) => {
      try {
        // Parse CSV format: timestamp,ax,ay,az,gx,gy,gz,temp
        const values = event.data.split(",");
        if (values.length >= 8) {
          const data = {
            ax: parseFloat(values[1]),
            ay: parseFloat(values[2]),
            az: parseFloat(values[3]),
            gx: parseFloat(values[4]),
            gy: parseFloat(values[5]),
            gz: parseFloat(values[6]),
            temp: parseFloat(values[7])
          };
          
          // Add to sliding window buffer with timestamp
          const now = Date.now();
          sensorBuffer.current.push({ timestamp: now, data });
          
          // Remove old samples outside 2-second window
          sensorBuffer.current = sensorBuffer.current.filter(
            sample => now - sample.timestamp <= WINDOW_SIZE_MS
          );
          
          // console.log(`Buffer size: ${sensorBuffer.current.length} samples`);
          setSensorData(data);
        }
      } catch (e) {
        console.error("Failed to parse sensor data:", e);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionError("Failed to connect to ESP32. Please check if the device is powered on and accessible.");
      setConnecting(false);
      setConnected(false);
    };

    ws.onclose = () => {
      console.log("❌ Disconnected from ESP32");
      if (connected) {
        setConnectionError("Connection lost to ESP32");
      }
      setConnected(false);
      setSessionActive(false);
    };

    wsRef.current = ws;
    
    // Timeout for connection attempt
    setTimeout(() => {
      if (connecting && !connected) {
        ws.close();
        setConnecting(false);
        setConnectionError("Connection timeout. Please check ESP32 IP address and network.");
      }
    }, 10000); // 10 second timeout
  };

  const handleStartSession = () => {
    setSessionActive(true);
    setSessionElapsed(0);
    setActivities([]);
    setActivity("—");
    setShowSummary(false);
    setActivityDurations({ Idle: 0, Walking: 0, Running: 0 });
    lastActivityRef.current = "";
    activityStartTimeRef.current = 0;
  };

  const handleStopSession = () => {
    // Calculate final activity duration
    if (lastActivityRef.current && activityStartTimeRef.current > 0) {
      const now = Date.now();
      const duration = (now - activityStartTimeRef.current) / 1000;
      const activityType = lastActivityRef.current as "Idle" | "Walking" | "Running";
      setActivityDurations(prev => ({
        ...prev,
        [activityType]: prev[activityType] + duration
      }));
    }
    
    setSessionActive(false);
    setShowSummary(true);
  };

  const handleCloseSummary = () => {
    setShowSummary(false);
    setCalculatedCalories(null);
  };

  const handlePredictCalories = () => {
    setShowWeightModal(true);
  };

  const handleWeightSubmit = (weight: number) => {
    // MET values for each activity
    const MET_VALUES = {
      Idle: 1.2,
      Walking: 3.3,
      Running: 8.0,
    };
    
    // Calculate calories for each activity
    // Formula: Calories = METs × Weight (kg) × Time (hours)
    const idleCalories = MET_VALUES.Idle * weight * (activityDurations.Idle / 3600);
    const walkingCalories = MET_VALUES.Walking * weight * (activityDurations.Walking / 3600);
    const runningCalories = MET_VALUES.Running * weight * (activityDurations.Running / 3600);
    
    const totalCalories = idleCalories + walkingCalories + runningCalories;
    
    setCalculatedCalories(totalCalories);
  };

  const handleDisconnect = () => {
    setSessionActive(false);
    if (wsRef.current) {
      wsRef.current.close();
    }
    setConnected(false);
    setConnectionError(null);
    sensorBuffer.current = [];
    setSensorData(null);
  };

  const handleEnterBeastMode = () => {
    if (!connected) {
      // Show connection prompt
      alert("Please connect to Fitlytics first to start Beast Mode training.");
      return;
    }
    setShowBeastMode(true);
  };

  const handleCloseBeastMode = () => {
    setShowBeastMode(false);
  };

  return (
    <main className="min-h-screen">
      <div className="gradient-bg fixed inset-0 -z-10" />
      <Navbar connected={connected} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <HeroSection />
        <ConnectSection 
          connected={connected}
          connecting={connecting}
          connectionError={connectionError}
          sessionActive={sessionActive}
          sessionElapsed={sessionElapsed}
          currentActivity={activity}
          activities={activities}
          onConnect={handleConnect}
          onStartSession={handleStartSession}
          onStopSession={handleStopSession}
          onDisconnect={handleDisconnect}
        />
        
      
        
        {showSummary && (
          <div className="pb-16 sm:pb-24">
            <SessionSummary
              idleMinutes={activityDurations.Idle}
              walkingMinutes={activityDurations.Walking}
              runningMinutes={activityDurations.Running}
              totalDuration={sessionElapsed}
              calculatedCalories={calculatedCalories}
              onClose={handleCloseSummary}
              onPredictCalories={handlePredictCalories}
            />
          </div>
        )}
      </div>
      
      <WeightInputModal 
        isOpen={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        onSubmit={handleWeightSubmit}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SleepAnalysisSection 
          connected={connected}
          currentActivity={activity}
        />
        
        <BeastModeSection 
          connected={connected}
          onEnterBeastMode={handleEnterBeastMode}
        />
      </div>
      
      {showBeastMode && (
        <BeastModeTrainer
          sensorData={sensorData}
          onClose={handleCloseBeastMode}
        />
      )}
    </main>
  );
}
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
import { FitnessScoreSection } from "@/components/fitness-score-section";
import { FitnessPredictionModal } from "@/components/fitness-prediction-modal";

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
  const [showFitnessPrediction, setShowFitnessPrediction] = useState(false);
  const [sleepMode, setSleepMode] = useState(false);
  
  const bleDeviceRef = useRef<BluetoothDevice | null>(null);
  const bleCharacteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
  const lastActivityRef = useRef<string>("");
  const activityStartTimeRef = useRef<number>(0);
  
  // Sliding window buffer for 2-second analysis
  const sensorBuffer = useRef<Array<{ timestamp: number; data: any }>>([]);
  const WINDOW_SIZE_MS = 2000; // 2 seconds
  
  // BLE UUIDs
  const BLE_SERVICE_UUID = "12345678-1234-1234-1234-1234567890ab";
  const BLE_CHARACTERISTIC_UUID = "abcd1234-5678-1234-5678-abcdef123456";

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

  // Cleanup BLE connection on unmount
  useEffect(() => {
    return () => {
      if (bleDeviceRef.current?.gatt?.connected) {
        bleDeviceRef.current.gatt.disconnect();
      }
    };
  }, []);

  // Auto-predict every 5 seconds
  useEffect(() => {
    if (!autoPredictEnabled || !connected || !sensorData || (!sessionActive && !sleepMode)) {
      return;
    }

    const interval = setInterval(() => {
      predict();
    }, 5000);

    // Initial prediction
    predict();

    return () => clearInterval(interval);
  }, [autoPredictEnabled, connected, sensorData, sessionActive, sleepMode]);

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
    
    // Use different thresholds for sleep mode (much more sensitive to movement)
    let IDLE_THRESHOLD, WALKING_THRESHOLD;
    
    if (sleepMode) {
      // Sleep mode: VERY sensitive thresholds
      // Deep Sleep (still) < 1000
      // Light Sleep (tiny movements) 1000-3000  
      // Restless (any significant movement) > 3000
      IDLE_THRESHOLD = 1000;
      WALKING_THRESHOLD = 3000;
      console.log(`😴 SLEEP MODE - AvgGyro: ${avgGyroMag.toFixed(2)}, Max: ${maxGyroMag.toFixed(2)}`);
    } else {
      // Activity mode: Standard thresholds
      // Idle: ~2500, Walking: ~8332, Running: ~25196
      IDLE_THRESHOLD = 5500;
      WALKING_THRESHOLD = 16000;
      console.log(`🏃 ACTIVITY MODE - AvgGyro: ${avgGyroMag.toFixed(2)}, Max: ${maxGyroMag.toFixed(2)}`);
    }
    
    // Use average for stable classification
    if (avgGyroMag < IDLE_THRESHOLD) {
      console.log(`✅ Classified as: Idle (avgGyro: ${avgGyroMag.toFixed(2)} < ${IDLE_THRESHOLD})`);
      return "Idle";
    } else if (avgGyroMag < WALKING_THRESHOLD) {
      console.log(`✅ Classified as: Walking (avgGyro: ${avgGyroMag.toFixed(2)} < ${WALKING_THRESHOLD})`);
      return "Walking";
    } else {
      console.log(`✅ Classified as: Running (avgGyro: ${avgGyroMag.toFixed(2)} >= ${WALKING_THRESHOLD})`);
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

  const handleConnect = async () => {
    setConnecting(true);
    setConnectionError(null);
    
    try {
      // Check if Web Bluetooth is supported
      if (!navigator.bluetooth) {
        throw new Error("Web Bluetooth is not supported in this browser. Please use Chrome, Edge, or Opera.");
      }

      console.log("🔍 Requesting Bluetooth device...");
      
      // Request Bluetooth device with Fitlytics-BLE service
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { name: "Fitlytics-BLE" }
        ],
        optionalServices: [BLE_SERVICE_UUID]
      });
      
      console.log("📱 Device selected:", device.name);
      bleDeviceRef.current = device;
      
      // Listen for disconnect events
      device.addEventListener('gattserverdisconnected', handleBleDisconnect);
      
      // Connect to GATT server
      console.log("🔗 Connecting to GATT server...");
      const server = await device.gatt!.connect();
      
      // Get the service
      console.log("🔍 Getting service...");
      const service = await server.getPrimaryService(BLE_SERVICE_UUID);
      
      // Get the characteristic
      console.log("🔍 Getting characteristic...");
      const characteristic = await service.getCharacteristic(BLE_CHARACTERISTIC_UUID);
      bleCharacteristicRef.current = characteristic;
      
      // Subscribe to notifications
      console.log("📡 Starting notifications...");
      await characteristic.startNotifications();
      
      // Handle incoming data
      characteristic.addEventListener('characteristicvaluechanged', handleBleData);
      
      console.log("✅ Connected to Fitlytics-BLE");
      setConnected(true);
      setConnecting(false);
      setConnectionError(null);
      
    } catch (error: any) {
      console.error("❌ BLE connection error:", error);
      let errorMessage = "Failed to connect to Fitlytics-BLE. ";
      
      if (error.name === 'NotFoundError') {
        errorMessage += "Device not found. Please ensure ESP32 is powered on and advertising.";
      } else if (error.name === 'SecurityError') {
        errorMessage += "Bluetooth access denied. Please allow Bluetooth permissions.";
      } else if (error.name === 'NotSupportedError') {
        errorMessage += "Web Bluetooth is not supported in this browser.";
      } else {
        errorMessage += error.message || "Unknown error occurred.";
      }
      
      setConnectionError(errorMessage);
      setConnecting(false);
      setConnected(false);
    }
  };

  const handleBleData = (event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    
    if (!value) return;
    
    try {
      // Decode the CSV string from the characteristic value
      const decoder = new TextDecoder('utf-8');
      const csvString = decoder.decode(value);
      
      // Parse CSV format: timestamp,ax,ay,az,gx,gy,gz,temp
      const values = csvString.split(",");
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
        
        setSensorData(data);
        
        // Log gyro magnitude for debugging
        const gyroMag = Math.sqrt(data.gx * data.gx + data.gy * data.gy + data.gz * data.gz);
        console.log(`📡 BLE Data - Gyro: [${data.gx}, ${data.gy}, ${data.gz}] | Magnitude: ${gyroMag.toFixed(2)}`);
      }
    } catch (e) {
      console.error("Failed to parse BLE sensor data:", e);
    }
  };

  const handleBleDisconnect = () => {
    console.log("❌ Disconnected from Fitlytics-BLE");
    if (connected) {
      setConnectionError("Connection lost to Fitlytics-BLE");
    }
    setConnected(false);
    setSessionActive(false);
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
    
    // Stop BLE notifications and disconnect
    if (bleCharacteristicRef.current) {
      bleCharacteristicRef.current.stopNotifications().catch(err => {
        console.error("Error stopping notifications:", err);
      });
      bleCharacteristicRef.current.removeEventListener('characteristicvaluechanged', handleBleData);
      bleCharacteristicRef.current = null;
    }
    
    if (bleDeviceRef.current?.gatt?.connected) {
      bleDeviceRef.current.removeEventListener('gattserverdisconnected', handleBleDisconnect);
      bleDeviceRef.current.gatt.disconnect();
      bleDeviceRef.current = null;
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

  const handleOpenFitnessPrediction = () => {
    if (!connected) {
      // Show connection prompt
      alert("Please connect to Fitlytics first to predict your fitness score.");
      return;
    }
    setShowFitnessPrediction(true);
  };

  const handleCloseFitnessPrediction = () => {
    setShowFitnessPrediction(false);
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
          onSleepModeChange={setSleepMode}
        />
        
        <BeastModeSection 
          connected={connected}
          onEnterBeastMode={handleEnterBeastMode}
        />
        
        <FitnessScoreSection 
          connected={connected}
          onPredict={handleOpenFitnessPrediction}
        />
      </div>
      
      {showBeastMode && (
        <BeastModeTrainer
          sensorData={sensorData}
          onClose={handleCloseBeastMode}
        />
      )}
      
      {showFitnessPrediction && (
        <FitnessPredictionModal
          isOpen={showFitnessPrediction}
          onClose={handleCloseFitnessPrediction}
          connected={connected}
        />
      )}
    </main>
  );
}
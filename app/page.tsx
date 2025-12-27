"use client";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [activity, setActivity] = useState<string>("—");
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [sensorData, setSensorData] = useState<any>(null);
  const [autoPredictEnabled, setAutoPredictEnabled] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  
  // Sliding window buffer for 2-second analysis
  const sensorBuffer = useRef<Array<{ timestamp: number; data: any }>>([]);
  const WINDOW_SIZE_MS = 2000; // 2 seconds

  useEffect(() => {
    // Connect to ESP32 WebSocket
    const ws = new WebSocket("ws://192.168.31.95:81");
    
    ws.onopen = () => {
      console.log("✅ Connected to ESP32");
      setConnected(true);
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
          
          console.log(`Buffer size: ${sensorBuffer.current.length} samples`);
          setSensorData(data);
        }
      } catch (e) {
        console.error("Failed to parse sensor data:", e);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnected(false);
    };

    ws.onclose = () => {
      console.log("❌ Disconnected from ESP32");
      setConnected(false);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  // Auto-predict every 5 seconds
  useEffect(() => {
    if (!autoPredictEnabled || !connected || !sensorData) {
      return;
    }

    const interval = setInterval(() => {
      predict();
    }, 5000);

    // Initial prediction
    predict();

    return () => clearInterval(interval);
  }, [autoPredictEnabled, connected, sensorData]);

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
    
    console.log(`Window [${sensorBuffer.current.length} samples]: AvgGyro=${avgGyroMag.toFixed(2)}, Max=${maxGyroMag.toFixed(2)}, Min=${minGyroMag.toFixed(2)}`);
    
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
      setActivity(detectedActivity);
      console.log(`Classified as: ${detectedActivity}`);
    } catch (error) {
      console.error("Classification error:", error);
      setActivity("Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Fitlytics – Activity Prediction</h1>

      <div style={{ marginBottom: 20 }}>
        <p>
          ESP32 Status:{" "}
          <span style={{ color: connected ? "green" : "red", fontWeight: "bold" }}>
            {connected ? "🟢 Connected" : "🔴 Disconnected"}
          </span>
        </p>
        
        <div style={{ marginTop: 10 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={autoPredictEnabled}
              onChange={(e) => setAutoPredictEnabled(e.target.checked)}
            />
            <span>Auto-predict every 5 seconds</span>
          </label>
        </div>

        {sensorData && (
          <details style={{ marginTop: 10 }}>
            <summary style={{ cursor: "pointer" }}>Latest Sensor Data</summary>
            <pre style={{ background: "#f4f4f4", padding: 10, borderRadius: 5 }}>
              {JSON.stringify(sensorData, null, 2)}
            </pre>
          </details>
        )}
      </div>

      <button 
        onClick={predict} 
        disabled={loading || !connected || !sensorData}
        style={{
          padding: "10px 20px",
          fontSize: 16,
          cursor: loading || !connected || !sensorData ? "not-allowed" : "pointer",
          opacity: loading || !connected || !sensorData ? 0.5 : 1
        }}
      >
        {loading ? "Predicting..." : "Predict Now (Manual)"}
      </button>

      <h2 style={{ marginTop: 20 }}>
        Current Activity: <span style={{ fontWeight: "bold", color: "#0070f3", fontSize: 28 }}>{activity}</span>
      </h2>
      
      {loading && <p style={{ color: "#666", fontSize: 14 }}>⏳ Analyzing...</p>}
    </main>
  );
}

"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Documentation() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="gradient-bg fixed inset-0 -z-10" />
      
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>

      {/* Documentation Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
        <article className="prose prose-invert prose-lg max-w-none">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-8">
            Fitlytics Documentation
          </h1>

          {/* Hero Image */}
          <div className="mb-12 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-500/20">
            <img 
              src="https://res.cloudinary.com/ddjxsqetl/image/upload/v1767251462/fitnessbandimage_jrx1r5.jpg"
              alt="Fitlytics Fitness Band"
              className="w-full h-auto object-cover"
            />
          </div>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">1. Introduction</h2>
            <p className="text-white/80 leading-relaxed">
              Fitlytics is a hybrid fitness intelligence platform that combines wearable hardware, signal processing, rule-based systems, and machine learning to deliver transparent, explainable, and realistic fitness insights.
            </p>
            <p className="text-white/80 leading-relaxed mt-4">
              A core design principle of Fitlytics is <strong className="text-purple-400">"use ML only where it is truly needed"</strong>. Wherever human physiology and motion patterns can be reliably interpreted using thresholds and domain logic, Fitlytics intentionally avoids black-box AI.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">2. Dataset Creation (Foundation of Fitlytics)</h2>
            
            <h3 className="text-2xl font-semibold text-white/90 mb-3">2.1 Why Dataset Creation Was Necessary</h3>
            <p className="text-white/80 leading-relaxed">Before building any logic or models, a custom dataset was created because:</p>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li>Public datasets do not reflect wrist-mounted MPU6050 motion patterns accurately</li>
              <li>Exercise form, sleep movement, and real-life noise vary heavily by person</li>
              <li>Thresholds must be derived from real sensor statistics, not assumptions</li>
            </ul>

            <h3 className="text-2xl font-semibold text-white/90 mb-3 mt-6">2.2 Hardware Used for Dataset Collection</h3>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li>ESP32 DevKit V1</li>
              <li>MPU6050 (Accelerometer + Gyroscope)</li>
              <li>Wrist-mounted orientation</li>
            </ul>

            <h3 className="text-2xl font-semibold text-white/90 mb-3 mt-6">2.3 Data Collection Process</h3>
            <p className="text-white/80 leading-relaxed">Raw sensor values recorded for:</p>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li>ax, ay, az</li>
              <li>gx, gy, gz</li>
              <li>temperature</li>
              <li>timestamp</li>
            </ul>
            <p className="text-white/80 leading-relaxed mt-4">
              Data streamed via Serial / WebSocket. Separate CSV files recorded per activity and per experiment.
            </p>

            <h3 className="text-2xl font-semibold text-white/90 mb-3 mt-6">2.4 Derived Metrics</h3>
            <p className="text-white/80 leading-relaxed">From raw data, the following were computed:</p>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li>Acceleration magnitude (acc_mag)</li>
              <li>Gyroscope magnitude (gyro_mag)</li>
              <li>Variance, mean, min, max per sliding window</li>
            </ul>
            <p className="text-white/80 leading-relaxed mt-4">
              These derived metrics form the backbone of all rule-based systems.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">3. Rule-Based Activity Detection (Idle, Walking, Running)</h2>
            
            <h3 className="text-2xl font-semibold text-white/90 mb-3">3.1 Design Choice</h3>
            <p className="text-white/80 leading-relaxed">
              Idle, walking, and running are <strong className="text-pink-400">not ML-based</strong> in Fitlytics.
            </p>
            <p className="text-white/80 leading-relaxed mt-4">
              <strong>Reason:</strong> These activities show very clear magnitude separation. Rule-based thresholds are faster, deterministic, and explainable.
            </p>

            <h3 className="text-2xl font-semibold text-white/90 mb-3 mt-6">3.2 Logic Used</h3>
            <p className="text-white/80 leading-relaxed">
              Activity classification is done using acceleration magnitude thresholds:
            </p>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li><strong>Idle:</strong> very low acc_mag variance</li>
              <li><strong>Walking:</strong> moderate periodic acc_mag</li>
              <li><strong>Running:</strong> high periodic acc_mag</li>
            </ul>
            <p className="text-white/80 leading-relaxed mt-4">
              Thresholds were chosen after analyzing quartiles (Q1, median, Q3) from the collected dataset.
            </p>

            <h3 className="text-2xl font-semibold text-white/90 mb-3 mt-6">3.3 Benefits</h3>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li>Zero model inference latency</li>
              <li>Works offline</li>
              <li>Easy to tune per user or per device</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">4. Sleep Analysis System (No AI)</h2>
            
            <h3 className="text-2xl font-semibold text-white/90 mb-3">4.1 Objective</h3>
            <p className="text-white/80 leading-relaxed">
              Analyze sleep quality using <strong className="text-blue-400">hand movement only</strong>, without heart rate or AI models.
            </p>

            <h3 className="text-2xl font-semibold text-white/90 mb-3 mt-6">4.2 Sleep Stages Detected</h3>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li>Deep Sleep</li>
              <li>Light Sleep</li>
              <li>Restless Sleep</li>
            </ul>

            <h3 className="text-2xl font-semibold text-white/90 mb-3 mt-6">4.3 Methodology</h3>
            <p className="text-white/80 leading-relaxed">Sleep stages are inferred using:</p>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li>Gyroscope variance</li>
              <li>Micro-movement frequency</li>
              <li>Duration of stillness windows</li>
            </ul>

            <h3 className="text-2xl font-semibold text-white/90 mb-3 mt-6">4.4 Threshold Logic</h3>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li><strong>Deep Sleep:</strong> near-zero gyro variance for long continuous windows</li>
              <li><strong>Light Sleep:</strong> occasional movement with low variance</li>
              <li><strong>Restless Sleep:</strong> frequent spikes in gyro magnitude</li>
            </ul>

            <h3 className="text-2xl font-semibold text-white/90 mb-3 mt-6">4.5 Output</h3>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li>Sleep stage timeline</li>
              <li>Sleep quality score</li>
              <li>Personalized recommendations</li>
            </ul>
            <p className="text-white/80 leading-relaxed mt-4">
              No machine learning is used to avoid false medical claims.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">5. Beast Mode – Exercise Form Evaluation System</h2>
            
            <h3 className="text-2xl font-semibold text-white/90 mb-3">5.1 Overview</h3>
            <p className="text-white/80 leading-relaxed">
              Beast Mode is a <strong className="text-purple-400">purely rule-based, form-aware exercise trainer</strong> that evaluates how well an exercise is performed, not just whether it was performed.
            </p>

            <h3 className="text-2xl font-semibold text-white/90 mb-3 mt-6">5.2 Supported Exercises</h3>
            <ol className="list-decimal list-inside text-white/80 space-y-2 ml-4">
              <li>Jumping Jacks</li>
              <li>Shadow Boxing</li>
              <li>Arm Raises</li>
              <li>Plank</li>
            </ol>

            <h3 className="text-2xl font-semibold text-white/90 mb-3 mt-6">5.3 Dataset Collection for Beast Mode</h3>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li>Exercises performed manually by the developer</li>
              <li>Multiple repetitions recorded</li>
              <li>Separate datasets per exercise</li>
              <li>Quartile-based threshold extraction</li>
            </ul>

            <h3 className="text-2xl font-semibold text-white/90 mb-3 mt-6">5.4 Form Scoring System</h3>
            <p className="text-white/80 leading-relaxed">
              Form quality is scored on a 0–100 scale and mapped to:
            </p>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li><strong>Bad</strong> (&lt; 40)</li>
              <li><strong>Good</strong> (40–70)</li>
              <li><strong>Beast</strong> (70+)</li>
            </ul>

            <h3 className="text-2xl font-semibold text-white/90 mb-3 mt-6">5.5 Core Metrics Used</h3>
            
            <h4 className="text-xl font-semibold text-white/80 mb-2 mt-4">Range of Motion (ROM)</h4>
            <div className="bg-white/5 p-4 rounded-lg font-mono text-sm text-purple-300">
              ROM = max(acc_mag) − min(acc_mag)
            </div>

            <h4 className="text-xl font-semibold text-white/80 mb-2 mt-4">Stability</h4>
            <div className="bg-white/5 p-4 rounded-lg font-mono text-sm text-purple-300">
              stability = 1 / (1 + log10(1 + variance(gyro_mag)))
            </div>

            <h4 className="text-xl font-semibold text-white/80 mb-2 mt-4">Tempo / Control</h4>
            <p className="text-white/80 leading-relaxed">
              Measured using peak-to-peak consistency in acceleration signals.
            </p>

            <h3 className="text-2xl font-semibold text-white/90 mb-3 mt-6">5.6 Scoring Formula</h3>
            <div className="bg-white/5 p-4 rounded-lg font-mono text-sm text-purple-300">
              numericScore = <br />
              &nbsp;&nbsp;0.4 × ROM_score + <br />
              &nbsp;&nbsp;0.4 × Stability_score + <br />
              &nbsp;&nbsp;0.2 × Tempo_score
            </div>

            <h3 className="text-2xl font-semibold text-white/90 mb-3 mt-6">5.7 Exercise-Specific Thresholds</h3>
            
            <h4 className="text-xl font-semibold text-white/80 mb-2 mt-4">Jumping Jacks</h4>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li>High periodic acceleration</li>
              <li>ROM ≥ Q3 → Beast</li>
            </ul>

            <h4 className="text-xl font-semibold text-white/80 mb-2 mt-4">Shadow Boxing</h4>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li>Explosive gyro peaks</li>
              <li>Controlled recovery required</li>
            </ul>

            <h4 className="text-xl font-semibold text-white/80 mb-2 mt-4">Arm Raises</h4>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li>Smooth angular motion</li>
              <li>Low gyro variance</li>
            </ul>

            <h4 className="text-xl font-semibold text-white/80 mb-2 mt-4">Plank</h4>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li>Near-zero movement</li>
              <li>Stability dominates score</li>
            </ul>

            <h3 className="text-2xl font-semibold text-white/90 mb-3 mt-6">5.8 Real-Time Evaluation</h3>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li>Sliding window: 4–5 seconds</li>
              <li>Minimum samples: 15</li>
              <li>Evaluation frequency: 1 Hz</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">6. Fitness Score Prediction (AI + Rules)</h2>
            
            <h3 className="text-2xl font-semibold text-white/90 mb-3">6.1 Why ML Is Used Here</h3>
            <p className="text-white/80 leading-relaxed">Fitness score is:</p>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li>Long-term</li>
              <li>Multi-factor</li>
              <li>Non-linearly dependent on features</li>
            </ul>
            <p className="text-white/80 leading-relaxed mt-4">
              This makes ML suitable <strong className="text-pink-400">only at this stage</strong>.
            </p>

            <h3 className="text-2xl font-semibold text-white/90 mb-3 mt-6">6.2 Dataset Used</h3>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li>Health and fitness dataset</li>
              <li>Target: fitness_level (normalized to 0–100)</li>
            </ul>

            <h3 className="text-2xl font-semibold text-white/90 mb-3 mt-6">6.3 Feature Engineering</h3>
            <p className="text-white/80 leading-relaxed">Derived features:</p>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li>steps_per_min</li>
              <li>calories_per_min</li>
              <li>hr_efficiency</li>
              <li>recovery_score</li>
              <li>workload</li>
              <li>activity_calorie_score</li>
              <li>age_adjusted_calories</li>
            </ul>

            <h3 className="text-2xl font-semibold text-white/90 mb-3 mt-6">6.4 Model Training</h3>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li>LightGBM Regressor</li>
              <li>Stratified K-Fold (on binned target)</li>
              <li>Optuna hyperparameter tuning</li>
              <li>GPU acceleration</li>
            </ul>
            <p className="text-white/80 leading-relaxed mt-4">
              Baseline Dummy MAE used for sanity check.
            </p>

            <h3 className="text-2xl font-semibold text-white/90 mb-3 mt-6">6.5 Backend Calibration Layer</h3>
            <p className="text-white/80 leading-relaxed">
              Raw model output is never shown directly.
            </p>
            <p className="text-white/80 leading-relaxed mt-4">Post-processing includes:</p>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li>Sigmoid squashing to 0–100</li>
              <li>Rule-based penalties (sleep, steps, duration, BMI, HR)</li>
              <li>Hard clamping</li>
            </ul>
            <p className="text-white/80 leading-relaxed mt-4">
              This prevents unrealistic scores.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">7. Backend Architecture</h2>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li>FastAPI</li>
              <li>Joblib model loading</li>
              <li>Feature validation</li>
              <li>JSON-based inference</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">8. Frontend Architecture</h2>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li>Next.js</li>
              <li>TypeScript</li>
              <li>Tailwind CSS</li>
              <li>WebSocket / Bluetooth integration</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">9. Design Philosophy</h2>
            <ol className="list-decimal list-inside text-white/80 space-y-2 ml-4">
              <li>Thresholds before ML</li>
              <li>ML only where unavoidable</li>
              <li>Scores must be explainable</li>
              <li>No medical claims</li>
              <li>Edge-first mindset</li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">10. Limitations</h2>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li>Wrist-only sensing</li>
              <li>No medical-grade accuracy</li>
              <li>Limited activity classes</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">11. Future Roadmap</h2>
            <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
              <li>TinyML on ESP32</li>
              <li>Rep counting</li>
              <li>Personalized thresholds</li>
              <li>Multi-sensor fusion</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">12. Conclusion</h2>
            <p className="text-white/80 leading-relaxed">
              Fitlytics is intentionally engineered to teach, not hide logic.
            </p>
            <p className="text-white/80 leading-relaxed mt-4">
              It demonstrates how real-world fitness intelligence can be built using sensors, math, thresholds, and machine learning—each used only where it makes sense.
            </p>
          </section>

          {/* Back to Top */}
          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:scale-105 transition-transform duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}

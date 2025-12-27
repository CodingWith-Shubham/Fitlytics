import serial
import time

PORT = "COM8"        # 🔴 change this
BAUD = 115200
FILENAME = "idle_03.csv"  # 🔴 change per activity

ser = serial.Serial(PORT, BAUD, timeout=1)
time.sleep(2)

print("Recording started... Press CTRL+C to stop")

with open(FILENAME, "w") as f:
    while True:
        try:
            line = ser.readline().decode().strip()
            if line:
                f.write(line + "\n")
                print(line)
        except KeyboardInterrupt:
            print("\nRecording stopped.")
            break

ser.close()

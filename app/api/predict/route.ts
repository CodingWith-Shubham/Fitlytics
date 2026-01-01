import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received data:", body);

    // Forward to Python ML server for fitness score prediction
    console.log("Calling Python server at https://fitlytics-ai.onrender.com/predict");
    const mlRes = await fetch("https://fitlytics-ai.onrender.com/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("Python server response status:", mlRes.status);
    
    if (!mlRes.ok) {
      const errorText = await mlRes.text();
      console.error("Python server error:", errorText);
      return NextResponse.json(
        { error: "ML server error", details: errorText },
        { status: 500 }
      );
    }

    const result = await mlRes.json();
    console.log("Result from Python:", result);
    return NextResponse.json(result);

  } catch (err) {
    console.error("Error in /api/predict:", err);
    return NextResponse.json(
      { error: "Prediction failed", details: String(err) },
      { status: 500 }
    );
  }
}

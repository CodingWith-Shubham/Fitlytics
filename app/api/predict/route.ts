import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received data:", body);

    // Forward to Python ML server
    console.log("Calling Python server at http://127.0.0.1:8000/predict");
    const mlRes = await fetch("http://127.0.0.1:8000/predict", {
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

import { NextRequest, NextResponse } from "next/server";
import { analyzeSwingFrames, detectCameraAngle } from "@/lib/openai";

export const maxDuration = 60; // Maximum 60 seconds for analysis

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { frames, cameraAngle, clubUsed } = body;

    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      return NextResponse.json(
        { error: "No frames provided for analysis" },
        { status: 400 }
      );
    }

    // Detect camera angle if not provided
    let detectedAngle = cameraAngle;
    if (!cameraAngle || cameraAngle === "unknown") {
      try {
        detectedAngle = await detectCameraAngle(frames[0]);
      } catch (e) {
        console.error("Failed to detect camera angle:", e);
        detectedAngle = "unknown";
      }
    }

    // Analyze the swing
    const analysis = await analyzeSwingFrames(
      frames,
      detectedAngle,
      clubUsed || "unknown"
    );

    return NextResponse.json({
      success: true,
      analysis,
      cameraAngle: detectedAngle,
    });
  } catch (error: any) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to analyze swing",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

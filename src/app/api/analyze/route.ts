import { NextRequest, NextResponse } from "next/server";
import { analyzeSwingFrames } from "@/lib/openai";

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

    console.log(`Analyzing ${frames.length} frames...`);

    // Analyze the swing (skip camera angle detection to save time)
    const analysis = await analyzeSwingFrames(
      frames,
      cameraAngle || "unknown",
      clubUsed || "unknown"
    );

    console.log("Analysis complete!");

    return NextResponse.json({
      success: true,
      analysis,
      cameraAngle: cameraAngle || "unknown",
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

"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Share, Download } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VideoUpload } from "@/components/video/video-upload";
import { VideoPlayer } from "@/components/video/video-player";
import { AnalysisProgress } from "@/components/analysis/analysis-progress";
import { AnalysisResults } from "@/components/analysis/analysis-results";
import { useAppStore } from "@/stores/app-store";
import { extractKeyFrames, generateId } from "@/lib/utils";
import type { AnalysisProgress as AnalysisProgressType, SwingAnalysis, Swing } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Stage = "upload" | "options" | "analyzing" | "results";

export default function AnalyzePage() {
  const [stage, setStage] = useState<Stage>("upload");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [cameraAngle, setCameraAngle] = useState<string>("unknown");
  const [clubUsed, setClubUsed] = useState<string>("unknown");
  const [analysis, setAnalysis] = useState<SwingAnalysis | null>(null);
  const [progress, setProgress] = useState<AnalysisProgressType>({
    stage: "uploading",
    progress: 0,
    message: "Preparing your video...",
  });
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const { addSwing, setCurrentSwing } = useAppStore();

  const handleVideoSelect = useCallback((fileOrUrl: File | string) => {
    if (typeof fileOrUrl === "string") {
      setVideoUrl(fileOrUrl);
    } else {
      setVideoFile(fileOrUrl);
      setVideoUrl(URL.createObjectURL(fileOrUrl));
    }
    setStage("options");
  }, []);

  const startAnalysis = async () => {
    setStage("analyzing");
    setError(null);

    try {
      // Stage 1: Uploading / preparing
      setProgress({
        stage: "uploading",
        progress: 10,
        message: "Preparing your video...",
      });

      // Create a hidden video element to extract frames
      const video = document.createElement("video");
      video.src = videoUrl;
      video.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = reject;
      });

      setProgress({
        stage: "uploading",
        progress: 25,
        message: "Video loaded successfully",
      });

      // Stage 2: Extracting key frames
      setProgress({
        stage: "extracting",
        progress: 35,
        message: "Extracting key swing positions...",
      });

      const frames = await extractKeyFrames(video, video.duration);

      setProgress({
        stage: "extracting",
        progress: 50,
        message: `Extracted ${frames.length} key frames`,
      });

      // Stage 3: AI Analysis
      setProgress({
        stage: "analyzing",
        progress: 60,
        message: "AI is analyzing your swing (this may take 20-30 seconds)...",
      });

      console.log(`Sending ${frames.length} frames for analysis...`);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          frames,
          cameraAngle,
          clubUsed,
        }),
      });

      setProgress({
        stage: "analyzing",
        progress: 85,
        message: "Processing results...",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API error:", errorData);
        throw new Error(errorData.error || `Analysis failed (status ${response.status})`);
      }

      const result = await response.json();

      // Create swing record
      const newSwing: Swing = {
        id: generateId(),
        videoUrl,
        cameraAngle: result.cameraAngle || cameraAngle,
        clubUsed,
        durationSeconds: video.duration,
        createdAt: new Date(),
        analysis: result.analysis,
      };

      // Save to store
      addSwing(newSwing);
      setCurrentSwing(newSwing);
      setAnalysis(result.analysis);

      // Stage 4: Complete
      setProgress({
        stage: "complete",
        progress: 100,
        message: "Analysis complete!",
      });

      setTimeout(() => {
        setStage("results");
      }, 1000);
    } catch (err: any) {
      console.error("Analysis error:", err);
      setError(err.message || "Something went wrong. Please try again.");
      setStage("options");
    }
  };

  const resetAnalysis = () => {
    setStage("upload");
    setVideoFile(null);
    setVideoUrl("");
    setCameraAngle("unknown");
    setClubUsed("unknown");
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-14 md:top-0 z-30 bg-background/95 backdrop-blur-lg border-b">
        <div className="flex items-center justify-between h-14 px-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            {stage !== "upload" && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={stage === "results" ? resetAnalysis : () => setStage("upload")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <h1 className="font-bold text-lg">
              {stage === "upload" && "Analyze Swing"}
              {stage === "options" && "Swing Options"}
              {stage === "analyzing" && "Analyzing..."}
              {stage === "results" && "Analysis Results"}
            </h1>
          </div>

          {stage === "results" && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-sm">
                <Share className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon-sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {/* Upload Stage */}
          {stage === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <VideoUpload onVideoSelect={handleVideoSelect} />
            </motion.div>
          )}

          {/* Options Stage */}
          {stage === "options" && (
            <motion.div
              key="options"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 max-w-2xl mx-auto"
            >
              {/* Video Preview */}
              <VideoPlayer src={videoUrl} />

              {/* Options */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Camera Angle
                  </label>
                  <Select value={cameraAngle} onValueChange={setCameraAngle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select camera angle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unknown">Auto-detect</SelectItem>
                      <SelectItem value="dtl">Down the Line</SelectItem>
                      <SelectItem value="face_on">Face On</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Club Used
                  </label>
                  <Select value={clubUsed} onValueChange={setClubUsed}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select club" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unknown">Unknown</SelectItem>
                      <SelectItem value="driver">Driver</SelectItem>
                      <SelectItem value="3-wood">3-Wood</SelectItem>
                      <SelectItem value="5-wood">5-Wood</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="3-iron">3-Iron</SelectItem>
                      <SelectItem value="4-iron">4-Iron</SelectItem>
                      <SelectItem value="5-iron">5-Iron</SelectItem>
                      <SelectItem value="6-iron">6-Iron</SelectItem>
                      <SelectItem value="7-iron">7-Iron</SelectItem>
                      <SelectItem value="8-iron">8-Iron</SelectItem>
                      <SelectItem value="9-iron">9-Iron</SelectItem>
                      <SelectItem value="pw">Pitching Wedge</SelectItem>
                      <SelectItem value="gw">Gap Wedge</SelectItem>
                      <SelectItem value="sw">Sand Wedge</SelectItem>
                      <SelectItem value="lw">Lob Wedge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={resetAnalysis}
                >
                  Choose Different Video
                </Button>
                <Button className="flex-1" size="lg" onClick={startAnalysis}>
                  Analyze Swing
                </Button>
              </div>
            </motion.div>
          )}

          {/* Analyzing Stage */}
          {stage === "analyzing" && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-12"
            >
              <AnalysisProgress progress={progress} />
            </motion.div>
          )}

          {/* Results Stage */}
          {stage === "results" && analysis && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Video with overlays */}
              <div className="max-w-3xl mx-auto">
                <VideoPlayer
                  src={videoUrl}
                  keyFrames={[
                    { name: "address", time: 0 },
                    { name: "takeaway", time: 0.5 },
                    { name: "top", time: 1 },
                    { name: "transition", time: 1.3 },
                    { name: "impact", time: 1.5 },
                    { name: "follow_through", time: 1.8 },
                    { name: "finish", time: 2.2 },
                  ]}
                />
              </div>

              {/* Analysis Results */}
              <AnalysisResults analysis={analysis} />

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center py-6">
                <Button onClick={resetAnalysis}>
                  Analyze Another Swing
                </Button>
                <Link href="/drills">
                  <Button variant="outline">View Recommended Drills</Button>
                </Link>
                <Link href="/history">
                  <Button variant="outline">View History</Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Camera,
  SwitchCamera,
  Circle,
  Square,
  Check,
  RotateCcw,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FullscreenRecorderProps {
  onVideoRecorded: (file: File) => void;
  onClose: () => void;
}

export function FullscreenRecorder({
  onVideoRecorded,
  onClose,
}: FullscreenRecorderProps) {
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize camera
  const initCamera = useCallback(async (facing: "environment" | "user") => {
    try {
      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play();
      }
      setError(null);
    } catch (err: any) {
      console.error("Camera error:", err);
      setError("Could not access camera. Please check permissions.");
    }
  }, [stream]);

  // Initialize on mount
  useEffect(() => {
    initCamera(facingMode);

    // Lock screen orientation on mobile if possible
    if (screen.orientation && "lock" in screen.orientation) {
      (screen.orientation.lock as (orientation: string) => Promise<void>)("landscape").catch(() => {
        // Ignore - not all devices support this
      });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Unlock orientation
      if (screen.orientation && "unlock" in screen.orientation) {
        screen.orientation.unlock();
      }
    };
  }, []);

  // Switch camera
  const switchCamera = () => {
    const newMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);
    initCamera(newMode);
  };

  // Start countdown then record
  const startWithCountdown = () => {
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          startRecording();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start recording
  const startRecording = () => {
    if (!stream) return;

    chunksRef.current = [];

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm",
    });

    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordedBlob(blob);

      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = URL.createObjectURL(blob);
        videoRef.current.play();
      }
    };

    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);

    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Stop camera stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    }
  };

  // Re-record
  const reRecord = () => {
    setRecordedBlob(null);
    setRecordingTime(0);
    initCamera(facingMode);
  };

  // Use recording
  const useRecording = () => {
    if (recordedBlob) {
      const file = new File([recordedBlob], `swing-${Date.now()}.webm`, {
        type: "video/webm",
      });
      onVideoRecorded(file);
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black"
    >
      {/* Video Preview */}
      <video
        ref={videoRef}
        className={cn(
          "absolute inset-0 w-full h-full object-cover",
          facingMode === "user" && "scale-x-[-1]" // Mirror front camera
        )}
        playsInline
        muted={!recordedBlob}
        loop={!!recordedBlob}
        controls={false}
      />

      {/* Countdown Overlay */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50"
          >
            <span className="text-9xl font-bold text-white">{countdown}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-red-500 rounded-full">
          <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
          <span className="text-white font-bold">{formatTime(recordingTime)}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-500/90 rounded-xl text-white">
          {error}
        </div>
      )}

      {/* Top Controls */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
        <Button
          variant="glass"
          size="icon"
          onClick={onClose}
          className="w-12 h-12 rounded-full"
        >
          <X className="w-6 h-6" />
        </Button>

        {!recordedBlob && !isRecording && (
          <Button
            variant="glass"
            size="icon"
            onClick={switchCamera}
            className="w-12 h-12 rounded-full"
          >
            <SwitchCamera className="w-6 h-6" />
          </Button>
        )}
      </div>

      {/* Camera Label */}
      {!recordedBlob && !isRecording && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/50 rounded-full">
          <span className="text-white text-sm">
            {facingMode === "environment" ? "Back Camera" : "Front Camera"}
          </span>
        </div>
      )}

      {/* Grid Overlay for framing */}
      {!recordedBlob && !isRecording && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Rule of thirds grid */}
          <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/20" />
          <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/20" />
          <div className="absolute top-1/3 left-0 right-0 h-px bg-white/20" />
          <div className="absolute top-2/3 left-0 right-0 h-px bg-white/20" />
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-8">
        {/* Before Recording */}
        {!isRecording && !recordedBlob && (
          <>
            <Button
              variant="glass"
              size="icon"
              onClick={startWithCountdown}
              className="w-12 h-12 rounded-full"
            >
              <Timer className="w-6 h-6" />
            </Button>

            <button
              onClick={startRecording}
              className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
              <Circle className="w-16 h-16 text-red-500" fill="currentColor" />
            </button>

            <div className="w-12" /> {/* Spacer */}
          </>
        )}

        {/* While Recording */}
        {isRecording && (
          <button
            onClick={stopRecording}
            className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            <Square className="w-10 h-10 text-red-500" fill="currentColor" />
          </button>
        )}

        {/* After Recording */}
        {recordedBlob && (
          <>
            <Button
              variant="glass"
              size="lg"
              onClick={reRecord}
              className="rounded-full"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Re-record
            </Button>

            <Button
              size="lg"
              onClick={useRecording}
              className="rounded-full bg-green-500 hover:bg-green-600"
            >
              <Check className="w-5 h-5 mr-2" />
              Use Video
            </Button>
          </>
        )}
      </div>

      {/* Tips */}
      {!isRecording && !recordedBlob && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 text-center">
          <p className="text-white/70 text-sm">
            Position camera to capture your full swing
          </p>
        </div>
      )}
    </motion.div>
  );
}

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  SwitchCamera,
  Mic,
  MicOff,
  Settings2,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

interface AutoCaptureCameraProps {
  onVideoRecorded: (file: File) => void;
  onClose: () => void;
}

type CaptureState =
  | "initializing"
  | "waiting_for_golfer"
  | "golfer_detected"
  | "ready_to_capture"
  | "recording"
  | "captured"
  | "error";

// Pose detection status
interface PoseStatus {
  inFrame: boolean;
  inAddressPosition: boolean;
  confidence: number;
}

export function AutoCaptureCamera({
  onVideoRecorded,
  onClose,
}: AutoCaptureCameraProps) {
  // State
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [captureState, setCaptureState] = useState<CaptureState>("initializing");
  const [statusMessage, setStatusMessage] = useState("Initializing camera...");
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [soundLevel, setSoundLevel] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [impactThreshold, setImpactThreshold] = useState(0.15); // Adjustable sensitivity
  const [countdown, setCountdown] = useState<number | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const circularBufferRef = useRef<Blob[]>([]);
  const isRecordingRef = useRef(false);
  const impactDetectedRef = useRef(false);
  const postImpactTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const poseDetectorRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  const setIsFullscreenRecorderOpen = useAppStore((state) => state.setIsFullscreenRecorderOpen);

  // Initialize camera
  const initCamera = useCallback(async (facing: "environment" | "user") => {
    try {
      setCaptureState("initializing");
      setStatusMessage("Starting camera...");

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
        audio: audioEnabled,
      });

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play();
      }

      // Initialize audio analysis if audio is enabled
      if (audioEnabled) {
        initAudioAnalysis(newStream);
      }

      // Initialize pose detection
      await initPoseDetection();

      setCaptureState("waiting_for_golfer");
      setStatusMessage("Position yourself in frame");
      setError(null);

      // Start the detection loop
      startDetectionLoop();

    } catch (err: any) {
      console.error("Camera error:", err);
      setError("Could not access camera. Please check permissions.");
      setCaptureState("error");
    }
  }, [stream, audioEnabled]);

  // Initialize audio analysis for impact detection
  const initAudioAnalysis = (mediaStream: MediaStream) => {
    try {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3;

      const source = audioContext.createMediaStreamSource(mediaStream);
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      audioDataRef.current = new Uint8Array(analyser.frequencyBinCount);

    } catch (err) {
      console.error("Audio analysis error:", err);
    }
  };

  // Initialize MediaPipe pose detection
  const initPoseDetection = async () => {
    try {
      const { PoseLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
      });

      poseDetectorRef.current = poseLandmarker;
      console.log("Pose detection initialized");

    } catch (err) {
      console.error("Pose detection init error:", err);
      // Continue without pose detection - fall back to sound-only mode
      setStatusMessage("Ready - using sound detection");
      setCaptureState("ready_to_capture");
    }
  };

  // Analyze pose to detect golfer in address position
  const analyzePose = (landmarks: any[]): PoseStatus => {
    if (!landmarks || landmarks.length === 0) {
      return { inFrame: false, inAddressPosition: false, confidence: 0 };
    }

    const pose = landmarks[0];

    // Check if key landmarks are visible (shoulders, hips, wrists)
    const leftShoulder = pose[11];
    const rightShoulder = pose[12];
    const leftHip = pose[23];
    const rightHip = pose[24];
    const leftWrist = pose[15];
    const rightWrist = pose[16];

    const keyLandmarks = [leftShoulder, rightShoulder, leftHip, rightHip, leftWrist, rightWrist];
    const visibleCount = keyLandmarks.filter(l => l && l.visibility > 0.5).length;
    const inFrame = visibleCount >= 4;

    // Check for address position (relatively still, hands together and low)
    let inAddressPosition = false;
    if (inFrame && leftWrist && rightWrist && leftHip && rightHip) {
      // Hands should be close together and below shoulder height
      const handsClose = Math.abs(leftWrist.x - rightWrist.x) < 0.15;
      const handsLow = leftWrist.y > leftShoulder?.y && rightWrist.y > rightShoulder?.y;
      // Hips should be relatively level (not mid-swing)
      const hipsLevel = Math.abs(leftHip.y - rightHip.y) < 0.1;

      inAddressPosition = handsClose && handsLow && hipsLevel;
    }

    const avgConfidence = keyLandmarks
      .filter(l => l)
      .reduce((sum, l) => sum + (l.visibility || 0), 0) / keyLandmarks.length;

    return { inFrame, inAddressPosition, confidence: avgConfidence };
  };

  // Detect impact sound
  const detectImpact = (): boolean => {
    if (!analyserRef.current || !audioDataRef.current) return false;

    analyserRef.current.getByteFrequencyData(audioDataRef.current);

    // Calculate average volume
    const average = audioDataRef.current.reduce((a, b) => a + b, 0) / audioDataRef.current.length;
    const normalizedLevel = average / 255;

    setSoundLevel(normalizedLevel);

    // Detect sudden spike in volume (impact sound)
    if (normalizedLevel > impactThreshold) {
      return true;
    }
    return false;
  };

  // Start continuous recording to circular buffer
  const startBufferRecording = useCallback(() => {
    if (!stream || isRecordingRef.current) return;

    circularBufferRef.current = [];
    isRecordingRef.current = true;
    impactDetectedRef.current = false;

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm",
    });

    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        circularBufferRef.current.push(e.data);

        // Keep only last 5 seconds worth of chunks (roughly)
        // At 1 chunk per 500ms, keep last 10 chunks
        if (circularBufferRef.current.length > 10) {
          circularBufferRef.current.shift();
        }
      }
    };

    mediaRecorder.onstop = () => {
      if (impactDetectedRef.current && circularBufferRef.current.length > 0) {
        const blob = new Blob(circularBufferRef.current, { type: "video/webm" });
        setRecordedBlob(blob);
        setCaptureState("captured");
        setStatusMessage("Swing captured!");

        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = URL.createObjectURL(blob);
          videoRef.current.play();
        }
      }
    };

    // Record in 500ms chunks
    mediaRecorder.start(500);
    console.log("Buffer recording started");

  }, [stream]);

  // Handle impact detection
  const handleImpactDetected = useCallback(() => {
    if (impactDetectedRef.current) return;

    impactDetectedRef.current = true;
    setCaptureState("recording");
    setStatusMessage("Impact detected! Capturing...");

    // Continue recording for 2 more seconds after impact
    postImpactTimeoutRef.current = setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
        isRecordingRef.current = false;
      }
    }, 2000);

  }, []);

  // Main detection loop
  const startDetectionLoop = useCallback(() => {
    const detect = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) {
        animationFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      // Pose detection - only when not already recording or captured
      if (poseDetectorRef.current &&
          captureState !== "captured" &&
          captureState !== "recording" &&
          captureState !== "ready_to_capture") {
        try {
          const results = poseDetectorRef.current.detectForVideo(
            videoRef.current,
            performance.now()
          );

          const poseStatus = analyzePose(results.landmarks);

          if (!poseStatus.inFrame) {
            if (captureState !== "waiting_for_golfer") {
              setCaptureState("waiting_for_golfer");
              setStatusMessage("Position yourself in frame");
            }
          } else if (poseStatus.inAddressPosition) {
            setCaptureState("ready_to_capture");
            setStatusMessage("Ready - Swing when ready!");
            startBufferRecording();
          } else if (poseStatus.inFrame) {
            if (captureState === "waiting_for_golfer") {
              setCaptureState("golfer_detected");
              setStatusMessage("Get into address position");
            }
          }
        } catch (err) {
          // Pose detection failed, continue with sound-only
        }
      }

      // Sound detection (when in ready state)
      if ((captureState === "ready_to_capture" || captureState === "recording") &&
          !impactDetectedRef.current) {
        if (detectImpact()) {
          handleImpactDetected();
        }
      }

      animationFrameRef.current = requestAnimationFrame(detect);
    };

    detect();
  }, [captureState, startBufferRecording, handleImpactDetected]);

  // Initialize on mount
  useEffect(() => {
    setIsFullscreenRecorderOpen(true);
    initCamera(facingMode);

    return () => {
      setIsFullscreenRecorderOpen(false);

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (postImpactTimeoutRef.current) {
        clearTimeout(postImpactTimeoutRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (poseDetectorRef.current) {
        poseDetectorRef.current.close();
      }
    };
  }, []);

  // Switch camera
  const switchCamera = () => {
    const newMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);
    initCamera(newMode);
  };

  // Toggle audio
  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
  };

  // Re-record
  const reRecord = () => {
    setRecordedBlob(null);
    impactDetectedRef.current = false;
    setCaptureState("waiting_for_golfer");
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

  // Get state color
  const getStateColor = () => {
    switch (captureState) {
      case "waiting_for_golfer": return "border-yellow-500";
      case "golfer_detected": return "border-blue-500";
      case "ready_to_capture": return "border-green-500";
      case "recording": return "border-red-500";
      case "captured": return "border-green-500";
      case "error": return "border-red-500";
      default: return "border-white/20";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black"
    >
      {/* Video Preview with state border */}
      <div className={cn(
        "absolute inset-0 border-4 transition-colors duration-300",
        getStateColor()
      )}>
        <video
          ref={videoRef}
          className={cn(
            "absolute inset-0 w-full h-full object-cover",
            facingMode === "user" && "scale-x-[-1]"
          )}
          playsInline
          muted={captureState !== "captured"}
          loop={captureState === "captured"}
          controls={false}
        />
      </div>

      {/* Hidden canvas for pose detection */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Status Message */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 backdrop-blur-sm rounded-full">
        <span className={cn(
          "text-sm font-medium",
          captureState === "ready_to_capture" ? "text-green-400" :
          captureState === "recording" ? "text-red-400" :
          captureState === "error" ? "text-red-400" :
          "text-white"
        )}>
          {statusMessage}
        </span>
      </div>

      {/* Sound Level Indicator */}
      {audioEnabled && captureState !== "captured" && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-48">
          <div className="flex items-center gap-2 px-3 py-2 bg-black/50 rounded-full">
            <Volume2 className="w-4 h-4 text-white/70" />
            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  soundLevel > impactThreshold ? "bg-red-500" : "bg-green-500"
                )}
                style={{ width: `${Math.min(soundLevel * 300, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Recording Indicator */}
      {captureState === "recording" && (
        <div className="absolute top-32 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-red-500 rounded-full">
          <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
          <span className="text-white font-bold">Capturing...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-32 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-500/90 rounded-xl text-white">
          {error}
        </div>
      )}

      {/* Top Controls */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center pointer-events-none">
        <Button
          variant="glass"
          size="icon"
          onClick={onClose}
          className="w-12 h-12 rounded-full pointer-events-auto"
        >
          <X className="w-6 h-6" />
        </Button>

        <div className="flex items-center gap-2 pointer-events-auto">
          {captureState !== "captured" && (
            <>
              <Button
                variant="glass"
                size="icon"
                onClick={toggleAudio}
                className="w-12 h-12 rounded-full"
              >
                {audioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </Button>
              <Button
                variant="glass"
                size="icon"
                onClick={switchCamera}
                className="w-12 h-12 rounded-full"
              >
                <SwitchCamera className="w-6 h-6" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-4">
        {captureState === "captured" && recordedBlob && (
          <>
            <Button
              variant="glass"
              size="lg"
              onClick={reRecord}
              className="rounded-full"
            >
              Try Again
            </Button>
            <Button
              size="lg"
              onClick={useRecording}
              className="rounded-full bg-green-500 hover:bg-green-600"
            >
              Analyze Swing
            </Button>
          </>
        )}
      </div>

      {/* Instructions */}
      {captureState !== "captured" && captureState !== "recording" && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center max-w-sm px-4">
          <p className="text-white/70 text-sm">
            {captureState === "waiting_for_golfer" && "Stand in frame with your club"}
            {captureState === "golfer_detected" && "Get into your address position"}
            {captureState === "ready_to_capture" && "Swing! Impact sound will trigger capture"}
            {captureState === "initializing" && "Please wait..."}
          </p>
        </div>
      )}

      {/* State Legend */}
      <div className="absolute bottom-24 left-4 space-y-1 text-xs">
        <div className="flex items-center gap-2 text-white/50">
          <div className="w-3 h-3 border-2 border-yellow-500 rounded" />
          <span>Position yourself</span>
        </div>
        <div className="flex items-center gap-2 text-white/50">
          <div className="w-3 h-3 border-2 border-green-500 rounded" />
          <span>Ready - Swing!</span>
        </div>
        <div className="flex items-center gap-2 text-white/50">
          <div className="w-3 h-3 border-2 border-red-500 rounded" />
          <span>Capturing</span>
        </div>
      </div>
    </motion.div>
  );
}

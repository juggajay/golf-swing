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
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [soundLevel, setSoundLevel] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [impactThreshold, setImpactThreshold] = useState(0.15); // Adjustable sensitivity
  const [countdown, setCountdown] = useState<number | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
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
  const captureStateRef = useRef<CaptureState>("initializing");
  const bufferStartedRef = useRef(false);

  const setIsFullscreenRecorderOpen = useAppStore((state) => state.setIsFullscreenRecorderOpen);

  // Helper to update capture state (both state and ref)
  const updateCaptureState = useCallback((newState: CaptureState) => {
    captureStateRef.current = newState;
    setCaptureState(newState);
  }, []);

  // Initialize camera - simplified version similar to working fullscreen-recorder
  const initCamera = async (facing: "environment" | "user") => {
    try {
      updateCaptureState("initializing");
      setStatusMessage("Requesting camera access...");
      setError(null);
      bufferStartedRef.current = false;
      impactDetectedRef.current = false;

      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      // Request camera + audio permissions
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: true,
      });

      streamRef.current = newStream;
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play();
      }

      setStatusMessage("Camera ready, initializing...");
      setError(null);

      // Initialize audio analysis
      initAudioAnalysis(newStream);

      // Try to initialize pose detection, but don't wait too long
      const posePromise = initPoseDetection();
      const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 3000));
      await Promise.race([posePromise, timeoutPromise]);

      // If pose detection isn't ready, go straight to sound-only mode
      if (!poseDetectorRef.current) {
        console.log("Pose detection not available, using sound-only mode");
        updateCaptureState("ready_to_capture");
        setStatusMessage("Ready - Swing when ready! (Sound detection)");
        startBufferRecording(newStream);
      } else {
        updateCaptureState("waiting_for_golfer");
        setStatusMessage("Position yourself in frame");
      }

      // Start the detection loop
      startDetectionLoop(newStream);

    } catch (err: any) {
      console.error("Camera error:", err);

      // Provide more specific error messages
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Camera permission denied. Please allow camera access and try again.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setError("No camera found. Please connect a camera and try again.");
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        setError("Camera is in use by another app. Please close other apps using the camera.");
      } else {
        setError("Could not access camera. Please check permissions.");
      }
      updateCaptureState("error");
    }
  };

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
  const startBufferRecording = useCallback((mediaStream: MediaStream) => {
    if (bufferStartedRef.current || isRecordingRef.current) {
      console.log("Buffer already started, skipping");
      return;
    }

    console.log("Starting buffer recording...");
    circularBufferRef.current = [];
    isRecordingRef.current = true;
    bufferStartedRef.current = true;

    const mediaRecorder = new MediaRecorder(mediaStream, {
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
      console.log("MediaRecorder stopped, impact detected:", impactDetectedRef.current);
      if (impactDetectedRef.current && circularBufferRef.current.length > 0) {
        const blob = new Blob(circularBufferRef.current, { type: "video/webm" });
        setRecordedBlob(blob);
        updateCaptureState("captured");
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
    console.log("Buffer recording started successfully");

  }, [updateCaptureState]);

  // Handle impact detection
  const handleImpactDetected = useCallback(() => {
    if (impactDetectedRef.current) return;

    console.log("Impact detected!");
    impactDetectedRef.current = true;
    updateCaptureState("recording");
    setStatusMessage("Impact detected! Capturing...");

    // Continue recording for 2 more seconds after impact
    postImpactTimeoutRef.current = setTimeout(() => {
      console.log("Post-impact timeout, stopping recorder");
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
        isRecordingRef.current = false;
      }
    }, 2000);

  }, [updateCaptureState]);

  // Main detection loop
  const startDetectionLoop = useCallback((mediaStream: MediaStream) => {
    console.log("Starting detection loop");

    const detect = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) {
        animationFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      const currentState = captureStateRef.current;

      // Pose detection - only when not already recording or captured
      if (poseDetectorRef.current &&
          currentState !== "captured" &&
          currentState !== "recording" &&
          currentState !== "ready_to_capture") {
        try {
          const results = poseDetectorRef.current.detectForVideo(
            videoRef.current,
            performance.now()
          );

          const poseStatus = analyzePose(results.landmarks);

          if (!poseStatus.inFrame) {
            if (currentState !== "waiting_for_golfer") {
              updateCaptureState("waiting_for_golfer");
              setStatusMessage("Position yourself in frame");
            }
          } else if (poseStatus.inAddressPosition) {
            updateCaptureState("ready_to_capture");
            setStatusMessage("Ready - Swing when ready!");
            startBufferRecording(mediaStream);
          } else if (poseStatus.inFrame) {
            if (currentState === "waiting_for_golfer") {
              updateCaptureState("golfer_detected");
              setStatusMessage("Get into address position");
            }
          }
        } catch (err) {
          // Pose detection failed, continue with sound-only mode
          console.log("Pose detection error, switching to sound-only");
          if (!bufferStartedRef.current) {
            updateCaptureState("ready_to_capture");
            setStatusMessage("Ready - Swing when ready! (Sound detection)");
            startBufferRecording(mediaStream);
          }
        }
      }

      // Sound detection (when in ready state)
      if ((currentState === "ready_to_capture" || currentState === "recording") &&
          !impactDetectedRef.current) {
        if (detectImpact()) {
          handleImpactDetected();
        }
      }

      // Continue loop if not captured
      if (currentState !== "captured") {
        animationFrameRef.current = requestAnimationFrame(detect);
      }
    };

    detect();
  }, [updateCaptureState, startBufferRecording, handleImpactDetected]);

  // Initialize on mount
  useEffect(() => {
    setIsFullscreenRecorderOpen(true);
    initCamera(facingMode);

    return () => {
      setIsFullscreenRecorderOpen(false);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
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
    bufferStartedRef.current = false;
    isRecordingRef.current = false;
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

      {/* Error State - Full screen overlay with retry */}
      {captureState === "error" && error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-6 overflow-y-auto">
          <div className="max-w-sm text-center space-y-4 my-auto">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Camera Access Required</h3>
              <p className="text-white/70 mb-4 text-sm">{error}</p>

              <div className="text-left text-xs bg-white/10 rounded-lg p-3 space-y-3">
                <div>
                  <p className="font-semibold text-white/90 mb-1">Chrome / Edge:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-white/60">
                    <li>Click the lock/tune icon in the address bar</li>
                    <li>Click &quot;Site settings&quot;</li>
                    <li>Set Camera and Microphone to &quot;Allow&quot;</li>
                    <li>Refresh the page</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold text-white/90 mb-1">Safari (iOS):</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-white/60">
                    <li>Go to Settings → Safari → Camera</li>
                    <li>Set to &quot;Allow&quot; or &quot;Ask&quot;</li>
                    <li>Return here and tap &quot;Try Again&quot;</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold text-white/90 mb-1">Safari (Mac):</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-white/60">
                    <li>Safari menu → Settings → Websites</li>
                    <li>Click Camera, find this site, set to &quot;Allow&quot;</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button
                size="lg"
                onClick={() => initCamera(facingMode)}
                className="w-full"
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={onClose}
                className="w-full"
              >
                Upload Video Instead
              </Button>
            </div>
          </div>
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

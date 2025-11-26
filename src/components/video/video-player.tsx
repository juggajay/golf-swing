"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatDuration } from "@/lib/utils";
import { PoseOverlay } from "./pose-overlay";
import type { VideoState, OverlaySettings } from "@/types";

interface VideoPlayerProps {
  src: string;
  overlaySettings?: OverlaySettings;
  onTimeUpdate?: (time: number) => void;
  onFrameCapture?: (imageData: string, time: number) => void;
  keyFrames?: { name: string; time: number }[];
  showPoseOverlay?: boolean;
}

const DEFAULT_OVERLAY_SETTINGS: OverlaySettings = {
  swingPlane: true,
  spine: true,
  clubPath: false,
  hipLine: false,
  shoulderLine: false,
  targetLine: true,
};

export function VideoPlayer({
  src,
  overlaySettings: initialOverlaySettings,
  onTimeUpdate,
  onFrameCapture,
  keyFrames = [],
  showPoseOverlay = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<VideoState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
    volume: 1,
    isMuted: false,
  });

  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [overlaySettings, setOverlaySettings] = useState<OverlaySettings>(
    initialOverlaySettings || DEFAULT_OVERLAY_SETTINGS
  );
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle video metadata loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setState((prev) => ({
        ...prev,
        duration: videoRef.current!.duration,
      }));
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      setState((prev) => ({ ...prev, currentTime }));
      onTimeUpdate?.(currentTime);
    }
  };

  // Play/Pause toggle
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (state.isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
    }
  }, [state.isPlaying]);

  // Seek to time
  const seekTo = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setState((prev) => ({ ...prev, currentTime: time }));
    }
  }, []);

  // Step frame forward/backward
  const stepFrame = useCallback((direction: "forward" | "backward") => {
    if (videoRef.current) {
      const frameTime = 1 / 30; // Assuming 30fps
      const newTime =
        direction === "forward"
          ? Math.min(videoRef.current.currentTime + frameTime, state.duration)
          : Math.max(videoRef.current.currentTime - frameTime, 0);
      seekTo(newTime);
    }
  }, [state.duration, seekTo]);

  // Change playback rate
  const setPlaybackRate = useCallback((rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setState((prev) => ({ ...prev, playbackRate: rate }));
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !state.isMuted;
      setState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
    }
  }, [state.isMuted]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Capture current frame
  const captureFrame = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL("image/jpeg", 0.8);
        onFrameCapture?.(imageData, state.currentTime);
      }
    }
  }, [state.currentTime, onFrameCapture]);

  // Go to key frame
  const goToKeyFrame = useCallback((direction: "prev" | "next") => {
    if (keyFrames.length === 0) return;

    const currentTime = state.currentTime;
    let targetFrame;

    if (direction === "prev") {
      targetFrame = keyFrames
        .filter((kf) => kf.time < currentTime - 0.05)
        .pop();
    } else {
      targetFrame = keyFrames.find((kf) => kf.time > currentTime + 0.05);
    }

    if (targetFrame) {
      seekTo(targetFrame.time);
    }
  }, [keyFrames, state.currentTime, seekTo]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (e.shiftKey) {
            goToKeyFrame("prev");
          } else {
            stepFrame("backward");
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (e.shiftKey) {
            goToKeyFrame("next");
          } else {
            stepFrame("forward");
          }
          break;
        case "f":
          toggleFullscreen();
          break;
        case "m":
          toggleMute();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, stepFrame, goToKeyFrame, toggleFullscreen, toggleMute]);

  // Auto-hide controls
  useEffect(() => {
    const showControlsHandler = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (state.isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", showControlsHandler);
      container.addEventListener("touchstart", showControlsHandler);
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", showControlsHandler);
        container.removeEventListener("touchstart", showControlsHandler);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [state.isPlaying]);

  // Find current key frame
  const currentKeyFrame = keyFrames.reduce((prev, curr) => {
    if (curr.time <= state.currentTime) return curr;
    return prev;
  }, keyFrames[0]);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black rounded-2xl overflow-hidden group"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        className="w-full aspect-video object-contain"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setState((prev) => ({ ...prev, isPlaying: false }))}
        onClick={togglePlay}
        playsInline
      />

      {/* Canvas for frame capture (hidden) */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Pose Overlay for drawing lines */}
      {showPoseOverlay && (
        <PoseOverlay
          videoRef={videoRef}
          containerRef={containerRef}
          settings={overlaySettings}
          onSettingsChange={setOverlaySettings}
        />
      )}

      {/* Key Frame Indicator */}
      {currentKeyFrame && (
        <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg">
          <span className="text-white text-sm font-medium capitalize">
            {currentKeyFrame.name.replace("_", " ")}
          </span>
        </div>
      )}

      {/* Controls Overlay */}
      <motion.div
        initial={false}
        animate={{ opacity: showControls ? 1 : 0 }}
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"
      />

      {/* Play/Pause Button (Center) */}
      <motion.div
        initial={false}
        animate={{ opacity: showControls ? 1 : 0 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <button
          onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors pointer-events-auto"
        >
          {state.isPlaying ? (
            <Pause className="w-8 h-8 text-white" fill="white" />
          ) : (
            <Play className="w-8 h-8 text-white ml-1" fill="white" />
          )}
        </button>
      </motion.div>

      {/* Bottom Controls */}
      <motion.div
        initial={false}
        animate={{ opacity: showControls ? 1 : 0 }}
        className={cn(
          "absolute bottom-0 left-0 right-0 p-4 pointer-events-none",
          showControls && "pointer-events-auto"
        )}
      >
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[state.currentTime]}
            min={0}
            max={state.duration || 100}
            step={0.01}
            onValueChange={([value]) => seekTo(value)}
            className="cursor-pointer"
          />

          {/* Key Frame Markers */}
          <div className="relative h-1 -mt-1">
            {keyFrames.map((kf, i) => (
              <button
                key={i}
                className="absolute w-2 h-2 -mt-0.5 bg-white rounded-full transform -translate-x-1/2 hover:scale-150 transition-transform"
                style={{ left: `${(kf.time / state.duration) * 100}%` }}
                onClick={() => seekTo(kf.time)}
                title={kf.name}
              />
            ))}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-2">
          {/* Frame Step Controls */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => goToKeyFrame("prev")}
              className="text-white hover:bg-white/20"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => stepFrame("backward")}
              className="text-white hover:bg-white/20"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              {state.isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => stepFrame("forward")}
              className="text-white hover:bg-white/20"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => goToKeyFrame("next")}
              className="text-white hover:bg-white/20"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Time Display */}
          <span className="text-white text-sm font-mono min-w-[80px]">
            {formatDuration(state.currentTime)} / {formatDuration(state.duration)}
          </span>

          <div className="flex-1" />

          {/* Speed Control */}
          <Select
            value={state.playbackRate.toString()}
            onValueChange={(value) => setPlaybackRate(parseFloat(value))}
          >
            <SelectTrigger className="w-20 h-8 bg-transparent border-white/20 text-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.25">0.25x</SelectItem>
              <SelectItem value="0.5">0.5x</SelectItem>
              <SelectItem value="1">1x</SelectItem>
              <SelectItem value="1.5">1.5x</SelectItem>
              <SelectItem value="2">2x</SelectItem>
            </SelectContent>
          </Select>

          {/* Volume Control */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleMute}
            className="text-white hover:bg-white/20"
          >
            {state.isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>

          {/* Fullscreen */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleFullscreen}
            className="text-white hover:bg-white/20"
          >
            <Maximize className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

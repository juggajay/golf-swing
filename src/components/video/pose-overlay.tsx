"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Settings2,
  Move,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { OverlaySettings } from "@/types";

interface PoseOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  settings: OverlaySettings;
  onSettingsChange: (settings: OverlaySettings) => void;
}

// Colors for different overlay types
const OVERLAY_COLORS = {
  swingPlane: "#22c55e", // green
  spine: "#3b82f6", // blue
  clubPath: "#f59e0b", // amber
  hipLine: "#ec4899", // pink
  shoulderLine: "#8b5cf6", // purple
  targetLine: "#ef4444", // red
};

interface DraggableLine {
  id: keyof OverlaySettings;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// Default line positions (as percentages of container)
const DEFAULT_LINES: Record<keyof OverlaySettings, { x1: number; y1: number; x2: number; y2: number }> = {
  swingPlane: { x1: 20, y1: 90, x2: 80, y2: 20 },
  spine: { x1: 50, y1: 25, x2: 50, y2: 70 },
  clubPath: { x1: 45, y1: 75, x2: 60, y2: 20 },
  hipLine: { x1: 35, y1: 65, x2: 65, y2: 65 },
  shoulderLine: { x1: 30, y1: 35, x2: 70, y2: 35 },
  targetLine: { x1: 0, y1: 80, x2: 100, y2: 80 },
};

export function PoseOverlay({
  videoRef,
  containerRef,
  settings,
  onSettingsChange,
}: PoseOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [lines, setLines] = useState<Record<keyof OverlaySettings, DraggableLine>>(() => {
    const initialLines: Record<string, DraggableLine> = {};
    Object.keys(DEFAULT_LINES).forEach((key) => {
      const k = key as keyof OverlaySettings;
      initialLines[k] = { id: k, ...DEFAULT_LINES[k] };
    });
    return initialLines as Record<keyof OverlaySettings, DraggableLine>;
  });
  const [dragState, setDragState] = useState<{
    lineId: keyof OverlaySettings;
    point: "start" | "end";
  } | null>(null);

  // Draw overlays on canvas
  const drawOverlays = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !showOverlay) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match container
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each enabled line
    Object.entries(settings).forEach(([key, enabled]) => {
      if (!enabled) return;

      const lineKey = key as keyof OverlaySettings;
      const line = lines[lineKey];
      const color = OVERLAY_COLORS[lineKey];

      // Convert percentage to pixels
      const x1 = (line.x1 / 100) * canvas.width;
      const y1 = (line.y1 / 100) * canvas.height;
      const x2 = (line.x2 / 100) * canvas.width;
      const y2 = (line.y2 / 100) * canvas.height;

      // Draw line
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.setLineDash(lineKey === "targetLine" ? [10, 5] : []);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Draw endpoints if in edit mode
      if (isEditMode) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x1, y1, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x2, y2, 8, 0, Math.PI * 2);
        ctx.fill();

        // Add white border to endpoints
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(x1, y1, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x2, y2, 8, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }, [settings, lines, showOverlay, isEditMode, containerRef]);

  // Redraw on any change
  useEffect(() => {
    drawOverlays();
  }, [drawOverlays]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      drawOverlays();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawOverlays]);

  // Handle mouse/touch events for dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isEditMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Find closest point
    type ClosestPoint = { lineId: keyof OverlaySettings; point: "start" | "end"; dist: number };
    let closest: ClosestPoint | null = null;

    Object.entries(lines).forEach(([key, line]) => {
      const lineKey = key as keyof OverlaySettings;
      if (!settings[lineKey]) return;

      const distStart = Math.sqrt((x - line.x1) ** 2 + (y - line.y1) ** 2);
      const distEnd = Math.sqrt((x - line.x2) ** 2 + (y - line.y2) ** 2);

      if (distStart < 5 && (!closest || distStart < closest.dist)) {
        closest = { lineId: lineKey, point: "start" as const, dist: distStart };
      }
      if (distEnd < 5 && (!closest || distEnd < closest.dist)) {
        closest = { lineId: lineKey, point: "end" as const, dist: distEnd };
      }
    });

    if (closest !== null) {
      const { lineId, point } = closest;
      setDragState({ lineId, point });
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState || !isEditMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    setLines((prev) => ({
      ...prev,
      [dragState.lineId]: {
        ...prev[dragState.lineId],
        [dragState.point === "start" ? "x1" : "x2"]: x,
        [dragState.point === "start" ? "y1" : "y2"]: y,
      },
    }));
  };

  const handlePointerUp = () => {
    setDragState(null);
  };

  const resetLines = () => {
    setLines(() => {
      const initialLines: Record<string, DraggableLine> = {};
      Object.keys(DEFAULT_LINES).forEach((key) => {
        const k = key as keyof OverlaySettings;
        initialLines[k] = { id: k, ...DEFAULT_LINES[k] };
      });
      return initialLines as Record<keyof OverlaySettings, DraggableLine>;
    });
  };

  const toggleSetting = (key: keyof OverlaySettings) => {
    onSettingsChange({
      ...settings,
      [key]: !settings[key],
    });
  };

  const overlayLabels: Record<keyof OverlaySettings, string> = {
    swingPlane: "Swing Plane",
    spine: "Spine Angle",
    clubPath: "Club Path",
    hipLine: "Hip Line",
    shoulderLine: "Shoulder Line",
    targetLine: "Target Line",
  };

  return (
    <>
      {/* Overlay Canvas */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full ${isEditMode ? "cursor-move" : "pointer-events-none"}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />

      {/* Control Panel */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {/* Toggle Visibility */}
        <Button
          variant="glass"
          size="icon"
          onClick={() => setShowOverlay(!showOverlay)}
          className="w-10 h-10"
          title={showOverlay ? "Hide overlays" : "Show overlays"}
        >
          {showOverlay ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
        </Button>

        {/* Edit Mode Toggle */}
        <Button
          variant={isEditMode ? "default" : "glass"}
          size="icon"
          onClick={() => setIsEditMode(!isEditMode)}
          className="w-10 h-10"
          title={isEditMode ? "Exit edit mode" : "Adjust lines"}
        >
          <Move className="w-5 h-5" />
        </Button>

        {/* Settings Panel */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="glass" size="icon" className="w-10 h-10">
              <Settings2 className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Overlay Settings</SheetTitle>
            </SheetHeader>
            <div className="py-6 space-y-6">
              {/* Toggle switches for each overlay type */}
              {(Object.keys(overlayLabels) as Array<keyof OverlaySettings>).map((key) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: OVERLAY_COLORS[key] }}
                    />
                    <Label htmlFor={key} className="font-medium">
                      {overlayLabels[key]}
                    </Label>
                  </div>
                  <Switch
                    id={key}
                    checked={settings[key]}
                    onCheckedChange={() => toggleSetting(key)}
                  />
                </div>
              ))}

              {/* Reset Button */}
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full" onClick={resetLines}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Line Positions
                </Button>
              </div>

              {/* Instructions */}
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-medium">How to use:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Toggle lines on/off using the switches above</li>
                  <li>Click the move icon to enter edit mode</li>
                  <li>Drag the endpoints to adjust line positions</li>
                  <li>Click the eye icon to show/hide all overlays</li>
                </ul>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Edit Mode Indicator */}
      {isEditMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-primary rounded-full"
        >
          <span className="text-sm font-medium text-primary-foreground">
            Edit Mode - Drag endpoints to adjust
          </span>
        </motion.div>
      )}
    </>
  );
}

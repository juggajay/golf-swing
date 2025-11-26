import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function getScoreColor(score: number): string {
  if (score >= 9) return "score-excellent";
  if (score >= 7) return "score-good";
  if (score >= 5) return "score-average";
  if (score >= 3) return "score-needs-work";
  return "score-poor";
}

export function getScoreLabel(score: number): string {
  if (score >= 9) return "Excellent";
  if (score >= 7) return "Good";
  if (score >= 5) return "Average";
  if (score >= 3) return "Needs Work";
  return "Poor";
}

export function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case "minor":
      return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
    case "moderate":
      return "bg-orange-500/20 text-orange-700 dark:text-orange-400";
    case "major":
      return "bg-red-500/20 text-red-700 dark:text-red-400";
    default:
      return "bg-gray-500/20 text-gray-700 dark:text-gray-400";
  }
}

export function extractVideoFrameAsBase64(
  video: HTMLVideoElement,
  time: number,
  maxWidth: number = 512
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");

    // Scale down to max 512px width for faster processing
    const scale = Math.min(1, maxWidth / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    // Set up timeout for slow seeks
    const timeout = setTimeout(() => {
      reject(new Error(`Video seek timeout at ${time}s`));
    }, 10000);

    const handleSeeked = () => {
      clearTimeout(timeout);
      video.removeEventListener("seeked", handleSeeked);

      // Small delay to ensure frame is rendered
      setTimeout(() => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        resolve(dataUrl);
      }, 100);
    };

    video.addEventListener("seeked", handleSeeked);
    video.currentTime = time;
  });
}

export async function extractKeyFrames(
  video: HTMLVideoElement,
  duration: number
): Promise<string[]> {
  // Reduced to 4 key frames for faster analysis
  const keyPositions = [
    { name: "address", timePercent: 0.05 },
    { name: "top", timePercent: 0.35 },
    { name: "impact", timePercent: 0.55 },
    { name: "finish", timePercent: 0.9 },
  ];

  const frames: string[] = [];
  for (const pos of keyPositions) {
    const time = duration * pos.timePercent;
    const frame = await extractVideoFrameAsBase64(video, time, 512);
    frames.push(frame);
  }
  return frames;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}

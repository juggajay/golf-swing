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
  time: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    video.currentTime = time;
    video.onseeked = () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      resolve(dataUrl);
    };
    video.onerror = () => reject(new Error("Video seek failed"));
  });
}

export async function extractKeyFrames(
  video: HTMLVideoElement,
  duration: number
): Promise<string[]> {
  const keyPositions = [
    { name: "address", timePercent: 0.05 },
    { name: "takeaway", timePercent: 0.15 },
    { name: "top", timePercent: 0.35 },
    { name: "transition", timePercent: 0.45 },
    { name: "impact", timePercent: 0.6 },
    { name: "follow_through", timePercent: 0.75 },
    { name: "finish", timePercent: 0.95 },
  ];

  const frames: string[] = [];
  for (const pos of keyPositions) {
    const time = duration * pos.timePercent;
    const frame = await extractVideoFrameAsBase64(video, time);
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

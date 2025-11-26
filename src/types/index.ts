export interface SwingAnalysis {
  overall_rating: string;
  handicap_estimate: string;
  swing_type: string;
  primary_ball_flight: string;
  analysis: {
    setup: AnalysisSection;
    backswing: AnalysisSection;
    transition: AnalysisSection;
    impact: AnalysisSection;
    follow_through: AnalysisSection;
  };
  priority_fixes: PriorityFix[];
  practice_plan: {
    range_session: string[];
    at_home_drills: string[];
  };
}

export interface AnalysisSection {
  score: number;
  strengths: string[];
  improvements: Improvement[];
}

export interface Improvement {
  issue: string;
  severity: "minor" | "moderate" | "major";
  drill: string;
  impact: string;
}

export interface PriorityFix {
  rank: number;
  issue: string;
  explanation: string;
  drills: string[];
  expected_improvement: string;
}

export interface Swing {
  id: string;
  userId?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  cameraAngle: "dtl" | "face_on" | "unknown";
  clubUsed?: string;
  durationSeconds: number;
  createdAt: Date;
  analysis?: SwingAnalysis;
}

export interface UserProfile {
  id: string;
  displayName: string;
  handicap?: number;
  dominantHand: "right" | "left";
  skillLevel: "beginner" | "intermediate" | "advanced" | "professional";
  createdAt: Date;
}

export interface Drill {
  id: string;
  name: string;
  description: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  category: DrillCategory;
  difficulty: "easy" | "medium" | "hard";
  relatedFaults: string[];
  instructions: string[];
  equipment?: string[];
  duration?: string;
}

export type DrillCategory =
  | "setup"
  | "backswing"
  | "transition"
  | "impact"
  | "follow_through"
  | "tempo"
  | "short_game";

export interface OverlaySettings {
  swingPlane: boolean;
  spine: boolean;
  clubPath: boolean;
  hipLine: boolean;
  shoulderLine: boolean;
  targetLine: boolean;
}

export interface VideoState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
}

export type CameraAngle = "dtl" | "face_on" | "unknown";

export interface AnalysisProgress {
  stage: "uploading" | "extracting" | "analyzing" | "complete" | "error";
  progress: number;
  message: string;
}

export interface ComparisonData {
  swing1: Swing;
  swing2: Swing;
  improvements: {
    metric: string;
    before: number;
    after: number;
    change: number;
  }[];
}

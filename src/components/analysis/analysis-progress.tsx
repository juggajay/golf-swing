"use client";

import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Loader2 } from "lucide-react";
import type { AnalysisProgress as AnalysisProgressType } from "@/types";

interface AnalysisProgressProps {
  progress: AnalysisProgressType;
}

const stages = [
  { key: "uploading", label: "Uploading video" },
  { key: "extracting", label: "Extracting key frames" },
  { key: "analyzing", label: "AI analyzing swing" },
  { key: "complete", label: "Analysis complete" },
];

export function AnalysisProgress({ progress }: AnalysisProgressProps) {
  const currentStageIndex = stages.findIndex((s) => s.key === progress.stage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto space-y-8"
    >
      {/* Golf Ball Animation */}
      <div className="flex justify-center">
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-white to-gray-200 shadow-xl flex items-center justify-center"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, white 0%, #e5e5e5 100%)",
          }}
        >
          <div className="golf-pattern absolute inset-0 rounded-full" />
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={progress.progress} className="h-3" />
        <p className="text-center text-sm text-muted-foreground">
          {progress.progress}% complete
        </p>
      </div>

      {/* Stage List */}
      <div className="space-y-3">
        {stages.map((stage, index) => {
          const isComplete = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;
          const isPending = index > currentStageIndex;

          return (
            <motion.div
              key={stage.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                isCurrent
                  ? "bg-primary/10"
                  : isComplete
                  ? "bg-green-500/10"
                  : "bg-muted/50"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isComplete
                    ? "bg-green-500 text-white"
                    : isCurrent
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isComplete ? (
                  <CheckCircle className="w-5 h-5" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <span
                className={`font-medium ${
                  isPending ? "text-muted-foreground" : "text-foreground"
                }`}
              >
                {stage.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Current Message */}
      <p className="text-center text-muted-foreground">{progress.message}</p>

      {/* Fun Fact */}
      <div className="p-4 rounded-xl bg-muted/50 text-center">
        <p className="text-xs text-muted-foreground mb-1">Did you know?</p>
        <p className="text-sm">
          The average PGA Tour player has a swing speed of 113 mph!
        </p>
      </div>
    </motion.div>
  );
}

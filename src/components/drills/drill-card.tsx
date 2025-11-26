"use client";

import { motion } from "framer-motion";
import { Clock, Dumbbell, Play, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Drill } from "@/types";
import { cn } from "@/lib/utils";

interface DrillCardProps {
  drill: Drill;
  onClick?: () => void;
  compact?: boolean;
}

const categoryColors: Record<string, string> = {
  setup: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  backswing: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  transition: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  impact: "bg-red-500/10 text-red-600 dark:text-red-400",
  follow_through: "bg-green-500/10 text-green-600 dark:text-green-400",
  tempo: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  short_game: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

const difficultyColors: Record<string, string> = {
  easy: "bg-green-500/10 text-green-600 dark:text-green-400",
  medium: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  hard: "bg-red-500/10 text-red-600 dark:text-red-400",
};

export function DrillCard({ drill, onClick, compact = false }: DrillCardProps) {
  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="cursor-pointer"
      >
        <Card className="hover:border-primary/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Dumbbell className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{drill.name}</h4>
                <p className="text-xs text-muted-foreground truncate">
                  {drill.description}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all">
        {/* Thumbnail/Preview Area */}
        <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/90 dark:bg-black/50 flex items-center justify-center shadow-lg">
            <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
          </div>
          {/* Category Badge */}
          <Badge
            className={cn(
              "absolute top-3 left-3",
              categoryColors[drill.category]
            )}
          >
            {drill.category.replace("_", " ")}
          </Badge>
        </div>

        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-bold text-lg">{drill.name}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {drill.description}
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Badge variant="outline" className={difficultyColors[drill.difficulty]}>
              {drill.difficulty}
            </Badge>
            {drill.duration && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                {drill.duration}
              </span>
            )}
          </div>

          {drill.equipment && drill.equipment.length > 0 && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Equipment:</span>{" "}
              {drill.equipment.join(", ")}
            </p>
          )}

          <Button variant="outline" className="w-full" onClick={onClick}>
            View Drill
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

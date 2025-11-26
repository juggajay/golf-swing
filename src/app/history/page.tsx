"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Video,
  Calendar,
  TrendingUp,
  Trash2,
  Eye,
  Filter,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/stores/app-store";
import { cn, getScoreColor } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption = "date" | "score" | "club";

export default function HistoryPage() {
  const { swings, deleteSwing, setCurrentSwing } = useAppStore();
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [filterClub, setFilterClub] = useState<string>("all");

  // Get unique clubs from swings
  const clubs = Array.from(new Set(swings.map((s) => s.clubUsed).filter(Boolean)));

  // Sort and filter swings
  const filteredSwings = swings
    .filter((swing) => filterClub === "all" || swing.clubUsed === filterClub)
    .sort((a, b) => {
      switch (sortBy) {
        case "score":
          const scoreA = a.analysis
            ? parseFloat(a.analysis.overall_rating.split("/")[0])
            : 0;
          const scoreB = b.analysis
            ? parseFloat(b.analysis.overall_rating.split("/")[0])
            : 0;
          return scoreB - scoreA;
        case "club":
          return (a.clubUsed || "").localeCompare(b.clubUsed || "");
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  // Calculate stats
  const totalSwings = swings.length;
  const analyzedSwings = swings.filter((s) => s.analysis).length;
  const avgScore = analyzedSwings > 0
    ? (swings
        .filter((s) => s.analysis)
        .reduce(
          (acc, s) => acc + parseFloat(s.analysis!.overall_rating.split("/")[0]),
          0
        ) / analyzedSwings
      ).toFixed(1)
    : "--";
  const bestScore = analyzedSwings > 0
    ? Math.max(
        ...swings
          .filter((s) => s.analysis)
          .map((s) => parseFloat(s.analysis!.overall_rating.split("/")[0]))
      ).toFixed(1)
    : "--";

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-14 md:top-0 z-30 bg-background/95 backdrop-blur-lg border-b">
        <div className="px-4 py-4 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-bold text-xl">Swing History</h1>
            <Link href="/analyze">
              <Button size="sm">
                <Video className="w-4 h-4 mr-2" />
                New Analysis
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-primary">{totalSwings}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold">{analyzedSwings}</p>
                <p className="text-xs text-muted-foreground">Analyzed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-green-600">{avgScore}</p>
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-amber-500">{bestScore}</p>
                <p className="text-xs text-muted-foreground">Best</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="score">Score</SelectItem>
                <SelectItem value="club">Club</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterClub} onValueChange={setFilterClub}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All clubs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clubs</SelectItem>
                {clubs.map((club) => (
                  <SelectItem key={club} value={club!}>
                    {club}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Swings List */}
      <div className="px-4 py-6 max-w-6xl mx-auto">
        <AnimatePresence mode="popLayout">
          {filteredSwings.length > 0 ? (
            <div className="space-y-4">
              {filteredSwings.map((swing, i) => {
                const score = swing.analysis
                  ? parseFloat(swing.analysis.overall_rating.split("/")[0])
                  : null;

                return (
                  <motion.div
                    key={swing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          {/* Thumbnail */}
                          <div className="relative w-full md:w-48 aspect-video md:aspect-auto bg-muted flex-shrink-0">
                            {swing.thumbnailUrl ? (
                              <img
                                src={swing.thumbnailUrl}
                                alt="Swing thumbnail"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Video className="w-8 h-8 text-muted-foreground" />
                              </div>
                            )}
                            {score !== null && (
                              <div
                                className={cn(
                                  "absolute top-2 right-2 px-2 py-1 text-white text-xs font-bold rounded-full",
                                  getScoreColor(score)
                                )}
                              >
                                {swing.analysis!.overall_rating}
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    {swing.cameraAngle.toUpperCase()}
                                  </Badge>
                                  {swing.clubUsed && (
                                    <Badge variant="secondary" className="text-xs">
                                      {swing.clubUsed}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(swing.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      weekday: "short",
                                      month: "short",
                                      day: "numeric",
                                      hour: "numeric",
                                      minute: "2-digit",
                                    }
                                  )}
                                </p>
                              </div>

                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                  if (confirm("Delete this swing?")) {
                                    deleteSwing(swing.id);
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Analysis Summary */}
                            {swing.analysis && (
                              <div className="mt-3 pt-3 border-t">
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="flex items-center gap-1">
                                    <TrendingUp className="w-4 h-4 text-primary" />
                                    {swing.analysis.primary_ball_flight}
                                  </span>
                                  <span className="text-muted-foreground">
                                    Est. Handicap: {swing.analysis.handicap_estimate}
                                  </span>
                                </div>
                                {swing.analysis.priority_fixes.length > 0 && (
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Priority: {swing.analysis.priority_fixes[0].issue}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 mt-4">
                              <Link href={`/analyze?swing=${swing.id}`}>
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4 mr-1" />
                                  View Analysis
                                </Button>
                              </Link>
                              <Link href={`/compare?swing1=${swing.id}`}>
                                <Button size="sm" variant="ghost">
                                  Compare
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Video className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-xl mb-2">No swings yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Start analyzing your golf swings to track your progress and improve your game
              </p>
              <Link href="/analyze">
                <Button size="lg">
                  <Video className="w-5 h-5 mr-2" />
                  Analyze Your First Swing
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

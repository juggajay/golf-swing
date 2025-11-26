"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  GitCompare,
  Video,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/stores/app-store";
import { VideoPlayer } from "@/components/video/video-player";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ComparePage() {
  const { swings, comparisonSwings, setComparisonSwing, clearComparison } = useAppStore();
  const [swing1Id, setSwing1Id] = useState<string>("");
  const [swing2Id, setSwing2Id] = useState<string>("");

  const analyzedSwings = swings.filter((s) => s.analysis);

  const swing1 = analyzedSwings.find((s) => s.id === swing1Id);
  const swing2 = analyzedSwings.find((s) => s.id === swing2Id);

  const canCompare = swing1 && swing2 && swing1.id !== swing2.id;

  // Calculate comparison metrics
  const getComparison = () => {
    if (!swing1?.analysis || !swing2?.analysis) return null;

    const score1 = parseFloat(swing1.analysis.overall_rating.split("/")[0]);
    const score2 = parseFloat(swing2.analysis.overall_rating.split("/")[0]);
    const scoreDiff = score2 - score1;

    const sections = ["setup", "backswing", "transition", "impact", "follow_through"] as const;
    const sectionComparisons = sections.map((section) => ({
      name: section.replace("_", " "),
      before: swing1.analysis!.analysis[section].score,
      after: swing2.analysis!.analysis[section].score,
      diff: swing2.analysis!.analysis[section].score - swing1.analysis!.analysis[section].score,
    }));

    return {
      overallBefore: score1,
      overallAfter: score2,
      overallDiff: scoreDiff,
      sections: sectionComparisons,
    };
  };

  const comparison = canCompare ? getComparison() : null;

  const getTrendIcon = (diff: number) => {
    if (diff > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (diff < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getTrendColor = (diff: number) => {
    if (diff > 0) return "text-green-600";
    if (diff < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  if (analyzedSwings.length < 2) {
    return (
      <div className="min-h-screen px-4 py-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <GitCompare className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Compare Swings</h1>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            You need at least 2 analyzed swings to compare. Analyze more swings to track your progress!
          </p>
          <Link href="/analyze">
            <Button size="lg">
              <Video className="w-5 h-5 mr-2" />
              Analyze a Swing
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-14 md:top-0 z-30 bg-background/95 backdrop-blur-lg border-b">
        <div className="px-4 py-4 max-w-6xl mx-auto">
          <h1 className="font-bold text-xl mb-4">Compare Swings</h1>

          {/* Swing Selectors */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium mb-2">Before</label>
              <Select value={swing1Id} onValueChange={setSwing1Id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select first swing" />
                </SelectTrigger>
                <SelectContent>
                  {analyzedSwings.map((swing) => (
                    <SelectItem key={swing.id} value={swing.id}>
                      {new Date(swing.createdAt).toLocaleDateString()} -{" "}
                      {swing.clubUsed || "Unknown"} ({swing.analysis?.overall_rating})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block" />

            <div className="flex-1 w-full">
              <label className="block text-sm font-medium mb-2">After</label>
              <Select value={swing2Id} onValueChange={setSwing2Id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select second swing" />
                </SelectTrigger>
                <SelectContent>
                  {analyzedSwings.map((swing) => (
                    <SelectItem key={swing.id} value={swing.id}>
                      {new Date(swing.createdAt).toLocaleDateString()} -{" "}
                      {swing.clubUsed || "Unknown"} ({swing.analysis?.overall_rating})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 max-w-6xl mx-auto">
        {canCompare && comparison ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Video Comparison */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">Before</Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(swing1.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <VideoPlayer src={swing1.videoUrl} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">After</Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(swing2.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <VideoPlayer src={swing2.videoUrl} />
              </div>
            </div>

            {/* Overall Score Comparison */}
            <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Before</p>
                    <p className="text-4xl font-bold">{comparison.overallBefore}</p>
                  </div>

                  <div className="flex flex-col items-center">
                    {getTrendIcon(comparison.overallDiff)}
                    <p
                      className={cn(
                        "text-2xl font-bold",
                        getTrendColor(comparison.overallDiff)
                      )}
                    >
                      {comparison.overallDiff > 0 ? "+" : ""}
                      {comparison.overallDiff.toFixed(1)}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">After</p>
                    <p className="text-4xl font-bold text-primary">
                      {comparison.overallAfter}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Section by Section</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {comparison.sections.map((section, i) => (
                    <motion.div
                      key={section.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                    >
                      <span className="font-medium capitalize">{section.name}</span>
                      <div className="flex items-center gap-6">
                        <span className="text-muted-foreground">{section.before}</span>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(section.diff)}
                          <span
                            className={cn("font-bold", getTrendColor(section.diff))}
                          >
                            {section.diff > 0 ? "+" : ""}
                            {section.diff.toFixed(1)}
                          </span>
                        </div>
                        <span className="font-bold text-primary">{section.after}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Improvements */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {comparison.sections
                      .filter((s) => s.diff > 0)
                      .sort((a, b) => b.diff - a.diff)
                      .map((section) => (
                        <li
                          key={section.name}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="capitalize">{section.name}</span>
                          <Badge variant="outline" className="bg-green-500/10 text-green-600">
                            +{section.diff.toFixed(1)}
                          </Badge>
                        </li>
                      ))}
                    {comparison.sections.filter((s) => s.diff > 0).length === 0 && (
                      <li className="text-muted-foreground text-sm">No improvements detected</li>
                    )}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-amber-600 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Focus Areas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {comparison.sections
                      .filter((s) => s.diff <= 0)
                      .sort((a, b) => a.diff - b.diff)
                      .map((section) => (
                        <li
                          key={section.name}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="capitalize">{section.name}</span>
                          <Badge variant="outline" className={section.diff < 0 ? "bg-red-500/10 text-red-600" : ""}>
                            {section.diff.toFixed(1)}
                          </Badge>
                        </li>
                      ))}
                    {comparison.sections.filter((s) => s.diff <= 0).length === 0 && (
                      <li className="text-muted-foreground text-sm">Great job! All areas improved!</li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <GitCompare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Select two swings to compare</h2>
            <p className="text-muted-foreground">
              Choose a "before" and "after" swing to see your progress
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Target icon import
function Target(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

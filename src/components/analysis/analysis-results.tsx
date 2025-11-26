"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Play,
  Dumbbell,
  Home,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn, getScoreColor, getScoreLabel, getSeverityColor } from "@/lib/utils";
import type { SwingAnalysis, AnalysisSection } from "@/types";

interface AnalysisResultsProps {
  analysis: SwingAnalysis;
  onViewDrill?: (drillName: string) => void;
}

function ScoreCircle({ score, size = "lg" }: { score: number; size?: "sm" | "lg" }) {
  const radius = size === "lg" ? 45 : 30;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 10) * circumference;
  const strokeWidth = size === "lg" ? 8 : 6;
  const viewBox = size === "lg" ? 120 : 80;

  return (
    <div className={`relative ${size === "lg" ? "w-[120px] h-[120px]" : "w-[80px] h-[80px]"}`}>
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx={viewBox / 2}
          cy={viewBox / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted"
        />
        <motion.circle
          cx={viewBox / 2}
          cy={viewBox / 2}
          r={radius}
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-bold ${size === "lg" ? "text-3xl" : "text-xl"}`}>
          {score}
        </span>
        <span className="text-xs text-muted-foreground">/10</span>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  section,
  icon: Icon,
}: {
  title: string;
  section: AnalysisSection;
  icon: React.ElementType;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {section.strengths.length} strengths, {section.improvements.length} areas to improve
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ScoreCircle score={section.score} size="sm" />
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      <motion.div
        initial={false}
        animate={{ height: isExpanded ? "auto" : 0 }}
        className="overflow-hidden"
      >
        <CardContent className="pt-0 space-y-4">
          {/* Strengths */}
          {section.strengths.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Strengths
              </h4>
              <ul className="space-y-1">
                {section.strengths.map((strength, i) => (
                  <li
                    key={i}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-green-500 mt-1">•</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {section.improvements.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Areas to Improve
              </h4>
              <div className="space-y-3">
                {section.improvements.map((improvement, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-muted/50 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{improvement.issue}</p>
                      <Badge
                        variant="outline"
                        className={cn(getSeverityColor(improvement.severity))}
                      >
                        {improvement.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <strong>Drill:</strong> {improvement.drill}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Impact:</strong> {improvement.impact}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </motion.div>
    </Card>
  );
}

export function AnalysisResults({ analysis, onViewDrill }: AnalysisResultsProps) {
  const overallScore = parseFloat(analysis.overall_rating.split("/")[0]);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {/* Overall Score */}
        <Card className="col-span-2 md:col-span-1 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <ScoreCircle score={overallScore} />
            <p className="text-sm font-semibold mt-2">Overall Score</p>
            <p className="text-xs text-muted-foreground">
              {getScoreLabel(overallScore)}
            </p>
          </CardContent>
        </Card>

        {/* Handicap Estimate */}
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center h-full">
            <Trophy className="w-8 h-8 text-amber-500 mb-2" />
            <p className="text-2xl font-bold">{analysis.handicap_estimate}</p>
            <p className="text-xs text-muted-foreground">Est. Handicap</p>
          </CardContent>
        </Card>

        {/* Swing Type */}
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center h-full">
            <Target className="w-8 h-8 text-blue-500 mb-2" />
            <p className="text-lg font-bold text-center">{analysis.swing_type}</p>
            <p className="text-xs text-muted-foreground">Swing Type</p>
          </CardContent>
        </Card>

        {/* Ball Flight */}
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center h-full">
            <TrendingUp className="w-8 h-8 text-purple-500 mb-2" />
            <p className="text-lg font-bold">{analysis.primary_ball_flight}</p>
            <p className="text-xs text-muted-foreground">Ball Flight</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Priority Fixes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Priority Fixes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.priority_fixes.map((fix, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="p-4 rounded-xl bg-background border"
              >
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                    {fix.rank}
                  </div>
                  <div className="flex-1 space-y-2">
                    <h4 className="font-semibold">{fix.issue}</h4>
                    <p className="text-sm text-muted-foreground">
                      {fix.explanation}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {fix.drills.map((drill, j) => (
                        <Button
                          key={j}
                          variant="outline"
                          size="sm"
                          onClick={() => onViewDrill?.(drill)}
                          className="text-xs"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          {drill}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Expected: {fix.expected_improvement}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-bold mb-4">Detailed Analysis</h3>
        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="w-full grid grid-cols-5 h-auto">
            <TabsTrigger value="setup" className="text-xs py-2">Setup</TabsTrigger>
            <TabsTrigger value="backswing" className="text-xs py-2">Backswing</TabsTrigger>
            <TabsTrigger value="transition" className="text-xs py-2">Transition</TabsTrigger>
            <TabsTrigger value="impact" className="text-xs py-2">Impact</TabsTrigger>
            <TabsTrigger value="follow_through" className="text-xs py-2">Finish</TabsTrigger>
          </TabsList>

          <TabsContent value="setup">
            <SectionCard
              title="Setup & Address"
              section={analysis.analysis.setup}
              icon={Target}
            />
          </TabsContent>
          <TabsContent value="backswing">
            <SectionCard
              title="Backswing"
              section={analysis.analysis.backswing}
              icon={TrendingUp}
            />
          </TabsContent>
          <TabsContent value="transition">
            <SectionCard
              title="Transition & Downswing"
              section={analysis.analysis.transition}
              icon={ArrowRight}
            />
          </TabsContent>
          <TabsContent value="impact">
            <SectionCard
              title="Impact"
              section={analysis.analysis.impact}
              icon={Target}
            />
          </TabsContent>
          <TabsContent value="follow_through">
            <SectionCard
              title="Follow-Through & Finish"
              section={analysis.analysis.follow_through}
              icon={CheckCircle}
            />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Practice Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Practice Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Range Session */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Dumbbell className="w-4 h-4 text-green-600" />
                  </div>
                  <h4 className="font-semibold">Range Session</h4>
                </div>
                <ul className="space-y-2">
                  {analysis.practice_plan.range_session.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* At Home Drills */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Home className="w-4 h-4 text-blue-600" />
                  </div>
                  <h4 className="font-semibold">At Home Drills</h4>
                </div>
                <ul className="space-y-2">
                  {analysis.practice_plan.at_home_drills.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-blue-500 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

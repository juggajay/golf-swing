"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Edit,
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  Award,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/stores/app-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProfilePage() {
  const { user, setUser, swings } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: user?.displayName || "Golfer",
    handicap: user?.handicap?.toString() || "",
    dominantHand: user?.dominantHand || "right",
    skillLevel: user?.skillLevel || "intermediate",
  });

  // Calculate stats
  const totalSwings = swings.length;
  const analyzedSwings = swings.filter((s) => s.analysis).length;
  const avgScore =
    analyzedSwings > 0
      ? (
          swings
            .filter((s) => s.analysis)
            .reduce(
              (acc, s) => acc + parseFloat(s.analysis!.overall_rating.split("/")[0]),
              0
            ) / analyzedSwings
        ).toFixed(1)
      : null;

  // Calculate improvement (mock data for now)
  const improvementPercentage = 15;

  const handleSave = () => {
    setUser({
      id: user?.id || "local-user",
      displayName: editForm.displayName,
      handicap: editForm.handicap ? parseFloat(editForm.handicap) : undefined,
      dominantHand: editForm.dominantHand as "left" | "right",
      skillLevel: editForm.skillLevel as any,
      createdAt: user?.createdAt || new Date(),
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen px-4 py-6 max-w-4xl mx-auto">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Card className="overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600" />
          <CardContent className="relative pt-0">
            <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-background border-4 border-background flex items-center justify-center shadow-lg">
                  <User className="w-12 h-12 text-muted-foreground" />
                </div>
                <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                  <Edit className="w-4 h-4" />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1 pb-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.displayName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, displayName: e.target.value })
                    }
                    className="text-2xl font-bold bg-transparent border-b-2 border-primary outline-none"
                  />
                ) : (
                  <h1 className="text-2xl font-bold">
                    {user?.displayName || "Golfer"}
                  </h1>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="secondary">
                    {user?.skillLevel || "Intermediate"}
                  </Badge>
                  {user?.handicap && (
                    <Badge variant="outline">HCP {user.handicap}</Badge>
                  )}
                  <Badge variant="outline" className="capitalize">
                    {user?.dominantHand || "Right"}-handed
                  </Badge>
                </div>
              </div>

              {/* Edit Button */}
              <div className="pb-4">
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>Save</Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>

            {/* Edit Form */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="grid md:grid-cols-3 gap-4 mt-6 pt-6 border-t"
              >
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Handicap
                  </label>
                  <input
                    type="number"
                    value={editForm.handicap}
                    onChange={(e) =>
                      setEditForm({ ...editForm, handicap: e.target.value })
                    }
                    placeholder="e.g., 15"
                    className="w-full h-11 px-4 rounded-xl border bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Dominant Hand
                  </label>
                  <Select
                    value={editForm.dominantHand}
                    onValueChange={(v: "right" | "left") =>
                      setEditForm({ ...editForm, dominantHand: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="right">Right</SelectItem>
                      <SelectItem value="left">Left</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Skill Level
                  </label>
                  <Select
                    value={editForm.skillLevel}
                    onValueChange={(v: "beginner" | "intermediate" | "advanced" | "professional") =>
                      setEditForm({ ...editForm, skillLevel: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6"
      >
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{totalSwings}</p>
            <p className="text-xs text-muted-foreground">Total Swings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{analyzedSwings}</p>
            <p className="text-xs text-muted-foreground">Analyzed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{avgScore || "--"}</p>
            <p className="text-xs text-muted-foreground">Avg Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">This Week</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {avgScore ? (
              <>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Improvement</span>
                    <span className="text-green-600 font-medium">
                      +{improvementPercentage}%
                    </span>
                  </div>
                  <Progress value={improvementPercentage} className="h-3" />
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary">
                      {avgScore}
                    </p>
                    <p className="text-xs text-muted-foreground">Current Avg</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-amber-500">7.0</p>
                    <p className="text-xs text-muted-foreground">Goal</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-500">
                      +0.5
                    </p>
                    <p className="text-xs text-muted-foreground">vs Last Week</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Analyze some swings to see your progress!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Settings Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 space-y-2"
      >
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-muted-foreground" />
              <span>Settings</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-muted-foreground" />
              <span>Subscription</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Free</Badge>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-destructive/10 transition-colors text-destructive">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </div>
            <ChevronRight className="w-5 h-5" />
          </CardContent>
        </Card>
      </motion.div>

      {/* App Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-sm text-muted-foreground mt-8"
      >
        <p>SwingAI v1.0.0</p>
        <p>Made with love for golfers everywhere</p>
      </motion.div>
    </div>
  );
}

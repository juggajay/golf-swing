"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Video,
  TrendingUp,
  Target,
  Award,
  ArrowRight,
  Play,
  History,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/stores/app-store";

const features = [
  {
    icon: Video,
    title: "Upload or Record",
    description: "Capture your swing from any angle using your phone or upload existing videos",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Zap,
    title: "AI Analysis",
    description: "Get instant feedback powered by advanced AI trained on professional swings",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: Target,
    title: "Visual Overlays",
    description: "See swing plane lines, body positions, and club path traced on your video",
    color: "from-green-500 to-green-600",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    description: "Monitor your improvement over time with detailed metrics and comparisons",
    color: "from-orange-500 to-orange-600",
  },
];

const quickStats = [
  { label: "Swings Analyzed", value: "0" },
  { label: "Avg Score", value: "--" },
  { label: "Best Score", value: "--" },
  { label: "This Week", value: "0" },
];

export default function HomePage() {
  const { swings } = useAppStore();
  const recentSwings = swings.slice(0, 3);

  return (
    <div className="px-4 py-6 space-y-8 max-w-6xl mx-auto">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 p-6 md:p-10 text-white"
      >
        <div className="absolute inset-0 golf-pattern opacity-10" />
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Perfect Your Swing with AI
          </h1>
          <p className="text-white/90 mb-6 text-lg">
            Upload your golf swing and get instant, professional-level analysis with actionable tips to lower your scores.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/analyze">
              <Button size="lg" className="bg-white text-green-600 hover:bg-white/90 shadow-xl">
                <Video className="w-5 h-5 mr-2" />
                Analyze Swing
              </Button>
            </Link>
            <Button size="lg" variant="glass">
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Decorative golf ball */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute right-10 bottom-10 w-20 h-20 rounded-full bg-white/20 hidden md:block" />
      </motion.section>

      {/* Quick Stats */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStats.map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.section>

      {/* Recent Swings or Get Started */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Swings</h2>
          {swings.length > 0 && (
            <Link href="/history">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          )}
        </div>

        {recentSwings.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-4">
            {recentSwings.map((swing) => (
              <Card key={swing.id} className="overflow-hidden">
                <div className="aspect-video bg-muted relative">
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
                  {swing.analysis && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                      {swing.analysis.overall_rating}
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    {new Date(swing.createdAt).toLocaleDateString()}
                  </p>
                  <p className="font-medium">
                    {swing.clubUsed || "Unknown Club"} - {swing.cameraAngle.toUpperCase()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No swings yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload your first swing to get started with AI-powered analysis
            </p>
            <Link href="/analyze">
              <Button>
                <Video className="w-4 h-4 mr-2" />
                Analyze Your First Swing
              </Button>
            </Link>
          </Card>
        )}
      </motion.section>

      {/* Features Grid */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xl font-bold mb-4">How It Works</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Quick Actions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid md:grid-cols-3 gap-4"
      >
        <Link href="/analyze" className="block">
          <Card className="h-full hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Video className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">New Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Upload or record a swing
                </p>
              </div>
              <ArrowRight className="w-5 h-5 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/drills" className="block">
          <Card className="h-full hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Drill Library</h3>
                <p className="text-sm text-muted-foreground">
                  Practice with purpose
                </p>
              </div>
              <ArrowRight className="w-5 h-5 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/history" className="block">
          <Card className="h-full hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <History className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Swing History</h3>
                <p className="text-sm text-muted-foreground">
                  Track your progress
                </p>
              </div>
              <ArrowRight className="w-5 h-5 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center py-8"
      >
        <Award className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Ready to improve?</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Join thousands of golfers using AI to transform their game
        </p>
        <Link href="/analyze">
          <Button size="xl" className="shadow-lg shadow-primary/25">
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </motion.section>
    </div>
  );
}

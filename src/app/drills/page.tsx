"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X, ArrowLeft, Clock, Dumbbell, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DrillCard } from "@/components/drills/drill-card";
import { drillsLibrary, getDrillsByCategory } from "@/lib/drills";
import type { Drill, DrillCategory } from "@/types";

const categories: { key: DrillCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "setup", label: "Setup" },
  { key: "backswing", label: "Backswing" },
  { key: "transition", label: "Transition" },
  { key: "impact", label: "Impact" },
  { key: "follow_through", label: "Follow-Through" },
  { key: "tempo", label: "Tempo" },
  { key: "short_game", label: "Short Game" },
];

export default function DrillsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<DrillCategory | "all">("all");
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null);

  const filteredDrills = drillsLibrary.filter((drill) => {
    const matchesSearch =
      searchQuery === "" ||
      drill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drill.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || drill.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (selectedDrill) {
    return (
      <div className="min-h-screen">
        {/* Header */}
        <div className="sticky top-14 md:top-0 z-30 bg-background/95 backdrop-blur-lg border-b">
          <div className="flex items-center h-14 px-4 max-w-4xl mx-auto">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSelectedDrill(null)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-bold text-lg ml-2">Drill Details</h1>
          </div>
        </div>

        {/* Drill Detail */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-6 max-w-4xl mx-auto space-y-6"
        >
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="capitalize">
                {selectedDrill.category.replace("_", " ")}
              </Badge>
              <Badge
                variant="outline"
                className={
                  selectedDrill.difficulty === "easy"
                    ? "bg-green-500/10 text-green-600"
                    : selectedDrill.difficulty === "medium"
                    ? "bg-yellow-500/10 text-yellow-600"
                    : "bg-red-500/10 text-red-600"
                }
              >
                {selectedDrill.difficulty}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold">{selectedDrill.name}</h1>
            <p className="text-muted-foreground mt-2">
              {selectedDrill.description}
            </p>
          </div>

          {/* Quick Info */}
          <div className="flex flex-wrap gap-4">
            {selectedDrill.duration && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{selectedDrill.duration}</span>
              </div>
            )}
            {selectedDrill.equipment && selectedDrill.equipment.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Dumbbell className="w-4 h-4 text-muted-foreground" />
                <span>{selectedDrill.equipment.join(", ")}</span>
              </div>
            )}
          </div>

          {/* Video Placeholder */}
          <Card className="overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-white/90 dark:bg-black/50 flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Dumbbell className="w-8 h-8 text-primary" />
                </div>
                <p className="text-muted-foreground">Video coming soon</p>
              </div>
            </div>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How to Perform This Drill</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {selectedDrill.instructions.map((instruction, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      {i + 1}
                    </div>
                    <p className="text-sm leading-relaxed pt-1">{instruction}</p>
                  </motion.li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Related Faults */}
          {selectedDrill.relatedFaults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fixes These Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedDrill.relatedFaults.map((fault, i) => (
                    <Badge key={i} variant="secondary" className="capitalize">
                      {fault}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action */}
          <div className="flex gap-4">
            <Button className="flex-1" size="lg">
              <CheckCircle className="w-5 h-5 mr-2" />
              Mark as Completed
            </Button>
            <Button variant="outline" size="lg">
              Add to Practice Plan
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-14 md:top-0 z-30 bg-background/95 backdrop-blur-lg border-b">
        <div className="px-4 py-4 max-w-6xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="font-bold text-xl">Drill Library</h1>
            <Badge variant="secondary">{filteredDrills.length} drills</Badge>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search drills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="overflow-x-auto -mx-4 px-4">
            <div className="flex gap-2 min-w-max pb-2">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === cat.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Drills Grid */}
      <div className="px-4 py-6 max-w-6xl mx-auto">
        <AnimatePresence mode="popLayout">
          {filteredDrills.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredDrills.map((drill, i) => (
                <motion.div
                  key={drill.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <DrillCard
                    drill={drill}
                    onClick={() => setSelectedDrill(drill)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No drills found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                Clear Filters
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

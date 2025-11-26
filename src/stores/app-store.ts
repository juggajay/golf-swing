import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Swing,
  SwingAnalysis,
  OverlaySettings,
  AnalysisProgress,
  UserProfile,
} from "@/types";

interface AppState {
  // User
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;

  // Current swing being analyzed
  currentSwing: Swing | null;
  setCurrentSwing: (swing: Swing | null) => void;

  // Swing history
  swings: Swing[];
  addSwing: (swing: Swing) => void;
  updateSwing: (id: string, updates: Partial<Swing>) => void;
  deleteSwing: (id: string) => void;

  // Analysis progress
  analysisProgress: AnalysisProgress | null;
  setAnalysisProgress: (progress: AnalysisProgress | null) => void;

  // Video overlay settings
  overlaySettings: OverlaySettings;
  toggleOverlay: (key: keyof OverlaySettings) => void;
  setOverlaySettings: (settings: OverlaySettings) => void;

  // UI state
  isAnalyzing: boolean;
  setIsAnalyzing: (value: boolean) => void;

  // Comparison mode
  comparisonSwings: [Swing | null, Swing | null];
  setComparisonSwing: (index: 0 | 1, swing: Swing | null) => void;
  clearComparison: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User
      user: null,
      setUser: (user) => set({ user }),

      // Current swing
      currentSwing: null,
      setCurrentSwing: (swing) => set({ currentSwing: swing }),

      // Swings history
      swings: [],
      addSwing: (swing) =>
        set((state) => ({ swings: [swing, ...state.swings] })),
      updateSwing: (id, updates) =>
        set((state) => ({
          swings: state.swings.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
          currentSwing:
            state.currentSwing?.id === id
              ? { ...state.currentSwing, ...updates }
              : state.currentSwing,
        })),
      deleteSwing: (id) =>
        set((state) => ({
          swings: state.swings.filter((s) => s.id !== id),
          currentSwing:
            state.currentSwing?.id === id ? null : state.currentSwing,
        })),

      // Analysis progress
      analysisProgress: null,
      setAnalysisProgress: (progress) => set({ analysisProgress: progress }),

      // Overlay settings
      overlaySettings: {
        swingPlane: true,
        spine: true,
        clubPath: false,
        hipLine: false,
        shoulderLine: false,
        targetLine: true,
      },
      toggleOverlay: (key) =>
        set((state) => ({
          overlaySettings: {
            ...state.overlaySettings,
            [key]: !state.overlaySettings[key],
          },
        })),
      setOverlaySettings: (settings) => set({ overlaySettings: settings }),

      // UI state
      isAnalyzing: false,
      setIsAnalyzing: (value) => set({ isAnalyzing: value }),

      // Comparison
      comparisonSwings: [null, null],
      setComparisonSwing: (index, swing) =>
        set((state) => {
          const newSwings = [...state.comparisonSwings] as [
            Swing | null,
            Swing | null
          ];
          newSwings[index] = swing;
          return { comparisonSwings: newSwings };
        }),
      clearComparison: () => set({ comparisonSwings: [null, null] }),
    }),
    {
      name: "golf-swing-storage",
      partialize: (state) => ({
        swings: state.swings,
        overlaySettings: state.overlaySettings,
        user: state.user,
      }),
    }
  )
);

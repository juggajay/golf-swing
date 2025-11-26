"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Video,
  History,
  Target,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/analyze", icon: Video, label: "Analyze" },
  { href: "/history", icon: History, label: "History" },
  { href: "/drills", icon: Target, label: "Drills" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function MobileNav() {
  const pathname = usePathname();
  const isFullscreenRecorderOpen = useAppStore((state) => state.isFullscreenRecorderOpen);

  // Hide nav when fullscreen recorder is open
  if (isFullscreenRecorderOpen) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-lg safe-area-bottom md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-colors touch-target",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className="w-5 h-5 relative z-10" />
              <span className="text-[10px] font-medium relative z-10">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

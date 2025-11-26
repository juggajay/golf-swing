"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Video,
  History,
  Target,
  User,
  GitCompare,
  Settings,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { href: "/", icon: Home, label: "Dashboard" },
  { href: "/analyze", icon: Video, label: "Analyze Swing" },
  { href: "/history", icon: History, label: "My Swings" },
  { href: "/compare", icon: GitCompare, label: "Compare" },
  { href: "/drills", icon: Target, label: "Drills" },
];

const bottomNavItems = [
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/help", icon: HelpCircle, label: "Help" },
];

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col border-r bg-card z-50">
      {/* Logo */}
      <div className="p-6 border-b">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25">
            <span className="text-white text-xl">⛳</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">SwingAI</h1>
            <p className="text-xs text-muted-foreground">Golf Analyzer</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className="w-5 h-5 relative z-10" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t space-y-1">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive
                  ? "text-primary bg-primary/10 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Pro Badge */}
      <div className="p-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/20">
          <p className="text-sm font-semibold text-green-600 dark:text-green-400">
            Free Plan
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            3 analyses remaining
          </p>
          <button className="mt-3 w-full py-2 px-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity">
            Upgrade to Pro
          </button>
        </div>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
}

export function Header({ title = "SwingAI", showBack }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-lg safe-area-top">
      <div className="flex items-center justify-between h-14 px-4 md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md shadow-green-500/25">
            <span className="text-white text-sm">⛳</span>
          </div>
          <span className="font-bold">{title}</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm">
            <Bell className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

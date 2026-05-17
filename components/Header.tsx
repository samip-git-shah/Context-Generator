"use client";

import Link from "next/link";
import { Settings, LifeBuoy, Sparkles, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/config/app.config";

export function Header({
  keyReady,
  onOpenSettings,
}: {
  keyReady: boolean;
  onOpenSettings: () => void;
}) {
  return (
    <header className="flex items-center justify-between border-b border-primary/30 bg-card/80 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <span className="text-base font-bold tracking-tight neon-text">
          {APP_CONFIG.brand.name}
        </span>
        <span className="hidden text-sm text-muted-foreground sm:inline">
          — {APP_CONFIG.brand.tagline}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {keyReady ? (
          <Button size="sm" variant="outline" onClick={onOpenSettings}>
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        ) : (
          <Button size="sm" onClick={onOpenSettings} className="animate-pulse">
            <KeyRound className="h-4 w-4" />
            Add API key
          </Button>
        )}
        <Link href="/support" aria-label="Support">
          <Button size="icon" variant="ghost">
            <LifeBuoy className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </header>
  );
}

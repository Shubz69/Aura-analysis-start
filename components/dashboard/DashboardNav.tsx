"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calculator,
  BookOpen,
  BarChart3,
  Trophy,
  User,
  Shield,
} from "lucide-react";

const navItems = [
  { href: "/aura-analysis", label: "Overview", icon: LayoutDashboard },
  { href: "/aura-analysis/calculator", label: "Trade Calculator", icon: Calculator },
  { href: "/aura-analysis/journal", label: "Trade Journal", icon: BookOpen },
  { href: "/aura-analysis/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/aura-analysis/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/aura-analysis/profile", label: "Profile", icon: User },
  { href: "/aura-analysis/admin", label: "Admin", icon: Shield },
];

export function DashboardNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1" aria-label="Dashboard navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/aura-analysis" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

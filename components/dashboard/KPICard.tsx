"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function KPICard({ title, value, subtitle, trend = "neutral", className }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn("glass", className)}>
        <CardHeader className="pb-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
        </CardHeader>
        <CardContent>
          <p
            className={cn(
              "text-2xl font-bold",
              trend === "up" && "text-emerald-500",
              trend === "down" && "text-red-500"
            )}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

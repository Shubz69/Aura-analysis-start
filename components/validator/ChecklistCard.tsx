"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, ImageIcon } from "lucide-react";
import type {
  ChecklistSectionConfig,
  PatternSectionConfig,
  ChecklistItem,
} from "@/lib/validator/checklistSections";
import { isPatternSection } from "@/lib/validator/checklistSections";

interface ChecklistCardProps {
  section: ChecklistSectionConfig | PatternSectionConfig;
  checked: Set<string>;
  onToggle: (id: string) => void;
  sectionScore: number;
  className?: string;
}

function ChecklistItemRow({
  item,
  checked,
  onToggle,
}: {
  item: ChecklistItem;
  checked: Set<string>;
  onToggle: (id: string) => void;
}) {
  const isChecked = checked.has(item.id);
  return (
    <div
      role="checkbox"
      tabIndex={0}
      aria-checked={isChecked}
      aria-label={item.label}
      onClick={() => onToggle(item.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle(item.id);
        }
      }}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border border-transparent p-2.5 transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card",
        isChecked && "bg-muted/40"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
          isChecked
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-muted-foreground/50 bg-background"
        )}
      >
        {isChecked ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
      </span>
      <span className="text-sm leading-snug text-foreground">{item.label}</span>
      {item.points > 0 && (
        <span className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums">
          +{item.points}%
        </span>
      )}
    </div>
  );
}

function ReferenceImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted/60">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 400px) 100vw, 340px"
        unoptimized
        onError={(e) => {
          const target = e.currentTarget;
          target.style.display = "none";
          target.parentElement
            ?.querySelector(".validator-img-fallback")
            ?.classList.remove("hidden");
        }}
      />
      <div
        className="validator-img-fallback absolute inset-0 hidden flex items-center justify-center bg-muted/80"
        aria-hidden
      >
        <ImageIcon className="h-10 w-10 text-muted-foreground" />
      </div>
    </div>
  );
}

export function ChecklistCard({
  section,
  checked,
  onToggle,
  sectionScore,
  className,
}: ChecklistCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-border/80 bg-card shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="p-4 pb-0">
        <ReferenceImage
          src={section.imagePath}
          alt={`Reference: ${section.title}`}
        />
      </div>
      <CardHeader className="pb-2 pt-4">
        <h3 className="text-lg font-semibold text-primary">
          {section.title}
        </h3>
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        {isPatternSection(section) ? (
          <div className="space-y-4">
            {section.subPatterns.map((sub) => (
              <div key={sub.id}>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {sub.title}
                </p>
                <div className="space-y-0.5">
                  {sub.items.map((item) => (
                    <ChecklistItemRow
                      key={item.id}
                      item={item}
                      checked={checked}
                      onToggle={onToggle}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0.5">
            {section.items.map((item) => (
              <ChecklistItemRow
                key={item.id}
                item={item}
                checked={checked}
                onToggle={onToggle}
              />
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
          <span className="text-sm text-muted-foreground">Section score</span>
          <span className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            {sectionScore}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface PairOption {
  symbol: string;
  displayName: string;
}

/** Optional: pass grouped options for section headers (e.g. by asset class). */
export interface PairOptionGroup {
  label: string;
  options: PairOption[];
}

interface PairSelectProps {
  value: string;
  /** Flat list of options (used if groups not provided). */
  options: PairOption[];
  /** Optional grouped options; if provided, dropdown shows sections by label. */
  optionGroups?: PairOptionGroup[];
  onValueChange: (symbol: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function PairSelect({
  value,
  options,
  optionGroups,
  onValueChange,
  placeholder = "Select pair",
  className,
  disabled,
}: PairSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const flatFromGroups = useMemo(
    () => (optionGroups ? optionGroups.flatMap((g) => g.options) : options),
    [optionGroups, options]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return optionGroups ?? [{ label: "", options }];
    const q = search.toLowerCase().trim();
    const filteredFlat = flatFromGroups.filter(
      (o) =>
        o.symbol.toLowerCase().includes(q) ||
        o.displayName.toLowerCase().includes(q)
    );
    if (!optionGroups) return [{ label: "", options: filteredFlat }];
    const groups: PairOptionGroup[] = [];
    for (const g of optionGroups) {
      const match = g.options.filter(
        (o) =>
          o.symbol.toLowerCase().includes(q) ||
          o.displayName.toLowerCase().includes(q)
      );
      if (match.length) groups.push({ label: g.label, options: match });
    }
    return groups;
  }, [optionGroups, options, flatFromGroups, search]);

  const filteredFlat = useMemo(
    () => (Array.isArray(filtered) && filtered[0]?.label === "" ? filtered[0].options : filtered.flatMap((g) => g.options)),
    [filtered]
  );

  const selectedOption = useMemo(
    () => flatFromGroups.find((o) => o.symbol === value),
    [flatFromGroups, value]
  );

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow",
          open && "ring-2 ring-ring ring-offset-2"
        )}
      >
        <span className="truncate">
          {selectedOption ? `${selectedOption.symbol} — ${selectedOption.displayName}` : placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 opacity-50 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 z-50 mt-1 w-full min-w-[14rem] rounded-lg border border-border bg-popover text-popover-foreground shadow-lg"
          role="listbox"
        >
          <div className="border-b border-border p-2">
            <Input
              placeholder="Search pair..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-sm bg-background"
              autoFocus
              onKeyDown={(e) => e.stopPropagation()}
              aria-label="Search pairs"
            />
          </div>
          <div className="max-h-60 overflow-auto p-1.5">
            {filteredFlat.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No pair found.</p>
            ) : Array.isArray(filtered) && filtered[0]?.label === "" ? (
              filtered[0].options.map((o) => (
                <button
                  key={o.symbol}
                  type="button"
                  role="option"
                  aria-selected={o.symbol === value}
                  className={cn(
                    "flex w-full cursor-pointer items-center rounded-md py-2.5 px-2.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                    o.symbol === value && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => {
                    onValueChange(o.symbol);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <span className="font-medium">{o.symbol}</span>
                  <span className="ml-2 text-muted-foreground">{o.displayName}</span>
                </button>
              ))
            ) : (
              (filtered as PairOptionGroup[]).map((group) => (
                <div key={group.label}>
                  <div className="sticky top-0 bg-muted/80 px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.label}
                  </div>
                  {group.options.map((o) => (
                    <button
                      key={o.symbol}
                      type="button"
                      role="option"
                      aria-selected={o.symbol === value}
                      className={cn(
                        "flex w-full cursor-pointer items-center rounded-md py-2 px-2.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                        o.symbol === value && "bg-accent text-accent-foreground"
                      )}
                      onClick={() => {
                        onValueChange(o.symbol);
                        setOpen(false);
                        setSearch("");
                      }}
                    >
                      <span className="font-medium">{o.symbol}</span>
                      <span className="ml-2 text-muted-foreground truncate">{o.displayName}</span>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

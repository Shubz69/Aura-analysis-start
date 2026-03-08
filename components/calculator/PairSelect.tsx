"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface PairOption {
  symbol: string;
  displayName: string;
}

interface PairSelectProps {
  value: string;
  options: PairOption[];
  onValueChange: (symbol: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function PairSelect({
  value,
  options,
  onValueChange,
  placeholder = "Select pair",
  className,
  disabled,
}: PairSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase().trim();
    return options.filter(
      (o) =>
        o.symbol.toLowerCase().includes(q) ||
        o.displayName.toLowerCase().includes(q)
    );
  }, [options, search]);

  const selectedOption = useMemo(
    () => options.find((o) => o.symbol === value),
    [options, value]
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
            {filtered.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No pair found.</p>
            ) : (
              filtered.map((o) => (
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}

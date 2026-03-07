"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

const DEFAULT_MAIN_LOGIN_URL = "https://aura-fx.com/login";

export function HomeCTA() {
  const envUrl = process.env.NEXT_PUBLIC_MAIN_LOGIN_URL;
  const href =
    envUrl && envUrl.trim() && envUrl !== "/" ? envUrl.trim() : DEFAULT_MAIN_LOGIN_URL;

  return (
    <div className="flex gap-4 justify-center flex-wrap">
      <Button asChild>
        <a href={href} target="_self" rel="noopener noreferrer">
          Sign in on main site
        </a>
      </Button>
      <Button variant="outline" asChild>
        <Link href="/dashboard">Open dashboard</Link>
      </Button>
    </div>
  );
}

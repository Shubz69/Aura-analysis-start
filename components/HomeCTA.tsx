"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getMainLoginUrl, DASHBOARD_ROUTE } from "@/lib/appConfig";

export function HomeCTA() {
  const returnUrl =
    typeof window !== "undefined" ? `${window.location.origin}${DASHBOARD_ROUTE}` : "";
  const signInHref = getMainLoginUrl(returnUrl);

  return (
    <div className="flex gap-4 justify-center flex-wrap">
      <Button asChild>
        <a href={signInHref} target="_self" rel="noopener noreferrer">
          Sign in on main site
        </a>
      </Button>
      <Button variant="outline" asChild>
        <Link href={DASHBOARD_ROUTE}>Open dashboard</Link>
      </Button>
    </div>
  );
}

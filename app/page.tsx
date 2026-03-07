import { HomeCTA } from "@/components/HomeCTA";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-4xl font-bold tracking-tight">Aura Analysis</h1>
        <p className="text-muted-foreground">
          FX Trader Dashboard — journal trades, track performance, and grow with your community.
        </p>
        <p className="text-sm text-muted-foreground">
          Use your existing Aura FX account. Log in on the main site, then return here.
        </p>
        <HomeCTA />
      </div>
    </div>
  );
}

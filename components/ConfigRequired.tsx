import Link from "next/link";

export function ConfigRequired() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-2xl font-bold tracking-tight">Configuration required</h1>
        <p className="text-muted-foreground text-sm">
          Set <code className="text-foreground bg-muted px-1.5 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="text-foreground bg-muted px-1.5 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your
          deployment (e.g. Vercel project settings), then redeploy.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

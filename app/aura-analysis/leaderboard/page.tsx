import { LeaderboardClient } from "./LeaderboardClient";

export default async function LeaderboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
      <LeaderboardClient rows={[]} isAdmin={false} />
    </div>
  );
}

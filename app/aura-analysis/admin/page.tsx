import { AdminClient } from "./AdminClient";

export default async function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
      <AdminClient
        users={[]}
        tradesCount={0}
        assets={[]}
      />
    </div>
  );
}

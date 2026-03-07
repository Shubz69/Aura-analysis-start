import { ChecklistTemplatesClient } from "./ChecklistTemplatesClient";

export default async function ChecklistTemplatesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Checklist Templates</h1>
      <ChecklistTemplatesClient templates={[]} isAdmin={false} />
    </div>
  );
}

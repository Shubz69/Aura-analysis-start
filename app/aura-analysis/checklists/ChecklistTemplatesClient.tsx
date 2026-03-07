"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/EmptyState";

interface Item {
  id: string;
  label: string;
  sort_order: number;
  is_required: boolean;
}

interface Template {
  id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  checklist_template_items?: Item[];
}

interface ChecklistTemplatesClientProps {
  templates: Template[];
  isAdmin: boolean;
}

export function ChecklistTemplatesClient({ templates, isAdmin }: ChecklistTemplatesClientProps) {
  if (templates.length === 0) {
    return (
      <EmptyState
        title="No checklist templates"
        description="Admins can create default trade checklists. Use them when adding a trade to score your setup."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {templates.map((t) => (
        <Card key={t.id} className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {t.name}
              {t.is_default && (
                <span className="text-xs font-normal text-muted-foreground">(Default)</span>
              )}
            </CardTitle>
            {t.description && (
              <CardDescription>{t.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(t.checklist_template_items ?? [])
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((item) => (
                  <li key={item.id} className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">•</span>
                    {item.label}
                    {item.is_required && (
                      <span className="text-xs text-muted-foreground">(required)</span>
                    )}
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

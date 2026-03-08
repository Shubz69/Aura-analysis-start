import { redirect } from "next/navigation";

/** Checklist lives in Trade Calculator; redirect so one source of truth. */
export default function ChecklistTemplatesPage() {
  redirect("/aura-analysis/calculator");
}

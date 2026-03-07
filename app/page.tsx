import { redirect } from "next/navigation";
import { DASHBOARD_ROUTE } from "@/lib/appConfig";

export default function HomePage() {
  redirect(DASHBOARD_ROUTE);
}

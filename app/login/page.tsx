import { redirect } from "next/navigation";
import { DASHBOARD_ROUTE } from "@/lib/appConfig";

export default function LoginPage() {
  redirect(DASHBOARD_ROUTE);
}

import { redirect } from "next/navigation";
import { DASHBOARD_ROUTE } from "@/lib/appConfig";

export default function SignupPage() {
  redirect(DASHBOARD_ROUTE);
}

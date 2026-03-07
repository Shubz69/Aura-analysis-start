import { redirect } from "next/navigation";
import { getMainLoginUrl, getAppOrigin, DASHBOARD_ROUTE } from "@/lib/appConfig";

export default function LoginPage() {
  const returnUrl = getAppOrigin() ? `${getAppOrigin()}${DASHBOARD_ROUTE}` : undefined;
  redirect(getMainLoginUrl(returnUrl));
}

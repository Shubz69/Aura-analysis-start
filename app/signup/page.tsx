import { redirect } from "next/navigation";
import { BYPASS_AUTH, DASHBOARD_ROUTE, getMainLoginUrl, getAppOrigin } from "@/lib/appConfig";

export default function SignupPage() {
  if (BYPASS_AUTH) redirect(DASHBOARD_ROUTE);
  const returnUrl = getAppOrigin() ? `${getAppOrigin()}${DASHBOARD_ROUTE}` : undefined;
  redirect(getMainLoginUrl(returnUrl));
}

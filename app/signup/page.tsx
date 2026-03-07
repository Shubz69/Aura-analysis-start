import { redirect } from "next/navigation";
import { getMainLoginUrl, getAppOrigin, DASHBOARD_ROUTE } from "@/lib/appConfig";

export default function SignupPage() {
  const returnUrl = getAppOrigin() ? `${getAppOrigin()}${DASHBOARD_ROUTE}` : undefined;
  redirect(getMainLoginUrl(returnUrl));
}

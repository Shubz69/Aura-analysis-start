import { redirect } from "next/navigation";

const MAIN_LOGIN_URL = process.env.NEXT_PUBLIC_MAIN_LOGIN_URL || "/";

export default function SignupPage() {
  redirect(MAIN_LOGIN_URL);
}

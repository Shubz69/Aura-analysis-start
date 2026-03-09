import { AuthProvider } from "@/components/AuthProvider";
import { DashboardLayoutClient } from "./DashboardLayoutClient";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </AuthProvider>
  );
}

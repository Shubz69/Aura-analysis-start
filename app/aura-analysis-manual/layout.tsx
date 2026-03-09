import { AuthProvider } from "@/components/AuthProvider";
import { AuraAnalysisManualShell } from "@/components/aura-analysis/AuraAnalysisManualShell";

export default function AuraAnalysisManualLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuraAnalysisManualShell>{children}</AuraAnalysisManualShell>
    </AuthProvider>
  );
}

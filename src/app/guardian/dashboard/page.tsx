import type { Metadata } from "next";
import RequireRoleAuth from "@/components/RequireRoleAuth";
import GuardianDashboardContent from "@/components/dashboard/GuardianDashboardContent";

export const metadata: Metadata = {
  title: "গার্ডিয়ান ড্যাশবোর্ড | Uttolon",
  robots: { index: false, follow: false },
};

export default function GuardianDashboardPage() {
  return (
    <RequireRoleAuth role="guardian" loginPath="/guardian/login">
      <GuardianDashboardContent />
    </RequireRoleAuth>
  );
}

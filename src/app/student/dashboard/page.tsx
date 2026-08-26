import type { Metadata } from "next";
import RequireRoleAuth from "@/components/RequireRoleAuth";
import StudentDashboardContent from "@/components/dashboard/StudentDashboardContent";

export const metadata: Metadata = {
  title: "স্টুডেন্ট ড্যাশবোর্ড | Uttolon",
  robots: { index: false, follow: false },
};

export default function StudentDashboardPage() {
  return (
    <RequireRoleAuth role="student" loginPath="/student/login">
      <StudentDashboardContent />
    </RequireRoleAuth>
  );
}

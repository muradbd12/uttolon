import type { Metadata } from "next";
import RequireRoleAuth from "@/components/RequireRoleAuth";
import TeacherDashboardContent from "@/components/dashboard/TeacherDashboardContent";

export const metadata: Metadata = {
  title: "শিক্ষক ড্যাশবোর্ড | Uttolon",
  robots: { index: false, follow: false },
};

export default function TeacherDashboardPage() {
  return (
    <RequireRoleAuth role="teacher" loginPath="/teacher/login">
      <TeacherDashboardContent />
    </RequireRoleAuth>
  );
}

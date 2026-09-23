"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";

  // লগইন পেজে সাইডবার দেখানোর দরকার নেই — লগইন না করা পর্যন্ত মেনুর
  // কোনো আইটেমই তো ব্যবহার করা যাবে না।
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-paper-raised">
      <AdminSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

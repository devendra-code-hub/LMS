"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const roleRedirect: Record<string, string> = {
  admin:        "/dashboard/sales",
  sales:        "/dashboard/sales",
  sanction:     "/dashboard/sanction",
  disbursement: "/dashboard/disbursement",
  collection:   "/dashboard/collection",
};

export default function DashboardHome() {
  const router = useRouter();
  useEffect(() => {
    const stored = localStorage.getItem("lms_user");
    if (!stored) { router.push("/login"); return; }
    const user = JSON.parse(stored);
    router.push(roleRedirect[user.role] || "/login");
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-400">Redirecting...</p>
    </div>
  );
}
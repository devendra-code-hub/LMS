"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { clearAuth } from "@/lib/auth";
import { UserRole } from "@/types";

const navItems = [
  { href: "/dashboard/sales",        label: "Sales",        roles: ["admin","sales"],         icon: "👥" },
  { href: "/dashboard/sanction",     label: "Sanction",     roles: ["admin","sanction"],       icon: "✅" },
  { href: "/dashboard/disbursement", label: "Disbursement", roles: ["admin","disbursement"],   icon: "💸" },
  { href: "/dashboard/collection",   label: "Collection",   roles: ["admin","collection"],     icon: "💰" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; role: UserRole } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("lms_user");
    if (!stored) { router.push("/login"); return; }
    const parsed = JSON.parse(stored);
    if (parsed.role === "borrower") { router.push("/borrower/dashboard"); return; }
    setUser(parsed);
  }, [router]);

  const logout = () => { clearAuth(); router.push("/login"); };
  const allowedNav = navItems.filter((n) => n.roles.includes(user?.role || ""));

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-60 bg-white shadow-sm flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-indigo-600">CreditSea</h1>
          <p className="text-xs text-gray-400 mt-1 capitalize">{user.role} Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {allowedNav.map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition
                ${pathname === item.href ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <p className="text-xs text-gray-600 font-medium mb-1">{user.name}</p>
          <p className="text-xs text-gray-400 mb-2 capitalize">{user.role}</p>
          <button onClick={logout} className="text-xs text-red-500 hover:underline">Logout</button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
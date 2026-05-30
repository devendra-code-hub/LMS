"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const user = getUser();
    if (!user) { router.push("/login"); return; }
    if (user.role === "borrower") router.push("/borrower/dashboard");
    else router.push("/dashboard");
  }, [router]);
  return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
}
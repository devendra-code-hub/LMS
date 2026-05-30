"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function PersonalDetailsPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    pan: "", dob: "", monthlySalary: "", employmentMode: "Salaried",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await api.post("/borrower/personal", {
        ...form, monthlySalary: Number(form.monthlySalary),
      });
      router.push("/borrower/upload");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { reason?: string; message?: string } } };
      setError(e.response?.data?.reason || e.response?.data?.message || "Eligibility check failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">Step 2 of 4</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Personal Details</h2>
          <p className="text-gray-500 text-sm">We'll check your eligibility instantly</p>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            ❌ {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
            <input type="text" required placeholder="ABCDE1234F" value={form.pan}
              onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 uppercase" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input type="date" required value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Salary (₹)</label>
            <input type="number" required min={0} value={form.monthlySalary}
              onChange={(e) => setForm({ ...form, monthlySalary: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employment Mode</label>
            <select value={form.employmentMode}
              onChange={(e) => setForm({ ...form, employmentMode: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option>Salaried</option>
              <option>Self-Employed</option>
              <option>Unemployed</option>
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50 mt-2">
            {loading ? "Checking eligibility..." : "Check Eligibility & Continue →"}
          </button>
        </form>
      </div>
    </div>
  );
}
"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function ApplyPage() {
  const router = useRouter();
  const [amount, setAmount] = useState(100000);
  const [tenure, setTenure] = useState(180);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const calc = useMemo(() => {
    const SI = (amount * 12 * tenure) / (365 * 100);
    return { si: SI.toFixed(2), total: (amount + SI).toFixed(2) };
  }, [amount, tenure]);

  const handleApply = async () => {
    setLoading(true); setError("");
    try {
      await api.post("/borrower/apply", { amount, tenure });
      router.push("/borrower/dashboard");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Application failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg">
        <div className="mb-6">
          <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">Step 4 of 4</span>
          <h2 className="text-2xl font-bold text-gray-800 mt-2">Configure Your Loan</h2>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Loan Amount</label>
              <span className="text-indigo-600 font-bold">₹{amount.toLocaleString()}</span>
            </div>
            <input type="range" min={50000} max={500000} step={10000} value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-indigo-600" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>₹50,000</span><span>₹5,00,000</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Tenure</label>
              <span className="text-indigo-600 font-bold">{tenure} days</span>
            </div>
            <input type="range" min={30} max={365} step={1} value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              className="w-full accent-indigo-600" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>30 days</span><span>365 days</span>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-xl p-4 space-y-2">
            <h3 className="font-semibold text-gray-700 mb-3">Loan Summary</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Principal Amount</span>
              <span className="font-medium">₹{amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Interest Rate</span>
              <span className="font-medium">12% p.a.</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Simple Interest</span>
              <span className="font-medium">₹{Number(calc.si).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t pt-2 mt-2">
              <span>Total Repayment</span>
              <span className="text-indigo-600">₹{Number(calc.total).toLocaleString()}</span>
            </div>
          </div>

          <button onClick={handleApply} disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 text-lg">
            {loading ? "Submitting..." : "Apply for Loan 🚀"}
          </button>
        </div>
      </div>
    </div>
  );
}
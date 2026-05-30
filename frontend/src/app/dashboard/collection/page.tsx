"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Loan } from "@/types";

interface PaymentForm { utrNumber: string; amount: string; paymentDate: string; }

export default function CollectionPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState<Loan | null>(null);
  const [form, setForm] = useState<PaymentForm>({ utrNumber: "", amount: "", paymentDate: "" });
  const [payError, setPayError] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  const fetchLoans = () => {
    api.get<Loan[]>("/collection/active-loans").then((r) => setLoans(r.data)).finally(() => setLoading(false));
  };
  useEffect(fetchLoans, []);

  const recordPayment = async () => {
    if (!payModal) return;
    setPayLoading(true); setPayError("");
    try {
      const res = await api.post(`/collection/${payModal._id}/payment`, {
        utrNumber: form.utrNumber, amount: Number(form.amount), paymentDate: form.paymentDate,
      });
      alert(res.data.message);
      setPayModal(null);
      setForm({ utrNumber: "", amount: "", paymentDate: "" });
      fetchLoans();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setPayError(e.response?.data?.message || "Error recording payment");
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Collection — Active Loans</h2>
      {loading ? <div className="text-gray-500">Loading...</div> : (
        <div className="space-y-4">
          {loans.length === 0 && <div className="bg-white rounded-2xl p-8 text-center text-gray-400">No active loans</div>}
          {loans.map((loan) => {
            const borrower = loan.borrower as unknown as { name: string; email: string };
            const outstanding = loan.totalRepayment - loan.amountPaid;
            const pct = Math.min((loan.amountPaid / loan.totalRepayment) * 100, 100);
            return (
              <div key={loan._id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-gray-800">{borrower.name}</p>
                    <p className="text-sm text-gray-500">{borrower.email}</p>
                  </div>
                  <button onClick={() => { setPayModal(loan); setPayError(""); }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition">
                    + Record Payment
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                  <div><p className="text-gray-400">Total</p><p className="font-medium">₹{loan.totalRepayment.toLocaleString()}</p></div>
                  <div><p className="text-gray-400">Paid</p><p className="font-medium text-green-600">₹{loan.amountPaid.toLocaleString()}</p></div>
                  <div><p className="text-gray-400">Outstanding</p><p className="font-medium text-red-500">₹{outstanding.toFixed(2)}</p></div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {payModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96">
            <h3 className="font-bold text-gray-800 mb-1">Record Payment</h3>
            <p className="text-sm text-gray-500 mb-4">Outstanding: ₹{(payModal.totalRepayment - payModal.amountPaid).toFixed(2)}</p>
            {payError && <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg mb-3 text-sm">{payError}</div>}
            <div className="space-y-3">
              <input placeholder="UTR Number" value={form.utrNumber}
                onChange={(e) => setForm({ ...form, utrNumber: e.target.value.toUpperCase() })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              <input type="number" placeholder="Amount (₹)" value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              <input type="date" value={form.paymentDate}
                onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={recordPayment} disabled={payLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                {payLoading ? "Saving..." : "Record"}
              </button>
              <button onClick={() => setPayModal(null)} className="text-gray-500 px-4 py-2 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
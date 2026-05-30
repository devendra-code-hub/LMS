"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Loan } from "@/types";

export default function SanctionPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<{ id: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchLoans = () => {
    api.get<Loan[]>("/sanction/applications").then((r) => setLoans(r.data)).finally(() => setLoading(false));
  };
  useEffect(fetchLoans, []);

  const approve = async (id: string) => {
    await api.patch(`/sanction/${id}/approve`);
    fetchLoans();
  };

  const reject = async () => {
    if (!rejectModal || !rejectReason) return;
    await api.patch(`/sanction/${rejectModal.id}/reject`, { reason: rejectReason });
    setRejectModal(null); setRejectReason("");
    fetchLoans();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Sanction — Loan Applications</h2>
      {loading ? <div className="text-gray-500">Loading...</div> : (
        <div className="space-y-4">
          {loans.length === 0 && <div className="bg-white rounded-2xl p-8 text-center text-gray-400">No applications pending</div>}
          {loans.map((loan) => {
            const borrower = loan.borrower as unknown as { name: string; email: string; pan: string; monthlySalary: number; employmentMode: string };
            return (
              <div key={loan._id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-800">{borrower.name}</p>
                    <p className="text-sm text-gray-500">{borrower.email} • PAN: {borrower.pan}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Salary: ₹{borrower.monthlySalary?.toLocaleString()} • {borrower.employmentMode}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-indigo-600">₹{loan.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{loan.tenure} days</p>
                    <p className="text-sm text-gray-500">Total: ₹{loan.totalRepayment.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => approve(loan._id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition">
                    ✅ Approve
                  </button>
                  <button onClick={() => setRejectModal({ id: loan._id })}
                    className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm hover:bg-red-100 transition">
                    ❌ Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96">
            <h3 className="font-bold text-gray-800 mb-4">Rejection Reason</h3>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason..." rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300" />
            <div className="flex gap-3 mt-4">
              <button onClick={reject} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">Reject</button>
              <button onClick={() => setRejectModal(null)} className="text-gray-500 px-4 py-2 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
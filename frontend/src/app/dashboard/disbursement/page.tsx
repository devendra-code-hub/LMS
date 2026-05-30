"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Loan } from "@/types";

export default function DisbursementPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = () => {
    api.get<Loan[]>("/disbursement/sanctioned").then((r) => setLoans(r.data)).finally(() => setLoading(false));
  };
  useEffect(fetchLoans, []);

  const disburse = async (id: string) => {
    await api.patch(`/disbursement/${id}/disburse`);
    fetchLoans();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Disbursement — Sanctioned Loans</h2>
      {loading ? <div className="text-gray-500">Loading...</div> : (
        <div className="space-y-4">
          {loans.length === 0 && <div className="bg-white rounded-2xl p-8 text-center text-gray-400">No sanctioned loans</div>}
          {loans.map((loan) => {
            const borrower = loan.borrower as unknown as { name: string; email: string };
            return (
              <div key={loan._id} className="bg-white rounded-2xl shadow-sm p-6 flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-800">{borrower.name}</p>
                  <p className="text-sm text-gray-500">{borrower.email}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    ₹{loan.amount.toLocaleString()} • {loan.tenure} days • Total: ₹{loan.totalRepayment.toLocaleString()}
                  </p>
                </div>
                <button onClick={() => disburse(loan._id)}
                  className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">
                  💸 Disburse
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
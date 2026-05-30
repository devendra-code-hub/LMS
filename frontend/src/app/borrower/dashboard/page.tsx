"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Loan } from "@/types";

const statusColors: Record<string, string> = {
  APPLIED: "bg-yellow-100 text-yellow-700",
  SANCTIONED: "bg-blue-100 text-blue-700",
  DISBURSED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function BorrowerDashboard() {
  const router = useRouter();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Read localStorage only on client
    const stored = localStorage.getItem("lms_user");
    if (!stored) { router.push("/login"); return; }
    const user = JSON.parse(stored);
    setUserName(user.name);
    api.get<Loan[]>("/borrower/my-loans")
      .then((r) => setLoans(r.data))
      .finally(() => setLoading(false));
  }, [router]);

  const logout = () => {
    localStorage.removeItem("lms_token");
    localStorage.removeItem("lms_user");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600">CreditSea</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Hi, {userName}</span>
          <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Loan Applications</h2>
          <button onClick={() => router.push("/borrower/personal")}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">
            + Apply for Loan
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : loans.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-5xl mb-4">💳</div>
            <p className="text-gray-500 mb-4">No loan applications yet</p>
            <button onClick={() => router.push("/borrower/personal")}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
              Apply Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => (
              <div key={loan._id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-lg font-bold text-gray-800">₹{loan.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{loan.tenure} days • 12% p.a.</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[loan.status]}`}>
                    {loan.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><p className="text-gray-400">Interest</p><p className="font-medium">₹{loan.simpleInterest.toLocaleString()}</p></div>
                  <div><p className="text-gray-400">Total Repayment</p><p className="font-medium">₹{loan.totalRepayment.toLocaleString()}</p></div>
                  <div><p className="text-gray-400">Amount Paid</p><p className="font-medium text-green-600">₹{loan.amountPaid.toLocaleString()}</p></div>
                </div>
                {loan.rejectionReason && (
                  <p className="mt-3 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                    Rejection reason: {loan.rejectionReason}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
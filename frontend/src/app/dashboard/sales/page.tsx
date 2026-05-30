"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { User } from "@/types";

export default function SalesPage() {
  const [leads, setLeads] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<User[]>("/sales/leads").then((r) => setLeads(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Sales — Lead Tracking</h2>
      {loading ? <div className="text-gray-500">Loading...</div> : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Employment</th>
                <th className="px-6 py-3 text-left">Salary</th>
                <th className="px-6 py-3 text-left">BRE Status</th>
                <th className="px-6 py-3 text-left">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{lead.name}</td>
                  <td className="px-6 py-4 text-gray-500">{lead.email}</td>
                  <td className="px-6 py-4">{lead.employmentMode || "—"}</td>
                  <td className="px-6 py-4">{lead.monthlySalary ? `₹${lead.monthlySalary.toLocaleString()}` : "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                      ${lead.breStatus === "passed" ? "bg-green-100 text-green-700"
                      : lead.breStatus === "failed" ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"}`}>
                      {lead.breStatus || "pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date((lead as unknown as { createdAt: string }).createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leads.length === 0 && <div className="text-center py-8 text-gray-400">No leads yet</div>}
        </div>
      )}
    </div>
  );
}
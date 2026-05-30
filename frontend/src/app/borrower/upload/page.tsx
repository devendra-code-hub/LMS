"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError("Please select a file"); return; }
    setLoading(true); setError("");
    const formData = new FormData();
    formData.append("salarySlip", file);
    try {
      await api.post("/borrower/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.push("/borrower/apply");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg">
        <div className="mb-6">
          <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">Step 3 of 4</span>
          <h2 className="text-2xl font-bold text-gray-800 mt-2">Upload Salary Slip</h2>
          <p className="text-gray-500 text-sm">PDF, JPG, or PNG — max 5 MB</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition">
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden" id="file-input" />
            <label htmlFor="file-input" className="cursor-pointer">
              <div className="text-4xl mb-2">📄</div>
              <p className="text-gray-600">{file ? file.name : "Click to select file"}</p>
              <p className="text-gray-400 text-sm mt-1">PDF, JPG, PNG up to 5MB</p>
            </label>
          </div>
          <button type="submit" disabled={loading || !file}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50">
            {loading ? "Uploading..." : "Upload & Continue →"}
          </button>
        </form>
      </div>
    </div>
  );
}
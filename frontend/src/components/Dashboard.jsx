import { useEffect, useState } from "react";
import { getStats } from "../api";

export const INTENT_LABELS = {
  price_enquiry: "Price enquiry",
  bulk_order: "Bulk order",
  complaint: "Complaint",
  availability: "Availability",
  general_enquiry: "General enquiry",
};

function Card({ label, value, color }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`mt-1 text-3xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => setError("Cannot load stats. Make sure the backend is running on port 8000."));
  }, []);

  if (error) return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>;
  if (!stats) return <div className="text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card label="Total queries processed" value={stats.total} color="text-slate-900" />
        <Card label="Price enquiries" value={stats.price_enquiries} color="text-indigo-600" />
        <Card label="Bulk order enquiries" value={stats.bulk_enquiries} color="text-green-600" />
        <Card label="Other enquiries" value={stats.other_enquiries} color="text-amber-600" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 font-semibold">Recent queries</div>
        {stats.recent.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-500">
            No queries yet. Process a message in New Reply.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {stats.recent.map((q) => (
              <li key={q.id} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="min-w-0 truncate text-sm">{q.message}</span>
                <span className="shrink-0 rounded bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                  {INTENT_LABELS[q.intent] || q.intent}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
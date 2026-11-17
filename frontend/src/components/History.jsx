import { useEffect, useState } from "react";
import { getHistory } from "../api";
import { INTENT_LABELS } from "./Dashboard";

export default function History() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    getHistory()
      .then(setRows)
      .catch(() => setError("Cannot load history. Make sure the backend is running on port 8000."))
      .finally(() => setLoading(false));
  }, []);

  async function copy(row) {
    try {
      await navigator.clipboard.writeText(row.reply);
      setCopiedId(row.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      /* ignore */
    }
  }

  if (loading) return <div className="text-slate-500">Loading...</div>;
  if (error) return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>;
  if (rows.length === 0)
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
        No queries yet. Process a message in New Reply.
      </div>
    );

  return (
    <div className="space-y-4">
      {rows.map((r) => (
        <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
              {INTENT_LABELS[r.intent] || r.intent}
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600">{r.language}</span>
            {r.product_name && (
              <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600">{r.product_name}</span>
            )}
            <span
              className={`rounded px-2 py-0.5 ${
                r.mode === "ai" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              {r.mode === "ai" ? "AI" : "Fallback"}
            </span>
            <span className="ml-auto text-slate-400">{new Date(r.created_at).toLocaleString()}</span>
          </div>
          <div className="text-sm font-medium text-slate-500">Customer</div>
          <div className="mb-3 text-sm">{r.message}</div>
          <div className="text-sm font-medium text-slate-500">Reply</div>
          <div className="whitespace-pre-wrap rounded-lg border border-green-200 bg-green-50 p-3 text-sm">
            {r.reply}
          </div>
          <button
            onClick={() => copy(r)}
            className="mt-3 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
          >
            {copiedId === r.id ? "Copied ✓" : "Copy Reply"}
          </button>
        </div>
      ))}
    </div>
  );
}
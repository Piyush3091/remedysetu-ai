import { useState } from "react";
import { processMessage } from "../api";

const SAMPLES = [
  "Neelam ka rate kya hai 5 ratti?",
  "Rudraksha 100 pcs chahiye.",
  "Do you have original Pukhraj?",
  "Can you tell me the price of 5 mukhi rudraksha?",
  "Mujhe 20 pieces ka wholesale price batao.",
];

const INTENT_LABELS = {
  price_enquiry: "Price enquiry",
  bulk_order: "Bulk order",
  complaint: "Complaint",
  availability: "Availability",
  general_enquiry: "General enquiry",
};

const inr = (n) => (n === null || n === undefined ? "-" : `₹${Number(n).toLocaleString("en-IN")}`);

function Row({ label, children }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-3 sm:flex-row sm:gap-4">
      <div className="w-48 shrink-0 text-sm font-medium text-slate-500">{label}</div>
      <div className="min-w-0 flex-1 text-sm text-slate-900">{children}</div>
    </div>
  );
}

export default function NewReply() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleProcess() {
    if (!message.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    setCopied(false);
    try {
      setResult(await processMessage(message.trim()));
    } catch (e) {
      setError(
        e.message === "Failed to fetch"
          ? "Cannot reach the backend. Make sure it is running on port 8000."
          : e.message
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(result.reply);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      setError("Could not copy automatically. Select the reply text and copy it manually.");
    }
  }

  const pr = result?.pricing;
  const unit = pr?.unit || "";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="mb-2 block text-sm font-semibold">Customer WhatsApp message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={1000}
          rows={5}
          placeholder="Paste the customer's message here..."
          className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {SAMPLES.map((s) => (
            <button
              key={s}
              onClick={() => setMessage(s)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100"
            >
              {s}
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleProcess}
            disabled={loading || !message.trim()}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Processing..." : "Process Message"}
          </button>
          {loading && (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {result && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Result</h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                result.mode === "ai" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              }`}
              title={result.ai_note || ""}
            >
              {result.mode === "ai" ? "AI generated" : "Fallback mode"}
            </span>
          </div>

          <Row label="Customer message">{result.message}</Row>
          <Row label="Detected intent">
            <span className="rounded bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
              {INTENT_LABELS[result.intent] || result.intent}
            </span>
          </Row>
          <Row label="Detected language">{result.language}</Row>
          <Row label="Matching product">
            {result.status === "matched" && (
              <span>
                {result.product.name} <span className="text-slate-500">({result.product.hindi_name})</span>
              </span>
            )}
            {result.status === "ambiguous" && (
              <span className="text-amber-700">
                Multiple matches: {result.candidates.map((c) => c.name).join(", ")}
              </span>
            )}
            {result.status === "not_found" && <span className="text-red-600">No product found</span>}
          </Row>
          <Row label="Requested quantity">
            {result.quantity !== null && result.quantity !== undefined
              ? `${result.quantity} ${result.quantity_unit || unit}`.trim()
              : "Not specified"}
          </Row>
          <Row label="Verified unit price">{pr ? `${inr(pr.unit_price)} per ${unit}` : "-"}</Row>
          <Row label="Applicable bulk price">
            {pr ? (
              <span>
                {inr(pr.bulk_price)} per {unit} (from {pr.min_bulk_qty} {unit}){" "}
                {pr.bulk_applies && (
                  <span className="ml-1 rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    Applied
                  </span>
                )}
              </span>
            ) : (
              "-"
            )}
          </Row>
          {pr && pr.total !== null && <Row label="Total">{inr(pr.total)}</Row>}

          <div className="mt-4">
            <div className="mb-2 text-sm font-semibold">Generated reply</div>
            <div className="whitespace-pre-wrap rounded-lg border border-green-200 bg-green-50 p-4 text-sm leading-relaxed">
              {result.reply}
            </div>
            <button
              onClick={handleCopy}
              className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              {copied ? "Copied ✓" : "Copy Reply"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
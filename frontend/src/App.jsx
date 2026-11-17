import { useState } from "react";
import Dashboard from "./components/Dashboard";
import NewReply from "./components/NewReply";
import History from "./components/History";
import Catalogue from "./components/Catalogue";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "reply", label: "New Reply", icon: "💬" },
  { id: "history", label: "Query History", icon: "🕘" },
  { id: "catalogue", label: "Product Catalogue", icon: "📦" },
];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const current = NAV.find((n) => n.id === page);

  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden w-64 shrink-0 flex-col bg-slate-900 text-slate-200 md:flex">
        <div className="border-b border-slate-700 px-5 py-5">
          <div className="text-lg font-bold text-white">RemedySetu</div>
          <div className="text-xs text-slate-400">AI Sales Assistant</div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setPage(n.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                page === n.id ? "bg-indigo-600 text-white" : "hover:bg-slate-800"
              }`}
            >
              <span>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="flex gap-1 overflow-x-auto bg-slate-900 p-2 md:hidden">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setPage(n.id)}
              className={`whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium ${
                page === n.id ? "bg-indigo-600 text-white" : "text-slate-300"
              }`}
            >
              {n.icon} {n.label}
            </button>
          ))}
        </div>

        <main className="mx-auto max-w-5xl p-4 md:p-8">
          <h1 className="mb-6 text-2xl font-bold">{current.label}</h1>
          {page === "dashboard" && <Dashboard />}
          {page === "reply" && <NewReply />}
          {page === "history" && <History />}
          {page === "catalogue" && <Catalogue />}
        </main>
      </div>
    </div>
  );
}
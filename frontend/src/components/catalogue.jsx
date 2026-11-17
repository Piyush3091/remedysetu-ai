import { useEffect, useState } from "react";
import { getProducts } from "../api";

const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

export default function Catalogue() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setError("Cannot load products. Make sure the backend is running on port 8000."))
      .finally(() => setLoading(false));
  }, []);

  const q = search.trim().toLowerCase();
  const shown = products.filter(
    (p) =>
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.hindi_name.includes(search.trim()) ||
      p.category.toLowerCase().includes(q)
  );

  if (loading) return <div className="text-slate-500">Loading...</div>;
  if (error) return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>;

  return (
    <div className="space-y-4">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products or category..."
        className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:w-80"
      />
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Hindi</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Unit price</th>
              <th className="px-4 py-3">Bulk price</th>
              <th className="px-4 py-3">Min bulk qty</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-500">{p.id}</td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3">{p.hindi_name}</td>
                <td className="px-4 py-3">{p.category}</td>
                <td className="px-4 py-3">{inr(p.unit_price)} / {p.unit}</td>
                <td className="px-4 py-3">{inr(p.bulk_price)} / {p.unit}</td>
                <td className="px-4 py-3">{p.min_bulk_qty}</td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-500">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
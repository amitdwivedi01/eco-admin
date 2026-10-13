import { useEffect, useState } from "react";
import { Search, RefreshCw, Users, CheckCircle2, Clock3 } from "lucide-react";
import { getVisitorRegistrations } from "../services/visitorRegistration";

export default function Visitors() {
  const [visitors, setVisitors] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadVisitors(page = 1) {
    setLoading(true);
    setError("");

    try {
      const result = await getVisitorRegistrations({
        page,
        limit: pagination.limit,
        search,
      });

      setVisitors(result.data || []);
      setPagination((previous) => ({ ...previous, ...result.pagination }));
    } catch (err) {
      setError(err.message || "Unable to load visitors");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => loadVisitors(1), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">Visitors</h1>

        <button
          type="button"
          onClick={() => loadVisitors(pagination.page)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Users size={16} className="text-blue-600" />
            <span>
              <span className="font-semibold text-slate-800">
                {pagination.total}
              </span>{" "}
              visitors
            </span>
          </div>

          <div className="relative">
            <Search
              size={15}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, company..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 sm:w-72"
            />
          </div>
        </div>

        {error && (
          <div className="m-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Visitor</th>
                <th className="px-4 py-2.5 font-semibold">Company</th>
                <th className="px-4 py-2.5 font-semibold">Contact</th>
                <th className="px-4 py-2.5 font-semibold">Country</th>
                <th className="px-4 py-2.5 font-semibold">QR</th>
                <th className="px-4 py-2.5 font-semibold">Email</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <RefreshCw
                      size={20}
                      className="mx-auto animate-spin text-blue-600"
                    />
                    <p className="mt-2 text-sm text-slate-500">
                      Loading visitors...
                    </p>
                  </td>
                </tr>
              ) : visitors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <p className="text-sm font-medium text-slate-800">
                      No visitors found
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Try a different search.
                    </p>
                  </td>
                </tr>
              ) : (
                visitors.map((visitor) => (
                  <tr
                    key={visitor._id || visitor.registrationId}
                    className="hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-2.5 font-medium text-slate-900">
                      {visitor.contactPerson || "—"}
                    </td>

                    <td className="px-4 py-2.5">
                      <p className="text-slate-700">{visitor.company || "—"}</p>
                      <p className="text-xs text-slate-400">
                        {visitor.industryType || "—"}
                      </p>
                    </td>

                    <td className="px-4 py-2.5">
                      <p className="text-slate-700">{visitor.email}</p>
                      <p className="text-xs text-slate-400">{visitor.phone}</p>
                    </td>

                    <td className="px-4 py-2.5 text-slate-600">
                      {visitor.country || "—"}
                    </td>

                    <td className="px-4 py-2.5">
                      <StatusBadge active={visitor.qrGenerated} />
                    </td>

                    <td className="px-4 py-2.5">
                      <StatusBadge active={visitor.confirmationEmailSent} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
          <p className="text-xs text-slate-500">
            Page{" "}
            <span className="font-semibold text-slate-800">
              {pagination.page}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-800">
              {Math.max(1, pagination.totalPages)}
            </span>
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading || pagination.page <= 1}
              onClick={() => loadVisitors(pagination.page - 1)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={loading || !pagination.hasNextPage}
              onClick={() => loadVisitors(pagination.page + 1)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap text-xs ${
        active ? "text-emerald-700" : "text-slate-400"
      }`}
    >
      {active ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
      {active ? "Done" : "Pending"}
    </span>
  );
}

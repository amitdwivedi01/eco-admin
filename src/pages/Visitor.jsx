import { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Users,
  Mail,
  X,
  Building2,
  Phone,
  MapPin,
  BriefcaseBusiness,
  UserRound,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import {
  getVisitorRegistrations,
  sendVisitorRegistrationEmail,
} from "../services/visitorRegistration";
import toast from "react-hot-toast";

const PAGE_SIZE = 10;

const controlClass =
  "h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10";

function VisitorDetails({ visitor, onClose }) {
  useEffect(() => {
    if (!visitor) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visitor, onClose]);

  if (!visitor) return null;

  const fields = [
    {
      label: "Registration ID",
      value: visitor.registrationId,
      icon: UserRound,
    },
    {
      label: "Contact person",
      value: visitor.contactPerson,
      icon: UserRound,
    },
    { label: "Company", value: visitor.company, icon: Building2 },
    {
      label: "Job title",
      value: visitor.jobTitle,
      icon: BriefcaseBusiness,
    },
    {
      label: "Industry",
      value: visitor.industryType,
      icon: BriefcaseBusiness,
    },
    { label: "Email", value: visitor.email, icon: Mail },
    { label: "Phone", value: visitor.phone, icon: Phone },
    { label: "Address", value: visitor.address, icon: MapPin },
    { label: "Town / City", value: visitor.town, icon: MapPin },
    { label: "Postal code", value: visitor.postalCode, icon: MapPin },
    { label: "Country", value: visitor.country, icon: MapPin },
    { label: "Remarks", value: visitor.remarks, icon: null },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="visitor-details-title"
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <h2
              id="visitor-details-title"
              className="text-base font-semibold text-slate-900"
            >
              Visitor details
            </h2>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {visitor.company || "Visitor registration"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close visitor details"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </header>

        <div className="overflow-y-auto p-5">
          <div className="grid gap-x-6 sm:grid-cols-2">
            {fields.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex gap-2.5 border-b border-slate-100 py-3"
              >
                {Icon && (
                  <Icon size={15} className="mt-0.5 shrink-0 text-slate-400" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="break-words text-sm text-slate-800">
                    {value || "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2 text-sm">
              {visitor.qrGenerated ? (
                <CheckCircle2 size={15} className="text-emerald-600" />
              ) : (
                <span className="h-3.5 w-3.5 rounded-full border border-slate-300" />
              )}
              <span className="text-slate-600">
                QR {visitor.qrGenerated ? "generated" : "pending"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              {visitor.confirmationEmailSent ? (
                <CheckCircle2 size={15} className="text-emerald-600" />
              ) : (
                <span className="h-3.5 w-3.5 rounded-full border border-slate-300" />
              )}
              <span className="text-slate-600">
                Email{" "}
                {visitor.confirmationEmailSent ? "sent" : "not marked as sent"}
              </span>
            </div>
          </div>
        </div>

        <footer className="flex justify-end border-t border-slate-100 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Close
          </button>
        </footer>
      </section>
    </div>
  );
}

function SendVisitorEmailConfirmation({
  visitor,
  sending,
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    if (!visitor) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !sending) onCancel();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visitor, sending, onCancel]);

  if (!visitor) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !sending) onCancel();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="visitor-email-title"
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Mail size={21} />
        </div>

        <h2
          id="visitor-email-title"
          className="mt-4 text-lg font-semibold text-slate-900"
        >
          Send visitor confirmation email?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Please confirm that you want to send the confirmation email to this
          visitor.
        </p>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Visitor</p>
          <p className="mt-0.5 text-sm font-medium text-slate-900">
            {visitor.contactPerson || "—"}
          </p>

          <p className="mt-3 text-xs text-slate-500">Email address</p>
          <p className="mt-0.5 break-all text-sm font-medium text-slate-800">
            {visitor.email || "No email address available"}
          </p>

          <p className="mt-3 text-xs text-slate-500">Registration ID</p>
          <p className="mt-0.5 text-sm text-slate-800">
            {visitor.registrationId || visitor._id || "—"}
          </p>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={sending}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={sending || !visitor.email}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Mail size={15} />
            {sending ? "Sending..." : "Confirm & Send"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default function Visitors() {
  const [visitors, setVisitors] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [emailConfirmationVisitor, setEmailConfirmationVisitor] =
    useState(null);
  const [sendingVisitorId, setSendingVisitorId] = useState(null);

  const loadVisitors = useCallback(
    async (page = 1, searchTerm = search) => {
      setLoading(true);
      setError("");

      try {
        const result = await getVisitorRegistrations({
          page,
          limit: PAGE_SIZE,
          search: searchTerm,
        });

        setVisitors(result.data || []);
        setPagination((previous) => ({
          ...previous,
          ...(result.pagination || {}),
        }));
      } catch (err) {
        setError(err.message || "Unable to load visitors");
      } finally {
        setLoading(false);
      }
    },
    [search],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadVisitors(1, search);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, loadVisitors]);

  const handleSendEmail = (event, visitor) => {
    event.stopPropagation();

    if (sendingVisitorId !== null) return;

    if (!visitor.email) {
      toast.error("This visitor does not have an email address.");
      return;
    }

    setEmailConfirmationVisitor(visitor);
  };

  const confirmSendEmail = async () => {
    const visitor = emailConfirmationVisitor;

    if (!visitor || sendingVisitorId !== null) return;

    const visitorId = visitor._id || visitor.registrationId;

    if (!visitorId) {
      toast.error("Unable to identify this visitor's registration.");
      return;
    }

    try {
      setSendingVisitorId(visitorId);

      const result = await sendVisitorRegistrationEmail(visitorId);

      setVisitors((current) =>
        current.map((item) =>
          (item._id || item.registrationId) === visitorId
            ? { ...item, confirmationEmailSent: true }
            : item,
        ),
      );

      setEmailConfirmationVisitor(null);

      toast.success(
        result.message ||
          `Confirmation email sent successfully to ${visitor.email}`,
      );
    } catch (err) {
      toast.error(err.message || "Failed to send visitor confirmation email");
    } finally {
      setSendingVisitorId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/80 px-4 py-5 text-left sm:px-2">
      <div className="mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-slate-900">Visitors</h1>

          <button
            type="button"
            onClick={() => loadVisitors(pagination.page, search)}
            disabled={loading}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Users size={16} className="text-blue-600" />
              <span>
                <span className="font-semibold text-slate-800">
                  {Number(pagination.total || 0).toLocaleString("en-IN")}
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
                aria-label="Search visitors"
                className={`${controlClass} w-full pl-8 sm:w-72`}
              />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="m-3 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
            >
              <span>{error}</span>
              <button
                type="button"
                onClick={() => loadVisitors(pagination.page, search)}
                className="shrink-0 rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-100"
              >
                Try again
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Visitor</th>
                  <th className="px-4 py-2.5 font-semibold">Company</th>
                  <th className="px-4 py-2.5 font-semibold">Contact</th>
                  <th className="px-4 py-2.5 font-semibold">Country</th>
                  <th className="px-4 py-2.5 text-right font-semibold">
                    Send Email
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
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
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <p className="text-sm font-medium text-slate-800">
                        No visitors found
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Try a different search.
                      </p>
                    </td>
                  </tr>
                ) : (
                  visitors.map((visitor) => {
                    const visitorId = visitor._id || visitor.registrationId;

                    return (
                      <tr key={visitorId} className="hover:bg-slate-50/80">
                        <td className="px-4 py-2.5">
                          <button
                            type="button"
                            onClick={() => setSelectedVisitor(visitor)}
                            className="text-left font-medium text-slate-900 hover:text-blue-700 hover:underline"
                            title="View visitor details"
                          >
                            {visitor.contactPerson || "—"}
                          </button>
                        </td>

                        <td className="px-4 py-2.5">
                          <p className="text-slate-700">
                            {visitor.company || "—"}
                          </p>
                          <p className="text-xs text-slate-400">
                            {visitor.industryType || "—"}
                          </p>
                        </td>

                        <td className="px-4 py-2.5">
                          <p className="text-slate-700">
                            {visitor.email || "—"}
                          </p>
                          <p className="text-xs text-slate-400">
                            {visitor.phone || "—"}
                          </p>
                        </td>

                        <td className="px-4 py-2.5 text-slate-600">
                          {visitor.country || "—"}
                        </td>

                        <td className="px-4 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={(event) => handleSendEmail(event, visitor)}
                            disabled={
                              sendingVisitorId !== null || !visitor.email
                            }
                            title={`Send confirmation email to ${
                              visitor.email || "no email available"
                            }`}
                            className="inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-medium text-blue-700 hover:border-blue-300 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Mail
                              size={14}
                              className={
                                sendingVisitorId === visitorId
                                  ? "animate-pulse"
                                  : ""
                              }
                            />
                            {sendingVisitorId === visitorId
                              ? "Sending..."
                              : "Send Email"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
            <p className="text-xs text-slate-500">
              Page{" "}
              <span className="font-semibold text-slate-800">
                {pagination.page || 1}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-800">
                {Math.max(1, pagination.totalPages || 0)}
              </span>
              <span className="mx-1.5 text-slate-300">·</span>
              {visitors.length} shown
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  loadVisitors(Math.max(1, pagination.page - 1), search)
                }
                disabled={loading || pagination.page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={15} />
                Prev
              </button>

              <button
                type="button"
                onClick={() => loadVisitors(pagination.page + 1, search)}
                disabled={
                  loading ||
                  !(
                    pagination.hasNextPage ??
                    pagination.page < pagination.totalPages
                  )
                }
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </section>
      </div>

      {selectedVisitor && (
        <VisitorDetails
          visitor={selectedVisitor}
          onClose={() => setSelectedVisitor(null)}
        />
      )}

      {emailConfirmationVisitor && (
        <SendVisitorEmailConfirmation
          visitor={emailConfirmationVisitor}
          sending={
            sendingVisitorId ===
            (emailConfirmationVisitor._id ||
              emailConfirmationVisitor.registrationId)
          }
          onCancel={() => setEmailConfirmationVisitor(null)}
          onConfirm={confirmSendEmail}
        />
      )}
    </main>
  );
}

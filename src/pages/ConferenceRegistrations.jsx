import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Users,
  IndianRupee,
  Clock3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  Building2,
  Mail,
  Phone,
  CalendarDays,
  CreditCard,
  Hash,
  FileText,
  QrCode,
} from "lucide-react";
import StatCard from "../components/StatCard";
import {
  getConferenceRegistrations,
  sendConferenceRegistrationEmail,
} from "../services/ConferenceRegistrations";

import toast from "react-hot-toast";

const PAGE_SIZE = 10;

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const controlClass =
  "h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10";

function StatusBadge({ status }) {
  const normalized = String(status || "unknown").toLowerCase();
  const styles = {
    paid: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
    failed: "bg-red-50 text-red-700 ring-red-600/20",
    refunded: "bg-slate-100 text-slate-700 ring-slate-500/20",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${
        styles[normalized] || "bg-slate-100 text-slate-600 ring-slate-500/20"
      }`}
    >
      {normalized}
    </span>
  );
}

function DeliveryChip({ done, icon: Icon, label, doneTitle, pendingTitle }) {
  return (
    <span
      title={done ? doneTitle : pendingTitle}
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium ${
        done ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"
      }`}
    >
      <Icon size={12} />
      {label}
      {done ? <CheckCircle2 size={12} /> : <Clock3 size={12} />}
    </span>
  );
}

function BooleanBadge({ value, trueLabel, falseLabel }) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap text-xs ${
        value ? "text-emerald-700" : "text-slate-400"
      }`}
    >
      {value ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
      {value ? trueLabel : falseLabel}
    </span>
  );
}

function DetailRow({ label, value, icon: Icon }) {
  return (
    <div className="flex gap-2.5 py-2">
      {Icon && <Icon size={15} className="mt-0.5 shrink-0 text-slate-400" />}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        <div className="break-words text-sm text-slate-800">{value ?? "—"}</div>
      </div>
    </div>
  );
}

function RegistrationDetails({ registration, onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!registration) return null;

  const { pricing = {}, payment = {}, paymentLink = {} } = registration;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="registration-details-title"
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white text-left shadow-2xl"
      >
        <header className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <h2
              id="registration-details-title"
              className="text-base font-semibold text-slate-900"
            >
              Conference
            </h2>
            <StatusBadge status={registration.paymentStatus} />
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close registration details"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </header>

        <div className="overflow-y-auto p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-lg border border-slate-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-900">Contact</h3>
              <div className="mt-1 divide-y divide-slate-100">
                <DetailRow
                  icon={Users}
                  label="Contact person"
                  value={registration.contactPersonName}
                />
                <DetailRow
                  icon={Building2}
                  label="Organisation"
                  value={registration.organisation}
                />
                <DetailRow
                  icon={Mail}
                  label="Email"
                  value={registration.email}
                />
                <DetailRow
                  icon={Phone}
                  label="Mobile"
                  value={registration.mobile}
                />
                <DetailRow
                  icon={Hash}
                  label="Option"
                  value={registration.option}
                />
                <DetailRow
                  icon={CalendarDays}
                  label="Registered on"
                  value={formatDate(registration.createdAt)}
                />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-900">Pricing</h3>

              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Price per delegate</span>
                  <span className="text-slate-800">
                    {formatCurrency(pricing.pricePerDelegate)}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Delegates</span>
                  <span className="text-slate-800">
                    {registration.numberOfDelegates ?? 0}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Base amount</span>
                  <span className="text-slate-800">
                    {formatCurrency(pricing.baseAmount)}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">
                    GST ({pricing.gstPercentage ?? 0}%)
                  </span>
                  <span className="text-slate-800">
                    {formatCurrency(pricing.gstAmount)}
                  </span>
                </div>
                <div className="flex justify-between gap-3 border-t border-slate-100 pt-2">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="font-semibold text-blue-700">
                    {formatCurrency(pricing.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-slate-100 pt-3">
                <BooleanBadge
                  value={registration.qrGenerated}
                  trueLabel="QR generated"
                  falseLabel="QR pending"
                />
                <BooleanBadge
                  value={registration.confirmationEmailSent}
                  trueLabel="Email sent"
                  falseLabel="Email pending"
                />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 px-4 py-3 md:col-span-2">
              <h3 className="text-sm font-semibold text-slate-900">
                Delegates
              </h3>

              {registration.delegates?.length ? (
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {registration.delegates.map((delegate, index) => (
                    <div
                      key={`${delegate.name}-${index}`}
                      className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-3 py-2"
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                        {index + 1}
                      </div>
                      <p className="truncate text-sm text-slate-800">
                        {delegate.name || `Delegate ${index + 1}`}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  No delegate information available.
                </p>
              )}
            </section>

            <section className="rounded-lg border border-slate-200 px-4 py-3 md:col-span-2">
              <h3 className="text-sm font-semibold text-slate-900">Payment</h3>

              <div className="mt-1 grid gap-x-8 sm:grid-cols-2">
                <div className="divide-y divide-slate-100">
                  <DetailRow
                    icon={CreditCard}
                    label="Razorpay order ID"
                    value={payment.razorpayOrderId}
                  />
                  <DetailRow
                    icon={CreditCard}
                    label="Razorpay payment ID"
                    value={payment.razorpayPaymentId}
                  />
                </div>
                <div className="divide-y divide-slate-100">
                  <DetailRow
                    icon={CalendarDays}
                    label="Paid at"
                    value={formatDate(payment.paidAt)}
                  />
                  <DetailRow
                    icon={FileText}
                    label="Payment link"
                    value={paymentLink.shortUrl || paymentLink.id || "—"}
                  />
                </div>
              </div>

              {payment.razorpaySignature && (
                <details className="mt-2 rounded-lg bg-slate-50 px-3 py-2">
                  <summary className="cursor-pointer text-xs text-slate-600">
                    View payment signature
                  </summary>
                  <p className="mt-2 break-all font-mono text-xs text-slate-500">
                    {payment.razorpaySignature}
                  </p>
                </details>
              )}
            </section>
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

function SendEmailConfirmation({ registration, sending, onCancel, onConfirm }) {
  if (!registration) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !sending) {
          onCancel();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="send-email-title"
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl"
      >
        <h2
          id="send-email-title"
          className="mt-4 text-lg font-semibold text-slate-900"
        >
          Send confirmation email?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Are you sure you want to send the conference registration confirmation
          email to this contact?
        </p>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Contact person</p>
          <p className="mt-0.5 text-sm font-medium text-slate-900">
            {registration.contactPersonName || "—"}
          </p>

          <p className="mt-3 text-xs text-slate-500">Recipient email</p>
          <p className="mt-0.5 break-all text-sm font-medium text-slate-800">
            {registration.email || "No email address available"}
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
            disabled={sending || !registration.email}
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

export default function ConferenceRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [optionFilter, setOptionFilter] = useState("all");
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sendingRegistrationId, setSendingRegistrationId] = useState(null);
  const [emailConfirmationRegistration, setEmailConfirmationRegistration] =
    useState(null);

  const loadRegistrations = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");

    try {
      const result = await getConferenceRegistrations({
        page,
        limit: PAGE_SIZE,
      });
      setRegistrations(result.data || []);
      setPagination((previous) => ({
        ...previous,
        ...(result.pagination || {}),
      }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load conference registrations.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => loadRegistrations(1), 0);
    return () => clearTimeout(timeout);
  }, [loadRegistrations]);

  const filteredRegistrations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return registrations.filter((registration) => {
      const matchesSearch =
        !query ||
        [
          registration.contactPersonName,
          registration.organisation,
          registration.email,
          registration.mobile,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(query),
        );

      const matchesPayment =
        paymentFilter === "all" ||
        String(registration.paymentStatus).toLowerCase() === paymentFilter;

      const matchesOption =
        optionFilter === "all" ||
        String(registration.option).toUpperCase() === optionFilter;

      return matchesSearch && matchesPayment && matchesOption;
    });
  }, [registrations, search, paymentFilter, optionFilter]);

  const pagePaid = registrations.filter(
    (item) => String(item.paymentStatus).toLowerCase() === "paid",
  );
  const pagePending = registrations.filter(
    (item) => String(item.paymentStatus).toLowerCase() === "pending",
  );
  const pageRevenue = pagePaid.reduce(
    (sum, item) => sum + Number(item.pricing?.totalAmount || 0),
    0,
  );

  const hasActiveFilters =
    Boolean(search.trim()) || paymentFilter !== "all" || optionFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setPaymentFilter("all");
    setOptionFilter("all");
  };

  const handleSendEmail = (event, registration) => {
    event.stopPropagation();

    if (sendingRegistrationId !== null) return;

    if (!registration.email) {
      toast.error("This registration does not have an email address.");
      return;
    }

    setEmailConfirmationRegistration(registration);
  };

  const confirmSendEmail = async () => {
    const registration = emailConfirmationRegistration;

    if (!registration || sendingRegistrationId !== null) return;

    try {
      setSendingRegistrationId(registration._id);

      const result = await sendConferenceRegistrationEmail(registration._id);

      setRegistrations((current) =>
        current.map((item) =>
          item._id === registration._id
            ? { ...item, confirmationEmailSent: true }
            : item,
        ),
      );

      setEmailConfirmationRegistration(null);

      toast.success(
        result.message ||
          `Registration email sent successfully to ${registration.email}`,
      );
    } catch (error) {
      toast.error(error.message || "Failed to send registration email");
    } finally {
      setSendingRegistrationId(null);
    }
  };
  return (
    <main className="min-h-screen bg-slate-50/80 px-4 py-5 text-left sm:px-2">
      <div className="mx-auto  space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-slate-900">
            Conference registrations
          </h1>

          <button
            type="button"
            onClick={() => loadRegistrations(pagination.page)}
            disabled={loading}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            compact
            title="Total registrations"
            value={pagination.total.toLocaleString("en-IN")}
            icon={Users}
            iconClass="bg-blue-50 text-blue-600"
          />
          <StatCard
            compact
            title="Paid"
            value={pagePaid.length}
            icon={CheckCircle2}
            iconClass="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            compact
            title="Pending"
            value={pagePending.length}
            icon={Clock3}
            iconClass="bg-amber-50 text-amber-600"
          />
          <StatCard
            compact
            title="Paid amount"
            value={formatCurrency(pageRevenue)}
            icon={IndianRupee}
            iconClass="bg-violet-50 text-violet-600"
          />
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Users size={16} className="text-blue-600" />
              <span>
                <span className="font-semibold text-slate-800">
                  {pagination.total.toLocaleString("en-IN")}
                </span>{" "}
                registrations
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search this page..."
                  aria-label="Search registrations on this page"
                  className={`${controlClass} w-full pl-8 placeholder:text-slate-400 sm:w-64`}
                />
              </div>

              <select
                value={paymentFilter}
                onChange={(event) => setPaymentFilter(event.target.value)}
                aria-label="Filter by payment status"
                className={controlClass}
              >
                <option value="all">All payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>

              <select
                value={optionFilter}
                onChange={(event) => setOptionFilter(event.target.value)}
                aria-label="Filter by registration option"
                className={controlClass}
              >
                <option value="all">All options</option>
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
              </select>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex h-9 items-center gap-1 rounded-lg px-2.5 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                >
                  <X size={14} />
                  Clear
                </button>
              )}
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="m-3 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5"
            >
              <p className="text-sm text-red-700">{error}</p>
              <button
                type="button"
                onClick={() => loadRegistrations(pagination.page)}
                className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-100"
              >
                Try again
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Contact person</th>
                  <th className="px-4 py-2.5 font-semibold">Email / Mobile</th>
                  <th className="px-4 py-2.5 text-center font-semibold">
                    Option
                  </th>
                  <th className="px-4 py-2.5 text-center font-semibold">
                    Delegates
                  </th>
                  <th className="px-4 py-2.5 font-semibold">Total</th>
                  <th className="px-4 py-2.5 font-semibold">Payment</th>
                  <th className="px-4 py-2.5 font-semibold">Delivery</th>
                  <th className="px-4 py-2.5 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <RefreshCw
                        size={20}
                        className="mx-auto animate-spin text-blue-600"
                      />
                      <p className="mt-2 text-sm text-slate-500">
                        Loading registrations...
                      </p>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-sm text-slate-500"
                    >
                      Registrations could not be loaded.
                    </td>
                  </tr>
                ) : filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <p className="text-sm font-medium text-slate-800">
                        No registrations found
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Try changing your search or filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((registration) => (
                    <tr
                      key={registration._id}
                      onClick={() => setSelectedRegistration(registration)}
                      className="cursor-pointer hover:bg-slate-50/80"
                    >
                      <td className="px-4 py-2.5">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedRegistration(registration);
                          }}
                          className="text-left font-medium text-slate-900 hover:text-blue-700 hover:underline"
                          title="View registration details"
                        >
                          {registration.contactPersonName || "—"}
                        </button>

                        <p className="text-xs text-slate-400">
                          {registration.organisation || "—"}
                        </p>
                      </td>

                      <td className="px-4 py-2.5">
                        <p className="text-slate-700">
                          {registration.email || "—"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {registration.mobile || "—"}
                        </p>
                      </td>

                      <td className="px-4 py-2.5 text-center">
                        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-blue-50 px-1.5 text-xs font-semibold text-blue-700">
                          {registration.option || "—"}
                        </span>
                      </td>

                      <td className="px-4 py-2.5 text-center text-slate-700">
                        {registration.numberOfDelegates ?? 0}
                      </td>

                      <td className="px-4 py-2.5">
                        <p className="whitespace-nowrap font-semibold text-slate-900">
                          {formatCurrency(registration.pricing?.totalAmount)}
                        </p>
                      </td>

                      <td className="px-4 py-2.5">
                        <StatusBadge status={registration.paymentStatus} />
                      </td>

                      <td className="px-4 py-2.5 flex ">
                        <div className="flex flex-col items-center gap-1.5">
                          <DeliveryChip
                            done={registration.qrGenerated}
                            icon={QrCode}
                            label="QR"
                            doneTitle="QR generated"
                            pendingTitle="QR pending"
                          />
                          <DeliveryChip
                            done={registration.confirmationEmailSent}
                            icon={Mail}
                            label="Email"
                            doneTitle="Confirmation email sent"
                            pendingTitle="Confirmation email pending"
                          />
                        </div>
                      </td>

                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={(event) =>
                              handleSendEmail(event, registration)
                            }
                            disabled={sendingRegistrationId !== null}
                            title={`Send registration email to ${registration.email}`}
                            aria-label={`Send registration email to ${registration.email}`}
                            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 text-xs font-medium text-blue-700 hover:border-blue-300 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {sendingRegistrationId === registration._id
                              ? "Sending..."
                              : "Send Email"}
                          </button>
                        </div>
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
                {pagination.page || 1}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-800">
                {pagination.totalPages || 1}
              </span>
              <span className="mx-1.5 text-slate-300">·</span>
              {filteredRegistrations.length} shown
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  loadRegistrations(Math.max(1, pagination.page - 1))
                }
                disabled={
                  loading || !pagination.hasPreviousPage || pagination.page <= 1
                }
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={15} />
                Prev
              </button>
              <button
                type="button"
                onClick={() => loadRegistrations(pagination.page + 1)}
                disabled={loading || !pagination.hasNextPage}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </section>
      </div>

      {selectedRegistration && (
        <RegistrationDetails
          registration={selectedRegistration}
          onClose={() => setSelectedRegistration(null)}
        />
      )}

      {emailConfirmationRegistration && (
        <SendEmailConfirmation
          registration={emailConfirmationRegistration}
          onCancel={() => setEmailConfirmationRegistration(null)}
          onConfirm={confirmSendEmail}
        />
      )}
    </main>
  );
}

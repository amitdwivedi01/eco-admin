export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass = "bg-blue-50 text-blue-600",
  compact = false,
}) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left">
        {Icon && (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
          >
            <Icon size={18} />
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-slate-500">{title}</p>
          <p className="truncate text-xl font-semibold leading-tight text-slate-900">
            {value}
          </p>
          {description && (
            <p className="truncate text-[11px] text-slate-400">{description}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
        </div>

        {Icon && (
          <div className={`rounded-xl p-3 ${iconClass}`}>
            <Icon size={21} />
          </div>
        )}
      </div>

      {description && (
        <p className="mt-4 text-xs text-slate-500">{description}</p>
      )}
    </div>
  );
}

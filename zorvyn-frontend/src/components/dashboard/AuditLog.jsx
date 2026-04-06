import { formatDistanceToNow, format } from "date-fns";
import { FiPlus, FiMinus, FiUser, FiClock } from "react-icons/fi";

const glassTileClass =
  "rounded-2xl border border-white/20 bg-white/5 p-4 backdrop-blur-md shadow-[0_18px_36px_rgba(2,8,23,0.35)]";

export default function AuditLog({ records = [] }) {
  if (!records.length) {
    return (
      <section className="zf-section" id="audit-log" aria-label="Audit log">
        <h2 className="zf-section__title">Audit Log</h2>
        <div className="flex items-center justify-center py-8 px-4 rounded-lg border border-dashed border-slate-400/30 bg-slate-900/20">
          <p className="text-sm text-slate-400">No activity logged yet</p>
        </div>
      </section>
    );
  }

  return (
    <section className="zf-section" id="audit-log" aria-label="Audit log">
      <h2 className="zf-section__title mb-4">Audit Log</h2>

      <div 
        className="space-y-2 max-h-96 overflow-y-auto pr-2"
        style={{
          scrollBehavior: "smooth",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(59, 130, 246, 0.5) rgba(30, 41, 59, 0.3)",
        }}
      >
        {records.map((record) => {
          const isIncome = record.type === "INCOME";
          const Icon = isIncome ? FiPlus : FiMinus;
          const iconColor = isIncome ? "#10B981" : "#EF4444";
          const bgColor = isIncome ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)";

          // Extract user name from populated userId or fallback
          const userName = record.userId?.name || "Unknown User";
          const userEmail = record.userId?.email || "";

          // Format timestamps
          const createdAt = new Date(record.createdAt || record.date);
          const relativeTime = formatDistanceToNow(createdAt, { addSuffix: true });
          const fullTime = format(createdAt, "MMM dd, yyyy 'at' h:mm a");

          return (
            <div
              key={record._id}
              className={glassTileClass}
              style={{ backgroundColor: bgColor, borderColor: `${iconColor}40` }}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className="shrink-0 mt-1 p-2 rounded-lg"
                  style={{
                    backgroundColor: `${iconColor}20`,
                    color: iconColor,
                  }}
                >
                  <Icon size={20} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Action Line */}
                  <div className="mb-2">
                    <p className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                      <FiUser size={14} className="text-slate-400" />
                      <span>
                        <strong>{userName}</strong>
                        {userEmail && <span className="text-xs text-slate-400 ml-1">({userEmail})</span>}
                      </span>
                    </p>
                    <p className="text-xs text-slate-300 mt-1 ml-6">
                      created a{" "}
                      <span style={{ color: iconColor, fontWeight: "600" }}>
                        {record.type}
                      </span>{" "}
                      record for <strong>{record.category}</strong>
                    </p>
                  </div>

                  {/* Details Row */}
                  <div className="flex items-center gap-4 mt-3 ml-6 pt-2 border-t border-slate-400/10">
                    {/* Amount */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Amount:</span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: iconColor }}
                      >
                        INR {Number(record.amount).toLocaleString()}
                      </span>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-2 ml-auto">
                      <FiClock size={12} className="text-slate-500" />
                      <span className="text-xs text-slate-400" title={fullTime}>
                        {relativeTime}
                      </span>
                    </div>

                    {/* Notes if present */}
                    {record.notes && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 italic">
                          "{record.notes}"
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeline indicator */}
      <div className="mt-4 text-center">
        <p className="text-xs text-slate-500">
          Showing {records.length} recent audit log entries
        </p>
      </div>
    </section>
  );
}

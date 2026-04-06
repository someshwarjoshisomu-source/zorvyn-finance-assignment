export default function SkeletonLoader({ count = 1, type = "card" }) {
  const skeletonItems = Array(count).fill(null);

  if (type === "card") {
    return (
      <>
        {skeletonItems.map((_, idx) => (
          <div key={idx} className="animate-pulse">
            <div className="rounded-2xl border border-white/20 bg-white/5 p-4 backdrop-blur-md">
              <div className="mb-4 h-6 w-3/4 rounded bg-slate-700"></div>
              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-slate-700"></div>
                <div className="h-4 w-5/6 rounded bg-slate-700"></div>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (type === "row") {
    return (
      <>
        {skeletonItems.map((_, idx) => (
          <div key={idx} className="animate-pulse border-b border-slate-700/30 py-4">
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded bg-slate-700"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-slate-700"></div>
                <div className="h-3 w-1/2 rounded bg-slate-700"></div>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (type === "chart") {
    return (
      <div className="animate-pulse">
        <div className="rounded-2xl border border-white/20 bg-white/5 p-4 backdrop-blur-md">
          <div className="mb-4 h-6 w-1/3 rounded bg-slate-700"></div>
          <div className="h-64 rounded bg-slate-700/30"></div>
        </div>
      </div>
    );
  }

  return null;
}

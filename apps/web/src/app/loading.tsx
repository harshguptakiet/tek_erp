export default function GlobalLoading() {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Top Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded-md" />
          <div className="h-4 w-72 bg-muted/60 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-28 bg-muted rounded-md" />
          <div className="h-10 w-32 bg-primary/20 rounded-md" />
        </div>
      </div>

      {/* Stats Cards Skeleton Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-muted/70 rounded" />
              <div className="h-8 w-8 rounded-lg bg-muted" />
            </div>
            <div className="h-7 w-20 bg-muted rounded" />
            <div className="h-3 w-32 bg-muted/50 rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-5 w-40 bg-muted rounded" />
            <div className="h-8 w-24 bg-muted/60 rounded" />
          </div>
          <div className="h-64 w-full bg-muted/40 rounded-lg" />
        </div>
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <div className="h-5 w-32 bg-muted rounded" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table / List Skeleton */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-5 w-44 bg-muted rounded" />
          <div className="h-9 w-64 bg-muted/60 rounded-md" />
        </div>
        <div className="space-y-3 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 w-full bg-muted/30 rounded-lg flex items-center px-4 justify-between">
              <div className="h-4 w-1/4 bg-muted rounded" />
              <div className="h-4 w-1/5 bg-muted rounded" />
              <div className="h-4 w-1/6 bg-muted rounded" />
              <div className="h-6 w-16 bg-muted/80 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Skeleton({ className = '', variant = 'rect' }) {
  const base = 'animate-pulse bg-cafe-bg-secondary rounded-xl';
  if (variant === 'circle') return <div className={`${base} rounded-full ${className}`} />;
  if (variant === 'text') return <div className={`${base} h-4 ${className}`} />;
  return <div className={`${base} ${className}`} />;
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-10 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12" variant="circle" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" variant="text" />
          <Skeleton className="h-6 w-32" variant="text" />
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
      <Skeleton className="h-36 w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" variant="text" />
        <Skeleton className="h-5 w-1/2" variant="text" />
      </div>
    </div>
  );
}

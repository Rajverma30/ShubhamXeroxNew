/** Loading skeletons that mirror the real layouts, so nothing jumps on load. */

export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="aspect-[3/4] w-full rounded-none" />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-3 w-16 rounded-full" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-3/5 rounded" />
        <Skeleton className="h-10 w-full rounded-full" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 10, className = '' }) {
  return (
    <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}

export function RowSkeleton({ count = 6 }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-[46%] shrink-0 sm:w-[30%] lg:w-[19%]"><ProductCardSkeleton /></div>
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return <div className="container-x pt-4"><Skeleton className="h-[300px] w-full rounded-4xl sm:h-[420px] lg:h-[520px]" /></div>;
}

export function DetailSkeleton() {
  return (
    <div className="container-x grid gap-10 py-8 lg:grid-cols-2">
      <div className="space-y-4">
        <Skeleton className="aspect-[4/5] w-full rounded-3xl" />
        <div className="flex gap-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-16 rounded-xl" />)}
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-3 w-28 rounded-full" />
        <Skeleton className="h-9 w-full rounded" />
        <Skeleton className="h-9 w-2/3 rounded" />
        <Skeleton className="h-12 w-52 rounded" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export function CategoryTileSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => <Skeleton key={i} className="h-36 rounded-3xl" />)}
    </div>
  );
}

export default Skeleton;

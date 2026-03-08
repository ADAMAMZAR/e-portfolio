export function SkeletonCard({ color }) {
  return (
    <div className="card-skeleton" style={{ backgroundColor: color }} aria-hidden>
      <div className="card-skeleton-shimmer" />
    </div>
  );
}

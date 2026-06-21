export default function DocketSkeleton({ count = 3 }) {
  return (
    <div className="docket-list" aria-busy="true" aria-label="Loading bookings">
      {Array.from({ length: count }).map((_, i) => (
        <div className="docket-skel" key={i}>
          <div className="docket-skel-photo skeleton-shimmer" />
          <div className="docket-skel-body">
            <div className="skeleton-line skeleton-shimmer w-40" />
            <div className="skeleton-line skeleton-shimmer w-80" />
            <div className="skeleton-line skeleton-shimmer w-60" />
          </div>
          <div className="docket-skel-stub skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
}
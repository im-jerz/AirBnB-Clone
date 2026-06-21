export default function RowSkeleton({ count = 5 }) {
  return (
    <div className="booking-row-list" aria-busy="true" aria-label="Loading bookings">
      {Array.from({ length: count }).map((_, i) => (
        <div className="booking-row-skel" key={i}>
          <div className="booking-row-skel-thumb skeleton-shimmer" />
          <div className="booking-row-skel-text">
            <div className="skeleton-line skeleton-shimmer w-40" />
            <div className="skeleton-line skeleton-shimmer w-60" />
          </div>
          <div className="booking-row-skel-pill skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
}
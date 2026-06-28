import { useState, useMemo } from "react";
import "../../styles/notifications.css";

/* ─── SVG Icons (inline, no emoji) ────────────────────────── */
const IconBookingNew = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 10h18" />
    <path d="M12 14v3M10.5 15.5h3" />
  </svg>
);

const IconBookingConfirmed = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 10h18" />
    <path d="m9 15 2 2 4-4" />
  </svg>
);

const IconCheckIn = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <path d="m10 17 5-5-5-5" />
    <path d="M3 12h12" />
  </svg>
);

const IconCheckOut = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

const IconReview = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M12 3.5l2.5 5.6 6 .6-4.5 4 1.3 5.9-5.3-3.2L6.7 19.6l1.3-5.9-4.5-4 6-.6L12 3.5Z" />
  </svg>
);

const IconPayment = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <rect x="3" y="6" width="18" height="13" rx="2" />
    <path d="M3 10h18" />
    <circle cx="16.5" cy="14" r="1.25" fill="currentColor" stroke="none" />
  </svg>
);

const IconWithdrawal = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M12 4v12M8 12l4 4 4-4" />
    <path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1" />
  </svg>
);

const IconApproval = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M12 3l8 3v6c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V6l8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const IconRejection = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M12 3l8 3v6c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V6l8-3Z" />
    <path d="M15 9l-6 6M9 9l6 6" />
  </svg>
);

const IconSupport = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3.5" />
    <path d="m5.8 5.8 3 3M18.2 5.8l-3 3M5.8 18.2l3-3M18.2 18.2l-3-3" />
  </svg>
);

const IconAnnouncement = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M3 11V13a1 1 0 0 0 1 1h1l3 4v-9L5 13H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h1l3-4v9" />
    <path d="M19 8c.7 1 1 2.4 1 4s-.3 3-1 4" />
    <path d="M16 9.5c.4.6.5 1.4.5 2.5s-.1 1.9-.5 2.5" />
  </svg>
);

const IconCancelled = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M4.9 4.9 19.1 19.1" />
  </svg>
);

const IconCheck = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const IconFilter = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M3 5h18M7 10h10M11 15h2" />
  </svg>
);

const IconBell = (p) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M6 8a6 6 0 1 1 12 0c0 3 1 4.5 1.5 5.5a1 1 0 0 1-.9 1.5H5.4a1 1 0 0 1-.9-1.5C5 12.5 6 11 6 8Z" />
    <path d="M10 18.5a2 2 0 0 0 4 0" />
  </svg>
);

const IconChevronRight = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M9 18l6-6-6-6" />
  </svg>
);

/* ─── Notification type config ─────────────────────────────── */
const TYPE_CONFIG = {
  booking_request:   { icon: IconBookingNew,       label: "Booking Request",    cat: "bookings",  color: "accent"   },
  booking_confirmed: { icon: IconBookingConfirmed,  label: "Booking Confirmed",  cat: "bookings",  color: "success"  },
  booking_cancelled: { icon: IconCancelled,         label: "Booking Cancelled",  cat: "bookings",  color: "danger"   },
  guest_checkin:     { icon: IconCheckIn,           label: "Guest Checked In",   cat: "stays",     color: "info"     },
  guest_checkout:    { icon: IconCheckOut,          label: "Guest Checked Out",  cat: "stays",     color: "muted"    },
  review_received:   { icon: IconReview,            label: "New Review",         cat: "reviews",   color: "gold"     },
  payment_credited:  { icon: IconPayment,           label: "Payment Credited",   cat: "earnings",  color: "success"  },
  withdrawal_done:   { icon: IconWithdrawal,        label: "Withdrawal Done",    cat: "earnings",  color: "success"  },
  listing_approved:  { icon: IconApproval,          label: "Listing Approved",   cat: "listings",  color: "success"  },
  listing_rejected:  { icon: IconRejection,         label: "Listing Rejected",   cat: "listings",  color: "danger"   },
  support_update:    { icon: IconSupport,           label: "Support Update",     cat: "support",   color: "info"     },
  announcement:      { icon: IconAnnouncement,      label: "Announcement",       cat: "system",    color: "muted"    },
};

/* ─── Mock data ─────────────────────────────────────────────── */
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "booking_request",
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 8),
    title: "New booking request from Maria Santos",
    body: "3 nights · Baguio Country Villa · ₱12,600 total",
    meta: "Check-in: Jul 15 — Jul 18, 2026",
    link: "/dashboard/bookings",
    linkLabel: "Review Request",
  },
  {
    id: 2,
    type: "booking_request",
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 32),
    title: "New booking request from Jose Reyes",
    body: "2 nights · Tagaytay Garden Suite · ₱8,400 total",
    meta: "Check-in: Jul 20 — Jul 22, 2026",
    link: "/dashboard/bookings",
    linkLabel: "Review Request",
  },
  {
    id: 3,
    type: "payment_credited",
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 55),
    title: "₱18,900 has been credited to your wallet",
    body: "Payment for booking #BK-20241 · Ana Cruz stay completed",
    meta: "Available for withdrawal now",
    link: "/dashboard/wallet",
    linkLabel: "View Wallet",
  },
  {
    id: 4,
    type: "guest_checkin",
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    title: "Your guest has checked in",
    body: "Karen Lim · Cebu Heritage House",
    meta: "Staying until Jul 10, 2026",
    link: "/dashboard/bookings",
    linkLabel: "View Booking",
  },
  {
    id: 5,
    type: "review_received",
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    title: "You received a 5-star review",
    body: '"The place was immaculate and the host was incredibly responsive." — Lito Mendoza',
    meta: "Tagaytay Garden Suite",
    link: "/dashboard/reviews",
    linkLabel: "See Review",
  },
  {
    id: 6,
    type: "listing_approved",
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 9),
    title: "Your listing has been approved",
    body: "Palawan Beachfront Nipa Hut is now live and searchable",
    meta: "Approved by admin at 9:14 AM",
    link: "/dashboard/properties",
    linkLabel: "View Listing",
  },
  {
    id: 7,
    type: "guest_checkout",
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 13),
    title: "Guest has checked out",
    body: "Ricardo Tan · Baguio Country Villa",
    meta: "Booking #BK-20238 completed. Awaiting payment settlement.",
    link: "/dashboard/bookings",
    linkLabel: "View Details",
  },
  {
    id: 8,
    type: "booking_cancelled",
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20),
    title: "Booking was cancelled by guest",
    body: "Donna Pascual · Tagaytay Garden Suite · Jul 5 — Jul 7",
    meta: "Refund of ₱7,200 has been processed",
    link: "/dashboard/bookings",
    linkLabel: "View Booking",
  },
  {
    id: 9,
    type: "withdrawal_done",
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26),
    title: "Withdrawal of ₱35,000 processed",
    body: "Transferred to BDO ···· 4821 · Expected 1–3 banking days",
    meta: "Reference: WD-20240628-009",
    link: "/dashboard/wallet",
    linkLabel: "View Transactions",
  },
  {
    id: 10,
    type: "support_update",
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30),
    title: "Ticket #TK-0042 has been updated",
    body: "Admin has responded to your payment dispute",
    meta: "Status changed: In Review → Resolved",
    link: "/dashboard/support",
    linkLabel: "View Ticket",
  },
  {
    id: 11,
    type: "listing_rejected",
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    title: "Your listing was not approved",
    body: "Davao Mountain Retreat — photos did not meet quality standards",
    meta: "Reason: Minimum 5 photos required, all must be well-lit",
    link: "/dashboard/properties",
    linkLabel: "Edit Listing",
  },
  {
    id: 12,
    type: "booking_confirmed",
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 52),
    title: "Booking automatically confirmed",
    body: "Ramon Cruz · Cebu Heritage House · Jul 25 — Jul 28",
    meta: "Instant book was enabled on this listing",
    link: "/dashboard/bookings",
    linkLabel: "View Booking",
  },
  {
    id: 13,
    type: "announcement",
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
    title: "Platform update: New payout schedule",
    body: "Starting August 1, payouts will be released every Tuesday and Friday.",
    meta: "Read the full announcement",
    link: "/dashboard/settings",
    linkLabel: "Learn More",
  },
];

const CATEGORIES = [
  { key: "all",      label: "All" },
  { key: "bookings", label: "Bookings" },
  { key: "stays",    label: "Stays" },
  { key: "earnings", label: "Earnings" },
  { key: "reviews",  label: "Reviews" },
  { key: "listings", label: "Listings" },
  { key: "system",   label: "System" },
];

/* ─── Helpers ───────────────────────────────────────────────── */
function timeAgo(date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return "Yesterday";
  return date.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

function groupByDay(notifications) {
  const groups = {};
  const now = new Date();
  notifications.forEach((n) => {
    const d = n.timestamp;
    const diffDays = Math.floor((now - d) / 86400000);
    let label;
    if (diffDays === 0) label = "Today";
    else if (diffDays === 1) label = "Yesterday";
    else if (diffDays < 7) label = d.toLocaleDateString("en-PH", { weekday: "long" });
    else label = d.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" });
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });
  return groups;
}

/* ─── Sub-components ────────────────────────────────────────── */
function NotificationItem({ item, onRead, onNavigate }) {
  const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.announcement;
  const IconComp = config.icon;

  function handleClick() {
    if (!item.read) onRead(item.id);
    onNavigate(item.link);
  }

  return (
    <article
      className={`ntf-item${item.read ? "" : " ntf-item--unread"}`}
      role="button"
      tabIndex={0}
      aria-label={item.title}
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      {/* Unread pulse dot */}
      {!item.read && <span className="ntf-unread-dot" aria-hidden="true" />}

      {/* Icon badge */}
      <div className={`ntf-icon-wrap ntf-icon-wrap--${config.color}`}>
        <IconComp />
      </div>

      {/* Content */}
      <div className="ntf-content">
        <div className="ntf-content-top">
          <span className="ntf-type-label">{config.label}</span>
          <time className="ntf-time" dateTime={item.timestamp.toISOString()}>
            {timeAgo(item.timestamp)}
          </time>
        </div>
        <p className="ntf-title">{item.title}</p>
        <p className="ntf-body">{item.body}</p>
        {item.meta && <p className="ntf-meta">{item.meta}</p>}
        <span className="ntf-cta">
          {item.linkLabel}
          <IconChevronRight />
        </span>
      </div>
    </article>
  );
}

function EmptyState({ category }) {
  return (
    <div className="ntf-empty">
      <div className="ntf-empty-icon">
        <IconBell />
      </div>
      <p className="ntf-empty-title">No notifications here</p>
      <p className="ntf-empty-body">
        {category === "all"
          ? "You're all caught up. New alerts will appear here."
          : `No ${category} notifications yet.`}
      </p>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      const catMatch =
        activeCategory === "all" || TYPE_CONFIG[n.type]?.cat === activeCategory;
      const readMatch = showUnreadOnly ? !n.read : true;
      return catMatch && readMatch;
    });
  }, [notifications, activeCategory, showUnreadOnly]);

  const grouped = useMemo(() => groupByDay(filtered), [filtered]);
  const groupKeys = Object.keys(grouped);

  function markRead(id) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function handleNavigate(link) {
    console.log("Navigate to:", link);
  }

  return (
    <div className="ntf-page">
      {/* ── Header — plain, matching other pages ── */}
      <header className="ntf-header">
        <div className="ntf-header-left">
          <h1 className="ntf-header-title">Notifications</h1>
          <p className="ntf-header-sub">
            {unreadCount > 0
              ? `${unreadCount} unread update${unreadCount !== 1 ? "s" : ""} need your attention`
              : "You're fully up to date"}
          </p>
        </div>

        <div className="ntf-header-actions">
          <button
            type="button"
            className={`ntf-toggle-btn${showUnreadOnly ? " ntf-toggle-btn--active" : ""}`}
            onClick={() => setShowUnreadOnly((v) => !v)}
            aria-pressed={showUnreadOnly}
          >
            <IconFilter />
            <span>Unread only</span>
          </button>
          {unreadCount > 0 && (
            <button type="button" className="ntf-mark-all-btn" onClick={markAllRead}>
              <IconCheck />
              <span>Mark all read</span>
            </button>
          )}
        </div>
      </header>

      {/* ── Category tabs ── */}
      <div className="ntf-tabs-scroll" role="tablist" aria-label="Notification categories">
        <div className="ntf-tabs">
          {CATEGORIES.map((cat) => {
            const catCount =
              cat.key === "all"
                ? unreadCount
                : notifications.filter(
                    (n) => !n.read && TYPE_CONFIG[n.type]?.cat === cat.key
                  ).length;
            return (
              <button
                key={cat.key}
                type="button"
                role="tab"
                aria-selected={activeCategory === cat.key}
                className={`ntf-tab${activeCategory === cat.key ? " ntf-tab--active" : ""}`}
                onClick={() => setActiveCategory(cat.key)}
              >
                {cat.label}
                {catCount > 0 && (
                  <span className="ntf-tab-badge">{catCount}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Notification list ── */}
      <div className="ntf-list">
        {groupKeys.length === 0 ? (
          <EmptyState category={activeCategory} />
        ) : (
          groupKeys.map((groupLabel) => (
            <section key={groupLabel} className="ntf-group">
              <div className="ntf-group-label" aria-label={`Notifications from ${groupLabel}`}>
                <span>{groupLabel}</span>
              </div>
              <div className="ntf-group-items">
                {grouped[groupLabel].map((item) => (
                  <NotificationItem
                    key={item.id}
                    item={item}
                    onRead={markRead}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IconMenu, IconBell } from "../icons";

/* ─── Notification mock (same data as NotificationsPage, top 5) ─ */
// In a real app, this would come from a shared context / store.
const MOCK_PREVIEW = [
  {
    id: 1,
    type: "booking_request",
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 8),
    title: "New booking request from Maria Santos",
    body: "3 nights · Baguio Country Villa · ₱12,600 total",
    link: "/dashboard/bookings",
  },
  {
    id: 2,
    type: "booking_request",
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 32),
    title: "New booking request from Jose Reyes",
    body: "2 nights · Tagaytay Garden Suite · ₱8,400 total",
    link: "/dashboard/bookings",
  },
  {
    id: 3,
    type: "payment_credited",
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 55),
    title: "₱18,900 credited to your wallet",
    body: "Payment for booking #BK-20241 · Ana Cruz",
    link: "/dashboard/wallet",
  },
  {
    id: 4,
    type: "guest_checkin",
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    title: "Your guest has checked in",
    body: "Karen Lim · Cebu Heritage House",
    link: "/dashboard/bookings",
  },
  {
    id: 5,
    type: "review_received",
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    title: "You received a 5-star review",
    body: "Tagaytay Garden Suite — Lito Mendoza",
    link: "/dashboard/reviews",
  },
];

const TYPE_DOT = {
  booking_request:   "accent",
  booking_confirmed: "success",
  booking_cancelled: "danger",
  guest_checkin:     "info",
  guest_checkout:    "muted",
  review_received:   "gold",
  payment_credited:  "success",
  withdrawal_done:   "success",
  listing_approved:  "success",
  listing_rejected:  "danger",
  support_update:    "info",
  announcement:      "muted",
};

function timeAgo(date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return "Yesterday";
}

/* ─── Dropdown panel ───────────────────────────────────────── */
function NotifDropdown({ onClose, onSeeAll }) {
  return (
    <div className="topbar-notif-dropdown" role="dialog" aria-label="Recent notifications">
      {/* Panel header */}
      <div className="topbar-notif-dropdown-header">
        <span className="topbar-notif-dropdown-title">Notifications</span>
        {MOCK_PREVIEW.some((n) => !n.read) && (
          <span className="topbar-notif-dropdown-badge">
            {MOCK_PREVIEW.filter((n) => !n.read).length} new
          </span>
        )}
      </div>

      {/* Scrollable list — 3 visible, max 5 on scroll */}
      <div className="topbar-notif-dropdown-list">
        {MOCK_PREVIEW.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`topbar-notif-item${item.read ? "" : " topbar-notif-item--unread"}`}
            onClick={() => {
              onClose();
            }}
          >
            <span className={`topbar-notif-item-dot topbar-notif-item-dot--${TYPE_DOT[item.type] || "muted"}`} aria-hidden="true" />
            <div className="topbar-notif-item-body">
              <p className="topbar-notif-item-title">{item.title}</p>
              <p className="topbar-notif-item-sub">{item.body}</p>
              <time className="topbar-notif-item-time">{timeAgo(item.timestamp)}</time>
            </div>
          </button>
        ))}
      </div>

      {/* Footer — See all */}
      <button type="button" className="topbar-notif-see-all" onClick={onSeeAll}>
        See all notifications
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}

/* ─── Topbar ────────────────────────────────────────────────── */
export default function Topbar({ eyebrow, title, onMenuClick, hostInitial = "J", hostName = "Juan Dela Cruz", unreadCount = 5 }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const bellBtnRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(e) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        bellBtnRef.current && !bellBtnRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Close on Escape
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleKey(e) {
      if (e.key === "Escape") setDropdownOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [dropdownOpen]);

  function handleSeeAll() {
    setDropdownOpen(false);
    navigate("/dashboard/notifications");
  }

  return (
    <header className="topbar">
      <button type="button" className="topbar-menu-btn" onClick={onMenuClick} aria-label="Toggle navigation">
        <IconMenu />
      </button>

      <div className="topbar-title-group">
        {eyebrow ? <div className="topbar-eyebrow">{eyebrow}</div> : null}
        <h1 className="topbar-title">{title}</h1>
      </div>

      <div className="topbar-actions">
        {/* Bell button with dropdown */}
        <div className="topbar-notif-wrapper">
          <button
            ref={bellBtnRef}
            type="button"
            className={`topbar-icon-btn${dropdownOpen ? " topbar-icon-btn--active" : ""}`}
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
            aria-expanded={dropdownOpen}
            aria-haspopup="dialog"
            onClick={() => setDropdownOpen((v) => !v)}
            style={{ position: "relative" }}
          >
            <IconBell />
            {unreadCount > 0 && <span className="topbar-icon-dot" aria-hidden="true" />}
          </button>

          {dropdownOpen && (
            <div ref={dropdownRef}>
              <NotifDropdown
                onClose={() => setDropdownOpen(false)}
                onSeeAll={handleSeeAll}
              />
            </div>
          )}
        </div>

        <button type="button" className="topbar-profile">
          <span className="topbar-avatar">{hostInitial}</span>
          <span className="topbar-profile-name">{hostName}</span>
        </button>
      </div>
    </header>
  );
}
import { useState, useEffect, useRef, useCallback } from "react";
import {
  IconUser,
  IconSearch,
  IconX,
  IconStar,
  IconCalendar,
  IconMessage,
  IconShield,
  IconCheck,
  IconEdit,
  IconAlertTriangle,
  IconMapPin,
  IconClock,
} from "../../components/icons";
import ConfirmModal from "../../components/common/ConfirmModal";
import { useToast } from "../../components/common/Toast";
import "../../styles/guests.css";

/* ─── Mock helpers ──────────────────────────────────────────── */

function randomStays() { return Math.floor(Math.random() * 12) + 1; }
function randomRating() { return (Math.random() * 1.5 + 3.5).toFixed(1); }
function randomDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

const MOCK_GUESTS = [
  {
    guest_id: "g1",
    full_name: "Maria Santos",
    email: "maria.santos@email.com",
    avatar_url: null,
    member_since: "2022-03-15",
    total_stays: 7,
    host_rating: "4.9",
    last_booking_date: randomDate(12),
    last_property: "Bamboo Nook Studio",
    status: "active",
    is_blocked: false,
    private_note: "Very clean, communicates well. Books long stays.",
  },
  {
    guest_id: "g2",
    full_name: "Jose dela Cruz",
    email: "jdelacruz@mail.ph",
    avatar_url: null,
    member_since: "2021-07-01",
    total_stays: 3,
    host_rating: "4.2",
    last_booking_date: randomDate(34),
    last_property: "The Loft at Maginhawa",
    status: "active",
    is_blocked: false,
    private_note: "",
  },
  {
    guest_id: "g3",
    full_name: "Angela Reyes",
    email: "angela_r@gmail.com",
    avatar_url: null,
    member_since: "2023-01-20",
    total_stays: 1,
    host_rating: null,
    last_booking_date: randomDate(5),
    last_property: "Bamboo Nook Studio",
    status: "active",
    is_blocked: false,
    private_note: "",
  },
  {
    guest_id: "g4",
    full_name: "Robert Aquino",
    email: "raquino@company.com",
    avatar_url: null,
    member_since: "2020-11-08",
    total_stays: 14,
    host_rating: "4.7",
    last_booking_date: randomDate(60),
    last_property: "Sea-View Retreat",
    status: "active",
    is_blocked: false,
    private_note: "Corporate traveler. Always books the same room. Pays on time.",
  },
  {
    guest_id: "g5",
    full_name: "Clarisse Tan",
    email: "clarisset@mail.com",
    avatar_url: null,
    member_since: "2023-08-11",
    total_stays: 2,
    host_rating: "3.1",
    last_booking_date: randomDate(90),
    last_property: "The Loft at Maginhawa",
    status: "active",
    is_blocked: true,
    private_note: "Left unit in poor condition. Blocked.",
  },
  {
    guest_id: "g6",
    full_name: "Marcos Villanueva",
    email: "mvillanueva@gmail.com",
    avatar_url: null,
    member_since: "2022-05-30",
    total_stays: 5,
    host_rating: "4.5",
    last_booking_date: randomDate(20),
    last_property: "Bamboo Nook Studio",
    status: "active",
    is_blocked: false,
    private_note: "",
  },
];

const MOCK_BOOKING_HISTORY = {
  g1: [
    { id: "b101", property: "Bamboo Nook Studio", check_in: "2025-12-01", check_out: "2025-12-05", status: "completed", total: 8400 },
    { id: "b102", property: "Bamboo Nook Studio", check_in: "2025-08-14", check_out: "2025-08-17", status: "completed", total: 6300 },
    { id: "b103", property: "Bamboo Nook Studio", check_in: "2024-12-22", check_out: "2025-01-02", status: "completed", total: 23100 },
  ],
  g2: [
    { id: "b201", property: "The Loft at Maginhawa", check_in: "2025-11-10", check_out: "2025-11-12", status: "completed", total: 5600 },
    { id: "b202", property: "The Loft at Maginhawa", check_in: "2025-06-01", check_out: "2025-06-03", status: "completed", total: 5600 },
  ],
  g3: [
    { id: "b301", property: "Bamboo Nook Studio", check_in: "2026-06-18", check_out: "2026-06-20", status: "confirmed", total: 4200 },
  ],
  g4: [
    { id: "b401", property: "Sea-View Retreat", check_in: "2026-04-01", check_out: "2026-04-07", status: "completed", total: 30000 },
    { id: "b402", property: "Sea-View Retreat", check_in: "2025-09-15", check_out: "2025-09-21", status: "completed", total: 28500 },
    { id: "b403", property: "Sea-View Retreat", check_in: "2025-03-05", check_out: "2025-03-11", status: "completed", total: 27000 },
  ],
  g5: [
    { id: "b501", property: "The Loft at Maginhawa", check_in: "2025-10-01", check_out: "2025-10-03", status: "completed", total: 5600 },
  ],
  g6: [
    { id: "b601", property: "Bamboo Nook Studio", check_in: "2026-06-03", check_out: "2026-06-05", status: "completed", total: 4200 },
    { id: "b602", property: "Bamboo Nook Studio", check_in: "2025-11-28", check_out: "2025-11-30", status: "completed", total: 4200 },
  ],
};

/* ─── Utility ───────────────────────────────────────────────── */

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

function formatCurrency(n) {
  return `₱${Number(n).toLocaleString("en-PH")}`;
}

function daysAgo(str) {
  if (!str) return null;
  const diff = Math.floor((Date.now() - new Date(str)) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 30) return `${diff}d ago`;
  if (diff < 365) return `${Math.floor(diff / 30)}mo ago`;
  return `${Math.floor(diff / 365)}yr ago`;
}

const BOOKING_STATUS_LABEL = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

/* ─── Star display ──────────────────────────────────────────── */

function StarDisplay({ rating }) {
  const val = parseFloat(rating);
  if (!val) return <span className="gm-no-rating">Not yet rated</span>;
  return (
    <span className="gm-star-display">
      <IconStar width={13} height={13} style={{ color: "#C9A84C", fill: "#C9A84C", stroke: "none" }} />
      <span>{val}</span>
    </span>
  );
}

/* ─── Avatar ────────────────────────────────────────────────── */

function GuestAvatar({ guest, size = "md" }) {
  const initials = getInitials(guest.full_name);
  const hue = (guest.guest_id?.charCodeAt(1) || 0) * 23 % 360;
  return (
    <div
      className={`gm-avatar gm-avatar--${size}`}
      style={{ "--avatar-hue": hue }}
      aria-hidden="true"
    >
      {guest.avatar_url ? (
        <img src={guest.avatar_url} alt="" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

/* ─── Guest Row ─────────────────────────────────────────────── */

function GuestRow({ guest, isSelected, onClick }) {
  return (
    <button
      type="button"
      className={`gm-row${isSelected ? " gm-row--selected" : ""}${guest.is_blocked ? " gm-row--blocked" : ""}`}
      onClick={onClick}
      aria-pressed={isSelected}
    >
      <GuestAvatar guest={guest} size="md" />

      <div className="gm-row-info">
        <div className="gm-row-name-line">
          <span className="gm-row-name">{guest.full_name}</span>
          {guest.is_blocked && (
            <span className="gm-badge gm-badge--blocked">Blocked</span>
          )}
        </div>
        <span className="gm-row-email">{guest.email}</span>
      </div>

      <div className="gm-row-meta">
        <span className="gm-row-stays">
          <IconCalendar width={13} height={13} />
          {guest.total_stays} stay{guest.total_stays !== 1 ? "s" : ""}
        </span>
        <StarDisplay rating={guest.host_rating} />
      </div>

      <div className="gm-row-last">
        <span className="gm-row-last-prop">{guest.last_property}</span>
        <span className="gm-row-last-when">{daysAgo(guest.last_booking_date)}</span>
      </div>

      <div className="gm-row-chevron" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </button>
  );
}

/* ─── Booking History Item ──────────────────────────────────── */

function BookingHistoryItem({ booking }) {
  const nights = Math.max(1, Math.ceil((new Date(booking.check_out) - new Date(booking.check_in)) / 86400000));
  return (
    <div className="gm-booking-item">
      <div className="gm-booking-item-top">
        <span className="gm-booking-item-prop">{booking.property}</span>
        <span className={`gm-booking-item-status gm-status--${booking.status}`}>
          {BOOKING_STATUS_LABEL[booking.status] || booking.status}
        </span>
      </div>
      <div className="gm-booking-item-bottom">
        <span>
          <IconCalendar width={12} height={12} />
          {formatDate(booking.check_in)} – {formatDate(booking.check_out)}
        </span>
        <span>
          <IconClock width={12} height={12} />
          {nights} night{nights !== 1 ? "s" : ""}
        </span>
        <span className="gm-booking-item-amount">{formatCurrency(booking.total)}</span>
      </div>
    </div>
  );
}

/* ─── Profile Drawer ────────────────────────────────────────── */

function GuestProfileDrawer({ guest, onClose, onGuestUpdate }) {
  const { showToast } = useToast();
  const [note, setNote] = useState(guest?.private_note || "");
  const [editingNote, setEditingNote] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const noteRef = useRef(null);
  const bookings = MOCK_BOOKING_HISTORY[guest?.guest_id] || [];

  useEffect(() => {
    setNote(guest?.private_note || "");
    setEditingNote(false);
  }, [guest?.guest_id]);

  useEffect(() => {
    if (editingNote && noteRef.current) noteRef.current.focus();
  }, [editingNote]);

  if (!guest) return null;

  const totalSpent = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + b.total, 0);

  async function handleSaveNote() {
    setSavingNote(true);
    await new Promise((r) => setTimeout(r, 600));
    setSavingNote(false);
    setEditingNote(false);
    onGuestUpdate(guest.guest_id, { private_note: note });
    showToast("Note saved.", "success");
  }

  function handleToggleBlock() {
    setBlockModalOpen(true);
  }

  function confirmBlock() {
    const next = !guest.is_blocked;
    onGuestUpdate(guest.guest_id, { is_blocked: next });
    setBlockModalOpen(false);
    showToast(next ? "Guest blocked." : "Guest unblocked.", next ? "error" : "success");
  }

  return (
    <>
      <div className="gm-drawer-backdrop" onClick={onClose} aria-hidden="true" />
      <aside className="gm-drawer" role="dialog" aria-modal="true" aria-label={`${guest.full_name} profile`}>
        {/* Header */}
        <div className="gm-drawer-header">
          <button className="gm-drawer-close" onClick={onClose} aria-label="Close profile">
            <IconX />
          </button>
          <span className="gm-drawer-header-label">Guest Profile</span>
        </div>

        <div className="gm-drawer-body">
          {/* Identity block */}
          <div className="gm-drawer-identity">
            <GuestAvatar guest={guest} size="lg" />
            <div className="gm-drawer-identity-info">
              <h2 className="gm-drawer-name">
                {guest.full_name}
                {guest.is_blocked && <span className="gm-badge gm-badge--blocked">Blocked</span>}
              </h2>
              <span className="gm-drawer-email">{guest.email}</span>
              <span className="gm-drawer-since">
                <IconClock width={13} height={13} />
                Member since {formatDate(guest.member_since)}
              </span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="gm-drawer-stats">
            <div className="gm-drawer-stat">
              <span className="gm-drawer-stat-value">{guest.total_stays}</span>
              <span className="gm-drawer-stat-label">Total Stays</span>
            </div>
            <div className="gm-drawer-stat-divider" />
            <div className="gm-drawer-stat">
              <span className="gm-drawer-stat-value">
                {guest.host_rating ? (
                  <>
                    <IconStar width={14} height={14} style={{ color: "#C9A84C", fill: "#C9A84C", stroke: "none", verticalAlign: "-2px" }} />
                    {guest.host_rating}
                  </>
                ) : "—"}
              </span>
              <span className="gm-drawer-stat-label">Your Rating</span>
            </div>
            <div className="gm-drawer-stat-divider" />
            <div className="gm-drawer-stat">
              <span className="gm-drawer-stat-value">{formatCurrency(totalSpent)}</span>
              <span className="gm-drawer-stat-label">Total Spent</span>
            </div>
          </div>

          {/* Action strip */}
          <div className="gm-drawer-actions">
            <button type="button" className="gm-action-btn gm-action-btn--message">
              <IconMessage />
              <span>Message</span>
            </button>
            <button
              type="button"
              className={`gm-action-btn ${guest.is_blocked ? "gm-action-btn--unblock" : "gm-action-btn--block"}`}
              onClick={handleToggleBlock}
            >
              <IconShield />
              <span>{guest.is_blocked ? "Unblock" : "Block"}</span>
            </button>
          </div>

          {/* Private note */}
          <section className="gm-drawer-section">
            <div className="gm-drawer-section-head">
              <h3 className="gm-drawer-section-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L12 14l-4 1 1-4 7.5-7.5Z" />
                </svg>
                Private Note
              </h3>
              {!editingNote && (
                <button
                  type="button"
                  className="gm-note-edit-btn"
                  onClick={() => setEditingNote(true)}
                  aria-label="Edit note"
                >
                  <IconEdit width={14} height={14} />
                  {note ? "Edit" : "Add note"}
                </button>
              )}
            </div>

            {editingNote ? (
              <div className="gm-note-editor">
                <textarea
                  ref={noteRef}
                  className="gm-note-textarea"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Write a private note about this guest (only visible to you)…"
                  rows={4}
                  maxLength={500}
                />
                <div className="gm-note-editor-footer">
                  <span className="gm-note-char-count">{note.length}/500</span>
                  <div className="gm-note-editor-btns">
                    <button
                      type="button"
                      className="gm-note-btn gm-note-btn--cancel"
                      onClick={() => { setNote(guest.private_note || ""); setEditingNote(false); }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="gm-note-btn gm-note-btn--save"
                      onClick={handleSaveNote}
                      disabled={savingNote}
                    >
                      {savingNote ? (
                        <span className="btn-spinner" style={{ borderTopColor: "#fff", borderColor: "rgba(255,255,255,0.3)", width: 14, height: 14 }} />
                      ) : (
                        <IconCheck width={14} height={14} />
                      )}
                      Save
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="gm-note-display">
                {note ? (
                  <p>{note}</p>
                ) : (
                  <span className="gm-note-empty">No note yet. Add a private note to remember details about this guest.</span>
                )}
              </div>
            )}
          </section>

          {/* Booking history */}
          <section className="gm-drawer-section">
            <div className="gm-drawer-section-head">
              <h3 className="gm-drawer-section-title">
                <IconCalendar width={14} height={14} />
                Booking History
              </h3>
              <span className="gm-drawer-section-count">{bookings.length}</span>
            </div>
            {bookings.length === 0 ? (
              <p className="gm-note-empty">No bookings with your properties yet.</p>
            ) : (
              <div className="gm-booking-list">
                {bookings.map((b) => (
                  <BookingHistoryItem key={b.id} booking={b} />
                ))}
              </div>
            )}
          </section>
        </div>
      </aside>

      <ConfirmModal
        open={blockModalOpen}
        title={guest.is_blocked ? "Unblock Guest" : "Block Guest"}
        message={
          guest.is_blocked
            ? `Unblocking ${guest.full_name} will allow them to book your properties again.`
            : `Blocking ${guest.full_name} will prevent them from booking any of your properties. This action can be reversed anytime.`
        }
        confirmLabel={guest.is_blocked ? "Unblock" : "Block Guest"}
        danger={!guest.is_blocked}
        onConfirm={confirmBlock}
        onCancel={() => setBlockModalOpen(false)}
      />
    </>
  );
}

/* ─── Empty State ───────────────────────────────────────────── */

function EmptyState({ query }) {
  return (
    <div className="gm-empty">
      <svg className="gm-empty-illustration" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {/* Background shapes */}
        <rect x="20" y="30" width="140" height="70" rx="10" fill="var(--color-surface-alt)" />
        {/* Silhouette group */}
        <circle cx="70" cy="52" r="16" fill="var(--color-border)" />
        <path d="M44 90c0-14.4 11.7-26 26-26s26 11.6 26 26" stroke="var(--color-border)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Search lens overlay */}
        <circle cx="118" cy="62" r="22" fill="var(--color-bg)" stroke="var(--color-border)" strokeWidth="2.5" />
        <circle cx="118" cy="62" r="13" stroke="var(--color-border)" strokeWidth="2" fill="none" />
        <path d="M127 71l7 7" stroke="var(--color-border)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Question mark inside lens */}
        <text x="114" y="67" fontFamily="sans-serif" fontSize="13" fill="var(--color-text-muted)" fontWeight="700">?</text>
      </svg>
      <p className="gm-empty-title">
        {query ? `No guests matching "${query}"` : "No guests yet"}
      </p>
      <p className="gm-empty-body">
        {query
          ? "Try a different name or email address."
          : "Guests who have booked your properties will appear here."}
      </p>
    </div>
  );
}

/* ─── Skeleton ──────────────────────────────────────────────── */

function GuestRowSkeleton() {
  return (
    <div className="gm-row gm-row--skeleton" aria-hidden="true">
      <div className="gm-avatar gm-avatar--md skeleton-pulse" />
      <div className="gm-row-info">
        <div className="skeleton-line" style={{ width: "55%", height: 14, borderRadius: 6 }} />
        <div className="skeleton-line" style={{ width: "38%", height: 12, borderRadius: 6, marginTop: 6 }} />
      </div>
      <div className="gm-row-meta" style={{ gap: 8 }}>
        <div className="skeleton-line" style={{ width: 60, height: 12, borderRadius: 6 }} />
        <div className="skeleton-line" style={{ width: 36, height: 12, borderRadius: 6 }} />
      </div>
      <div className="gm-row-last" style={{ gap: 6 }}>
        <div className="skeleton-line" style={{ width: 90, height: 12, borderRadius: 6 }} />
        <div className="skeleton-line" style={{ width: 50, height: 11, borderRadius: 6 }} />
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────── */

export default function GuestManagement() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedGuest, setSelectedGuest] = useState(null);
  const searchRef = useRef(null);

  // Simulate fetch
  useEffect(() => {
    const t = setTimeout(() => {
      setGuests(MOCK_GUESTS);
      setLoading(false);
    }, 900);
    return () => clearTimeout(t);
  }, []);

  // Close drawer on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setSelectedGuest(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const filtered = guests.filter((g) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return g.full_name.toLowerCase().includes(q) || g.email.toLowerCase().includes(q);
  });

  const handleGuestUpdate = useCallback((id, patch) => {
    setGuests((prev) => prev.map((g) => g.guest_id === id ? { ...g, ...patch } : g));
    setSelectedGuest((prev) => prev?.guest_id === id ? { ...prev, ...patch } : prev);
  }, []);

  const totalGuests = guests.length;
  const blockedCount = guests.filter((g) => g.is_blocked).length;
  const repeatCount = guests.filter((g) => g.total_stays > 1).length;

  return (
    <div className="gm-page">
      {/* Page header */}
      <header className="gm-page-header">
        <div className="gm-page-header-left">
          <h1 className="gm-page-title">Guests</h1>
          <p className="gm-page-subtitle">Your complete guest directory — history, notes, and trust signals in one place.</p>
        </div>
      </header>

      {/* Stats strip */}
      <div className="gm-stats-strip">
        <div className="gm-stat-chip">
          <span className="gm-stat-chip-icon">
            <IconUser width={16} height={16} />
          </span>
          <div>
            <span className="gm-stat-chip-value">{totalGuests}</span>
            <span className="gm-stat-chip-label">Total Guests</span>
          </div>
        </div>
        <div className="gm-stat-chip">
          <span className="gm-stat-chip-icon gm-stat-chip-icon--gold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M17 3H7l-4 9h18L17 3Z" />
              <path d="M3 12v2a9 9 0 0 0 18 0v-2" />
            </svg>
          </span>
          <div>
            <span className="gm-stat-chip-value">{repeatCount}</span>
            <span className="gm-stat-chip-label">Repeat Guests</span>
          </div>
        </div>
        <div className="gm-stat-chip">
          <span className="gm-stat-chip-icon gm-stat-chip-icon--danger">
            <IconShield width={16} height={16} />
          </span>
          <div>
            <span className="gm-stat-chip-value">{blockedCount}</span>
            <span className="gm-stat-chip-label">Blocked</span>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="gm-search-bar">
        <label htmlFor="gm-search" className="sr-only">Search guests</label>
        <span className="gm-search-icon" aria-hidden="true">
          <IconSearch width={17} height={17} />
        </span>
        <input
          id="gm-search"
          ref={searchRef}
          type="search"
          className="gm-search-input"
          placeholder="Search by name or email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            className="gm-search-clear"
            onClick={() => { setQuery(""); searchRef.current?.focus(); }}
            aria-label="Clear search"
          >
            <IconX width={15} height={15} />
          </button>
        )}
      </div>

      {/* Column headers — desktop only */}
      <div className="gm-list-header" aria-hidden="true">
        <span>Guest</span>
        <span className="gm-col-meta">Stays / Rating</span>
        <span className="gm-col-last">Last Booking</span>
      </div>

      {/* List */}
      <div className="gm-list" role="list">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <GuestRowSkeleton key={i} />)
        ) : filtered.length === 0 ? (
          <EmptyState query={query} />
        ) : (
          filtered.map((guest) => (
            <GuestRow
              key={guest.guest_id}
              guest={guest}
              isSelected={selectedGuest?.guest_id === guest.guest_id}
              onClick={() => setSelectedGuest(guest)}
            />
          ))
        )}
      </div>

      {/* Profile Drawer */}
      {selectedGuest && (
        <GuestProfileDrawer
          guest={selectedGuest}
          onClose={() => setSelectedGuest(null)}
          onGuestUpdate={handleGuestUpdate}
        />
      )}
    </div>
  );
}
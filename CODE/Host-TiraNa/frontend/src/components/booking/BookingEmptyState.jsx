function EmptyDocketIllustration() {
  return (
    <svg className="empty-state-illo" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="80" cy="80" r="78" fill="#F4F1E8" />
      <rect x="34" y="56" width="92" height="54" rx="6" fill="#FBF9F4" stroke="#1B2A4A" strokeWidth="1.5" />
      <path d="M94 56 V110" stroke="#1B2A4A" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="94" cy="56" r="3.5" fill="#F4F1E8" stroke="#1B2A4A" strokeWidth="1.5" />
      <circle cx="94" cy="110" r="3.5" fill="#F4F1E8" stroke="#1B2A4A" strokeWidth="1.5" />
      <path d="M44 70h36M44 78h28" stroke="#1B2A4A" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
      <rect x="103" y="68" width="14" height="14" rx="2" fill="#C9A84C" opacity="0.85" />
      <path d="M44 96h44" stroke="#1B2A4A" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <circle cx="120" cy="44" r="3" fill="#C9A84C" opacity="0.7" />
      <circle cx="38" cy="116" r="2" fill="#C9A84C" opacity="0.5" />
    </svg>
  );
}

export default function BookingEmptyState({ title, message }) {
  return (
    <div className="empty-state">
      <EmptyDocketIllustration />
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}
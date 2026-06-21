import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileTabBar from "./MobileTabBar";

const PAGE_META = {
  "/dashboard": { eyebrow: "Overview", title: "Dashboard" },
  "/dashboard/properties": { eyebrow: "Operations", title: "Property Management" },
  "/dashboard/properties/new": { eyebrow: "Property Management", title: "List a New Property" },
  "/dashboard/bookings": { eyebrow: "Operations", title: "Bookings" },
  "/dashboard/guests": { eyebrow: "Operations", title: "Guests" },
  "/dashboard/revenue": { eyebrow: "Earnings", title: "Revenue" },
  "/dashboard/wallet": { eyebrow: "Earnings", title: "Wallet & Payouts" },
  "/dashboard/reviews": { eyebrow: "Engagement", title: "Reviews" },
  "/dashboard/messages": { eyebrow: "Engagement", title: "Messages" },
  "/dashboard/support": { eyebrow: "Account", title: "Support & Disputes" },
  "/dashboard/settings": { eyebrow: "Account", title: "Settings" },
};

function resolveMeta(pathname) {
  if (PAGE_META[pathname]) return PAGE_META[pathname];
  if (pathname.startsWith("/dashboard/properties/")) {
    return { eyebrow: "Property Management", title: "Edit Property" };
  }
  return { eyebrow: "", title: "Dashboard" };
}

export default function DashboardLayout() {
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();
  const meta = resolveMeta(location.pathname);

  const raw = localStorage.getItem("host");
  const host = raw ? JSON.parse(raw) : null;
  const fullName = host?.full_name || "Host";
  const hostInitial = fullName.charAt(0).toUpperCase();

  return (
    <div className="shell">
      <Sidebar expanded={expanded} onToggle={() => setExpanded((v) => !v)} />

      <div className="shell-main">
        <Topbar eyebrow={meta.eyebrow} title={meta.title} onMenuClick={() => setExpanded((v) => !v)} hostInitial={hostInitial} hostName={fullName} />

        <main className="page-frame">
          <Outlet />
        </main>
      </div>

      <MobileTabBar />
    </div>
  );
}

import { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import {
  IconHome,
  IconBuilding,
  IconCalendar,
  IconChart,
  IconWallet,
  IconUsers,
  IconStar,
  IconMessage,
  IconLifeBuoy,
  IconSettings,
  IconChevronLeft,
  IconPower,
} from "../icons";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [{ to: "/dashboard", label: "Dashboard", icon: IconHome, end: true }],
  },
  {
    label: "Operations",
    items: [
      { to: "/dashboard/properties", label: "Property Management", icon: IconBuilding },
      { to: "/dashboard/bookings", label: "Bookings", icon: IconCalendar },
      { to: "/dashboard/guests", label: "Guests", icon: IconUsers },
    ],
  },
  {
    label: "Earnings",
    items: [
      { to: "/dashboard/revenue", label: "Revenue", icon: IconChart },
      { to: "/dashboard/wallet", label: "Wallet & Payouts", icon: IconWallet },
    ],
  },
  {
    label: "Engagement",
    items: [
      { to: "/dashboard/reviews", label: "Reviews", icon: IconStar },
      { to: "/dashboard/messages", label: "Messages", icon: IconMessage, badge: 3 },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/dashboard/support", label: "Support & Disputes", icon: IconLifeBuoy },
      { to: "/dashboard/settings", label: "Settings", icon: IconSettings },
    ],
  },
];

export default function Sidebar({ expanded, onToggle }) {
  return (
    <aside className={`shell-sidebar ${expanded ? "expanded" : "collapsed"}`}>
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">
          <img src={logo} alt="" />
        </div>
        <span className="sidebar-brand-text">TiraNa</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="sidebar-section-label">{section.label}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
                title={!expanded ? item.label : undefined}
              >
                <item.icon />
                <span className="sidebar-link-label">{item.label}</span>
                {item.badge ? <span className="sidebar-link-badge">{item.badge}</span> : null}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <button type="button" className="sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
        <IconChevronLeft />
        <span className="sidebar-link-label">Collapse</span>
      </button>

      <div className="sidebar-footer">
        <NavLink to="/signin" className="sidebar-link">
          <IconPower />
          <span className="sidebar-link-label">Sign out</span>
        </NavLink>
      </div>
    </aside>
  );
}

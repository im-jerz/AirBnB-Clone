import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  IconHome,
  IconBuilding,
  IconCalendar,
  IconWallet,
  IconMenu,
  IconUsers,
  IconChart,
  IconStar,
  IconMessage,
  IconLifeBuoy,
  IconSettings,
  IconPower,
} from "../icons";

const PRIMARY_TABS = [
  { to: "/dashboard", label: "Home", icon: IconHome, end: true },
  { to: "/dashboard/properties", label: "Properties", icon: IconBuilding },
  { to: "/dashboard/bookings", label: "Bookings", icon: IconCalendar },
  { to: "/dashboard/wallet", label: "Wallet", icon: IconWallet },
];

const MORE_LINKS = [
  { to: "/dashboard/guests", label: "Guests", icon: IconUsers },
  { to: "/dashboard/revenue", label: "Revenue", icon: IconChart },
  { to: "/dashboard/reviews", label: "Reviews", icon: IconStar },
  { to: "/dashboard/messages", label: "Messages", icon: IconMessage },
  { to: "/dashboard/support", label: "Support & Disputes", icon: IconLifeBuoy },
  { to: "/dashboard/settings", label: "Settings", icon: IconSettings },
];

export default function MobileTabBar() {
  const [moreOpen, setMoreOpen] = useState(false);
  const popRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (popRef.current && !popRef.current.contains(e.target)) setMoreOpen(false);
    }
    if (moreOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [moreOpen]);

  return (
    <>
      {moreOpen && (
        <div className="mobile-tab-more" ref={popRef}>
          {MORE_LINKS.map((item) => (
            <NavLink key={item.to} to={item.to} className="mobile-more-link" onClick={() => setMoreOpen(false)}>
              <item.icon />
              {item.label}
            </NavLink>
          ))}
          <NavLink to="/signin" className="mobile-more-link">
            <IconPower />
            Sign out
          </NavLink>
        </div>
      )}
      <nav className="mobile-tabbar">
        {PRIMARY_TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => `mobile-tab${isActive ? " active" : ""}`}
          >
            <tab.icon />
            <span>{tab.label}</span>
          </NavLink>
        ))}
        <button type="button" className="mobile-tab" onClick={() => setMoreOpen((v) => !v)}>
          <IconMenu />
          <span>More</span>
        </button>
      </nav>
    </>
  );
}

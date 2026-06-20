import streamlit as st


NAV_ITEMS = [
    ("Dashboard", "dashboard"),
    ("Listings", "listings_moderation"),
    ("Bookings", "bookings_management"),
    ("Payments", "payments_refunds"),
    ("Reviews", "reviews_management"),
    ("Users", "user_management"),
    ("Hosts", "host_management"),
    ("Host Verification", "host_verification"),
    ("Support", "support_tickets"),
    ("Disputes", "disputes"),
    ("Admins", "admin_management"),
    ("Settings", "settings"),
]


def render_sidebar(admin) -> None:
    """Render the shared admin sidebar with profile + navigation + logout.

    Reads/writes `st.session_state.page` — the same key `app.py` uses to
    route between views — so a click here actually navigates.

    The active page is highlighted (primary button style) so the admin
    always knows where they are.
    """
    with st.sidebar:
        st.markdown(
            f"<div style='display:flex;align-items:center;gap:0.5rem;"
            f"margin-bottom:0.25rem;'>"
            f"<div style='width:32px;height:32px;border-radius:50%;"
            f"background-color:var(--color-accent);"
            f"display:flex;align-items:center;justify-content:center;"
            f"font-family:var(--font-body);font-size:0.8125rem;font-weight:600;"
            f"color:#FFFFFF;flex-shrink:0;'>{admin.full_name[0].upper()}</div>"
            f"<div style='font-family:var(--font-body);font-size:0.9375rem;"
            f"font-weight:500;color:var(--color-sidebar-text);'>{admin.full_name}</div>"
            f"</div>",
            unsafe_allow_html=True,
        )
        st.caption(admin.email)
        st.divider()

        st.markdown(
            f"<div style='font-family:var(--font-body);font-weight:600;"
            f"font-size:0.75rem;text-transform:uppercase;letter-spacing:0.06em;"
            f"color:rgba(255,255,255,0.4);margin-bottom:0.75rem;'>"
            f"Navigation</div>",
            unsafe_allow_html=True,
        )

        current_page = st.session_state.get("page", "")
        for label, page_value in NAV_ITEMS:
            is_active = current_page == page_value
            if st.button(
                label,
                key=f"nav_{page_value}",
                use_container_width=True,
                type="primary" if is_active else "secondary",
            ):
                st.session_state.page = page_value
                st.rerun()

        st.divider()
        if st.button("Logout", key="nav_logout", use_container_width=True):
            for key in list(st.session_state.keys()):
                del st.session_state[key]
            st.query_params.clear()
            st.session_state.page = "sign_in"
            st.rerun()

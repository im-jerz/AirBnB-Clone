import streamlit as st

from database import SessionLocal
from services.auth_service import get_admin_by_id
from components.sidebar import render_sidebar


def page_header(title: str, subtitle: str | None = None):
    sub = ""
    if subtitle:
        sub = f"<p style='color:var(--color-text-muted);margin:0.125rem 0 0 0;font-size:0.9375rem;'>{subtitle}</p>"
    st.markdown(
        f"<div class='page-head'>"
        f"<h1>{title}</h1>"
        f"{sub}"
        f"<div class='accent-line'></div>"
        f"</div>",
        unsafe_allow_html=True,
    )


def require_auth():
    if not st.session_state.get("logged_in"):
        st.warning("Please sign in to access the dashboard.")
        st.stop()

    db = SessionLocal()
    try:
        admin = get_admin_by_id(db, st.session_state.get("admin_id", ""))
    finally:
        db.close()

    if not admin:
        st.warning("Admin not found")
        st.stop()

    render_sidebar(admin)
    return admin


def auth_page(title: str, header: bool = True):
    admin = require_auth()
    if header:
        page_header(title)
    return admin

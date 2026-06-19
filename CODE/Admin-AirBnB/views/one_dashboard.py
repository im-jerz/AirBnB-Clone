import time
from datetime import datetime

import streamlit as st
import plotly.express as px
import pandas as pd

from database import SessionLocal
from services.host_api import host_api
from services.audit_service import get_audit_logs
from views._shared import auth_page
from utils.charts import chart_layout


def _greeting() -> str:
    hour = datetime.now().hour
    if hour < 12:
        return "Good morning"
    if hour < 18:
        return "Good afternoon"
    return "Good evening"


def _time_ago(ts) -> str:
    if not ts:
        return ""
    delta = time.time() - ts.timestamp()
    if delta < 60:
        return "just now"
    if delta < 3600:
        return f"{int(delta // 60)}m ago"
    if delta < 86400:
        return f"{int(delta // 3600)}h ago"
    return f"{int(delta // 86400)}d ago"


def _render_kpi_cards(stats: dict):
    st.markdown(f"""
    <div class="kpi-grid">
        <div class="kpi-card"><div class="kpi-label">Total Bookings</div><div class="kpi-value">{stats['total_bookings']:,}</div><div class="kpi-sub">All time</div></div>
        <div class="kpi-card"><div class="kpi-label">Total Revenue</div><div class="kpi-value">₱{stats['total_revenue']:,.2f}</div><div class="kpi-sub">All time</div></div>
        <div class="kpi-card"><div class="kpi-label">Active Hosts</div><div class="kpi-value">{stats['active_hosts']:,}</div><div class="kpi-sub">Registered partners</div></div>
        <div class="kpi-card"><div class="kpi-label">Active Rooms</div><div class="kpi-value">{stats['active_rooms']:,}</div><div class="kpi-sub">Live listings</div></div>
    </div>
    """, unsafe_allow_html=True)


def _render_activity_feed():
    db = SessionLocal()
    try:
        result = get_audit_logs(db, page=1, per_page=8)
        logs = result.get("logs", [])
    finally:
        db.close()

    if not logs:
        st.markdown(
            "<div class='section-card'><h3>Recent Activity</h3>"
            "<p style='color: var(--color-text-muted); font-size: 0.875rem;'>"
            "No recent activity recorded.</p></div>",
            unsafe_allow_html=True,
        )
        return

    items_html = ""
    for log in logs:
        action = log.action.replace("_", " ").title()
        target = f"{log.target_type} #{log.target_id}" if log.target_type else ""
        ago = _time_ago(log.created_at)
        items_html += (
            f"<div style='display:flex;align-items:center;gap:0.75rem;"
            f"padding:0.5rem 0;border-bottom:1px solid var(--color-border);'>"
            f"<div style='width:6px;height:6px;border-radius:50%;"
            f"background-color:var(--color-primary);flex-shrink:0;'></div>"
            f"<div style='flex:1;font-size:0.875rem;color:var(--color-text);'>{action}"
            f"<span style='color:var(--color-text-muted);'> {target}</span></div>"
            f"<div style='font-size:0.8125rem;color:var(--color-text-muted);"
            f"white-space:nowrap;'>{ago}</div>"
            f"</div>"
        )

    st.markdown(
        f"<div class='section-card'>"
        f"<h3>Recent Activity</h3>"
        f"{items_html}</div>",
        unsafe_allow_html=True,
    )


def _render_quick_actions():
    actions = [
        ("Listings", "listings_moderation", "Moderate property listings"),
        ("Payments", "payments_refunds", "Process payouts and refunds"),
        ("Support", "support_tickets", "Review open support tickets"),
        ("Users", "user_management", "Manage platform users"),
    ]

    cols = st.columns(4)
    for col, (label, page_key, desc) in zip(cols, actions):
        with col:
            st.markdown('<div class="qa-grid">', unsafe_allow_html=True)
            if st.button(f"**{label}**  \n{desc}", key=f"qa_{page_key}", use_container_width=True):
                st.session_state.page = page_key
                st.rerun()
            st.markdown('</div>', unsafe_allow_html=True)


def _render_alert_badges(stats: dict):
    alerts = []
    if stats.get("pending_verifications", 0) > 0:
        alerts.append(("Pending Verifications", stats["pending_verifications"], "host_verification"))
    if stats.get("reported_rooms", 0) > 0:
        alerts.append(("Reported Listings", stats["reported_rooms"], "listings_moderation"))
    if stats.get("open_disputes", 0) > 0:
        alerts.append(("Open Disputes", stats["open_disputes"], "disputes"))

    body = ""
    if not alerts:
        body = (
            "<p style='color:var(--color-text-muted);font-size:0.875rem;margin:0;'>"
            "All clear — no items requiring attention.</p>"
        )
    else:
        for label, count, page_key in alerts:
            body += (
                f"<div style='display:flex;align-items:center;justify-content:space-between;"
                f"padding:0.5rem 0;"
                f"border-bottom:1px solid var(--color-border);'>"
                f"<span style='font-size:0.875rem;color:var(--color-text);'>{label}</span>"
                f"<span style='font-family:var(--font-mono);font-size:1.25rem;"
                f"font-weight:600;color:var(--color-primary);'>{count}</span>"
                f"</div>"
            )

    st.markdown(
        f"<div class='section-card'>"
        f"<h3>Needs Attention</h3>"
        f"{body}</div>",
        unsafe_allow_html=True,
    )


def _render_revenue_chart():
    st.markdown("<h3>Revenue</h3>", unsafe_allow_html=True)
    col1, col2 = st.columns([3, 1])
    with col2:
        period = st.radio(
            "Period", ["7d", "30d", "90d", "1y"],
            index=1, horizontal=True, key="revenue_period",
        )
    with col1:
        data = host_api.get_revenue(period)
        if not data:
            st.info("No revenue data available")
            return
        df = pd.DataFrame(data)
        fig = px.line(
            df, x="date", y="revenue", markers=True,
            labels={"date": "", "revenue": "Revenue (₱)"},
        )
        fig.update_traces(line_color="#A0455E", marker=dict(color="#A0455E", size=4))
        fig.update_layout(**chart_layout())
        st.plotly_chart(fig, use_container_width=True)


def _render_booking_chart():
    st.markdown("<h3>Bookings by Status</h3>", unsafe_allow_html=True)
    data = host_api.get_booking_stats()
    if not data:
        st.info("No booking data available")
        return
    df = pd.DataFrame(data)
    color_map = {
        "pending": "#D4943E",
        "confirmed": "#7B1E3A",
        "cancelled": "#8B5E3C",
        "completed": "#6B8F5E",
    }
    fig = px.bar(
        df, x="status", y="count", color="status",
        color_discrete_map=color_map,
        labels={"status": "", "count": "Bookings"},
    )
    fig.update_layout(**chart_layout(showlegend=False))
    st.plotly_chart(fig, use_container_width=True)


def render():
    admin = auth_page("Dashboard", header=False)
    g = _greeting()

    st.markdown(
        f"<div class='page-head'>"
        f"<h1>{g}, {admin.full_name}</h1>"
        f"<p style='color:var(--color-text-muted);margin:0.125rem 0 0 0;'>"
        f"Platform overview</p>"
        f"<div class='accent-line'></div>"
        f"</div>",
        unsafe_allow_html=True,
    )

    if not host_api.is_available():
        st.warning("Host API unavailable")

    stats = host_api.get_stats()

    _render_kpi_cards(stats)
    st.markdown("<div style='height:1.5rem'></div>", unsafe_allow_html=True)

    c1, c2 = st.columns([2, 1])
    with c1:
        _render_activity_feed()
    with c2:
        _render_alert_badges(stats)

    st.markdown("<h3>Quick Actions</h3>", unsafe_allow_html=True)
    _render_quick_actions()

    st.markdown("<div style='height:1.5rem'></div>", unsafe_allow_html=True)

    chart_left, chart_right = st.columns(2)
    with chart_left:
        _render_revenue_chart()
    with chart_right:
        _render_booking_chart()

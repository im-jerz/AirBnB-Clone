import logging
import streamlit as st
from database import SessionLocal
from models import init_db

logging.basicConfig(level=logging.INFO, format="%(message)s")

st.set_page_config(layout="wide", initial_sidebar_state="collapsed")

if "db_initialized" not in st.session_state:
    init_db()
    st.session_state.db_initialized = True

if "page" not in st.session_state:
    st.session_state.page = "sign_in"

if st.session_state.get("logged_in"):
    st.session_state.page = "dashboard"
elif st.session_state.get("pending_admin_id"):
    st.session_state.page = "verify_otp"

hide_header_css = """
    <style>
        header[data-testid="stHeader"],
        [data-testid="stHeader"],
        .stAppDeployButton,
        header {
            display: none !important;
            visibility: hidden !important;
            height: 0px !important;
        }
        .block-container {
            padding-top: 2rem !important;
        }
    </style>
"""

hide_sidebar_css = """
    <style>
        [data-testid="stSidebarCollapseButton"],
        button[title="Open sidebar"],
        button[title="Close sidebar"] {
            display: none !important;
            visibility: hidden !important;
        }
    </style>
"""

st.markdown(hide_header_css, unsafe_allow_html=True)

page = st.session_state.page

if page != "dashboard":
    st.markdown(hide_sidebar_css, unsafe_allow_html=True)

if page == "sign_in":
    from views.sign_in import render as render_sign_in
    render_sign_in()
elif page == "sign_up":
    from views.sign_up import render as render_sign_up
    render_sign_up()
elif page == "verify_otp":
    from views.verify_otp import render as render_verify_otp
    render_verify_otp()
elif page == "dashboard":
    from views.dashboard import render as render_dashboard
    render_dashboard()

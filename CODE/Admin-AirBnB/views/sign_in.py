import streamlit as st
from database import SessionLocal
from services.auth_service import login_admin


def render():
    st.markdown(
        "<style>"
        "html, body, section[data-testid='stApp'] {"
        "overflow-x: hidden !important;"
        "}"
        "section[data-testid='stApp'] {"
        "background: linear-gradient(160deg, #F0ECE4 0%, #F8F5F0 100%) !important;"
        "}"
        "</style>",
        unsafe_allow_html=True,
    )
    col1, col2, col3 = st.columns([1, 1.2, 1])
    with col2:
        st.markdown(
            "<div style='text-align:center;padding-bottom:1rem;'>"
            "<h1 style='font-size:1.5rem;margin-bottom:0.25rem;'>Admin Console</h1>"
            "<div style='height:3px;width:2.5rem;background-color:var(--color-accent);"
            "margin:0.5rem auto 0 auto;border-radius:2px;'></div>"
            "</div>",
            unsafe_allow_html=True,
        )
        with st.container(border=True):
            email = st.text_input("Email", placeholder="Enter your email")
            password = st.text_input("Password", type="password", placeholder="Enter your password")

            if st.button("Sign In", key="signin_btn", use_container_width=True):
                if not email or not password:
                    st.error("Email and password are required")
                else:
                    db = SessionLocal()
                    try:
                        admin_id, error = login_admin(db, email, password)
                        if error:
                            st.error(error)
                        else:
                            st.session_state.pending_admin_id = admin_id
                            st.session_state.pending_email = email
                            st.session_state.otp_purpose = "signin_verify"
                            st.rerun()
                    finally:
                        db.close()

        if st.button("Don't have an account? Sign Up", key="go_signup_btn", type="secondary", use_container_width=False):
            st.session_state.page = "sign_up"
            st.rerun()

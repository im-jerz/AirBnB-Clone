class StateKeys:
    LOGGED_IN = "logged_in"
    ADMIN_ID = "admin_id"
    PAGE = "page"
    PENDING_ADMIN_ID = "pending_admin_id"
    PENDING_EMAIL = "pending_email"
    OTP_PURPOSE = "otp_purpose"
    LOGIN_TIMESTAMP = "login_timestamp"
    DB_INITIALIZED = "db_initialized"
    RESEND_COOLDOWN = "resend_cooldown"

    SELECTED_LISTING_ID = "selected_listing_id"
    SELECTED_GUEST_ID = "selected_guest_id"
    SELECTED_HOST_ID = "selected_host_id"
    SELECTED_TICKET_ID = "selected_ticket_id"
    SELECTED_DISPUTE_ID = "selected_dispute_id"
    SELECTED_REVIEW_ID = "selected_review_id"
    SELECTED_VERIFICATION_ID = "selected_verification_id"
    SELECTED_ADMIN_ID = "selected_admin_id"

    LISTINGS_PAGE = "listings_page"
    GUEST_PAGE = "guest_page"
    HOST_PAGE = "host_page"
    TICKET_PAGE = "ticket_page"
    DISPUTE_PAGE = "dispute_page"
    REVIEWS_PAGE = "reviews_page"
    VERIFY_PAGE = "verify_page"
    ADMINS_PAGE = "admins_page"
    BOOKINGS_PAGE = "bookings_page"
    PAYMENTS_PAGE = "payments_page"

    LISTING_STATUS_FILTER = "listing_status_filter"
    LISTING_SEARCH = "listing_search"
    GUEST_SEARCH = "guest_search"
    GUEST_STATUS_FILTER = "guest_status_filter"
    HOST_SEARCH = "host_search"
    HOST_STATUS_FILTER = "host_status_filter"
    TICKET_SEARCH = "ticket_search"
    TICKET_STATUS_FILTER = "ticket_status_filter"
    TICKET_PRIORITY_FILTER = "ticket_priority_filter"
    DISPUTE_SEARCH = "dispute_search"
    DISPUTE_STATUS_FILTER = "dispute_status_filter"
    REVIEW_LISTING_FILTER = "review_listing_filter"
    VERIFY_STATUS_FILTER = "verify_status_filter"
    BOOKING_STATUS_FILTER = "booking_status_filter"
    ADMIN_SEARCH = "admin_search"
    REVENUE_PERIOD = "revenue_period"

AUTHENTICATED_PAGES = {
    "dashboard", "listings_moderation", "bookings_management",
    "payments_refunds", "reviews_management", "user_management",
    "host_management", "host_verification", "support_tickets",
    "disputes", "admin_management", "settings",
}

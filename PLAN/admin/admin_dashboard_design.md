# AirBnB Clone Admin Dashboard — Technical Design

## Architecture Decision

| Choice | Decision | Rationale |
|--------|----------|-----------|
| **Pattern** | Modular Monolith | Single repo, clear module boundaries, easy to split later |
| **Frontend** | Streamlit Multi-Page App | User specified Streamlit |
| **Database** | PostgreSQL + SQLAlchemy ORM | User specified PostgreSQL; SQLAlchemy for parameterized queries & migrations |
| **Auth** | Session-based via `streamlit-authenticator` | Native Streamlit integration, bcrypt hashing |
| **Migrations** | Alembic | SQLAlchemy-native schema versioning |
| **State** | `st.session_state` + cached DB queries | Streamlit-native, no extra libs |

---

## Project Structure

```
AirBnB-Clone/
├── app.py                          # Streamlit entry point
├── requirements.txt
├── .env.example
├── .gitignore
├── alembic.ini
├── alembic/
│   └── versions/                   # DB migrations
├── config/
│   ├── __init__.py
│   └── settings.py                 # Environment config loader
├── database/
│   ├── __init__.py
│   ├── connection.py               # Engine, session factory
│   └── models/
│       ├── __init__.py
│       ├── admin.py                # AdminAccounts, AdminProfiles
│       ├── booking.py              # Bookings
│       ├── payment.py              # Payments, Payouts
│       ├── review.py               # Reviews
│       ├── support.py              # AdminSupportTickets, Disputes
│       ├── verification.py         # AccountVerifications
│       ├── analytics.py            # AnalyticsSnapshots
│       └── system_settings.py      # SystemSettings
├── services/
│   ├── __init__.py
│   ├── auth.py                     # Authentication logic
│   ├── admin_service.py            # Admin CRUD operations
│   ├── booking_service.py          # Booking operations
│   ├── payment_service.py          # Payment operations
│   ├── review_service.py           # Review operations
│   ├── support_service.py          # Support ticket operations
│   ├── analytics_service.py        # Analytics queries
│   ├── settings_service.py         # System settings operations
│   └── external_api.py             # API client for Carl's host/listing data
├── pages/
│   ├── 1_🏠_Dashboard_Overview.py
│   ├── 2_👥_Host_Guest_Management_API.py
│   ├── 3_🏘️_Listings_Management_API.py
│   ├── 4_📅_Booking_Management.py
│   ├── 5_💰_Payments_Commissions.py
│   ├── 6_📊_Analytics_Reports.py
│   ├── 7_🎫_Support_Disputes.py
│   └── 8_⚙️_System_Settings.py
├── components/
│   ├── __init__.py
│   ├── sidebar.py                  # Navigation + admin info
│   ├── charts.py                   # Reusable Plotly chart components
│   ├── tables.py                   # Reusable data table components
│   ├── forms.py                    # Reusable form components
│   └── metrics.py                  # KPI card components
├── utils/
│   ├── __init__.py
│   ├── validators.py               # Input validation helpers
│   ├── formatters.py               # Currency, date formatting
│   └── export.py                   # CSV/PDF export utilities
├── specs/
│   └── admin_dashboard_design.md   # This file
└── tests/
    ├── __init__.py
    ├── conftest.py
    ├── test_services/
    └── test_pages/
```

---

## Database Schema (PostgreSQL)

### Core Tables

```sql
-- 1. ADMIN_ACCOUNTS (core auth/account data for admins only)
CREATE TABLE admin_accounts (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ADMIN_PROFILES (personal information for admins, linked to admin_accounts)
CREATE TABLE admin_profiles (
    id              SERIAL PRIMARY KEY,
    admin_id        INT UNIQUE REFERENCES admin_accounts(id) ON DELETE CASCADE,
    full_name       VARCHAR(100) NOT NULL,
    phone           VARCHAR(20),
    avatar_url      TEXT,
    clearance_level VARCHAR(50) DEFAULT 'standard',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BOOKINGS
-- guest_external_id: refers to user ID from Carl's guest service
-- Any guest details (name, email) fetched via Carl's API at runtime
CREATE TABLE bookings (
    id                  SERIAL PRIMARY KEY,
    listing_id          VARCHAR(255) NOT NULL,          -- Carl's listing ID
    guest_external_id   VARCHAR(255) NOT NULL,          -- Carl's guest ID
    check_in            DATE NOT NULL,
    check_out           DATE NOT NULL,
    guests_count        INT DEFAULT 1,
    total_price         DECIMAL(10,2),
    status              VARCHAR(20) DEFAULT 'pending'
                        CHECK (status IN ('pending','confirmed','cancelled','completed','disputed')),
    cancellation_reason TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PAYMENTS
-- Gateway: PayMongo (GCash, Maya, GrabPay, ShopeePay, Visa/Mastercard, BPI/UBP/BDO bank transfer, QR Ph)
-- Commission: platform fee deducted per transaction
-- Refund flow: admin-initiated, tracked via status (pending -> refunded)
CREATE TABLE payments (
    id                  SERIAL PRIMARY KEY,
    booking_id          INT REFERENCES bookings(id),
    payer_external_id   VARCHAR(255) NOT NULL,          -- Carl's guest ID
    payee_external_id   VARCHAR(255) NOT NULL,          -- Carl's host ID
    amount              DECIMAL(10,2) NOT NULL,
    commission          DECIMAL(10,2) DEFAULT 0,
    payment_method      VARCHAR(50),
    status              VARCHAR(20) DEFAULT 'pending'
                        CHECK (status IN ('pending','completed','refunded','disputed')),
    transaction_id      VARCHAR(100),
    paymongo_payment_id VARCHAR(255),                   -- PayMongo payment reference
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PAYOUTS
-- host_external_id: refers to user ID from Carl's host service
CREATE TABLE payouts (
    id                  SERIAL PRIMARY KEY,
    host_external_id    VARCHAR(255) NOT NULL,          -- Carl's host ID
    amount              DECIMAL(10,2) NOT NULL,
    status              VARCHAR(20) DEFAULT 'pending'
                        CHECK (status IN ('pending','processing','completed','failed')),
    method              VARCHAR(50),
    processed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 6. REVIEWS
-- Reviews only allowed after booking status = 'completed'
-- One review per booking (enforced by UNIQUE on booking_id)
-- reviewer_external_id: refers to user ID from Carl's guest service
CREATE TABLE reviews (
    id                      SERIAL PRIMARY KEY,
    booking_id              INT UNIQUE REFERENCES bookings(id),
    listing_id              VARCHAR(255) NOT NULL,      -- Carl's listing ID
    reviewer_external_id    VARCHAR(255) NOT NULL,      -- Carl's guest ID
    rating                  INT CHECK (rating BETWEEN 1 AND 5),
    comment                 TEXT,
    response                TEXT,                       -- host response
    is_visible              BOOLEAN DEFAULT TRUE,
    created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ADMIN_SUPPORT_TICKETS
-- Admin ticket system: platform admins handle disputes and platform issues
-- Categories: booking, payment, listing, account, other
CREATE TABLE admin_support_tickets (
    id                      SERIAL PRIMARY KEY,
    submitted_by_external_id VARCHAR(255),              -- Carl's user ID (guest/host)
    booking_id              INT REFERENCES bookings(id),
    subject                 VARCHAR(200) NOT NULL,
    description             TEXT,
    category                VARCHAR(50),                -- 'booking','payment','listing','account','other'
    priority                VARCHAR(20) DEFAULT 'medium'
                            CHECK (priority IN ('low','medium','high','urgent')),
    status                  VARCHAR(20) DEFAULT 'open'
                            CHECK (status IN ('open','in_progress','resolved','closed')),
    assigned_to_admin_id    INT REFERENCES admin_accounts(id),
    resolution              TEXT,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- 8. DISPUTES
-- filed_by_external_id: refers to user ID from Carl's service (guest or host)
CREATE TABLE disputes (
    id                      SERIAL PRIMARY KEY,
    ticket_id               INT REFERENCES admin_support_tickets(id),
    booking_id              INT REFERENCES bookings(id),
    filed_by_external_id    VARCHAR(255),               -- Carl's user ID
    reason                  VARCHAR(50),                -- 'cancellation','damage','no_show','other'
    description             TEXT,
    evidence_urls           TEXT[],                     -- array of URLs
    resolution              TEXT,
    resolved_by_admin_id    INT REFERENCES admin_accounts(id),
    status                  VARCHAR(20) DEFAULT 'open'
                            CHECK (status IN ('open','under_review','resolved','closed')),
    refund_amount           DECIMAL(10,2) DEFAULT 0,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    resolved_at             TIMESTAMPTZ
);

-- 9. ACCOUNT_VERIFICATIONS
-- Identity verification for admin accounts (KYC)
-- Admin review flow: pending -> approved/rejected
CREATE TABLE account_verifications (
    id                  SERIAL PRIMARY KEY,
    admin_id            INT REFERENCES admin_accounts(id),
    doc_type            VARCHAR(50),                    -- 'passport','drivers_license','national_id'
    doc_url             TEXT,
    status              VARCHAR(20) DEFAULT 'pending'
                        CHECK (status IN ('pending','approved','rejected')),
    reviewed_by_admin_id INT REFERENCES admin_accounts(id),
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at         TIMESTAMPTZ
);

-- 10. SYSTEM_SETTINGS
-- Stores platform configuration including external API endpoints
CREATE TABLE system_settings (
    id              SERIAL PRIMARY KEY,
    key             VARCHAR(100) UNIQUE NOT NULL,
    value           TEXT,
    description     TEXT,
    updated_by_admin_id INT REFERENCES admin_accounts(id),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ANALYTICS_SNAPSHOTS (daily aggregated data)
CREATE TABLE analytics_snapshots (
    id                  SERIAL PRIMARY KEY,
    date                DATE NOT NULL,
    total_gbv           DECIMAL(12,2),
    total_bookings      INT,
    active_listings     INT,                        -- from Carl's API
    new_users           INT,                        -- from Carl's API
    new_hosts           INT,                        -- from Carl's API
    cancellation_rate   DECIMAL(5,2),
    avg_rating          DECIMAL(3,2),
    platform_revenue    DECIMAL(12,2),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 12. AUDIT_LOG (security tracking)
CREATE TABLE audit_log (
    id              SERIAL PRIMARY KEY,
    admin_id        INT REFERENCES admin_accounts(id),
    action          VARCHAR(100) NOT NULL,
    target_type     VARCHAR(50),                    -- 'admin','booking','payment','setting'
    target_id       INT,
    details         JSONB,
    ip_address      INET,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 13. OTP_VERIFICATIONS (admin-only: login, password reset, admin invite)
CREATE TABLE otp_verifications (
    id          SERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL,              -- admin email
    otp_code    VARCHAR(6) NOT NULL,
    purpose     VARCHAR(50) CHECK (purpose IN ('login','password_reset','admin_invite')),
    expires_at  TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

### External ID References

All guest, host, and listing IDs in the admin database reference Carl's external services. The admin dashboard does NOT store guest, host, or listing data locally.

| Field | References | Source |
|-------|------------|--------|
| `guest_external_id` | Guest user ID | Carl's guest service |
| `host_external_id` | Host user ID | Carl's host service |
| `listing_id` | Listing ID | Carl's listing service |
| `reviewer_external_id` | Guest user ID | Carl's guest service |
| `filed_by_external_id` | User ID (guest/host) | Carl's service |
| `payer_external_id` | Guest user ID | Carl's guest service |
| `payee_external_id` | Host user ID | Carl's host service |

Any guest/host/listing details (name, email, profile, etc.) needed for display will be fetched via Carl's API at runtime.

---

## Carl's API Endpoints (External Service)

The admin dashboard calls Carl's API for host, listing, and guest data. API configuration is stored in `system_settings` table (`carl_api_base_url`, `carl_api_key`).

### Host Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/hosts?email={email}` | GET | Get host details |
| `/api/admin/hosts/{external_id}` | GET | Get single host by ID |
| `/api/admin/hosts/{external_id}/listings` | GET | Get host's listings |

### Listing Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/listings?status={status}` | GET | Get paginated listings |
| `/api/admin/listings/{id}` | GET | Get single listing details |
| `/api/admin/listings/{id}/approve` | POST | Approve listing |
| `/api/admin/listings/{id}/reject` | POST | Reject listing (with reason in body) |
| `/api/admin/listings/{id}/suspend` | POST | Suspend listing |

### Guest Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/guests?email={email}` | GET | Get guest profile |
| `/api/admin/guests/{external_id}` | GET | Get single guest by ID |

**Wrapper functions** in `services/external_api.py` will call these endpoints. If Carl changes the actual routes, we only update the wrapper — the rest of the admin dashboard stays the same.

---

## Streamlit Pages — Feature Breakdown

### Page 1: Dashboard Overview

| Component | Details |
|-----------|---------|
| KPI Cards | Total GBV, active listings (via API), total users (via API), bookings today, platform revenue |
| Charts | Revenue trend (30-day line chart), booking volume (bar chart), user growth (area chart) |
| Alerts | Pending listings (via API), open disputes, low-stock dates |
| Table | Recent activity feed (last 20 events) |

### Page 2: Host & Guest Management (via API)

| Component | Details |
|-----------|---------|
| Tabs | Hosts \| Guests |
| Data Source | Live API calls to Carl's service |
| Filters | Status, verification status, date range, search |
| Table | Paginated host/guest list with inline status badges |
| Actions | View profile modal, suspend/reactivate (calls Carl's API) |
| Verification | Review pending verifications (admin only) |
| Host Badges | View/assign superhost status (calls Carl's API) |

### Page 3: Listings Management (via API)

| Component | Details |
|-----------|---------|
| Data Source | Live API calls to Carl's service |
| Filters | Status (pending/approved/rejected), property type, city, price range |
| Table | Paginated listings with thumbnail, title, host, status, price |
| Detail View | Photo gallery, description, amenities, pricing breakdown |
| Actions | Approve, reject (with reason), suspend — all via Carl's API |
| Moderation | Review flagged photos, detect policy violations |

### Page 4: Booking Management

| Component | Details |
|-----------|---------|
| Calendar View | Visual calendar showing booking density by listing |
| Filters | Status, date range, listing, guest, price range |
| Table | All bookings with guest (via API), listing (via API), dates, status, total |
| Actions | View details, cancel (with reason), process refund, override disputes |
| Bulk Ops | Export booking data, bulk status updates |

### Page 5: Payments & Commissions

| Component | Details |
|-----------|---------|
| KPIs | Total revenue, commissions earned, pending payouts, refund total |
| Revenue Table | Booking-level payment breakdown (guest pays, host receives, platform fee) |
| Payouts | Host payout queue, process/reject payouts |
| Disputes | Payment disputes, security deposits, insurance claims |
| Export | Financial reports (CSV/PDF) |

### Page 6: Analytics & Reports

| Component | Details |
|-----------|---------|
| KPIs | GBV, occupancy rate, avg daily rate, guest satisfaction |
| Charts | Seasonal demand heatmap, booking trends, top cities, listing performance |
| Filters | Date range, metric selection, comparison periods |
| Reports | Generate downloadable reports, schedule automated reports |
| Insights | AI-generated insights summary (optional) |

### Page 7: Support & Disputes

| Component | Details |
|-----------|---------|
| Tabs | Tickets \| Disputes |
| Filters | Status, priority, category, date range |
| Table | Ticket/dispute list with priority badges, assigned agent |
| Actions | Assign agent, change priority, resolve, escalate |
| Detail View | Full conversation thread, evidence upload, resolution form |
| Metrics | Avg resolution time, tickets by category, agent performance |

### Page 8: System Settings

| Component | Details |
|-----------|---------|
| Sections | Commissions \| Fees \| Pricing \| Platform \| Tax \| External API |
| Forms | Edit commission %, service fees, cleaning fee limits |
| Pricing | Dynamic pricing rules, seasonal multipliers |
| Platform | Platform name, support email, terms URL, maintenance mode |
| External API | Configure Carl's API base URL, API key, test connection |
| Audit Log | Settings change history with admin who made the change |

---

## Security Checklist (per fullstack-guardian)

| Category | Implementation |
|----------|----------------|
| **Auth** | `streamlit-authenticator` with bcrypt; session timeout 30 min |
| **Authz** | Admin role check: admin_id must exist in `admin_accounts` table; no role column needed |
| **Input Validation** | Pydantic models for all form submissions; server-side validation |
| **SQL Injection** | SQLAlchemy ORM with parameterized queries only; no raw SQL |
| **XSS** | Streamlit auto-escapes; sanitize any `st.markdown(unsafe_allow_html=True)` |
| **Rate Limiting** | Login attempts limited to 5/15min via DB tracking |
| **Audit Logging** | `audit_log` table recording all admin actions (who, what, when) |
| **Secrets** | `.env` file for DB credentials, not committed to git |
| **CSRF** | Streamlit handles via session tokens |
| **External API Keys** | Stored in `system_settings` table, not in code |

### Per-Module Authentication

| Module | Sign Up | Sign In |
|--------|---------|---------|
| **Admin** | Created manually by existing admin (insert into `admin_accounts` + `admin_profiles`) | Admin login page → checks `admin_accounts` table |
| **Host** | Managed by Carl's API (external) | Admin views host data via API call |
| **Guest** | Managed by Carl's API (external) | Admin views guest data via API call |

---

## Implementation Phases

| Phase | Scope | Est. Files |
|-------|-------|------------|
| **Phase 1** | Project scaffold, DB connection, models, Alembic migrations | ~15 |
| **Phase 2** | Auth system, sidebar, page skeleton with routing | ~5 |
| **Phase 3** | Dashboard Overview (KPIs, charts) | ~4 |
| **Phase 4** | Host & Guest Management (via API) | ~4 |
| **Phase 5** | Listings Management (via API) | ~4 |
| **Phase 6** | Booking Management (calendar, cancellations) | ~4 |
| **Phase 7** | Payments & Commissions (payouts, disputes) | ~4 |
| **Phase 8** | Analytics & Reports (charts, export) | ~4 |
| **Phase 9** | Support & Disputes (ticketing system) | ~4 |
| **Phase 10** | System Settings (configuration panel + External API config) | ~3 |

---

## Key Dependencies (`requirements.txt`)

```
streamlit>=1.32.0
streamlit-authenticator>=0.3.0
sqlalchemy>=2.0
psycopg2-binary>=2.9
alembic>=1.13
pandas>=2.2
plotly>=5.18
python-dotenv>=1.0
pydantic>=2.5
bcrypt>=4.1
requests>=2.31
```

---

## Three-Perspective Design (Fullstack Guardian)

### [Frontend]
- Streamlit multi-page app with `st.navigation()` or sidebar routing
- Reusable components: KPI cards, data tables, charts, form modals
- Loading states with `st.spinner()` for all DB queries and API calls
- Error display with `st.error()` and `st.toast()` for confirmations
- Pagination via `st.session_state` page tracking
- Responsive layout using `st.columns()` and `st.expander()`
- API calls wrapped in try/except with user-friendly error messages

### [Backend]
- SQLAlchemy ORM models mapped to PostgreSQL tables
- Service layer pattern: each domain has a service module with pure functions
- DB session management via `database/connection.py` context manager
- Alembic for schema migrations (version-controlled)
- Parameterized queries only — no raw SQL string interpolation
- Pydantic models for form validation on every write operation
- External API client (`external_api.py`) with retry logic and caching

### [Security]
- Admin authentication: bcrypt-hashed passwords, session-based login
- Role-based access: every page checks if admin_id exists in `admin_accounts` table (implicit role, no role column)
- Audit trail: all admin mutations logged to `audit_log` table
- Secrets in `.env` (never committed); loaded via `python-dotenv`
- External API keys stored in `system_settings` table, not in code
- Input sanitization: Pydantic validation + Streamlit auto-escaping
- SQL injection prevention: SQLAlchemy ORM exclusively
- API authentication: Bearer token or API key for Carl's service (configurable)

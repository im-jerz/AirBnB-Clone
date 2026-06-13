# AirBnB Clone Admin Dashboard — Technical Design

## 1. Overview

| Choice | Decision | Rationale |
|--------|----------|-----------|
| **Pattern** | Modular Monolith | Single repo, clear module boundaries, easy to split later |
| **Frontend** | Streamlit Multi-Page App | User specified Streamlit |
| **Database** | PostgreSQL + SQLAlchemy ORM | User specified PostgreSQL; SQLAlchemy for parameterized queries & migrations |
| **Auth** | Session-based via `streamlit-authenticator` | Native Streamlit integration, bcrypt hashing |
| **Migrations** | Alembic | SQLAlchemy-native schema versioning |
| **State** | `st.session_state` + cached DB queries | Streamlit-native, no extra libs |

### Data Ownership

| Data | Owner | Admin Access |
|------|-------|--------------|
| Users, Hosts, Guests | Carl (Oracle) | Fetch via API |
| Properties/Listings | Carl (Oracle) | Fetch via API |
| Bookings | Carl (Oracle) | Fetch via API |
| Payments | Carl (Oracle) | Fetch via API |
| Reviews | Carl (Oracle) | Fetch via API |
| Payouts/Wallets | Carl (Oracle) | Fetch via API |
| Support Tickets | **Us (PostgreSQL)** | Direct DB access |
| Disputes | **Us (PostgreSQL)** | Direct DB access |
| System Settings | **Us (PostgreSQL)** | Direct DB access |
| Audit Log | **Us (PostgreSQL)** | Direct DB access |
| Admin Accounts | **Us (PostgreSQL)** | Direct DB access |

---

## 2. Admin Database Schema (8 tables)

### 2.1 Admin Auth & Profile (2 tables)

```sql
-- 1. ADMIN_ACCOUNTS (core auth data)
CREATE TABLE admin_accounts (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ADMIN_PROFILES (personal info, linked to admin_accounts)
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
```

### 2.2 Support & Disputes (2 tables)

```sql
-- 3. ADMIN_SUPPORT_TICKETS
-- Created by client via POST /api/support/tickets or by admin manually
CREATE TABLE admin_support_tickets (
    id                       SERIAL PRIMARY KEY,
    submitted_by_external_id VARCHAR(255),              -- Carl's user ID (guest or host)
    booking_id               VARCHAR(255),              -- Carl's booking ID (external)
    subject                  VARCHAR(200) NOT NULL,
    description              TEXT,
    category                 VARCHAR(50),               -- 'booking','payment','listing','account','other'
    priority                 VARCHAR(20) DEFAULT 'medium'
                             CHECK (priority IN ('low','medium','high','urgent')),
    status                   VARCHAR(20) DEFAULT 'open'
                             CHECK (status IN ('open','in_progress','resolved','closed')),
    assigned_to_admin_id     INT REFERENCES admin_accounts(id),
    resolution               TEXT,
    created_at               TIMESTAMPTZ DEFAULT NOW(),
    updated_at               TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DISPUTES
-- Created when client files dispute via POST /api/disputes or auto-created from cancelled bookings
CREATE TABLE disputes (
    id                   SERIAL PRIMARY KEY,
    ticket_id            INT REFERENCES admin_support_tickets(id),
    booking_id           VARCHAR(255),                  -- Carl's booking ID (external)
    filed_by_external_id VARCHAR(255),                  -- Carl's user ID
    reason               VARCHAR(50),                   -- 'cancellation','damage','no_show','other'
    description          TEXT,
    evidence_urls        TEXT[],
    resolution           TEXT,
    resolved_by_admin_id INT REFERENCES admin_accounts(id),
    status               VARCHAR(20) DEFAULT 'open'
                         CHECK (status IN ('open','under_review','resolved','closed')),
    refund_amount        DECIMAL(10,2) DEFAULT 0,
    created_at           TIMESTAMPTZ DEFAULT NOW(),
    resolved_at          TIMESTAMPTZ
);
```

### 2.3 System & Security (4 tables)

```sql
-- 5. SYSTEM_SETTINGS (platform config + external API keys)
-- Includes: carl_api_base_url, carl_api_key, platform_name, support_email, etc.
CREATE TABLE system_settings (
    id                   SERIAL PRIMARY KEY,
    key                  VARCHAR(100) UNIQUE NOT NULL,
    value                TEXT,
    description          TEXT,
    updated_by_admin_id  INT REFERENCES admin_accounts(id),
    updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AUDIT_LOG (admin action tracking)
CREATE TABLE audit_log (
    id          SERIAL PRIMARY KEY,
    admin_id    INT REFERENCES admin_accounts(id),
    action      VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),                           -- 'admin','setting','support_ticket','dispute'
    target_id   INT,
    details     JSONB,
    ip_address  INET,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 7. OTP_VERIFICATIONS (admin-only: login, password reset, admin invite)
CREATE TABLE otp_verifications (
    id          SERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL,
    otp_code    VARCHAR(6) NOT NULL,
    purpose     VARCHAR(50) CHECK (purpose IN ('login','password_reset','admin_invite')),
    expires_at  TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ACCOUNT_VERIFICATIONS (admin identity verification - KYC)
CREATE TABLE account_verifications (
    id                   SERIAL PRIMARY KEY,
    admin_id             INT REFERENCES admin_accounts(id),
    doc_type             VARCHAR(50),                   -- 'passport','drivers_license','national_id'
    doc_url              TEXT,
    status               VARCHAR(20) DEFAULT 'pending'
                         CHECK (status IN ('pending','approved','rejected')),
    reviewed_by_admin_id INT REFERENCES admin_accounts(id),
    notes                TEXT,
    created_at           TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at          TIMESTAMPTZ
);
```

---

## 3. Carl's API Contract

API config stored in `system_settings` (`carl_api_base_url`, `carl_api_key`).

### 3.1 Host Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/hosts` | GET | Get all hosts (paginated) |
| `/api/admin/hosts?email={email}` | GET | Get host by email |
| `/api/admin/hosts/{external_id}` | GET | Get single host |
| `/api/admin/hosts/{external_id}/listings` | GET | Get host's listings |
| `/api/admin/hosts/{external_id}/wallet` | GET | Get host wallet balance |
| `/api/admin/hosts/{external_id}/withdrawals` | GET | Get host withdrawal history |

### 3.2 Listing Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/listings` | GET | Get all listings (paginated) |
| `/api/admin/listings?status={status}` | GET | Get listings by status |
| `/api/admin/listings/{id}` | GET | Get listing details |
| `/api/admin/listings/{id}/approve` | POST | Approve listing |
| `/api/admin/listings/{id}/reject` | POST | Reject listing (with reason) |
| `/api/admin/listings/{id}/suspend` | POST | Suspend listing |

### 3.3 Guest Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/guests` | GET | Get all guests (paginated) |
| `/api/admin/guests?email={email}` | GET | Get guest by email |
| `/api/admin/guests/{external_id}` | GET | Get single guest |
| `/api/admin/guests/{external_id}/bookings` | GET | Get guest's bookings |

### 3.4 Booking Endpoints (Read-only for admin)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/bookings` | GET | Get all bookings (paginated) |
| `/api/admin/bookings?status={status}` | GET | Get bookings by status |
| `/api/admin/bookings/{id}` | GET | Get booking details |
| `/api/admin/bookings/{id}/timeline` | GET | Get booking status timeline |

### 3.5 Payment Endpoints (Read-only for admin)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/payments` | GET | Get all payments (paginated) |
| `/api/admin/payments?booking_id={id}` | GET | Get payment by booking |
| `/api/admin/payments/{id}` | GET | Get payment details |

### 3.6 Review Endpoints (Read + Moderate)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/reviews` | GET | Get all reviews (paginated) |
| `/api/admin/reviews?listing_id={id}` | GET | Get reviews by listing |
| `/api/admin/reviews/{id}` | GET | Get review details |
| `/api/admin/reviews/{id}/hide` | POST | Hide review (set is_visible=false) |
| `/api/admin/reviews/{id}/show` | POST | Show review (set is_visible=true) |

### 3.7 Payout Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/withdrawals` | GET | Get all withdrawal requests |
| `/api/admin/withdrawals?status={status}` | GET | Get withdrawals by status |
| `/api/admin/withdrawals/{id}/approve` | POST | Approve withdrawal |
| `/api/admin/withdrawals/{id}/reject` | POST | Reject withdrawal (with reason) |

### 3.8 Message Endpoints (For dispute investigation)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/messages?booking_id={id}` | GET | Get messages for a booking |
| `/api/admin/messages?host_id={id}` | GET | Get host's messages |
| `/api/admin/messages?guest_id={id}` | GET | Get guest's messages |

### 3.9 Stats Endpoint

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/stats` | GET | Dashboard KPIs (total bookings, revenue, active listings, etc.) |
| `/api/admin/stats/revenue?period={period}` | GET | Revenue by period (daily/weekly/monthly) |
| `/api/admin/stats/bookings?period={period}` | GET | Booking stats by period |

**Wrapper functions** in `services/external_api.py` call these endpoints.

---

## 4. Pages Overview

| Page | Purpose | Data Source | Actions |
|------|---------|-------------|---------|
| 1. Dashboard Overview | KPIs, charts, alerts | Carl's API (`/stats`) | View only |
| 2. Host & Guest Management | View hosts and guests | Carl's API | View, suspend (via API) |
| 3. Listings Management | Moderate listings | Carl's API | Approve, reject, suspend |
| 4. Booking Management | View bookings, handle disputes | Carl's API + Local DB | View, file disputes |
| 5. Payments & Commissions | Revenue, payouts | Carl's API | View, approve/reject withdrawals |
| 6. Analytics & Reports | Charts, trends | Carl's API + Local DB | Export |
| 7. Support & Disputes | Tickets, disputes | Local DB | Create, assign, resolve |
| 8. System Settings | Config, API setup | Local DB | Edit |

---

## 5. Data Flow Diagrams

### 5.1 Booking Flow
```
Client → Carl's API (POST /api/bookings) → Carl's Oracle DB
    ↓
Admin ← Carl's API (GET /api/admin/bookings) ← Carl's Oracle DB
    ↓
Admin views bookings in dashboard (read-only)
```

### 5.2 Payment Flow
```
Client → PayMongo → Carl's webhook → Carl's Oracle DB
    ↓
Admin ← Carl's API (GET /api/admin/payments) ← Carl's Oracle DB
    ↓
Admin views payments, tracks commissions (read-only)
```

### 5.3 Support Ticket Flow
```
Client → Our API (POST /api/support/tickets) → Our PostgreSQL
    ↓
Admin ← Direct DB query → admin_support_tickets table
    ↓
Admin assigns, resolves tickets (full CRUD)
```

### 5.4 Dispute Flow
```
Client → Our API (POST /api/disputes) → Our PostgreSQL
    ↓ (or auto-created from cancelled booking)
Admin views disputes, investigates via Carl's messages API
    ↓
Admin resolves dispute → updates status + resolution
```

### 5.5 Payout Flow
```
Host → Carl's API (POST /api/withdrawals) → Carl's Oracle DB
    ↓
Admin ← Carl's API (GET /api/admin/withdrawals) ← Carl's Oracle DB
    ↓
Admin approves/rejects → Carl's API (POST /api/admin/withdrawals/{id}/approve)
```

---

## 6. Security & Auth

| Category | Implementation |
|----------|----------------|
| **Auth** | `streamlit-authenticator` with bcrypt; session timeout 30 min |
| **Authz** | Admin if `admin_id` exists in `admin_accounts` — no role column |
| **Input Validation** | Pydantic models for all form submissions |
| **SQL Injection** | SQLAlchemy ORM with parameterized queries only |
| **XSS** | Streamlit auto-escaping; sanitize `unsafe_allow_html=True` |
| **Rate Limiting** | Login attempts limited to 5/15min via DB |
| **Audit Logging** | `audit_log` records all admin actions |
| **Secrets** | `.env` for DB credentials, never committed |
| **External API Keys** | Stored in `system_settings`, not in code |

### Per-Module Authentication

| Module | Sign Up | Sign In |
|--------|---------|---------|
| **Admin** | Created manually by existing admin | Admin login → `admin_accounts` table |
| **Host** | Carl's API (external) | Admin views via API call |
| **Guest** | Carl's API (external) | Admin views via API call |

---

## 7. Implementation Plan

| Phase | Scope |
|-------|-------|
| 1 | Project scaffold, DB connection, 8 models, Alembic migrations |
| 2 | Auth system, sidebar, page routing |
| 3 | External API client (`external_api.py`) — all Carl endpoints |
| 4 | Dashboard Overview (KPIs via `/api/admin/stats`) |
| 5 | Host & Guest Management (via API) |
| 6 | Listings Management (via API — approve/reject/suspend) |
| 7 | Booking Management (via API + local disputes) |
| 8 | Payments & Commissions (via API + withdrawal approval) |
| 9 | Support & Disputes (local CRUD) |
| 10 | System Settings + External API config |

### Key Dependencies

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

## 8. Booking Status Reference (Carl's System)

Admin needs to understand these statuses when viewing bookings via API:

| Status | Description | Who Sets It |
|--------|-------------|-------------|
| `pending` | Awaiting host confirmation | System (on booking creation) |
| `confirmed` | Host accepted / instant book | Host or System |
| `in_progress` | Guest is currently staying | System (auto, based on dates) |
| `completed` | Check-out date passed | System (auto) |
| `reviewed` | Guest left a review | System (after review submitted) |
| `cancelled` | Cancelled by guest or host | Guest or Host |
| `declined` | Host rejected booking | Host |
| `disputed` | Dispute filed | Admin or Guest |

---

## 9. Support Ticket Categories

| Category | Description |
|----------|-------------|
| `booking` | Issues related to bookings (cancellation, dates, etc.) |
| `payment` | Payment issues (failed payment, refund, etc.) |
| `listing` | Listing issues (inaccurate info, photos, etc.) |
| `account` | Account issues (login, verification, etc.) |
| `other` | General support |

---

## 10. Dispute Reasons

| Reason | Description |
|--------|-------------|
| `cancellation` | Dispute over cancellation/refund |
| `damage` | Property damage claim |
| `no_show` | Guest or host didn't show up |
| `other` | Other reasons |

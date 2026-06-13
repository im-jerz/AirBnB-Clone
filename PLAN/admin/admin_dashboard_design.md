# AirBnB Clone Admin Dashboard — Technical Design

## 1. Overview

**Architecture decisions** (no tables, just bullets):

- **Pattern:** Modular Monolith – Single repo, clear module boundaries, easy to split later
- **Frontend:** Streamlit Multi-Page App – As specified
- **Database:** PostgreSQL + SQLAlchemy ORM – Parameterized queries, migrations via Alembic
- **Auth:** Session-based via `streamlit-authenticator` – Bcrypt hashing, 30‑min timeout
- **State:** `st.session_state` + cached DB queries – Streamlit-native

**Data ownership principle:**

- Admin dashboard owns its own tables (admin accounts, bookings, payments, reviews, support tickets, etc.)
- Hosts, listings, guests are owned by Carl's module – accessed read‑only via API
- No `role` column – each module has its own auth

---

## 2. Admin Database Schema

All tables are created in a **single PostgreSQL database** used only by the admin dashboard.

### 2.1 Admin Auth & Profile

```sql
CREATE TABLE admin_accounts (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE admin_profiles (
    id SERIAL PRIMARY KEY,
    admin_id INT UNIQUE REFERENCES admin_accounts(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    permissions TEXT[] DEFAULT '{view_dashboard}'
);

CREATE TABLE otp_verifications (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    purpose VARCHAR(50) CHECK (purpose IN ('login','password_reset','admin_invite')),
    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.2 Bookings & Transactions

- `guest_external_id` refers to Carl's guest ID – we fetch guest details via API when needed.

```sql
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    listing_id INT,                     -- Carl's listing ID
    guest_external_id VARCHAR(255) NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests_count INT DEFAULT 1,
    total_price DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending','confirmed','cancelled','completed','disputed')),
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(id),
    paymongo_payment_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    commission DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending','paid','failed','refunded')),
    payment_method VARCHAR(50),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    booking_id INT UNIQUE REFERENCES bookings(id),
    listing_id INT,
    reviewer_external_id VARCHAR(255) NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    host_response TEXT,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.3 Support & Disputes

```sql
CREATE TABLE admin_support_tickets (
    id SERIAL PRIMARY KEY,
    admin_id INT REFERENCES admin_accounts(id),
    guest_email VARCHAR(255),
    host_email VARCHAR(255),
    booking_id INT,
    category VARCHAR(50) CHECK (category IN ('dispute','platform_issue','account_suspension')),
    description TEXT,
    evidence_urls TEXT[],
    status VARCHAR(20) DEFAULT 'open'
        CHECK (status IN ('open','in_review','resolved','closed')),
    resolved_by INT REFERENCES admin_accounts(id),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE account_verifications (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    verification_type VARCHAR(50) CHECK (verification_type IN ('id_card','passport','selfie','phone')),
    document_urls TEXT[],
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending','approved','rejected')),
    reviewed_by INT REFERENCES admin_accounts(id),
    review_notes TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);
```

### 2.4 System & Security

```sql
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_by INT REFERENCES admin_accounts(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE analytics_snapshots (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    total_gbv DECIMAL(12,2),
    total_bookings INT,
    active_listings INT,
    new_users INT,
    new_hosts INT,
    cancellation_rate DECIMAL(5,2),
    avg_rating DECIMAL(3,2),
    platform_revenue DECIMAL(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    admin_id INT REFERENCES admin_accounts(id),
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id INT,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. Carl's API Contract

Admin dashboard will call these endpoints (to be implemented by Carl).
Base URL stored in `system_settings` keys: `carl_api_base_url`, `carl_api_key`.

**Listing endpoints**

- `GET /api/admin/listings?status=pending` – fetch pending listings (with host email, photos)
- `POST /api/admin/listings/{id}/approve` – approve listing
- `POST /api/admin/listings/{id}/reject` – reject with reason
- `POST /api/admin/listings/{id}/suspend` – suspend listing

**Host endpoints**

- `GET /api/admin/hosts/{external_id}` – get host details (badge, verification, total listings)

**Guest endpoints**

- `GET /api/admin/guests/{external_id}` – get guest details (for support tickets)

**Authentication** – API key (sent as `X-API-Key` header) or JWT (to be decided with Carl).

---

## 4. Pages Overview

1. **Dashboard** – KPIs, revenue chart, alerts. Data from admin DB + Carl's API (active listings).
2. **Admin Management** – Manage admin accounts (CRUD, OTP invites). Data from admin DB.
3. **Listings Moderation** – Approve/reject/suspend listings. Data from Carl's API.
4. **Bookings** – View, cancel, export bookings. Data from admin DB.
5. **Payments** – Process refunds, view revenue. Data from admin DB + PayMongo webhook.
6. **Reviews** – Moderate reviews. Data from admin DB.
7. **Support & Disputes** – Ticket system, KYC verification. Data from admin DB.
8. **Settings** – Commission %, API URLs, etc. Data from admin DB.

---

## 5. Data Flow (High Level)

```
[Client] → Carl's Flask API → Carl's Oracle DB (hosts, listings, original bookings)
                ↓
         Admin Dashboard (Streamlit)
                ↓
         Our PostgreSQL DB (admin_accounts, bookings_copy, payments, reviews, etc.)
                ↓
         Carl's API (for listing moderation, host/guest details)
```

**Sync mechanism** – Admin dashboard will poll Carl's API for listing status and host/guest data. No real-time webhook initially (can be added later).

---

## 6. Security & Auth

- **Admin login** – uses `admin_accounts` table; no `role` column.
- **Session** – `streamlit-authenticator` with bcrypt; timeout 30 min.
- **Audit** – every admin write action logged to `audit_log`.
- **Rate limiting** – 5 failed login attempts per 15 min (DB tracked).
- **API calls to Carl** – use API key stored in `system_settings`.

**Per-module authentication** (no shared `role` column):

- **Admin** – manually created by existing admin → `admin_accounts` table
- **Host** – Carl's client app → his `hosts` table (Carl's DB)
- **Guest** – Carl's client app → his `guests` table (Carl's DB)

---

## 7. Implementation Plan (10 phases)

1. Project scaffold, DB connection, Alembic – ~8 files
2. Auth system (admin login, session) – ~4 files
3. Dashboard Overview (KPIs, charts) – ~3 files
4. Admin Management (CRUD, OTP invites) – ~4 files
5. Listings Moderation (API client + Carl's endpoints) – ~4 files
6. Bookings Management (calendar, cancellations) – ~3 files
7. Payments & Refunds (PayMongo integration) – ~4 files
8. Reviews Management – ~2 files
9. Support & Disputes (tickets, KYC) – ~4 files
10. System Settings & Audit Log – ~3 files

---

**End of document**

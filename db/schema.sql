-- RoadGuard AI — Admin Website schema additions
-- Assumes PostGIS is already enabled on this database (shared with the
-- core Work Order API / Spatial-Temporal Conflict Engine).

CREATE EXTENSION IF NOT EXISTS postgis;

-- ─────────────────────────────────────────────────────────────
-- USERS (super_admin / super_dept / dept_admin)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL CHECK (role IN ('super_admin', 'super_dept', 'dept_admin')),
    department    TEXT CHECK (department IN ('roads', 'water', 'telecom', 'gas') OR department IS NULL),
    created_by    INTEGER REFERENCES users(id),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- exactly one super_dept account per department
CREATE UNIQUE INDEX IF NOT EXISTS one_super_dept_per_department
    ON users (department)
    WHERE role = 'super_dept';

-- role/department consistency: super_admin has no department, super_dept and dept_admin must have one
ALTER TABLE users
    ADD CONSTRAINT role_department_consistency CHECK (
        (role = 'super_admin' AND department IS NULL) OR
        (role IN ('super_dept', 'dept_admin') AND department IS NOT NULL)
    );

-- ─────────────────────────────────────────────────────────────
-- NOTICES (published by super_dept, visible to super_admin + that dept's admins)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notices (
    id             SERIAL PRIMARY KEY,
    department     TEXT NOT NULL CHECK (department IN ('roads', 'water', 'telecom', 'gas')),
    published_by   INTEGER NOT NULL REFERENCES users(id),
    title          TEXT NOT NULL,
    content        TEXT NOT NULL,
    work_order_id  INTEGER, -- FK to work_orders(id) in the core system; not enforced here if that table lives elsewhere
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- WORK_ORDERS — add status for the map dashboard (table assumed to already
-- exist from the core Work Order API; this is additive)
-- ─────────────────────────────────────────────────────────────
--ALTER TABLE work_orders
    --ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'yet_to_start'
        --CHECK (status IN ('yet_to_start', 'working', 'completed'));

-- ─────────────────────────────────────────────────────────────
-- COMPLAINTS — citizen-reported issues (mobile app) + AI analyzer +
-- dept-admin triage fields
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS complaints (
    id                     SERIAL PRIMARY KEY,
    citizen_name           TEXT,
    citizen_contact        TEXT,
    department             TEXT NOT NULL CHECK (department IN ('roads', 'water', 'telecom', 'gas')),
    photo_url              TEXT NOT NULL,
    description            TEXT,
    location               GEOMETRY(Point, 4326) NOT NULL,
    linked_work_order_id   INTEGER,
    status                 TEXT NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending', 'accepted', 'denied', 'in_progress', 'resolved')),
    assigned_to            INTEGER REFERENCES users(id),

    -- AI analyzer verdict
    ai_is_genuine          BOOLEAN,
    ai_issue_type          TEXT,
    ai_suggested_dept      TEXT,
    ai_confidence          REAL,

    submitted_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS complaints_department_idx ON complaints (department);
CREATE INDEX IF NOT EXISTS complaints_status_idx ON complaints (status);
CREATE INDEX IF NOT EXISTS complaints_location_gix ON complaints USING GIST (location);

-- keep updated_at fresh
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS complaints_set_updated_at ON complaints;
CREATE TRIGGER complaints_set_updated_at
    BEFORE UPDATE ON complaints
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

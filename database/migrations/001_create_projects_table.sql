-- Migration: create_projects_table
-- Created at: 2026-02-10T21:23:56.546Z

-- Write your SQL below
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
    CREATE TYPE project_status_enum AS ENUM ('active', 'on_hold', 'completed');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NULL,
    clientName TEXT NOT NULL,
    status project_status_enum NOT NULL DEFAULT 'active',
    startDate DATE NOT NULL,
    endDate DATE NULL,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deletedAt TIMESTAMPTZ NULL
);

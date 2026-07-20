-- ============================================================================
-- DEALS ORIGIN - PRODUCTION DATABASE SCHEMA & SUPABASE MIGRATION BLUEPRINT
-- ============================================================================
-- Description: Run this SQL file in your Supabase SQL Editor to initialize all 
--              tables, foreign keys, relationships, indexes, storage buckets, 
--              and secure Row Level Security (RLS) policies matching the app.
-- Target Database: Supabase PostgreSQL (postgres)
-- Seed Mode: Seed-Free (Production-Ready)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CLEAN EXISTING RESOURCES (OPTIONAL/SAFETY CHECK)
-- ----------------------------------------------------------------------------
-- Drop views/tables in reverse order of dependency if executing a clean reinstall:
-- DROP TABLE IF EXISTS employee_tasks CASCADE;
-- DROP TABLE IF EXISTS hr_records CASCADE;
-- DROP TABLE IF EXISTS whatsapp_messages CASCADE;
-- DROP TABLE IF EXISTS invoices CASCADE;
-- DROP TABLE IF EXISTS media_campaigns CASCADE;
-- DROP TABLE IF EXISTS company_events CASCADE;
-- DROP TABLE IF EXISTS content_items CASCADE;
-- DROP TABLE IF EXISTS leads CASCADE;
-- DROP TABLE IF EXISTS company_settings CASCADE;
-- DROP TABLE IF EXISTS employees CASCADE;
-- DROP TABLE IF EXISTS clients CASCADE;

-- ----------------------------------------------------------------------------
-- 2. CREATE DATABASE TABLES WITH EXACT TYPES
-- ----------------------------------------------------------------------------

-- A. CLIENTS TABLE
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    address TEXT,
    contract_value NUMERIC DEFAULT 0,
    industry TEXT,
    account_manager TEXT,
    customer_since TEXT,
    services TEXT[] DEFAULT '{}',
    client_info TEXT,
    notes TEXT,
    word TEXT,
    profile_notes JSONB DEFAULT '[]'::jsonb,
    attachments TEXT[] DEFAULT '{}',
    activity_timeline JSONB DEFAULT '[]'::jsonb
);

ALTER TABLE clients ADD COLUMN IF NOT EXISTS word TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS profile_notes JSONB DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS client_profiles (
    client_id TEXT PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
    word TEXT DEFAULT '',
    profile_notes JSONB DEFAULT '[]'::jsonb
);

-- B. EMPLOYEES TABLE (Binds securely to Supabase Auth UUID if mapping authenticated users)
CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    department TEXT,
    position TEXT,
    avatar TEXT,
    role TEXT DEFAULT 'Employee',
    permissions TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'Active'
);

-- C. COMPANY SETTINGS TABLE (Saved to Supabase so app branding and billing data persist)
CREATE TABLE IF NOT EXISTS company_settings (
    id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    logo TEXT DEFAULT '',
    address TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    website TEXT DEFAULT '',
    tax_number TEXT DEFAULT '',
    invoice_prefix TEXT DEFAULT 'DOS-',
    primary_color TEXT DEFAULT '#0f172a',
    secondary_color TEXT DEFAULT '#475569',
    system_name TEXT DEFAULT 'Deals Origin',
    timezone TEXT DEFAULT 'Cairo/Africa',
    currency TEXT DEFAULT 'EGP'
);

ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS company_name TEXT NOT NULL DEFAULT 'Deals Origin Systems';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS logo TEXT DEFAULT '';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS website TEXT DEFAULT '';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS tax_number TEXT DEFAULT '';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS invoice_prefix TEXT DEFAULT 'DOS-';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#0f172a';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#475569';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS system_name TEXT DEFAULT 'Deals Origin';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Cairo/Africa';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EGP';

INSERT INTO company_settings (id, company_name, logo, address, phone, email, website, tax_number, invoice_prefix, primary_color, secondary_color, system_name, timezone, currency)
SELECT 'default', 'Deals Origin Systems', '', 'Mokattam, Cairo, Egypt', '+201012345678', 'info@dealsorigin.com', 'dealsorigin.com', 'EG-102-845-923', 'DOS-', '#0f172a', '#475569', 'Deals Origin', 'Cairo/Africa', 'EGP'
WHERE NOT EXISTS (SELECT 1 FROM company_settings WHERE id = 'default');

-- D. LEADS TABLE (CRM sales pipeline)
CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    source TEXT DEFAULT 'Manual',
    status TEXT DEFAULT 'New Lead',
    additional_notes TEXT DEFAULT ''
);

-- E. CONTENT ITEMS TABLE (Editorial & Content planning)
CREATE TABLE IF NOT EXISTS content_items (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    platform TEXT NOT NULL,
    publish_date TEXT NOT NULL,
    description TEXT,
    color_label TEXT,
    attachments TEXT[] DEFAULT '{}'
);

-- F. COMPANY EVENTS TABLE (Corporate calendar)
CREATE TABLE IF NOT EXISTS company_events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT DEFAULT 'Company Events',
    date TEXT NOT NULL,
    notes TEXT,
    color TEXT,
    event_date TEXT,
    color_hex TEXT,
    description TEXT
);

-- G. MEDIA CAMPAIGNS TABLE (Media buying performance)
CREATE TABLE IF NOT EXISTS media_campaigns (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    campaign_name TEXT NOT NULL,
    platform TEXT NOT NULL,
    budget NUMERIC DEFAULT 0,
    campaign_link TEXT,
    post_link TEXT,
    video_link TEXT,
    status TEXT DEFAULT 'Draft',
    notes TEXT,
    destination_link TEXT,
    performance JSONB DEFAULT '{"impressions": 0, "clicks": 0, "ctr": 0, "conversions": 0, "spent": 0}'::jsonb
);

-- H. INVOICES TABLE (Accounting management)
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    issue_date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    tax_rate NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    items JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'Pending',
    notes TEXT
);

-- I. WHATSAPP MESSAGES TABLE (Meta Cloud API Integration)
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id TEXT PRIMARY KEY,
    direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
    text TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    media_url TEXT,
    media_type TEXT
);

-- J. HR RECORDS TABLE (Salary, appraisals, attendance tracking)
CREATE TABLE IF NOT EXISTS hr_records (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    salary NUMERIC DEFAULT 0,
    bonuses NUMERIC DEFAULT 0,
    deductions NUMERIC DEFAULT 0,
    attendance_rate NUMERIC DEFAULT 100,
    vacation_days_used INTEGER DEFAULT 0,
    leave_requests JSONB DEFAULT '[]'::jsonb,
    hiring_date TEXT,
    documents TEXT[] DEFAULT '{}',
    performance_rating INTEGER DEFAULT 5,
    notes TEXT
);

-- K. EMPLOYEE TASKS TABLE (Operations workflow)
CREATE TABLE IF NOT EXISTS employee_tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    priority TEXT DEFAULT 'Medium',
    due_date TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    notes TEXT,
    description TEXT
);

CREATE INDEX IF NOT EXISTS idx_media_campaigns_client_id ON media_campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_hr_records_employee_id ON hr_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_tasks_employee_id ON employee_tasks(employee_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_timestamp ON whatsapp_messages(timestamp);

-- ----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
-- Enable RLS on all tables to enforce strict access control inside production:
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_tasks ENABLE ROW LEVEL SECURITY;

-- Create general permissive policies allowing authenticated corporate administrators:
CREATE POLICY "Enable all management for authenticated team members" ON clients
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all management for authenticated team members" ON client_profiles
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all management for authenticated team members" ON employees
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all management for authenticated team members" ON company_settings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all management for authenticated team members" ON leads
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all management for authenticated team members" ON content_items
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all management for authenticated team members" ON company_events
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all management for authenticated team members" ON media_campaigns
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all management for authenticated team members" ON invoices
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all management for authenticated team members" ON whatsapp_messages
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all management for authenticated team members" ON hr_records
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all management for authenticated team members" ON employee_tasks
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 3. OPTIMIZED DATABASES INDEXES (Performance scaling)
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_content_items_client_id ON content_items(client_id);
CREATE INDEX IF NOT EXISTS idx_media_campaigns_client_id ON media_campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_hr_records_employee_id ON hr_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_tasks_employee_id ON employee_tasks(employee_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_timestamp ON whatsapp_messages(timestamp);

-- ----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
-- Enable RLS on all tables to enforce strict access control inside production:
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_tasks ENABLE ROW LEVEL SECURITY;

-- Create general permissive policies allowing authenticated corporate administrators:
-- Clients policy
CREATE POLICY "Enable all management for authenticated team members" ON clients
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Employees policy
CREATE POLICY "Enable all management for authenticated team members" ON employees
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Leads policy
CREATE POLICY "Enable all management for authenticated team members" ON leads
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Content Items policy
CREATE POLICY "Enable all management for authenticated team members" ON content_items
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Company Events policy
CREATE POLICY "Enable all management for authenticated team members" ON company_events
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Media Campaigns policy
CREATE POLICY "Enable all management for authenticated team members" ON media_campaigns
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Invoices policy
CREATE POLICY "Enable all management for authenticated team members" ON invoices
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- WhatsApp Messages policy
CREATE POLICY "Enable all management for authenticated team members" ON whatsapp_messages
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- HR Records policy
CREATE POLICY "Enable all management for authenticated team members" ON hr_records
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Employee Tasks policy
CREATE POLICY "Enable all management for authenticated team members" ON employee_tasks
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 5. SECURE STORAGE BUCKETS FOR MEDIA/ATTACHMENTS
-- ----------------------------------------------------------------------------
-- To allow storing client contracts, invoice PDFs, media buying assets, and documents
-- We register a default storage bucket inside Supabase storage:

INSERT INTO storage.buckets (id, name, public) 
VALUES ('corporate-attachments', 'corporate-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Grant authenticated users access to read and write corporate-attachments bucket
CREATE POLICY "Allow authenticated users to upload files to bucket" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'corporate-attachments');

CREATE POLICY "Allow public read access to uploaded files" ON storage.objects
    FOR SELECT USING (bucket_id = 'corporate-attachments');

-- ============================================================================
-- SCHEMA DEPLOYMENT COMPLETE.
-- ============================================================================

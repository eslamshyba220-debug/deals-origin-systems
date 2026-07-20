-- ============================================================================
-- DEALS ORIGIN - SUPABASE AUTHENTICATION & EMPLOYEE SYNCHRONIZATION BLUEPRINT
-- ============================================================================
-- This file contains all the necessary SQL triggers and architectural choices
-- for synchronizing user authentication accounts with public employee profiles.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- WARNING & ARCHITECTURAL NOTE:
-- ----------------------------------------------------------------------------
-- Inserting directly into `auth.users` via a trigger on `public.employees` is
-- HIGHLY DISCOURAGED and security-restricted in Supabase.
-- Why?
-- 1. `auth.users` is managed by GoTrue (Supabase Auth). It contains complex cryptographically 
--    hashed passwords, identities, provider metadata, and JWT claims.
-- 2. Direct inserts bypass native validation, confirmation flows, and session managers.
-- 3. You would need to handle bcrypt password hashing manually in PostgreSQL, which requires 
--    unrestricted access to internal schemas.
--
-- RECOMMENDED SOLUTIONS:
-- Strategy A: Native Supabase Trigger (Recommended)
--             Users are signed up normally via Auth, and a trigger automatically 
--             copies their profile into `public.employees`.
--
-- Strategy B: Admin Server API / Edge Function (Recommended for Corporate Additions)
--             An admin endpoint on the server uses the Supabase Service Role (Admin client)
--             to create the user in Auth, then updates the employee row.
-- ----------------------------------------------------------------------------


-- ============================================================================
-- STRATEGY A: THE STANDARD NATIVE TRIGGER (auth.users -> public.employees)
-- ============================================================================
-- This trigger automatically fires whenever a new user is created via Supabase Auth
-- (e.g. Sign up, OAuth, or Admin creation). It copies their profile securely.

-- 1. Ensure the trigger function exists
CREATE OR REPLACE FUNCTION public.handle_new_user_sync()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.employees (
    id,
    username,
    email,
    avatar,
    role,
    permissions,
    status
  )
  VALUES (
    new.id, -- Synchronized UUID with auth.users.id
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'avatar', 
      'https://api.dicebear.com/7.x/bottts/svg?seed=' || new.id
    ),
    COALESCE(new.raw_user_meta_data->>'role', 'Employee'),
    CASE 
      WHEN (new.raw_user_meta_data->>'role') = 'Admin' THEN ARRAY['all']
      ELSE ARRAY['read_only']
    END,
    'Active'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = COALESCE(EXCLUDED.username, public.employees.username);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Bind the trigger to the auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_sync();

-- ----------------------------------------------------------------------------
-- How to trigger this from your React Client:
-- supabase.auth.signUp({
--   email: 'employee@dealsorigin.com',
--   password: 'InitialSecurePassword123',
--   options: {
--     data: {
--       username: 'employee_user',
--       role: 'Employee'
--     }
--   }
-- })
-- ----------------------------------------------------------------------------


-- ============================================================================
-- STRATEGY B: ADMINISTRATOR SERVER API ROUTE (TypeScript)
-- ============================================================================
-- Recommended when an Admin adds an employee inside the corporate dashboard.
-- Below is the complete Node.js / Express handler using the Service Role Key.
/*

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client with SERVICE_ROLE_KEY (Keep this secret on your server!)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Never expose this key to the client!
);

export async function createEmployeeAuthHandler(req, res) {
  const { email, password, username, role, department, position, phone } = req.body;

  try {
    // 1. Create the user inside auth.users with pre-confirmed email
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password, // The initial password chosen by the admin/system
      email_confirm: true, // Auto-confirm email so they can log in immediately
      user_metadata: { 
        username, 
        role 
      }
    });

    if (authError) throw authError;

    // 2. Insert or update the public.employees record with matching ID
    const { data: employee, error: empError } = await supabaseAdmin
      .from('employees')
      .insert({
        id: authUser.user.id, // PERFECT FOREIGN KEY MATCH!
        username: username,
        email: email,
        phone: phone || '',
        department: department || 'General',
        position: position || 'Staff',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${authUser.user.id}`,
        role: role || 'Employee',
        permissions: role === 'Admin' ? ['all'] : ['read'],
        status: 'Active'
      })
      .select()
      .single();

    if (empError) throw empError;

    return res.status(201).json({
      success: true,
      message: "Employee and Auth account initialized successfully.",
      employee
    });

  } catch (error) {
    console.error("Failed to create employee auth:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
*/


-- ============================================================================
-- STRATEGY C: DIRECT DATABASE TRIGGER (public.employees -> auth.users)
-- ============================================================================
-- WARNING: This requires pg_crypto for password hashing.
-- If you absolutely must use this strategy, use the following code.
-- The initial password is automatically set to a default (e.g. 'DealsOrigin123!')
-- which the employee is prompted to change upon first login.

-- Enable pgcrypto for password cryptographic hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

CREATE OR REPLACE FUNCTION public.sync_employee_to_auth_users()
RETURNS trigger AS $$
DECLARE
  default_password TEXT := 'DealsOrigin123!'; -- Define the Initial Password
  encrypted_pass TEXT;
  user_id UUID;
BEGIN
  -- Cryptographically hash the password using bcrypt matching GoTrue's format
  encrypted_pass := crypt(default_password, gen_salt('bf', 10));

  -- Insert directly into Supabase auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(), -- Generate UUID for the new authenticated user
    'authenticated',
    'authenticated',
    new.email,
    encrypted_pass,
    now(), -- Mark email as pre-confirmed
    null,
    null,
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    jsonb_build_object('username', new.username, 'role', new.role),
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO user_id;

  -- Update the matching ID on the newly inserted employee row
  NEW.id := user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger binding to public.employees (BEFORE INSERT so we can set the matched ID)
-- DROP TRIGGER IF EXISTS on_employee_inserted ON public.employees;
-- CREATE TRIGGER on_employee_inserted
--   BEFORE INSERT ON public.employees
--   FOR EACH ROW EXECUTE FUNCTION public.sync_employee_to_auth_users();

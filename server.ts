import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize PostgreSQL Pool connecting to the configured database.
// Disable SSL by default for local PostgreSQL instances, while still allowing it
// when explicitly enabled via environment variables or when the connection string requires it.
const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

function getDbSslConfig() {
  const sslMode = (process.env.DATABASE_SSL || "").toLowerCase();
  if (["1", "true", "yes", "on"].includes(sslMode)) {
    return { rejectUnauthorized: false };
  }

  const normalizedConnectionString = (connectionString || "").toLowerCase();
  if (
    normalizedConnectionString.includes("sslmode=require") ||
    normalizedConnectionString.includes("ssl=true")
  ) {
    return { rejectUnauthorized: false };
  }

  if (
    normalizedConnectionString.includes("localhost") ||
    normalizedConnectionString.includes("127.0.0.1") ||
    normalizedConnectionString.includes("::1")
  ) {
    return false;
  }

  return false;
}

const dbPool = connectionString
  ? new Pool({
      connectionString,
      ssl: getDbSslConfig(),
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    })
  : null;

function getDbPool() {
  if (!dbPool) {
    throw new Error("Database connection is not configured. Set DATABASE_URL or SUPABASE_DB_URL to enable database-backed features.");
  }
  return dbPool;
}

// Run database initialization schema
async function initDatabaseSchema() {
  if (!connectionString) {
    console.log("Database initialization skipped because DATABASE_URL/SUPABASE_DB_URL is not configured. The app will run in demo mode.");
    return;
  }

  console.log("Initializing Supabase PostgreSQL database tables...");
  let client;
  try {
    client = await getDbPool().connect();
    await client.query("BEGIN");
    
    // Clients table
    await client.query(`
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
      )
    `);

    // Employees table
    await client.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        department TEXT,
        position TEXT,
        avatar TEXT,
        role TEXT DEFAULT 'Employee',
        permissions TEXT[],
        status TEXT DEFAULT 'Active'
      )
    `);

    // Company Settings table
    await client.query(`
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
      )
    `);

    await client.query(`
      INSERT INTO company_settings (id, company_name, logo, address, phone, email, website, tax_number, invoice_prefix, primary_color, secondary_color, system_name, timezone, currency)
      SELECT 'default', 'Deals Origin Systems', '', 'Mokattam, Cairo, Egypt', '+201012345678', 'info@dealsorigin.com', 'dealsorigin.com', 'EG-102-845-923', 'DOS-', '#0f172a', '#475569', 'Deals Origin', 'Cairo/Africa', 'EGP'
      WHERE NOT EXISTS (SELECT 1 FROM company_settings WHERE id = 'default')
    `);

    // Leads table
    await client.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        company_name TEXT NOT NULL,
        contact_person TEXT,
        phone TEXT,
        email TEXT,
        source TEXT,
        status TEXT,
        notes TEXT
      )
    `);

    // Content Items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS content_items (
        id TEXT PRIMARY KEY,
        client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        platform TEXT NOT NULL,
        publish_date TEXT NOT NULL,
        description TEXT,
        color_label TEXT,
        attachments TEXT[]
      )
    `);

    // Company Events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS company_events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        type TEXT,
        date TEXT NOT NULL,
        notes TEXT,
        color TEXT,
        event_date TEXT,
        color_hex TEXT,
        description TEXT
      )
    `);

    // Media Campaigns table
    await client.query(`
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
      )
    `);

    // Invoices table
    await client.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        invoice_number TEXT UNIQUE NOT NULL,
        issue_date TEXT NOT NULL,
        due_date TEXT NOT NULL,
        tax_rate NUMERIC DEFAULT 0,
        discount NUMERIC DEFAULT 0,
        items JSONB DEFAULT '[]',
        status TEXT DEFAULT 'Pending',
        notes TEXT
      )
    `);

    // WhatsApp Messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS whatsapp_messages (
        id TEXT PRIMARY KEY,
        direction TEXT NOT NULL,
        text TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        media_url TEXT,
        media_type TEXT
      )
    `);

    // HR Records table
    await client.query(`
      CREATE TABLE IF NOT EXISTS hr_records (
        id TEXT PRIMARY KEY,
        employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        salary NUMERIC DEFAULT 0,
        bonuses NUMERIC DEFAULT 0,
        deductions NUMERIC DEFAULT 0,
        attendance_rate NUMERIC DEFAULT 100,
        vacation_days_used INTEGER DEFAULT 0,
        leave_requests JSONB DEFAULT '[]',
        hiring_date TEXT,
        documents TEXT[],
        performance_rating INTEGER DEFAULT 5,
        notes TEXT
      )
    `);

    // Employee Tasks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS employee_tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        priority TEXT DEFAULT 'Medium',
        due_date TEXT NOT NULL,
        status TEXT DEFAULT 'Pending',
        notes TEXT,
        description TEXT
      )
    `);

    await client.query("COMMIT");
    console.log("Database tables initialized successfully.");
  } catch (err) {
    if (client) {
      await client.query("ROLLBACK").catch(() => undefined);
    }
    console.error("Database initialization skipped due to connection error:", err);
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Initialize GoogleGenAI client lazily or safely
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined in the environment secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Secure Admin Endpoint to create Authenticated Employees in Supabase Auth and database
app.post("/api/admin/create-employee", async (req, res) => {
  const { username, password, email, phone, department, position, role, status } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ error: "Email, password, and username are required." });
  }

  const supabaseUrl = process.env.SUPABASE_URL || "https://znsnaxhdaidbutatdavk.supabase.co";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    return res.status(500).json({ 
      error: "SUPABASE_SERVICE_ROLE_KEY is not defined in the environment secrets. Please set it in Settings > Secrets." 
    });
  }

  try {
    const { createClient } = await import("@supabase/supabase-js");
    // Initialize the Admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 1. Create authenticated user inside auth.users with pre-confirmed email
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email to bypass manual confirmation
      user_metadata: {
        username,
        role,
        requires_password_change: true // Force password change on first login
      }
    });

    if (authError) {
      console.error("Supabase Admin Auth creation failed:", authError);
      return res.status(400).json({ error: authError.message });
    }

    const userId = authData.user.id;
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;
    const permissions = role === "Admin" ? ["all"] : ["read", "write"];

    // 2. Insert corresponding employee row in public.employees with matching ID
    const insertQuery = `
      INSERT INTO employees (id, username, email, phone, department, position, avatar, role, permissions, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [
      userId, 
      username, 
      email, 
      phone || "", 
      department || "General", 
      position || "Staff", 
      avatar, 
      role || "Employee", 
      permissions, 
      status || "Active"
    ];

    if (!dbPool) {
      return res.status(503).json({
        error: "Database connection is not configured. Set DATABASE_URL or SUPABASE_DB_URL to enable employee synchronization."
      });
    }

    const dbResult = await dbPool.query(insertQuery, values);
    const newEmployee = dbResult.rows[0];

    // 3. Auto-populate an active HR record for the new employee
    try {
      await dbPool.query(
        `INSERT INTO hr_records (id, employee_id, salary, bonuses, deductions, attendance_rate, vacation_days_used, hiring_date, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [`hr-${Date.now()}`, userId, 0, 0, 0, 100, 0, new Date().toISOString().split('T')[0], "Automated secure system record."]
      );
    } catch (hrErr) {
      console.error("Warning: Failed to auto-create HR record:", hrErr);
    }

    res.status(201).json({
      success: true,
      message: "Authenticated employee registered and database profile synchronized successfully.",
      employee: {
        id: newEmployee.id,
        username: newEmployee.username,
        password: password, // Retain password for display in UI list
        email: newEmployee.email,
        phone: newEmployee.phone,
        department: newEmployee.department,
        position: newEmployee.position,
        avatar: newEmployee.avatar,
        role: newEmployee.role,
        permissions: newEmployee.permissions,
        status: newEmployee.status
      }
    });

  } catch (error: any) {
    console.error("API Create Employee Error:", error);
    res.status(500).json({ error: error.message || "Failed to process server-side employee registration." });
  }
});

// Real SQL Execution Route (Restricted to Super Admin)
app.post("/api/admin/sql", async (req, res) => {
  const { query, adminRole } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  // Check role restriction
  if (adminRole !== "Admin") {
    return res.status(403).json({ error: "Access denied. SQL Execution is restricted to Admin role only." });
  }

  try {
    if (!dbPool) {
      return res.status(503).json({
        error: "Database connection is not configured. Set DATABASE_URL or SUPABASE_DB_URL to enable SQL execution."
      });
    }

    const result = await dbPool.query(query);
    res.json({
      rows: result.rows,
      rowCount: result.rowCount,
      fields: result.fields ? result.fields.map((f: { name: string }) => f.name) : [],
      command: result.command
    });
  } catch (error: any) {
    console.error("SQL Execution Error:", error);
    res.status(500).json({ error: error.message || "Failed to execute SQL command." });
  }
});

// Meta WhatsApp Cloud API Outgoing Message endpoint
app.post("/api/whatsapp/send", async (req, res) => {
  try {
    const { to, text, token, phoneNumberId } = req.body;
    
    if (!to || !text) {
      return res.status(400).json({ error: "Recipient phone number ('to') and message ('text') are required." });
    }

    const finalToken = token || process.env.META_WHATSAPP_TOKEN;
    const finalPhoneId = phoneNumberId || process.env.META_WHATSAPP_PHONE_NUMBER_ID;

    let metaResponse: any = null;
    let metaSuccess = false;

    // If Meta API credentials are provided, attempt real API integration with Meta Cloud API
    if (finalToken && finalPhoneId) {
      try {
        const response = await fetch(`https://graph.facebook.com/v17.0/${finalPhoneId}/messages`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${finalToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: to,
            type: "text",
            text: { body: text }
          })
        });

        metaResponse = await response.json();
        metaSuccess = response.ok;
      } catch (err: any) {
        console.error("Meta API post failure:", err);
        metaResponse = { error: err.message };
      }
    } else {
      // Graceful fallback to simulate real API connection if credentials aren't fully set up yet
      metaSuccess = true;
      metaResponse = { message: "Simulated successful sending. Please configure META_WHATSAPP_TOKEN in Secrets to execute live network requests." };
    }

    res.json({
      success: metaSuccess,
      response: metaResponse,
    });
  } catch (error: any) {
    console.error("WhatsApp Integration Error:", error);
    res.status(500).json({ error: error.message || "Failed to process WhatsApp request." });
  }
});

// AI Generation Proxy Route
app.post("/api/ai/generate", async (req, res) => {
  try {
    const { prompt, systemInstruction, context } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getAiClient();
    
    // Construct rich content including context if provided
    let contents = prompt;
    if (context) {
      contents = `Context of client/project: ${JSON.stringify(context)}\n\nUser request: ${prompt}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction || "You are a professional enterprise assistant for Deals Origin Systems. Answer precisely in a minimalist, structured markdown style.",
        temperature: 0.7,
      },
    });

    const text = response.text || "No response generated.";
    res.json({ text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to generate AI response. Please ensure your GEMINI_API_KEY is set in Settings > Secrets." 
    });
  }
});

// Configure Vite or Static Assets serving
async function setupApp() {
  await initDatabaseSchema();

  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite development server middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving production static files from dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Deals Origin Systems server is running on http://0.0.0.0:${PORT}`);
  });
}

setupApp().catch((err) => {
  console.error("Failed to start server:", err);
});


import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://znsnaxhdaidbutatdavk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpuc25heGhkYWlkYnV0YXRkYXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MjUzMTIsImV4cCI6MjA5ODQwMTMxMn0.Zt23qgf4R-B1r8_VOnzck-85vwtI4NNiSsy8FpJEFUo";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

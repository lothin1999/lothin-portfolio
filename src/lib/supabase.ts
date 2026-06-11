import { createClient } from "@supabase/supabase-js";

const cleanEnvVar = (val: string | undefined) => (val || "").trim().replace(/^['"]|['"]$/g, "");

const supabaseUrl = cleanEnvVar(process.env.SUPABASE_URL);
const supabaseKey = cleanEnvVar(process.env.SUPABASE_SERVICE_ROLE_KEY);

const isConfigured =
  !!supabaseUrl &&
  !!supabaseKey &&
  supabaseUrl !== "https://your-project-id.supabase.co" &&
  supabaseKey !== "your-supabase-service-role-key";

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false, // Server-side usage
      },
    })
  : null;

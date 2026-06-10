import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import { defaultCV } from '../src/lib/data';

// Load .env manually
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      // Remove surrounding quotes if present
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      process.env[key] = val;
    }
  });
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding default CV data to Supabase...");
  console.log("URL:", supabaseUrl);

  try {
    const { error } = await supabase
      .from('portfolio_data')
      .upsert({
        key: 'lothin_cv_data',
        value: defaultCV,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    if (error) {
      console.error("❌ Error seeding data:", error.message);
      process.exit(1);
    } else {
      console.log("✅ Successfully seeded default CV data to Supabase!");
      process.exit(0);
    }
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    process.exit(1);
  }
}

seed();

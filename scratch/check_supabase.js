const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STORAGE_KEY = "lothin_cv_data";

if (!supabaseUrl || !supabaseKey) {
  console.log("Supabase URL or Key missing in env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('portfolio_data')
    .select('value')
    .eq('key', STORAGE_KEY)
    .maybeSingle();

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Data in Supabase:");
    console.log(JSON.stringify(data, null, 2));
  }
}

run();

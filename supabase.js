
const SUPABASE_URL = "https://jxvhpdoiprufmlgozsqy.supabase.co";

// Replace this placeholder with your Supabase Publishable key.
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_UREXej4UAwtzhypQz80fqg_iqaXXxES";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

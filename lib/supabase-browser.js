import { createClient } from "@supabase/supabase-js";

let client = null;

const SUPABASE_URL = "https://dpzimspylobzpcuvulbn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_n9eUwhbn3QdzLIOnVNcveQ_ZfT5vCcg";

export function getSupabaseBrowser() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;

  client = createClient(url, key);
  return client;
}

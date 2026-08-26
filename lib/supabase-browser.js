import { createClient } from "@supabase/supabase-js";

let client = null;

export function getSupabaseBrowser() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Do not crash the Next.js build if public Supabase variables are unavailable.
  // The caller can handle a missing client at runtime.
  if (!url || !key) return null;

  client = createClient(url, key);
  return client;
}

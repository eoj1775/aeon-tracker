import { createClient } from "@supabase/supabase-js";

// Server-side only — uses the secret key, which must never be exposed to the browser.
// This file should only ever be imported from API routes, never from client components.
export function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error("SUPABASE_URL or SUPABASE_SECRET_KEY environment variable is not set");
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

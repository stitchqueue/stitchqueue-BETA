import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables exist
if (!supabaseUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL environment variable. " +
      "Please check your .env.local file or Vercel environment settings."
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. " +
      "Please check your .env.local file or Vercel environment settings."
  );
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

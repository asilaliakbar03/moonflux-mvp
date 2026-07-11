import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[MoonFluxx] Supabase env vars not set. DB features will be disabled.\n" +
    "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
  );
}

/** Browser/client-side Supabase client (uses anon key) */
export const supabase = createClient<Database>(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder",
  {
    auth: {
      persistSession: false, // We use wallet-based auth, not Supabase auth
    },
  }
);

/** Server-side client with service role (for API routes only) */
export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY not set");
  return createClient<Database>(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}

/** Check if Supabase is configured (env vars present and not placeholders) */
export const isSupabaseConfigured =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('YOUR_PROJECT_ID') &&
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.includes('YOUR_ANON_KEY');

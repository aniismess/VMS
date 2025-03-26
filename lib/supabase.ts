import { createClient } from "@supabase/supabase-js"

// Use NEXT_PUBLIC_ variables for client-side access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export type SupabaseUser = {
  id: string
  email?: string
  user_metadata?: {
    name?: string
  }
}

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Keep the app public by default for now.
export const isPublicApp = import.meta.env.VITE_PUBLIC_MODE !== 'false'
export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = hasSupabaseEnv
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

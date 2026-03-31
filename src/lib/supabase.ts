import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey)

const publicModeFlag = import.meta.env.VITE_PUBLIC_MODE

/**
 * Modo público = fluxo “teste grátis” por e-mail (localStorage), sem exigir login Supabase.
 * - `VITE_PUBLIC_MODE=true` → força modo público (mesmo com Supabase configurado).
 * - `VITE_PUBLIC_MODE=false` → login Supabase obrigatório quando há URL/anon key.
 * - Variável omitida no build: se Supabase estiver configurado → trata como produção (auth);
 *   sem Supabase → mantém modo público para demo local sem .env.
 */
export const isPublicApp =
  publicModeFlag === 'true' || (publicModeFlag !== 'false' && !hasSupabaseEnv)

export const supabase = hasSupabaseEnv
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

/** Projetos/storage remotos: Supabase com login obrigatorio (VITE_PUBLIC_MODE=false). */
export const isRemoteSupabaseMode = !isPublicApp && hasSupabaseEnv && Boolean(supabase)

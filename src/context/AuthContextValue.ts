import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { hasSupabaseEnv } from '../lib/supabase'

export interface AuthContextState {
  user: User | null
  session: Session | null
  loading: boolean
}

export const AuthContext = createContext<AuthContextState>({
  user: null,
  session: null,
  loading: hasSupabaseEnv,
})

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL as string
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'implicit',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'drivescore-auth',
    storage: {
      getItem: (key: string) => {
        try {
          return localStorage.getItem(key)
        } catch {
          return sessionStorage.getItem(key)
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value)
          sessionStorage.setItem(key, value)
        } catch {}
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key)
          sessionStorage.removeItem(key)
        } catch {}
      },
    }
  }
})

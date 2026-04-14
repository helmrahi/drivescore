// ============================================
// HOOK AUTH — Gestion session utilisateur
// ============================================

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Profile } from '../types'
import { getProfile } from '../services/profileService'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { navigate('/login'); return }
      setUser(session.user)
      const p = await getProfile(session.user.id)
      setProfile(p)
      setLoading(false)
    }
    load()

    // Écouter les changements de session — refresh automatique
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/login')
        return
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          setUser(session.user)
          const p = await getProfile(session.user.id)
          setProfile(p)
          setLoading(false)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return { user, profile, loading, logout }
}

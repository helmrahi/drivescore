import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Profile } from '../types'
import { getProfile } from '../services/profileService'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  async function ensureProfile(u: any) {
    let p = await getProfile(u.id)
    if (!p) {
      const pseudoId = 'DS' + Math.random().toString(36).substr(2, 8).toUpperCase()
      const meta = u.user_metadata || {}
      const prenom = meta.full_name?.split(' ')[0] || meta.name?.split(' ')[0] || 'Conducteur'
      const nom = meta.full_name?.split(' ').slice(1).join(' ') || ''
      await supabase.from('profiles').insert({
        id: u.id, pseudo_id: pseudoId,
        prenom, nom, email: u.email,
        role: 'client', consentement_gps: false,
        consentement_marketing: false, afficher_leaderboard: false,
      })
      p = await getProfile(u.id)
    }
    return p
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        const p = await ensureProfile(session.user)
        setProfile(p)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function logout() {
    await supabase.auth.signOut()
  }

  return { user, profile, loading, logout }
}

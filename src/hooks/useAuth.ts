import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Profile } from '../types'
import { getProfile } from '../services/profileService'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const initialized = useRef(false)

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
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        setLoading(false)
        navigate('/login')
        return
      }

      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
        if (initialized.current && event === 'SIGNED_IN') return
        initialized.current = true
        setUser(session.user)
        const p = await ensureProfile(session.user)
        setProfile(p)
        setLoading(false)
        if (event === 'SIGNED_IN') navigate('/dashboard')
        return
      }

      if (!session && event === 'INITIAL_SESSION') {
        setLoading(false)
        navigate('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function logout() {
    await supabase.auth.signOut()
  }

  return { user, profile, loading, logout }
}

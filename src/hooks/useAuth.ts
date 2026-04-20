import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Profile } from '../types'
import { getProfile } from '../services/profileService'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const profileCreating = useRef(false)

  async function ensureProfile(u: any) {
    if (profileCreating.current) return null
    let p = await getProfile(u.id)
    if (!p) {
      profileCreating.current = true
      const pseudoId = 'DS' + Math.random().toString(36).substr(2, 8).toUpperCase()
      const meta = u.user_metadata || {}
      const prenom = meta.full_name?.split(' ')[0] || meta.name?.split(' ')[0] || 'Conducteur'
      const nom = meta.full_name?.split(' ').slice(1).join(' ') || ''
      await supabase.from('profiles').insert({
        id: u.id, pseudo_id: pseudoId, prenom, nom,
        email: u.email, role: 'client',
        consentement_gps: false, consentement_marketing: false,
        afficher_leaderboard: false,
      })
      profileCreating.current = false
      p = await getProfile(u.id)
    }
    return p
  }

  useEffect(() => {
    let mounted = true

    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return
      if (session?.user) {
        setUser(session.user)
        const p = await ensureProfile(session.user)
        if (mounted) { setProfile(p); setLoading(false) }
      } else {
        setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      if (event === 'SIGNED_OUT') {
        setUser(null); setProfile(null); setLoading(false)
        return
      }
      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        setUser(session.user)
        const p = await ensureProfile(session.user)
        if (mounted) {
          setProfile(p)
          setLoading(false)
          // Rediriger si profil incomplet (OAuth sans prénom)
          if (p && !p.prenom && event === 'SIGNED_IN') {
            window.location.href = '/complete-profil'
          }
        }
      }
    })

    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  async function logout() {
    await supabase.auth.signOut()
  }

  return { user, profile, loading, logout }
}

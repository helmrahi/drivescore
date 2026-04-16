// ============================================
// HOOK AUTH — Gestion session utilisateur
// ============================================

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
  const justSignedIn = useRef(false)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { navigate('/login'); return }
      setUser(session.user)
      let p = await getProfile(session.user.id)
      // Créer profil si OAuth sans profil
      if (!p) {
        const { supabase: sb } = await import('../lib/supabase')
        const pseudoId = 'DS' + Math.random().toString(36).substr(2, 8).toUpperCase()
        const meta = session.user.user_metadata || {}
        const prenom = meta.full_name?.split(' ')[0] || meta.name?.split(' ')[0] || 'Conducteur'
        const nom = meta.full_name?.split(' ').slice(1).join(' ') || ''
        await sb.from('profiles').insert({
          id: session.user.id, pseudo_id: pseudoId,
          prenom, nom, email: session.user.email,
          role: 'client', consentement_gps: false,
          consentement_marketing: false, afficher_leaderboard: false,
        })
        p = await getProfile(session.user.id)
      }
      setProfile(p)
      setLoading(false)
    }
    load()

    // Écouter les changements de session — refresh automatique
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        if (justSignedIn.current) return // ignore déconnexion immédiate après OAuth
        navigate('/login')
        return
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        justSignedIn.current = true
        setTimeout(() => { justSignedIn.current = false }, 3000)
        if (session?.user) {
          setUser(session.user)
          let p = await getProfile(session.user.id)
          if (!p) {
            const pseudoId = 'DS' + Math.random().toString(36).substr(2, 8).toUpperCase()
            const meta = session.user.user_metadata || {}
            const prenom = meta.full_name?.split(' ')[0] || 'Conducteur'
            await supabase.from('profiles').insert({
              id: session.user.id, pseudo_id: pseudoId,
              prenom, nom: '', email: session.user.email,
              role: 'client', consentement_gps: false,
              consentement_marketing: false, afficher_leaderboard: false,
            })
            p = await getProfile(session.user.id)
          }
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

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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setUser(user)
      const p = await getProfile(user.id)
      setProfile(p)
      setLoading(false)
    }
    load()
  }, [navigate])

  async function logout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return { user, profile, loading, logout }
}

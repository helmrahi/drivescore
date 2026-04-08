// ============================================
// SERVICE PROFIL — Toute la logique Supabase
// Les pages appellent ces fonctions, pas Supabase directement
// ============================================

import { supabase } from '../lib/supabase'
import { Profile } from '../types'

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) { console.error('getProfile:', error); return null }
  return data
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
  if (error) { console.error('updateProfile:', error); return false }
  return true
}

export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('pseudo_id, prenom, nom, afficher_leaderboard')
    .eq('afficher_leaderboard', true)
  if (error) { console.error('getAllProfiles:', error); return [] }
  return data || []
}

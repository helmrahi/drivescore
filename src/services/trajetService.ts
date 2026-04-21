// ============================================
// SERVICE TRAJET — CRUD trajets Supabase
// ============================================


import { supabase } from '../lib/supabase'
import { Trajet } from '../types'

function isValidKm(km: any): boolean {
  const n = parseFloat(km)
  return !isNaN(n) && isFinite(n) && n >= 0;
}

export async function getTrajets(pseudoId: string, limit = 10): Promise<Trajet[]> {
  const { data, error } = await supabase
    .from('trajets')
    .select('*')
    .eq('pseudo_id', pseudoId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) { console.error('getTrajets:', error); return [] }
  return data || []
}

export async function insertTrajet(trajet: Omit<Trajet, 'id' | 'created_at'>): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!isValidKm(trajet.km)) {
    return { success: false, id: '', error: "Le nombre de kilomètres doit être strictement positif." };
  }
  const { data, error } = await supabase.from('trajets').insert(trajet).select('id').single()
  if (error) { console.error('insertTrajet error:', JSON.stringify(error)); return { success: false, error: error.message } }
  return { success: true, id: data?.id || '' }
}

export async function getTrajetStats(pseudoId: string): Promise<{
  totalKm: number
  avgScore: number
  totalTrajets: number
  totalCout: number
}> {
  const trajets = await getTrajets(pseudoId, 100)
  if (trajets.length === 0) return { totalKm: 0, avgScore: 0, totalTrajets: 0, totalCout: 0 }

  const totalKm = parseFloat(trajets.reduce((s, t) => s + (t.km || 0), 0).toFixed(2))
  const avgScore = Math.round(trajets.reduce((s, t) => s + (t.score_trajet || 0), 0) / trajets.length)
  const totalCout = parseFloat(trajets.reduce((s, t) => s + (t.cout_mad || 0), 0).toFixed(2))

  return { totalKm, avgScore, totalTrajets: trajets.length, totalCout }
}

export async function getAllTrajets(): Promise<any[]> {
  const { data, error } = await supabase
    .from('trajets')
    .select('pseudo_id, score_trajet, km, type_route, freinages_brusques, date_trajet')
  if (error) { console.error('getAllTrajets:', error); return [] }
  return data || []
}

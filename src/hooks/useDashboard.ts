// ============================================
// HOOK DASHBOARD — Données tableau de bord
// ============================================

import { useEffect, useState } from 'react'
import { Trajet, Facture } from '../types'
import { getTrajets } from '../services/trajetService'
import { calculerFacture, getCouleurScore, getLabelScore } from '../services/scoringService'

export function useDashboard(pseudoId: string | undefined) {
  const [trajets, setTrajets] = useState<Trajet[]>([])
  const [score, setScore] = useState(0)
  const [km, setKm] = useState(0)
  const [facture, setFacture] = useState<Facture | null>(null)
  const [loading, setLoading] = useState(true)

  const mois = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' })

  useEffect(() => {
    if (!pseudoId) return
    async function load() {
      const data = await getTrajets(pseudoId!, 10)
      if (data.length > 0) {
        const totalKm = data.reduce((s, t) => s + (t.km || 0), 0)
        const avgScore = Math.round(data.reduce((s, t) => s + (t.score_trajet || 0), 0) / data.length)
        setKm(totalKm)
        setScore(avgScore)
        setFacture(calculerFacture(totalKm, avgScore, mois))
        setTrajets(data.slice(0, 5))
      } else {
        setFacture(calculerFacture(0, 0, mois))
      }
      setLoading(false)
    }
    load()
  }, [pseudoId])

  return {
    trajets, score, km, facture, loading,
    scoreColor: getCouleurScore(score),
    scoreLabel: getLabelScore(score),
  }
}

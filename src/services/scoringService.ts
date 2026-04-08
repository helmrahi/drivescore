// ============================================
// SERVICE SCORING — Moteur de calcul du score
// Logique métier pure, sans dépendance UI
// ============================================

import { AccelEvent, ScoreResult, Facture } from '../types'
import { PRICING, SCORE_THRESHOLDS } from '../config/wafa'

export function calculerScore(
  events: AccelEvent[],
  speedMax: number,
  exces: number
): ScoreResult {
  let score = 100
  const freinages = events.filter(e => e.type === 'freinage').length
  const accelerations = events.filter(e => e.type === 'acceleration').length

  score -= freinages * 3
  score -= accelerations * 2
  score -= exces * 5

  if (speedMax > 130) score -= 15
  else if (speedMax > 110) score -= 8
  else if (speedMax > 90) score -= 3

  return {
    score: Math.max(0, Math.min(100, score)),
    freinages,
    accelerations,
    exces,
    speedMax,
  }
}

export function calculerFacture(km: number, score: number, mois: string): Facture {
  const base = PRICING.baseMAD
  const coutKm = Math.round(km * PRICING.perKmMAD * 100) / 100
  const estimation = base + coutKm

  let tauxReduction = 0
  if (score >= SCORE_THRESHOLDS.excellent) tauxReduction = PRICING.reductionElite
  else if (score >= SCORE_THRESHOLDS.bon) tauxReduction = PRICING.reductionBon
  else if (score >= SCORE_THRESHOLDS.moyen) tauxReduction = PRICING.reductionMoyen

  const reduction = Math.round(estimation * tauxReduction)
  const total = estimation - reduction

  return { base, km, coutKm, reduction, total, mois }
}

export function getLabelScore(score: number): string {
  if (score >= SCORE_THRESHOLDS.excellent) return '🏅 Excellent'
  if (score >= SCORE_THRESHOLDS.bon) return '✅ Bon conducteur'
  if (score >= SCORE_THRESHOLDS.moyen) return '⚠️ Moyen'
  return '🔴 À améliorer'
}

export function getCouleurScore(score: number): string {
  if (score >= SCORE_THRESHOLDS.bon) return '#2E7D32'
  if (score >= SCORE_THRESHOLDS.faible) return '#F5A623'
  return '#EF4444'
}

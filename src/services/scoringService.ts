// ============================================
// SCORING ENGINE — DriveScore by Wafa Assurance
// Specs validées le 15/04/2026
// ============================================
import { AccelEvent, ScoreResult, Facture } from '../types'
import { PRICING, SCORE_THRESHOLDS } from '../config/wafa'

// Pénalités validées
const PENALITES = {
  freinage_brusque: 3,
  freinage_urgence: 8,
  acceleration_brusque: 2,
  exces_leger: 3,   // dépassement < +15 km/h au-dessus tolérance
  exces_grave: 7,   // dépassement >= +15 km/h au-dessus tolérance
}

// Tolérance par type de route
export function getToleranceVitesse(type: 'ville' | 'route' | 'autoroute'): number {
  if (type === 'autoroute') return 10
  if (type === 'route') return 8
  return 5
}

// Seuil freinage par type route
export function getSeuilFreinage(type: 'ville' | 'route' | 'autoroute'): number {
  if (type === 'autoroute') return 7.5
  if (type === 'route') return 8.5
  return 9.0
}

// Seuil accélération par type route
export function getSeuilAcceleration(type: 'ville' | 'route' | 'autoroute'): number {
  if (type === 'autoroute') return 6.0
  if (type === 'route') return 7.0
  return 8.0
}

// Calcul score trajet
export function calculerScore(
  events: AccelEvent[],
  speedMax: number,
  exces: number,
  excesGraves: number = 0
): ScoreResult {
  let score = 100

  const freinages = events.filter(e => e.type === 'freinage' && e.magnitude < 12).length
  const urgences = events.filter(e => e.type === 'freinage' && e.magnitude >= 12).length
  const accelerations = events.filter(e => e.type === 'acceleration').length
  const excesLegers = Math.max(0, exces - excesGraves)

  score -= freinages * PENALITES.freinage_brusque
  score -= urgences * PENALITES.freinage_urgence
  score -= accelerations * PENALITES.acceleration_brusque
  score -= excesLegers * PENALITES.exces_leger
  score -= excesGraves * PENALITES.exces_grave

  return {
    score: Math.max(0, Math.round(score)),
    freinages,
    accelerations,
    exces,
  }
}

// Calcul facture mensuelle
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

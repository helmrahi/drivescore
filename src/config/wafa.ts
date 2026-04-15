// ============================================
// CONFIG WAFA ASSURANCE — Source unique de vérité
// Modifier ici = impact sur toute l'app
// ============================================

export const WAFA = {
  // Couleurs brand
  or: '#F5A623',
  orDark: '#D4891A',
  orLight: '#FDF3E0',
  vert: '#2E7D32',
  vertLight: '#4CAF50',
  vertDark: '#1B5E20',
  noir: '#1A1A1A',
  gris: '#F5F5F5',
  grisMid: '#E8E8E8',
} as const

// Tarification PAYD
export const PRICING = {
  baseMAD: 200,           // Abonnement mensuel de base
  perKmMAD: 0.5,          // Coût par km
  reductionElite: 0.15,   // -15% si score >= 90
  reductionBon: 0.10,     // -10% si score >= 80
  reductionMoyen: 0.05,   // -5% si score >= 70
} as const

// Seuils télématique — specs validées
export const TELEMATICS = {
  seuilFreinageBrusque: 9.0,
  seuilFreinageRoute: 8.5,
  seuilFreinageAutoroute: 7.5,
  seuilUrgence: 12.0,
  seuilAccelVille: 8.0,
  seuilAccelRoute: 7.0,
  seuilAccelAutoroute: 6.0,
  toleranceVille: 5,
  toleranceRoute: 8,
  toleranceAutoroute: 10,
  nocturneDebut: 22,
  nocturneFin: 5,
  trajetMinKm: 0.5,
  trajetMinDuration: 120,
  referenceClassique: 500,
} as const



// Seuils score
export const SCORE_THRESHOLDS = {
  excellent: 90,
  bon: 80,
  moyen: 70,
  faible: 60,
} as const

// ============================================
// CONFIG WAFA ASSURANCE — Source unique de vérité
// Modifier ici = impact sur toute l'app
// ============================================

export const WAFA = {
  // Couleurs brand — nouveau design
  or: '#F5A623',
  orDark: '#8B5E00',
  orLight: '#FDF0D5',
  vert: '#2A8A50',
  vertLight: '#3EBD6F',
  vertDark: '#1E5C35',
  vertDeep: '#0D2E1C',
  vertGlow: 'rgba(62,189,111,0.15)',
  noir: '#0D1F16',
  gris: '#F7F8F6',
  grisMid: '#EDEFEB',
  textPrimary: '#0D1F16',
  textSecondary: '#4A6355',
  textTertiary: '#8AA898',
  border: 'rgba(13,46,28,0.08)',
  borderStrong: 'rgba(13,46,28,0.14)',
  red: '#E5403A',
  redLight: '#FDEAEA',
  redDark: '#8B1A17',
  blue: '#2D7DD2',
  blueLight: '#E8F2FC',
  surface: '#F7F8F6',
  surface2: '#EDEFEB',
  fontSans: "'DM Sans', sans-serif",
  fontMono: "'DM Mono', monospace",
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

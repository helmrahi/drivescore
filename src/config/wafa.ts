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

// Seuils de score
export const SCORE_THRESHOLDS = {
  elite: 95,
  excellent: 90,
  bon: 80,
  moyen: 70,
  faible: 60,
} as const

// Seuils télématique
export const TELEMATICS = {
  seuilFreinage: 9,        // magnitude accéléromètre ville (défaut)
  seuilFreinageRoute: 8.5, // magnitude route nationale
  seuilFreinageAutoroute: 7.5, // magnitude autoroute
  seuilAccelVille: 8.0,    // accélération brusque ville
  seuilAccelRoute: 7.0,    // accélération brusque route
  seuilAccelAutoroute: 6.0, // accélération brusque autoroute
  seuilUrgence: 12.0,      // freinage d'urgence tous types
  delaiEntreEvents: 2000,  // ms entre deux détections
  toleranceVitesse: 2,     // km/h de tolérance excès
  distanceMinGPS: 0.005,   // km minimum entre 2 points GPS
} as const

// Informations légales
export const LEGAL = {
  societe: 'Wafa Assurance',
  agrement: 'ACAPS',
  loi: 'CNDP Loi 09-08',
  hebergement: 'Europe (Frankfurt)',
  annee: 2026,
} as const

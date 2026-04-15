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
  seuilFreinageBrusque: 9.0,     // ville (m/s²)
  seuilFreinageRoute: 8.5,       // route nationale
  seuilFreinageAutoroute: 7.5,   // autoroute
  seuilUrgence: 12.0,            // freinage d'urgence tous types
  seuilAccelVille: 8.0,          // accélération brusque ville
  seuilAccelRoute: 7.0,          // accélération brusque route
  seuilAccelAutoroute: 6.0,      // accélération brusque autoroute
  toleranceVille: 5,             // km/h tolérance excès ville
  toleranceRoute: 8,             // km/h tolérance excès route
  toleranceAutoroute: 10,        // km/h tolérance excès autoroute
  nocturneDebut: 22,             // heure début nocturne
  nocturneFin: 5,                // heure fin nocturne
  trajetMinKm: 0.5,              // km minimum trajet valide
  trajetMinDuration: 120,        // secondes minimum trajet valide
  referenceClassique: 500,       // MAD prime assurance classique



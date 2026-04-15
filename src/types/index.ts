// ============================================
// TYPES TYPESCRIPT — DriveScore by Wafa
// Source unique de vérité pour tous les types
// ============================================

// --- UTILISATEUR ---
export interface Profile {
  id: string
  pseudo_id: string
  prenom: string
  nom: string
  telephone?: string
  role: 'client' | 'admin'
  consentement_gps: boolean
  consentement_marketing: boolean
  afficher_leaderboard: boolean
  avatar_url?: string
  created_at?: string
}

// --- TRAJET ---
export interface Trajet {
  id?: string
  pseudo_id: string
  contrat_id?: string
  date_trajet: string
  gps_points?: { lat: number; lng: number; speed: number; timestamp: number }[]
  km: number
  type_route: 'ville' | 'route' | 'autoroute' | 'mixte'
  vitesse_moyenne?: number
  vitesse_max?: number
  freinages_brusques: number
  accelerations_brusques?: number
  exces_vitesse_count?: number
  conduite_nocturne: boolean
  score_trajet: number
  cout_mad: number
  ville_depart?: string
  ville_arrivee?: string
  created_at?: string
}

// --- TÉLÉMATIQUE ---
export interface GpsPoint {
  lat: number
  lng: number
  speed: number
  timestamp: number
  accuracy: number
}

export interface AccelEvent {
  type: 'freinage' | 'acceleration' | 'virage'
  magnitude: number
  timestamp: number
  lat?: number
  lng?: number
}

export type TelematicsPhase =
  | 'idle'
  | 'requesting'
  | 'running'
  | 'stopped'
  | 'saving'
  | 'saved'

// --- SCORING ---
export interface ScoreResult {
  score: number
  freinages: number
  accelerations: number
  exces: number
  speedMax: number
}

// --- BADGE ---
export interface Badge {
  icon: string
  label: string
  desc: string
  level: string
  color: string
  bg: string
}

// --- LEADERBOARD ---
export interface Driver {
  pseudo_id: string
  prenom: string
  nom: string
  score: number
  km: number
  trajets: number
  badge: string
}

// --- FACTURE ---
export interface Facture {
  base: number
  km: number
  coutKm: number
  reduction: number
  total: number
  mois: string
}

// --- CONSENTEMENT ---
export interface Consentement {
  user_id: string
  type_consentement: 'traitement_donnees' | 'geolocalisation' | 'marketing'
  accorde: boolean
  date_accord: string
}

// --- VITESSE ---
export interface SpeedLimit {
  limite: number
  source: 'osm' | 'intelligent'
  type_route: string
}

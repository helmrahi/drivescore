// ============================================
// DÉTECTION LIMITE DE VITESSE
// OpenStreetMap + Règles intelligentes
// ============================================

export interface SpeedLimit {
  limite: number
  source: 'osm' | 'intelligent'
  type_route: string
}

// Cache pour éviter trop de requêtes
const cache = new Map<string, SpeedLimit>()

// Arrondir position pour cache (100m de précision)
function cacheKey(lat: number, lng: number): string {
  return `${Math.round(lat * 1000) / 1000},${Math.round(lng * 1000) / 1000}`
}

// Règles intelligentes basées sur vitesse et contexte
export function limiteIntelligente(vitesseMoyenne: number): SpeedLimit {
  // Limites fixes par défaut — ne pas se baser sur la vitesse actuelle
  // car cela créerait un biais : plus on va vite, plus la limite estimée monte
  if (vitesseMoyenne > 100) return { limite: 120, source: 'intelligent', type_route: 'Autoroute' }
  if (vitesseMoyenne > 70) return { limite: 80, source: 'intelligent', type_route: 'Route nationale' }
  // En ville par défaut — limite 50 km/h
  return { limite: 50, source: 'intelligent', type_route: 'Ville' }
}

// Requête OpenStreetMap pour limite réelle
export async function getLimiteOSM(lat: number, lng: number): Promise<SpeedLimit | null> {
  const key = cacheKey(lat, lng)
  
  // Vérifier le cache d'abord
  if (cache.has(key)) return cache.get(key)!

  try {
    const query = `
      [out:json][timeout:3];
      way(around:15,${lat},${lng})["maxspeed"];
      out tags;
    `
    const response = await fetch(
      `https://overpass.kumi.systems/api/interpreter?data=${encodeURIComponent(query)}`,
      { signal: AbortSignal.timeout(3000) }
    )
    
    if (!response.ok) return null
    
    const data = await response.json()
    
    if (data.elements && data.elements.length > 0) {
      const maxspeed = data.elements[0].tags?.maxspeed
      if (maxspeed) {
        const limite = parseInt(maxspeed.replace(/[^0-9]/g, ''))
        if (!isNaN(limite) && limite > 0) {
          const result: SpeedLimit = {
            limite,
            source: 'osm',
            type_route: data.elements[0].tags?.highway || 'route'
          }
          cache.set(key, result)
          return result
        }
      }
    }
  } catch {
    // Si erreur réseau, on utilise les règles intelligentes
  }
  
  return null
}

// Fonction principale — combine OSM + règles intelligentes
export async function getLimiteVitesse(
  lat: number,
  lng: number,
  vitesseMoyenne: number
): Promise<SpeedLimit> {
  // Essayer OSM en premier
  const osm = await getLimiteOSM(lat, lng)
  if (osm) return osm
  
  // Fallback règles intelligentes
  return limiteIntelligente(vitesseMoyenne)
}

// Détermine le type de route selon vitesse GPS + type OSM
export function detecterTypeRoute(vitesseKmh: number, typeOSM?: string): 'ville' | 'route' | 'autoroute' {
  const type = typeOSM?.toLowerCase() || ''
  if (type.includes('motorway') || type.includes('trunk')) return 'autoroute'
  if (type.includes('primary') || type.includes('secondary')) return 'route'
  if (type.includes('residential') || type.includes('living_street')) return 'ville'
  // Fallback vitesse GPS
  if (vitesseKmh > 90) return 'autoroute'
  if (vitesseKmh > 60) return 'route'
  return 'ville'
}

// Tolérance selon type de route
export function getToleranceVitesse(typeRoute: 'ville' | 'route' | 'autoroute'): number {
  if (typeRoute === 'autoroute') return 10
  if (typeRoute === 'route') return 8
  return 5
}

// Seuil freinage selon type de route
export function getSeuilFreinage(typeRoute: 'ville' | 'route' | 'autoroute'): number {
  if (typeRoute === 'autoroute') return 7.5
  if (typeRoute === 'route') return 8.5
  return 9.0
}

// Seuil accélération selon type de route
export function getSeuilAcceleration(typeRoute: 'ville' | 'route' | 'autoroute'): number {
  if (typeRoute === 'autoroute') return 6.0
  if (typeRoute === 'route') return 7.0
  return 8.0
}

// Vérifie si en excès de vitesse avec tolérance intelligente
export function estEnExces(vitesseActuelle: number, limite: number, typeRoute?: 'ville' | 'route' | 'autoroute'): boolean {
  // Filtre anti faux positifs OSM autoroute
  if (vitesseActuelle > 90 && limite < 80) return false
  // Filtre anti faux positifs — ignorer limites aberrantes
  if (limite <= 0 || limite > 200) return false
  const tolerance = getToleranceVitesse(typeRoute || 'ville')
  const enExces = vitesseActuelle > limite + tolerance
  return enExces
}

// Message d'alerte
export function messageAlerte(vitesseActuelle: number, limite: number): string {
  const exces = vitesseActuelle - limite
  if (exces > 30) return `🚨 DANGER : +${exces} km/h au-dessus de la limite !`
  if (exces > 15) return `⚠️ Attention : +${exces} km/h au-dessus de ${limite} km/h`
  return `📍 Limite : ${limite} km/h — Ralentissez`
}

// Calcule la pénalité excès selon gravité
export function penaliteExces(vitesseActuelle: number, limite: number): number {
  const exces = vitesseActuelle - limite
  if (exces > 15) return 7
  return 3
}

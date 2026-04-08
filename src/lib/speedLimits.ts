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
  if (vitesseMoyenne < 35) return { limite: 40, source: 'intelligent', type_route: 'Zone urbaine' }
  if (vitesseMoyenne < 55) return { limite: 50, source: 'intelligent', type_route: 'Ville' }
  if (vitesseMoyenne < 80) return { limite: 80, source: 'intelligent', type_route: 'Route' }
  if (vitesseMoyenne < 100) return { limite: 100, source: 'intelligent', type_route: 'Route nationale' }
  return { limite: 120, source: 'intelligent', type_route: 'Autoroute' }
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

// Vérifie si en excès de vitesse
export function estEnExces(vitesseActuelle: number, limite: number): boolean {
  return vitesseActuelle > limite + 5 // 5 km/h de tolérance
}

// Message d'alerte
export function messageAlerte(vitesseActuelle: number, limite: number): string {
  const exces = vitesseActuelle - limite
  if (exces > 30) return `🚨 DANGER : +${exces} km/h au-dessus de la limite !`
  if (exces > 15) return `⚠️ Attention : +${exces} km/h au-dessus de ${limite} km/h`
  return `📍 Limite : ${limite} km/h — Ralentissez`
}

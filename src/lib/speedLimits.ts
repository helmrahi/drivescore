// ============================================
// SPEED LIMITS — DriveScore
// Détection limite vitesse OSM + règles intelligentes
// ============================================

export interface SpeedLimit {
  limite: number
  source: 'osm' | 'intelligent'
  type_route: string
}

const cache = new Map<string, SpeedLimit>()

function cacheKey(lat: number, lng: number): string {
  return `${Math.round(lat * 500) / 500},${Math.round(lng * 500) / 500}`
}

// Limite par défaut si OSM échoue — ne pas baser sur vitesse actuelle
export function limiteIntelligente(vitesseActuelle: number): SpeedLimit {
  if (vitesseActuelle > 100) return { limite: 120, source: 'intelligent', type_route: 'motorway' }
  if (vitesseActuelle > 70) return { limite: 80, source: 'intelligent', type_route: 'primary' }
  return { limite: 50, source: 'intelligent', type_route: 'residential' }
}

// Type route depuis OSM highway tag
export function detecterTypeRoute(vitesse: number, typeOSM?: string): 'ville' | 'route' | 'autoroute' {
  const t = (typeOSM || '').toLowerCase()
  if (t.includes('motorway') || t.includes('trunk')) return 'autoroute'
  if (t.includes('primary') || t.includes('secondary') || t.includes('tertiary')) return 'route'
  if (t.includes('residential') || t.includes('living') || t.includes('service')) return 'ville'
  // Fallback vitesse
  if (vitesse > 90) return 'autoroute'
  if (vitesse > 60) return 'route'
  return 'ville'
}

// Tolérance par type route — specs validées
export function getToleranceVitesse(type: 'ville' | 'route' | 'autoroute'): number {
  if (type === 'autoroute') return 10
  if (type === 'route') return 8
  return 5
}

export function getSeuilFreinage(type: 'ville' | 'route' | 'autoroute'): number {
  if (type === 'autoroute') return 7.5
  if (type === 'route') return 8.5
  return 9.0
}

export function getSeuilAcceleration(type: 'ville' | 'route' | 'autoroute'): number {
  if (type === 'autoroute') return 6.0
  if (type === 'route') return 7.0
  return 8.0
}

// Requête OSM
export async function getLimiteOSM(lat: number, lng: number): Promise<SpeedLimit | null> {
  const key = cacheKey(lat, lng)
  if (cache.has(key)) return cache.get(key)!
  try {
    const query = `[out:json][timeout:3];way(around:35,${lat},${lng})["maxspeed"];out tags;`
    const response = await fetch(
      `https://overpass.kumi.systems/api/interpreter?data=${encodeURIComponent(query)}`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!response.ok) return null
    const data = await response.json()
    if (data.elements?.length > 0) {
      const maxspeed = data.elements[0].tags?.maxspeed
      if (maxspeed) {
        const limite = parseInt(maxspeed.replace(/[^0-9]/g, ''))
        if (!isNaN(limite) && limite > 0 && limite <= 200) {
          const result: SpeedLimit = {
            limite,
            source: 'osm',
            type_route: data.elements[0].tags?.highway || 'residential',
          }
          cache.set(key, result)
          return result
        }
      }
    }
  } catch {}
  return null
}

// Fonction principale
export async function getLimiteVitesse(lat: number, lng: number, vitesse: number): Promise<SpeedLimit> {
  const osm = await getLimiteOSM(lat, lng)
  if (osm) {
    // Filtre anti faux positifs autoroute
    if (vitesse > 90 && osm.limite < 80) return limiteIntelligente(vitesse)
    return osm
  }
  return limiteIntelligente(vitesse)
}

// Vérification excès
export function estEnExces(vitesse: number, limite: number, type: 'ville' | 'route' | 'autoroute'): boolean {
  if (limite <= 0 || limite > 200) return false
  if (vitesse > 90 && limite < 80) return false
  const tolerance = getToleranceVitesse(type)
  return vitesse > limite + tolerance
}

// Gravité excès
export function excesGrave(vitesse: number, limite: number, type: 'ville' | 'route' | 'autoroute'): boolean {
  const tolerance = getToleranceVitesse(type)
  return vitesse > limite + tolerance + 15
}

export function messageAlerte(vitesse: number, limite: number): string {
  const exces = vitesse - limite
  if (exces > 30) return `🚨 DANGER : +${exces} km/h au-dessus de la limite !`
  if (exces > 15) return `⚠️ Attention : +${exces} km/h au-dessus de ${limite} km/h`
  return `📍 Limite : ${limite} km/h — Ralentissez`
}

export function penaliteExces(vitesse: number, limite: number): number {
  const exces = vitesse - limite
  return exces > 15 ? 7 : 3
}

import { useEffect, useRef } from 'react'

interface GpsPoint {
  lat: number
  lng: number
  speed: number
  timestamp: number
}

interface Props {
  points: GpsPoint[]
  speedMax?: number
  incidents?: { lat: number; lng: number; type: 'freinage' | 'exces' | 'acceleration' }[]
  height?: number
  interactive?: boolean
}

function getSpeedColor(speed: number, speedMax: number): string {
  if (speedMax === 0) return '#2E7D32'
  const ratio = speed / Math.max(speedMax, 1)
  if (ratio < 0.4) return '#16A34A'   // Vert — lent
  if (ratio < 0.6) return '#65A30D'   // Vert clair
  if (ratio < 0.75) return '#D97706'  // Orange — modéré
  if (ratio < 0.9) return '#EA580C'   // Orange foncé — rapide
  return '#DC2626'                     // Rouge — très rapide
}

export default function TrajetMapStrava({ points, speedMax = 0, incidents = [], height = 220, interactive = false }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || points.length === 0) return
    if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null }

    import('leaflet').then(L => {
      delete (L.Icon.Default.prototype as any)._getIconUrl

      const map = L.map(mapRef.current!, {
        zoomControl: interactive,
        dragging: interactive,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: interactive,
        attributionControl: false,
      })

      // Tuiles sombres style Strava
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map)

      // Tracé coloré par vitesse — segment par segment
      const maxSpeed = speedMax || Math.max(...points.map(p => p.speed), 1)

      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i]
        const p2 = points[i + 1]
        const color = getSpeedColor((p1.speed + p2.speed) / 2, maxSpeed)
        L.polyline(
          [[p1.lat, p1.lng], [p2.lat, p2.lng]],
          { color, weight: 4, opacity: 0.9 }
        ).addTo(map)
      }

      // Marqueur départ — vert
      const startIcon = L.divIcon({
        html: `<div style="background:#16A34A;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>`,
        className: '', iconSize: [14, 14], iconAnchor: [7, 7],
      })
      L.marker([points[0].lat, points[0].lng], { icon: startIcon })
        .addTo(map).bindPopup('🟢 Départ')

      // Marqueur arrivée — rouge
      const endIcon = L.divIcon({
        html: `<div style="background:#DC2626;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>`,
        className: '', iconSize: [14, 14], iconAnchor: [7, 7],
      })
      const last = points[points.length - 1]
      L.marker([last.lat, last.lng], { icon: endIcon })
        .addTo(map).bindPopup('🔴 Arrivée')

      // Marqueurs incidents
      incidents.forEach(inc => {
        const color = inc.type === 'freinage' ? '#EF4444' : inc.type === 'exces' ? '#F97316' : '#FBBF24'
        const emoji = inc.type === 'freinage' ? '🛑' : inc.type === 'exces' ? '🚨' : '⚡'
        const icon = L.divIcon({
          html: `<div style="background:${color};width:20px;height:20px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:10px">${emoji}</div>`,
          className: '', iconSize: [20, 20], iconAnchor: [10, 10],
        })
        L.marker([inc.lat, inc.lng], { icon })
          .addTo(map)
          .bindPopup(inc.type === 'freinage' ? '🛑 Freinage brusque' : inc.type === 'exces' ? '🚨 Excès de vitesse' : '⚡ Accélération brusque')
      })

      // Ajuster la vue
      const latlngs = points.map(p => [p.lat, p.lng] as [number, number])
      map.fitBounds(latlngs, { padding: [16, 16] })

      mapInstance.current = map
    })

    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null }
    }
  }, [points])

  if (points.length === 0) return null

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
      <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', height }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

        {/* Légende vitesse */}
        <div style={{
          position: 'absolute', bottom: 8, right: 8,
          background: 'rgba(0,0,0,0.75)', borderRadius: 8,
          padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: 3,
        }}>
          {[
            { color: '#16A34A', label: 'Lent' },
            { color: '#D97706', label: 'Modéré' },
            { color: '#DC2626', label: 'Rapide' },
          ].map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 24, height: 3, background: l.color, borderRadius: 2 }} />
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)' }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Nb points GPS */}
        <div style={{
          position: 'absolute', top: 8, left: 8,
          background: 'rgba(0,0,0,0.6)', borderRadius: 6,
          padding: '3px 8px', fontSize: 10, color: 'rgba(255,255,255,0.8)',
        }}>
          📍 {points.length} points GPS
        </div>
      </div>
    </>
  )
}

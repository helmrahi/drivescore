import { useEffect, useRef } from 'react'

interface GpsPoint {
  lat: number
  lng: number
  speed: number
  timestamp: number
  accuracy: number
}

interface Props {
  points: GpsPoint[]
}

export default function TrajetMap({ points }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || points.length === 0) return
    if (mapInstance.current) {
      mapInstance.current.remove()
      mapInstance.current = null
    }

    import('leaflet').then(L => {
      // Fix icônes Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!).setView(
        [points[0].lat, points[0].lng], 14
      )

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map)

      // Tracé du trajet
      const latlngs = points.map(p => [p.lat, p.lng] as [number, number])
      L.polyline(latlngs, {
        color: '#2E7D32',
        weight: 4,
        opacity: 0.8,
      }).addTo(map)

      // Marqueur départ
      const startIcon = L.divIcon({
        html: '<div style="background:#2E7D32;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
        className: '',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })
      L.marker([points[0].lat, points[0].lng], { icon: startIcon })
        .addTo(map)
        .bindPopup('🟢 Départ')

      // Marqueur arrivée
      const endIcon = L.divIcon({
        html: '<div style="background:#DC2626;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
        className: '',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })
      const last = points[points.length - 1]
      L.marker([last.lat, last.lng], { icon: endIcon })
        .addTo(map)
        .bindPopup('🔴 Arrivée')

      // Ajuster la vue sur le trajet
      map.fitBounds(latlngs, { padding: [20, 20] })

      mapInstance.current = map
    })

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [points])

  if (points.length === 0) return null

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
      <div style={{ marginBottom: 16, borderRadius: 16, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
        <div style={{ background: '#F8FAFC', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>🗺️</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Carte du trajet</span>
          <span style={{ fontSize: 11, color: '#94A3B8', marginLeft: 'auto' }}>{points.length} points GPS</span>
        </div>
        <div ref={mapRef} style={{ height: 220, width: '100%' }} />
      </div>
    </>
  )
}

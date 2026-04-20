import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import TrajetMapStrava from '../components/TrajetMapStrava'

const C = {
  greenDeep: '#0D2E1C', greenMid: '#1E5C35', greenAccent: '#2A8A50', greenBright: '#3EBD6F',
  amber: '#F5A623', amberLight: '#FDF0D5', amberDark: '#8B5E00',
  red: '#E5403A', redLight: '#FDEAEA',
  white: '#FFFFFF', surface: '#F7F8F6', surface2: '#EDEFEB',
  textPrimary: '#0D1F16', textSecondary: '#4A6355', textTertiary: '#8AA898',
  border: 'rgba(13,46,28,0.08)',
  fontSans: "'DM Sans', sans-serif", fontMono: "'DM Mono', monospace",
}

function scColor(s: number) {
  if (s >= 90) return C.greenBright
  if (s >= 80) return C.greenAccent
  if (s >= 70) return C.amber
  return C.red
}

function scLabel(s: number) {
  if (s >= 90) return 'Excellent conducteur 🏅'
  if (s >= 80) return 'Bon conducteur ✅'
  if (s >= 70) return 'Conducteur moyen ⚠️'
  return 'En progression 💪'
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr`)
    const d = await r.json()
    return d.address?.city || d.address?.town || d.address?.village || d.address?.county || 'Inconnu'
  } catch { return 'Inconnu' }
}

export default function TrajetPublic() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trajet, setTrajet] = useState<any>(null)
  const [conducteur, setConducteur] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [adresseDepart, setAdresseDepart] = useState('')
  const [adresseArrivee, setAdresseArrivee] = useState('')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    load()
  }, [id])

  async function load() {
    const { data: t } = await supabase.from('trajets').select('*').eq('id', id).single()
    if (!t) { setNotFound(true); setLoading(false); return }
    setTrajet(t)

    // Charger conducteur
    const { data: p } = await supabase.from('profiles').select('prenom, nom').eq('pseudo_id', t.pseudo_id).single()
    if (p) setConducteur(p)

    // Reverse geocoding
    const pts = t.gps_points || []
    if (pts.length > 0) {
      const first = pts[0]
      const last = pts[pts.length - 1]
      const [dep, arr] = await Promise.all([
        reverseGeocode(first.lat, first.lng),
        reverseGeocode(last.lat, last.lng)
      ])
      setAdresseDepart(dep)
      setAdresseArrivee(arr)
    } else {
      setAdresseDepart(t.ville_depart || 'Départ')
      setAdresseArrivee(t.ville_arrivee || 'Arrivée')
    }

    setLoading(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.greenDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: C.fontSans }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: `2px solid ${C.greenBright}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ color: 'white', fontSize: 13 }}>Chargement du trajet...</div>
      </div>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: C.greenDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: C.fontSans, padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: 'white', marginBottom: 8 }}>Trajet introuvable</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>Ce trajet n'existe pas ou a été supprimé</div>
        <button onClick={() => navigate('/login')} style={{ padding: '12px 24px', borderRadius: 12, background: C.greenMid, color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: C.fontSans }}>
          Accéder à DriveScore
        </button>
      </div>
    </div>
  )

  const score = trajet.score_trajet || 0
  const pts = trajet.gps_points || []
  const hasMap = pts.length > 1
  const circumference = 2 * Math.PI * 33
  const scoreOffset = circumference - (circumference * score / 100)
  const prenomInitiale = conducteur ? `${conducteur.prenom} ${conducteur.nom?.charAt(0) || ''}.` : 'Conducteur'

  return (
    <div style={{ minHeight: '100vh', background: C.surface, fontFamily: C.fontSans }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* HERO */}
      <div style={{ background: C.greenDeep, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'radial-gradient(circle,rgba(62,189,111,0.18) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.greenBright }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>DriveScore · Wafa Assurance</span>
          </div>
          <div style={{ background: 'rgba(62,189,111,0.15)', border: '0.5px solid rgba(62,189,111,0.3)', borderRadius: 20, padding: '3px 10px', fontSize: 10, color: C.greenBright, fontWeight: 600 }}>
            TRAJET PARTAGÉ
          </div>
        </div>

        <div style={{ padding: '16px 20px 24px', display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 1 }}>
          {/* Score ring */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <svg width="82" height="82" viewBox="0 0 82 82" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="41" cy="41" r="33" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6"/>
              <circle cx="41" cy="41" r="33" fill="none" stroke={C.amber} strokeWidth="6"
                strokeDasharray={circumference} strokeDashoffset={scoreOffset} strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease' }}/>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: 'white', fontFamily: C.fontMono, lineHeight: 1 }}>{score}</span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>/100</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Trajet de</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: 'white', letterSpacing: '-0.3px', marginBottom: 8 }}>{prenomInitiale}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(62,189,111,0.15)', border: '0.5px solid rgba(62,189,111,0.3)', borderRadius: 20, padding: '4px 10px' }}>
              <span style={{ fontSize: 12, color: C.greenBright, fontWeight: 600 }}>{scLabel(score)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CARTE */}
      {hasMap ? (
        <div style={{ position: 'relative' }}>
          <TrajetMapStrava
            points={pts}
            speedMax={trajet.vitesse_max || 0}
            incidents={[]}
            height={220}
            interactive={true}
          />
          {/* Overlay adresses */}
          <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
            <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.greenAccent, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: C.textPrimary, fontWeight: 600 }}>{adresseDepart}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.red, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: C.textPrimary, fontWeight: 600 }}>{adresseArrivee}</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ height: 140, background: C.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 28 }}>🗺️</div>
          <div style={{ fontSize: 13, color: C.textTertiary }}>
            {adresseDepart && adresseArrivee ? `${adresseDepart} → ${adresseArrivee}` : 'Carte non disponible'}
          </div>
        </div>
      )}

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, animation: 'fadeUp 0.4s ease' }}>

        {/* Adresses texte si carte disponible */}
        {hasMap && adresseDepart && adresseArrivee && (
          <div style={{ background: C.white, borderRadius: 14, padding: '12px 14px', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.greenAccent, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{adresseDepart}</span>
              </div>
              <div style={{ width: 1, height: 12, background: C.border, marginLeft: 4 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.red, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{adresseArrivee}</span>
              </div>
            </div>
            <div style={{ fontSize: 13, color: C.textTertiary, flexShrink: 0 }}>{Number(trajet.km).toFixed(2)} km</div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { val: Number(trajet.km).toFixed(1), unit: 'km', label: 'Distance', color: C.blue },
            { val: String(trajet.vitesse_max || 0), unit: 'km/h', label: 'Vitesse max', color: C.amber },
            { val: Number(trajet.cout_mad).toFixed(2), unit: 'MAD', label: 'Coût', color: C.greenAccent },
          ].map((s, i) => (
            <div key={i} style={{ background: C.white, borderRadius: 12, padding: '12px', textAlign: 'center', border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.color, fontFamily: C.fontMono }}>{s.val}</div>
              <div style={{ fontSize: 9, color: C.textTertiary }}>{s.unit}</div>
              <div style={{ fontSize: 10, color: C.textSecondary, marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Incidents */}
        <div style={{ background: C.white, borderRadius: 12, padding: '12px 14px', border: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.3px' }}>INCIDENTS</span>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { val: trajet.freinages_brusques || 0, icon: '🛑', label: 'Frein.' },
              { val: trajet.accelerations_brusques || 0, icon: '⚡', label: 'Accél.' },
              { val: trajet.exces_vitesse_count || 0, icon: '🚨', label: 'Excès' },
            ].map((inc, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: inc.val > 0 ? C.red : C.greenAccent, fontFamily: C.fontMono }}>{inc.val}</div>
                <div style={{ fontSize: 9, color: C.textTertiary }}>{inc.icon} {inc.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
          <span style={{ background: C.surface2, borderRadius: 20, padding: '5px 12px', fontSize: 11, color: C.textSecondary }}>📅 {trajet.date_trajet}</span>
          <span style={{ background: C.surface2, borderRadius: 20, padding: '5px 12px', fontSize: 11, color: C.textSecondary }}>🛣️ {trajet.type_route}</span>
          {trajet.conduite_nocturne && <span style={{ background: C.surface2, borderRadius: 20, padding: '5px 12px', fontSize: 11, color: C.textSecondary }}>🌙 Nocturne</span>}
          {(trajet.freinages_brusques || 0) === 0 && (trajet.exces_vitesse_count || 0) === 0 && (
            <span style={{ background: 'rgba(62,189,111,0.1)', borderRadius: 20, padding: '5px 12px', fontSize: 11, color: C.greenMid, fontWeight: 500 }}>✓ Aucun incident</span>
          )}
        </div>

        {/* CTAs */}
        <button onClick={() => navigate('/inscription')} style={{ width: '100%', padding: '14px', borderRadius: 14, background: C.greenMid, color: 'white', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: C.fontSans, boxShadow: '0 4px 16px rgba(30,92,53,0.25)' }}>
          🚗 Essayer DriveScore gratuitement
        </button>
        <button onClick={() => navigate('/login')} style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'transparent', border: `1px solid ${C.border}`, color: C.textSecondary, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: C.fontSans }}>
          Se connecter pour voir mes trajets
        </button>

        <p style={{ textAlign: 'center', fontSize: 10, color: C.textTertiary, lineHeight: 1.6 }}>
          DriveScore by Wafa Assurance · Conforme CNDP (Loi 09-08) · © 2026
        </p>
      </div>
    </div>
  )
}

const C_blue = '#2D7DD2'

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const WAFA = {
  vert: '#2E7D32', vertDark: '#1B5E20', or: '#F5A623',
  orDark: '#D4891A', orLight: '#FDF3E0', noir: '#0F172A',
  gris: '#F8FAFC', grisMid: '#E2E8F0',
}

function getScoreColor(s: number) {
  if (s >= 90) return '#16A34A'
  if (s >= 80) return '#2E7D32'
  if (s >= 70) return '#D97706'
  return '#DC2626'
}

function getScoreBg(s: number) {
  if (s >= 90) return '#F0FDF4'
  if (s >= 80) return '#DCFCE7'
  if (s >= 70) return '#FEF3C7'
  return '#FEF2F2'
}

function MiniMap({ trajet }: { trajet: any }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current) return
    if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null }

    import('leaflet').then(L => {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      const map = L.map(mapRef.current!, {
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        attributionControl: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

      if (trajet.gps_points && trajet.gps_points.length > 1) {
        const latlngs = trajet.gps_points.map((p: any) => [p.lat, p.lng])
        L.polyline(latlngs, { color: WAFA.vert, weight: 3, opacity: 0.8 }).addTo(map)
        map.fitBounds(latlngs, { padding: [8, 8] })

        const startIcon = L.divIcon({ html: '<div style="background:#2E7D32;width:10px;height:10px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>', className: '', iconSize: [10, 10], iconAnchor: [5, 5] })
        const endIcon = L.divIcon({ html: '<div style="background:#DC2626;width:10px;height:10px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>', className: '', iconSize: [10, 10], iconAnchor: [5, 5] })
        L.marker(latlngs[0], { icon: startIcon }).addTo(map)
        L.marker(latlngs[latlngs.length - 1], { icon: endIcon }).addTo(map)
      } else {
        map.setView([33.5731, -7.5898], 12)
      }

      mapInstance.current = map
    })

    return () => { if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null } }
  }, [])

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
      <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: 12 }} />
    </>
  )
}

export default function Trajets() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ km: '', type_route: 'ville', ville_depart: '', ville_arrivee: '', conduite_nocturne: false, freinages_brusques: 0, exces_vitesse_count: 0 })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [trajets, setTrajets] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedTrajet, setSelectedTrajet] = useState<any>(null)

  const score = Math.max(0, 100 - form.freinages_brusques * 3 - form.exces_vitesse_count * 5 - (form.conduite_nocturne ? 5 : 0))

  useEffect(() => { loadTrajets() }, [success])

  async function loadTrajets() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase.from('profiles').select('pseudo_id').eq('id', user.id).single()
    if (profile) {
      const { data } = await supabase.from('trajets').select('*').eq('pseudo_id', profile.pseudo_id).order('created_at', { ascending: false }).limit(20)
      setTrajets(data || [])
    }
  }

  async function soumettre(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/login'); return }
    const { data: profile } = await supabase.from('profiles').select('pseudo_id').eq('id', user.id).single()
    if (profile) {
      const km = parseFloat(form.km)
      await supabase.from('trajets').insert({
        pseudo_id: profile.pseudo_id, km,
        type_route: form.type_route,
        ville_depart: form.ville_depart,
        ville_arrivee: form.ville_arrivee,
        conduite_nocturne: form.conduite_nocturne,
        freinages_brusques: form.freinages_brusques,
        exces_vitesse_count: form.exces_vitesse_count,
        score_trajet: score,
        cout_mad: parseFloat((km * 0.5).toFixed(2)),
        date_trajet: new Date().toISOString().split('T')[0]
      })
      setSuccess(true)
      setShowForm(false)
      setForm({ km: '', type_route: 'ville', ville_depart: '', ville_arrivee: '', conduite_nocturne: false, freinages_brusques: 0, exces_vitesse_count: 0 })
      setTimeout(() => setSuccess(false), 3000)
    }
    setLoading(false)
  }

  const totalKm = parseFloat(trajets.reduce((s, t) => s + (t.km || 0), 0).toFixed(2))
  const avgScore = trajets.length > 0 ? Math.round(trajets.reduce((s, t) => s + (t.score_trajet || 0), 0) / trajets.length) : 0
  const totalCout = parseFloat(trajets.reduce((s, t) => s + (t.cout_mad || 0), 0).toFixed(2))

  const formatDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  const formatDuration = (t: any) => {
    if (!t.vitesse_moyenne || t.vitesse_moyenne === 0 || !t.km) return null
    const mins = Math.round((t.km / t.vitesse_moyenne) * 60)
    if (mins < 60) return `${mins} min`
    return `${Math.floor(mins/60)}h${mins%60 > 0 ? mins%60 : ''}` 
  }

  return (
    <div style={{ minHeight: '100vh', background: WAFA.gris, fontFamily: 'Inter,sans-serif', paddingBottom: 80 }}>

      {/* HEADER */}
      <header style={{ background: `linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: 'white', fontWeight: 800, fontSize: 17 }}>📋 Mes Trajets</div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: WAFA.or, border: 'none', color: WAFA.noir, borderRadius: 10, padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          {showForm ? '✕ Fermer' : '+ Déclarer'}
        </button>
      </header>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '12px 16px' }}>

        {success && (
          <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 12, padding: '12px 16px', marginBottom: 12, color: WAFA.vert, fontWeight: 600, fontSize: 14, textAlign: 'center' }}>
            ✅ Trajet enregistré — Score : {score}/100
          </div>
        )}

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Total km', value: `${totalKm}`, unit: 'km', color: '#3B82F6' },
            { label: 'Score moy.', value: `${avgScore}`, unit: '/100', color: getScoreColor(avgScore) },
            { label: 'Coût total', value: `${totalCout}`, unit: 'MAD', color: WAFA.orDark },
          ].map((s, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 12, padding: '10px 12px', textAlign: 'center', border: `0.5px solid ${WAFA.grisMid}` }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}<span style={{ fontSize: 10 }}> {s.unit}</span></div>
              <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* FORMULAIRE */}
        {showForm && (
          <div style={{ background: 'white', borderRadius: 16, padding: '16px', marginBottom: 14, border: `0.5px solid ${WAFA.grisMid}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1, background: getScoreBg(score), borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: getScoreColor(score) }}>{score}<span style={{ fontSize: 12 }}>/100</span></div>
                <div style={{ fontSize: 10, color: '#64748B' }}>Score estimé</div>
              </div>
              {form.km && (
                <div style={{ flex: 1, background: WAFA.orLight, borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: WAFA.orDark }}>{(parseFloat(form.km||'0') * 0.5).toFixed(2)}</div>
                  <div style={{ fontSize: 10, color: '#64748B' }}>MAD estimé</div>
                </div>
              )}
            </div>

            <form onSubmit={soumettre} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94A3B8', marginBottom: 4, letterSpacing: '0.05em' }}>KILOMÈTRES *</label>
                <input type="number" required min="1" placeholder="Ex: 45" value={form.km}
                  onChange={e => setForm(f => ({ ...f, km: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${WAFA.grisMid}`, fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94A3B8', marginBottom: 6 }}>TYPE DE ROUTE</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                  {[{ id: 'ville', label: '🏙️ Ville' }, { id: 'route', label: '🛣️ Route' }, { id: 'autoroute', label: '🚀 Auto' }, { id: 'mixte', label: '🔀 Mixte' }].map(t => (
                    <button key={t.id} type="button" onClick={() => setForm(f => ({ ...f, type_route: t.id }))}
                      style={{ padding: '8px 4px', borderRadius: 8, border: `2px solid ${form.type_route === t.id ? WAFA.vert : WAFA.grisMid}`, background: form.type_route === t.id ? '#F0FDF4' : 'white', color: form.type_route === t.id ? WAFA.vert : '#64748B', fontWeight: 600, fontSize: 11, cursor: 'pointer' }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94A3B8', marginBottom: 4 }}>DÉPART</label>
                  <input placeholder="Casablanca" value={form.ville_depart}
                    onChange={e => setForm(f => ({ ...f, ville_depart: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${WAFA.grisMid}`, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94A3B8', marginBottom: 4 }}>ARRIVÉE</label>
                  <input placeholder="Rabat" value={form.ville_arrivee}
                    onChange={e => setForm(f => ({ ...f, ville_arrivee: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${WAFA.grisMid}`, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ background: '#FFF7ED', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: WAFA.orDark, marginBottom: 10 }}>⚠️ Incidents</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: '🛑 Freinages brusques', key: 'freinages_brusques', pts: -3 },
                    { label: '🚨 Excès de vitesse', key: 'exces_vitesse_count', pts: -5 },
                  ].map((inc) => (
                    <div key={inc.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#374151' }}>{inc.label} <span style={{ color: '#EF4444' }}>({inc.pts} pts)</span></span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button type="button" onClick={() => setForm(f => ({ ...f, [inc.key]: Math.max(0, (f as any)[inc.key] - 1) }))}
                          style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${WAFA.grisMid}`, background: 'white', cursor: 'pointer', fontWeight: 700 }}>-</button>
                        <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{(form as any)[inc.key]}</span>
                        <button type="button" onClick={() => setForm(f => ({ ...f, [inc.key]: (f as any)[inc.key] + 1 }))}
                          style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${WAFA.grisMid}`, background: 'white', cursor: 'pointer', fontWeight: 700 }}>+</button>
                      </div>
                    </div>
                  ))}
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#374151', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.conduite_nocturne} onChange={e => setForm(f => ({ ...f, conduite_nocturne: e.target.checked }))} style={{ accentColor: WAFA.vert }} />
                    🌙 Conduite nocturne (-5 pts)
                  </label>
                </div>
              </div>

              <button type="submit" disabled={loading} style={{ padding: '14px', borderRadius: 12, background: `linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`, color: 'white', border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Enregistrement...' : `✅ Enregistrer — ${score}/100`}
              </button>
            </form>
          </div>
        )}

        {/* LISTE TRAJETS — style premium */}
        {trajets.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 16, padding: '40px 16px', textAlign: 'center', border: `0.5px solid ${WAFA.grisMid}` }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🛣️</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: WAFA.noir, marginBottom: 6 }}>Aucun trajet</div>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 20 }}>Démarrez votre premier trajet</div>
            <button onClick={() => navigate('/telematics')} style={{ background: WAFA.vert, color: 'white', border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              🚗 Lancer la télématique
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {trajets.map((t, i) => (
              <div key={i}
                onClick={() => setSelectedTrajet(selectedTrajet?.id === t.id ? null : t)}
                style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: `0.5px solid ${WAFA.grisMid}`, cursor: 'pointer', transition: 'all 0.2s' }}>

                {/* MINIATURE CARTE */}
                <div style={{ height: 100, background: '#E8F4E8', position: 'relative' }}>
                  <MiniMap trajet={t} />
                  {/* Overlay score */}
                  <div style={{ position: 'absolute', top: 8, right: 8, background: getScoreColor(t.score_trajet), color: 'white', borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 800, boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                    {t.score_trajet}/100
                  </div>
                  {/* Type route badge */}
                  <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: '3px 8px', fontSize: 11, fontWeight: 600, color: WAFA.noir }}>
                    {t.type_route === 'ville' ? '🏙️' : t.type_route === 'autoroute' ? '🚀' : '🛣️'} {t.type_route}
                  </div>
                </div>

                {/* INFOS TRAJET */}
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: WAFA.noir, marginBottom: 2 }}>
                        {t.ville_depart && t.ville_arrivee ? `${t.ville_depart} → ${t.ville_arrivee}` : `Trajet ${t.type_route}`}
                      </div>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>{formatDate(t.date_trajet)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: WAFA.orDark }}>{t.cout_mad} MAD</div>
                    </div>
                  </div>

                  {/* KPIs inline */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ background: WAFA.gris, borderRadius: 20, padding: '3px 8px', fontSize: 11, color: '#475569', fontWeight: 500 }}>
                      🛣️ {t.km} km
                    </span>
                    {t.vitesse_max > 0 && (
                      <span style={{ background: '#EFF6FF', borderRadius: 20, padding: '3px 8px', fontSize: 11, color: '#1D4ED8', fontWeight: 500 }}>
                        ⚡ {t.vitesse_max} km/h max
                      </span>
                    )}
                    {t.freinages_brusques > 0 && (
                      <span style={{ background: '#FEF2F2', borderRadius: 20, padding: '3px 8px', fontSize: 11, color: '#DC2626', fontWeight: 500 }}>
                        🛑 {t.freinages_brusques} freinage{t.freinages_brusques > 1 ? 's' : ''}
                      </span>
                    )}
                    {t.conduite_nocturne && (
                      <span style={{ background: '#F3F4F6', borderRadius: 20, padding: '3px 8px', fontSize: 11, color: '#374151', fontWeight: 500 }}>
                        🌙 Nocturne
                      </span>
                    )}
                    {formatDuration(t) && (
                      <span style={{ background: WAFA.gris, borderRadius: 20, padding: '3px 8px', fontSize: 11, color: '#475569', fontWeight: 500 }}>
                        ⏱️ {formatDuration(t)}
                      </span>
                    )}
                  </div>

                  {/* DÉTAIL ÉTENDU */}
                  {selectedTrajet?.id === t.id && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${WAFA.grisMid}` }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                        <div style={{ background: getScoreBg(t.score_trajet), borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                          <div style={{ fontSize: 24, fontWeight: 900, color: getScoreColor(t.score_trajet) }}>{t.score_trajet}/100</div>
                          <div style={{ fontSize: 10, color: '#64748B' }}>Score final</div>
                        </div>
                        <div style={{ background: WAFA.orLight, borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                          <div style={{ fontSize: 24, fontWeight: 900, color: WAFA.orDark }}>{t.cout_mad} MAD</div>
                          <div style={{ fontSize: 10, color: '#64748B' }}>Coût trajet</div>
                        </div>
                      </div>
                      {/* Coaching mini */}
                      <div style={{ background: WAFA.gris, borderRadius: 10, padding: '10px 12px', borderLeft: `3px solid ${getScoreColor(t.score_trajet)}` }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: getScoreColor(t.score_trajet), marginBottom: 3 }}>💡 Analyse</div>
                        <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>
                          {t.freinages_brusques > 3 ? `${t.freinages_brusques} freinages brusques — anticipez davantage les ralentissements.`
                            : t.score_trajet >= 90 ? 'Excellent trajet ! Continuez sur cette lancée.'
                            : t.vitesse_max > 110 ? `Vitesse max ${t.vitesse_max} km/h — respectez les limites.`
                            : 'Bonne conduite. Maintenez cette régularité.'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: `0.5px solid ${WAFA.grisMid}`, display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {[
          { icon: '🏠', label: 'Accueil', path: '/dashboard' },
          { icon: '🚗', label: 'Télématique', path: '/telematics' },
          { icon: '📋', label: 'Trajets', path: '/trajets' },
          { icon: '🏆', label: 'Classement', path: '/leaderboard' },
        ].map(item => {
          const isActive = location.pathname === item.path
          return (
            <button key={item.path} onClick={() => navigate(item.path)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer', color: isActive ? WAFA.vert : '#94A3B8' }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 400 }}>{item.label}</span>
              {isActive && <div style={{ width: 4, height: 4, borderRadius: '50%', background: WAFA.vert }} />}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

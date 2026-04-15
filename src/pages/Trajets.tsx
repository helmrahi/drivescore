import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import TrajetMapStrava from '../components/TrajetMapStrava'

const W = {
  vert: '#2E7D32', vertDark: '#1B5E20', vertLight: '#4CAF50',
  or: '#F5A623', orDark: '#D4891A', orLight: '#FDF3E0',
  noir: '#0F172A', gris: '#F8FAFC', grisMid: '#E2E8F0',
}

function sc(s: number) {
  if (s >= 90) return '#16A34A'
  if (s >= 80) return '#2E7D32'
  if (s >= 70) return '#D97706'
  return '#DC2626'
}

function scBg(s: number) {
  if (s >= 90) return '#F0FDF4'
  if (s >= 80) return '#DCFCE7'
  if (s >= 70) return '#FEF3C7'
  return '#FEF2F2'
}

function scLabel(s: number) {
  if (s >= 90) return 'Excellent'
  if (s >= 80) return 'Bon'
  if (s >= 70) return 'Moyen'
  return 'À améliorer'
}

function routeIcon(r: string) {
  if (r === 'autoroute') return '🛣️'
  if (r === 'ville') return '🏙️'
  if (r === 'mixte') return '🔀'
  return '🗺️'
}

function MiniMap({ trajet }: { trajet: any }) {
  const ref = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)

  useEffect(() => {
    if (!ref.current) return
    if (map.current) { map.current.remove(); map.current = null }
    import('leaflet').then(L => {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      const m = L.map(ref.current!, {
        zoomControl: false, dragging: false, scrollWheelZoom: false,
        doubleClickZoom: false, touchZoom: false, attributionControl: false,
      })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(m)
      if (trajet.gps_points?.length > 1) {
        const ll = trajet.gps_points.map((p: any) => [p.lat, p.lng])
        L.polyline(ll, { color: W.vert, weight: 4, opacity: 0.9 }).addTo(m)
        const di = (c: string) => L.divIcon({ html: `<div style="background:${c};width:12px;height:12px;border-radius:50%;border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`, className: '', iconSize: [12, 12], iconAnchor: [6, 6] })
        L.marker(ll[0], { icon: di(W.vert) }).addTo(m)
        L.marker(ll[ll.length-1], { icon: di('#DC2626') }).addTo(m)
        m.fitBounds(ll, { padding: [12, 12] })
      } else {
        m.setView([33.5731, -7.5898], 13)
      }
      map.current = m
    })
    return () => { if (map.current) { map.current.remove(); map.current = null } }
  }, [])

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
      <div ref={ref} style={{ width: '100%', height: '100%' }} />
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
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filtre, setFiltre] = useState<'tous' | 'incident' | 'nocturne' | 'parfait' | 'long'>('tous')

  const score = Math.max(0, 100 - form.freinages_brusques * 3 - form.exces_vitesse_count * 5 - (form.conduite_nocturne ? 5 : 0))

  useEffect(() => { load() }, [])
  useEffect(() => { if (success) load() }, [success])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: p } = await supabase.from('profiles').select('pseudo_id').eq('id', user.id).single()
    if (p) {
      const { data, error } = await supabase.from('trajets').select('*').eq('pseudo_id', p.pseudo_id).order('created_at', { ascending: false }).limit(30)
      console.log('Trajets chargés:', data?.length, 'pseudo_id:', p.pseudo_id, 'error:', error)
      setTrajets(data || [])
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/login'); return }
    const { data: p } = await supabase.from('profiles').select('pseudo_id').eq('id', user.id).single()
    if (p) {
      const km = parseFloat(form.km)
      await supabase.from('trajets').insert({
        pseudo_id: p.pseudo_id, km, type_route: form.type_route,
        ville_depart: form.ville_depart, ville_arrivee: form.ville_arrivee,
        conduite_nocturne: form.conduite_nocturne,
        freinages_brusques: form.freinages_brusques,
        exces_vitesse_count: form.exces_vitesse_count,
        score_trajet: score, cout_mad: parseFloat((km * 0.5).toFixed(2)),
        date_trajet: new Date().toISOString().split('T')[0]
      })
      setSuccess(true); setShowForm(false)
      setForm({ km: '', type_route: 'ville', ville_depart: '', ville_arrivee: '', conduite_nocturne: false, freinages_brusques: 0, exces_vitesse_count: 0 })
      setTimeout(() => setSuccess(false), 3000)
    }
    setLoading(false)
  }

  const totalKm = parseFloat(trajets.reduce((s, t) => s + (t.km || 0), 0).toFixed(1))
  const avgScore = trajets.length > 0 ? Math.round(trajets.reduce((s, t) => s + (t.score_trajet || 0), 0) / trajets.length) : 0
  const totalCout = parseFloat(trajets.reduce((s, t) => s + (t.cout_mad || 0), 0).toFixed(2))

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })

  const trajetsFiltres = trajets.filter(t => {
    if (filtre === 'incident') return (t.freinages_brusques || 0) > 0 || (t.exces_vitesse_count || 0) > 0
    if (filtre === 'nocturne') return t.conduite_nocturne
    if (filtre === 'parfait') return t.score_trajet === 100
    if (filtre === 'long') return t.km >= 10
    return true
  })

  return (
    <div style={{ minHeight: '100vh', background: W.gris, fontFamily: 'Inter,sans-serif', paddingBottom: 80 }}>

      {/* HEADER */}
      <header style={{ background: `linear-gradient(135deg,${W.vertDark},${W.vert})`, padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>📋 Mes Trajets</div>
          <button onClick={() => setShowForm(!showForm)} style={{ background: showForm ? 'rgba(255,255,255,0.2)' : W.or, border: 'none', color: showForm ? 'white' : W.noir, borderRadius: 20, padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            {showForm ? '✕ Annuler' : '+ Déclarer'}
          </button>
        </div>
        {/* Stats header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { val: `${totalKm} km`, label: 'Parcourus', color: '#86EFAC' },
            { val: `${avgScore}/100`, label: 'Score moyen', color: W.or },
            { val: `${totalCout} MAD`, label: 'Coût total', color: '#93C5FD' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </header>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '12px 16px' }}>

        {success && (
          <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 12, padding: '12px', marginBottom: 12, color: W.vert, fontWeight: 600, fontSize: 14, textAlign: 'center' }}>
            ✅ Trajet enregistré — Score : {score}/100
          </div>
        )}

        {/* FORMULAIRE */}
        {showForm && (
          <div style={{ background: 'white', borderRadius: 20, padding: '20px', marginBottom: 14, border: `0.5px solid ${W.grisMid}`, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>

            {/* Score + coût preview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div style={{ background: scBg(score), borderRadius: 12, padding: '12px', textAlign: 'center', border: `1.5px solid ${sc(score)}30` }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: sc(score), lineHeight: 1 }}>{score}</div>
                <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>Score /100</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: sc(score) }}>{scLabel(score)}</div>
              </div>
              <div style={{ background: W.orLight, borderRadius: 12, padding: '12px', textAlign: 'center', border: `1.5px solid ${W.or}30` }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: W.orDark, lineHeight: 1 }}>{form.km ? (parseFloat(form.km) * 0.5).toFixed(2) : '0'}</div>
                <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>MAD estimé</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: W.orDark }}>0,50 MAD/km</div>
              </div>
            </div>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94A3B8', marginBottom: 6, letterSpacing: '0.06em' }}>KILOMÈTRES *</label>
                <input type="number" required min="1" placeholder="Ex: 45" value={form.km}
                  onChange={e => setForm(f => ({ ...f, km: e.target.value }))}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1.5px solid ${W.grisMid}`, fontSize: 16, outline: 'none', boxSizing: 'border-box', fontWeight: 600 }} />
              </div>

              {/* Départ → Arrivée */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94A3B8', marginBottom: 6, letterSpacing: '0.06em' }}>ITINÉRAIRE</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 10, height: 10, borderRadius: '50%', background: W.vert, border: '2px solid white', boxShadow: `0 0 0 2px ${W.vert}` }} />
                    <input placeholder="Départ" value={form.ville_depart}
                      onChange={e => setForm(f => ({ ...f, ville_depart: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px 10px 28px', borderRadius: 10, border: `1.5px solid ${W.grisMid}`, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ color: '#94A3B8', fontSize: 18, flexShrink: 0 }}>→</div>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 10, height: 10, borderRadius: '50%', background: '#DC2626', border: '2px solid white', boxShadow: '0 0 0 2px #DC2626' }} />
                    <input placeholder="Arrivée" value={form.ville_arrivee}
                      onChange={e => setForm(f => ({ ...f, ville_arrivee: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px 10px 28px', borderRadius: 10, border: `1.5px solid ${W.grisMid}`, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94A3B8', marginBottom: 6, letterSpacing: '0.06em' }}>TYPE DE ROUTE</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                  {[{ id: 'ville', label: '🏙️', sub: 'Ville' }, { id: 'route', label: '🛣️', sub: 'Route' }, { id: 'autoroute', label: '🚀', sub: 'Auto' }, { id: 'mixte', label: '🔀', sub: 'Mixte' }].map(t => (
                    <button key={t.id} type="button" onClick={() => setForm(f => ({ ...f, type_route: t.id }))}
                      style={{ padding: '10px 4px', borderRadius: 10, border: `2px solid ${form.type_route === t.id ? W.vert : W.grisMid}`, background: form.type_route === t.id ? '#F0FDF4' : 'white', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                      <div style={{ fontSize: 20 }}>{t.label}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: form.type_route === t.id ? W.vert : '#94A3B8', marginTop: 2 }}>{t.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background: '#FFF7ED', borderRadius: 14, padding: '14px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: W.orDark, marginBottom: 12 }}>⚠️ Incidents détectés</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: '🛑 Freinages brusques', key: 'freinages_brusques', pts: '-3 pts' },
                    { label: '🚨 Excès de vitesse', key: 'exces_vitesse_count', pts: '-5 pts' },
                  ].map(inc => (
                    <div key={inc.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 13, color: W.noir, fontWeight: 500 }}>{inc.label}</div>
                        <div style={{ fontSize: 10, color: '#EF4444' }}>{inc.pts} chacun</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button type="button" onClick={() => setForm(f => ({ ...f, [inc.key]: Math.max(0, (f as any)[inc.key] - 1) }))}
                          style={{ width: 32, height: 32, borderRadius: 10, border: `1px solid ${W.grisMid}`, background: 'white', cursor: 'pointer', fontWeight: 800, fontSize: 16 }}>−</button>
                        <span style={{ fontWeight: 800, fontSize: 18, minWidth: 24, textAlign: 'center', color: (form as any)[inc.key] > 0 ? '#EF4444' : W.noir }}>{(form as any)[inc.key]}</span>
                        <button type="button" onClick={() => setForm(f => ({ ...f, [inc.key]: (f as any)[inc.key] + 1 }))}
                          style={{ width: 32, height: 32, borderRadius: 10, border: `1px solid ${W.grisMid}`, background: 'white', cursor: 'pointer', fontWeight: 800, fontSize: 16 }}>+</button>
                      </div>
                    </div>
                  ))}
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 0', borderTop: `1px solid #FDE68A` }}>
                    <div onClick={() => setForm(f => ({ ...f, conduite_nocturne: !f.conduite_nocturne }))} style={{ width: 40, height: 22, borderRadius: 11, background: form.conduite_nocturne ? '#6366F1' : '#CBD5E1', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
                      <div style={{ position: 'absolute', top: 2, left: form.conduite_nocturne ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: W.noir }}>🌙 Conduite nocturne</div>
                      <div style={{ fontSize: 10, color: '#94A3B8' }}>Après 21h00 — pénalité -5 pts</div>
                    </div>
                  </label>
                </div>
              </div>

              <button type="submit" disabled={loading || !form.km} style={{
                padding: '16px', borderRadius: 14,
                background: loading || !form.km ? '#CBD5E1' : `linear-gradient(135deg,${W.vertDark},${W.vert})`,
                color: 'white', border: 'none', fontWeight: 800, fontSize: 16,
                cursor: loading || !form.km ? 'not-allowed' : 'pointer',
                boxShadow: loading || !form.km ? 'none' : '0 6px 20px rgba(46,125,50,0.35)',
              }}>
                {loading ? 'Enregistrement...' : `✅ Enregistrer ce trajet — ${score}/100`}
              </button>
            </form>
          </div>
        )}

        {/* LISTE TRAJETS */}
        {trajetsFiltres.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 20, padding: '48px 24px', textAlign: 'center', border: `0.5px solid ${W.grisMid}` }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🛣️</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: W.noir, marginBottom: 8 }}>Aucun trajet</div>
            <div style={{ fontSize: 14, color: '#94A3B8', marginBottom: 24 }}>Démarrez votre premier trajet GPS pour voir vos données ici</div>
            <button onClick={() => navigate('/telematics')} style={{ background: W.vert, color: 'white', border: 'none', borderRadius: 12, padding: '14px 28px', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 16px rgba(46,125,50,0.3)' }}>
              🚗 Lancer la télématique
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {trajets.map((t, i) => (
              <div key={t.id || i} onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                style={{ background: 'white', borderRadius: 20, overflow: 'hidden', border: `0.5px solid ${W.grisMid}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s' }}>

                {/* MINIATURE CARTE */}
                <div style={{ height: 120, position: 'relative', background: '#E8F4E8' }}>
                  {(t.gps_points || []).length > 1 ? (
                    <TrajetMapStrava points={t.gps_points} speedMax={t.vitesse_max || 0} height={120} interactive={false} />
                  ) : (
                    <div style={{
                      height: 120, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      background: 'linear-gradient(135deg,#E8F4E8,#F0FDF4)',
                      color: '#94A3B8',
                    }}>
                      <span style={{ fontSize: 28, marginBottom: 4 }}>🗺️</span>
                      <span style={{ fontSize: 11 }}>Pas de données GPS</span>
                      <span style={{ fontSize: 10, marginTop: 2, color: '#CBD5E1' }}>Trajet déclaré manuellement</span>
                    </div>
                  )}
                  {/* Score badge */}
                  <div style={{ position: 'absolute', top: 10, right: 10, background: sc(t.score_trajet), color: 'white', borderRadius: 20, padding: '5px 12px', fontSize: 13, fontWeight: 800, boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
                    {t.score_trajet}/100
                  </div>
                  {/* Route type */}
                  <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: W.noir, display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
                    <span>{routeIcon(t.type_route)}</span>
                    <span style={{ textTransform: 'capitalize' }}>{t.type_route}</span>
                  </div>
                  {/* Gradient overlay bottom */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(transparent, rgba(255,255,255,0.9))' }} />
                </div>

                {/* CONTENU */}
                <div style={{ padding: '12px 16px' }}>

                  {/* Ligne principale — Départ → Arrivée */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      {t.ville_depart && t.ville_arrivee ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: W.vert, flexShrink: 0 }} />
                            <span style={{ fontSize: 14, fontWeight: 700, color: W.noir }}>{t.ville_depart}</span>
                          </div>
                          <span style={{ fontSize: 14, color: '#94A3B8' }}>→</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#DC2626', flexShrink: 0 }} />
                            <span style={{ fontSize: 14, fontWeight: 700, color: W.noir }}>{t.ville_arrivee}</span>
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: 14, fontWeight: 700, color: W.noir }}>Trajet {t.type_route}</span>
                      )}
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{fmtDate(t.date_trajet)}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: W.orDark }}>{t.cout_mad} MAD</div>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>{parseFloat(t.km).toFixed(2)} km</div>
                    </div>
                  </div>

                  {/* Tags incidents */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {t.vitesse_max > 0 && (
                      <span style={{ background: '#EFF6FF', color: '#1D4ED8', borderRadius: 20, padding: '3px 8px', fontSize: 11, fontWeight: 600 }}>
                        ⚡ {t.vitesse_max} km/h
                      </span>
                    )}
                    {t.freinages_brusques > 0 ? (
                      <span style={{ background: '#FEF2F2', color: '#DC2626', borderRadius: 20, padding: '3px 8px', fontSize: 11, fontWeight: 600 }}>
                        🛑 {t.freinages_brusques} freinage{t.freinages_brusques > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span style={{ background: '#F0FDF4', color: W.vert, borderRadius: 20, padding: '3px 8px', fontSize: 11, fontWeight: 600 }}>
                        ✅ Aucun incident
                      </span>
                    )}
                    {t.conduite_nocturne && (
                      <span style={{ background: '#F3F4F6', color: '#374151', borderRadius: 20, padding: '3px 8px', fontSize: 11, fontWeight: 600 }}>
                        🌙 Nocturne
                      </span>
                    )}
                    {t.exces_vitesse_count > 0 && (
                      <span style={{ background: '#FEF2F2', color: '#DC2626', borderRadius: 20, padding: '3px 8px', fontSize: 11, fontWeight: 600 }}>
                        🚨 {t.exces_vitesse_count} excès
                      </span>
                    )}
                  </div>

                  {/* DÉTAIL ÉTENDU */}
                  {expanded === t.id && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${W.grisMid}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        {[
                          { val: `${parseFloat(t.km).toFixed(2)} km`, label: 'Distance', color: '#3B82F6' },
                          { val: `${t.score_trajet}/100`, label: scLabel(t.score_trajet), color: sc(t.score_trajet) },
                          { val: `${t.cout_mad} MAD`, label: 'Coût', color: W.orDark },
                        ].map((k, j) => (
                          <div key={j} style={{ background: W.gris, borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: k.color }}>{k.val}</div>
                            <div style={{ fontSize: 9, color: '#94A3B8', marginTop: 2 }}>{k.label}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ background: W.gris, borderRadius: 12, padding: '12px', borderLeft: `3px solid ${sc(t.score_trajet)}` }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: sc(t.score_trajet), marginBottom: 4 }}>💡 Analyse du trajet</div>
                        <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
                          {t.freinages_brusques > 3
                            ? `${t.freinages_brusques} freinages brusques détectés. Anticipez les ralentissements en maintenant une distance de sécurité.`
                            : t.exces_vitesse_count > 0
                            ? `${t.exces_vitesse_count} excès de vitesse. Respectez les limitations pour protéger votre score.`
                            : t.score_trajet >= 90
                            ? 'Trajet exemplaire ! Cette constance vous vaut une réduction de -15% sur votre prime mensuelle.'
                            : t.conduite_nocturne
                            ? 'La conduite nocturne est plus risquée. Restez vigilant après 21h.'
                            : 'Bonne conduite globale. Continuez à anticiper pour améliorer votre score.'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Indicateur expand */}
                  <div style={{ textAlign: 'center', marginTop: 8, color: '#CBD5E1', fontSize: 11 }}>
                    {expanded === t.id ? '▲ Réduire' : '▼ Voir détails'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: `0.5px solid ${W.grisMid}`, display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {[
          { icon: '🏠', label: 'Accueil', path: '/dashboard' },
          { icon: '🚗', label: 'Télématique', path: '/telematics' },
          { icon: '📋', label: 'Trajets', path: '/trajets' },
          { icon: '🏆', label: 'Classement', path: '/leaderboard' },
        ].map(item => {
          const isActive = location.pathname === item.path
          return (
            <button key={item.path} onClick={() => navigate(item.path)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer', color: isActive ? W.vert : '#94A3B8' }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 400 }}>{item.label}</span>
              {isActive && <div style={{ width: 4, height: 4, borderRadius: '50%', background: W.vert }} />}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

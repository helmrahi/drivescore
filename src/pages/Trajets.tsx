import { useState, useEffect } from 'react'
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

export default function Trajets() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ km: '', type_route: 'ville', ville_depart: '', ville_arrivee: '', conduite_nocturne: false, freinages_brusques: 0, exces_vitesse_count: 0 })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [trajets, setTrajets] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)

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

  const totalKm = trajets.reduce((s, t) => s + (t.km || 0), 0)
  const avgScore = trajets.length > 0 ? Math.round(trajets.reduce((s, t) => s + (t.score_trajet || 0), 0) / trajets.length) : 0
  const totalCout = trajets.reduce((s, t) => s + (t.cout_mad || 0), 0)

  return (
    <div style={{ minHeight: '100vh', background: WAFA.gris, fontFamily: 'Inter,sans-serif', paddingBottom: 80 }}>

      {/* HEADER */}
      <header style={{ background: `linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>📋 Mes trajets</div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: WAFA.or, border: 'none', color: WAFA.noir, borderRadius: 10, padding: '8px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          {showForm ? '✕ Fermer' : '+ Déclarer'}
        </button>
      </header>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '12px 16px' }}>

        {success && (
          <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 12, padding: '12px 16px', marginBottom: 12, color: WAFA.vert, fontWeight: 600, fontSize: 14, textAlign: 'center' }}>
            ✅ Trajet enregistré — Score : {score}/100
          </div>
        )}

        {/* STATS GLOBALES */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
          {[
            { label: 'Total km', value: `${totalKm}`, unit: 'km', color: '#3B82F6' },
            { label: 'Score moy.', value: `${avgScore}`, unit: '/100', color: getScoreColor(avgScore) },
            { label: 'Coût total', value: `${totalCout.toFixed(0)}`, unit: 'MAD', color: WAFA.orDark },
          ].map((s, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 12, padding: '10px 12px', textAlign: 'center', border: `0.5px solid ${WAFA.grisMid}` }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}<span style={{ fontSize: 10 }}> {s.unit}</span></div>
              <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* FORMULAIRE */}
        {showForm && (
          <div style={{ background: 'white', borderRadius: 16, padding: '16px', marginBottom: 12, border: `0.5px solid ${WAFA.grisMid}` }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: WAFA.noir, marginBottom: 14 }}>📍 Nouveau trajet</div>

            {/* Score preview */}
            <div style={{ background: `${getScoreColor(score)}18`, borderRadius: 12, padding: '10px', textAlign: 'center', marginBottom: 14, border: `1px solid ${getScoreColor(score)}40` }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: getScoreColor(score) }}>{score}<span style={{ fontSize: 12 }}>/100</span></div>
              <div style={{ fontSize: 11, color: '#64748B' }}>Score estimé</div>
            </div>

            <form onSubmit={soumettre} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94A3B8', marginBottom: 4, letterSpacing: '0.05em' }}>KILOMÈTRES *</label>
                <input type="number" required min="1" placeholder="Ex: 45" value={form.km}
                  onChange={e => setForm(f => ({ ...f, km: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${WAFA.grisMid}`, fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94A3B8', marginBottom: 6, letterSpacing: '0.05em' }}>TYPE DE ROUTE</label>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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

        {/* HISTORIQUE */}
        <div style={{ background: 'white', borderRadius: 16, border: `0.5px solid ${WAFA.grisMid}`, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `0.5px solid ${WAFA.grisMid}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: WAFA.noir }}>Historique</span>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>{trajets.length} trajet{trajets.length > 1 ? 's' : ''}</span>
          </div>

          {trajets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: '#94A3B8' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🛣️</div>
              <div style={{ fontSize: 14 }}>Aucun trajet enregistré</div>
            </div>
          ) : (
            trajets.map((t, i) => (
              <div key={i} style={{ padding: '12px 16px', borderBottom: i < trajets.length - 1 ? `0.5px solid ${WAFA.grisMid}` : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Icône type */}
                <div style={{ width: 40, height: 40, borderRadius: 12, background: t.type_route === 'ville' ? '#EFF6FF' : t.type_route === 'autoroute' ? '#F0FDF4' : WAFA.orLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {t.type_route === 'ville' ? '🏙️' : t.type_route === 'autoroute' ? '🚀' : '🛣️'}
                </div>

                {/* Infos */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: WAFA.noir, marginBottom: 2 }}>
                    {t.ville_depart && t.ville_arrivee ? `${t.ville_depart} → ${t.ville_arrivee}` : `Trajet ${t.type_route}`}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: '#94A3B8' }}>{t.km} km</span>
                    <span style={{ fontSize: 11, color: '#94A3B8' }}>·</span>
                    <span style={{ fontSize: 11, color: '#94A3B8' }}>{t.date_trajet}</span>
                    {t.freinages_brusques > 0 && (
                      <span style={{ fontSize: 10, background: '#FEF2F2', color: '#DC2626', padding: '1px 6px', borderRadius: 20 }}>🛑 {t.freinages_brusques}</span>
                    )}
                    {t.vitesse_max > 0 && (
                      <span style={{ fontSize: 10, background: '#EFF6FF', color: '#1D4ED8', padding: '1px 6px', borderRadius: 20 }}>⚡ {t.vitesse_max} km/h</span>
                    )}
                  </div>
                </div>

                {/* Score + Coût */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: getScoreColor(t.score_trajet) }}>{t.score_trajet}/100</div>
                  <div style={{ fontSize: 11, color: WAFA.orDark, fontWeight: 600 }}>{t.cout_mad} MAD</div>
                </div>
              </div>
            ))
          )}
        </div>
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

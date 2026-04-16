import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import TrajetMapStrava from '../components/TrajetMapStrava'

const C = {
  greenDeep: '#0D2E1C', greenMid: '#1E5C35', greenAccent: '#2A8A50', greenBright: '#3EBD6F',
  amber: '#F5A623', amberLight: '#FDF0D5', amberDark: '#8B5E00',
  red: '#E5403A', redLight: '#FDEAEA', redDark: '#8B1A17',
  blue: '#2D7DD2', blueLight: '#E8F2FC',
  white: '#FFFFFF', surface: '#F7F8F6', surface2: '#EDEFEB',
  textPrimary: '#0D1F16', textSecondary: '#4A6355', textTertiary: '#8AA898',
  border: 'rgba(13,46,28,0.08)', borderStrong: 'rgba(13,46,28,0.14)',
  fontSans: "'DM Sans', sans-serif", fontMono: "'DM Mono', monospace",
}

function scColor(s: number) {
  if (s >= 90) return C.greenBright
  if (s >= 80) return C.greenAccent
  if (s >= 70) return C.amber
  return C.red
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function Trajets() {
  const navigate = useNavigate()
  const location = useLocation()
  const [trajets, setTrajets] = useState<any[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filtre, setFiltre] = useState<'tous'|'incident'|'nocturne'|'parfait'|'long'>('tous')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ km: '', type_route: 'ville', ville_depart: '', ville_arrivee: '', conduite_nocturne: false, freinages_brusques: 0, exces_vitesse_count: 0 })

  const scoreEstime = Math.max(0, 100 - form.freinages_brusques * 3 - form.exces_vitesse_count * 3)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { setLoading(false); return }
      // Chercher pseudo_id dans profiles
      const { data: p } = await supabase
        .from('profiles').select('pseudo_id')
        .eq('id', session.user.id).single()
      if (!p?.pseudo_id) { setLoading(false); return }
      // Charger tous les trajets
      const { data: t } = await supabase
        .from('trajets').select('*')
        .eq('pseudo_id', p.pseudo_id)
        .order('date_trajet', { ascending: false })
        .limit(100)
      setTrajets(t || [])
    } catch(e) {
      console.error('load error:', e)
    }
    setLoading(false)
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
        score_trajet: scoreEstime,
        cout_mad: parseFloat((km * 0.5).toFixed(2)),
        date_trajet: new Date().toISOString().split('T')[0]
      })
      setShowForm(false)
      setForm({ km: '', type_route: 'ville', ville_depart: '', ville_arrivee: '', conduite_nocturne: false, freinages_brusques: 0, exces_vitesse_count: 0 })
      await load()
    }
    setLoading(false)
  }

  const trajetsFiltres = trajets.filter(t => {
    if (filtre === 'incident') return (t.freinages_brusques||0) > 0 || (t.exces_vitesse_count||0) > 0
    if (filtre === 'nocturne') return t.conduite_nocturne
    if (filtre === 'parfait') return t.score_trajet === 100
    if (filtre === 'long') return t.km >= 10
    return true
  })

  const totalKm = parseFloat(trajets.reduce((s,t) => s+(t.km||0), 0).toFixed(1))
  const avgScore = trajets.length > 0 ? Math.round(trajets.reduce((s,t) => s+(t.score_trajet||0),0)/trajets.length) : 0
  const totalCout = parseFloat(trajets.reduce((s,t) => s+(t.cout_mad||0),0).toFixed(2))

  return (
    <div style={{ minHeight: '100vh', background: C.surface, fontFamily: C.fontSans, paddingBottom: 80 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* HEADER */}
      <div style={{ background: C.greenDeep, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'radial-gradient(circle, rgba(62,189,111,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ padding: '16px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.greenBright, boxShadow: '0 0 8px rgba(62,189,111,0.6)' }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>Mes Trajets</span>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{ background: showForm ? 'rgba(229,64,58,0.2)' : 'rgba(62,189,111,0.15)', border: `0.5px solid ${showForm ? 'rgba(229,64,58,0.3)' : 'rgba(62,189,111,0.3)'}`, color: showForm ? C.red : C.greenBright, borderRadius: 10, padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: C.fontSans }}>
            {showForm ? 'Annuler' : '+ Declarer'}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '14px 20px 20px', position: 'relative', zIndex: 1 }}>
          {[
            { val: `${totalKm}`, unit: 'km', label: 'parcourus' },
            { val: `${avgScore}`, unit: '/100', label: 'score moyen' },
            { val: `${totalCout}`, unit: 'MAD', label: 'cout total' },
          ].map((s,i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px' }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'white', lineHeight: 1, fontFamily: C.fontMono }}>{s.val}<span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.5)', marginLeft: 2 }}>{s.unit}</span></div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* FORMULAIRE */}
        {showForm && (
          <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: '18px' }}>
            <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.3px', marginBottom: 14 }}>DECLARER UN TRAJET</div>
            <div style={{ background: 'rgba(42,138,80,0.06)', borderRadius: 12, padding: '12px', textAlign: 'center', marginBottom: 14, border: `1px solid rgba(42,138,80,0.15)` }}>
              <div style={{ fontSize: 32, fontWeight: 600, color: scColor(scoreEstime), fontFamily: C.fontMono }}>{scoreEstime}</div>
              <div style={{ fontSize: 11, color: C.textTertiary, marginTop: 2 }}>Score estime</div>
            </div>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, marginBottom: 6 }}>KILOMETRES</div>
                <input type="number" required min="0.1" step="0.1" placeholder="Ex: 12.5" value={form.km}
                  onChange={e => setForm(f => ({...f, km: e.target.value}))}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: `1px solid ${C.borderStrong}`, fontSize: 15, outline: 'none', boxSizing: 'border-box' as const, background: C.surface, fontFamily: C.fontMono }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[['ville_depart','Depart','Casa...'],['ville_arrivee','Arrivee','Rabat...']].map(([key,label,ph]) => (
                  <div key={key}>
                    <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, marginBottom: 6 }}>{label.toUpperCase()}</div>
                    <input placeholder={ph} value={(form as any)[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.borderStrong}`, fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, background: C.surface }} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[['ville','Ville'],['route','Route'],['autoroute','Auto']].map(([id,label]) => (
                  <button key={id} type="button" onClick={() => setForm(f => ({...f, type_route: id}))}
                    style={{ flex: 1, padding: '9px', borderRadius: 10, border: `1px solid ${form.type_route===id ? C.greenAccent : C.borderStrong}`, background: form.type_route===id ? 'rgba(42,138,80,0.08)' : C.surface, color: form.type_route===id ? C.greenAccent : C.textSecondary, fontWeight: 500, fontSize: 12, cursor: 'pointer', fontFamily: C.fontSans }}>
                    {label}
                  </button>
                ))}
              </div>
              {[['freinages_brusques','Freinages brusques'],['exces_vitesse_count','Exces de vitesse']].map(([key,label]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: C.surface, borderRadius: 10 }}>
                  <span style={{ fontSize: 13, color: C.textPrimary, fontWeight: 500 }}>{label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button type="button" onClick={() => setForm(f => ({...f, [key]: Math.max(0,(f as any)[key]-1)}))} style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.borderStrong}`, background: C.white, cursor: 'pointer', fontWeight: 600, color: C.textSecondary }}>-</button>
                    <span style={{ fontWeight: 600, fontSize: 16, minWidth: 24, textAlign: 'center', color: (form as any)[key] > 0 ? C.red : C.textPrimary, fontFamily: C.fontMono }}>{(form as any)[key]}</span>
                    <button type="button" onClick={() => setForm(f => ({...f, [key]: (f as any)[key]+1}))} style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.borderStrong}`, background: C.white, cursor: 'pointer', fontWeight: 600, color: C.textSecondary }}>+</button>
                  </div>
                </div>
              ))}
              <button type="submit" disabled={loading||!form.km} style={{ padding: '13px', borderRadius: 12, background: loading||!form.km ? C.surface2 : C.greenMid, color: loading||!form.km ? C.textTertiary : 'white', border: 'none', fontWeight: 600, fontSize: 14, cursor: loading||!form.km ? 'not-allowed' : 'pointer', fontFamily: C.fontSans }}>
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </form>
          </div>
        )}

        {/* FILTRES */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto' as const, paddingBottom: 2 }}>
          {[['tous','Tous'],['incident','Incidents'],['nocturne','Nocturne'],['parfait','Parfait'],['long','+10km']].map(([key,label]) => (
            <button key={key} onClick={() => setFiltre(key as any)} style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${filtre===key ? C.greenAccent : C.borderStrong}`, cursor: 'pointer', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' as const, fontFamily: C.fontSans, background: filtre===key ? C.greenMid : C.white, color: filtre===key ? 'white' : C.textSecondary }}>
              {label}
            </button>
          ))}
        </div>

        {/* LISTE */}
        {trajetsFiltres.length === 0 ? (
          <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🛣️</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, marginBottom: 6 }}>Aucun trajet</div>
            <div style={{ fontSize: 13, color: C.textTertiary }}>
              {filtre === 'tous' ? 'Demarrez votre premier trajet GPS' : 'Aucun trajet correspond'}
            </div>
          </div>
        ) : trajetsFiltres.map((t,i) => {
          const isOpen = expanded === (t.id||String(i))
          const score = t.score_trajet || 0
          const f = t.freinages_brusques || 0
          const e = t.exces_vitesse_count || 0
          const hasMap = (t.gps_points?.length || 0) > 1
          return (
            <div key={t.id||i} style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              {hasMap && (
                <div style={{ height: 110, position: 'relative' }}>
                  <TrajetMapStrava points={t.gps_points||[]} speedMax={t.vitesse_max||0} height={110} interactive={false} />
                  <div style={{ position: 'absolute', top: 8, right: 8, background: scColor(score), color: 'white', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, fontFamily: C.fontMono }}>{score}/100</div>
                </div>
              )}
              <div onClick={() => setExpanded(isOpen ? null : (t.id||String(i)))} style={{ padding: '14px 16px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, color: C.textTertiary, marginBottom: 3 }}>{fmtDate(t.date_trajet)}</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary }}>
                      {t.ville_depart && t.ville_arrivee ? `${t.ville_depart} → ${t.ville_arrivee}` : `Trajet ${t.type_route||'ville'}`}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {!hasMap && <div style={{ fontSize: 13, fontWeight: 600, color: scColor(score), fontFamily: C.fontMono }}>{score}/100</div>}
                    <div style={{ fontSize: 12, color: C.textTertiary }}>{Number(t.cout_mad).toFixed(2)} MAD</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: C.textTertiary }}>{Number(t.km).toFixed(2)} km</span>
                  {f > 0 && <span style={{ fontSize: 11, background: C.redLight, color: C.redDark, padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>🛑 {f}</span>}
                  {e > 0 && <span style={{ fontSize: 11, background: C.amberLight, color: C.amberDark, padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>⚡ {e}</span>}
                  {t.vitesse_max > 0 && <span style={{ fontSize: 11, background: C.blueLight, color: C.blue, padding: '2px 8px', borderRadius: 20 }}>{t.vitesse_max} km/h</span>}
                  {t.conduite_nocturne && <span style={{ fontSize: 11, background: C.surface2, color: C.textSecondary, padding: '2px 8px', borderRadius: 20 }}>🌙</span>}
                  {f===0 && e===0 && <span style={{ fontSize: 11, color: C.greenAccent, fontWeight: 500 }}>✓ Aucun incident</span>}
                  <div style={{ flex: 1, minWidth: 40, height: 3, background: C.surface2, borderRadius: 4 }}>
                    <div style={{ width: `${score}%`, height: '100%', background: scColor(score), borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 10, color: C.textTertiary }}>{isOpen ? '▲' : '▼'}</span>
                </div>
              </div>
              {isOpen && (
                <div style={{ padding: '0 16px 14px', borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                    {[
                      { val: Number(t.km).toFixed(2), unit: 'km', label: 'Distance' },
                      { val: String(score), unit: '/100', label: 'Score' },
                      { val: Number(t.cout_mad).toFixed(2), unit: 'MAD', label: 'Cout' },
                    ].map((k,j) => (
                      <div key={j} style={{ background: C.surface, borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, fontFamily: C.fontMono }}>{k.val}<span style={{ fontSize: 10, color: C.textTertiary }}> {k.unit}</span></div>
                        <div style={{ fontSize: 10, color: C.textTertiary, marginTop: 2 }}>{k.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: C.amberLight, borderRadius: 10, padding: '10px 12px', display: 'flex', gap: 8 }}>
                    <span style={{ fontSize: 14 }}>💡</span>
                    <span style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.5 }}>
                      {f > 3 ? `${f} freinages. Anticipez les ralentissements.` : e > 0 ? `${e} exces. Respectez les limites.` : score >= 90 ? 'Excellent trajet !' : 'Bonne conduite. Continuez.'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {[
          { label: 'Accueil', path: '/dashboard', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="10" width="5" height="8" rx="1.5" fill="#1E5C35"/><rect x="7.5" y="6" width="5" height="12" rx="1.5" fill="#1E5C35"/><rect x="13" y="2" width="5" height="16" rx="1.5" fill="#3EBD6F"/></svg> },
          { label: 'Telematique', path: '/telematics', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="#8AA898" strokeWidth="1.4"/><circle cx="10" cy="10" r="3" stroke="#8AA898" strokeWidth="1.4"/><path d="M10 3V7M10 13V17M3 10H7M13 10H17" stroke="#8AA898" strokeWidth="1.2" strokeLinecap="round"/></svg> },
          { label: 'Trajets', path: '/trajets', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="2" width="12" height="16" rx="2" stroke="#8AA898" strokeWidth="1.4"/><path d="M7 7H13M7 10.5H13M7 14H10.5" stroke="#8AA898" strokeWidth="1.2" strokeLinecap="round"/></svg> },
          { label: 'Classement', path: '/leaderboard', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L12.2 7.4H18L13.2 10.8L15.2 16.4L10 13L4.8 16.4L6.8 10.8L2 7.4H7.8L10 2Z" stroke="#8AA898" strokeWidth="1.4" strokeLinejoin="round"/></svg> },
        ].map(item => {
          const isActive = location.pathname === item.path
          return (
            <button key={item.path} onClick={() => navigate(item.path)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer' }}>
              {item.icon}
              <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, color: isActive ? C.greenMid : C.textTertiary }}>{item.label}</span>
              {isActive && <div style={{ width: 4, height: 4, borderRadius: '50%', background: C.greenBright }} />}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

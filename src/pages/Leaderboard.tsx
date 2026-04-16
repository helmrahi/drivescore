import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const C = {
  greenDeep: '#0D2E1C', greenMid: '#1E5C35', greenAccent: '#2A8A50', greenBright: '#3EBD6F',
  amber: '#F5A623', amberLight: '#FDF0D5', amberDark: '#8B5E00',
  white: '#FFFFFF', surface: '#F7F8F6', surface2: '#EDEFEB',
  textPrimary: '#0D1F16', textSecondary: '#4A6355', textTertiary: '#8AA898',
  border: 'rgba(13,46,28,0.08)',
  fontSans: "'DM Sans', sans-serif", fontMono: "'DM Mono', monospace",
}

function scColor(s: number) {
  if (s >= 90) return C.greenBright
  if (s >= 80) return C.greenAccent
  if (s >= 70) return C.amber
  return '#E5403A'
}

export default function Leaderboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [drivers, setDrivers] = useState<any[]>([])
  const [myId, setMyId] = useState('')
  const [filter, setFilter] = useState('score')
  const [periode, setPeriode] = useState('mois')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    load()
  }, [periode])

  async function load() {
    try {
      setLoading(true)
      setError('')

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      const { data: myProfile } = await supabase
        .from('profiles')
        .select('pseudo_id')
        .eq('id', session.user.id)
        .single()

      if (myProfile) setMyId(myProfile.pseudo_id)

      const { data: profiles } = await supabase
        .from('profiles')
        .select('pseudo_id, prenom, afficher_leaderboard')
        .eq('afficher_leaderboard', true)

      if (!profiles || profiles.length === 0) {
        setDrivers([])
        setLoading(false)
        return
      }

      const { data: trajets } = await supabase
        .from('trajets')
        .select('pseudo_id, score_trajet, km, date_trajet')

      const now = new Date()
      const filtered = (trajets || []).filter(t => {
        if (periode === 'tout') return true
        if (!t.date_trajet) return false
        const d = new Date(t.date_trajet)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })

      const map: Record<string, any> = {}
      for (const p of profiles) {
        map[p.pseudo_id] = { pseudo_id: p.pseudo_id, prenom: p.prenom || 'Conducteur', scores: [], km: 0, trajets: 0 }
      }

      for (const t of filtered) {
        if (!map[t.pseudo_id]) continue
        map[t.pseudo_id].scores.push(t.score_trajet || 0)
        map[t.pseudo_id].km = parseFloat((map[t.pseudo_id].km + (t.km || 0)).toFixed(1))
        map[t.pseudo_id].trajets += 1
      }

      const list = Object.values(map)
        .filter((d: any) => d.trajets > 0)
        .map((d: any) => ({ ...d, score: d.scores.length > 0 ? Math.round(d.scores.reduce((a: number, b: number) => a + b, 0) / d.scores.length) : 0 }))

      setDrivers(list)
    } catch(e: any) {
      setError(e?.message || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  const sorted = [...drivers].sort((a, b) => {
    if (filter === 'km') return b.km - a.km
    if (filter === 'trajets') return b.trajets - a.trajets
    return b.score - a.score
  })

  const myPos = sorted.findIndex(d => d.pseudo_id === myId) + 1
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div style={{ minHeight: '100vh', background: C.surface, fontFamily: C.fontSans, paddingBottom: 80 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ background: C.greenDeep, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'radial-gradient(circle, rgba(62,189,111,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ padding: '16px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.greenBright }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>Classement</span>
          </div>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>DriveScore Maroc</span>
        </div>

        {myPos > 0 && (
          <div style={{ margin: '12px 20px 0', background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Ma position</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ background: C.amber, color: C.greenDeep, borderRadius: 20, padding: '3px 12px', fontWeight: 700, fontSize: 14, fontFamily: C.fontMono }}>#{myPos}</div>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>sur {sorted.length}</span>
            </div>
          </div>
        )}

        <div style={{ padding: '12px 20px 16px', display: 'flex', gap: 6, position: 'relative', zIndex: 1 }}>
          {[['mois','Ce mois'],['tout','Tout']].map(([key,label]) => (
            <button key={key} onClick={() => setPeriode(key)} style={{
              padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: C.fontSans,
              background: periode === key ? C.greenBright : 'rgba(255,255,255,0.08)',
              color: periode === key ? C.greenDeep : 'rgba(255,255,255,0.6)',
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[['score','Score'],['km','Km'],['trajets','Trajets']].map(([key,label]) => (
            <button key={key} onClick={() => setFilter(key)} style={{
              padding: '10px', borderRadius: 12, border: `1px solid ${filter===key ? C.greenAccent : C.border}`,
              cursor: 'pointer', fontWeight: 500, fontSize: 13, fontFamily: C.fontSans,
              background: filter===key ? C.greenMid : C.white,
              color: filter===key ? 'white' : C.textSecondary,
            }}>{label}</button>
          ))}
        </div>

        {error && <div style={{ background: '#FDEAEA', color: '#8B1A17', padding: '10px 14px', borderRadius: 10, fontSize: 13 }}>Erreur: {error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{ width: 32, height: 32, border: `2px solid ${C.greenBright}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <div style={{ fontSize: 13, color: C.textTertiary }}>Chargement...</div>
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🏆</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, marginBottom: 6 }}>Aucun conducteur</div>
            <div style={{ fontSize: 13, color: C.textTertiary, marginBottom: 16 }}>Activez votre participation dans le tableau de bord</div>
            <button onClick={() => navigate('/dashboard')} style={{ background: C.greenMid, color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Aller au tableau de bord
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sorted.map((driver, i) => {
              const isMe = driver.pseudo_id === myId
              return (
                <div key={driver.pseudo_id} style={{
                  background: isMe ? 'rgba(42,138,80,0.06)' : C.white,
                  borderRadius: 16, padding: '14px 16px',
                  border: `1px solid ${isMe ? C.greenAccent + '40' : C.border}`,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{ width: 32, textAlign: 'center', flexShrink: 0 }}>
                    {i < 3 ? <span style={{ fontSize: 22 }}>{medals[i]}</span>
                      : <span style={{ fontSize: 14, fontWeight: 600, color: C.textTertiary, fontFamily: C.fontMono }}>#{i+1}</span>}
                  </div>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: isMe ? C.greenAccent : C.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: isMe ? 'white' : C.textSecondary, fontFamily: C.fontMono }}>{String(driver.prenom||'?').substring(0,2).toUpperCase()}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>{driver.prenom}</span>
                      {isMe && <span style={{ background: C.greenAccent, color: 'white', fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 20 }}>MOI</span>}
                    </div>
                    <div style={{ fontSize: 11, color: C.textTertiary }}>{driver.km} km · {driver.trajets} trajet{driver.trajets > 1 ? 's' : ''}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 20, fontWeight: 600, color: filter==='score' ? scColor(driver.score) : C.textPrimary, fontFamily: C.fontMono }}>
                      {filter==='score' ? driver.score : filter==='km' ? driver.km : driver.trajets}
                    </div>
                    <div style={{ fontSize: 10, color: C.textTertiary }}>{filter==='score' ? '/100' : filter==='km' ? 'km' : 'trajets'}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <div style={{ textAlign: 'center', fontSize: 11, color: C.textTertiary, padding: '4px 0' }}>
          Classement temps réel · DriveScore par Wafa Assurance
        </div>
      </div>

      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {[
          { label: 'Accueil', path: '/dashboard', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="10" width="5" height="8" rx="1.5" fill="#1E5C35"/><rect x="7.5" y="6" width="5" height="12" rx="1.5" fill="#1E5C35"/><rect x="13" y="2" width="5" height="16" rx="1.5" fill="#3EBD6F"/></svg> },
          { label: 'Telematique', path: '/telematics', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="#8AA898" strokeWidth="1.4"/><circle cx="10" cy="10" r="3" stroke="#8AA898" strokeWidth="1.4"/><path d="M10 3V7M10 13V17M3 10H7M13 10H17" stroke="#8AA898" strokeWidth="1.2" strokeLinecap="round"/></svg> },
          { label: 'Trajets', path: '/trajets', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="2" width="12" height="16" rx="2" stroke="#8AA898" strokeWidth="1.4"/><path d="M7 7H13M7 10.5H13M7 14H10.5" stroke="#8AA898" strokeWidth="1.2" strokeLinecap="round"/></svg> },
          { label: 'Classement', path: '/leaderboard', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L12.2 7.4H18L13.2 10.8L15.2 16.4L10 13L4.8 16.4L6.8 10.8L2 7.4H7.8L10 2Z" stroke="#3EBD6F" strokeWidth="1.4" strokeLinejoin="round"/></svg> },
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

const C_greenMid = '#1E5C35'

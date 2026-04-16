import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const C = {
  greenDeep: '#0D2E1C', greenDark: '#163D25', greenMid: '#1E5C35',
  greenAccent: '#2A8A50', greenBright: '#3EBD6F',
  amber: '#F5A623', amberLight: '#FDF0D5', amberDark: '#8B5E00',
  red: '#E5403A', redLight: '#FDEAEA',
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

export default function Leaderboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [drivers, setDrivers] = useState<any[]>([])
  const [myId, setMyId] = useState('')
  const [myScore, setMyScore] = useState(0)
  const [myKm, setMyKm] = useState(0)
  const [myTrajets, setMyTrajets] = useState(0)
  const [filter, setFilter] = useState<'score'|'km'|'trajets'>('score')
  const [periode, setPeriode] = useState<'mois'|'semaine'|'tout'>('mois')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const tickRef = useRef(0)

  useEffect(() => { load() }, [periode])

  async function load() {
    try {
      setLoading(true)
      setError('')
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      const { data: myProfile } = await supabase.from('profiles').select('pseudo_id').eq('id', session.user.id).single()
      if (myProfile) setMyId(myProfile.pseudo_id)

      const { data: profiles } = await supabase.from('profiles').select('pseudo_id, prenom, afficher_leaderboard').eq('afficher_leaderboard', true)
      if (!profiles?.length) { setDrivers([]); setLoading(false); return }

      const now = new Date()
      let query = supabase.from('trajets').select('pseudo_id, score_trajet, km, date_trajet')

      const { data: trajets } = await query

      const filtered = (trajets || []).filter(t => {
        if (periode === 'tout') return true
        if (!t.date_trajet) return false
        const d = new Date(t.date_trajet)
        if (periode === 'semaine') return (now.getTime() - d.getTime()) / 86400000 <= 7
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })

      const map: Record<string, any> = {}
      for (const p of profiles) {
        map[p.pseudo_id] = { pseudo_id: p.pseudo_id, prenom: p.prenom || 'Conducteur', scores: [], km: 0, trajets: 0, prevScore: 0 }
      }
      for (const t of filtered) {
        if (!map[t.pseudo_id]) continue
        map[t.pseudo_id].scores.push(t.score_trajet || 0)
        map[t.pseudo_id].km = parseFloat((map[t.pseudo_id].km + (t.km || 0)).toFixed(1))
        map[t.pseudo_id].trajets += 1
      }

      const list = Object.values(map)
        .map((d: any) => ({ ...d, score: d.scores.length > 0 ? Math.round(d.scores.reduce((a: number, b: number) => a + b, 0) / d.scores.length) : 0 }))
        .filter((d: any) => d.trajets > 0)
        .sort((a: any, b: any) => b.score - a.score)
        .map((d: any, i: number) => ({ ...d, rank: i + 1, trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.5 ? 'down' : 'same' }))

      setDrivers(list)

      // Mes stats
      if (myProfile) {
        const mine = list.find((d: any) => d.pseudo_id === myProfile.pseudo_id)
        if (mine) { setMyScore(mine.score); setMyKm(mine.km); setMyTrajets(mine.trajets) }
      }
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
  const reduction = myScore >= 90 ? 15 : myScore >= 80 ? 10 : myScore >= 70 ? 5 : 0
  const medals = ['🥇', '🥈', '🥉']
  const top3 = sorted.slice(0, 3)
  const rest = sorted.slice(3)

  return (
    <div style={{ minHeight: '100vh', background: C.surface, fontFamily: C.fontSans, paddingBottom: 80 }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse-dot{0%,100%{box-shadow:0 0 8px rgba(62,189,111,0.6)}50%{box-shadow:0 0 16px rgba(62,189,111,0.9)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .driver-row:active{background:rgba(42,138,80,0.04)}
      `}</style>

      {/* HEADER */}
      <div style={{ background: C.greenDeep, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'radial-gradient(circle, rgba(62,189,111,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ padding: '16px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.greenBright, boxShadow: '0 0 8px rgba(62,189,111,0.7)', animation: 'pulse-dot 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>Classement</span>
            <span style={{ background: 'rgba(62,189,111,0.15)', border: '0.5px solid rgba(62,189,111,0.3)', color: C.greenBright, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>LIVE</span>
          </div>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Maroc · {sorted.length} conducteur{sorted.length > 1 ? 's' : ''}</span>
        </div>

        {/* Ma position */}
        {myPos > 0 && (
          <div style={{ margin: '12px 20px 0', background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Ma position ce mois</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ background: C.amber, color: C.greenDeep, borderRadius: 20, padding: '3px 12px', fontWeight: 700, fontSize: 14, fontFamily: C.fontMono }}>#{myPos}</div>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>sur {sorted.length}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 600, color: C.amber, lineHeight: 1, fontFamily: C.fontMono }}>{myScore}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>/100</div>
            </div>
          </div>
        )}

        {/* Périodes */}
        <div style={{ padding: '12px 20px 16px', display: 'flex', gap: 6, position: 'relative', zIndex: 1 }}>
          {([['mois','Ce mois'],['semaine','Semaine'],['tout','Tout temps']] as const).map(([key,label]) => (
            <button key={key} onClick={() => setPeriode(key)} style={{
              padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: C.fontSans,
              background: periode === key ? C.greenBright : 'rgba(255,255,255,0.08)',
              color: periode === key ? C.greenDeep : 'rgba(255,255,255,0.6)',
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Filtres */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {([['score','Score'],['km','Km'],['trajets','Trajets']] as const).map(([key,label]) => (
            <button key={key} onClick={() => setFilter(key)} style={{
              padding: '10px', borderRadius: 12, border: `1px solid ${filter===key ? C.greenAccent : C.borderStrong}`,
              cursor: 'pointer', fontWeight: 500, fontSize: 13, fontFamily: C.fontSans,
              background: filter===key ? C.greenMid : C.white,
              color: filter===key ? 'white' : C.textSecondary,
            }}>{label}</button>
          ))}
        </div>

        {error && <div style={{ background: C.redLight, color: '#8B1A17', padding: '10px 14px', borderRadius: 10, fontSize: 13 }}>{error}</div>}

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
            <button onClick={() => navigate('/dashboard')} style={{ background: C.greenMid, color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: C.fontSans }}>
              Aller au tableau de bord
            </button>
          </div>
        ) : (
          <>
            {/* PODIUM TOP 3 */}
            {top3.length >= 2 && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 4 }}>
                {[top3[1], top3[0], top3[2]].filter(Boolean).map((d: any, idx: number) => {
                  const isFirst = d.rank === 1
                  const isMe = d.pseudo_id === myId
                  return (
                    <div key={d.pseudo_id} style={{
                      flex: 1, borderRadius: 14, padding: `10px 8px ${isFirst ? 18 : 10}px`, textAlign: 'center',
                      border: `1px solid ${isMe ? C.greenAccent + '50' : C.border}`,
                      background: isFirst ? C.greenDeep : isMe ? 'rgba(42,138,80,0.05)' : C.white,
                      animation: 'fadeIn 0.4s ease',
                    }}>
                      <div style={{ fontSize: isFirst ? 22 : 18, marginBottom: 6 }}>{medals[d.rank-1]}</div>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: isMe ? C.greenAccent : isFirst ? 'rgba(255,255,255,0.15)' : C.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: isMe || isFirst ? 'white' : C.textSecondary, fontFamily: C.fontMono }}>{String(d.prenom||'?').substring(0,2).toUpperCase()}</span>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: isFirst ? 'white' : C.textPrimary, marginBottom: 2 }}>{d.prenom}</div>
                      <div style={{ fontSize: isFirst ? 22 : 18, fontWeight: 700, color: isFirst ? C.amber : scColor(d.score), fontFamily: C.fontMono }}>
                        {filter==='score' ? d.score : filter==='km' ? d.km : d.trajets}
                      </div>
                      <div style={{ fontSize: 9, color: isFirst ? 'rgba(255,255,255,0.4)' : C.textTertiary }}>{filter==='score' ? '/100' : filter==='km' ? 'km' : 'traj'}</div>
                      <div style={{ height: 3, background: isFirst ? 'rgba(255,255,255,0.1)' : C.surface2, borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                        <div style={{ width: `${d.score}%`, height: '100%', background: isFirst ? C.amber : scColor(d.score), borderRadius: 2 }} />
                      </div>
                      {isMe && <div style={{ marginTop: 5, fontSize: 9, background: 'rgba(42,138,80,0.15)', color: C.greenAccent, padding: '2px 6px', borderRadius: 20, display: 'inline-block', fontWeight: 600 }}>MOI</div>}
                      {d.rank === 1 && reduction > 0 && <div style={{ marginTop: 5, fontSize: 9, background: 'rgba(245,166,35,0.2)', color: C.amber, padding: '2px 6px', borderRadius: 20, display: 'inline-block' }}>-{reduction}% prime</div>}
                    </div>
                  )
                })}
              </div>
            )}

            {/* LISTE */}
            <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.3px' }}>CLASSEMENT COMPLET</span>
              </div>
              {sorted.map((d: any, i: number) => {
                const isMe = d.pseudo_id === myId
                const val = filter==='score' ? d.score : filter==='km' ? d.km : d.trajets
                const unit = filter==='score' ? '/100' : filter==='km' ? 'km' : 'traj'
                return (
                  <div key={d.pseudo_id} className="driver-row" style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                    borderBottom: i < sorted.length-1 ? `1px solid ${C.border}` : 'none',
                    background: isMe ? 'rgba(42,138,80,0.04)' : 'white',
                    borderLeft: isMe ? `3px solid ${C.greenAccent}` : '3px solid transparent',
                    animation: 'fadeIn 0.3s ease',
                  }}>
                    <div style={{ width: 28, textAlign: 'center', flexShrink: 0 }}>
                      {i < 3
                        ? <span style={{ fontSize: 20 }}>{medals[i]}</span>
                        : <span style={{ fontSize: 12, fontWeight: 600, color: C.textTertiary, fontFamily: C.fontMono }}>#{i+1}</span>}
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: isMe ? C.greenAccent : C.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: isMe ? 'white' : C.textSecondary, fontFamily: C.fontMono }}>{String(d.prenom||'?').substring(0,2).toUpperCase()}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{d.prenom}</span>
                        {isMe && <span style={{ background: C.greenAccent, color: 'white', fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 20 }}>MOI</span>}
                        <span style={{
                          fontSize: 10, padding: '2px 6px', borderRadius: 20, fontWeight: 600,
                          background: d.trend==='up' ? 'rgba(62,189,111,0.12)' : d.trend==='down' ? 'rgba(229,64,58,0.1)' : C.surface2,
                          color: d.trend==='up' ? C.greenMid : d.trend==='down' ? '#8B1A17' : C.textTertiary,
                        }}>{d.trend==='up' ? '↑' : d.trend==='down' ? '↓' : '—'}</span>
                      </div>
                      <div style={{ fontSize: 10, color: C.textTertiary, marginBottom: 4 }}>{d.km} km · {d.trajets} trajet{d.trajets>1?'s':''}</div>
                      <div style={{ height: 3, background: C.surface2, borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${d.score}%`, height: '100%', background: scColor(d.score), borderRadius: 2 }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 18, fontWeight: 600, color: filter==='score' ? scColor(d.score) : C.textPrimary, fontFamily: C.fontMono }}>{val}</div>
                      <div style={{ fontSize: 10, color: C.textTertiary }}>{unit}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Mes stats */}
            {myPos > 0 && (
              <div style={{ background: C.greenDeep, borderRadius: 16, padding: '14px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: 'radial-gradient(circle, rgba(62,189,111,0.15) 0%, transparent 70%)' }} />
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.3px', marginBottom: 10, position: 'relative', zIndex: 1 }}>MES STATS DU MOIS</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, position: 'relative', zIndex: 1 }}>
                  {[
                    { val: String(myScore), unit: '/100', label: 'Score', color: C.amber },
                    { val: String(myKm), unit: 'km', label: 'Km', color: C.greenBright },
                    { val: String(myTrajets), unit: '', label: 'Trajets', color: 'white' },
                    { val: `-${reduction}%`, unit: '', label: 'Réduction', color: C.greenBright },
                  ].map((s, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: s.color, fontFamily: C.fontMono }}>{s.val}<span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>{s.unit}</span></div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div style={{ textAlign: 'center', fontSize: 10, color: C.textTertiary, padding: '4px 0 8px' }}>
          Mis à jour en temps réel · DriveScore par Wafa Assurance
        </div>
      </div>

      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {[
          { label: 'Accueil', path: '/dashboard', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="10" width="5" height="8" rx="1.5" fill="#8AA898"/><rect x="7.5" y="6" width="5" height="12" rx="1.5" fill="#8AA898"/><rect x="13" y="2" width="5" height="16" rx="1.5" fill="#8AA898"/></svg> },
          { label: 'Telematique', path: '/telematics', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="#8AA898" strokeWidth="1.4"/><circle cx="10" cy="10" r="3" stroke="#8AA898" strokeWidth="1.4"/><path d="M10 3V7M10 13V17M3 10H7M13 10H17" stroke="#8AA898" strokeWidth="1.2" strokeLinecap="round"/></svg> },
          { label: 'Trajets', path: '/trajets', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="2" width="12" height="16" rx="2" stroke="#8AA898" strokeWidth="1.4"/><path d="M7 7H13M7 10.5H13M7 14H10.5" stroke="#8AA898" strokeWidth="1.2" strokeLinecap="round"/></svg> },
          { label: 'Classement', path: '/leaderboard', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L12.2 7.4H18L13.2 10.8L15.2 16.4L10 13L4.8 16.4L6.8 10.8L2 7.4H7.8L10 2Z" stroke="#1E5C35" strokeWidth="1.4" strokeLinejoin="round" fill="rgba(62,189,111,0.1)"/></svg> },
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

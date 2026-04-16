import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getAllTrajets } from '../services/trajetService'
import { getAllProfiles } from '../services/profileService'

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

function sc(s: number) {
  if (s >= 90) return C.greenBright
  if (s >= 80) return C.greenAccent
  if (s >= 70) return C.amber
  return C.red
}

export default function Leaderboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [drivers, setDrivers] = useState<any[]>([])
  const [myPseudoId, setMyPseudoId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'score' | 'km' | 'trajets'>('score')
  const [periode, setPeriode] = useState<'mois' | 'tout'>('mois')
  const [loading, setLoading] = useState(true)

  useEffect(() => { 
    let mounted = true
    async function load() {
    if (!mounted) return
    setLoading(true)
    try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user || !mounted) { setLoading(false); return }
    const user = session.user
    const { data: myProfile } = await supabase.from('profiles').select('pseudo_id').eq('id', user.id).single()
    if (myProfile && mounted) setMyPseudoId(myProfile.pseudo_id)
    const [trajets, profiles] = await Promise.all([getAllTrajets(), getAllProfiles()])
    const profileMap = new Map(profiles.map((p: any) => [p.pseudo_id, p]))
    const now = new Date()
    const filtered = periode === 'mois'
      ? trajets.filter((t: any) => {
          const d = new Date(t.date_trajet)
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        })
      : trajets

    const driverMap = new Map<string, any>()
    for (const t of filtered) {
      const p = profileMap.get(t.pseudo_id) as any
            if (!driverMap.has(t.pseudo_id)) {
        driverMap.set(t.pseudo_id, {
          pseudo_id: t.pseudo_id,
          prenom: p?.prenom || 'Conducteur',
          avatar_url: p?.avatar_url || null,
          scores: [], km: 0, trajets: 0,
        })
      }
      const d = driverMap.get(t.pseudo_id)
      d.scores.push(t.score_trajet || 0)
      d.km = parseFloat((d.km + (t.km || 0)).toFixed(1))
      d.trajets += 1
    }

    const list = Array.from(driverMap.values()).map(d => ({
      ...d,
      score: d.scores.length > 0 ? Math.round(d.scores.reduce((a: number, b: number) => a + b, 0) / d.scores.length) : 0,
    })).filter(d => d.trajets > 0)

    setDrivers(list)
    } catch(e) { console.error(e) } finally { if(mounted) setLoading(false) }
    }
    load()
    return () => { mounted = false }
  }, [periode])

  const sorted = [...drivers].sort((a, b) => {
    if (filter === 'score') return b.score - a.score
    if (filter === 'km') return b.km - a.km
    return b.trajets - a.trajets
  })

  const myPos = sorted.findIndex(d => d.pseudo_id === myPseudoId) + 1
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div style={{ minHeight: '100vh', background: C.surface, fontFamily: C.fontSans, paddingBottom: 80 }}>

      {/* HEADER */}
      <div style={{ background: C.greenDeep, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'radial-gradient(circle, rgba(62,189,111,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ padding: '16px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.greenBright, boxShadow: '0 0 8px rgba(62,189,111,0.6)' }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>Classement</span>
          </div>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>DriveScore Maroc</span>
        </div>

        {/* Ma position */}
        {myPos > 0 && (
          <div style={{ margin: '14px 20px 0', background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Ma position</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ background: C.amber, color: C.greenDeep, borderRadius: 20, padding: '4px 12px', fontWeight: 700, fontSize: 14, fontFamily: C.fontMono }}>#{myPos}</div>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>sur {sorted.length}</span>
            </div>
          </div>
        )}

        {/* Période */}
        <div style={{ padding: '14px 20px 20px', display: 'flex', gap: 6, position: 'relative', zIndex: 1 }}>
          {([['mois', 'Ce mois'], ['tout', 'Tout']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setPeriode(key)} style={{
              padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: C.fontSans,
              background: periode === key ? C.greenBright : 'rgba(255,255,255,0.08)',
              color: periode === key ? C.greenDeep : 'rgba(255,255,255,0.6)',
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Filtres */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { key: 'score', label: 'Score' },
            { key: 'km', label: 'Km' },
            { key: 'trajets', label: 'Trajets' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key as any)} style={{
              padding: '10px', borderRadius: 12, border: `1px solid ${filter === f.key ? C.greenAccent : C.borderStrong}`,
              cursor: 'pointer', fontWeight: 500, fontSize: 13, fontFamily: C.fontSans,
              background: filter === f.key ? C.greenMid : C.white,
              color: filter === f.key ? 'white' : C.textSecondary,
            }}>{f.label}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: C.textTertiary }}>
            <div style={{ width: 32, height: 32, border: `2px solid ${C.greenBright}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            Chargement...
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, marginBottom: 6 }}>Aucun conducteur</div>
            <div style={{ fontSize: 13, color: C.textTertiary }}>Activez votre participation dans le tableau de bord</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sorted.map((driver, i) => {
              const isMe = driver.pseudo_id === myPseudoId
              const rank = i + 1
              return (
                <div key={driver.pseudo_id} style={{
                  background: isMe ? 'rgba(42,138,80,0.06)' : C.white,
                  borderRadius: 16, padding: '14px 16px',
                  border: `1px solid ${isMe ? C.greenAccent + '40' : C.border}`,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  {/* Rang */}
                  <div style={{ width: 32, textAlign: 'center', flexShrink: 0 }}>
                    {rank <= 3
                      ? <span style={{ fontSize: 22 }}>{medals[rank - 1]}</span>
                      : <span style={{ fontSize: 14, fontWeight: 600, color: C.textTertiary, fontFamily: C.fontMono }}>#{rank}</span>}
                  </div>

                  {/* Avatar */}
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: isMe ? C.greenAccent : C.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                    {driver.avatar_url
                      ? <img src={driver.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: 13, fontWeight: 600, color: isMe ? 'white' : C.textSecondary, fontFamily: C.fontMono }}>{String(driver.prenom || '?').substring(0, 2).toUpperCase()}</span>}
                  </div>

                  {/* Infos */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>{driver.prenom}</span>
                      {isMe && <span style={{ background: C.greenAccent, color: 'white', fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 20 }}>MOI</span>}
                    </div>
                    <div style={{ fontSize: 11, color: C.textTertiary }}>
                      {driver.km.toFixed(1)} km · {driver.trajets} trajet{driver.trajets > 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Valeur */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 20, fontWeight: 600, color: filter === 'score' ? sc(driver.score) : C.textPrimary, fontFamily: C.fontMono }}>
                      {filter === 'score' ? driver.score : filter === 'km' ? driver.km.toFixed(1) : driver.trajets}
                    </div>
                    <div style={{ fontSize: 10, color: C.textTertiary }}>
                      {filter === 'score' ? '/100' : filter === 'km' ? 'km' : 'trajets'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ textAlign: 'center', fontSize: 11, color: C.textTertiary, padding: '4px 0 8px', lineHeight: 1.6 }}>
          Classement mis à jour en temps réel · DriveScore par Wafa Assurance
        </div>
      </div>

      {/* BOTTOM NAV */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {[
          { label: 'Accueil', path: '/dashboard', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="10" width="5" height="8" rx="1.5" fill="#1E5C35"/><rect x="7.5" y="6" width="5" height="12" rx="1.5" fill="#1E5C35"/><rect x="13" y="2" width="5" height="16" rx="1.5" fill="#3EBD6F"/></svg> },
          { label: 'Télématique', path: '/telematics', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="#8AA898" strokeWidth="1.4"/><circle cx="10" cy="10" r="3" stroke="#8AA898" strokeWidth="1.4"/><path d="M10 3V7M10 13V17M3 10H7M13 10H17" stroke="#8AA898" strokeWidth="1.2" strokeLinecap="round"/></svg> },
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

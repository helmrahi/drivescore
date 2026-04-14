import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getAllTrajets } from '../services/trajetService'
import { getAllProfiles } from '../services/profileService'

const WAFA = {
  vert: '#2E7D32', vertDark: '#1B5E20', vertLight: '#4CAF50',
  or: '#F5A623', orDark: '#D4891A', orLight: '#FDF3E0',
  noir: '#0F172A', gris: '#F8FAFC', grisMid: '#E2E8F0',
}

export default function Leaderboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [drivers, setDrivers] = useState<any[]>([])
  const [myPseudoId, setMyPseudoId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'score' | 'km' | 'trajets'>('score')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: myProfile } = await supabase.from('profiles').select('pseudo_id').eq('id', user.id).single()
    if (myProfile) setMyPseudoId(myProfile.pseudo_id)

    const [trajets, profiles] = await Promise.all([getAllTrajets(), getAllProfiles()])

    const profileMap = new Map(profiles.map((p: any) => [p.pseudo_id, p]))

    const driverMap = new Map<string, any>()
    for (const t of trajets) {
      const p = profileMap.get(t.pseudo_id)
      if (!p?.afficher_leaderboard) continue
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
    setLoading(false)
  }

  function getScoreColor(s: number) {
    if (s >= 90) return '#16A34A'
    if (s >= 80) return '#2E7D32'
    if (s >= 70) return '#D97706'
    return '#DC2626'
  }

  const sorted = [...drivers].sort((a, b) => {
    if (filter === 'score') return b.score - a.score
    if (filter === 'km') return b.km - a.km
    return b.trajets - a.trajets
  })

  const myPos = sorted.findIndex(d => d.pseudo_id === myPseudoId) + 1

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div style={{ minHeight: '100vh', background: WAFA.gris, fontFamily: 'Inter,sans-serif', paddingBottom: 80 }}>

      {/* HEADER */}
      <header style={{ background: `linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`, padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ color: 'white', fontWeight: 800, fontSize: 17 }}>🏆 Classement</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>DriveScore Maroc</div>
        </div>
        {myPos > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Ma position</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ background: WAFA.or, color: WAFA.noir, borderRadius: 20, padding: '4px 12px', fontWeight: 900, fontSize: 15 }}>#{myPos}</div>
              <span style={{ color: 'white', fontSize: 13 }}>sur {sorted.length}</span>
            </div>
          </div>
        )}
      </header>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '12px 16px' }}>

        {/* FILTRES */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[
            { key: 'score', label: '📊 Score' },
            { key: 'km', label: '🛣️ Km' },
            { key: 'trajets', label: '🚗 Trajets' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key as any)} style={{
              padding: '10px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
              background: filter === f.key ? WAFA.vert : 'white',
              color: filter === f.key ? 'white' : '#64748B',
              boxShadow: filter === f.key ? '0 4px 12px rgba(46,125,50,0.3)' : 'none',
            }}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>Chargement...</div>
        ) : sorted.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 20, padding: '40px 24px', textAlign: 'center', border: `0.5px solid ${WAFA.grisMid}` }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: WAFA.noir, marginBottom: 8 }}>Aucun conducteur</div>
            <div style={{ fontSize: 13, color: '#94A3B8' }}>Activez votre participation dans le tableau de bord</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sorted.map((driver, i) => {
              const isMe = driver.pseudo_id === myPseudoId
              const rank = i + 1
              return (
                <div key={driver.pseudo_id} style={{
                  background: isMe ? '#F0FDF4' : 'white',
                  borderRadius: 16, padding: '14px 16px',
                  border: `${isMe ? '2px' : '0.5px'} solid ${isMe ? WAFA.vert : WAFA.grisMid}`,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  {/* Rang */}
                  <div style={{ width: 32, textAlign: 'center', flexShrink: 0 }}>
                    {rank <= 3
                      ? <span style={{ fontSize: 22 }}>{medals[rank - 1]}</span>
                      : <span style={{ fontSize: 15, fontWeight: 800, color: '#94A3B8' }}>#{rank}</span>
                    }
                  </div>

                  {/* Avatar */}
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                    background: isMe ? WAFA.vert : '#E2E8F0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 15, color: isMe ? 'white' : '#64748B',
                  }}>
                    {driver.prenom.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Infos */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: WAFA.noir }}>{driver.prenom}</span>
                      {isMe && <span style={{ background: WAFA.vert, color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 20 }}>MOI</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: '#94A3B8' }}>{driver.km.toFixed(1)} km</span>
                      <span style={{ fontSize: 11, color: '#94A3B8' }}>·</span>
                      <span style={{ fontSize: 11, color: '#94A3B8' }}>{driver.trajets} trajet{driver.trajets > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Valeur filtrée */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: filter === 'score' ? getScoreColor(driver.score) : WAFA.orDark }}>
                      {filter === 'score' ? driver.score : filter === 'km' ? driver.km.toFixed(1) : driver.trajets}
                    </div>
                    <div style={{ fontSize: 10, color: '#94A3B8' }}>
                      {filter === 'score' ? '/100' : filter === 'km' ? 'km' : 'trajets'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ textAlign: 'center', fontSize: 11, color: '#94A3B8', marginTop: 16, lineHeight: 1.6 }}>
          Classement mis à jour en temps réel · DriveScore par Wafa Assurance
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

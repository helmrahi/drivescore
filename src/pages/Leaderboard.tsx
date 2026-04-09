import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const WAFA = {
  or: '#F5A623', orDark: '#D4891A', orLight: '#FDF3E0',
  vert: '#2E7D32', vertLight: '#4CAF50', vertDark: '#1B5E20',
  noir: '#1A1A1A', gris: '#F5F5F5', grisMid: '#E8E8E8',
}

interface Driver {
  pseudo_id: string
  prenom: string
  nom: string
  score: number
  km: number
  trajets: number
  badge: string
}

function getInitiales(prenom: string, nom: string) {
  return `${prenom?.[0] || '?'}${nom?.[0] || '?'}`.toUpperCase()
}

function getAvatarColor(index: number) {
  const colors = [
    { bg: '#FDF3E0', text: '#D4891A' },
    { bg: '#F0FDF4', text: '#2E7D32' },
    { bg: '#EFF6FF', text: '#1D4ED8' },
    { bg: '#FDF4FF', text: '#7E22CE' },
    { bg: '#FFF1F2', text: '#BE123C' },
  ]
  return colors[index % colors.length]
}

function getBadge(score: number, trajets: number) {
  if (score >= 95) return { icon: '👑', label: 'Champion', color: '#F5A623' }
  if (score >= 90) return { icon: '🏅', label: 'Expert', color: '#2E7D32' }
  if (score >= 80) return { icon: '⭐', label: 'Bon conducteur', color: '#3B82F6' }
  if (score >= 70) return { icon: '🔰', label: 'En progression', color: '#8B5CF6' }
  return { icon: '🌱', label: 'Débutant', color: '#94A3B8' }
}

function getMedal(rank: number) {
  if (rank === 1) return { icon: '🥇', color: '#F5A623', bg: '#FDF3E0' }
  if (rank === 2) return { icon: '🥈', color: '#94A3B8', bg: '#F1F5F9' }
  if (rank === 3) return { icon: '🥉', color: '#D4891A', bg: '#FEF3C7' }
  return null
}

export default function Leaderboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [myPseudoId, setMyPseudoId] = useState('')
  const [filter, setFilter] = useState<'score' | 'km' | 'trajets'>('score')

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { navigate('/login'); return }

        const { data: myProfile } = await supabase
          .from('profiles')
          .select('pseudo_id')
          .eq('id', user.id)
          .single()
        if (myProfile?.pseudo_id) setMyPseudoId(myProfile.pseudo_id)

        const { data: profiles } = await supabase
          .from('profiles')
          .select('pseudo_id, prenom, nom, afficher_leaderboard')
          .eq('afficher_leaderboard', true)

        if (!profiles || profiles.length === 0) { setLoading(false); return }

        const { data: trajets } = await supabase
          .from('trajets')
          .select('pseudo_id, score_trajet, km')

        const driversData: Driver[] = profiles.map(p => {
          const myTrajets = (trajets || []).filter(t => t.pseudo_id === p.pseudo_id)
          const avgScore = myTrajets.length > 0
            ? Math.round(myTrajets.reduce((s, t) => s + (t.score_trajet || 0), 0) / myTrajets.length)
            : 0
          const totalKm = parseFloat(myTrajets.reduce((s, t) => s + (t.km || 0), 0).toFixed(1))
          const badge = getBadge(avgScore, myTrajets.length)
          return {
            pseudo_id: p.pseudo_id,
            prenom: p.prenom || 'Conducteur',
            nom: p.nom || '',
            score: avgScore,
            km: totalKm,
            trajets: myTrajets.length,
            badge: badge.icon,
          }
        }).filter(d => d.trajets > 0)

        setDrivers(driversData)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [navigate])

  const sorted = [...drivers].sort((a, b) => {
    if (filter === 'score') return b.score - a.score
    if (filter === 'km') return b.km - a.km
    return b.trajets - a.trajets
  })

  const myRank = sorted.findIndex(d => d.pseudo_id === myPseudoId) + 1

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: WAFA.gris }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: `4px solid ${WAFA.vert}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: WAFA.gris, fontFamily: 'Inter,sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } } @keyframes fadeIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }`}</style>

      {/* HEADER */}
      <div style={{
        background: `linear-gradient(135deg, ${WAFA.vertDark} 0%, ${WAFA.vert} 100%)`,
        padding: '0', position: 'sticky', top: 0, zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
          <button onClick={() => navigate('/dashboard')} style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
            borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13
          }}>← Retour</button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'white', fontWeight: 900, fontSize: 16 }}>🏆 Classement</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>DriveScore Maroc</div>
          </div>
          <div style={{ width: 80 }} />
        </div>

        {/* Mon rang */}
        {myRank > 0 && (
          <div style={{ margin: '0 16px 16px', background: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Ma position</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ background: WAFA.or, color: WAFA.noir, borderRadius: 20, padding: '4px 14px', fontWeight: 900, fontSize: 16 }}>#{myRank}</div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>sur {sorted.length}</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px' }}>

        {/* FILTRES */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[
            { key: 'score', label: '📊 Score' },
            { key: 'km', label: '🛣️ Km' },
            { key: 'trajets', label: '🚗 Trajets' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key as any)} style={{
              flex: 1, padding: '10px 8px', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 13,
              background: filter === f.key ? WAFA.vert : 'white',
              color: filter === f.key ? 'white' : '#64748B',
              boxShadow: filter === f.key ? `0 4px 12px rgba(46,125,50,0.3)` : 'none',
              transition: 'all 0.2s'
            }}>{f.label}</button>
          ))}
        </div>

        {/* TOP 3 */}
        {sorted.length >= 3 && (
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
            {/* 2ème */}
            {[sorted[1], sorted[0], sorted[2]].map((driver, i) => {
              const realRank = i === 0 ? 2 : i === 1 ? 1 : 3
              const medal = getMedal(realRank)
              const avatarColor = getAvatarColor(sorted.indexOf(driver))
              const isMe = driver.pseudo_id === myPseudoId
              const height = realRank === 1 ? 160 : realRank === 2 ? 130 : 110
              return (
                <div key={driver.pseudo_id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeIn 0.5s ease' }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{medal?.icon}</div>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: isMe ? WAFA.vert : avatarColor.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: 18,
                    color: isMe ? 'white' : avatarColor.text,
                    border: isMe ? `3px solid ${WAFA.or}` : `2px solid ${medal?.color}`,
                    marginBottom: 6, boxShadow: realRank === 1 ? `0 4px 16px rgba(245,166,35,0.4)` : 'none'
                  }}>
                    {getInitiales(driver.prenom, driver.nom)}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: WAFA.noir, textAlign: 'center', marginBottom: 2 }}>
                    {driver.prenom}{isMe ? ' (Moi)' : ''}
                  </div>
                  <div style={{
                    width: '100%', background: medal?.bg, borderRadius: '12px 12px 0 0',
                    height, display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', border: `2px solid ${medal?.color}20`
                  }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: medal?.color }}>
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

        {/* LISTE COMPLÈTE */}
        <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          {sorted.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏁</div>
              <div style={{ fontSize: 14 }}>Aucun conducteur classé pour le moment</div>
            </div>
          ) : (
            sorted.map((driver, i) => {
              const rank = i + 1
              const medal = getMedal(rank)
              const isMe = driver.pseudo_id === myPseudoId
              const badge = getBadge(driver.score, driver.trajets)
              const avatarColor = getAvatarColor(i)
              const scoreColor = driver.score >= 80 ? WAFA.vert : driver.score >= 60 ? WAFA.or : '#EF4444'

              return (
                <div key={driver.pseudo_id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px',
                  background: isMe ? '#F0FDF4' : 'white',
                  borderBottom: `1px solid ${WAFA.grisMid}`,
                  borderLeft: isMe ? `4px solid ${WAFA.vert}` : '4px solid transparent',
                  animation: `fadeIn ${0.1 * i + 0.2}s ease`
                }}>

                  {/* Rang */}
                  <div style={{ width: 28, textAlign: 'center', flexShrink: 0 }}>
                    {medal ? (
                      <span style={{ fontSize: 20 }}>{medal.icon}</span>
                    ) : (
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8' }}>#{rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                    background: isMe ? WAFA.vert : avatarColor.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: 16,
                    color: isMe ? 'white' : avatarColor.text,
                    border: isMe ? `2px solid ${WAFA.or}` : 'none'
                  }}>
                    {getInitiales(driver.prenom, driver.nom)}
                  </div>

                  {/* Infos */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: WAFA.noir }}>
                        {driver.prenom} {driver.nom?.[0]}.
                      </span>
                      {isMe && (
                        <span style={{ fontSize: 10, fontWeight: 700, background: WAFA.vert, color: 'white', padding: '1px 6px', borderRadius: 20 }}>Moi</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11 }}>{badge.icon}</span>
                      <span style={{ fontSize: 11, color: '#94A3B8' }}>{getBadge(driver.score, driver.trajets).label}</span>
                      <span style={{ fontSize: 11, color: '#94A3B8' }}>· {driver.trajets} trajet{driver.trajets > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: filter === 'score' ? scoreColor : WAFA.noir }}>
                      {filter === 'score' ? driver.score : filter === 'km' ? driver.km.toFixed(1) : driver.trajets}
                    </div>
                    <div style={{ fontSize: 10, color: '#94A3B8' }}>
                      {filter === 'score' ? '/100' : filter === 'km' ? 'km' : 'trajets'}
                    </div>
                  </div>

                  {/* Barre score */}
                  {filter === 'score' && (
                    <div style={{ width: 40, flexShrink: 0 }}>
                      <div style={{ background: WAFA.grisMid, borderRadius: 4, height: 36, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                        <div style={{ width: '100%', height: `${driver.score}%`, background: scoreColor, borderRadius: 4, transition: 'height 1s ease' }} />
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        <div style={{ marginTop: 12, textAlign: 'center', fontSize: 11, color: '#94A3B8', padding: '8px' }}>
          Classement mis à jour en temps réel · DriveScore by Wafa Assurance
        </div>
      </div>
    </div>

      {/* BOTTOM NAV */}
      <nav id="bottom-nav-leaderboard" style={{ position:'fixed', bottom:0, left:0, right:0, background:'white', borderTop:'0.5px solid #E2E8F0', display:'flex', zIndex:100, paddingBottom:'env(safe-area-inset-bottom)' }}>
        {[
          { icon:'🏠', label:'Accueil', path:'/dashboard' },
          { icon:'🚗', label:'Télématique', path:'/telematics' },
          { icon:'📋', label:'Trajets', path:'/trajets' },
          { icon:'🏆', label:'Classement', path:'/leaderboard' },
        ].map(item => {
          const isActive = location.pathname === item.path
          return (
            <button key={item.path} onClick={() => navigate(item.path)} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2, padding:'10px 0', background:'none', border:'none', cursor:'pointer', color:isActive ? '#2E7D32' : '#94A3B8' }}>
              <span style={{ fontSize:20 }}>{item.icon}</span>
              <span style={{ fontSize:10, fontWeight:isActive ? 700 : 400 }}>{item.label}</span>
              {isActive && <div style={{ width:4, height:4, borderRadius:'50%', background:'#2E7D32' }} />}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

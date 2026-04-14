import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useDashboard } from '../hooks/useDashboard'
import { DS_GLOBAL_STYLES } from '../design-system/components'

const WAFA = {
  vert: '#2E7D32', vertDark: '#1B5E20', vertLight: '#4CAF50',
  or: '#F5A623', orDark: '#D4891A', orLight: '#FDF3E0',
  noir: '#0F172A', gris: '#F8FAFC', grisMid: '#E2E8F0',
}

function getScoreColor(s: number) {
  if (s >= 90) return '#16A34A'
  if (s >= 80) return '#2E7D32'
  if (s >= 70) return '#D97706'
  if (s >= 60) return '#EA580C'
  return '#DC2626'
}

function getScoreLabel(s: number) {
  if (s >= 90) return 'Excellent'
  if (s >= 80) return 'Bon conducteur'
  if (s >= 70) return 'Moyen'
  return 'À améliorer'
}

function getReduction(s: number) {
  if (s >= 90) return 15
  if (s >= 80) return 10
  if (s >= 70) return 5
  return 0
}

export default function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, loading: authLoading, logout } = useAuth()
  const { trajets, score, km, facture, loading: dataLoading } = useDashboard(profile?.pseudo_id)
  const [leaderboardActif, setLeaderboardActif] = React.useState<boolean | null>(null)
  const toggleActif = leaderboardActif !== null ? leaderboardActif : (profile?.afficher_leaderboard ?? false)

  const loading = authLoading || dataLoading
  const scoreColor = getScoreColor(score)
  const reduction = getReduction(score)
  const prime = Math.round(200 + km * 0.5)
  const total = Math.round(prime * (1 - reduction / 100))
  const economie = Math.round(600 - total)
  const dernierTrajet = trajets[0]

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: WAFA.gris }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: `3px solid ${WAFA.vert}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        ${DS_GLOBAL_STYLES}
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', system-ui, sans-serif; }
      `}</style>

      <div style={{ minHeight: '100vh', background: WAFA.gris, display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif' }}>

        {/* HEADER COMPACT */}
        <header style={{
          background: `linear-gradient(135deg, ${WAFA.vertDark}, ${WAFA.vert})`,
          padding: '14px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/wafa-logo.png" alt="Wafa" style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'cover' }} />
            <div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 13, lineHeight: 1 }}>
                WAFA <span style={{ color: WAFA.or }}>ASSURANCE</span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, letterSpacing: '0.08em' }}>DRIVESCORE PAYD</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 9, letterSpacing: '0.06em' }}>Bonjour</div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>{profile?.prenom} 👋</div>
            </div>
            <button onClick={logout} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
              Quitter
            </button>
          </div>
        </header>

        {/* HERO — Score + Prime */}
        <div style={{
          background: `linear-gradient(180deg, ${WAFA.vert} 0%, ${WAFA.vertDark} 100%)`,
          padding: '14px 16px 20px',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          {/* Score gauge */}
          <div style={{ flexShrink: 0, position: 'relative' }}>
            <svg width="90" height="90" viewBox="0 0 90 90">
              <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6"/>
              <circle cx="45" cy="45" r="38" fill="none" stroke={WAFA.or} strokeWidth="6"
                strokeDasharray={`${(2 * Math.PI * 38 * score / 100).toFixed(2)} ${(2 * Math.PI * 38 * (1 - score / 100)).toFixed(2)}`}
                strokeLinecap="round"
                transform="rotate(-90 45 45)"
              />
              <text x="45" y="41" textAnchor="middle" fill="white" fontSize="20" fontWeight="900" fontFamily="Inter,sans-serif">{score}</text>
              <text x="45" y="55" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="10" fontFamily="Inter,sans-serif">/100</text>
            </svg>
          </div>
          {/* Infos */}
          <div style={{ flex: 1 }}>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginBottom: 4 }}>Score de conduite</div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 20, marginBottom: 6 }}>{getScoreLabel(score)}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 8, padding: '6px 10px', flex: 1, textAlign: 'center' }}>
                <div style={{ color: WAFA.or, fontWeight: 800, fontSize: 16 }}>{total} MAD</div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10 }}>Prime ce mois</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 8, padding: '6px 10px', flex: 1, textAlign: 'center' }}>
                <div style={{ color: '#86EFAC', fontWeight: 800, fontSize: 16 }}>-{reduction}%</div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10 }}>Réduction</div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENU SCROLLABLE */}
        <div style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 72 }}>

          {/* KPIs rapides */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { label: 'Km', value: km.toFixed(2), unit: 'km', color: '#3B82F6' },
              { label: 'Économie', value: Math.max(0, economie), unit: 'MAD', color: '#16A34A' },
              { label: 'Trajets', value: trajets.length, unit: '', color: WAFA.orDark },
            ].map((k, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 12, padding: '8px 10px', textAlign: 'center', border: `0.5px solid ${WAFA.grisMid}` }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: k.color }}>{k.value}{k.unit && <span style={{ fontSize: 11 }}> {k.unit}</span>}</div>
                <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Dernier trajet + coaching */}
          {dernierTrajet ? (
            <div style={{ background: 'white', borderRadius: 16, padding: '10px 14px', border: `0.5px solid ${WAFA.grisMid}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: WAFA.noir }}>🗺️ Dernier trajet</span>
                <span style={{ fontSize: 11, color: '#94A3B8' }}>{dernierTrajet.date_trajet}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: WAFA.noir }}>
                    {dernierTrajet.ville_depart && dernierTrajet.ville_arrivee
                      ? `${dernierTrajet.ville_depart} → ${dernierTrajet.ville_arrivee}`
                      : `${String(dernierTrajet.km)} km · ${String(dernierTrajet.type_route)}`}
                  </div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>{parseFloat(dernierTrajet.km).toFixed(2)} km · {parseFloat(dernierTrajet.cout_mad).toFixed(2)} MAD</div>
                </div>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: getScoreColor(dernierTrajet.score_trajet) + '18',
                  border: `2px solid ${getScoreColor(dernierTrajet.score_trajet)}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: getScoreColor(dernierTrajet.score_trajet), lineHeight: 1 }}>{dernierTrajet.score_trajet}</span>
                  <span style={{ fontSize: 8, color: '#94A3B8' }}>/100</span>
                </div>
              </div>
              {/* Coaching */}
              <div style={{ background: WAFA.gris, borderRadius: 10, padding: '10px 12px', borderLeft: `3px solid ${WAFA.vert}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: WAFA.vert, marginBottom: 3 }}>💡 Conseil du jour</div>
                <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>
                  {dernierTrajet.freinages_brusques > 2
                    ? 'Anticipez davantage les ralentissements pour réduire vos freinages brusques et améliorer votre score.'
                    : dernierTrajet.score_trajet >= 90
                    ? 'Excellent trajet ! Continuez comme ça pour maintenir votre réduction de prime.'
                    : 'Adoptez une conduite plus souple pour gagner des points et réduire votre prime.'}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: 16, padding: '24px 16px', textAlign: 'center', border: `0.5px solid ${WAFA.grisMid}` }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🛣️</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: WAFA.noir, marginBottom: 4 }}>Aucun trajet encore</div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 14 }}>Démarrez un trajet pour voir vos données</div>
              <button onClick={() => navigate('/telematics')} style={{ background: WAFA.vert, color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                🚗 Démarrer
              </button>
            </div>
          )}

          {/* Détail facture compact */}
          <div style={{ background: 'white', borderRadius: 16, padding: '10px 14px', border: `0.5px solid ${WAFA.grisMid}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: WAFA.noir, marginBottom: 10 }}>💰 Facture {new Date().toLocaleString('fr-FR', { month: 'long' })}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Base', val: '200 MAD' },
                { label: `${Math.round(km)} km × 0,50`, val: `${(km * 0.5).toFixed(2)} MAD` },
                { label: `Réduction -${reduction}%`, val: `-${Math.round(prime * reduction / 100)} MAD`, green: true },
              ].map((l, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: l.green ? WAFA.vert : '#64748B' }}>
                  <span>{l.label}</span>
                  <span style={{ fontWeight: 600 }}>{l.val}</span>
                </div>
              ))}
              <div style={{ borderTop: `1px solid ${WAFA.grisMid}`, paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: WAFA.noir }}>Total</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: WAFA.orDark }}>{total} MAD</span>
              </div>
            </div>
          </div>

          {/* Économies vs classique */}
          <div style={{ background: `linear-gradient(135deg, #052E16, ${WAFA.vertDark})`, borderRadius: 16, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginBottom: 4 }}>Économies vs assurance classique</div>
              <div style={{ color: '#86EFAC', fontWeight: 800, fontSize: 22 }}>+{Math.max(0, economie)} MAD</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>600 MAD fixe → {total} MAD PAYD</div>
            </div>
            <div style={{ fontSize: 36 }}>💚</div>
          </div>

          {/* Comment ça marche */}
          <div onClick={() => navigate('/comment-ca-marche')} style={{ background: 'white', borderRadius: 16, padding: '14px 16px', border: `0.5px solid ${WAFA.grisMid}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: WAFA.noir }}>📖 Comment est calculé mon score ?</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>Seuils, pénalités, réductions — tout comprendre</div>
            </div>
            <span style={{ color: '#94A3B8', fontSize: 18 }}>→</span>
          </div>

        {/* Toggle leaderboard */}
          <div style={{ background: 'white', borderRadius: 16, padding: '12px 16px', border: `0.5px solid ${WAFA.grisMid}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: WAFA.noir }}>🏆 Classement public</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>Visible par les autres conducteurs</div>
            </div>
            <div onClick={async () => {
              const newVal = !toggleActif
              setLeaderboardActif(newVal)
              const { updateProfile } = await import('../services/profileService')
              const { supabase } = await import('../lib/supabase')
              const { data: { user } } = await supabase.auth.getUser()
              if (user) await updateProfile(user.id, { afficher_leaderboard: newVal })
            }} style={{
              width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
              background: toggleActif ? WAFA.vert : '#CBD5E1',
              position: 'relative', transition: 'background 0.2s', flexShrink: 0,
            }}>
              <div style={{
                position: 'absolute', top: 2,
                left: toggleActif ? 22 : 2,
                width: 20, height: 20, borderRadius: '50%',
                background: 'white', transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </div>
          </div>

        </div>

        {/* BOTTOM NAV */}
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'white', borderTop: `0.5px solid ${WAFA.grisMid}`,
          display: 'flex', zIndex: 100,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          {[
            { icon: '🏠', label: 'Accueil', path: '/dashboard' },
            { icon: '🚗', label: 'Télématique', path: '/telematics' },
            { icon: '📋', label: 'Trajets', path: '/trajets' },
            { icon: '🏆', label: 'Classement', path: '/leaderboard' },
          ].map(item => {
            const isActive = location.pathname === item.path
            return (
              <button key={item.path} onClick={() => navigate(item.path)} style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 2, padding: '10px 0',
                background: 'none', border: 'none', cursor: 'pointer',
                color: isActive ? WAFA.vert : '#94A3B8',
              }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 400 }}>{item.label}</span>
                {isActive && <div style={{ width: 4, height: 4, borderRadius: '50%', background: WAFA.vert }} />}
              </button>
            )
          })}
        </nav>
      </div>
    </>
  )
}

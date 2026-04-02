import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const WAFA = {
  or: '#F5A623', orDark: '#D4891A', orLight: '#FDF3E0',
  vert: '#2E7D32', vertLight: '#4CAF50', vertDark: '#1B5E20',
  noir: '#1A1A1A', gris: '#F5F5F5', grisMid: '#E8E8E8',
}

function WafaLogo({ size = 40 }: { size?: number }) {
  return (
    <img src="/wafa-logo.png" alt="Wafa Assurance"
      style={{ width: size, height: size, borderRadius: size * 0.15, objectFit: 'cover' }} />
  )
}

export default function Dashboard() {
  const [prenom, setPrenom] = useState('')
  const [score] = useState(87)
  const [km] = useState(342)
  const navigate = useNavigate()
  const estimation = Math.round(200 + km * 0.5)
  const reduction = Math.round(estimation * 0.1)
  const total = estimation - reduction
  const scoreColor = score >= 80 ? WAFA.vert : score >= 60 ? WAFA.or : '#EF4444'
  const scoreBg = score >= 80 ? '#F0FDF4' : score >= 60 ? WAFA.orLight : '#FEF2F2'
  const scoreLabel = score >= 80 ? '🏅 Excellent' : score >= 60 ? '⚠️ Moyen' : '🔴 À améliorer'

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { navigate('/login'); return }
      supabase.from('profiles').select('prenom,nom').eq('id', data.user.id).single()
        .then(({ data: p }) => { if (p?.prenom) setPrenom(p.prenom) })
    })
  }, [navigate])

  async function logout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const TRAJETS = [
    { date: "Aujourd'hui", km: 45, route: 'Ville', score: 92, cout: 22.5 },
    { date: 'Hier', km: 23, route: 'Autoroute', score: 88, cout: 11.5 },
    { date: 'Il y a 2j', km: 67, route: 'Route', score: 75, cout: 33.5 },
  ]

  const BADGES = [
    { icon: '🏅', label: 'Bon conducteur', desc: 'Score > 85', color: WAFA.vert, bg: '#F0FDF4' },
    { icon: '🌿', label: 'Éco-driver', desc: '< 500 km/mois', color: WAFA.vert, bg: '#F0FDF4' },
    { icon: '⭐', label: 'Zéro incident', desc: '7 jours clean', color: WAFA.orDark, bg: WAFA.orLight },
  ]

  return (
    <div style={{ minHeight: '100vh', background: WAFA.gris, fontFamily: 'Inter,sans-serif' }}>

      {/* HEADER */}
      <header style={{
        background: 'white', borderBottom: `1px solid ${WAFA.grisMid}`,
        padding: '0 32px', position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <WafaLogo size={36} />
          <div>
            <div style={{ fontWeight: 900, fontSize: 15, color: WAFA.noir, letterSpacing: '-0.3px' }}>
              WAFA <span style={{ color: WAFA.vert }}>ASSURANCE</span>
            </div>
            <div style={{ fontSize: 10, color: '#94A3B8', letterSpacing: '0.8px', marginTop: -1 }}>DRIVESCORE PAYD</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => navigate('/trajets')} style={{
            background: `linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`,
            color: 'white', border: 'none', borderRadius: 10,
            padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            boxShadow: `0 4px 12px rgba(46,125,50,0.3)`
          }}>
            + Déclarer un trajet
          </button>
          <button onClick={logout} style={{
            background: 'none', border: `1.5px solid ${WAFA.grisMid}`,
            color: '#EF4444', borderRadius: 10, padding: '8px 16px',
            fontWeight: 600, fontSize: 13, cursor: 'pointer'
          }}>
            Déconnexion
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 20px' }}>

        {/* GREETING */}
        <div style={{
          background: `linear-gradient(135deg,${WAFA.vertDark} 0%,${WAFA.vert} 100%)`,
          borderRadius: 20, padding: '28px 32px', marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(245,166,35,0.1)' }} />
          <div style={{ position: 'absolute', right: 80, bottom: -60, width: 150, height: 150, borderRadius: '50%', background: 'rgba(0,0,0,0.08)' }} />
          <div>
            <h1 style={{ color: 'white', fontSize: 26, fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
              Bonjour {prenom} 👋
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, margin: 0 }}>
              Voici votre tableau de bord DriveScore — Avril 2026
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ background: WAFA.or, color: WAFA.noir, borderRadius: 12, padding: '10px 18px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.5px', marginBottom: 2 }}>FACTURE DU MOIS</div>
              <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px' }}>{total} MAD</div>
            </div>
          </div>
        </div>

        {/* KPI CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>

          {/* Score */}
          <div style={{
            background: 'white', borderRadius: 20, padding: 24,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            borderTop: `4px solid ${scoreColor}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.5px' }}>SCORE CONDUITE</span>
              <span style={{ fontSize: 18 }}>📊</span>
            </div>
            <div style={{ fontSize: 56, fontWeight: 900, color: scoreColor, lineHeight: 1, marginBottom: 4 }}>{score}</div>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 14 }}>points sur 100</div>
            <div style={{ background: WAFA.grisMid, borderRadius: 8, height: 8, overflow: 'hidden', marginBottom: 10 }}>
              <div style={{ width: `${score}%`, height: '100%', background: `linear-gradient(90deg,${scoreColor},${WAFA.vertLight})`, borderRadius: 8, transition: 'width 1s ease' }} />
            </div>
            <div style={{ display: 'inline-block', padding: '5px 12px', borderRadius: 20, background: scoreBg, color: scoreColor, fontSize: 12, fontWeight: 700 }}>
              {scoreLabel}
            </div>
          </div>

          {/* Km */}
          <div style={{
            background: 'white', borderRadius: 20, padding: 24,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            borderTop: '4px solid #3B82F6'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.5px' }}>KM CE MOIS</span>
              <span style={{ fontSize: 18 }}>🛣️</span>
            </div>
            <div style={{ fontSize: 56, fontWeight: 900, color: '#3B82F6', lineHeight: 1, marginBottom: 4 }}>{km}</div>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 16 }}>kilomètres parcourus</div>
            <div style={{ background: '#EFF6FF', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ fontSize: 12, color: '#3B82F6', fontWeight: 600 }}>
                💡 Vous avez parcouru {km} km ce mois
              </div>
            </div>
          </div>

          {/* Facture */}
          <div style={{
            background: 'white', borderRadius: 20, padding: 24,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            borderTop: `4px solid ${WAFA.or}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.5px' }}>FACTURE ESTIMÉE</span>
              <span style={{ fontSize: 18 }}>💰</span>
            </div>
            <div style={{ fontSize: 56, fontWeight: 900, color: WAFA.orDark, lineHeight: 1, marginBottom: 4 }}>{total}</div>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 16 }}>MAD ce mois</div>
            <div style={{ background: WAFA.orLight, borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ fontSize: 11, color: WAFA.orDark, fontWeight: 600 }}>
                200 + {km}km × 0,50 − {reduction} MAD réduction
              </div>
            </div>
          </div>
        </div>

        {/* BADGES + DÉTAIL FACTURE */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

          {/* Badges */}
          <div style={{ background: 'white', borderRadius: 20, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: WAFA.noir, margin: 0 }}>🎖️ Mes badges</h2>
              <span style={{ fontSize: 11, color: '#94A3B8', background: WAFA.gris, padding: '3px 10px', borderRadius: 20 }}>Ce mois</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {BADGES.map((b, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', background: b.bg, borderRadius: 12,
                  border: `1px solid ${b.color}20`
                }}>
                  <span style={{ fontSize: 22 }}>{b.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: b.color }}>{b.label}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{b.desc}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', background: b.color, color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                    Obtenu
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Détail facture */}
          <div style={{ background: 'white', borderRadius: 20, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: WAFA.noir, margin: 0 }}>💰 Détail facture</h2>
              <span style={{ fontSize: 11, color: WAFA.vert, background: '#F0FDF4', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>Avril 2026</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { label: 'Abonnement mensuel de base', val: '200,00 MAD', color: WAFA.noir },
                { label: `${km} km × 0,50 MAD/km`, val: `${(km * 0.5).toFixed(2)} MAD`, color: WAFA.noir },
                { label: `Réduction score (${score}/100 → -10%)`, val: `-${reduction},00 MAD`, color: WAFA.vert },
              ].map((l, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 0', borderBottom: `1px solid ${WAFA.grisMid}`
                }}>
                  <span style={{ fontSize: 13, color: '#64748B' }}>{l.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: l.color }}>{l.val}</span>
                </div>
              ))}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginTop: 12, padding: '14px 18px',
                background: `linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`,
                borderRadius: 12
              }}>
                <span style={{ fontWeight: 800, color: 'white', fontSize: 14 }}>TOTAL CE MOIS</span>
                <span style={{ fontWeight: 900, fontSize: 22, color: WAFA.or }}>{total} MAD</span>
              </div>
            </div>
          </div>
        </div>

        {/* HISTORIQUE TRAJETS */}
        <div style={{ background: 'white', borderRadius: 20, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: WAFA.noir, margin: 0 }}>🗺️ Derniers trajets</h2>
            <button onClick={() => navigate('/trajets')} style={{
              background: `linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`,
              color: 'white', border: 'none', borderRadius: 10,
              padding: '8px 16px', fontWeight: 700, fontSize: 12, cursor: 'pointer'
            }}>
              + Nouveau trajet
            </button>
          </div>

          {/* Header tableau */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 80px 100px 80px 90px',
            padding: '10px 16px', background: WAFA.gris, borderRadius: 10, marginBottom: 8
          }}>
            {['Trajet', 'Km', 'Type', 'Score', 'Coût'].map((h, i) => (
              <div key={i} style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.5px' }}>{h}</div>
            ))}
          </div>

          {TRAJETS.map((t, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1fr 80px 100px 80px 90px',
              padding: '14px 16px', borderRadius: 12, marginBottom: 6,
              background: i % 2 === 0 ? 'white' : WAFA.gris,
              border: `1px solid ${WAFA.grisMid}`, alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: t.route === 'Ville' ? '#EFF6FF' : t.route === 'Autoroute' ? '#F0FDF4' : WAFA.orLight,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0
                }}>
                  {t.route === 'Ville' ? '🏙️' : t.route === 'Autoroute' ? '🚀' : '🛣️'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: WAFA.noir }}>{t.date}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>Trajet enregistré</div>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: WAFA.noir }}>{t.km} km</div>
              <div>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                  background: t.route === 'Ville' ? '#EFF6FF' : t.route === 'Autoroute' ? '#F0FDF4' : WAFA.orLight,
                  color: t.route === 'Ville' ? '#3B82F6' : t.route === 'Autoroute' ? WAFA.vert : WAFA.orDark
                }}>
                  {t.route}
                </span>
              </div>
              <div>
                <span style={{
                  fontSize: 12, fontWeight: 800, padding: '4px 10px', borderRadius: 20,
                  background: t.score >= 90 ? '#F0FDF4' : t.score >= 75 ? WAFA.orLight : '#FEF2F2',
                  color: t.score >= 90 ? WAFA.vert : t.score >= 75 ? WAFA.orDark : '#EF4444'
                }}>
                  {t.score}/100
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 13, color: WAFA.orDark }}>{t.cout} MAD</div>
            </div>
          ))}

          {/* Total */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 16px', marginTop: 8,
            background: WAFA.orLight, borderRadius: 12, border: `1px solid ${WAFA.or}30`
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: WAFA.orDark }}>
              Total ({TRAJETS.length} trajets affichés)
            </span>
            <span style={{ fontSize: 15, fontWeight: 900, color: WAFA.orDark }}>
              {TRAJETS.reduce((s, t) => s + t.cout, 0).toFixed(1)} MAD
            </span>
          </div>
        </div>

        {/* CONFORMITÉ CNDP */}
        <div style={{
          marginTop: 20, padding: '14px 20px',
          background: WAFA.orLight, borderRadius: 14,
          border: `1px solid ${WAFA.or}30`,
          display: 'flex', alignItems: 'center', gap: 12
        }}>
          <WafaLogo size={28} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: WAFA.vertDark }}>Wafa Assurance · Agréé ACAPS</div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>Données hébergées en Europe · Conforme CNDP (Loi 09-08) · © 2026</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {['🔐 CNDP', '🇪🇺 Europe', '✅ ACAPS'].map((tag, i) => (
              <span key={i} style={{ fontSize: 11, fontWeight: 600, color: WAFA.vert, background: '#F0FDF4', padding: '3px 10px', borderRadius: 20, border: `1px solid ${WAFA.vert}20` }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

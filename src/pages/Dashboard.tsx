import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const WAFA = {
  or: '#F5A623', orDark: '#D4891A', orLight: '#FDF3E0',
  vert: '#2E7D32', vertLight: '#4CAF50', vertDark: '#1B5E20',
  noir: '#1A1A1A', gris: '#F5F5F5', grisMid: '#E8E8E8',
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
    <>
      <style>{`
        .dash-header { padding: 0 16px; height: 56px; }
        .dash-header-logo span { display: none; }
        .dash-kpi { grid-template-columns: 1fr !important; }
        .dash-bottom { grid-template-columns: 1fr !important; }
        .dash-trajet-row { grid-template-columns: 1fr !important; gap: 4px !important; }
        .dash-trajet-head { display: none !important; }
        .dash-trajet-cell-type { display: inline-block; }
        .dash-trajet-cell-score { display: inline-block; }
        .dash-trajet-cell-cout { display: inline-block; }
        .dash-btn-declarer span { display: none; }
        @media (min-width: 640px) {
          .dash-header { padding: 0 32px; height: 64px; }
          .dash-header-logo span { display: inline; }
          .dash-kpi { grid-template-columns: repeat(3, 1fr) !important; }
          .dash-bottom { grid-template-columns: 1fr 1fr !important; }
          .dash-trajet-row { grid-template-columns: 1fr 80px 100px 80px 90px !important; }
          .dash-trajet-head { display: grid !important; }
          .dash-btn-declarer span { display: inline; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: WAFA.gris, fontFamily: 'Inter,sans-serif' }}>

        {/* HEADER */}
        <header className="dash-header" style={{
          background: 'white', borderBottom: `1px solid ${WAFA.grisMid}`,
          position: 'sticky', top: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/wafa-logo.png" alt="Wafa" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />
            <div>
              <div style={{ fontWeight: 900, fontSize: 13, color: WAFA.noir, letterSpacing: '-0.3px', lineHeight: 1 }}>
                WAFA <span style={{ color: WAFA.vert }}>ASSURANCE</span>
              </div>
              <div style={{ fontSize: 9, color: '#94A3B8', letterSpacing: '0.8px' }}>DRIVESCORE PAYD</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => navigate('/telematics')} style={{
              background: `linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`,
              color: 'white', border: 'none', borderRadius: 8,
              padding: '8px 12px', fontWeight: 700, fontSize: 12, cursor: 'pointer'
            }}>
              🚗 <span>Télématique</span>
            </button>
            <button onClick={() => navigate('/trajets')} style={{
              background: WAFA.orLight, border: `1.5px solid ${WAFA.or}`,
              color: WAFA.orDark, borderRadius: 8,
              padding: '8px 12px', fontWeight: 700, fontSize: 12, cursor: 'pointer'
            }}>
              + <span>Trajet</span>
            </button>
            <button onClick={logout} style={{
              background: 'none', border: `1.5px solid ${WAFA.grisMid}`,
              color: '#EF4444', borderRadius: 8, padding: '7px 10px',
              fontWeight: 600, fontSize: 12, cursor: 'pointer'
            }}>
              ⬅️
            </button>
          </div>
        </header>

        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '16px' }}>

          {/* GREETING */}
          <div style={{
            background: `linear-gradient(135deg,${WAFA.vertDark} 0%,${WAFA.vert} 100%)`,
            borderRadius: 16, padding: '20px', marginBottom: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <h1 style={{ color: 'white', fontSize: 20, fontWeight: 900, margin: '0 0 4px' }}>
                Bonjour {prenom} 👋
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, margin: 0 }}>
                Tableau de bord · Avril 2026
              </p>
            </div>
            <div style={{ background: WAFA.or, color: WAFA.noir, borderRadius: 10, padding: '10px 14px', textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 2 }}>FACTURE DU MOIS</div>
              <div style={{ fontSize: 24, fontWeight: 900 }}>{total} MAD</div>
            </div>
          </div>

          {/* KPI CARDS */}
          <div className="dash-kpi" style={{ display: 'grid', gap: 12, marginBottom: 16 }}>

            <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: `4px solid ${scoreColor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8' }}>SCORE CONDUITE</span>
                <span style={{ fontSize: 16 }}>📊</span>
              </div>
              <div style={{ fontSize: 48, fontWeight: 900, color: scoreColor, lineHeight: 1, marginBottom: 4 }}>{score}</div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>points sur 100</div>
              <div style={{ background: WAFA.grisMid, borderRadius: 8, height: 8, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{ width: `${score}%`, height: '100%', background: scoreColor, borderRadius: 8 }} />
              </div>
              <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 20, background: scoreBg, color: scoreColor, fontSize: 11, fontWeight: 700 }}>
                {scoreLabel}
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: '4px solid #3B82F6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8' }}>KM CE MOIS</span>
                <span style={{ fontSize: 16 }}>🛣️</span>
              </div>
              <div style={{ fontSize: 48, fontWeight: 900, color: '#3B82F6', lineHeight: 1, marginBottom: 4 }}>{km}</div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>kilomètres parcourus</div>
              <div style={{ background: '#EFF6FF', borderRadius: 10, padding: '8px 12px' }}>
                <div style={{ fontSize: 12, color: '#3B82F6', fontWeight: 600 }}>💡 {km} km ce mois</div>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: `4px solid ${WAFA.or}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8' }}>FACTURE ESTIMÉE</span>
                <span style={{ fontSize: 16 }}>💰</span>
              </div>
              <div style={{ fontSize: 48, fontWeight: 900, color: WAFA.orDark, lineHeight: 1, marginBottom: 4 }}>{total}</div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>MAD ce mois</div>
              <div style={{ background: WAFA.orLight, borderRadius: 10, padding: '8px 12px' }}>
                <div style={{ fontSize: 11, color: WAFA.orDark, fontWeight: 600 }}>200 + {km}×0,50 − {reduction} MAD</div>
              </div>
            </div>
          </div>

          {/* BADGES + FACTURE */}
          <div className="dash-bottom" style={{ display: 'grid', gap: 12, marginBottom: 16 }}>

            <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 style={{ fontSize: 14, fontWeight: 800, color: WAFA.noir, margin: 0 }}>🎖️ Mes badges</h2>
                <span style={{ fontSize: 11, color: '#94A3B8', background: WAFA.gris, padding: '3px 10px', borderRadius: 20 }}>Ce mois</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {BADGES.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: b.bg, borderRadius: 10 }}>
                    <span style={{ fontSize: 20 }}>{b.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: b.color }}>{b.label}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>{b.desc}</div>
                    </div>
                    <div style={{ background: b.color, color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>Obtenu</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 style={{ fontSize: 14, fontWeight: 800, color: WAFA.noir, margin: 0 }}>💰 Détail facture</h2>
                <span style={{ fontSize: 11, color: WAFA.vert, background: '#F0FDF4', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>Avril 2026</span>
              </div>
              <div>
                {[
                  { label: 'Abonnement mensuel de base', val: '200,00 MAD', color: WAFA.noir },
                  { label: `${km} km × 0,50 MAD/km`, val: `${(km * 0.5).toFixed(2)} MAD`, color: WAFA.noir },
                  { label: `Réduction score (${score}/100 → -10%)`, val: `-${reduction},00 MAD`, color: WAFA.vert },
                ].map((l, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${WAFA.grisMid}` }}>
                    <span style={{ fontSize: 12, color: '#64748B', flex: 1, paddingRight: 8 }}>{l.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: l.color, flexShrink: 0 }}>{l.val}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, padding: '12px 14px', background: `linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`, borderRadius: 10 }}>
                  <span style={{ fontWeight: 800, color: 'white', fontSize: 13 }}>TOTAL CE MOIS</span>
                  <span style={{ fontWeight: 900, fontSize: 20, color: WAFA.or }}>{total} MAD</span>
                </div>
              </div>
            </div>
          </div>

          {/* TRAJETS */}
          <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ fontSize: 14, fontWeight: 800, color: WAFA.noir, margin: 0 }}>🗺️ Derniers trajets</h2>
              <button onClick={() => navigate('/trajets')} style={{
                background: `linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`,
                color: 'white', border: 'none', borderRadius: 8,
                padding: '7px 12px', fontWeight: 700, fontSize: 12, cursor: 'pointer'
              }}>+ Nouveau</button>
            </div>

            {TRAJETS.map((t, i) => (
              <div key={i} style={{
                padding: '14px', borderRadius: 12, marginBottom: 8,
                background: WAFA.gris, border: `1px solid ${WAFA.grisMid}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: t.route === 'Ville' ? '#EFF6FF' : t.route === 'Autoroute' ? '#F0FDF4' : WAFA.orLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                      {t.route === 'Ville' ? '🏙️' : t.route === 'Autoroute' ? '🚀' : '🛣️'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: WAFA.noir }}>{t.date}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>{t.km} km · {t.route}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: t.score >= 90 ? WAFA.vert : t.score >= 75 ? WAFA.orDark : '#EF4444' }}>{t.score}/100</div>
                    <div style={{ fontSize: 12, color: WAFA.orDark, fontWeight: 700 }}>{t.cout} MAD</div>
                  </div>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: WAFA.orLight, borderRadius: 10, border: `1px solid ${WAFA.or}30` }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: WAFA.orDark }}>Total ({TRAJETS.length} trajets)</span>
              <span style={{ fontSize: 15, fontWeight: 900, color: WAFA.orDark }}>{TRAJETS.reduce((s, t) => s + t.cout, 0).toFixed(1)} MAD</span>
            </div>
          </div>

          {/* FOOTER */}
          <div style={{ marginTop: 16, padding: '12px 16px', background: WAFA.orLight, borderRadius: 12, border: `1px solid ${WAFA.or}30`, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <img src="/wafa-logo.png" alt="Wafa" style={{ width: 24, height: 24, borderRadius: 4 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: WAFA.vertDark }}>Wafa Assurance · Agréé ACAPS</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['🔐 CNDP', '🇪🇺 Europe', '✅ ACAPS'].map((tag, i) => (
                <span key={i} style={{ fontSize: 10, fontWeight: 600, color: WAFA.vert, background: '#F0FDF4', padding: '2px 8px', borderRadius: 20 }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

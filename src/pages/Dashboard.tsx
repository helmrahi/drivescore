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
  const [score, setScore] = useState(0)
  const [km, setKm] = useState(0)
  const [trajets, setTrajets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640)
  const navigate = useNavigate()

  const estimation = Math.round(200 + km * 0.5)
  const reduction = score >= 90 ? Math.round(estimation * 0.15)
    : score >= 80 ? Math.round(estimation * 0.10)
    : score >= 70 ? Math.round(estimation * 0.05) : 0
  const total = estimation - reduction
  const scoreColor = score >= 80 ? WAFA.vert : score >= 60 ? WAFA.or : '#EF4444'
  const scoreBg = score >= 80 ? '#F0FDF4' : score >= 60 ? WAFA.orLight : '#FEF2F2'
  const scoreLabel = score >= 80 ? '🏅 Excellent' : score >= 60 ? '⚠️ Moyen' : '🔴 À améliorer'

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { navigate('/login'); return }

        const { data: profile } = await supabase
          .from('profiles')
          .select('prenom, pseudo_id')
          .eq('id', user.id)
          .single()

        if (profile?.prenom) setPrenom(profile.prenom)

        if (profile?.pseudo_id) {
          const now = new Date()
          const { data: trajetsData } = await supabase
            .from('trajets')
            .select('*')
            .eq('pseudo_id', profile.pseudo_id)
            .order('created_at', { ascending: false })

          if (trajetsData && trajetsData.length > 0) {
            const totalKm = trajetsData.reduce((s, t) => s + (t.km || 0), 0)
            const avgScore = Math.round(trajetsData.reduce((s, t) => s + (t.score_trajet || 0), 0) / trajetsData.length)
            setKm(totalKm)
            setScore(avgScore)
            setTrajets(trajetsData.slice(0, 5))
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [navigate])

  async function logout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const BADGES = [
    score >= 85 && { icon: '🏅', label: 'Bon conducteur', desc: 'Score > 85', color: WAFA.vert, bg: '#F0FDF4' },
    km < 500 && { icon: '🌿', label: 'Éco-driver', desc: '< 500 km/mois', color: WAFA.vert, bg: '#F0FDF4' },
    trajets.length > 0 && trajets.every(t => t.freinages_brusques === 0) && { icon: '⭐', label: 'Zéro incident', desc: 'Aucun freinage', color: WAFA.orDark, bg: WAFA.orLight },
  ].filter(Boolean) as any[]

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: WAFA.gris }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: `4px solid ${WAFA.vert}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#94A3B8', fontSize: 14 }}>Chargement...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: WAFA.gris, fontFamily: 'Inter,sans-serif' }}>

      <header style={{
        background: 'white', borderBottom: `1px solid ${WAFA.grisMid}`,
        padding: isMobile ? '0 12px' : '0 32px',
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: isMobile ? 56 : 64
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/wafa-logo.png" alt="Wafa" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />
          <div>
            <div style={{ fontWeight: 900, fontSize: 13, color: WAFA.noir, lineHeight: 1 }}>
              WAFA <span style={{ color: WAFA.vert }}>ASSURANCE</span>
            </div>
            <div style={{ fontSize: 9, color: '#94A3B8', letterSpacing: '0.8px' }}>DRIVESCORE PAYD</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button onClick={() => navigate('/telematics')} style={{
            background: `linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`,
            color: 'white', border: 'none', borderRadius: 8,
            padding: '8px 10px', fontWeight: 700, fontSize: 12, cursor: 'pointer'
          }}>🚗</button>
          <button onClick={() => navigate('/trajets')} style={{
            background: WAFA.orLight, border: `1.5px solid ${WAFA.or}`,
            color: WAFA.orDark, borderRadius: 8,
            padding: '8px 10px', fontWeight: 700, fontSize: 12, cursor: 'pointer'
          }}>+ Trajet</button>
          <button onClick={logout} style={{
            background: 'none', border: `1.5px solid ${WAFA.grisMid}`,
            color: '#EF4444', borderRadius: 8, padding: '7px 10px',
            fontWeight: 600, fontSize: 12, cursor: 'pointer'
          }}>⬅️</button>
        </div>
      </header>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: isMobile ? '12px' : '32px 20px' }}>

        {/* GREETING */}
        <div style={{
          background: `linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`,
          borderRadius: 16, padding: isMobile ? '16px' : '24px 28px', marginBottom: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h1 style={{ color: 'white', fontSize: isMobile ? 18 : 24, fontWeight: 900, margin: '0 0 4px' }}>
              Bonjour {prenom} 👋
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, margin: 0 }}>
              {new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div style={{ background: WAFA.or, color: WAFA.noir, borderRadius: 10, padding: '8px 12px', textAlign: 'center', flexShrink: 0, marginLeft: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 700, marginBottom: 2 }}>FACTURE DU MOIS</div>
            <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 900 }}>{total} MAD</div>
          </div>
        </div>

        {/* KPI CARDS */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12, marginBottom: 16 }}>

          <div style={{ flex: 1, background: 'white', borderRadius: 16, padding: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${scoreColor}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8' }}>SCORE CONDUITE</span>
              <span>📊</span>
            </div>
            <div style={{ fontSize: 44, fontWeight: 900, color: scoreColor, lineHeight: 1, marginBottom: 4 }}>{score}</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 10 }}>points sur 100</div>
            <div style={{ background: WAFA.grisMid, borderRadius: 8, height: 6, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ width: `${score}%`, height: '100%', background: scoreColor, borderRadius: 8 }} />
            </div>
            <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 20, background: scoreBg, color: scoreColor, fontSize: 11, fontWeight: 700 }}>
              {scoreLabel}
            </div>
          </div>

          <div style={{ flex: 1, background: 'white', borderRadius: 16, padding: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: '4px solid #3B82F6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8' }}>KM CE MOIS</span>
              <span>🛣️</span>
            </div>
            <div style={{ fontSize: 44, fontWeight: 900, color: '#3B82F6', lineHeight: 1, marginBottom: 4 }}>{km}</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 10 }}>kilomètres parcourus</div>
            <div style={{ background: '#EFF6FF', borderRadius: 10, padding: '8px 12px' }}>
              <div style={{ fontSize: 12, color: '#3B82F6', fontWeight: 600 }}>
                {trajets.length} trajet{trajets.length > 1 ? 's' : ''} ce mois
              </div>
            </div>
          </div>

          <div style={{ flex: 1, background: 'white', borderRadius: 16, padding: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${WAFA.or}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8' }}>FACTURE ESTIMÉE</span>
              <span>💰</span>
            </div>
            <div style={{ fontSize: 44, fontWeight: 900, color: WAFA.orDark, lineHeight: 1, marginBottom: 4 }}>{total}</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 10 }}>MAD ce mois</div>
            <div style={{ background: WAFA.orLight, borderRadius: 10, padding: '8px 12px' }}>
              <div style={{ fontSize: 11, color: WAFA.orDark, fontWeight: 600 }}>
                200 + {km}×0,50 − {reduction} MAD
              </div>
            </div>
          </div>
        </div>

        {/* BADGES + FACTURE */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12, marginBottom: 16 }}>

          <div style={{ flex: 1, background: 'white', borderRadius: 16, padding: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ fontSize: 14, fontWeight: 800, color: WAFA.noir, margin: 0 }}>🎖️ Mes badges</h2>
              <span style={{ fontSize: 11, color: '#94A3B8', background: WAFA.gris, padding: '3px 10px', borderRadius: 20 }}>Ce mois</span>
            </div>
            {BADGES.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#94A3B8', fontSize: 13 }}>
                Faites des trajets pour débloquer des badges
              </div>
            ) : (
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
            )}
          </div>

          <div style={{ flex: 1, background: 'white', borderRadius: 16, padding: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ fontSize: 14, fontWeight: 800, color: WAFA.noir, margin: 0 }}>💰 Détail facture</h2>
              <span style={{ fontSize: 11, color: WAFA.vert, background: '#F0FDF4', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
                {new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            {[
              { label: 'Abonnement de base', val: '200,00 MAD', color: WAFA.noir },
              { label: `${km} km × 0,50 MAD/km`, val: `${(km * 0.5).toFixed(2)} MAD`, color: WAFA.noir },
              { label: `Réduction score (${score}/100)`, val: `-${reduction},00 MAD`, color: WAFA.vert },
            ].map((l, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${WAFA.grisMid}` }}>
                <span style={{ fontSize: 12, color: '#64748B', flex: 1, paddingRight: 8 }}>{l.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: l.color, flexShrink: 0 }}>{l.val}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, padding: '12px 14px', background: `linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`, borderRadius: 10 }}>
              <span style={{ fontWeight: 800, color: 'white', fontSize: 13 }}>TOTAL</span>
              <span style={{ fontWeight: 900, fontSize: 20, color: WAFA.or }}>{total} MAD</span>
            </div>
          </div>
        </div>

        {/* TRAJETS */}
        <div style={{ background: 'white', borderRadius: 16, padding: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: WAFA.noir, margin: 0 }}>🗺️ Derniers trajets</h2>
            <button onClick={() => navigate('/trajets')} style={{
              background: `linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`,
              color: 'white', border: 'none', borderRadius: 8,
              padding: '7px 12px', fontWeight: 700, fontSize: 12, cursor: 'pointer'
            }}>+ Nouveau</button>
          </div>

          {trajets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#94A3B8', fontSize: 14 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🛣️</div>
              Aucun trajet ce mois — commencez à conduire !
            </div>
          ) : (
            trajets.map((t, i) => (
              <div key={i} style={{ padding: '12px', borderRadius: 12, marginBottom: 8, background: WAFA.gris, border: `1px solid ${WAFA.grisMid}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: t.type_route === 'ville' ? '#EFF6FF' : t.type_route === 'autoroute' ? '#F0FDF4' : WAFA.orLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                      {t.type_route === 'ville' ? '🏙️' : t.type_route === 'autoroute' ? '🚀' : '🛣️'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: WAFA.noir }}>
                        {t.ville_depart && t.ville_arrivee ? `${t.ville_depart} → ${t.ville_arrivee}` : t.date_trajet}
                      </div>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>{t.km} km · {t.type_route}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: t.score_trajet >= 90 ? WAFA.vert : t.score_trajet >= 75 ? WAFA.orDark : '#EF4444' }}>
                      {t.score_trajet}/100
                    </div>
                    <div style={{ fontSize: 12, color: WAFA.orDark, fontWeight: 700 }}>{t.cout_mad} MAD</div>
                  </div>
                </div>
              </div>
            ))
          )}

          {trajets.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: WAFA.orLight, borderRadius: 10, marginTop: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: WAFA.orDark }}>Total ({trajets.length} trajets)</span>
              <span style={{ fontSize: 15, fontWeight: 900, color: WAFA.orDark }}>
                {trajets.reduce((s, t) => s + (t.cout_mad || 0), 0).toFixed(1)} MAD
              </span>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div style={{ padding: '12px 16px', background: WAFA.orLight, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <img src="/wafa-logo.png" alt="Wafa" style={{ width: 24, height: 24, borderRadius: 4 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: WAFA.vertDark }}>Wafa Assurance · Agréé ACAPS</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            {['🔐 CNDP', '🇪🇺 Europe', '✅ ACAPS'].map((tag, i) => (
              <span key={i} style={{ fontSize: 10, fontWeight: 600, color: WAFA.vert, background: '#F0FDF4', padding: '2px 8px', borderRadius: 20 }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

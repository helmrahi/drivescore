import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useDashboard } from '../hooks/useDashboard'

const W = {
  vert: '#2E7D32', vertDark: '#1B5E20', vertLight: '#4CAF50',
  or: '#F5A623', orDark: '#D4891A', orLight: '#FDF3E0',
  noir: '#0F172A', gris: '#F8FAFC', grisMid: '#E2E8F0',
}

function getScoreColor(s: number) {
  if (s >= 90) return '#16A34A'
  if (s >= 80) return '#2E7D32'
  if (s >= 70) return '#D97706'
  return '#DC2626'
}

function getScoreLabel(s: number) {
  if (s >= 90) return 'Excellent 🏅'
  if (s >= 80) return 'Bon conducteur ✅'
  if (s >= 70) return 'Moyen ⚠️'
  return 'À améliorer 💪'
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
  const [leaderboardActif, setLeaderboardActif] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)

  React.useEffect(() => {
    if (profile?.afficher_leaderboard !== undefined) {
      setLeaderboardActif(profile.afficher_leaderboard)
    }
  }, [profile?.afficher_leaderboard])

  const loading = authLoading || dataLoading
  const reduction = getReduction(score)
  const prime = Math.round(200 + km * 0.5)
  const total = Math.round(prime * (1 - reduction / 100))
  const economie = Math.max(0, 600 - total)
  const dernierTrajet = trajets[0]
  const scoreColor = getScoreColor(score)

  async function uploadAvatar(file: File) {
    setUploading(true)
    try {
      const { supabase } = await import('../lib/supabase')
      const ext = file.name.split('.').pop()
      const path = `${profile?.pseudo_id}.${ext}`
      await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const { updateProfile } = await import('../services/profileService')
      const { data: { user } } = await supabase.auth.getUser()
      if (user) await updateProfile(user.id, { avatar_url: data.publicUrl })
      window.location.reload()
    } catch (e) { console.error(e) }
    setUploading(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: W.gris }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${W.vert}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ fontSize: 13, color: '#94A3B8' }}>Chargement...</div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: W.gris, fontFamily: 'Inter,sans-serif', paddingBottom: 80 }}>

      {/* HEADER */}
      <header style={{ background: 'white', borderBottom: `0.5px solid ${W.grisMid}`, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/wafa-logo.png" alt="Wafa" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: W.noir, lineHeight: 1 }}>WAFA <span style={{ color: W.vert }}>ASSURANCE</span></div>
            <div style={{ fontSize: 9, color: '#94A3B8', letterSpacing: '0.08em' }}>DRIVESCORE PAYD</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => navigate('/comment-ca-marche')} style={{ width: 34, height: 34, borderRadius: '50%', background: W.gris, border: `0.5px solid ${W.grisMid}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 15 }}>❓</button>
          <label style={{ cursor: 'pointer', position: 'relative' }}>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) uploadAvatar(e.target.files[0]) }} />
            <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: W.vert, border: `2px solid ${W.vert}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              {uploading ? <span style={{ fontSize: 12, color: 'white' }}>⏳</span>
                : (profile as any)?.avatar_url ? <img src={(profile as any)?.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>{profile?.prenom?.slice(0,2)?.toUpperCase()}</span>}
            </div>
            <div style={{ position: 'absolute', bottom: -1, right: -1, width: 13, height: 13, borderRadius: '50%', background: W.or, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, border: '1.5px solid white' }}>📷</div>
          </label>
          <button onClick={logout} style={{ width: 34, height: 34, borderRadius: '50%', background: W.gris, border: `0.5px solid ${W.grisMid}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 15 }}>🚪</button>
        </div>
      </header>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* HERO — Score + Prime */}
        <div style={{ background: `linear-gradient(160deg,${W.vertDark},${W.vert})`, borderRadius: 24, padding: '20px', overflow: 'hidden', position: 'relative' }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 14 }}>
            Bonjour {profile?.prenom} 👋 · {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            {/* Gauge */}
            <div style={{ flexShrink: 0 }}>
              <svg width="86" height="86" viewBox="0 0 86 86">
                <circle cx="43" cy="43" r="35" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="7"/>
                <circle cx="43" cy="43" r="35" fill="none" stroke={W.or} strokeWidth="7"
                  strokeDasharray={`${(2*Math.PI*35*score/100).toFixed(2)} ${(2*Math.PI*35).toFixed(2)}`}
                  strokeLinecap="round" transform="rotate(-90 43 43)"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
                <text x="43" y="39" textAnchor="middle" fill="white" fontSize="19" fontWeight="900" fontFamily="Inter">{score}</text>
                <text x="43" y="52" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="Inter">/100</text>
              </svg>
            </div>
            {/* Infos */}
            <div style={{ flex: 1 }}>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginBottom: 4 }}>Score de conduite</div>
              <div style={{ color: 'white', fontSize: 20, fontWeight: 900, marginBottom: 10 }}>{getScoreLabel(score)}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 12px', flex: 1, textAlign: 'center' }}>
                  <div style={{ color: W.or, fontWeight: 900, fontSize: 17, lineHeight: 1 }}>{total}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, marginTop: 2 }}>MAD ce mois</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 12px', flex: 1, textAlign: 'center' }}>
                  <div style={{ color: '#86EFAC', fontWeight: 900, fontSize: 17, lineHeight: 1 }}>-{reduction}%</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, marginTop: 2 }}>Réduction</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 12px', flex: 1, textAlign: 'center' }}>
                  <div style={{ color: '#93C5FD', fontWeight: 900, fontSize: 17, lineHeight: 1 }}>+{economie}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, marginTop: 2 }}>MAD économie</div>
                </div>
              </div>
            </div>
          </div>
          {/* CTA */}
          <button onClick={() => navigate('/telematics')} style={{ width: '100%', padding: '13px', borderRadius: 12, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            🚗 Démarrer un trajet
          </button>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { label: 'Km ce mois', value: km.toFixed(1), unit: 'km', color: '#3B82F6', icon: '🛣️' },
            { label: 'Trajets', value: trajets.length, unit: '', color: W.orDark, icon: '🚗' },
            { label: 'Facture', value: total, unit: 'MAD', color: W.vert, icon: '💰' },
          ].map((k, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 14, padding: '12px 10px', textAlign: 'center', border: `0.5px solid ${W.grisMid}` }}>
              <div style={{ fontSize: 16, marginBottom: 4 }}>{k.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: k.color, lineHeight: 1 }}>{k.value}</div>
              {k.unit && <div style={{ fontSize: 9, color: '#94A3B8', marginTop: 1 }}>{k.unit}</div>}
              <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 3 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* DERNIER TRAJET + COACHING */}
        {dernierTrajet ? (
          <div style={{ background: 'white', borderRadius: 16, padding: '14px 16px', border: `0.5px solid ${W.grisMid}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: W.noir }}>🗺️ Dernier trajet</span>
              <span style={{ fontSize: 11, color: '#94A3B8' }}>{dernierTrajet.date_trajet}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: W.noir }}>
                  {dernierTrajet.ville_depart && dernierTrajet.ville_arrivee
                    ? `${dernierTrajet.ville_depart} → ${dernierTrajet.ville_arrivee}`
                    : `${Number(dernierTrajet.km).toFixed(2)} km · ${String(dernierTrajet.type_route)}`}
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                  {Number(dernierTrajet.km).toFixed(2)} km · {Number(dernierTrajet.cout_mad).toFixed(2)} MAD
                </div>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: getScoreColor(dernierTrajet.score_trajet) + '18', border: `2.5px solid ${getScoreColor(dernierTrajet.score_trajet)}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 900, color: getScoreColor(dernierTrajet.score_trajet), lineHeight: 1 }}>{dernierTrajet.score_trajet}</span>
                <span style={{ fontSize: 8, color: '#94A3B8' }}>/100</span>
              </div>
            </div>
            <div style={{ background: W.gris, borderRadius: 10, padding: '10px 12px', borderLeft: `3px solid ${W.vert}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: W.vert, marginBottom: 3 }}>💡 Conseil du jour</div>
              <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>
                {dernierTrajet.freinages_brusques > 2
                  ? 'Anticipez davantage les ralentissements pour réduire vos freinages et améliorer votre score.'
                  : dernierTrajet.score_trajet >= 90
                  ? 'Excellent trajet ! Continuez comme ça pour maintenir votre réduction de -15%.'
                  : 'Adoptez une conduite plus souple pour gagner des points et réduire votre prime.'}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 16, padding: '28px 20px', textAlign: 'center', border: `0.5px solid ${W.grisMid}` }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🛣️</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: W.noir, marginBottom: 6 }}>Aucun trajet encore</div>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 16 }}>Démarrez un trajet pour voir vos données</div>
            <button onClick={() => navigate('/telematics')} style={{ background: W.vert, color: 'white', border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>🚗 Démarrer</button>
          </div>
        )}

        {/* FACTURE DÉTAIL */}
        <div style={{ background: 'white', borderRadius: 16, padding: '14px 16px', border: `0.5px solid ${W.grisMid}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: W.noir, marginBottom: 12 }}>
            💰 Facture {new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
          </div>
          {[
            { label: 'Abonnement base', val: '200 MAD', color: W.noir },
            { label: `${km.toFixed(2)} km × 0,50 MAD`, val: `${(km * 0.5).toFixed(2)} MAD`, color: W.noir },
            { label: `Réduction conducteur -${reduction}%`, val: `-${Math.round(prime * reduction / 100)} MAD`, color: W.vert },
          ].map((l, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `0.5px solid ${W.grisMid}` }}>
              <span style={{ fontSize: 12, color: '#64748B' }}>{l.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: l.color }}>{l.val}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, padding: '10px 14px', background: `linear-gradient(135deg,${W.vertDark},${W.vert})`, borderRadius: 10 }}>
            <span style={{ fontWeight: 700, color: 'white', fontSize: 14 }}>TOTAL CE MOIS</span>
            <span style={{ fontWeight: 900, fontSize: 20, color: W.or }}>{total} MAD</span>
          </div>
        </div>

        {/* ÉCONOMIES */}
        <div style={{ background: `linear-gradient(135deg,#052E16,${W.vertDark})`, borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginBottom: 4 }}>Économies vs assurance classique</div>
            <div style={{ color: '#86EFAC', fontWeight: 900, fontSize: 22 }}>+{economie} MAD/mois</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 2 }}>600 MAD fixe → {total} MAD PAYD</div>
          </div>
          <div style={{ fontSize: 36 }}>💚</div>
        </div>

        {/* TOGGLE LEADERBOARD */}
        <div style={{ background: 'white', borderRadius: 16, padding: '12px 16px', border: `0.5px solid ${W.grisMid}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: W.noir }}>🏆 Classement public</div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>Visible par les autres conducteurs</div>
          </div>
          <div onClick={async () => {
            const newVal = !leaderboardActif
            setLeaderboardActif(newVal)
            const { updateProfile } = await import('../services/profileService')
            const { supabase } = await import('../lib/supabase')
            const { data: { user } } = await supabase.auth.getUser()
            if (user) await updateProfile(user.id, { afficher_leaderboard: newVal })
          }} style={{ width: 44, height: 24, borderRadius: 12, cursor: 'pointer', background: leaderboardActif ? W.vert : '#CBD5E1', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 2, left: leaderboardActif ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
          </div>
        </div>

      </div>

      {/* BOTTOM NAV */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: `0.5px solid ${W.grisMid}`, display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {[
          { icon: '🏠', label: 'Accueil', path: '/dashboard' },
          { icon: '🚗', label: 'Télématique', path: '/telematics' },
          { icon: '📋', label: 'Trajets', path: '/trajets' },
          { icon: '🏆', label: 'Classement', path: '/leaderboard' },
        ].map(item => {
          const isActive = location.pathname === item.path
          return (
            <button key={item.path} onClick={() => navigate(item.path)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer', color: isActive ? W.vert : '#94A3B8' }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 400 }}>{item.label}</span>
              {isActive && <div style={{ width: 4, height: 4, borderRadius: '50%', background: W.vert }} />}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

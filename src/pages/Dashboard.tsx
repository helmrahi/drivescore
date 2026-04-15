import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useDashboard } from '../hooks/useDashboard'

const W = {
  vert: '#2E7D32', vertDark: '#1B5E20', or: '#F5A623',
  orDark: '#D4891A', noir: '#0F172A', gris: '#F8FAFC', grisMid: '#E2E8F0',
}

function getReduction(s: number) {
  if (s >= 90) return 15
  if (s >= 80) return 10
  if (s >= 70) return 5
  return 0
}

function getGrade(s: number) {
  if (s >= 90) return 'Excellent 🏅'
  if (s >= 80) return 'Bon conducteur ✅'
  if (s >= 70) return 'Moyen ⚠️'
  return 'À améliorer 💪'
}

function getGradeColor(s: number) {
  if (s >= 90) return '#16A34A'
  if (s >= 80) return '#2E7D32'
  if (s >= 70) return '#D97706'
  return '#DC2626'
}

function getConseil(t: any): string {
  const fr = t.freinages_brusques || 0
  const ex = t.exces_vitesse_count || 0
  const sc = t.score_trajet || 0
  if (ex > 10) return `${ex} excès de vitesse détectés. Respectez les limites pour améliorer votre score et votre prime.`
  if (fr > 5) return `${fr} freinages brusques détectés. Anticipez les ralentissements en maintenant vos distances.`
  if (fr > 2) return `${fr} freinages détectés. Gardez vos distances et anticipez les feux.`
  if (sc >= 90) return `Score ${sc}/100 — Excellent trajet ! Vous bénéficiez de la réduction maximale -15%.`
  if (sc >= 80) return `Score ${sc}/100 — Bon trajet. Encore quelques points pour atteindre -15%.`
  return `Score ${sc}/100 — Adoptez une conduite plus souple pour améliorer votre prime.`
}

export default function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, loading: authLoading, logout } = useAuth()
  const { trajets, score, km, loading: dataLoading } = useDashboard(profile?.pseudo_id)
  const [leaderboardActif, setLeaderboardActif] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)

  React.useEffect(() => {
    if (profile?.afficher_leaderboard !== undefined)
      setLeaderboardActif(profile.afficher_leaderboard)
  }, [profile?.afficher_leaderboard])

  const loading = authLoading || dataLoading
  const reduction = getReduction(score)
  const prime = Math.round(200 + km * 0.5)
  const total = Math.round(prime * (1 - reduction / 100))
  const economie = Math.max(0, 600 - total)

  const trajetsMois = React.useMemo(() => {
    const now = new Date()
    return trajets.filter(t => {
      const d = new Date(t.date_trajet)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
  }, [trajets])

  const dernierTrajet = trajetsMois[0] || null
  const coutMois = trajetsMois.reduce((s, t) => s + (t.cout_mad || 0), 0).toFixed(2)
  const circumference = 2 * Math.PI * 32
  const dash = (circumference * score / 100).toFixed(2)

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
      <div style={{ width: 36, height: 36, border: `3px solid ${W.vert}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: W.gris, fontFamily: 'Inter,sans-serif', paddingBottom: 80 }}>

      {/* HERO */}
      <div style={{ background: '#F5F7FA', borderBottom: `0.5px solid ${W.grisMid}`, padding: '14px 16px 16px' }}>

        {/* TOP BAR */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: W.vert }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: W.noir }}>DriveScore <span style={{ color: W.vert }}>· Wafa</span></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => navigate('/comment-ca-marche')} style={{ width: 28, height: 28, borderRadius: '50%', background: 'white', border: `0.5px solid ${W.grisMid}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13 }}>❓</button>
            <label style={{ cursor: 'pointer', position: 'relative' }}>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) uploadAvatar(e.target.files[0]) }} />
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: W.vert, border: `2px solid ${W.or}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
                {uploading ? <span style={{ fontSize: 10, color: 'white' }}>⏳</span>
                  : (profile as any)?.avatar_url ? <img src={(profile as any)?.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: 10, fontWeight: 800, color: 'white' }}>{profile?.prenom?.slice(0, 2)?.toUpperCase()}</span>}
              </div>
            </label>
            <button onClick={logout} style={{ width: 28, height: 28, borderRadius: '50%', background: 'white', border: `0.5px solid ${W.grisMid}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13 }}>🚪</button>
          </div>
        </div>

        {/* SCORE + INFO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
          {/* Ring */}
          <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
            <svg width="80" height="80" viewBox="0 0 80 80" style={{ position: 'absolute', top: 0, left: 0 }}>
              <circle cx="40" cy="40" r="32" fill="none" stroke={W.grisMid} strokeWidth="5"/>
              <circle cx="40" cy="40" r="32" fill="none" stroke={W.or} strokeWidth="5"
                strokeDasharray={`${dash} ${circumference.toFixed(2)}`}
                strokeLinecap="round" transform="rotate(-90 40 40)"
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 80, height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: W.noir, lineHeight: 1 }}>{score}</span>
              <span style={{ fontSize: 8, color: '#94A3B8' }}>/100</span>
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 8, color: '#94A3B8', marginBottom: 3 }}>Bonjour {profile?.prenom} · {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: getGradeColor(score), marginBottom: 8 }}>{getGrade(score)}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ background: '#FDF3E0', border: `0.5px solid ${W.or}`, borderRadius: 6, padding: '3px 8px', fontSize: 10, color: W.orDark, fontWeight: 600 }}>{total} MAD/mois</span>
              <span style={{ background: '#F0FDF4', border: '0.5px solid #86EFAC', borderRadius: 6, padding: '3px 8px', fontSize: 10, color: W.vert, fontWeight: 600 }}>-{reduction}%</span>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          {[
            { val: `${km.toFixed(1)} km`, lbl: 'parcourus', color: '#3B82F6' },
            { val: `${trajetsMois.length}`, lbl: 'trajets', color: W.orDark },
            { val: `${coutMois} MAD`, lbl: 'coût mois', color: W.vert },
          ].map((k, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 10, border: `0.5px solid ${W.grisMid}`, padding: '8px 6px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: k.color }}>{k.val}</div>
              <div style={{ fontSize: 8, color: '#94A3B8', marginTop: 2 }}>{k.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* BODY */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* BOUTON DÉMARRER */}
        <button onClick={() => navigate('/telematics')} style={{ width: '100%', padding: '14px', borderRadius: 12, background: `linear-gradient(135deg,${W.vertDark},${W.vert})`, color: 'white', border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 16px rgba(46,125,50,0.3)' }}>
          🚗 Commencer un trajet
        </button>

        {/* DERNIER TRAJET */}
        {dernierTrajet ? (
          <div style={{ background: 'white', borderRadius: 14, border: `0.5px solid ${W.grisMid}`, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: W.noir }}>Dernier trajet</span>
              <button onClick={() => navigate('/trajets')} style={{ fontSize: 11, color: W.vert, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Tous les trajets →</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: W.noir, marginBottom: 2 }}>
                  {dernierTrajet.ville_depart && dernierTrajet.ville_arrivee
                    ? `${dernierTrajet.ville_depart} → ${dernierTrajet.ville_arrivee}`
                    : `Trajet ${dernierTrajet.type_route}`}
                </div>
                <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 8 }}>
                  {new Date(dernierTrajet.date_trajet).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} · {Number(dernierTrajet.km).toFixed(2)} km · {parseFloat(String(dernierTrajet.cout_mad)).toFixed(2)} MAD
                </div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {(dernierTrajet.freinages_brusques || 0) > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 7, background: '#FEF2F2', color: '#DC2626' }}>🛑 {dernierTrajet.freinages_brusques} frein.</span>
                  )}
                  {(dernierTrajet.exces_vitesse_count || 0) > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 7, background: '#FFF7ED', color: '#EA580C' }}>⚡ {dernierTrajet.exces_vitesse_count} excès</span>
                  )}
                  {(dernierTrajet.accelerations_brusques || 0) > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 7, background: '#FEFCE8', color: '#CA8A04' }}>🔺 {dernierTrajet.accelerations_brusques} accél.</span>
                  )}
                  {dernierTrajet.conduite_nocturne && (
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 7, background: '#F3F4F6', color: '#6B7280' }}>🌙 Nocturne</span>
                  )}
                  {!(dernierTrajet.freinages_brusques) && !(dernierTrajet.exces_vitesse_count) && (
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 7, background: '#F0FDF4', color: '#16A34A' }}>✅ Aucun incident</span>
                  )}
                </div>
              </div>
              <div style={{
                background: dernierTrajet.score_trajet >= 80 ? '#F0FDF4' : dernierTrajet.score_trajet >= 60 ? '#FEF3C7' : '#FEF2F2',
                color: dernierTrajet.score_trajet >= 80 ? '#16A34A' : dernierTrajet.score_trajet >= 60 ? '#D97706' : '#DC2626',
                borderRadius: 10, padding: '5px 10px', fontSize: 14, fontWeight: 900, flexShrink: 0,
              }}>
                {dernierTrajet.score_trajet}/100
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 14, border: `0.5px solid ${W.grisMid}`, padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🛣️</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: W.noir, marginBottom: 4 }}>Aucun trajet ce mois</div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>Démarrez votre premier trajet GPS</div>
          </div>
        )}

        {/* CONSEIL */}
        {dernierTrajet && (
          <div style={{ background: '#FFFBEB', border: '0.5px solid #FDE68A', borderRadius: 12, padding: '10px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#B45309', marginBottom: 3 }}>💡 Conseil</div>
            <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{getConseil(dernierTrajet)}</div>
          </div>
        )}

        {/* TOGGLE LEADERBOARD */}
        <div style={{ background: 'white', borderRadius: 14, border: `0.5px solid ${W.grisMid}`, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

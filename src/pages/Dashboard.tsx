import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useDashboard } from '../hooks/useDashboard'

const W = {
  vert: '#2E7D32', vertDark: '#1B5E20', or: '#F5A623',
  orDark: '#D4891A', orLight: '#FDF3E0', noir: '#0F172A',
  gris: '#F8FAFC', grisMid: '#E2E8F0',
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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: W.gris }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 36, height: 36, border: `3px solid ${W.vert}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", background: W.gris, fontFamily: "Inter,sans-serif", paddingBottom: 80 }}>

      <header style={{ background: "white", borderBottom: `0.5px solid ${W.grisMid}`, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/wafa-logo.png" alt="Wafa" style={{ width: 30, height: 30, borderRadius: 8, objectFit: "cover" }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: W.noir, lineHeight: 1 }}>GARANTIE <span style={{ color: W.vert }}>WAFA</span></div>
            <div style={{ fontSize: 9, color: "#94A3B8", letterSpacing: "0.08em" }}>DRIVESCORE PAYD</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <button onClick={() => navigate("/comment-ca-marche")} style={{ width: 32, height: 32, borderRadius: "50%", background: W.gris, border: `0.5px solid ${W.grisMid}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14 }}>❓</button>
          <label style={{ cursor: "pointer", position: "relative" }}>
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) uploadAvatar(e.target.files[0]) }} />
            <div style={{ width: 34, height: 34, borderRadius: "50%", overflow: "hidden", background: W.vert, border: `2px solid ${W.vert}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              {uploading ? <span style={{ fontSize: 11, color: "white" }}>⏳</span>
                : (profile as any)?.avatar_url ? <img src={(profile as any)?.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: 12, fontWeight: 800, color: "white" }}>{profile?.prenom?.slice(0, 2)?.toUpperCase()}</span>}
            </div>
            <div style={{ position: "absolute", bottom: -1, right: -1, width: 12, height: 12, borderRadius: "50%", background: W.or, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, border: "1.5px solid white" }}>📷</div>
          </label>
          <button onClick={logout} style={{ width: 32, height: 32, borderRadius: "50%", background: W.gris, border: `0.5px solid ${W.grisMid}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14 }}>🚪</button>
        </div>
      </header>

      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        <div style={{ background: `linear-gradient(160deg,${W.vertDark},${W.vert})`, padding: "16px 16px 20px" }}>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, marginBottom: 12 }}>
            Bonjour {profile?.prenom} 👋 · {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <svg width="82" height="82" viewBox="0 0 82 82" style={{ flexShrink: 0 }}>
              <circle cx="41" cy="41" r="34" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="6"/>
              <circle cx="41" cy="41" r="34" fill="none" stroke={W.or} strokeWidth="6"
                strokeDasharray={`${(2*Math.PI*34*score/100).toFixed(2)} ${(2*Math.PI*34).toFixed(2)}`}
                strokeLinecap="round" transform="rotate(-90 41 41)"
                style={{ transition: "stroke-dasharray 1s ease" }}
              />
              <text x="41" y="37" textAnchor="middle" fill="white" fontSize="18" fontWeight="900" fontFamily="Inter">{score}</text>
              <text x="41" y="50" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="Inter">/100</text>
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, marginBottom: 3 }}>Score de conduite</div>
              <div style={{ color: "white", fontSize: 18, fontWeight: 900, marginBottom: 8 }}>
                {score >= 90 ? "Excellent 🏅" : score >= 80 ? "Bon conducteur ✅" : score >= 70 ? "Moyen ⚠️" : "À améliorer 💪"}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  { val: `${total}`, sub: "MAD/mois", color: W.or },
                  { val: `-${reduction}%`, sub: "Réduction", color: "#86EFAC" },
                  { val: `+${economie}`, sub: "MAD éco", color: "#93C5FD" },
                ].map((k, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 8, padding: "6px 8px", flex: 1, textAlign: "center" }}>
                    <div style={{ color: k.color, fontWeight: 900, fontSize: 14, lineHeight: 1 }}>{k.val}</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 7, marginTop: 2 }}>{k.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button onClick={() => navigate("/telematics")} style={{ width: "100%", padding: "12px", borderRadius: 10, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            🚗 Commencez un trajet
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "10px 16px" }}>
          {[
            { label: "Km parcourus", value: km.toFixed(1), unit: "km", color: "#3B82F6" },
            { label: "Trajets", value: trajetsMois.length, unit: "", color: W.orDark },
            { label: "Coût total", value: `${trajetsMois.reduce((s, t) => s + (t.cout_mad || 0), 0).toFixed(0)}`, unit: "MAD", color: W.vert },
          ].map((k, i) => (
            <div key={i} style={{ background: "white", borderRadius: 12, padding: "10px", textAlign: "center", border: `0.5px solid ${W.grisMid}` }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: k.color, lineHeight: 1 }}>{k.value}</div>
              {k.unit && <div style={{ fontSize: 8, color: "#94A3B8", marginTop: 1 }}>{k.unit}</div>}
              <div style={{ fontSize: 9, color: "#94A3B8", marginTop: 3 }}>{k.label}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: "0 16px 10px" }}>
          <button onClick={() => navigate('/trajets')} style={{ width: '100%', background: 'white', border: `0.5px solid ${W.grisMid}`, borderRadius: 16, padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>📋</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: W.noir }}>Mes trajets</div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>{trajetsMois.length} trajet{trajetsMois.length > 1 ? 's' : ''} ce mois</div>
              </div>
            </div>
            <span style={{ fontSize: 20, color: '#CBD5E1' }}>›</span>
          </button>
        </div>

        <div style={{ margin: "0 16px 12px", background: "white", borderRadius: 16, padding: "12px 16px", border: `0.5px solid ${W.grisMid}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: W.noir }}>🏆 Classement public</div>
            <div style={{ fontSize: 11, color: "#94A3B8" }}>Visible par les autres conducteurs</div>
          </div>
          <div onClick={async () => {
            const newVal = !leaderboardActif
            setLeaderboardActif(newVal)
            const { updateProfile } = await import("../services/profileService")
            const { supabase } = await import("../lib/supabase")
            const { data: { user } } = await supabase.auth.getUser()
            if (user) await updateProfile(user.id, { afficher_leaderboard: newVal })
          }} style={{ width: 44, height: 24, borderRadius: 12, cursor: "pointer", background: leaderboardActif ? W.vert : "#CBD5E1", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
            <div style={{ position: "absolute", top: 2, left: leaderboardActif ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
          </div>
        </div>

      </div>

      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: `0.5px solid ${W.grisMid}`, display: "flex", zIndex: 100, paddingBottom: "env(safe-area-inset-bottom)" }}>
        {[
          { icon: "🏠", label: "Accueil", path: "/dashboard" },
          { icon: "🚗", label: "Télématique", path: "/telematics" },
          { icon: "📋", label: "Trajets", path: "/trajets" },
          { icon: "🏆", label: "Classement", path: "/leaderboard" },
        ].map(item => {
          const isActive = location.pathname === item.path
          return (
            <button key={item.path} onClick={() => navigate(item.path)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, padding: "10px 0", background: "none", border: "none", cursor: "pointer", color: isActive ? W.vert : "#94A3B8" }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 400 }}>{item.label}</span>
              {isActive && <div style={{ width: 4, height: 4, borderRadius: "50%", background: W.vert }} />}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

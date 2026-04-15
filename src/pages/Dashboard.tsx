import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useDashboard } from '../hooks/useDashboard'

const W = {
  vert: '#2E7D32', vertDark: '#1B5E20', or: '#F5A623',
  orDark: '#D4891A', orLight: '#FDF3E0', noir: '#0F172A',
  gris: '#F8FAFC', grisMid: '#E2E8F0',
}

function getScoreColor(s: number) {
  if (s >= 90) return '#16A34A'
  if (s >= 80) return '#2E7D32'
  if (s >= 70) return '#D97706'
  return '#DC2626'
}

function getScoreBg(s: number) {
  if (s >= 90) return '#F0FDF4'
  if (s >= 80) return '#DCFCE7'
  if (s >= 70) return '#FEF3C7'
  return '#FEF2F2'
}

function getReduction(s: number) {
  if (s >= 90) return 15
  if (s >= 80) return 10
  if (s >= 70) return 5
  return 0
}

function getConseil(t: any): { text: string; color: string; bg: string; icon: string } | null {
  const freinages = t.freinages_brusques || 0
  const exces = t.exces_vitesse_count || 0
  const score = t.score_trajet || 0

  if (score === 100) return null

  if (freinages > 5)
    return { icon: '🛑', text: `${freinages} freinages brusques détectés. Anticipez les ralentissements en maintenant une distance de sécurité.`, color: '#DC2626', bg: '#FEF2F2' }
  if (exces > 10)
    return { icon: '🚨', text: `${exces} excès de vitesse détectés. Respectez les limites pour protéger votre score et votre prime.`, color: '#DC2626', bg: '#FEF2F2' }
  if (freinages > 2)
    return { icon: '⚠️', text: `${freinages} freinages détectés. Gardez vos distances et anticipez davantage les feux.`, color: '#B45309', bg: '#FEF3C7' }
  if (exces > 0)
    return { icon: '🚦', text: `${exces} excès de vitesse. Respectez les limitations pour améliorer votre score.`, color: '#B45309', bg: '#FEF3C7' }
  if (score >= 90)
    return { icon: '💡', text: `Score ${score}/100 — Excellent trajet ! Cette régularité vous garantit une réduction de -${getReduction(score)}% sur votre prime.`, color: '#2E7D32', bg: '#F0FDF4' }
  if (score >= 80)
    return { icon: '📈', text: `Score ${score}/100 — Bon trajet. Encore quelques points et vous atteignez la réduction maximale de -15%.`, color: '#1D4ED8', bg: '#EFF6FF' }
  return { icon: '💪', text: `Score ${score}/100 — Adoptez une conduite plus souple pour améliorer votre score et réduire votre prime.`, color: '#B45309', bg: '#FEF3C7' }
}

function getIncidentTags(t: any) {
  const tags = []
  if ((t.freinages_brusques || 0) > 0)
    tags.push({ label: `🛑 ${t.freinages_brusques} freinage${t.freinages_brusques > 1 ? "s" : ""}`, bg: "#FEF2F2", color: "#DC2626" })
  if ((t.exces_vitesse_count || 0) > 0)
    tags.push({ label: `🚨 ${t.exces_vitesse_count} excès`, bg: "#FEF2F2", color: "#DC2626" })
  if ((t.vitesse_max || 0) > 0)
    tags.push({ label: `⚡ ${t.vitesse_max} km/h`, bg: "#EFF6FF", color: "#1D4ED8" })
  if (t.conduite_nocturne)
    tags.push({ label: "🌙 Nocturne", bg: "#F3F4F6", color: "#374151" })
  if (tags.length === 0)
    tags.push({ label: "✅ Aucun incident", bg: "#F0FDF4", color: "#16A34A" })
  return tags
}

export default function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, loading: authLoading, logout } = useAuth()
  const { trajets, score, km, facture, loading: dataLoading } = useDashboard(profile?.pseudo_id)
  const [leaderboardActif, setLeaderboardActif] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [expandedTrajet, setExpandedTrajet] = React.useState<string | null>(null)
  const [periode, setPeriode] = React.useState<"semaine" | "mois" | "tout">("mois")

  React.useEffect(() => {
    if (profile?.afficher_leaderboard !== undefined)
      setLeaderboardActif(profile.afficher_leaderboard)
  }, [profile?.afficher_leaderboard])

  const loading = authLoading || dataLoading
  const reduction = getReduction(score)
  const prime = Math.round(200 + km * 0.5)
  const total = Math.round(prime * (1 - reduction / 100))
  const economie = Math.max(0, 600 - total)

  const trajetsFiltres = React.useMemo(() => {
    const now = new Date()
    return trajets.filter(t => {
      if (periode === "tout") return true
      const d = new Date(t.date_trajet)
      if (periode === "semaine") {
        const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
        return diff <= 7
      }
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
  }, [trajets, periode])

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

      {/* HEADER */}
      <header style={{ background: "white", borderBottom: `0.5px solid ${W.grisMid}`, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/wafa-logo.png" alt="Wafa" style={{ width: 30, height: 30, borderRadius: 8, objectFit: "cover" }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: W.noir, lineHeight: 1 }}>WAFA <span style={{ color: W.vert }}>ASSURANCE</span></div>
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

        {/* HERO */}
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
            🚗 Démarrer un trajet
          </button>
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "10px 16px" }}>
          {[
            { label: "Km parcourus", value: km.toFixed(1), unit: "km", color: "#3B82F6" },
            { label: "Trajets", value: trajetsFiltres.length, unit: "", color: W.orDark },
            { label: "Coût total", value: `${trajetsFiltres.reduce((s, t) => s + (t.cout_mad || 0), 0).toFixed(0)}`, unit: "MAD", color: W.vert },
          ].map((k, i) => (
            <div key={i} style={{ background: "white", borderRadius: 12, padding: "10px", textAlign: "center", border: `0.5px solid ${W.grisMid}` }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: k.color, lineHeight: 1 }}>{k.value}</div>
              {k.unit && <div style={{ fontSize: 8, color: "#94A3B8", marginTop: 1 }}>{k.unit}</div>}
              <div style={{ fontSize: 9, color: "#94A3B8", marginTop: 3 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* RACCOURCI TRAJETS */}
        <div style={{ padding: "0 16px 12px" }}>
          <button
            onClick={() => navigate('/trajets')}
            style={{
              width: '100%', background: 'white', border: `0.5px solid ${W.grisMid}`,
              borderRadius: 16, padding: '14px 18px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>📋</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: W.noir }}>Mes trajets</div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>
                  {trajetsFiltres.length} trajet{trajetsFiltres.length > 1 ? 's' : ''} ce mois
                </div>
              </div>
            </div>
            <span style={{ fontSize: 18, color: '#CBD5E1' }}>›</span>
          </button>
        </div>
            </div>

            {/* Liste trajets */}
            {trajetsFiltres.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 16px", color: "#94A3B8" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🛣️</div>
                <div style={{ fontSize: 13 }}>Aucun trajet sur cette période</div>
              </div>
            ) : trajetsFiltres.slice(0, 5).map((t, i) => {
              const conseil = getConseil(t)
              const tags = getIncidentTags(t)
              const isOpen = expandedTrajet === t.id
              const scoreColor = getScoreColor(t.score_trajet)
              const scoreBg = getScoreBg(t.score_trajet)

              return (
                <div key={t.id || i}>
                  <div
                    onClick={() => setExpandedTrajet(isOpen ? null : t.id)}
                    style={{ padding: "10px 14px", borderBottom: `0.5px solid #F8FAFC`, cursor: "pointer", background: isOpen ? "#FAFAFA" : "white", transition: "background .15s" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 44, height: 38, borderRadius: 8, background: t.score_trajet >= 90 ? "#E8F4E8" : t.score_trajet >= 70 ? "#FEF3C7" : "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                        {t.type_route === "autoroute" ? "🚀" : t.type_route === "route" ? "🛣️" : "🏙️"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: W.noir }}>
                            {t.ville_depart && t.ville_arrivee ? `${t.ville_depart} → ${t.ville_arrivee}` : `Trajet ${t.type_route || "ville"}`}
                          </span>
                          <span style={{ fontSize: 10, color: "#CBD5E1" }}>{isOpen ? "▲" : "▼"}</span>
                        </div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 10, color: "#94A3B8" }}>{Number(t.km).toFixed(2)} km · {t.date_trajet}</span>
                          {tags.map((tag, j) => (
                            <span key={j} style={{ fontSize: 10, background: tag.bg, color: tag.color, padding: "1px 5px", borderRadius: 10 }}>{tag.label}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ background: scoreBg, color: scoreColor, borderRadius: 20, padding: "3px 8px", fontSize: 11, fontWeight: 800 }}>{t.score_trajet}/100</div>
                        <div style={{ fontSize: 10, color: W.orDark, fontWeight: 700, marginTop: 3 }}>{Number(t.cout_mad).toFixed(2)} MAD</div>
                      </div>
                    </div>
                  </div>

                  {/* CONSEIL PAR TRAJET */}
                  {isOpen && (
                    <div style={{ margin: "0 14px 10px", borderRadius: "0 8px 8px 0", padding: "9px 12px", background: conseil ? conseil.bg : "#F0FDF4", borderLeft: `3px solid ${conseil ? conseil.color : W.vert}` }}>
                      {conseil ? (
                        <>
                          <div style={{ fontSize: 10, fontWeight: 700, color: conseil.color, marginBottom: 3 }}>{conseil.icon} Analyse du trajet</div>
                          <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>{conseil.text}</div>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: 10, fontWeight: 700, color: W.vert, marginBottom: 3 }}>🏅 Trajet parfait</div>
                          <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>Score 100/100 — aucun incident détecté. Performance exemplaire !</div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {trajetsFiltres.length > 5 && (
              <div style={{ padding: "10px 14px", textAlign: "center", borderTop: `0.5px solid #F1F5F9` }}>
                <button onClick={() => navigate("/trajets")} style={{ fontSize: 12, color: W.vert, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
                  Voir tous les trajets ({trajetsFiltres.length}) →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* TOGGLE LEADERBOARD */}
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

      {/* BOTTOM NAV */}
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

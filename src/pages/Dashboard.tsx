import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useDashboard } from '../hooks/useDashboard'
import { tokens } from '../design-system/tokens'
import {
  Card, MetricCard, ScoreGauge, Badge, Button,
  Toggle, BottomNav, SectionHeader, EmptyState,
  Loader, DS_GLOBAL_STYLES
} from '../design-system/components'
import { Trajet } from '../types'

const t = tokens

function calculerBadges(score: number, km: number, trajets: Trajet[]) {
  const result = []
  const totalTrajets = trajets.length
  const avgFreinages = totalTrajets > 0
    ? trajets.reduce((s, tr) => s + (tr.freinages_brusques || 0), 0) / totalTrajets
    : 0
  const trajetsVille = trajets.filter(tr => tr.type_route === "ville").length

  if (totalTrajets >= 50) result.push({ icon: "🚗", label: "Grand conducteur", desc: "50 trajets", level: "🥇 Or", color: t.color.gold[600], bg: t.color.gold[50] })
  else if (totalTrajets >= 10) result.push({ icon: "🚗", label: "Conducteur régulier", desc: "10 trajets", level: "🥈 Argent", color: t.color.neutral[500], bg: t.color.neutral[100] })
  else if (totalTrajets >= 1) result.push({ icon: "🚗", label: "Premier trajet", desc: "Bienvenue", level: "🥉 Bronze", color: "#D4891A", bg: "#FEF3C7" })

  if (score >= 95) result.push({ icon: "🏅", label: "Conducteur élite", desc: "Score >= 95", level: "🥇 Or", color: t.color.gold[600], bg: t.color.gold[50] })
  else if (score >= 85) result.push({ icon: "🏅", label: "Bon conducteur", desc: "Score >= 85", level: "🥈 Argent", color: t.color.neutral[500], bg: t.color.neutral[100] })
  else if (score >= 70) result.push({ icon: "🏅", label: "En progression", desc: "Score >= 70", level: "🥉 Bronze", color: "#D4891A", bg: "#FEF3C7" })

  if (km <= 100) result.push({ icon: "🌿", label: "Éco champion", desc: "< 100 km", level: "🥇 Or", color: t.color.gold[600], bg: t.color.gold[50] })
  else if (km <= 300) result.push({ icon: "🌿", label: "Éco-driver", desc: "< 300 km", level: "🥈 Argent", color: t.color.neutral[500], bg: t.color.neutral[100] })
  else if (km <= 500) result.push({ icon: "🌿", label: "Conducteur sobre", desc: "< 500 km", level: "🥉 Bronze", color: "#D4891A", bg: "#FEF3C7" })

  if (totalTrajets >= 5 && avgFreinages === 0) result.push({ icon: "🛡️", label: "Conduite parfaite", desc: "0 freinage", level: "🥇 Or", color: t.color.primary[500], bg: t.color.primary[50] })
  else if (avgFreinages < 2 && totalTrajets > 0) result.push({ icon: "🛡️", label: "Conduite douce", desc: "< 2 freinages", level: "🥈 Argent", color: t.color.neutral[500], bg: t.color.neutral[100] })
  else if (avgFreinages < 5 && totalTrajets > 0) result.push({ icon: "🛡️", label: "Conduite sûre", desc: "< 5 freinages", level: "🥉 Bronze", color: "#D4891A", bg: "#FEF3C7" })

  if (trajetsVille >= 20) result.push({ icon: "🏙️", label: "Citadin confirmé", desc: "20 trajets ville", level: "🥈 Argent", color: t.color.neutral[500], bg: t.color.neutral[100] })
  else if (trajetsVille >= 5) result.push({ icon: "🏙️", label: "Conducteur urbain", desc: "5 trajets ville", level: "🥉 Bronze", color: "#D4891A", bg: "#FEF3C7" })

  return result
}

export default function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, loading: authLoading, logout } = useAuth()
  const { trajets, score, km, facture, loading: dataLoading, scoreColor } = useDashboard(profile?.pseudo_id)

  const loading = authLoading || dataLoading
  const BADGES = calculerBadges(score, km, trajets)

  async function toggleLeaderboard(val: boolean) {
    const { updateProfile } = await import("../services/profileService")
    const { supabase } = await import("../lib/supabase")
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await updateProfile(user.id, { afficher_leaderboard: val })
  }

  if (loading) return <Loader text="Chargement de votre tableau de bord..." />

  return (
    <>
      <style>{DS_GLOBAL_STYLES}</style>
      <div style={{ minHeight: "100vh", background: t.color.neutral[50], fontFamily: t.font.family.sans, paddingBottom: 80 }}>

        {/* HEADER */}
        <header style={{
          background: "#fff",
          borderBottom: `0.5px solid ${t.color.neutral[200]}`,
          padding: `0 ${t.space[4]}`,
          position: "sticky", top: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 56,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: t.space[2] }}>
            <img src="/wafa-logo.png" alt="Wafa" style={{ width: 28, height: 28, borderRadius: t.radius.md, objectFit: "cover" }} />
            <div>
              <div style={{ fontWeight: t.font.weight.black, fontSize: t.font.size.sm, color: t.color.neutral[900], lineHeight: 1 }}>
                WAFA <span style={{ color: t.color.primary[500] }}>ASSURANCE</span>
              </div>
              <div style={{ fontSize: t.font.size.xs, color: t.color.neutral[400], letterSpacing: "0.06em" }}>DRIVESCORE PAYD</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>⬅️ Déconnexion</Button>
        </header>

        <div style={{ maxWidth: 480, margin: "0 auto", padding: t.space[4] }}>

          {/* GREETING + FACTURE */}
          <div style={{
            background: `linear-gradient(135deg, ${t.color.primary[600]}, ${t.color.primary[500]})`,
            borderRadius: t.radius["3xl"], padding: t.space[5], marginBottom: t.space[4],
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <h1 style={{ color: "#fff", fontSize: t.font.size.xl, fontWeight: t.font.weight.black, margin: `0 0 ${t.space[1]}` }}>
                Bonjour {profile?.prenom} 👋
              </h1>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: t.font.size.sm, margin: 0 }}>
                {new Date().toLocaleString("fr-FR", { month: "long", year: "numeric" })}
              </p>
            </div>
            <div style={{ background: t.color.gold[500], color: t.color.neutral[900], borderRadius: t.radius.xl, padding: `${t.space[3]} ${t.space[4]}`, textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.bold, marginBottom: 2, letterSpacing: "0.05em" }}>FACTURE</div>
              <div style={{ fontSize: t.font.size["2xl"], fontWeight: t.font.weight.black }}>{facture?.total ?? 200} MAD</div>
            </div>
          </div>

          {/* SCORE + KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: t.space[3], marginBottom: t.space[4], alignItems: "center" }}>
            <Card padding={t.space[4]}>
              <ScoreGauge score={score} size="md" showLabel />
            </Card>
            <div style={{ display: "flex", flexDirection: "column", gap: t.space[3] }}>
              <MetricCard label="Km ce mois" value={km} unit="km" accent={t.color.info.solid} icon="🛣️" sub={`${trajets.length} trajet${trajets.length > 1 ? "s" : ""}`} />
              <MetricCard label="Facture estimée" value={facture?.total ?? 200} unit="MAD" accent={t.color.gold[500]} icon="💰" sub={`Réduction : -${facture?.reduction ?? 0} MAD`} />
            </div>
          </div>

          {/* TRAJETS */}
          <Card padding={t.space[5]} >
            <SectionHeader
              title="🗺️ Derniers trajets"
              action={{ label: "+ Nouveau", onClick: () => navigate("/trajets") }}
            />
            {trajets.length === 0 ? (
              <EmptyState
                icon="🛣️"
                title="Aucun trajet ce mois"
                description="Commencez à conduire pour voir vos données"
                action={{ label: "Déclarer un trajet", onClick: () => navigate("/trajets") }}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: t.space[2] }}>
                {trajets.map((tr, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: `${t.space[3]} ${t.space[4]}`,
                    background: t.color.neutral[50],
                    borderRadius: t.radius.lg,
                    border: `0.5px solid ${t.color.neutral[200]}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: t.space[3] }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: t.radius.md, flexShrink: 0,
                        background: tr.type_route === "ville" ? t.color.info.bg : tr.type_route === "autoroute" ? t.color.primary[50] : t.color.gold[50],
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                      }}>
                        {tr.type_route === "ville" ? "🏙️" : tr.type_route === "autoroute" ? "🚀" : "🛣️"}
                      </div>
                      <div>
                        <div style={{ fontWeight: t.font.weight.semibold, fontSize: t.font.size.sm, color: t.color.neutral[800] }}>
                          {tr.ville_depart && tr.ville_arrivee ? `${tr.ville_depart} → ${tr.ville_arrivee}` : tr.date_trajet}
                        </div>
                        <div style={{ fontSize: t.font.size.xs, color: t.color.neutral[400] }}>{tr.km} km · {tr.type_route}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <Badge variant={tr.score_trajet >= 80 ? "success" : tr.score_trajet >= 60 ? "warning" : "danger"}>
                        {tr.score_trajet}/100
                      </Badge>
                      <div style={{ fontSize: t.font.size.xs, color: t.color.gold[600], fontWeight: t.font.weight.semibold, marginTop: 3 }}>{tr.cout_mad} MAD</div>
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: `${t.space[3]} ${t.space[4]}`, background: t.color.gold[50], borderRadius: t.radius.lg, marginTop: t.space[1] }}>
                  <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.semibold, color: t.color.gold[700] }}>Total ({trajets.length} trajets)</span>
                  <span style={{ fontSize: t.font.size.base, fontWeight: t.font.weight.black, color: t.color.gold[600] }}>{trajets.reduce((s, tr) => s + (tr.cout_mad || 0), 0).toFixed(1)} MAD</span>
                </div>
              </div>
            )}
          </Card>

          {/* BADGES */}
          {BADGES.length > 0 && (
            <Card padding={t.space[5]} >
              <SectionHeader title="🎖️ Mes badges" badge="Ce mois" />
              <div style={{ display: "flex", flexDirection: "column", gap: t.space[2] }}>
                {BADGES.map((b, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: t.space[3], padding: `${t.space[3]} ${t.space[4]}`, background: b.bg, borderRadius: t.radius.lg }}>
                    <div style={{ width: 36, height: 36, borderRadius: t.radius.md, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, boxShadow: t.shadow.sm }}>{b.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: t.font.weight.semibold, fontSize: t.font.size.sm, color: b.color }}>{b.label}</div>
                      <div style={{ fontSize: t.font.size.xs, color: t.color.neutral[400] }}>{b.desc}</div>
                    </div>
                    <Badge variant="neutral">{b.level}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* DÉTAIL FACTURE */}
          <Card padding={t.space[5]} >
            <SectionHeader
              title="💰 Détail facture"
              badge={new Date().toLocaleString("fr-FR", { month: "long", year: "numeric" })}
            />
            {[
              { label: "Abonnement de base", val: "200,00 MAD", color: t.color.neutral[800] },
              { label: `${km} km × 0,50 MAD/km`, val: `${(km * 0.5).toFixed(2)} MAD`, color: t.color.neutral[800] },
              { label: `Réduction score (${score}/100)`, val: `-${facture?.reduction ?? 0},00 MAD`, color: t.color.primary[500] },
            ].map((l, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: `${t.space[3]} 0`, borderBottom: `0.5px solid ${t.color.neutral[100]}` }}>
                <span style={{ fontSize: t.font.size.sm, color: t.color.neutral[500], flex: 1 }}>{l.label}</span>
                <span style={{ fontSize: t.font.size.sm, fontWeight: t.font.weight.bold, color: l.color }}>{l.val}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: t.space[3], padding: `${t.space[3]} ${t.space[4]}`, background: `linear-gradient(135deg, ${t.color.primary[600]}, ${t.color.primary[500]})`, borderRadius: t.radius.lg }}>
              <span style={{ fontWeight: t.font.weight.bold, color: "#fff", fontSize: t.font.size.base }}>TOTAL CE MOIS</span>
              <span style={{ fontWeight: t.font.weight.black, fontSize: t.font.size.xl, color: t.color.gold[400] }}>{facture?.total ?? 200} MAD</span>
            </div>
          </Card>

          {/* TOGGLE LEADERBOARD */}
          <Card padding={t.space[5]} >
            <Toggle
              checked={profile?.afficher_leaderboard ?? false}
              onChange={toggleLeaderboard}
              label="🏆 Apparaître dans le classement"
              description="Votre score sera visible par les autres conducteurs"
            />
          </Card>

          {/* FOOTER */}
          <div style={{ textAlign: "center", padding: `${t.space[4]} 0`, color: t.color.neutral[400], fontSize: t.font.size.xs }}>
            Wafa Assurance · Agréé ACAPS · Conforme CNDP · © 2026
          </div>
        </div>

        {/* BOTTOM NAV */}
        <BottomNav
          items={[
            { icon: "🏠", label: "Accueil", path: "/dashboard" },
            { icon: "🚗", label: "Télématique", path: "/telematics" },
            { icon: "📋", label: "Trajets", path: "/trajets" },
            { icon: "🏆", label: "Classement", path: "/leaderboard" },
          ]}
          active={location.pathname}
          onNavigate={navigate}
        />
      </div>
    </>
  )
}

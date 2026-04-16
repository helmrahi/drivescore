import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useDashboard } from '../hooks/useDashboard'

const C = {
  greenDeep: '#0D2E1C', greenDark: '#163D25', greenMid: '#1E5C35',
  greenAccent: '#2A8A50', greenBright: '#3EBD6F',
  amber: '#F5A623', amberLight: '#FDF0D5', amberDark: '#8B5E00',
  red: '#E5403A', redLight: '#FDEAEA', redDark: '#8B1A17',
  blue: '#2D7DD2', blueLight: '#E8F2FC',
  white: '#FFFFFF', surface: '#F7F8F6', surface2: '#EDEFEB',
  textPrimary: '#0D1F16', textSecondary: '#4A6355', textTertiary: '#8AA898',
  border: 'rgba(13,46,28,0.08)', borderStrong: 'rgba(13,46,28,0.14)',
  fontSans: "'DM Sans', sans-serif", fontMono: "'DM Mono', monospace",
}

function getScoreColor(s: number) {
  if (s >= 90) return C.greenBright
  if (s >= 80) return C.greenAccent
  if (s >= 70) return C.amber
  return C.red
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

function getConseil(t: any): string {
  const f = t.freinages_brusques || 0
  const e = t.exces_vitesse_count || 0
  if (e > 10) return `${e} excès de vitesse détectés. Respectez les limites pour améliorer votre score.`
  if (f > 5) return `${f} freinages brusques. Anticipez les ralentissements en gardant vos distances.`
  if (f > 2) return `${f} freinages détectés. Maintenez une distance de sécurité suffisante.`
  if (t.score_trajet >= 90) return 'Trajet exemplaire ! Continuez sur cette lancée pour maintenir votre réduction.'
  return 'Adoptez une conduite plus souple pour gagner des points et réduire votre prime.'
}

export default function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, loading: authLoading, logout } = useAuth()
  const { trajets, score, km, loading: dataLoading } = useDashboard(profile?.pseudo_id)
  const [leaderboardActif, setLeaderboardActif] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [expanded, setExpanded] = React.useState<string | null>(null)
  const [periode, setPeriode] = React.useState<'semaine' | 'mois' | 'tout'>('mois')

  React.useEffect(() => {
    if (profile?.afficher_leaderboard !== undefined)
      setLeaderboardActif(profile.afficher_leaderboard)
  }, [profile?.afficher_leaderboard])

  const loading = authLoading || dataLoading
  const reduction = getReduction(score)
  const prime = Math.round(200 + km * 0.5)
  const total = Math.round(prime * (1 - reduction / 100))
  const economie = Math.max(0, 500 - total)
  const scoreColor = getScoreColor(score)
  const circumference = 2 * Math.PI * 37
  const scoreOffset = circumference - (circumference * score / 100)

  const trajetsFiltres = React.useMemo(() => {
    const now = new Date()
    return trajets.filter(t => {
      if (periode === 'tout') return true
      const d = new Date(t.date_trajet)
      if (periode === 'semaine') return (now.getTime() - d.getTime()) / 86400000 <= 7
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
  }, [trajets, periode])

  const dernierTrajet = trajetsFiltres[0]

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
    <div style={{ minHeight: '100vh', background: C.greenDeep, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: `2px solid ${C.greenBright}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.surface, fontFamily: C.fontSans, paddingBottom: 80 }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse-dot{0%,100%{box-shadow:0 0 8px rgba(62,189,111,0.6)}50%{box-shadow:0 0 16px rgba(62,189,111,0.9)}}
        * { box-sizing: border-box; }
      `}</style>

      {/* HEADER SOMBRE */}
      <div style={{ background: C.greenDeep, position: 'relative', overflow: 'hidden' }}>
        {/* Glow décoratif */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: 'radial-gradient(circle, rgba(62,189,111,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: 40, width: 140, height: 140, background: 'radial-gradient(circle, rgba(42,138,80,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* TOPBAR */}
        <div style={{ padding: '16px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.greenBright, boxShadow: '0 0 8px rgba(62,189,111,0.6)', animation: 'pulse-dot 2.5s ease-in-out infinite' }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.85)', letterSpacing: '-0.2px' }}>
              Wafa <span style={{ color: 'rgba(255,255,255,0.4)' }}>·</span> <span style={{ color: 'rgba(255,255,255,0.55)' }}>DriveScore</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => navigate('/comment-ca-marche')} style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2"/><path d="M8 7.5V11" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round"/><circle cx="8" cy="5.5" r="0.8" fill="rgba(255,255,255,0.6)"/></svg>
            </button>
            <label style={{ cursor: 'pointer', position: 'relative' }}>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) uploadAvatar(e.target.files[0]) }} />
              <div style={{ width: 34, height: 34, borderRadius: 10, background: C.greenBright, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer' }}>
                {uploading ? <span style={{ fontSize: 10, color: C.greenDeep }}>⏳</span>
                  : (profile as any)?.avatar_url
                  ? <img src={(profile as any)?.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: 11, fontWeight: 600, color: C.greenDeep, fontFamily: C.fontMono }}>{profile?.prenom?.slice(0,2)?.toUpperCase()}</span>}
              </div>
            </label>
            <button onClick={logout} style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 8H2M2 8L5 5M2 8L5 11" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round"/><path d="M7 4V3.5A1.5 1.5 0 018.5 2H13a1 1 0 011 1v10a1 1 0 01-1 1H8.5A1.5 1.5 0 017 12.5V12" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>

        {/* SCORE SECTION */}
        <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 20, position: 'relative', zIndex: 1 }}>
          {/* Ring */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <svg width="88" height="88" viewBox="0 0 88 88" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="44" cy="44" r="37" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7"/>
              <circle cx="44" cy="44" r="37" fill="none" stroke={C.amber} strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={scoreOffset}
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 26, fontWeight: 600, color: 'white', lineHeight: 1, fontFamily: C.fontMono }}>{score}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>/100</span>
            </div>
          </div>

          {/* Infos */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 5, letterSpacing: '0.3px' }}>
              Bonjour {profile?.prenom} · {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              <span style={{ fontSize: 20, fontWeight: 600, color: 'white', letterSpacing: '-0.5px' }}>{getScoreLabel(score)}</span>
              {score < 80 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(245,166,35,0.2)', border: '0.5px solid rgba(245,166,35,0.35)', borderRadius: 6, padding: '3px 7px', fontSize: 11, color: C.amber, fontWeight: 500 }}>
                  ⚠ Attention
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
                {total} MAD/mois
              </div>
              {reduction > 0 && (
                <div style={{ background: C.greenBright, borderRadius: 20, padding: '4px 10px', fontSize: 12, color: C.greenDeep, fontWeight: 600 }}>
                  −{reduction}%
                </div>
              )}
            </div>
          </div>
        </div>

        {/* STATS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '16px 20px 20px', position: 'relative', zIndex: 1 }}>
          {[
            { val: km.toFixed(1), unit: 'km', label: 'parcourus', mono: true },
            { val: String(trajetsFiltres.length), unit: '', label: 'trajets', mono: true },
            { val: total.toString(), unit: 'MAD', label: 'ce mois', mono: true },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px' }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'white', lineHeight: 1, fontFamily: C.fontMono }}>
                {s.val}{s.unit && <span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.5)', marginLeft: 2 }}>{s.unit}</span>}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* BODY */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* CTA */}
        <button onClick={() => navigate('/telematics')} style={{ width: '100%', padding: '14px 20px', background: C.greenMid, border: `0.5px solid rgba(62,189,111,0.2)`, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(62,189,111,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="white" strokeWidth="1.4"/><circle cx="9" cy="9" r="2.5" fill="white"/><path d="M9 2V4M9 14V16M2 9H4M14 9H16" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/></svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 500, color: 'white' }}>Commencer un trajet</span>
        </button>

        {/* TRAJETS */}
        <div style={{ background: C.white, borderRadius: 22, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '16px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}` }}>
            <div>
              <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.3px', marginBottom: 2 }}>HISTORIQUE</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary }}>Mes trajets</div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {([['semaine','7j'], ['mois','Mois'], ['tout','Tout']] as const).map(([key, label]) => (
                <button key={key} onClick={() => setPeriode(key)} style={{
                  padding: '5px 10px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  fontSize: 11, fontWeight: 500,
                  background: periode === key ? C.greenDeep : C.surface2,
                  color: periode === key ? 'white' : C.textSecondary,
                }}>{label}</button>
              ))}
            </div>
          </div>

          {/* Liste */}
          {trajetsFiltres.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: C.textTertiary, fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🛣️</div>
              Aucun trajet sur cette période
            </div>
          ) : trajetsFiltres.slice(0, 3).map((t, i) => {
            const isOpen = expanded === (t.id || String(i))
            const sc = t.score_trajet || 0
            const scColor = getScoreColor(sc)
            const f = t.freinages_brusques || 0
            const e = t.exces_vitesse_count || 0

            return (
              <div key={t.id || i} style={{ borderBottom: i < Math.min(trajetsFiltres.length, 4) - 1 ? `1px solid ${C.border}` : 'none' }}>
                <div onClick={() => setExpanded(isOpen ? null : (t.id || String(i)))} style={{ padding: '14px 16px', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, marginBottom: 3 }}>
                        {t.date_trajet ? new Date(t.date_trajet).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) : ''}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary }}>
                        {t.ville_depart && t.ville_arrivee ? `${t.ville_depart} → ${t.ville_arrivee}` : `Trajet ${t.type_route || 'ville'}`}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: scColor, fontFamily: C.fontMono, marginBottom: 2 }}>{sc} / 100</div>
                      <div style={{ fontSize: 11, color: C.textTertiary }}>{Number(t.cout_mad).toFixed(2)} MAD</div>
                    </div>
                  </div>

                  {/* Meta row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, background: C.surface2, color: C.textSecondary, padding: '3px 8px', borderRadius: 20, fontWeight: 500 }}>
                      {t.type_route || 'ville'}
                    </span>
                    <span style={{ fontSize: 11, color: C.textTertiary }}>{Number(t.km).toFixed(2)} km</span>
                    {f > 0 && <span style={{ fontSize: 11, background: C.redLight, color: C.redDark, padding: '3px 8px', borderRadius: 20, fontWeight: 500 }}>🛑 {f} freinage{f > 1 ? 's' : ''}</span>}
                    {e > 0 && <span style={{ fontSize: 11, background: C.amberLight, color: C.amberDark, padding: '3px 8px', borderRadius: 20, fontWeight: 500 }}>⚡ {e} excès</span>}
                    {f === 0 && e === 0 && <span style={{ fontSize: 11, color: C.greenAccent, fontWeight: 500 }}>✓ Aucun incident</span>}

                    {/* Score bar */}
                    <div style={{ flex: 1, minWidth: 60, height: 4, background: C.surface2, borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${sc}%`, height: '100%', background: scColor, borderRadius: 4, transition: 'width 0.5s ease' }} />
                    </div>
                    <span style={{ fontSize: 10, color: C.textTertiary }}>{isOpen ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Conseil expandé */}
                {isOpen && (
                  <div style={{ margin: '0 16px 14px', background: C.amberLight, border: `1px solid rgba(245,166,35,0.25)`, borderRadius: 12, padding: '12px', display: 'flex', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245,166,35,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>💡</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.amberDark, marginBottom: 3 }}>Conseil de conduite</div>
                      <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.5 }}>{getConseil(t)}</div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {trajetsFiltres.length > 4 && (
            <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.border}`, textAlign: 'center' }}>
              <button onClick={() => navigate('/trajets')} style={{ fontSize: 13, color: C.greenAccent, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>
                Voir tous les trajets ({trajetsFiltres.length}) →
              </button>
            </div>
          )}
        </div>

        {/* CONSEIL DERNIER TRAJET */}
        {dernierTrajet && (
          <div style={{ background: C.amberLight, border: `1px solid rgba(245,166,35,0.2)`, borderRadius: 16, padding: '14px', display: 'flex', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,166,35,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6.5" r="4" stroke={C.amberDark} strokeWidth="1.4"/><path d="M6.5 6.5C6.5 5.12 7.62 4 9 4" stroke={C.amberDark} strokeWidth="1.4" strokeLinecap="round"/><path d="M9 11V13M7 13H11" stroke={C.amberDark} strokeWidth="1.4" strokeLinecap="round"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.amberDark, marginBottom: 3 }}>Conseil de conduite</div>
              <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.5 }}>{getConseil(dernierTrajet)}</div>
            </div>
          </div>
        )}

        {/* ÉCONOMIES */}
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, marginBottom: 3 }}>ÉCONOMIES CE MOIS</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: C.greenAccent, fontFamily: C.fontMono }}>+{economie} MAD</div>
            <div style={{ fontSize: 11, color: C.textTertiary, marginTop: 2 }}>vs assurance classique 500 MAD</div>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(42,138,80,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>💚</div>
        </div>

        {/* CLASSEMENT */}
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.amberLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏆</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: C.textPrimary }}>Classement public</div>
              <div style={{ fontSize: 11, color: C.textTertiary }}>Visible par les autres conducteurs</div>
            </div>
          </div>
          <div onClick={async () => {
            const newVal = !leaderboardActif
            setLeaderboardActif(newVal)
            const { updateProfile } = await import('../services/profileService')
            const { supabase } = await import('../lib/supabase')
            const { data: { user } } = await supabase.auth.getUser()
            if (user) await updateProfile(user.id, { afficher_leaderboard: newVal })
          }} style={{ width: 44, height: 26, borderRadius: 13, cursor: 'pointer', background: leaderboardActif ? C.greenAccent : C.surface2, position: 'relative', transition: 'background 0.2s', flexShrink: 0, border: `1px solid ${leaderboardActif ? C.greenAccent : C.borderStrong}` }}>
            <div style={{ position: 'absolute', top: 3, left: leaderboardActif ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
          </div>
        </div>

      </div>

      {/* BOTTOM NAV */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {[
          { icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="10" width="5" height="8" rx="1.5" fill={C.greenMid}/><rect x="7.5" y="6" width="5" height="12" rx="1.5" fill={C.greenMid}/><rect x="13" y="2" width="5" height="16" rx="1.5" fill={C.greenBright}/></svg>, label: 'Accueil', path: '/dashboard' },
          { icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke={C.textTertiary} strokeWidth="1.4"/><circle cx="10" cy="10" r="3" stroke={C.textTertiary} strokeWidth="1.4"/><path d="M10 3V7M10 13V17M3 10H7M13 10H17" stroke={C.textTertiary} strokeWidth="1.2" strokeLinecap="round"/></svg>, label: 'Télématique', path: '/telematics' },
          { icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="2" width="12" height="16" rx="2" stroke={C.textTertiary} strokeWidth="1.4"/><path d="M7 7H13M7 10.5H13M7 14H10.5" stroke={C.textTertiary} strokeWidth="1.2" strokeLinecap="round"/></svg>, label: 'Trajets', path: '/trajets' },
          { icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L12.2 7.4H18L13.2 10.8L15.2 16.4L10 13L4.8 16.4L6.8 10.8L2 7.4H7.8L10 2Z" stroke={C.textTertiary} strokeWidth="1.4" strokeLinejoin="round"/></svg>, label: 'Classement', path: '/leaderboard' },
        ].map(item => {
          const isActive = location.pathname === item.path
          return (
            <button key={item.path} onClick={() => navigate(item.path)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer' }}>
              {item.icon}
              <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, color: isActive ? C.greenMid : C.textTertiary }}>{item.label}</span>
              {isActive && <div style={{ width: 4, height: 4, borderRadius: '50%', background: C.greenBright }} />}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

const C_greenMid = '#1E5C35'

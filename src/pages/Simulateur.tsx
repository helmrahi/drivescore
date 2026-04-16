import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const C = {
  greenDeep: '#0D2E1C', greenMid: '#1E5C35', greenAccent: '#2A8A50', greenBright: '#3EBD6F',
  amber: '#F5A623', amberLight: '#FDF0D5', amberDark: '#8B5E00',
  red: '#E5403A', redLight: '#FDEAEA',
  white: '#FFFFFF', surface: '#F7F8F6', surface2: '#EDEFEB',
  textPrimary: '#0D1F16', textSecondary: '#4A6355', textTertiary: '#8AA898',
  border: 'rgba(13,46,28,0.08)', borderStrong: 'rgba(13,46,28,0.14)',
  fontSans: "'DM Sans', sans-serif", fontMono: "'DM Mono', monospace",
}

const PROFILES = [
  { id: 'prudent', label: 'Prudent', icon: '🕊️', score: 92, desc: 'Conduite douce' },
  { id: 'normal', label: 'Normal', icon: '🚗', score: 78, desc: 'Conduite standard' },
  { id: 'sportif', label: 'Sportif', icon: '🏎️', score: 58, desc: 'Conduite vive' },
]

const TRAJETS = [
  { id: 'travail', label: 'Domicile/Travail', icon: '🏢', bonus: 5 },
  { id: 'loisirs', label: 'Loisirs', icon: '🎯', bonus: 0 },
  { id: 'mixte', label: 'Mixte', icon: '🔀', bonus: 2 },
]

function sc(s: number) {
  if (s >= 90) return C.greenBright
  if (s >= 80) return C.greenAccent
  if (s >= 70) return C.amber
  return C.red
}

function getReduction(s: number) {
  if (s >= 90) return 15
  if (s >= 80) return 10
  if (s >= 70) return 5
  return 0
}

export default function Simulateur() {
  const navigate = useNavigate()
  const [km, setKm] = useState(500)
  const [profile, setProfile] = useState(PROFILES[0])
  const [trajet, setTrajet] = useState(TRAJETS[0])
  const [nocturne, setNocturne] = useState(false)
  const [anciennete, setAnciennete] = useState(5)

  const scoreBase = profile.score + trajet.bonus + (anciennete >= 5 ? 3 : 0) - (nocturne ? 5 : 0)
  const score = Math.min(100, Math.max(0, scoreBase))
  const reduction = getReduction(score)
  const prime = Math.round((200 + km * 0.5) * (1 - reduction / 100))
  const eco = Math.max(0, 500 - prime)
  const eco12 = eco * 12
  const circumference = 2 * Math.PI * 32

  return (
    <div style={{ minHeight: '100vh', background: C.surface, fontFamily: C.fontSans }}>

      {/* HEADER */}
      <div style={{ background: C.greenDeep, padding: '16px 20px 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'radial-gradient(circle, rgba(62,189,111,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <button onClick={() => navigate('/login')} style={{ background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', borderRadius: 10, padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>← Retour</button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>Simuler ma prime</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Sans engagement · Résultat immédiat</div>
          </div>
          <div style={{ width: 80 }} />
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px' }}>

        {/* RÉSULTAT TEMPS RÉEL */}
        <div style={{ background: C.greenDeep, borderRadius: 22, padding: '20px', marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'radial-gradient(circle, rgba(62,189,111,0.15) 0%, transparent 70%)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, position: 'relative', zIndex: 1 }}>
            {/* Ring */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="36" cy="36" r="32" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6"/>
                <circle cx="36" cy="36" r="32" fill="none" stroke={C.amber} strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference * 2}
                  strokeDashoffset={circumference * 2 - (circumference * 2 * score / 100)}
                  style={{ transition: 'stroke-dashoffset 0.4s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 20, fontWeight: 600, color: 'white', lineHeight: 1, fontFamily: C.fontMono }}>{score}</span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>/100</span>
              </div>
            </div>
            {/* Prime */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.3px', marginBottom: 4 }}>VOTRE PRIME</div>
              <div style={{ fontSize: 40, fontWeight: 600, color: C.amber, lineHeight: 1, fontFamily: C.fontMono, transition: 'all 0.3s' }}>{prime}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>MAD/mois</div>
            </div>
          </div>

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, position: 'relative', zIndex: 1 }}>
            {[
              { val: `-${reduction}%`, label: 'Réduction', color: C.greenBright },
              { val: `+${eco}`, label: 'Éco/mois', color: C.amber },
              { val: `+${eco12}`, label: 'Éco/an', color: '#93C5FD' },
            ].map((k, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: k.color, fontFamily: C.fontMono, transition: 'all 0.3s' }}>{k.val}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{k.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SLIDER KM */}
        <div style={{ background: C.white, borderRadius: 18, padding: '16px', marginBottom: 10, border: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.3px' }}>KILOMÉTRAGE MENSUEL</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: C.textPrimary, fontFamily: C.fontMono }}>{km}<span style={{ fontSize: 12, color: C.textTertiary, fontFamily: C.fontSans, marginLeft: 4 }}>km/mois</span></div>
          </div>
          <input type="range" min="100" max="3000" step="50" defaultValue={km}
            onInput={e => setKm(parseInt((e.target as HTMLInputElement).value))}
            style={{ width: '100%', accentColor: C.greenAccent, cursor: 'pointer' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.textTertiary, marginTop: 4 }}>
            <span>100 km</span><span>3 000 km</span>
          </div>
        </div>

        {/* PROFIL */}
        <div style={{ background: C.white, borderRadius: 18, padding: '16px', marginBottom: 10, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.3px', marginBottom: 12 }}>PROFIL DE CONDUITE</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {PROFILES.map(p => (
              <button key={p.id} onClick={() => setProfile(p)} style={{
                padding: '12px 6px', borderRadius: 14, cursor: 'pointer', textAlign: 'center',
                border: `1px solid ${profile.id === p.id ? C.greenAccent : C.borderStrong}`,
                background: profile.id === p.id ? 'rgba(42,138,80,0.06)' : C.white, transition: 'all 0.15s',
                fontFamily: C.fontSans,
              }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{p.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: profile.id === p.id ? C.greenAccent : C.textSecondary }}>{p.label}</div>
                <div style={{ fontSize: 10, color: C.textTertiary, marginTop: 1, fontFamily: C.fontMono }}>~{p.score}/100</div>
              </button>
            ))}
          </div>
        </div>

        {/* TYPE TRAJET */}
        <div style={{ background: C.white, borderRadius: 18, padding: '16px', marginBottom: 10, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.3px', marginBottom: 12 }}>TYPE DE TRAJET HABITUEL</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {TRAJETS.map(t => (
              <button key={t.id} onClick={() => setTrajet(t)} style={{
                padding: '10px 6px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                border: `1px solid ${trajet.id === t.id ? C.greenAccent : C.borderStrong}`,
                background: trajet.id === t.id ? 'rgba(42,138,80,0.06)' : C.white, transition: 'all 0.15s',
                fontFamily: C.fontSans,
              }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{t.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: trajet.id === t.id ? C.greenAccent : C.textSecondary }}>{t.label}</div>
                {t.bonus > 0 && <div style={{ fontSize: 9, color: C.greenAccent, fontFamily: C.fontMono }}>+{t.bonus} pts</div>}
              </button>
            ))}
          </div>
        </div>

        {/* OPTIONS */}
        <div style={{ background: C.white, borderRadius: 18, padding: '16px', marginBottom: 14, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.3px', marginBottom: 14 }}>OPTIONS</div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: C.textPrimary, fontWeight: 500 }}>🪪 Ancienneté du permis de conduire</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: anciennete >= 5 ? C.greenAccent : C.amber, fontFamily: C.fontMono }}>{anciennete} ans</span>
            </div>
            <input type="range" min="1" max="30" defaultValue={anciennete}
              onInput={e => setAnciennete(parseInt((e.target as HTMLInputElement).value))}
              style={{ width: '100%', accentColor: C.greenAccent, cursor: 'pointer' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.textTertiary, marginTop: 4 }}>
              <span>1 an</span><span style={{ color: anciennete >= 5 ? C.greenAccent : C.amber }}>+5 ans = +3 pts bonus</span><span>30 ans</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: C.surface, borderRadius: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>🌙 Conduite nocturne</div>
              <div style={{ fontSize: 11, color: C.textTertiary }}>Après 22h · Info uniquement</div>
            </div>
            <div onClick={() => setNocturne(!nocturne)} style={{ width: 44, height: 24, borderRadius: 12, cursor: 'pointer', background: nocturne ? C.greenAccent : C.surface2, position: 'relative', transition: 'background 0.2s', border: `1px solid ${nocturne ? C.greenAccent : C.borderStrong}` }}>
              <div style={{ position: 'absolute', top: 2, left: nocturne ? 21 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
            </div>
          </div>
        </div>

        {/* CTAs */}
        <button onClick={() => navigate('/inscription')} style={{ width: '100%', padding: '15px', borderRadius: 14, background: C.greenMid, color: 'white', border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginBottom: 10, fontFamily: C.fontSans, boxShadow: '0 4px 16px rgba(30,92,53,0.25)' }}>
          🚀 Créer mon compte — {prime} MAD/mois
        </button>

        <button onClick={() => {
          const txt = `🚗 Ma simulation DriveScore\nPrime estimée : ${prime} MAD/mois\nÉconomie : ${eco} MAD/mois vs assurance classique\n👉 drivescore-eight.vercel.app`
          window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, '_blank')
        }} style={{ width: '100%', padding: '13px', borderRadius: 14, background: '#25D366', color: 'white', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginBottom: 10, fontFamily: C.fontSans }}>
          📲 Partager sur WhatsApp
        </button>

        <button onClick={() => navigate('/login')} style={{ width: '100%', padding: '12px', borderRadius: 14, background: 'transparent', border: `1px solid ${C.borderStrong}`, color: C.textSecondary, fontWeight: 500, fontSize: 13, cursor: 'pointer', fontFamily: C.fontSans }}>
          J'ai déjà un compte → Se connecter
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, color: C.textTertiary, lineHeight: 1.6, marginTop: 16 }}>
          Simulation basée sur 500 MAD/mois assurance classique.<br />
          Conforme CNDP (Loi 09-08) · Agréé ACAPS · Wafa Assurance © 2026
        </p>
      </div>
    </div>
  )
}

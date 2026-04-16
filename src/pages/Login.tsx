import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const C = {
  greenDeep: '#0D2E1C', greenMid: '#1E5C35', greenAccent: '#2A8A50', greenBright: '#3EBD6F',
  amber: '#F5A623', amberLight: '#FDF0D5', amberDark: '#8B5E00',
  red: '#E5403A', redLight: '#FDEAEA',
  white: '#FFFFFF', surface: '#F7F8F6', surface2: '#EDEFEB',
  textPrimary: '#0D1F16', textSecondary: '#4A6355', textTertiary: '#8AA898',
  border: 'rgba(13,46,28,0.08)', borderStrong: 'rgba(13,46,28,0.14)',
  fontSans: "'DM Sans', sans-serif", fontMono: "'DM Mono', monospace",
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const navigate = useNavigate()

  async function handleOAuth(provider: 'google' | 'facebook') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: 'https://drivescore-eight.vercel.app/auth/callback' }
    })
    if (error) setError('Connexion ' + provider + ' échouée')
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Email ou mot de passe incorrect')
    else navigate('/dashboard')
    setLoading(false)
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 12,
    border: `1px solid ${C.borderStrong}`, fontSize: 14, outline: 'none',
    background: C.white, color: C.textPrimary, fontFamily: C.fontSans,
    boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', background: C.greenDeep, fontFamily: C.fontSans }}>
      <style>{`@keyframes pdot{0%,100%{opacity:.6}50%{opacity:1}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* HERO SOMBRE */}
      <div style={{ padding: '24px 22px 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, background: 'radial-gradient(circle,rgba(62,189,111,0.18) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -40, width: 140, height: 140, background: 'radial-gradient(circle,rgba(245,166,35,0.08) 0%,transparent 70%)', pointerEvents: 'none' }} />

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 22, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.greenBright, animation: 'pdot 2.5s ease-in-out infinite' }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.65)' }}>Wafa Assurance · DriveScore PAYD</span>
        </div>

        {/* Headline */}
        <div style={{ position: 'relative', zIndex: 1, marginBottom: 16 }}>
          <div style={{ fontSize: 26, fontWeight: 600, color: 'white', lineHeight: 1.2, letterSpacing: '-0.6px' }}>
            Conduisez mieux,<br /><span style={{ color: C.amber }}>payez moins.</span>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6, lineHeight: 1.5 }}>
            La première assurance auto télématique au Maroc
          </div>
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16, position: 'relative', zIndex: 1 }}>
          {["✓ Jusqu'à -15%", '✓ 0,50 MAD/km', '✓ Score temps réel'].map((b, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '4px 10px', fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>{b}</div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, position: 'relative', zIndex: 1 }}>
          {[
            { val: '2400+', label: 'conducteurs', color: C.amber },
            { val: '87', label: 'score moyen', color: C.greenBright },
            { val: '-12%', label: 'économie moy.', color: 'white' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: 17, fontWeight: 600, color: s.color, fontFamily: C.fontMono }}>{s.val}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FORMULAIRE CARD */}
      <div style={{ background: C.surface, borderRadius: '22px 22px 0 0', padding: '22px 22px 40px', minHeight: '60vh' }}>

        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: C.textPrimary }}>Connexion</div>
          <div style={{ fontSize: 12, color: C.textTertiary, marginTop: 2 }}>Bienvenue dans votre espace</div>
        </div>

        {error && (
          <div style={{ background: C.redLight, border: `1px solid rgba(229,64,58,0.2)`, color: '#8B1A17', padding: '10px 14px', borderRadius: 10, marginBottom: 14, fontSize: 13, fontWeight: 500 }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.4px', marginBottom: 6 }}>ADRESSE EMAIL</div>
            <input style={inp} type="email" required placeholder="sara.alami@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ fontSize: 10, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.4px' }}>MOT DE PASSE</div>
              <button type="button" onClick={() => navigate('/reset-password')} style={{ background: 'none', border: 'none', color: C.greenAccent, fontSize: 11, fontWeight: 500, cursor: 'pointer', padding: 0 }}>
                Oublié ?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input style={{ ...inp, paddingRight: 42 }} type={showPwd ? 'text' : 'password'} required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: C.textTertiary }}>
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: 14, background: loading ? C.surface2 : C.greenMid, color: loading ? C.textTertiary : 'white', border: 'none', fontWeight: 600, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: C.fontSans, marginTop: 4 }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                Connexion...
              </span>
            ) : '→ Se connecter'}
          </button>

          {/* Séparateur */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 0.5, background: C.border }} />
            <span style={{ fontSize: 10, color: C.textTertiary }}>ou</span>
            <div style={{ flex: 1, height: 0.5, background: C.border }} />
          </div>

          {/* Social */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => handleOAuth('google')} style={{ flex: 1, padding: '10px', borderRadius: 10, border: `1px solid ${C.borderStrong}`, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: C.textSecondary, fontWeight: 500, fontFamily: C.fontSans }}>
              <svg width="14" height="14" viewBox="0 0 16 16"><path d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.3a3.67 3.67 0 01-1.59 2.41v2h2.57c1.5-1.38 2.4-3.42 2.4-5.87z" fill="#4285F4"/><path d="M8 16c2.16 0 3.97-.72 5.3-1.94l-2.58-2a4.8 4.8 0 01-7.16-2.52H.95v2.07A8 8 0 008 16z" fill="#34A853"/><path d="M3.56 9.54A4.8 4.8 0 013.31 8c0-.54.1-1.06.25-1.54V4.39H.95A8 8 0 000 8c0 1.29.31 2.51.95 3.61l2.61-2.07z" fill="#FBBC05"/><path d="M8 3.18c1.22 0 2.3.42 3.16 1.24l2.37-2.37A8 8 0 00.95 4.39L3.56 6.46A4.77 4.77 0 018 3.18z" fill="#EA4335"/></svg>
              Google
            </button>
            <button type="button" onClick={() => handleOAuth('facebook')} style={{ flex: 1, padding: '10px', borderRadius: 10, border: `1px solid ${C.borderStrong}`, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: C.textSecondary, fontWeight: 500, fontFamily: C.fontSans }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="#1877F2"><path d="M16 8A8 8 0 100 8c0 3.99 2.92 7.3 6.75 7.9v-5.6H4.72V8h2.03V6.24c0-2 1.19-3.1 3.01-3.1.87 0 1.78.15 1.78.15v1.96h-1c-.99 0-1.3.61-1.3 1.24V8h2.2l-.35 2.3h-1.85v5.6A8 8 0 0016 8z"/></svg>
              Facebook
            </button>
          </div>

          {/* Simulateur CTA */}
          <div onClick={() => navigate('/simulateur')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', background: 'rgba(245,166,35,0.06)', borderRadius: 12, border: '1px solid rgba(245,166,35,0.15)', cursor: 'pointer' }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.amberDark }}>Simuler ma prime d'abord</div>
              <div style={{ fontSize: 10, color: C.textTertiary }}>Sans inscription · Résultat immédiat</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>

          <Link to="/inscription" style={{ textDecoration: 'none' }}>
            <div style={{ width: '100%', padding: '11px', borderRadius: 12, background: 'transparent', border: `1px solid ${C.borderStrong}`, color: C.textSecondary, fontWeight: 500, fontSize: 13, cursor: 'pointer', textAlign: 'center' }}>
              ✨ Créer mon compte gratuitement
            </div>
          </Link>

          <p style={{ textAlign: 'center', fontSize: 10, color: C.textTertiary, lineHeight: 1.6 }}>
            Conforme CNDP (Loi 09-08) · Agréé ACAPS · © 2026 Wafa Assurance
          </p>
        </form>
      </div>
    </div>
  )
}

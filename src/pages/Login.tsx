import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const C = {
  greenDeep: '#0D2E1C', greenDark: '#163D25', greenMid: '#1E5C35',
  greenAccent: '#2A8A50', greenBright: '#3EBD6F',
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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Email ou mot de passe incorrect')
    else navigate('/dashboard')
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: C.fontSans, display: 'flex', background: C.white }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse-dot{0%,100%{box-shadow:0 0 8px rgba(62,189,111,0.6)}50%{box-shadow:0 0 16px rgba(62,189,111,0.9)}}`}</style>

      {/* PANNEAU GAUCHE — desktop */}
      <div style={{ flex: '0 0 46%', background: C.greenDeep, padding: '52px 56px', position: 'relative', overflow: 'hidden', display: 'none' }} className="login-left">
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, background: 'radial-gradient(circle, rgba(62,189,111,0.18) 0%, transparent 70%)' }} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 56 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.greenBright, animation: 'pulse-dot 2.5s ease-in-out infinite' }} />
            <span style={{ fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>Wafa · DriveScore PAYD</span>
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 600, color: 'white', lineHeight: 1.2, marginBottom: 20, letterSpacing: '-1px' }}>
            Conduisez mieux,<br /><span style={{ color: C.amber }}>payez moins.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, lineHeight: 1.7, marginBottom: 40 }}>
            La première assurance auto télématique au Maroc.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              '200 MAD de base + 0,50 MAD/km',
              "Jusqu'à -15% pour les bons conducteurs",
              'Score de conduite en temps réel',
              'Conforme CNDP Maroc',
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.greenBright, flexShrink: 0 }} />
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 400 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PANNEAU DROIT */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: C.greenMid, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.greenBright, boxShadow: '0 0 8px rgba(62,189,111,0.8)' }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.textSecondary, marginBottom: 4 }}>Wafa Assurance · DriveScore</div>
            <h2 style={{ fontSize: 26, fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.5px', marginBottom: 6 }}>Connexion</h2>
            <p style={{ fontSize: 13, color: C.textTertiary }}>Bienvenue dans votre espace personnel</p>
          </div>

          <div style={{ background: C.white, borderRadius: 24, padding: '28px 24px', border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(13,46,28,0.06)' }}>
            {error && (
              <div style={{ background: C.redLight, border: `1px solid rgba(229,64,58,0.2)`, color: '#8B1A17', padding: '10px 14px', borderRadius: 12, marginBottom: 18, fontSize: 13, fontWeight: 500 }}>
                ⚠ {error}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.3px', marginBottom: 7 }}>ADRESSE EMAIL</div>
                <input type="email" required placeholder="sara.alami@email.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${C.borderStrong}`, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: C.surface, color: C.textPrimary, fontFamily: C.fontSans }} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                  <span style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.3px' }}>MOT DE PASSE</span>
                  <button type="button" onClick={() => navigate('/reset-password')} style={{ background: 'none', border: 'none', color: C.greenAccent, fontSize: 12, fontWeight: 500, cursor: 'pointer', padding: 0 }}>
                    Mot de passe oublié ?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input type={showPwd ? 'text' : 'password'} required placeholder="••••••••" value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '12px 44px 12px 14px', borderRadius: 12, border: `1px solid ${C.borderStrong}`, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: C.surface, color: C.textPrimary, fontFamily: C.fontSans }} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.textTertiary, fontSize: 14 }}>
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} style={{
                padding: '14px', borderRadius: 14, marginTop: 4, fontFamily: C.fontSans,
                background: loading ? C.surface2 : C.greenMid,
                color: loading ? C.textTertiary : 'white',
                border: 'none', fontWeight: 600, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
              }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    Connexion...
                  </span>
                ) : '→ Se connecter'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <span style={{ fontSize: 12, color: C.textTertiary }}>Nouveau sur DriveScore ?</span>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>

            <button onClick={() => navigate('/simulateur')} style={{ width: '100%', padding: '12px', borderRadius: 12, marginBottom: 10, background: 'transparent', border: `1px solid ${C.borderStrong}`, color: C.textSecondary, fontWeight: 500, fontSize: 13, cursor: 'pointer', fontFamily: C.fontSans }}>
              💡 Simuler ma prime avant de m'inscrire
            </button>

            <Link to="/inscription" style={{ textDecoration: 'none' }}>
              <div style={{ padding: '13px', borderRadius: 12, border: `1px solid rgba(245,166,35,0.3)`, background: C.amberLight, textAlign: 'center', color: C.amberDark, fontWeight: 600, fontSize: 14 }}>
                ✨ Créer mon compte gratuitement
              </div>
            </Link>
          </div>

          <p style={{ fontSize: 11, color: C.textTertiary, margin: '16px 0 0', textAlign: 'center', lineHeight: 1.6 }}>
            Données hébergées en Europe · Conforme CNDP (Loi 09-08)<br />
            Agréé ACAPS · © 2026 Wafa Assurance
          </p>
        </div>
      </div>
    </div>
  )
}

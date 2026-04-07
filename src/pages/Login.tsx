import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const WAFA = {
  or: '#F5A623', orDark: '#D4891A', orLight: '#FDF3E0',
  vert: '#2E7D32', vertLight: '#4CAF50', vertDark: '#1B5E20',
  noir: '#1A1A1A', gris: '#F5F5F5', grisMid: '#E8E8E8',
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
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Email ou mot de passe incorrect')
    else navigate('/dashboard')
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          font-family: Inter, sans-serif;
          background: white;
        }
        .login-left {
          display: none;
        }
        .login-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
          background: white;
        }
        @media (min-width: 768px) {
          .login-left {
            display: flex;
            flex: 0 0 46%;
            flex-direction: column;
            justify-content: space-between;
            padding: 52px 56px;
            position: relative;
            overflow: hidden;
            background: linear-gradient(160deg, #1B5E20 0%, #2E7D32 60%, #4CAF50 100%);
          }
        }
      `}</style>

      <div className="login-wrapper">

        {/* PANNEAU GAUCHE */}
        <div className="login-left">
          <div style={{ position: 'absolute', top: -100, right: -100, width: 350, height: 350, borderRadius: '50%', background: 'rgba(245,166,35,0.08)' }} />
          <div style={{ position: 'absolute', bottom: -80, left: -80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(0,0,0,0.06)' }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 52 }}>
              <img src="/wafa-logo.png" alt="Wafa" style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'cover' }} />
              <div>
                <div style={{ color: 'white', fontWeight: 900, fontSize: 24, letterSpacing: '-0.5px', lineHeight: 1 }}>
                  WAFA<span style={{ color: WAFA.or }}> ASSURANCE</span>
                </div>
                <div style={{ display: 'inline-block', marginTop: 6, background: WAFA.or, color: WAFA.noir, fontSize: 10, fontWeight: 800, letterSpacing: '1.5px', padding: '3px 10px', borderRadius: 20 }}>
                  DRIVESCORE PAYD
                </div>
              </div>
            </div>
            <h1 style={{ color: 'white', fontSize: 40, fontWeight: 900, lineHeight: 1.15, marginBottom: 20, letterSpacing: '-1px' }}>
              Conduisez mieux,<br />
              <span style={{ color: WAFA.or }}>payez moins.</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.8, maxWidth: 340, marginBottom: 40 }}>
              La première assurance auto télématique au Maroc.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: '🛣️', text: '200 MAD de base + 0,50 MAD/km' },
                { icon: '🏅', text: 'Jusqu\'à -15% pour les bons conducteurs' },
                { icon: '📊', text: 'Score de conduite en temps réel' },
                { icon: '🔐', text: 'Conforme CNDP Maroc' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 16px' }}>
                  <span style={{ fontSize: 18 }}>{f.icon}</span>
                  <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 500 }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 32 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: WAFA.or }} />
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>Wafa Assurance · Leader depuis 1972</span>
          </div>
        </div>

        {/* PANNEAU DROIT */}
        <div className="login-right">
          <div style={{ width: '100%', maxWidth: 400 }}>

            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <img src="/wafa-logo.png" alt="Wafa" style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover', marginBottom: 10 }} />
              <div style={{ fontWeight: 900, fontSize: 15, color: WAFA.noir }}>
                WAFA <span style={{ color: WAFA.vert }}>ASSURANCE</span>
              </div>
              <div style={{ display: 'inline-block', marginTop: 4, background: WAFA.or, color: WAFA.noir, fontSize: 9, fontWeight: 800, letterSpacing: '1.2px', padding: '2px 8px', borderRadius: 20 }}>
                DRIVESCORE PAYD
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 900, color: WAFA.noir, margin: '16px 0 4px', letterSpacing: '-0.5px' }}>Connexion</h2>
              <p style={{ color: '#64748B', fontSize: 14, margin: 0 }}>Bienvenue dans votre espace personnel</p>
            </div>

            <div style={{ background: 'white', borderRadius: 20, padding: '28px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: `1px solid ${WAFA.grisMid}` }}>

              {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '12px 16px', borderRadius: 12, marginBottom: 20, fontSize: 13, fontWeight: 500 }}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 8, letterSpacing: '0.5px' }}>ADRESSE EMAIL</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: 0.5 }}>✉️</span>
                    <input
                      type="email" required placeholder="sara.alami@email.com"
                      value={email} onChange={e => setEmail(e.target.value)}
                      style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: 12, border: `1.5px solid ${WAFA.grisMid}`, fontSize: 15, outline: 'none', boxSizing: 'border-box', background: WAFA.gris, color: WAFA.noir }}
                      onFocus={e => { e.target.style.borderColor = WAFA.vert; e.target.style.background = 'white' }}
                      onBlur={e => { e.target.style.borderColor = WAFA.grisMid; e.target.style.background = WAFA.gris }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', letterSpacing: '0.5px' }}>MOT DE PASSE</label>
                    <button type="button" onClick={() => navigate('/reset-password')} style={{ background: 'none', border: 'none', color: WAFA.vert, fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: 0.5 }}>🔒</span>
                    <input
                      type={showPwd ? 'text' : 'password'} required placeholder="••••••••••"
                      value={password} onChange={e => setPassword(e.target.value)}
                      style={{ width: '100%', padding: '14px 44px', borderRadius: 12, border: `1.5px solid ${WAFA.grisMid}`, fontSize: 15, outline: 'none', boxSizing: 'border-box', background: WAFA.gris, color: WAFA.noir }}
                      onFocus={e => { e.target.style.borderColor = WAFA.vert; e.target.style.background = 'white' }}
                      onBlur={e => { e.target.style.borderColor = WAFA.grisMid; e.target.style.background = WAFA.gris }}
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: 0.5 }}>
                      {showPwd ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} style={{
                  padding: '16px', borderRadius: 14, marginTop: 4,
                  background: loading ? '#94A3B8' : `linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`,
                  color: 'white', border: 'none', fontWeight: 800, fontSize: 16,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : `0 6px 20px rgba(46,125,50,0.35)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}>
                  {loading ? (
                    <>
                      <div style={{ width: 18, height: 18, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      Connexion...
                    </>
                  ) : '→ Se connecter'}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                <div style={{ flex: 1, height: 1, background: WAFA.grisMid }} />
                <span style={{ fontSize: 12, color: '#94A3B8' }}>Nouveau sur DriveScore ?</span>
                <div style={{ flex: 1, height: 1, background: WAFA.grisMid }} />
              </div>

              <Link to="/inscription" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '15px', borderRadius: 14, border: `2px solid ${WAFA.or}`, background: WAFA.orLight, textAlign: 'center', color: WAFA.vertDark, fontWeight: 800, fontSize: 14 }}>
                  ✨ Créer mon compte gratuitement
                </div>
              </Link>
            </div>

            <p style={{ fontSize: 11, color: '#94A3B8', margin: '16px 0 0', textAlign: 'center', lineHeight: 1.6 }}>
              Données hébergées en Europe · Conforme CNDP (Loi 09-08)<br />
              Agréé par l'ACAPS · © 2026 Wafa Assurance
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const C = {
  greenDeep: '#0D2E1C', greenMid: '#1E5C35', greenAccent: '#2A8A50', greenBright: '#3EBD6F',
  amber: '#F5A623', amberLight: '#FDF0D5', amberDark: '#8B5E00',
  red: '#E5403A', redLight: '#FDEAEA',
  blue: '#2D7DD2', blueLight: '#E8F2FC', blueDark: '#1A4A7D',
  white: '#FFFFFF', surface: '#F7F8F6', surface2: '#EDEFEB',
  textPrimary: '#0D1F16', textSecondary: '#4A6355', textTertiary: '#8AA898',
  border: 'rgba(13,46,28,0.08)', borderStrong: 'rgba(13,46,28,0.14)',
  fontSans: "'DM Sans', sans-serif", fontMono: "'DM Mono', monospace",
}

const inp: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: 12,
  border: `1px solid ${C.borderStrong}`, fontSize: 14, outline: 'none',
  background: C.white, color: C.textPrimary, fontFamily: C.fontSans,
  boxSizing: 'border-box',
}

function pwdStrength(p: string): { score: number; label: string; color: string } {
  let s = 0
  if (p.length >= 8) s++
  if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  const levels = [
    { label: '', color: C.surface2 },
    { label: 'Faible', color: C.red },
    { label: 'Moyen', color: C.amber },
    { label: 'Bon', color: C.greenAccent },
    { label: 'Excellent', color: C.greenBright },
  ]
  return { score: s, ...levels[s] }
}

export default function Inscription() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', password: '', confirm: '' })
  const [consents, setConsents] = useState({ gps: false, cgu: false, marketing: false })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const pwd = pwdStrength(form.password)

  async function handleOAuth(provider: 'google' | 'facebook') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: 'https://drivescore-eight.vercel.app/auth/callback' }
    })
    if (error) setError('Connexion ' + provider + ' échouée')
  }

  async function submit() {
    if (!consents.gps || !consents.cgu) { setError('Veuillez accepter les consentements obligatoires'); return }
    setLoading(true); setError('')
    const { data, error: signUpError } = await supabase.auth.signUp({ email: form.email, password: form.password })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    if (data.user) {
      const pseudoId = 'DS' + Math.random().toString(36).substr(2, 8).toUpperCase()
      await supabase.from('profiles').upsert({
        id: data.user.id, pseudo_id: pseudoId,
        prenom: form.prenom, nom: form.nom, email: form.email,
        role: 'client', consentement_gps: consents.gps,
        consentement_marketing: consents.marketing,
        afficher_leaderboard: false,
      })
    }
    setSuccess(true)
    setLoading(false)
  }

  if (success) return (
    <div style={{ minHeight: '100vh', background: C.greenDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: C.fontSans }}>
      <div style={{ background: C.white, borderRadius: 20, padding: '36px 28px', textAlign: 'center', maxWidth: 340 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <div style={{ fontSize: 20, fontWeight: 600, color: C.textPrimary, marginBottom: 8 }}>Compte créé !</div>
        <div style={{ fontSize: 13, color: C.textTertiary, lineHeight: 1.6, marginBottom: 24 }}>
          Un email de confirmation a été envoyé à <strong style={{ color: C.textPrimary }}>{form.email}</strong>.<br />
          Cliquez sur le lien pour activer votre compte.
        </div>
        <button onClick={() => navigate('/login')} style={{ width: '100%', padding: '13px', borderRadius: 12, background: C.greenMid, color: 'white', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: C.fontSans }}>
          → Se connecter
        </button>
      </div>
    </div>
  )

  const progress = Math.round((step / 3) * 100)

  return (
    <div style={{ minHeight: '100vh', background: C.greenDeep, fontFamily: C.fontSans }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pdot{0%,100%{opacity:.6}50%{opacity:1}}`}</style>

      {/* HEADER */}
      <div style={{ padding: '18px 22px 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, background: 'radial-gradient(circle,rgba(62,189,111,0.18) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.greenBright, animation: 'pdot 2.5s ease-in-out infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.65)' }}>DriveScore · Inscription</span>
          </div>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Étape {step}/3</span>
        </div>

        {/* Progress */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 16, position: 'relative', zIndex: 1 }}>
          <div style={{ width: `${progress}%`, height: '100%', background: C.greenBright, borderRadius: 2, transition: 'width 0.3s ease' }} />
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          {[['1','Identité'],['2','Sécurité'],['3','Consentement']].map(([n, label], i) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: step > i + 1 ? C.greenBright : step === i + 1 ? C.greenBright : 'rgba(255,255,255,0.1)', color: step >= i + 1 ? C.greenDeep : 'rgba(255,255,255,0.35)', transition: 'all 0.2s' }}>
                  {step > i + 1 ? '✓' : n}
                </div>
                <span style={{ fontSize: 10, color: step >= i + 1 ? 'white' : 'rgba(255,255,255,0.35)', fontWeight: step === i + 1 ? 600 : 400 }}>{label}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.15)', margin: '0 8px' }} />}
            </div>
          ))}
        </div>
      </div>

      {/* CARD */}
      <div style={{ background: C.surface, borderRadius: '22px 22px 0 0', padding: '22px 22px 40px', minHeight: '65vh' }}>

        {error && (
          <div style={{ background: C.redLight, border: `1px solid rgba(229,64,58,0.2)`, color: '#8B1A17', padding: '10px 14px', borderRadius: 10, marginBottom: 14, fontSize: 13 }}>
            ⚠ {error}
          </div>
        )}

        {/* ÉTAPE 1 */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 17, fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>Vos informations</div>
              <div style={{ fontSize: 12, color: C.textTertiary }}>Renseignez vos coordonnées personnelles</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* OAuth rapide */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                <button type="button" onClick={() => handleOAuth('google')} style={{ flex: 1, padding: '10px', borderRadius: 10, border: `1px solid ${C.borderStrong}`, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: C.textSecondary, fontWeight: 500, fontFamily: C.fontSans }}>
                  <svg width="14" height="14" viewBox="0 0 16 16"><path d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.3a3.67 3.67 0 01-1.59 2.41v2h2.57c1.5-1.38 2.4-3.42 2.4-5.87z" fill="#4285F4"/><path d="M8 16c2.16 0 3.97-.72 5.3-1.94l-2.58-2a4.8 4.8 0 01-7.16-2.52H.95v2.07A8 8 0 008 16z" fill="#34A853"/><path d="M3.56 9.54A4.8 4.8 0 013.31 8c0-.54.1-1.06.25-1.54V4.39H.95A8 8 0 000 8c0 1.29.31 2.51.95 3.61l2.61-2.07z" fill="#FBBC05"/><path d="M8 3.18c1.22 0 2.3.42 3.16 1.24l2.37-2.37A8 8 0 00.95 4.39L3.56 6.46A4.77 4.77 0 018 3.18z" fill="#EA4335"/></svg>
                  Google
                </button>
                <button type="button" onClick={() => handleOAuth('facebook')} style={{ flex: 1, padding: '10px', borderRadius: 10, border: `1px solid ${C.borderStrong}`, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: C.textSecondary, fontWeight: 500, fontFamily: C.fontSans }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="#1877F2"><path d="M16 8A8 8 0 100 8c0 3.99 2.92 7.3 6.75 7.9v-5.6H4.72V8h2.03V6.24c0-2 1.19-3.1 3.01-3.1.87 0 1.78.15 1.78.15v1.96h-1c-.99 0-1.3.61-1.3 1.24V8h2.2l-.35 2.3h-1.85v5.6A8 8 0 0016 8z"/></svg>
                  Facebook
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 0.5, background: C.border }} />
                <span style={{ fontSize: 10, color: C.textTertiary }}>ou avec email</span>
                <div style={{ flex: 1, height: 0.5, background: C.border }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[['prenom','PRÉNOM','Sara'],['nom','NOM','Alami']].map(([key,label,ph]) => (
                  <div key={key}>
                    <div style={{ fontSize: 10, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.4px', marginBottom: 6 }}>{label}</div>
                    <input style={inp} placeholder={ph} value={(form as any)[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))} />
                  </div>
                ))}
              </div>

              <div>
                <div style={{ fontSize: 10, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.4px', marginBottom: 6 }}>EMAIL</div>
                <input style={inp} type="email" placeholder="sara.alami@email.com" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
              </div>

              {/* Avantages */}
              <div style={{ background: 'rgba(42,138,80,0.06)', borderRadius: 12, padding: 12, border: '1px solid rgba(42,138,80,0.12)' }}>
                <div style={{ fontSize: 10, color: C.greenAccent, fontWeight: 600, letterSpacing: '0.4px', marginBottom: 8 }}>CE QUE VOUS OBTENEZ</div>
                {[
                  { text: "Score de conduite en temps réel", color: C.greenBright },
                  { text: "Réduction jusqu'à -15% sur votre prime", color: C.greenBright },
                  { text: "Carte GPS de chaque trajet", color: C.amber },
                ].map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < 2 ? 6 : 0 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(62,189,111,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 9, color: b.color }}>✓</span>
                    </div>
                    <span style={{ fontSize: 12, color: C.textSecondary }}>{b.text}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => { if (!form.prenom || !form.email) { setError('Renseignez prénom et email'); return } setError(''); setStep(2) }} style={{ width: '100%', padding: '14px', borderRadius: 14, background: C.greenMid, color: 'white', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: C.fontSans }}>
                Continuer →
              </button>

              <div style={{ textAlign: 'center', fontSize: 12, color: C.textTertiary }}>
                Déjà inscrit ? <span onClick={() => navigate('/login')} style={{ color: C.greenAccent, fontWeight: 500, cursor: 'pointer' }}>Se connecter</span>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 17, fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>Sécurisez votre compte</div>
              <div style={{ fontSize: 12, color: C.textTertiary }}>Choisissez un mot de passe fort</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.4px', marginBottom: 6 }}>MOT DE PASSE</div>
                <div style={{ position: 'relative' }}>
                  <input style={{ ...inp, paddingRight: 42 }} type={showPwd ? 'text' : 'password'} placeholder="Min. 8 caractères" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: C.textTertiary }}>
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 10, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.4px', marginBottom: 6 }}>CONFIRMER</div>
                <input style={inp} type="password" placeholder="Répétez le mot de passe" value={form.confirm} onChange={e => setForm(f => ({...f, confirm: e.target.value}))} />
              </div>

              {/* Force password */}
              {form.password.length > 0 && (
                <div style={{ background: C.surface, borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: C.textTertiary, marginBottom: 6 }}>FORCE DU MOT DE PASSE</div>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= pwd.score ? pwd.color : C.surface2, transition: 'background 0.2s' }} />
                    ))}
                  </div>
                  {pwd.label && <div style={{ fontSize: 10, color: pwd.color }}>{pwd.label}</div>}
                </div>
              )}

              <button onClick={() => {
                if (form.password.length < 8) { setError('Mot de passe trop court'); return }
                if (form.password !== form.confirm) { setError('Les mots de passe ne correspondent pas'); return }
                setError(''); setStep(3)
              }} style={{ width: '100%', padding: '14px', borderRadius: 14, background: C.greenMid, color: 'white', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: C.fontSans }}>
                Continuer →
              </button>
              <button onClick={() => setStep(1)} style={{ width: '100%', padding: '10px', borderRadius: 12, background: 'transparent', border: `1px solid ${C.borderStrong}`, color: C.textTertiary, fontSize: 13, cursor: 'pointer', fontFamily: C.fontSans }}>← Retour</button>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 */}
        {step === 3 && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 17, fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>Consentements CNDP</div>
              <div style={{ fontSize: 12, color: C.textTertiary }}>Conformité Loi 09-08 Maroc</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { key: 'gps', title: 'Collecte de données GPS *', desc: 'Pendant vos trajets uniquement. Données hébergées en Europe.', required: true },
                { key: 'cgu', title: 'CGU Wafa Assurance *', desc: "J'accepte les conditions générales d'utilisation DriveScore.", required: true },
                { key: 'marketing', title: 'Communications marketing', desc: 'Offres et conseils Wafa Assurance (facultatif).', required: false },
              ].map(item => (
                <div key={item.key} onClick={() => setConsents(c => ({...c, [item.key]: !(c as any)[item.key]}))}
                  style={{ background: C.white, borderRadius: 12, padding: 12, border: `1px solid ${(consents as any)[item.key] ? C.greenAccent + '40' : C.border}`, display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', transition: 'border-color 0.15s' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: (consents as any)[item.key] ? C.greenMid : C.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, transition: 'background 0.15s' }}>
                    {(consents as any)[item.key] && <span style={{ color: 'white', fontSize: 11 }}>✓</span>}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 3 }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: C.textTertiary, lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                </div>
              ))}

              <div style={{ background: C.blueLight, borderRadius: 10, padding: '10px 12px', border: `1px solid rgba(45,125,210,0.12)`, display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>🔐</span>
                <div style={{ fontSize: 11, color: C.blueDark, lineHeight: 1.5 }}>Vos données ne sont jamais vendues à des tiers. Suppression possible à tout moment.</div>
              </div>

              <button onClick={submit} disabled={loading || !consents.gps || !consents.cgu} style={{
                width: '100%', padding: '14px', borderRadius: 14, fontFamily: C.fontSans,
                background: loading || !consents.gps || !consents.cgu ? C.surface2 : C.greenMid,
                color: loading || !consents.gps || !consents.cgu ? C.textTertiary : 'white',
                border: 'none', fontWeight: 600, fontSize: 14,
                cursor: loading || !consents.gps || !consents.cgu ? 'not-allowed' : 'pointer',
              }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    Création en cours...
                  </span>
                ) : '🚀 Créer mon compte'}
              </button>

              <button onClick={() => setStep(2)} style={{ width: '100%', padding: '10px', borderRadius: 12, background: 'transparent', border: `1px solid ${C.borderStrong}`, color: C.textTertiary, fontSize: 13, cursor: 'pointer', fontFamily: C.fontSans }}>← Retour</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

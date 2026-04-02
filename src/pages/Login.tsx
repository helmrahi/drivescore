import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const WAFA = {
  or: '#F5A623',
  orDark: '#D4891A',
  orLight: '#FDF3E0',
  vert: '#2E7D32',
  vertLight: '#4CAF50',
  vertDark: '#1B5E20',
  noir: '#1A1A1A',
  gris: '#F5F5F5',
  grisMid: '#E8E8E8',
  texte: '#2C2C2C',
}

function WafaLogo({ size = 40 }: { size?: number }) {
  return (
    <img src="/wafa-logo.png" alt="Wafa Assurance"
      style={{ width: size, height: size, borderRadius: size * 0.15, objectFit: 'cover' }} />
  )
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
    <div style={{minHeight:'100vh',fontFamily:'Inter,sans-serif',display:'flex',background:WAFA.gris}}>

      {/* PANNEAU GAUCHE — Branding Wafa */}
      <div style={{
        flex:'0 0 46%',
        background:`linear-gradient(160deg, ${WAFA.vertDark} 0%, ${WAFA.vert} 60%, ${WAFA.vertLight} 100%)`,
        display:'flex',flexDirection:'column',justifyContent:'space-between',
        padding:'52px 56px',position:'relative',overflow:'hidden'
      }}>
        {/* Déco cercles */}
        <div style={{position:'absolute',top:-100,right:-100,width:350,height:350,borderRadius:'50%',background:'rgba(245,166,35,0.08)'}} />
        <div style={{position:'absolute',bottom:-80,left:-80,width:280,height:280,borderRadius:'50%',background:'rgba(0,0,0,0.06)'}} />
        <div style={{position:'absolute',top:'35%',right:-60,width:200,height:200,borderRadius:'50%',background:'rgba(245,166,35,0.06)'}} />

        {/* Logo + nom */}
        <div>
          <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:52}}>
            <WafaLogo size={60} />
            <div>
              <div style={{color:'white',fontWeight:900,fontSize:24,letterSpacing:'-0.5px',lineHeight:1}}>
                WAFA<span style={{color:WAFA.or}}> ASSURANCE</span>
              </div>
              <div style={{
                display:'inline-block',marginTop:6,
                background:WAFA.or,color:WAFA.noir,
                fontSize:10,fontWeight:800,letterSpacing:'1.5px',
                padding:'3px 10px',borderRadius:20
              }}>
                DRIVESCORE PAYD
              </div>
            </div>
          </div>

          <h1 style={{
            color:'white',fontSize:40,fontWeight:900,
            lineHeight:1.15,marginBottom:20,letterSpacing:'-1px'
          }}>
            Conduisez mieux,<br/>
            <span style={{color:WAFA.or}}>payez moins.</span>
          </h1>

          <p style={{color:'rgba(255,255,255,0.7)',fontSize:15,lineHeight:1.8,maxWidth:340,marginBottom:40}}>
            La première assurance auto télématique au Maroc. Votre prime calculée sur vos kilomètres réels et votre comportement de conduite.
          </p>

          {/* Feature pills */}
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {[
              { icon:'🛣️', text:'200 MAD de base + 0,50 MAD/km seulement' },
              { icon:'🏅', text:'Jusqu\'à -15% pour les bons conducteurs' },
              { icon:'📊', text:'Score de conduite en temps réel' },
              { icon:'🔐', text:'Données sécurisées · Conforme CNDP Maroc' },
            ].map((f,i) => (
              <div key={i} style={{
                display:'flex',alignItems:'center',gap:12,
                background:'rgba(255,255,255,0.08)',
                border:'1px solid rgba(255,255,255,0.12)',
                borderRadius:12,padding:'12px 16px'
              }}>
                <span style={{fontSize:18}}>{f.icon}</span>
                <span style={{color:'rgba(255,255,255,0.85)',fontSize:13,fontWeight:500}}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{display:'flex',alignItems:'center',gap:8,paddingTop:32}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:WAFA.or}} />
          <span style={{color:'rgba(255,255,255,0.45)',fontSize:11,letterSpacing:'0.3px'}}>
            Wafa Assurance · Leader de l'assurance au Maroc depuis 1972
          </span>
        </div>
      </div>

      {/* PANNEAU DROIT — Formulaire */}
      <div style={{
        flex:1,display:'flex',alignItems:'center',
        justifyContent:'center',padding:'40px 24px',
        background:'white'
      }}>
        <div style={{width:'100%',maxWidth:420}}>

          {/* Badge top */}
          <div style={{textAlign:'center',marginBottom:36}}>
            <div style={{
              display:'inline-flex',alignItems:'center',gap:10,
              background:WAFA.orLight,border:`1.5px solid ${WAFA.or}`,
              borderRadius:50,padding:'8px 20px',marginBottom:24
            }}>
              <WafaLogo size={24} />
              <span style={{fontWeight:700,fontSize:13,color:WAFA.vertDark}}>Espace conducteur DriveScore</span>
            </div>

            <h2 style={{
              fontSize:28,fontWeight:900,color:WAFA.noir,
              margin:'0 0 8px',letterSpacing:'-0.5px'
            }}>
              Connexion
            </h2>
            <p style={{color:'#64748B',fontSize:14,margin:0}}>
              Bienvenue dans votre espace personnel
            </p>
          </div>

          {/* Formulaire */}
          <div style={{
            background:'white',borderRadius:24,padding:36,
            boxShadow:'0 8px 40px rgba(0,0,0,0.08)',
            border:`1px solid ${WAFA.grisMid}`
          }}>
            {error && (
              <div style={{
                display:'flex',alignItems:'center',gap:10,
                background:'#FEF2F2',border:'1px solid #FECACA',
                color:'#DC2626',padding:'12px 16px',
                borderRadius:12,marginBottom:24,fontSize:13,fontWeight:500
              }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:20}}>
              {/* Email */}
              <div>
                <label style={{
                  display:'block',fontSize:12,fontWeight:700,
                  color:'#6B7280',marginBottom:8,letterSpacing:'0.5px'
                }}>
                  ADRESSE EMAIL
                </label>
                <div style={{position:'relative'}}>
                  <span style={{
                    position:'absolute',left:14,top:'50%',
                    transform:'translateY(-50%)',fontSize:16,opacity:0.5
                  }}>✉️</span>
                  <input
                    type="email" required placeholder="sara.alami@email.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    style={{
                      width:'100%',padding:'14px 14px 14px 44px',
                      borderRadius:12,border:`1.5px solid ${WAFA.grisMid}`,
                      fontSize:14,outline:'none',boxSizing:'border-box',
                      background:WAFA.gris,fontFamily:'Inter,sans-serif',
                      color:WAFA.noir,transition:'all 0.2s'
                    }}
                    onFocus={e => {e.target.style.borderColor=WAFA.vert; e.target.style.background='white'}}
                    onBlur={e => {e.target.style.borderColor=WAFA.grisMid; e.target.style.background=WAFA.gris}}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <label style={{fontSize:12,fontWeight:700,color:'#6B7280',letterSpacing:'0.5px'}}>
                    MOT DE PASSE
                  </label>
                  <button type="button" style={{
                    background:'none',border:'none',
                    color:WAFA.vert,fontSize:12,fontWeight:600,cursor:'pointer'
                  }}>
                    Mot de passe oublié ?
                  </button>
                </div>
                <div style={{position:'relative'}}>
                  <span style={{
                    position:'absolute',left:14,top:'50%',
                    transform:'translateY(-50%)',fontSize:16,opacity:0.5
                  }}>🔒</span>
                  <input
                    type={showPwd?'text':'password'} required placeholder="••••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                    style={{
                      width:'100%',padding:'14px 44px',
                      borderRadius:12,border:`1.5px solid ${WAFA.grisMid}`,
                      fontSize:14,outline:'none',boxSizing:'border-box',
                      background:WAFA.gris,fontFamily:'Inter,sans-serif',
                      color:WAFA.noir,transition:'all 0.2s'
                    }}
                    onFocus={e => {e.target.style.borderColor=WAFA.vert; e.target.style.background='white'}}
                    onBlur={e => {e.target.style.borderColor=WAFA.grisMid; e.target.style.background=WAFA.gris}}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    style={{
                      position:'absolute',right:14,top:'50%',
                      transform:'translateY(-50%)',
                      background:'none',border:'none',cursor:'pointer',fontSize:16,opacity:0.5
                    }}>
                    {showPwd?'🙈':'👁️'}
                  </button>
                </div>
              </div>

              {/* Bouton connexion */}
              <button type="submit" disabled={loading} style={{
                padding:'16px',borderRadius:14,
                background:loading?'#94A3B8':`linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`,
                color:'white',border:'none',fontWeight:800,fontSize:15,
                cursor:loading?'not-allowed':'pointer',
                boxShadow:loading?'none':`0 6px 20px rgba(46,125,50,0.4)`,
                transition:'all 0.2s',letterSpacing:'0.3px',
                display:'flex',alignItems:'center',justifyContent:'center',gap:8
              }}>
                {loading ? (
                  <>
                    <div style={{width:18,height:18,border:'2px solid white',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite'}} />
                    Connexion...
                  </>
                ) : '→ Se connecter'}
              </button>
            </form>

            {/* Séparateur */}
            <div style={{display:'flex',alignItems:'center',gap:12,margin:'24px 0'}}>
              <div style={{flex:1,height:1,background:WAFA.grisMid}} />
              <span style={{fontSize:12,color:'#94A3B8',fontWeight:500}}>Nouveau sur DriveScore ?</span>
              <div style={{flex:1,height:1,background:WAFA.grisMid}} />
            </div>

            {/* Bouton inscription */}
            <Link to="/inscription" style={{textDecoration:'none'}}>
              <div style={{
                padding:'15px',borderRadius:14,
                border:`2px solid ${WAFA.or}`,
                background:WAFA.orLight,
                textAlign:'center',color:WAFA.vertDark,
                fontWeight:800,fontSize:14,cursor:'pointer',
                display:'flex',alignItems:'center',justifyContent:'center',gap:8
              }}>
                <span>✨</span> Créer mon compte gratuitement
              </div>
            </Link>
          </div>

          {/* Footer légal */}
          <div style={{
            marginTop:24,padding:'16px 20px',
            background:WAFA.orLight,borderRadius:14,
            border:`1px solid ${WAFA.or}20`,
            textAlign:'center'
          }}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,marginBottom:4}}>
              <WafaLogo size={16} />
              <span style={{fontSize:12,fontWeight:700,color:WAFA.vertDark}}>Wafa Assurance</span>
            </div>
            <p style={{fontSize:11,color:'#94A3B8',margin:0,lineHeight:1.5}}>
              Données hébergées en Europe · Conforme CNDP (Loi 09-08)<br/>
              Agréé par l'ACAPS · © 2026 Tous droits réservés
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const WAFA = {
  or: '#F5A623', orDark: '#D4891A', orLight: '#FDF3E0',
  vert: '#2E7D32', vertLight: '#4CAF50', vertDark: '#1B5E20',
  noir: '#1A1A1A', gris: '#F5F5F5', grisMid: '#E8E8E8',
}

function WafaLogo({ size = 40 }: { size?: number }) {
  return (
    <img src="/wafa-logo.png" alt="Wafa Assurance"
      style={{ width: size, height: size, borderRadius: size * 0.15, objectFit: 'cover' }} />
  )
}

const inp = {
  width:'100%', padding:'14px 14px 14px 44px',
  borderRadius:12, border:`1.5px solid #E8E8E8`,
  fontSize:14, outline:'none', boxSizing:'border-box' as const,
  background:'#F5F5F5', fontFamily:'Inter,sans-serif',
  color:'#1A1A1A', transition:'all 0.2s'
}
const inpNoIcon = { ...inp, paddingLeft:'14px' }

export default function Inscription() {
  const [form, setForm] = useState({ prenom:'', nom:'', email:'', telephone:'', password:'', confirm:'' })
  const [cgu, setCgu] = useState(false)
  const [gps, setGps] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Mots de passe différents'); return }
    if (!cgu || !gps) { setError('Veuillez accepter les consentements CNDP obligatoires'); return }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.password })
    if (error) { setError(error.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id, nom: form.nom, prenom: form.prenom,
        telephone: form.telephone, role: 'client',
        consentement_gps: gps, consentement_marketing: false
      })
      await supabase.from('consentements').insert([
        { user_id: data.user.id, type_consentement: 'traitement_donnees', accorde: true, date_accord: new Date().toISOString() },
        { user_id: data.user.id, type_consentement: 'geolocalisation', accorde: gps, date_accord: new Date().toISOString() }
      ])
      navigate('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',fontFamily:'Inter,sans-serif',display:'flex',background:WAFA.gris}}>
      
      {/* PANNEAU GAUCHE */}
      <div style={{
        flex:'0 0 46%',
        background:`linear-gradient(160deg,${WAFA.vertDark} 0%,${WAFA.vert} 60%,${WAFA.vertLight} 100%)`,
        display:'flex',flexDirection:'column',justifyContent:'space-between',
        padding:'52px 56px',position:'relative',overflow:'hidden'
      }}>
        <div style={{position:'absolute',top:-100,right:-100,width:350,height:350,borderRadius:'50%',background:'rgba(245,166,35,0.08)'}} />
        <div style={{position:'absolute',bottom:-80,left:-80,width:280,height:280,borderRadius:'50%',background:'rgba(0,0,0,0.06)'}} />

        <div>
          <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:52}}>
            <WafaLogo size={60} />
            <div>
              <div style={{color:'white',fontWeight:900,fontSize:24,letterSpacing:'-0.5px',lineHeight:1}}>
                WAFA<span style={{color:WAFA.or}}> ASSURANCE</span>
              </div>
              <div style={{display:'inline-block',marginTop:6,background:WAFA.or,color:WAFA.noir,fontSize:10,fontWeight:800,letterSpacing:'1.5px',padding:'3px 10px',borderRadius:20}}>
                DRIVESCORE PAYD
              </div>
            </div>
          </div>

          {/* Étapes */}
          <div style={{marginBottom:40}}>
            <h2 style={{color:'white',fontSize:28,fontWeight:900,marginBottom:24,letterSpacing:'-0.5px'}}>
              Rejoignez DriveScore<br/><span style={{color:WAFA.or}}>en 3 étapes</span>
            </h2>
            {[
              { num:'01', title:'Vos informations', desc:'Prénom, nom, email et téléphone', active: step===1 },
              { num:'02', title:'Sécurité', desc:'Créez votre mot de passe', active: step===2 },
              { num:'03', title:'Consentements', desc:'Conformité CNDP (Loi 09-08)', active: step===3 },
            ].map((s,i) => (
              <div key={i} style={{
                display:'flex',alignItems:'center',gap:14,
                padding:'14px 18px',borderRadius:14,marginBottom:8,
                background: s.active ? 'rgba(245,166,35,0.15)' : 'rgba(255,255,255,0.05)',
                border: s.active ? `1px solid ${WAFA.or}40` : '1px solid rgba(255,255,255,0.08)',
                transition:'all 0.3s'
              }}>
                <div style={{
                  width:36,height:36,borderRadius:10,flexShrink:0,
                  background: s.active ? WAFA.or : 'rgba(255,255,255,0.1)',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontWeight:800,fontSize:13,
                  color: s.active ? WAFA.noir : 'rgba(255,255,255,0.4)'
                }}>{s.num}</div>
                <div>
                  <div style={{color: s.active ? 'white' : 'rgba(255,255,255,0.5)',fontWeight:700,fontSize:14}}>{s.title}</div>
                  <div style={{color:'rgba(255,255,255,0.35)',fontSize:12,marginTop:1}}>{s.desc}</div>
                </div>
                {s.active && <div style={{marginLeft:'auto',color:WAFA.or,fontSize:16}}>→</div>}
              </div>
            ))}
          </div>

          <div style={{
            background:'rgba(245,166,35,0.12)',border:`1px solid ${WAFA.or}30`,
            borderRadius:14,padding:'16px 18px'
          }}>
            <div style={{color:WAFA.or,fontWeight:700,fontSize:13,marginBottom:4}}>🔐 Vos données sont protégées</div>
            <div style={{color:'rgba(255,255,255,0.6)',fontSize:12,lineHeight:1.6}}>
              Conforme CNDP (Loi 09-08 Maroc) · Hébergement Europe · Chiffrement AES-256
            </div>
          </div>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:8,paddingTop:32}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:WAFA.or}} />
          <span style={{color:'rgba(255,255,255,0.4)',fontSize:11}}>Wafa Assurance · Leader de l'assurance au Maroc depuis 1972</span>
        </div>
      </div>

      {/* PANNEAU DROIT */}
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'40px 24px',background:'white',overflowY:'auto'}}>
        <div style={{width:'100%',maxWidth:420}}>

          <div style={{textAlign:'center',marginBottom:32}}>
            <div style={{
              display:'inline-flex',alignItems:'center',gap:10,
              background:WAFA.orLight,border:`1.5px solid ${WAFA.or}`,
              borderRadius:50,padding:'8px 20px',marginBottom:20
            }}>
              <WafaLogo size={22} />
              <span style={{fontWeight:700,fontSize:13,color:WAFA.vertDark}}>Créer mon compte DriveScore</span>
            </div>
            <h2 style={{fontSize:26,fontWeight:900,color:WAFA.noir,margin:'0 0 6px',letterSpacing:'-0.5px'}}>Inscription</h2>
            <p style={{color:'#64748B',fontSize:14,margin:0}}>Remplissez les informations ci-dessous</p>
          </div>

          <div style={{background:'white',borderRadius:24,padding:36,boxShadow:'0 8px 40px rgba(0,0,0,0.08)',border:`1px solid ${WAFA.grisMid}`}}>
            
            {error && (
              <div style={{display:'flex',alignItems:'center',gap:10,background:'#FEF2F2',border:'1px solid #FECACA',color:'#DC2626',padding:'12px 16px',borderRadius:12,marginBottom:20,fontSize:13,fontWeight:500}}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:18}}>
              
              {/* SECTION 1 — Identité */}
              <div style={{background:WAFA.gris,borderRadius:14,padding:'20px 18px'}}>
                <div style={{fontSize:11,fontWeight:800,color:WAFA.vert,letterSpacing:'1px',marginBottom:16}}>01 · VOS INFORMATIONS</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                  <div>
                    <label style={{display:'block',fontSize:12,fontWeight:700,color:'#6B7280',marginBottom:6,letterSpacing:'0.3px'}}>PRÉNOM</label>
                    <div style={{position:'relative'}}>
                      <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:14}}>👤</span>
                      <input required placeholder="Sara" value={form.prenom}
                        onChange={e => setForm(f=>({...f,prenom:e.target.value}))}
                        style={inp}
                        onFocus={e=>{e.target.style.borderColor=WAFA.vert;e.target.style.background='white'}}
                        onBlur={e=>{e.target.style.borderColor=WAFA.grisMid;e.target.style.background=WAFA.gris}} />
                    </div>
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:12,fontWeight:700,color:'#6B7280',marginBottom:6,letterSpacing:'0.3px'}}>NOM</label>
                    <input required placeholder="Alami" value={form.nom}
                      onChange={e => setForm(f=>({...f,nom:e.target.value}))}
                      style={inpNoIcon}
                      onFocus={e=>{e.target.style.borderColor=WAFA.vert;e.target.style.background='white'}}
                      onBlur={e=>{e.target.style.borderColor=WAFA.grisMid;e.target.style.background=WAFA.gris}} />
                  </div>
                </div>
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',fontSize:12,fontWeight:700,color:'#6B7280',marginBottom:6,letterSpacing:'0.3px'}}>EMAIL</label>
                  <div style={{position:'relative'}}>
                    <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:14}}>✉️</span>
                    <input type="email" required placeholder="sara.alami@email.com" value={form.email}
                      onChange={e => setForm(f=>({...f,email:e.target.value}))}
                      style={inp}
                      onFocus={e=>{e.target.style.borderColor=WAFA.vert;e.target.style.background='white'}}
                      onBlur={e=>{e.target.style.borderColor=WAFA.grisMid;e.target.style.background=WAFA.gris}} />
                  </div>
                </div>
                <div>
                  <label style={{display:'block',fontSize:12,fontWeight:700,color:'#6B7280',marginBottom:6,letterSpacing:'0.3px'}}>TÉLÉPHONE</label>
                  <div style={{position:'relative'}}>
                    <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:14}}>📱</span>
                    <input type="tel" placeholder="+212 6xx xxx xxx" value={form.telephone}
                      onChange={e => setForm(f=>({...f,telephone:e.target.value}))}
                      style={inp}
                      onFocus={e=>{e.target.style.borderColor=WAFA.vert;e.target.style.background='white'}}
                      onBlur={e=>{e.target.style.borderColor=WAFA.grisMid;e.target.style.background=WAFA.gris}} />
                  </div>
                </div>
              </div>

              {/* SECTION 2 — Sécurité */}
              <div style={{background:WAFA.gris,borderRadius:14,padding:'20px 18px'}}>
                <div style={{fontSize:11,fontWeight:800,color:WAFA.vert,letterSpacing:'1px',marginBottom:16}}>02 · SÉCURITÉ</div>
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',fontSize:12,fontWeight:700,color:'#6B7280',marginBottom:6,letterSpacing:'0.3px'}}>MOT DE PASSE</label>
                  <div style={{position:'relative'}}>
                    <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:14}}>🔒</span>
                    <input type="password" required placeholder="Minimum 6 caractères" value={form.password}
                      onChange={e => setForm(f=>({...f,password:e.target.value}))}
                      style={inp}
                      onFocus={e=>{e.target.style.borderColor=WAFA.vert;e.target.style.background='white'}}
                      onBlur={e=>{e.target.style.borderColor=WAFA.grisMid;e.target.style.background=WAFA.gris}} />
                  </div>
                </div>
                <div>
                  <label style={{display:'block',fontSize:12,fontWeight:700,color:'#6B7280',marginBottom:6,letterSpacing:'0.3px'}}>CONFIRMER</label>
                  <div style={{position:'relative'}}>
                    <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:14}}>🔒</span>
                    <input type="password" required placeholder="••••••••" value={form.confirm}
                      onChange={e => setForm(f=>({...f,confirm:e.target.value}))}
                      style={{...inp, borderColor: form.confirm && form.confirm!==form.password ? '#EF4444' : WAFA.grisMid}}
                      onFocus={e=>{e.target.style.borderColor=WAFA.vert;e.target.style.background='white'}}
                      onBlur={e=>{e.target.style.borderColor=form.confirm!==form.password?'#EF4444':WAFA.grisMid;e.target.style.background=WAFA.gris}} />
                  </div>
                  {form.confirm && form.confirm!==form.password && (
                    <p style={{fontSize:11,color:'#EF4444',margin:'4px 0 0'}}>⚠️ Les mots de passe ne correspondent pas</p>
                  )}
                </div>
              </div>

              {/* SECTION 3 — Consentements CNDP */}
              <div style={{background:WAFA.orLight,border:`1.5px solid ${WAFA.or}40`,borderRadius:14,padding:'20px 18px'}}>
                <div style={{fontSize:11,fontWeight:800,color:WAFA.orDark,letterSpacing:'1px',marginBottom:4}}>03 · CONSENTEMENTS CNDP</div>
                <p style={{fontSize:11,color:'#92400E',margin:'0 0 16px',lineHeight:1.5}}>
                  Conformément à la Loi 09-08 relative à la protection des données personnelles au Maroc
                </p>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  <label style={{display:'flex',alignItems:'flex-start',gap:12,cursor:'pointer',padding:'12px 14px',background:'white',borderRadius:10,border:`1px solid ${cgu?WAFA.vert:WAFA.grisMid}`}}>
                    <input type="checkbox" checked={cgu} onChange={e=>setCgu(e.target.checked)}
                      style={{marginTop:2,accentColor:WAFA.vert,width:16,height:16,flexShrink:0}} />
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:WAFA.noir,marginBottom:2}}>✅ Conditions générales et traitement des données</div>
                      <div style={{fontSize:11,color:'#64748B',lineHeight:1.5}}>J'accepte que Wafa Assurance collecte et traite mes données personnelles dans le cadre du contrat d'assurance PAYD</div>
                    </div>
                  </label>
                  <label style={{display:'flex',alignItems:'flex-start',gap:12,cursor:'pointer',padding:'12px 14px',background:'white',borderRadius:10,border:`1px solid ${gps?WAFA.vert:WAFA.grisMid}`}}>
                    <input type="checkbox" checked={gps} onChange={e=>setGps(e.target.checked)}
                      style={{marginTop:2,accentColor:WAFA.vert,width:16,height:16,flexShrink:0}} />
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:WAFA.noir,marginBottom:2}}>📍 Données de conduite et géolocalisation</div>
                      <div style={{fontSize:11,color:'#64748B',lineHeight:1.5}}>J'autorise la collecte de mes données de conduite (km, comportement) pour le calcul de ma prime PAYD. Données pseudonymisées.</div>
                    </div>
                  </label>
                </div>
              </div>

              <button type="submit" disabled={loading} style={{
                padding:'16px',borderRadius:14,
                background:loading?'#94A3B8':`linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`,
                color:'white',border:'none',fontWeight:800,fontSize:15,
                cursor:loading?'not-allowed':'pointer',
                boxShadow:loading?'none':`0 6px 20px rgba(46,125,50,0.4)`,
                letterSpacing:'0.3px'
              }}>
                {loading ? '⏳ Création du compte...' : '🚀 Créer mon compte DriveScore'}
              </button>
            </form>

            <div style={{marginTop:20,textAlign:'center',fontSize:13,color:'#64748B'}}>
              Déjà un compte ?{' '}
              <Link to="/login" style={{color:WAFA.vert,fontWeight:700,textDecoration:'none'}}>Se connecter →</Link>
            </div>
          </div>

          <div style={{marginTop:20,padding:'14px 18px',background:WAFA.orLight,borderRadius:14,border:`1px solid ${WAFA.or}20`,textAlign:'center'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,marginBottom:4}}>
              <WafaLogo size={14} />
              <span style={{fontSize:11,fontWeight:700,color:WAFA.vertDark}}>Wafa Assurance · Agréé ACAPS</span>
            </div>
            <p style={{fontSize:11,color:'#94A3B8',margin:0}}>Hébergement Europe · Conforme CNDP · © 2026</p>
          </div>
        </div>
      </div>
    </div>
  )
}

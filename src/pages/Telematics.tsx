import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTelematics } from '../hooks/useTelematics'
import { useAuth } from '../hooks/useAuth'
import { insertTrajet } from '../services/trajetService'
import TrajetMapStrava from '../components/TrajetMapStrava'

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

function sc(s: number) {
  if (s >= 90) return C.greenBright
  if (s >= 80) return C.greenAccent
  if (s >= 70) return C.amber
  return C.red
}

function scLabel(s: number) {
  if (s >= 90) return 'Excellent'
  if (s >= 80) return 'Bon'
  if (s >= 70) return 'Moyen'
  return 'Faible'
}

function fmt(s: number) {
  return `${Math.floor(s/60)}m ${String(s%60).padStart(2,'0')}s`
}

export default function Telematics() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useAuth()
  const {
    phase, setPhase, km, speedKmh, speedMax, duration,
    events, score, limiteActuelle, alerteVitesse,
    excessVitesse, error, setError, accelEvents, excessRef, speedMaxRef,
    startTrajet, stopTrajet, resetTrajet, gpsPoints,
  } = useTelematics()

  async function saveTrajetReal() {
    if (!profile?.pseudo_id) { if(setError) setError('Session expirée'); return }

    setPhase('saving')
    const pts = gpsPoints.current.filter((_,i)=>i%5===0).slice(0,150).map(p=>({
      lat: parseFloat(p.lat.toFixed(5)), lng: parseFloat(p.lng.toFixed(5)),
      speed: Math.round(p.speed*3.6), timestamp: p.timestamp
    }))
    const result = await insertTrajet({
      pseudo_id: profile.pseudo_id, km,
      type_route: speedMax>90?'autoroute':speedMax>60?'route':'ville',
      vitesse_moyenne: km>0&&duration>0?Math.round(km/duration*3600):0,
      vitesse_max: speedMax,
      freinages_brusques: accelEvents.current.filter(e=>e.type==='freinage').length,
      accelerations_brusques: accelEvents.current.filter(e=>e.type==='acceleration').length,
      exces_vitesse_count: excessRef.current,
      conduite_nocturne: new Date().getHours()>=22||new Date().getHours()<=5,
      score_trajet: score, cout_mad: +(km*0.5).toFixed(2),
      date_trajet: new Date().toISOString().split('T')[0],
      gps_points: pts,
    })
    if (!result.success) {
      if(setError) setError('Erreur: '+result.error)
      setPhase('stopped'); return
    }
    setPhase('saved')
    setTimeout(()=>navigate('/dashboard'), 2000)
  }

  const [confirmShort, setConfirmShort] = React.useState(false)
  const freinages = events.filter(e=>e.type==='freinage').length
  const accels = events.filter(e=>e.type==='acceleration').length

  return (
    <div style={{ minHeight:'100vh', background:C.surface, fontFamily:C.fontSans, paddingBottom:80 }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.35}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse-soft{0%,100%{opacity:1}50%{opacity:0.6}}
      `}</style>

      {/* ============ IDLE ============ */}
      {phase === 'idle' && (
        <div style={{ animation:'fadeUp 0.3s ease' }}>
          <div style={{ background:C.greenDeep, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160, background:'radial-gradient(circle,rgba(62,189,111,0.18) 0%,transparent 70%)', pointerEvents:'none' }} />
            <div style={{ padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative', zIndex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:C.greenBright, boxShadow:'0 0 8px rgba(62,189,111,0.6)' }} />
                <span style={{ fontSize:12, fontWeight:500, color:'rgba(255,255,255,0.6)' }}>Mode Télématique</span>
              </div>
              <button onClick={()=>navigate('/dashboard')} style={{ background:'rgba(255,255,255,0.08)', border:'0.5px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.7)', borderRadius:8, padding:'5px 10px', cursor:'pointer', fontSize:11, fontFamily:C.fontSans }}>← Retour</button>
            </div>

            {/* Compteur circulaire IDLE */}
            <div style={{ textAlign:'center', padding:'16px 24px 24px' }}>
              <div style={{ position:'relative', width:200, height:200, margin:'0 auto' }}>
                <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'1px solid rgba(62,189,111,0.08)' }} />
                <div style={{ position:'absolute', inset:16, borderRadius:'50%', border:'1px solid rgba(62,189,111,0.12)' }} />
                <div style={{ position:'absolute', inset:32, borderRadius:'50%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(62,189,111,0.18)' }} />
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                  <div style={{ fontSize:52, fontWeight:200, color:'rgba(255,255,255,0.15)', fontFamily:C.fontMono, lineHeight:1 }}>0</div>
                  <div style={{ fontSize:13, color:'rgba(255,255,255,0.25)', marginTop:2 }}>km/h</div>
                  <div style={{ marginTop:14, width:50, height:50, borderRadius:'50%', background:'rgba(62,189,111,0.12)', border:'1px solid rgba(62,189,111,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="rgba(62,189,111,0.7)" strokeWidth="1.4"/><circle cx="10" cy="10" r="3" stroke="rgba(62,189,111,0.7)" strokeWidth="1.4"/><path d="M10 3V7M10 13V17M3 10H7M13 10H17" stroke="rgba(62,189,111,0.5)" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  </div>
                </div>
              </div>

              <div style={{ display:'flex', justifyContent:'center', gap:20, marginTop:14 }}>
                {[['📍','GPS'],['⚡','Accéléro.'],['🚦','Limites'],['📊','Score']].map(([icon,label])=>(
                  <div key={label} style={{ textAlign:'center' }}>
                    <div style={{ fontSize:16, marginBottom:3 }}>{icon}</div>
                    <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ padding:'20px' }}>
            {error && <div style={{ background:C.redLight, color:C.redDark, padding:'10px 14px', borderRadius:10, marginBottom:12, fontSize:13 }}>⚠ {error}</div>}
            <button onClick={startTrajet} style={{ width:'100%', padding:'16px', borderRadius:16, background:C.greenMid, color:'white', border:'none', fontWeight:600, fontSize:16, cursor:'pointer', fontFamily:C.fontSans, display:'flex', alignItems:'center', justifyContent:'center', gap:10, boxShadow:'0 6px 20px rgba(30,92,53,0.3)' }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:C.greenBright, animation:'blink 1.5s ease-in-out infinite' }} />
              Démarrer le trajet
            </button>
            <div style={{ textAlign:'center', fontSize:11, color:C.textTertiary, marginTop:10 }}>Gardez votre téléphone sur le tableau de bord</div>
          </div>
        </div>
      )}

      {/* ============ REQUESTING ============ */}
      {phase === 'requesting' && (
        <div style={{ minHeight:'100vh', background:C.greenDeep, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ width:40, height:40, border:`2px solid ${C.greenBright}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }} />
            <div style={{ fontSize:15, fontWeight:500, color:'white' }}>Activation GPS...</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:6 }}>Autorisez l'accès à votre position</div>
          </div>
        </div>
      )}

      {/* ============ RUNNING ============ */}
      {phase === 'running' && (
        <div style={{ animation:'fadeUp 0.3s ease' }}>

          {/* Header EN COURS */}
          <div style={{ background: alerteVitesse ? '#1a0505' : C.greenDeep, position:'relative', overflow:'hidden', transition:'background 0.3s' }}>
            <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160, background:`radial-gradient(circle,${alerteVitesse?'rgba(229,64,58,0.2)':'rgba(62,189,111,0.15)'} 0%,transparent 70%)`, pointerEvents:'none', transition:'all 0.3s' }} />

            <div style={{ padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative', zIndex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(229,64,58,0.2)', border:'0.5px solid rgba(229,64,58,0.3)', borderRadius:20, padding:'4px 12px' }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:C.red, animation:'blink 1s infinite' }} />
                <span style={{ fontSize:11, fontWeight:600, color:C.red }}>EN COURS</span>
              </div>
              <span style={{ fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.7)', fontFamily:C.fontMono }}>{fmt(duration)}</span>
            </div>

            {/* Vitesse géante */}
            <div style={{ textAlign:'center', padding:'8px 24px 20px', position:'relative', zIndex:1 }}>
              <div style={{ fontSize:alerteVitesse?84:96, fontWeight:200, color:alerteVitesse?'#FF6B6B':'white', lineHeight:1, fontFamily:C.fontMono, letterSpacing:'-6px', transition:'all 0.2s' }}>{speedKmh}</div>
              <div style={{ fontSize:14, color:'rgba(255,255,255,0.4)', marginTop:-4, marginBottom:12 }}>km/h</div>

              {/* Badges */}
              <div style={{ display:'flex', justifyContent:'center', gap:8 }}>
                {limiteActuelle && (
                  <div style={{ background:alerteVitesse?'rgba(229,64,58,0.25)':'rgba(255,255,255,0.1)', border:`0.5px solid ${alerteVitesse?'rgba(229,64,58,0.4)':'rgba(255,255,255,0.15)'}`, borderRadius:20, padding:'5px 14px', fontSize:12, color:alerteVitesse?'#FF6B6B':'rgba(255,255,255,0.8)', transition:'all 0.2s' }}>
                    🚦 Limite {limiteActuelle} km/h
                  </div>
                )}
                <div style={{ background:'rgba(245,166,35,0.15)', border:'0.5px solid rgba(245,166,35,0.3)', borderRadius:20, padding:'5px 14px', fontSize:12, color:C.amber }}>
                  ⚡ Max {speedMax} km/h
                </div>
              </div>

              {/* Alerte */}
              {alerteVitesse && (
                <div style={{ marginTop:10, background:'rgba(229,64,58,0.2)', border:'1px solid rgba(229,64,58,0.3)', borderRadius:10, padding:'8px 14px', fontSize:13, fontWeight:600, color:'#FF6B6B' }}>
                  🚨 {alerteVitesse}
                </div>
              )}
            </div>
          </div>

          <div style={{ padding:'12px 16px', display:'flex', flexDirection:'column', gap:8 }}>
            {/* Distance + Score */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              <div style={{ background:C.white, borderRadius:14, padding:'14px', border:`1px solid ${C.border}` }}>
                <div style={{ fontSize:10, color:C.textTertiary, fontWeight:500, letterSpacing:'0.3px', marginBottom:6 }}>DISTANCE</div>
                <div style={{ fontSize:30, fontWeight:600, color:C.greenAccent, fontFamily:C.fontMono, lineHeight:1 }}>{km.toFixed(2)}</div>
                <div style={{ fontSize:11, color:C.textTertiary, marginTop:3 }}>kilomètres</div>
              </div>
              <div style={{ background:C.white, borderRadius:14, padding:'14px', border:`1px solid ${C.border}` }}>
                <div style={{ fontSize:10, color:C.textTertiary, fontWeight:500, letterSpacing:'0.3px', marginBottom:6 }}>SCORE</div>
                <div style={{ fontSize:30, fontWeight:600, color:sc(score), fontFamily:C.fontMono, lineHeight:1 }}>{score}</div>
                <div style={{ fontSize:11, color:C.textTertiary, marginTop:3 }}>/100 — {scLabel(score)}</div>
              </div>
            </div>

            {/* Incidents compact */}
            <div style={{ background:C.white, borderRadius:14, padding:'12px 14px', border:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:10, color:C.textTertiary, fontWeight:500, letterSpacing:'0.3px' }}>INCIDENTS</span>
              <div style={{ display:'flex', gap:16 }}>
                {[
                  { val:freinages, icon:'🛑', label:'Freinage', color:C.red },
                  { val:accels, icon:'⚡', label:'Accél.', color:C.amberDark },
                  { val:excessVitesse, icon:'🚨', label:'Excès', color:C.red },
                ].map((inc,i)=>(
                  <div key={i} style={{ textAlign:'center' }}>
                    <div style={{ fontSize:18, fontWeight:700, color:inc.val>0?inc.color:C.textTertiary, fontFamily:C.fontMono, lineHeight:1 }}>{inc.val}</div>
                    <div style={{ fontSize:9, color:C.textTertiary, marginTop:2 }}>{inc.icon} {inc.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coût */}
            <div style={{ background:C.amberLight, borderRadius:12, padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid rgba(245,166,35,0.2)' }}>
              <div>
                <div style={{ fontSize:10, color:C.amberDark, fontWeight:600, letterSpacing:'0.3px' }}>COÛT ESTIMÉ</div>
                <div style={{ fontSize:10, color:C.textTertiary }}>0,50 MAD/km</div>
              </div>
              <div style={{ fontSize:18, fontWeight:600, color:C.amberDark, fontFamily:C.fontMono }}>{(km*0.5).toFixed(2)} MAD</div>
            </div>

            <button onClick={stopTrajet} style={{ width:'100%', padding:'16px', borderRadius:14, background:'#8B1A17', color:'white', border:'none', fontWeight:600, fontSize:15, cursor:'pointer', fontFamily:C.fontSans, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="white"><rect x="2" y="2" width="10" height="10" rx="2"/></svg>
              Terminer le trajet
            </button>
          </div>
        </div>
      )}

      {/* ============ STOPPED ============ */}
      {phase === 'stopped' && (
        <div style={{ padding:'16px', animation:'fadeUp 0.3s ease' }}>
          {gpsPoints.current.length > 1 && (
            <div style={{ borderRadius:16, overflow:'hidden', border:`1px solid ${C.border}`, marginBottom:10 }}>
              <TrajetMapStrava points={gpsPoints.current} speedMax={speedMax} incidents={[
                ...accelEvents.current.filter(e=>e.type==='freinage'&&e.lat).map(e=>({lat:e.lat!,lng:e.lng!,type:'freinage' as const})),
                ...accelEvents.current.filter(e=>e.type==='acceleration'&&e.lat).map(e=>({lat:e.lat!,lng:e.lng!,type:'acceleration' as const})),
              ]} height={180} interactive={true} />
            </div>
          )}

          {/* Score final */}
          <div style={{ background:score>=80?C.greenMid:score>=60?C.amberDark:'#8B1A17', borderRadius:16, padding:'20px', textAlign:'center', marginBottom:10 }}>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', letterSpacing:'0.3px', marginBottom:6 }}>SCORE FINAL</div>
            <div style={{ fontSize:60, fontWeight:600, color:'white', lineHeight:1, fontFamily:C.fontMono }}>{score}</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)', marginTop:4 }}>/100 — {scLabel(score)}</div>
          </div>

          {/* Stats grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:10 }}>
            {[
              { val:`${km.toFixed(2)}`, unit:'km', label:'Distance' },
              { val:fmt(duration), unit:'', label:'Durée' },
              { val:`${speedMax}`, unit:'km/h', label:'Vitesse max' },
              { val:String(freinages), unit:'', label:'Freinages' },
              { val:String(accels), unit:'', label:'Accél.' },
              { val:String(excessVitesse), unit:'', label:'Excès' },
            ].map((s,i)=>(
              <div key={i} style={{ background:C.white, borderRadius:12, padding:'10px 8px', textAlign:'center', border:`1px solid ${C.border}` }}>
                <div style={{ fontSize:15, fontWeight:600, color:C.textPrimary, fontFamily:C.fontMono }}>{s.val}<span style={{ fontSize:9, color:C.textTertiary }}>{s.unit && ` ${s.unit}`}</span></div>
                <div style={{ fontSize:9, color:C.textTertiary, marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Coaching */}
          <div style={{ background:C.amberLight, borderRadius:14, border:'1px solid rgba(245,166,35,0.2)', overflow:'hidden', marginBottom:10 }}>
            <div style={{ background:C.amberDark, padding:'9px 14px', display:'flex', alignItems:'center', gap:7 }}>
              <span style={{ fontSize:13 }}>💡</span>
              <span style={{ color:'white', fontWeight:600, fontSize:12 }}>Coaching personnalisé</span>
            </div>
            <div style={{ padding:'11px 14px', fontSize:12, color:C.textSecondary, lineHeight:1.6 }}>
              {excessVitesse>10?`${excessVitesse} excès détectés. Respectez les limites pour protéger votre score.`
                :freinages>5?`${freinages} freinages brusques. Anticipez les ralentissements.`
                :score>=90?'Trajet exemplaire ! Cette régularité vous garantit -15% sur votre prime.'
                :score>=80?`Score ${score}/100. Encore quelques points pour atteindre -15%.`
                :`Score ${score}/100. Réduisez les incidents pour améliorer votre prime.`}
            </div>
          </div>

          {/* WhatsApp */}
          <button onClick={()=>{const t=`🚗 Mon trajet DriveScore
Score: ${score}/100 | ${km.toFixed(2)} km | ${(km*0.5).toFixed(2)} MAD
👉 drivescore-eight.vercel.app`;window.open(`https://wa.me/?text=${encodeURIComponent(t)}`,'_blank')}}
            style={{ width:'100%', padding:'12px', borderRadius:12, background:'#25D366', color:'white', border:'none', fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:C.fontSans, marginBottom:8 }}>
            📲 Partager sur WhatsApp
          </button>

          <div style={{ display:'flex', gap:8 }}>
            <button onClick={()=>navigate('/trajets')} style={{ flex:1, padding:'13px', borderRadius:12, border:`1px solid ${C.borderStrong}`, background:C.white, color:C.textSecondary, fontWeight:500, fontSize:13, cursor:'pointer', fontFamily:C.fontSans }}>Mes trajets</button>
            <button onClick={()=>{ if(km<0.5){setConfirmShort(true)}else{saveTrajetReal()} }} style={{ flex:2, padding:'13px', borderRadius:12, background:C.greenMid, color:'white', border:'none', fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:C.fontSans }}>💾 Sauvegarder</button>
          </div>
        </div>
      )}

      {/* ============ SAVING ============ */}
      {phase === 'saving' && (
        <div style={{ minHeight:'100vh', background:C.greenDeep, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ width:40, height:40, border:`2px solid ${C.greenBright}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }} />
            <div style={{ fontSize:15, fontWeight:500, color:'white' }}>Sauvegarde...</div>
          </div>
        </div>
      )}

      {/* ============ SAVED ============ */}
      {phase === 'saved' && (
        <div style={{ minHeight:'100vh', background:C.greenDeep, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
            <div style={{ fontSize:16, fontWeight:600, color:'white' }}>Trajet sauvegardé !</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:6 }}>Redirection...</div>
          </div>
        </div>
      )}

      {/* MODAL TRAJET COURT */}
      {confirmShort && (
        <div style={{ position:'fixed', inset:0, background:'rgba(13,46,28,0.7)', zIndex:200, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
          <div style={{ background:C.white, borderRadius:'22px 22px 0 0', padding:'28px 24px 40px', width:'100%', maxWidth:480, animation:'fadeUp 0.25s ease' }}>
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <div style={{ fontSize:36, marginBottom:10 }}>📍</div>
              <div style={{ fontSize:17, fontWeight:600, color:C.textPrimary, marginBottom:6 }}>Trajet très court</div>
              <div style={{ fontSize:13, color:C.textTertiary, lineHeight:1.6 }}>
                Ce trajet fait seulement <strong style={{ color:C.textPrimary }}>{km.toFixed(2)} km</strong>.<br />Voulez-vous quand même le sauvegarder ?
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>{ setConfirmShort(false); resetTrajet() }} style={{ flex:1, padding:'13px', borderRadius:12, border:`1px solid ${C.borderStrong}`, background:C.white, color:C.textSecondary, fontWeight:500, fontSize:14, cursor:'pointer', fontFamily:C.fontSans }}>
                Annuler
              </button>
              <button onClick={async ()=>{ setConfirmShort(false); await saveTrajetReal() }} style={{ flex:2, padding:'13px', borderRadius:12, background:C.greenMid, color:'white', border:'none', fontWeight:600, fontSize:14, cursor:'pointer', fontFamily:C.fontSans }}>
                Sauvegarder quand même
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <nav style={{ position:'fixed', bottom:0, left:0, right:0, background:C.white, borderTop:`1px solid ${C.border}`, display:'flex', zIndex:100, paddingBottom:'env(safe-area-inset-bottom)' }}>
        {[
          { label:'Accueil', path:'/dashboard', icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="10" width="5" height="8" rx="1.5" fill="#8AA898"/><rect x="7.5" y="6" width="5" height="12" rx="1.5" fill="#8AA898"/><rect x="13" y="2" width="5" height="16" rx="1.5" fill="#8AA898"/></svg> },
          { label:'Telematique', path:'/telematics', icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="#1E5C35" strokeWidth="1.4"/><circle cx="10" cy="10" r="3" stroke="#1E5C35" strokeWidth="1.4"/><path d="M10 3V7M10 13V17M3 10H7M13 10H17" stroke="#1E5C35" strokeWidth="1.2" strokeLinecap="round"/></svg> },
          { label:'Trajets', path:'/trajets', icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="2" width="12" height="16" rx="2" stroke="#8AA898" strokeWidth="1.4"/><path d="M7 7H13M7 10.5H13M7 14H10.5" stroke="#8AA898" strokeWidth="1.2" strokeLinecap="round"/></svg> },
          { label:'Classement', path:'/leaderboard', icon:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L12.2 7.4H18L13.2 10.8L15.2 16.4L10 13L4.8 16.4L6.8 10.8L2 7.4H7.8L10 2Z" stroke="#8AA898" strokeWidth="1.4" strokeLinejoin="round"/></svg> },
        ].map(item=>{
          const isActive = location.pathname===item.path
          return (
            <button key={item.path} onClick={()=>navigate(item.path)} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3, padding:'10px 0', background:'none', border:'none', cursor:'pointer' }}>
              {item.icon}
              <span style={{ fontSize:10, fontWeight:isActive?600:400, color:isActive?C.greenMid:C.textTertiary }}>{item.label}</span>
              {isActive && <div style={{ width:4, height:4, borderRadius:'50%', background:C.greenBright }} />}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

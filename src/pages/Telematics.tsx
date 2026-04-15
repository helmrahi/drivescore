import { useNavigate } from 'react-router-dom'
import TrajetMapStrava from '../components/TrajetMapStrava'
import { useEffect, useRef } from 'react'
import { useTelematics } from '../hooks/useTelematics'
import { useAuth } from '../hooks/useAuth'
import { insertTrajet } from '../services/trajetService'
import { WAFA } from '../config/wafa'

export default function Telematics() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const {
    phase, setPhase, km, speedKmh, speedMax, duration,
    events, score, limiteActuelle, alerteVitesse,
    excessVitesse, error, accelEvents, excessRef,
    startTrajet, stopTrajet, resetTrajet, gpsPoints,
  } = useTelematics()

  const scoreColor = score >= 80 ? WAFA.vert : score >= 60 ? WAFA.or : "#EF4444"

  function formatDuration(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}m ${sec.toString().padStart(2, "0")}s`
  }

  async function saveTrajet() {
    // Vérifier distance minimum 500m
    if (km < 0.5) {
      const confirm = window.confirm(`Trajet très court (${km.toFixed(2)} km). Voulez-vous quand même sauvegarder ?`)
      if (!confirm) { resetTrajet(); return }
    }
    // Vérifier distance minimum 500m
    if (km < 0.5) {
      const confirm = window.confirm(`Trajet très court (${km.toFixed(2)} km). Voulez-vous quand même sauvegarder ?`)
      if (!confirm) { resetTrajet(); return }
    }
    if (!profile?.pseudo_id) { navigate("/login"); return }
    setPhase("saving")
    // Échantillonner les points GPS — 1 point toutes les 5 secondes max
    const allPoints = gpsPoints.current
    const sampledPoints = allPoints.filter((_, i) => i % 5 === 0).slice(0, 150).map(p => ({
      lat: parseFloat(p.lat.toFixed(5)),
      lng: parseFloat(p.lng.toFixed(5)),
      speed: Math.round(p.speed * 3.6),
      timestamp: p.timestamp,
    }))

    const result = await insertTrajet({
      pseudo_id: profile.pseudo_id,
      km,
      type_route: speedMax > 90 ? "autoroute" : speedMax > 60 ? "route" : "ville",
      vitesse_moyenne: km > 0 && duration > 0 ? Math.round(km / duration * 3600) : 0,
      vitesse_max: speedMax,
      freinages_brusques: accelEvents.current.filter(e => e.type === "freinage").length,
      accelerations_brusques: accelEvents.current.filter(e => e.type === "acceleration").length,
      exces_vitesse_count: excessRef.current,
      conduite_nocturne: new Date().getHours() >= 21 || new Date().getHours() <= 6,
      score_trajet: score,
      cout_mad: +(km * 0.5).toFixed(2),
      date_trajet: new Date().toISOString().split("T")[0],
      gps_points: sampledPoints,
    })
    if (!result.success) {
      alert("Erreur sauvegarde : " + result.error)
      setPhase("stopped")
      return
    }
    navigate("/dashboard")
  }

  return (
    <div style={{ minHeight:"100vh", background:WAFA.gris, fontFamily:"Inter,sans-serif" }}>
      <header style={{ background:`linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`, padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={() => navigate("/dashboard")} style={{ background:"rgba(255,255,255,0.15)", border:"none", color:"white", borderRadius:10, padding:"8px 14px", cursor:"pointer", fontWeight:600, fontSize:13 }}>
          ← Tableau de bord
        </button>
        <div style={{ textAlign:"center" }}>
          <div style={{ color:"white", fontWeight:800, fontSize:16 }}>Mode Télématique</div>
          <div style={{ color:"rgba(255,255,255,0.6)", fontSize:11 }}>GPS + Accéléromètre</div>
        </div>
        <div style={{ width:80 }} />
      </header>

      <div style={{ maxWidth:480, margin:"0 auto", padding:"24px 16px" }}>
        {error && (
          <div style={{
            position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
            background: '#1E293B', color: 'white',
            padding: '12px 20px', borderRadius: 14, fontSize: 13, fontWeight: 600,
            zIndex: 9999, boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            maxWidth: 320, textAlign: 'center',
          }}>
            ⏱️ {error}
          </div>
        )}

        {phase === "saving" && <div style={{ background:"#F0FDF4", border:"1px solid #86EFAC", color:WAFA.vert, padding:"16px", borderRadius:14, marginBottom:20, fontSize:14, fontWeight:700, textAlign:"center" }}>Trajet sauvegarde ! Redirection...</div>}

        {phase === "idle" && (
          <div style={{ textAlign:"center" }}>
            <div style={{ background:"white", borderRadius:24, padding:"48px 32px", boxShadow:"0 4px 24px rgba(0,0,0,0.08)", marginBottom:20 }}>
              <div style={{ marginBottom:28 }}>
                <div style={{ 
                  width:96, height:96, borderRadius:"50%", 
                  background:`linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:48, margin:"0 auto 20px",
                  boxShadow:"0 12px 40px rgba(46,125,50,0.25)"
                }}>🚗</div>
                <h2 style={{ fontSize:22, fontWeight:800, color:WAFA.noir, margin:"0 0 10px", letterSpacing:"-0.3px" }}>Mode Télématique</h2>
                <p style={{ color:"#94A3B8", fontSize:13, lineHeight:1.6, margin:0 }}>
                  GPS · Accéléromètre · Limites de vitesse
                </p>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:32, textAlign:"left" }}>
                {[
                  { icon:"📍", text:"GPS trace votre itinéraire en temps réel" },
                  { icon:"⚡", text:"Accéléromètre détecte les freinages" },
                  { icon:"🚦", text:"Détection limite de vitesse en temps réel" },
                  { icon:"📊", text:"Score calculé automatiquement" },
                ].map((f,i) => (
                  <div key={i} style={{ 
                    display:"flex", alignItems:"center", gap:12, 
                    padding:"10px 14px", 
                    background:i % 2 === 0 ? "#F8FAF8" : "white", 
                    borderRadius:10,
                    border:`1px solid ${WAFA.grisMid}`,
                  }}>
                    <span style={{ fontSize:20, width:28, textAlign:"center", flexShrink:0 }}>{f.icon}</span>
                    <span style={{ fontSize:13, color:"#475569", fontWeight:500 }}>{f.text}</span>
                  </div>
                ))}
              </div>
              <button onClick={startTrajet} style={{ 
                width:"100%", padding:"18px", borderRadius:16, 
                background:`linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`, 
                color:"white", border:"none", fontWeight:800, fontSize:16, 
                cursor:"pointer", letterSpacing:"0.3px",
                boxShadow:"0 8px 24px rgba(46,125,50,0.4)"
              }}>
                🚀 Démarrer le trajet
              </button>
            </div>
          </div>
        )}

        {phase === "requesting" && (
          <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <h2 style={{ fontSize:20, fontWeight:700, color:WAFA.noir }}>Activation GPS...</h2>
            <p style={{ color:"#64748B", fontSize:14 }}>Autorisez l acces a votre position</p>
          </div>
        )}

        {phase === "running" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

            {/* ALERTE VITESSE */}
            {alerteVitesse && (
              <div style={{ background:"#FEF2F2", border:"2px solid #EF4444", borderRadius:14, padding:"10px 16px", textAlign:"center", fontWeight:700, fontSize:13, color:"#DC2626", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                🚨 {alerteVitesse}
              </div>
            )}

            {/* COMPTEUR VITESSE — style tableau de bord */}
            <div style={{ background:alerteVitesse ? `linear-gradient(135deg,#991B1B,#DC2626)` : `linear-gradient(160deg,${WAFA.vertDark},${WAFA.vert})`, borderRadius:24, padding:"20px 16px", textAlign:"center", position:"relative", overflow:"hidden" }}>
              {/* Timer */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <div style={{ background:"rgba(255,255,255,0.12)", borderRadius:20, padding:"4px 12px", display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:"#EF4444", animation:"pulse 1s infinite" }} />
                  <span style={{ color:"white", fontSize:12, fontWeight:700 }}>EN COURS</span>
                </div>
                <span style={{ color:"rgba(255,255,255,0.7)", fontSize:14, fontWeight:700 }}>{formatDuration(duration)}</span>
              </div>

              {/* Vitesse principale */}
              <div style={{ marginBottom:8 }}>
                <div style={{ fontSize:88, fontWeight:900, color:alerteVitesse ? "#FCA5A5" : "white", lineHeight:1, letterSpacing:"-4px" }}>{speedKmh}</div>
                <div style={{ fontSize:16, color:"rgba(255,255,255,0.6)", marginTop:4 }}>km/h</div>
              </div>

              {/* Limite + Max */}
              <div style={{ display:"flex", justifyContent:"center", gap:8 }}>
                {limiteActuelle && (
                  <div style={{ background:alerteVitesse ? "#EF4444" : "rgba(255,255,255,0.15)", borderRadius:20, padding:"6px 14px", display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontSize:14 }}>🚦</span>
                    <span style={{ color:"white", fontSize:12, fontWeight:700 }}>Limite {limiteActuelle} km/h</span>
                  </div>
                )}
                <div style={{ background:"rgba(255,255,255,0.15)", borderRadius:20, padding:"6px 14px", display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:14 }}>⚡</span>
                  <span style={{ color:WAFA.or, fontSize:12, fontWeight:700 }}>Max {speedMax} km/h</span>
                </div>
              </div>
            </div>

            {/* KPIs — Distance + Score */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div style={{ background:"white", borderRadius:16, padding:"16px", textAlign:"center", border:"0.5px solid #E2E8F0" }}>
                <div style={{ fontSize:10, color:"#94A3B8", fontWeight:700, letterSpacing:"0.06em", marginBottom:6 }}>DISTANCE</div>
                <div style={{ fontSize:36, fontWeight:900, color:WAFA.vert, lineHeight:1 }}>{km.toFixed(2)}</div>
                <div style={{ fontSize:12, color:"#94A3B8", marginTop:4 }}>kilomètres</div>
              </div>
              <div style={{ background:"white", borderRadius:16, padding:"16px", textAlign:"center", border:"0.5px solid #E2E8F0" }}>
                <div style={{ fontSize:10, color:"#94A3B8", fontWeight:700, letterSpacing:"0.06em", marginBottom:6 }}>SCORE</div>
                <div style={{ fontSize:36, fontWeight:900, color:scoreColor, lineHeight:1 }}>{score}</div>
                <div style={{ fontSize:12, color:"#94A3B8", marginTop:4 }}>/100</div>
              </div>
            </div>

            {/* INCIDENTS */}
            <div style={{ background:"white", borderRadius:16, padding:"14px 16px", border:"0.5px solid #E2E8F0" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#94A3B8", letterSpacing:"0.06em", marginBottom:10 }}>INCIDENTS DÉTECTÉS</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                {[
                  { label:"Freinages", val:events.filter(e=>e.type==="freinage").length, bg:"#FEF2F2", color:"#EF4444", icon:"🛑" },
                  { label:"Accél.", val:events.filter(e=>e.type==="acceleration").length, bg:"#FEF3C7", color:WAFA.orDark, icon:"⚡" },
                  { label:"Excès", val:excessVitesse, bg:"#FEF2F2", color:"#EF4444", icon:"🚨" },
                ].map((inc,i) => (
                  <div key={i} style={{ background:inc.bg, borderRadius:12, padding:"12px 8px", textAlign:"center" }}>
                    <div style={{ fontSize:16, marginBottom:4 }}>{inc.icon}</div>
                    <div style={{ fontSize:22, fontWeight:900, color:inc.color, lineHeight:1 }}>{inc.val}</div>
                    <div style={{ fontSize:10, color:"#94A3B8", marginTop:3 }}>{inc.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* COÛT ESTIMÉ */}
            <div style={{ background:`linear-gradient(135deg,${WAFA.orLight},#FEF9F0)`, borderRadius:14, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", border:`1px solid ${WAFA.or}30` }}>
              <div>
                <div style={{ fontSize:11, color:WAFA.orDark, fontWeight:700, marginBottom:2 }}>COÛT ESTIMÉ</div>
                <div style={{ fontSize:11, color:"#94A3B8" }}>0,50 MAD/km</div>
              </div>
              <div style={{ fontSize:22, fontWeight:900, color:WAFA.orDark }}>{(km * 0.5).toFixed(2)} MAD</div>
            </div>

            {/* BOUTON TERMINER */}
            <button onClick={stopTrajet} style={{ width:"100%", padding:"18px", borderRadius:16, background:"linear-gradient(135deg,#991B1B,#DC2626)", color:"white", border:"none", fontWeight:900, fontSize:17, cursor:"pointer", boxShadow:"0 6px 20px rgba(220,38,38,0.35)", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
              ⏹ Terminer le trajet
            </button>

            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
          </div>
        )}

        {phase === "stopped" && (
          <div>
            <div style={{ background:"white", borderRadius:24, padding:32, boxShadow:"0 4px 24px rgba(0,0,0,0.08)", marginBottom:16 }}>
              <h2 style={{ fontSize:20, fontWeight:900, color:WAFA.noir, margin:"0 0 16px", textAlign:"center" }}>Résumé du trajet</h2>
              <TrajetMapStrava
                points={gpsPoints.current}
                speedMax={speedMax}
                incidents={[
                  ...accelEvents.current.filter(e => e.type === "freinage" && e.lat).map(e => ({ lat: e.lat!, lng: e.lng!, type: "freinage" as const })),
                  ...accelEvents.current.filter(e => e.type === "acceleration" && e.lat).map(e => ({ lat: e.lat!, lng: e.lng!, type: "acceleration" as const })),
                ]}
                height={240}
                interactive={true}
              />
              <div style={{ background:score >= 80 ? `linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})` : score >= 60 ? `linear-gradient(135deg,${WAFA.orDark},${WAFA.or})` : "linear-gradient(135deg,#DC2626,#EF4444)", borderRadius:20, padding:"28px", textAlign:"center", marginBottom:24 }}>
                <p style={{ color:"rgba(255,255,255,0.7)", fontSize:12, margin:"0 0 8px" }}>SCORE FINAL</p>
                <div style={{ fontSize:72, fontWeight:900, color:"white", lineHeight:1 }}>{score}</div>
                <div style={{ fontSize:16, color:"rgba(255,255,255,0.7)" }}>/100</div>
                <div style={{ marginTop:12, fontSize:14, color:"white", fontWeight:700 }}>
                  {score >= 90 ? "Excellent conducteur !" : score >= 80 ? "Bon conducteur" : score >= 60 ? "Conduite a ameliorer" : "Conduite dangereuse"}
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:24 }}>
                {[
                  { val:`${km.toFixed(2)} km`, label:"Distance" },
                  { val:formatDuration(duration), label:"Duree" },
                  { val:`${speedMax} km/h`, label:"Vitesse max" },
                  { val:events.filter(e=>e.type==="freinage").length, label:"Freinages" },
                  { val:events.filter(e=>e.type==="acceleration").length, label:"Accel." },
                  { val:excessVitesse, label:"Exces" },
                ].map((s,i) => (
                  <div key={i} style={{ background:WAFA.gris, borderRadius:12, padding:"14px 10px", textAlign:"center" }}>
                    <div style={{ fontWeight:800, fontSize:14, color:WAFA.noir }}>{s.val}</div>
                    <div style={{ fontSize:10, color:"#94A3B8", marginTop:2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* COACHING POST-TRAJET */}
            <div style={{ marginTop:16, borderRadius:16, overflow:"hidden", border:"1px solid #E2E8F0" }}>
              <div style={{ background:`linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`, padding:"10px 14px", display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:16 }}>🧠</span>
                <span style={{ color:"white", fontWeight:700, fontSize:13 }}>Coaching personnalisé</span>
              </div>
              <div style={{ background:"white", padding:"12px 14px", display:"flex", flexDirection:"column", gap:8 }}>
                {(() => {
                  const conseils = []
                  const freinages = events.filter(e => e.type === "freinage").length
                  const accels = events.filter(e => e.type === "acceleration").length
                  if (freinages > 5) conseils.push({ icon:"🛑", text:`${freinages} freinages brusques détectés. Anticipez les ralentissements en levant le pied plus tôt.`, color:"#FEF2F2", border:"#FECACA" })
                  else if (freinages > 2) conseils.push({ icon:"⚠️", text:`${freinages} freinages détectés. Gardez une distance de sécurité suffisante.`, color:"#FFFBEB", border:"#FDE68A" })
                  else conseils.push({ icon:"✅", text:"Excellente maîtrise du freinage ! Continuez à anticiper les ralentissements.", color:"#F0FDF4", border:"#86EFAC" })
                  if (accels > 5) conseils.push({ icon:"⚡", text:`${accels} accélérations brusques. Une conduite plus progressive économise du carburant.`, color:"#FEF2F2", border:"#FECACA" })
                  else conseils.push({ icon:"🌿", text:"Bonne gestion des accélérations. Votre conduite est économique.", color:"#F0FDF4", border:"#86EFAC" })
                  if (excessVitesse > 10) conseils.push({ icon:"🚨", text:`${excessVitesse} excès de vitesse détectés ! Respectez les limites pour améliorer votre score.`, color:"#FEF2F2", border:"#FECACA" })
                  else if (excessVitesse > 10) conseils.push({ icon:"🚨", text:`${excessVitesse} excès de vitesse détectés. Respectez les limites pour améliorer votre score.`, color:"#FEF2F2", border:"#FECACA" })
                  else if (score >= 90) conseils.push({ icon:"🏅", text:`Score ${score}/100 — Excellent ! Vous bénéficiez de la réduction maximale -15%.`, color:"#F0FDF4", border:"#86EFAC" })
                  else if (score >= 80) conseils.push({ icon:"📈", text:`Score ${score}/100 — Bon trajet ! Encore quelques points pour atteindre -15%.`, color:"#EFF6FF", border:"#BFDBFE" })
                  else conseils.push({ icon:"💪", text:`Score ${score}/100 — Réduisez vos freinages pour améliorer votre score et votre prime.`, color:"#FFFBEB", border:"#FDE68A" })
                  return conseils.map((c, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 12px", background:c.color, borderRadius:10, border:`1px solid ${c.border}` }}>
                      <span style={{ fontSize:16, flexShrink:0 }}>{c.icon}</span>
                      <span style={{ fontSize:12, color:"#374151", lineHeight:1.5 }}>{c.text}</span>
                    </div>
                  ))
                })()}
              </div>
            </div>

            <div style={{ display:"flex", gap:12, marginTop:16 }}>
              <button onClick={resetTrajet} style={{ flex:1, padding:"16px", borderRadius:14, border:`2px solid ${WAFA.vert}`, background:"white", color:WAFA.vert, fontWeight:700, fontSize:14, cursor:"pointer" }}>Nouveau</button>
              <button onClick={saveTrajet} style={{ flex:2, padding:"16px", borderRadius:14, background:`linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`, color:"white", border:"none", fontWeight:800, fontSize:14, cursor:"pointer" }}>Sauvegarder</button>
            </div>
          </div>
        )}

        {phase === "saving" && (
          <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <h2 style={{ fontSize:20, fontWeight:700, color:WAFA.noir }}>Sauvegarde...</h2>
          </div>
        )}
      </div>
    </div>
  )
}

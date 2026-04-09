import { useNavigate } from 'react-router-dom'
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
    startTrajet, stopTrajet, resetTrajet,
  } = useTelematics()

  const scoreColor = score >= 80 ? WAFA.vert : score >= 60 ? WAFA.or : "#EF4444"

  function formatDuration(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}m ${sec.toString().padStart(2, "0")}s`
  }

  async function saveTrajet() {
    if (!profile?.pseudo_id) { navigate("/login"); return }
    setPhase("saving")
    const result = await insertTrajet({
      pseudo_id: profile.pseudo_id,
      km,
      type_route: speedMax > 90 ? "autoroute" : speedMax > 50 ? "route" : "ville",
      vitesse_moyenne: km > 0 && duration > 0 ? Math.round(km / duration * 3600) : 0,
      vitesse_max: speedMax,
      freinages_brusques: accelEvents.current.filter(e => e.type === "freinage").length,
      accelerations_brusques: accelEvents.current.filter(e => e.type === "acceleration").length,
      exces_vitesse_count: excessRef.current,
      conduite_nocturne: new Date().getHours() >= 21 || new Date().getHours() <= 6,
      score_trajet: score,
      cout_mad: +(km * 0.5).toFixed(2),
      date_trajet: new Date().toISOString().split("T")[0],
    })
    if (!result.success) {
      alert("Erreur sauvegarde : " + result.error)
      setPhase("stopped")
      return
    }
    setTimeout(() => navigate("/dashboard"), 2000)
  }

  return (
    <div style={{ minHeight:"100vh", background:WAFA.gris, fontFamily:"Inter,sans-serif" }}>
      <header style={{ background:`linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`, padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={() => navigate("/dashboard")} style={{ background:"rgba(255,255,255,0.15)", border:"none", color:"white", borderRadius:10, padding:"8px 14px", cursor:"pointer", fontWeight:600, fontSize:13 }}>
          ← Tableau de bord
        </button>
        <div style={{ textAlign:"center" }}>
          <div style={{ color:"white", fontWeight:800, fontSize:16 }}>Mode Telematique</div>
          <div style={{ color:"rgba(255,255,255,0.6)", fontSize:11 }}>GPS + Accelerometre</div>
        </div>
        <div style={{ width:80 }} />
      </header>

      <div style={{ maxWidth:480, margin:"0 auto", padding:"24px 16px" }}>
        {error && <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", color:"#DC2626", padding:"14px 18px", borderRadius:14, marginBottom:20, fontSize:13 }}>!! {error}</div>}

        {phase === "saving" && <div style={{ background:"#F0FDF4", border:"1px solid #86EFAC", color:WAFA.vert, padding:"16px", borderRadius:14, marginBottom:20, fontSize:14, fontWeight:700, textAlign:"center" }}>Trajet sauvegarde ! Redirection...</div>}

        {phase === "idle" && (
          <div style={{ textAlign:"center" }}>
            <div style={{ background:"white", borderRadius:24, padding:"48px 32px", boxShadow:"0 4px 24px rgba(0,0,0,0.08)", marginBottom:20 }}>
              <div style={{ 
                width:80, height:80, borderRadius:"50%", 
                background:`linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:40, marginBottom:24, boxShadow:"0 8px 32px rgba(46,125,50,0.3)"
              }}>🚗</div>
              <h2 style={{ fontSize:24, fontWeight:900, color:WAFA.noir, margin:"0 0 8px", letterSpacing:"-0.5px" }}>Mode Télématique</h2>
              <p style={{ color:"#64748B", fontSize:14, lineHeight:1.7, margin:"0 0 28px", maxWidth:280 }}>Votre téléphone détecte automatiquement votre trajet via GPS et accéléromètre.</p>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:32, textAlign:"left" }}>
                {[
                  { icon:"📍", text:"GPS trace votre itinéraire en temps réel" },
                  { icon:"⚡", text:"Accéléromètre détecte les freinages" },
                  { icon:"🚦", text:"Détection limite de vitesse en temps réel" },
                  { icon:"📊", text:"Score calculé automatiquement" },
                ].map((f,i) => (
                  <div key={i} style={{ 
                    display:"flex", alignItems:"center", gap:14, 
                    padding:"12px 16px", 
                    background:"white", borderRadius:12,
                    border:"1px solid #E8E8E8",
                    boxShadow:"0 1px 4px rgba(0,0,0,0.04)"
                  }}>
                    <div style={{ 
                      width:36, height:36, borderRadius:10,
                      background:WAFA.gris,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:18, flexShrink:0
                    }}>{f.icon}</div>
                    <span style={{ fontSize:14, color:WAFA.noir, fontWeight:500 }}>{f.text}</span>
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
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:16, padding:"10px", background:"#FEF2F2", borderRadius:12 }}>
              <span style={{ fontWeight:800, color:"#EF4444", fontSize:14 }}>EN COURS - {formatDuration(duration)}</span>
            </div>
            {alerteVitesse && <div style={{ background:"#FEF2F2", border:"2px solid #EF4444", borderRadius:14, padding:"12px 16px", marginBottom:16, textAlign:"center", fontWeight:700, fontSize:14, color:"#DC2626" }}>{alerteVitesse}</div>}
            <div style={{ background:`linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`, borderRadius:24, padding:"28px", textAlign:"center", marginBottom:16 }}>
              <p style={{ color:"rgba(255,255,255,0.6)", fontSize:12, margin:"0 0 8px" }}>VITESSE ACTUELLE</p>
              <div style={{ fontSize:80, fontWeight:900, color:alerteVitesse ? "#EF4444" : "white", lineHeight:1 }}>{speedKmh}</div>
              <div style={{ fontSize:18, color:"rgba(255,255,255,0.7)", marginBottom:12 }}>km/h</div>
              <div style={{ display:"flex", justifyContent:"center", gap:12 }}>
                <div style={{ background:WAFA.or, color:WAFA.noir, padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:700 }}>Max : {speedMax} km/h</div>
                {limiteActuelle && <div style={{ background:alerteVitesse ? "#EF4444" : "rgba(255,255,255,0.2)", color:"white", padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:700, border:"2px solid white" }}>Limite : {limiteActuelle} km/h</div>}
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
              <div style={{ background:"white", borderRadius:16, padding:"18px", textAlign:"center" }}>
                <div style={{ fontSize:11, color:"#94A3B8", fontWeight:700, marginBottom:4 }}>DISTANCE</div>
                <div style={{ fontSize:32, fontWeight:900, color:WAFA.vert }}>{km.toFixed(2)}</div>
                <div style={{ fontSize:13, color:"#94A3B8" }}>km</div>
              </div>
              <div style={{ background:"white", borderRadius:16, padding:"18px", textAlign:"center" }}>
                <div style={{ fontSize:11, color:"#94A3B8", fontWeight:700, marginBottom:4 }}>SCORE</div>
                <div style={{ fontSize:32, fontWeight:900, color:scoreColor }}>{score}</div>
                <div style={{ fontSize:13, color:"#94A3B8" }}>/100</div>
              </div>
            </div>
            <div style={{ background:"white", borderRadius:16, padding:"16px 18px", marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#94A3B8", marginBottom:12 }}>INCIDENTS DETECTES</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"10px 8px", background:"#FEF2F2", borderRadius:10 }}>
                  <div style={{ fontWeight:800, fontSize:20, color:"#EF4444" }}>{events.filter(e => e.type === "freinage").length}</div>
                  <div style={{ fontSize:10, color:"#94A3B8" }}>Freinages</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"10px 8px", background:WAFA.orLight, borderRadius:10 }}>
                  <div style={{ fontWeight:800, fontSize:20, color:WAFA.orDark }}>{events.filter(e => e.type === "acceleration").length}</div>
                  <div style={{ fontSize:10, color:"#94A3B8" }}>Accel.</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"10px 8px", background:"#FEF2F2", borderRadius:10 }}>
                  <div style={{ fontWeight:800, fontSize:20, color:"#EF4444" }}>{excessVitesse}</div>
                  <div style={{ fontSize:10, color:"#94A3B8" }}>Exces</div>
                </div>
              </div>
            </div>
            <div style={{ background:WAFA.orLight, borderRadius:14, padding:"12px 18px", marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:13, color:WAFA.orDark, fontWeight:600 }}>Cout estime</span>
              <span style={{ fontSize:18, fontWeight:900, color:WAFA.orDark }}>{(km * 0.5).toFixed(2)} MAD</span>
            </div>
            <button onClick={stopTrajet} style={{ width:"100%", padding:"18px", borderRadius:16, background:"linear-gradient(135deg,#DC2626,#EF4444)", color:"white", border:"none", fontWeight:900, fontSize:18, cursor:"pointer" }}>
              Terminer le trajet
            </button>
          </div>
        )}

        {phase === "stopped" && (
          <div>
            <div style={{ background:"white", borderRadius:24, padding:32, boxShadow:"0 4px 24px rgba(0,0,0,0.08)", marginBottom:16 }}>
              <h2 style={{ fontSize:20, fontWeight:900, color:WAFA.noir, margin:"0 0 24px", textAlign:"center" }}>Resume du trajet</h2>
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
            <div style={{ display:"flex", gap:12 }}>
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

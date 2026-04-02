import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const WAFA = {
  or: '#F5A623', orDark: '#D4891A', orLight: '#FDF3E0',
  vert: '#2E7D32', vertLight: '#4CAF50', vertDark: '#1B5E20',
  noir: '#1A1A1A', gris: '#F5F5F5', grisMid: '#E8E8E8',
}

interface GpsPoint {
  lat: number
  lng: number
  speed: number
  timestamp: number
  accuracy: number
}

interface AccelEvent {
  type: 'freinage' | 'acceleration' | 'virage'
  magnitude: number
  timestamp: number
}

function calcDistance(p1: GpsPoint, p2: GpsPoint): number {
  const R = 6371
  const dLat = (p2.lat - p1.lat) * Math.PI / 180
  const dLon = (p2.lng - p1.lng) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 +
    Math.cos(p1.lat * Math.PI/180) * Math.cos(p2.lat * Math.PI/180) *
    Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function calcScore(events: AccelEvent[], speedMax: number): number {
  let score = 100
  const freinages = events.filter(e => e.type === 'freinage').length
  const accelerations = events.filter(e => e.type === 'acceleration').length
  score -= freinages * 3
  score -= accelerations * 2
  if (speedMax > 130) score -= 15
  else if (speedMax > 110) score -= 8
  else if (speedMax > 90) score -= 3
  return Math.max(0, Math.min(100, score))
}

export default function Telematics() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<'idle'|'requesting'|'running'|'stopped'|'saving'>('idle')
  const [error, setError] = useState('')
  const [km, setKm] = useState(0)
  const [speedKmh, setSpeedKmh] = useState(0)
  const [speedMax, setSpeedMax] = useState(0)
  const [duration, setDuration] = useState(0)
  const [events, setEvents] = useState<AccelEvent[]>([])
  const [score, setScore] = useState(100)
  const [saved, setSaved] = useState(false)

  const gpsPoints = useRef<GpsPoint[]>([])
  const watchId = useRef<number | null>(null)
  const timerRef = useRef<any>(null)
  const startTime = useRef<number>(0)
  const lastAccel = useRef({ x: 0, y: 0, z: 0, t: 0 })
  const accelEvents = useRef<AccelEvent[]>([])

  // Timer durée
  useEffect(() => {
    if (phase === 'running') {
      startTime.current = Date.now()
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime.current) / 1000))
      }, 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase])

  // Accéléromètre
  useEffect(() => {
    if (phase !== 'running') return

    function handleMotion(e: DeviceMotionEvent) {
      const accel = e.accelerationIncludingGravity
      if (!accel?.x || !accel?.y || !accel?.z) return
      const now = Date.now()
      if (now - lastAccel.current.t < 500) return

      const dx = Math.abs(accel.x - lastAccel.current.x)
      const dy = Math.abs(accel.y - lastAccel.current.y)
      const magnitude = Math.sqrt(dx**2 + dy**2)

      if (magnitude > 8) {
        const type = accel.y < lastAccel.current.y ? 'freinage' : 'acceleration'
        const evt: AccelEvent = { type, magnitude, timestamp: now }
        accelEvents.current.push(evt)
        setEvents([...accelEvents.current])
        setScore(calcScore(accelEvents.current, speedMax))
      }

      lastAccel.current = { x: accel.x, y: accel.y, z: accel.z, t: now }
    }

    window.addEventListener('devicemotion', handleMotion)
    return () => window.removeEventListener('devicemotion', handleMotion)
  }, [phase, speedMax])

  async function startTrajet() {
    setPhase('requesting')
    setError('')

    // Demande permission accéléromètre iOS
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const perm = await (DeviceMotionEvent as any).requestPermission()
        if (perm !== 'granted') {
          setError("Permission accéléromètre refusée. Activez dans Réglages > Safari.")
          setPhase('idle')
          return
        }
      } catch {}
    }

    // GPS
    if (!navigator.geolocation) {
      setError("GPS non disponible sur ce navigateur.")
      setPhase('idle')
      return
    }

    gpsPoints.current = []
    accelEvents.current = []
    setKm(0); setSpeedKmh(0); setSpeedMax(0); setDuration(0); setEvents([])

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const point: GpsPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          speed: pos.coords.speed || 0,
          timestamp: pos.timestamp,
          accuracy: pos.coords.accuracy
        }

        const speedMs = pos.coords.speed || 0
        const speedKmh = Math.round(speedMs * 3.6)
        setSpeedKmh(speedKmh)
        setSpeedMax(prev => Math.max(prev, speedKmh))

        if (gpsPoints.current.length > 0) {
          const last = gpsPoints.current[gpsPoints.current.length - 1]
          const dist = calcDistance(last, point)
          if (dist > 0.005) {
            gpsPoints.current.push(point)
            const total = gpsPoints.current.reduce((sum, p, i) => {
              if (i === 0) return 0
              return sum + calcDistance(gpsPoints.current[i-1], p)
            }, 0)
            setKm(+total.toFixed(2))
          }
        } else {
          gpsPoints.current.push(point)
        }
      },
      (err) => {
        setError(`Erreur GPS : ${err.message}`)
        setPhase('idle')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )

    setPhase('running')
  }

  function stopTrajet() {
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current)
    if (timerRef.current) clearInterval(timerRef.current)
    const finalScore = calcScore(accelEvents.current, speedMax)
    setScore(finalScore)
    setPhase('stopped')
  }

  async function saveTrajet() {
    setPhase('saving')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/login'); return }
    const { data: profile } = await supabase.from('profiles').select('pseudo_id').eq('id', user.id).single()
    if (profile) {
      await supabase.from('trajets').insert({
        pseudo_id: profile.pseudo_id,
        km: km,
        type_route: speedMax > 90 ? 'autoroute' : speedMax > 50 ? 'route' : 'ville',
        vitesse_moyenne: km > 0 && duration > 0 ? Math.round(km / duration * 3600) : 0,
        vitesse_max: speedMax,
        freinages_brusques: accelEvents.current.filter(e => e.type === 'freinage').length,
        accelerations_brusques: accelEvents.current.filter(e => e.type === 'acceleration').length,
        conduite_nocturne: new Date().getHours() >= 21 || new Date().getHours() <= 6,
        score_trajet: score,
        cout_mad: +(km * 0.5).toFixed(2),
        date_trajet: new Date().toISOString().split('T')[0]
      })
      setSaved(true)
      setTimeout(() => navigate('/dashboard'), 2000)
    }
  }

  function formatDuration(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}m ${sec.toString().padStart(2,'0')}s`
  }

  const scoreColor = score >= 80 ? WAFA.vert : score >= 60 ? WAFA.or : '#EF4444'

  return (
    <div style={{ minHeight:'100vh', background: WAFA.gris, fontFamily:'Inter,sans-serif' }}>
      
      {/* HEADER */}
      <header style={{
        background:`linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`,
        padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between'
      }}>
        <button onClick={() => navigate('/dashboard')}
          style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'white', borderRadius:10, padding:'8px 14px', cursor:'pointer', fontWeight:600, fontSize:13 }}>
          ← Dashboard
        </button>
        <div style={{ textAlign:'center' }}>
          <div style={{ color:'white', fontWeight:800, fontSize:16 }}>🚗 Mode Télématique</div>
          <div style={{ color:'rgba(255,255,255,0.6)', fontSize:11 }}>GPS + Accéléromètre</div>
        </div>
        <div style={{ width:80 }} />
      </header>

      <div style={{ maxWidth:480, margin:'0 auto', padding:'24px 16px' }}>

        {error && (
          <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', color:'#DC2626', padding:'14px 18px', borderRadius:14, marginBottom:20, fontSize:13, fontWeight:500 }}>
            ⚠️ {error}
          </div>
        )}

        {saved && (
          <div style={{ background:'#F0FDF4', border:'1px solid #86EFAC', color:WAFA.vert, padding:'16px 18px', borderRadius:14, marginBottom:20, fontSize:14, fontWeight:700, textAlign:'center' }}>
            ✅ Trajet sauvegardé ! Redirection...
          </div>
        )}

        {/* ÉCRAN IDLE */}
        {phase === 'idle' && (
          <div style={{ textAlign:'center' }}>
            <div style={{ background:'white', borderRadius:24, padding:'48px 32px', boxShadow:'0 4px 24px rgba(0,0,0,0.08)', marginBottom:20 }}>
              <div style={{ fontSize:64, marginBottom:20 }}>🚗</div>
              <h2 style={{ fontSize:22, fontWeight:900, color:WAFA.noir, margin:'0 0 12px' }}>
                Télématique réelle
              </h2>
              <p style={{ color:'#64748B', fontSize:14, lineHeight:1.7, margin:'0 0 32px' }}>
                Votre téléphone va détecter automatiquement votre trajet via GPS et accéléromètre. Conduisez normalement.
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:32, textAlign:'left' }}>
                {[
                  { icon:'📍', text:'GPS trace votre route en temps réel' },
                  { icon:'⚡', text:'Accéléromètre détecte les freinages' },
                  { icon:'🏎️', text:'Vitesse mesurée automatiquement' },
                  { icon:'📊', text:'Score calculé à la fin du trajet' },
                ].map((f,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:WAFA.gris, borderRadius:10 }}>
                    <span style={{ fontSize:18 }}>{f.icon}</span>
                    <span style={{ fontSize:13, color:WAFA.noir, fontWeight:500 }}>{f.text}</span>
                  </div>
                ))}
              </div>
              <button onClick={startTrajet} style={{
                width:'100%', padding:'18px', borderRadius:16,
                background:`linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`,
                color:'white', border:'none', fontWeight:900, fontSize:18,
                cursor:'pointer', boxShadow:`0 8px 24px rgba(46,125,50,0.4)`
              }}>
                🚀 Démarrer le trajet
              </button>
              <p style={{ fontSize:11, color:'#94A3B8', marginTop:12 }}>
                Autorisez l'accès GPS et aux capteurs quand demandé
              </p>
            </div>
          </div>
        )}

        {/* ÉCRAN REQUESTING */}
        {phase === 'requesting' && (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📍</div>
            <h2 style={{ fontSize:20, fontWeight:700, color:WAFA.noir }}>Activation GPS...</h2>
            <p style={{ color:'#64748B', fontSize:14 }}>Autorisez l'accès à votre position</p>
          </div>
        )}

        {/* ÉCRAN RUNNING */}
        {phase === 'running' && (
          <div>
            {/* Indicateur LIVE */}
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              marginBottom:20, padding:'10px', background:'#FEF2F2', borderRadius:12
            }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:'#EF4444', animation:'pulse 1s infinite' }} />
              <span style={{ fontWeight:800, color:'#EF4444', fontSize:14 }}>EN COURS — {formatDuration(duration)}</span>
            </div>

            {/* Vitesse GRANDE */}
            <div style={{
              background:`linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`,
              borderRadius:24, padding:'32px', textAlign:'center', marginBottom:16,
              position:'relative', overflow:'hidden'
            }}>
              <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, borderRadius:'50%', background:'rgba(245,166,35,0.1)' }} />
              <p style={{ color:'rgba(255,255,255,0.6)', fontSize:12, margin:'0 0 8px', letterSpacing:'1px' }}>VITESSE ACTUELLE</p>
              <div style={{ fontSize:80, fontWeight:900, color:'white', lineHeight:1 }}>{speedKmh}</div>
              <div style={{ fontSize:18, color:'rgba(255,255,255,0.7)', marginBottom:16 }}>km/h</div>
              <div style={{ display:'inline-block', background:WAFA.or, color:WAFA.noir, padding:'6px 16px', borderRadius:20, fontSize:13, fontWeight:700 }}>
                Max : {speedMax} km/h
              </div>
            </div>

            {/* KPIs */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
              <div style={{ background:'white', borderRadius:16, padding:'18px', textAlign:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize:11, color:'#94A3B8', fontWeight:700, marginBottom:4 }}>DISTANCE</div>
                <div style={{ fontSize:32, fontWeight:900, color:WAFA.vert }}>{km.toFixed(2)}</div>
                <div style={{ fontSize:13, color:'#94A3B8' }}>km</div>
              </div>
              <div style={{ background:'white', borderRadius:16, padding:'18px', textAlign:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize:11, color:'#94A3B8', fontWeight:700, marginBottom:4 }}>SCORE</div>
                <div style={{ fontSize:32, fontWeight:900, color:scoreColor }}>{score}</div>
                <div style={{ fontSize:13, color:'#94A3B8' }}>/100</div>
              </div>
            </div>

            {/* Incidents */}
            <div style={{ background:'white', borderRadius:16, padding:'16px 18px', marginBottom:20, boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#94A3B8', marginBottom:12 }}>INCIDENTS DÉTECTÉS</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:'#FEF2F2', borderRadius:10 }}>
                  <span style={{ fontSize:18 }}>🛑</span>
                  <div>
                    <div style={{ fontWeight:800, fontSize:16, color:'#EF4444' }}>
                      {events.filter(e => e.type === 'freinage').length}
                    </div>
                    <div style={{ fontSize:11, color:'#94A3B8' }}>Freinages</div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:WAFA.orLight, borderRadius:10 }}>
                  <span style={{ fontSize:18 }}>⚡</span>
                  <div>
                    <div style={{ fontWeight:800, fontSize:16, color:WAFA.orDark }}>
                      {events.filter(e => e.type === 'acceleration').length}
                    </div>
                    <div style={{ fontSize:11, color:'#94A3B8' }}>Accél. brusques</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coût estimé */}
            <div style={{ background:WAFA.orLight, borderRadius:14, padding:'12px 18px', marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:13, color:WAFA.orDark, fontWeight:600 }}>💰 Coût estimé</span>
              <span style={{ fontSize:18, fontWeight:900, color:WAFA.orDark }}>{(km * 0.5).toFixed(2)} MAD</span>
            </div>

            <button onClick={stopTrajet} style={{
              width:'100%', padding:'18px', borderRadius:16,
              background:'linear-gradient(135deg,#DC2626,#EF4444)',
              color:'white', border:'none', fontWeight:900, fontSize:18,
              cursor:'pointer', boxShadow:'0 8px 24px rgba(220,38,38,0.4)'
            }}>
              ⏹️ Terminer le trajet
            </button>
          </div>
        )}

        {/* ÉCRAN RÉSULTAT */}
        {phase === 'stopped' && (
          <div>
            <div style={{ background:'white', borderRadius:24, padding:32, boxShadow:'0 4px 24px rgba(0,0,0,0.08)', marginBottom:16 }}>
              <h2 style={{ fontSize:20, fontWeight:900, color:WAFA.noir, margin:'0 0 24px', textAlign:'center' }}>
                🏁 Résumé du trajet
              </h2>

              {/* Score final */}
              <div style={{
                background: score >= 80 ? `linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})` : score >= 60 ? `linear-gradient(135deg,${WAFA.orDark},${WAFA.or})` : 'linear-gradient(135deg,#DC2626,#EF4444)',
                borderRadius:20, padding:'28px', textAlign:'center', marginBottom:24
              }}>
                <p style={{ color:'rgba(255,255,255,0.7)', fontSize:12, margin:'0 0 8px' }}>SCORE FINAL</p>
                <div style={{ fontSize:72, fontWeight:900, color:'white', lineHeight:1 }}>{score}</div>
                <div style={{ fontSize:16, color:'rgba(255,255,255,0.7)' }}>/100</div>
                <div style={{ marginTop:12, fontSize:14, color:'white', fontWeight:700 }}>
                  {score >= 90 ? '🏅 Excellent conducteur !' : score >= 80 ? '✅ Bon conducteur' : score >= 60 ? '⚠️ Conduite à améliorer' : '🔴 Conduite dangereuse'}
                </div>
              </div>

              {/* Stats */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:24 }}>
                {[
                  { icon:'🛣️', val:`${km.toFixed(2)} km`, label:'Distance' },
                  { icon:'⏱️', val:formatDuration(duration), label:'Durée' },
                  { icon:'🏎️', val:`${speedMax} km/h`, label:'Vitesse max' },
                  { icon:'🛑', val:events.filter(e=>e.type==='freinage').length, label:'Freinages' },
                  { icon:'⚡', val:events.filter(e=>e.type==='acceleration').length, label:'Accél.' },
                  { icon:'💰', val:`${(km*0.5).toFixed(2)} MAD`, label:'Coût' },
                ].map((s,i) => (
                  <div key={i} style={{ background:WAFA.gris, borderRadius:12, padding:'14px 10px', textAlign:'center' }}>
                    <div style={{ fontSize:20, marginBottom:4 }}>{s.icon}</div>
                    <div style={{ fontWeight:800, fontSize:15, color:WAFA.noir }}>{s.val}</div>
                    <div style={{ fontSize:10, color:'#94A3B8', marginTop:2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Conseils */}
              {events.filter(e=>e.type==='freinage').length > 2 && (
                <div style={{ background:'#FEF2F2', borderRadius:12, padding:'14px 16px', marginBottom:16, fontSize:13, color:'#DC2626' }}>
                  💡 <strong>Conseil :</strong> Anticipez davantage les ralentissements pour éviter les freinages brusques.
                </div>
              )}
              {speedMax > 110 && (
                <div style={{ background:WAFA.orLight, borderRadius:12, padding:'14px 16px', marginBottom:16, fontSize:13, color:WAFA.orDark }}>
                  ⚠️ <strong>Vitesse :</strong> Vous avez dépassé 110 km/h. Restez dans les limites autorisées.
                </div>
              )}
              {score >= 90 && (
                <div style={{ background:'#F0FDF4', borderRadius:12, padding:'14px 16px', marginBottom:16, fontSize:13, color:WAFA.vert }}>
                  🏅 <strong>Excellent !</strong> Vous bénéficiez d'une réduction de -15% sur votre prime ce mois.
                </div>
              )}
            </div>

            <div style={{ display:'flex', gap:12 }}>
              <button onClick={() => { setPhase('idle'); setKm(0); setSpeedKmh(0); setSpeedMax(0); setDuration(0); setEvents([]); setScore(100) }}
                style={{ flex:1, padding:'16px', borderRadius:14, border:`2px solid ${WAFA.vert}`, background:'white', color:WAFA.vert, fontWeight:700, fontSize:14, cursor:'pointer' }}>
                🔄 Nouveau trajet
              </button>
              <button onClick={saveTrajet} style={{
                flex:2, padding:'16px', borderRadius:14,
                background:`linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`,
                color:'white', border:'none', fontWeight:800, fontSize:14,
                cursor:'pointer', boxShadow:`0 6px 20px rgba(46,125,50,0.4)`
              }}>
                💾 Sauvegarder dans DriveScore
              </button>
            </div>
          </div>
        )}

        {phase === 'saving' && (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>💾</div>
            <h2 style={{ fontSize:20, fontWeight:700, color:WAFA.noir }}>Sauvegarde en cours...</h2>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}

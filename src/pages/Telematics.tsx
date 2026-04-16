import { useNavigate } from 'react-router-dom'
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

function formatDuration(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}m ${sec.toString().padStart(2, '0')}s`
}

export default function Telematics() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const {
    phase, setPhase, km, speedKmh, speedMax, duration,
    events, score, limiteActuelle, alerteVitesse,
    excessVitesse, error, setError, accelEvents, excessRef, speedMaxRef,
    startTrajet, stopTrajet, resetTrajet, gpsPoints,
  } = useTelematics()

  const scoreColor = sc(score)
  const circumference = 2 * Math.PI * 37
  const scoreOffset = circumference - (circumference * score / 100)

  async function saveTrajet() {
    if (!profile?.pseudo_id) { if (setError) setError('Session expirée. Reconnectez-vous.'); return }
    if (!Number.isFinite(km) || km <= 0) {
      if (setError) setError('Distance invalide, impossible de sauvegarder le trajet.')
      setTimeout(() => { if (setError) setError('') }, 4000)
      setPhase('stopped')
      return
    }
    if (km < 0.5) {
      const ok = window.confirm(`Trajet très court (${km.toFixed(2)} km). Sauvegarder ?`)
      if (!ok) { resetTrajet(); return }
    }
    setPhase('saving')
    const sampledPoints = gpsPoints.current
      .filter((_, i) => i % 5 === 0).slice(0, 150)
      .map(p => ({ lat: parseFloat(p.lat.toFixed(5)), lng: parseFloat(p.lng.toFixed(5)), speed: Math.round(p.speed * 3.6), timestamp: p.timestamp }))

    const result = await insertTrajet({
      pseudo_id: profile.pseudo_id, km,
      type_route: speedMax > 90 ? 'autoroute' : speedMax > 60 ? 'route' : 'ville',
      vitesse_moyenne: km > 0 && duration > 0 ? Math.round(km / duration * 3600) : 0,
      vitesse_max: speedMax,
      freinages_brusques: accelEvents.current.filter(e => e.type === 'freinage').length,
      accelerations_brusques: accelEvents.current.filter(e => e.type === 'acceleration').length,
      exces_vitesse_count: excessRef.current,
      conduite_nocturne: new Date().getHours() >= 22 || new Date().getHours() <= 5,
      score_trajet: score,
      cout_mad: +(km * 0.5).toFixed(2),
      date_trajet: new Date().toISOString().split('T')[0],
      gps_points: sampledPoints,
    })

    if (!result.success) {
      if (setError) setError('Erreur sauvegarde : ' + result.error)
      setTimeout(() => { if (setError) setError('') }, 4000)
      setPhase('stopped')
      return
    }
    setPhase('saved')
    setTimeout(() => navigate('/dashboard'), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', background: C.surface, fontFamily: C.fontSans }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      {/* HEADER */}
      <div style={{ background: C.greenDeep, padding: '16px 20px 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'radial-gradient(circle, rgba(62,189,111,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', borderRadius: 10, padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
            ← Tableau de bord
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>Mode Télématique</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>GPS + Accéléromètre</div>
          </div>
          <div style={{ width: 80 }} />
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px', paddingBottom: 32 }}>

        {error && (
          <div style={{ background: C.redLight, border: `1px solid rgba(229,64,58,0.25)`, borderRadius: 12, padding: '12px 16px', marginBottom: 16, color: C.redDark, fontSize: 13, fontWeight: 500 }}>
            ⚠ {error}
          </div>
        )}

        {/* IDLE */}
        {phase === 'idle' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: C.white, borderRadius: 24, padding: '40px 28px', border: `1px solid ${C.border}`, marginBottom: 16 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: C.greenMid, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 32px rgba(30,92,53,0.3)' }}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="14" stroke="white" strokeWidth="1.8"/><circle cx="18" cy="18" r="5" fill="white"/><path d="M18 4V8M18 28V32M4 18H8M28 18H32" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/></svg>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: C.textPrimary, margin: '0 0 8px', letterSpacing: '-0.3px' }}>Mode Télématique</h2>
              <p style={{ color: C.textTertiary, fontSize: 13, lineHeight: 1.6, margin: '0 0 28px' }}>GPS · Accéléromètre · Limites de vitesse OSM</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28, textAlign: 'left' }}>
                {[
                  { icon: '📍', text: 'GPS trace votre itinéraire en temps réel' },
                  { icon: '⚡', text: 'Accéléromètre détecte les freinages' },
                  { icon: '🚦', text: 'Limite de vitesse détectée automatiquement' },
                  { icon: '📊', text: 'Score calculé à la fin du trajet' },
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: C.surface, borderRadius: 12, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{f.icon}</span>
                    <span style={{ fontSize: 13, color: C.textSecondary, fontWeight: 500 }}>{f.text}</span>
                  </div>
                ))}
              </div>

              <button onClick={startTrajet} style={{ width: '100%', padding: '16px', borderRadius: 16, background: C.greenMid, color: 'white', border: 'none', fontWeight: 600, fontSize: 16, cursor: 'pointer', fontFamily: C.fontSans, boxShadow: '0 6px 20px rgba(30,92,53,0.3)' }}>
                Commencer le trajet
              </button>
            </div>
          </div>
        )}

        {/* REQUESTING */}
        {phase === 'requesting' && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ width: 40, height: 40, border: `2px solid ${C.greenBright}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <div style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>Activation GPS...</div>
            <div style={{ fontSize: 13, color: C.textTertiary, marginTop: 6 }}>Autorisez l'accès à votre position</div>
          </div>
        )}

        {/* RUNNING */}
        {phase === 'running' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Alerte vitesse */}
            {alerteVitesse && (
              <div style={{ background: C.redLight, border: `1px solid rgba(229,64,58,0.3)`, borderRadius: 14, padding: '12px 16px', textAlign: 'center', fontWeight: 600, fontSize: 13, color: C.redDark }}>
                🚨 {alerteVitesse}
              </div>
            )}

            {/* Compteur principal */}
            <div style={{ background: alerteVitesse ? '#1a0a0a' : C.greenDeep, borderRadius: 24, padding: '22px 20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: `radial-gradient(circle, ${alerteVitesse ? 'rgba(229,64,58,0.15)' : 'rgba(62,189,111,0.15)'} 0%, transparent 70%)`, pointerEvents: 'none' }} />

              {/* Timer + status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: '4px 12px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.red, animation: 'pulse 1s infinite' }} />
                  <span style={{ color: 'white', fontSize: 12, fontWeight: 500 }}>EN COURS</span>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 500, fontFamily: C.fontMono }}>{formatDuration(duration)}</span>
              </div>

              {/* Vitesse */}
              <div style={{ textAlign: 'center', marginBottom: 16, position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: 80, fontWeight: 300, color: alerteVitesse ? '#FF6B6B' : 'white', lineHeight: 1, fontFamily: C.fontMono, letterSpacing: '-4px' }}>{speedKmh}</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>km/h</div>
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, position: 'relative', zIndex: 1 }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: '5px 12px', fontSize: 12, color: C.amber }}>
                  Max {speedMax} km/h
                </div>
                {limiteActuelle && (
                  <div style={{ background: alerteVitesse ? 'rgba(229,64,58,0.3)' : 'rgba(255,255,255,0.1)', border: `0.5px solid ${alerteVitesse ? 'rgba(229,64,58,0.5)' : 'rgba(255,255,255,0.15)'}`, borderRadius: 20, padding: '5px 12px', fontSize: 12, color: 'white' }}>
                    Limite {limiteActuelle} km/h
                  </div>
                )}
              </div>
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: C.white, borderRadius: 16, padding: '16px', textAlign: 'center', border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.3px', marginBottom: 6 }}>DISTANCE</div>
                <div style={{ fontSize: 34, fontWeight: 600, color: C.greenAccent, lineHeight: 1, fontFamily: C.fontMono }}>{km.toFixed(2)}</div>
                <div style={{ fontSize: 12, color: C.textTertiary, marginTop: 4 }}>kilomètres</div>
              </div>
              <div style={{ background: C.white, borderRadius: 16, padding: '16px', textAlign: 'center', border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.3px', marginBottom: 6 }}>SCORE</div>
                <div style={{ fontSize: 34, fontWeight: 600, color: scoreColor, lineHeight: 1, fontFamily: C.fontMono }}>{score}</div>
                <div style={{ fontSize: 12, color: C.textTertiary, marginTop: 4 }}>/100</div>
              </div>
            </div>

            {/* Incidents */}
            <div style={{ background: C.white, borderRadius: 16, padding: '14px 16px', border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.3px', marginBottom: 12 }}>INCIDENTS DÉTECTÉS</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Freinages', val: events.filter(e => e.type === 'freinage').length, bg: C.redLight, color: C.redDark },
                  { label: 'Accél.', val: events.filter(e => e.type === 'acceleration').length, bg: C.amberLight, color: C.amberDark },
                  { label: 'Excès', val: excessVitesse, bg: C.redLight, color: C.redDark },
                ].map((inc, i) => (
                  <div key={i} style={{ background: inc.bg, borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 600, color: inc.color, lineHeight: 1, fontFamily: C.fontMono }}>{inc.val}</div>
                    <div style={{ fontSize: 10, color: C.textTertiary, marginTop: 3 }}>{inc.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coût */}
            <div style={{ background: C.amberLight, borderRadius: 14, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid rgba(245,166,35,0.2)` }}>
              <div>
                <div style={{ fontSize: 11, color: C.amberDark, fontWeight: 500 }}>COÛT ESTIMÉ</div>
                <div style={{ fontSize: 11, color: C.textTertiary }}>0,50 MAD/km</div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 600, color: C.amberDark, fontFamily: C.fontMono }}>{(km * 0.5).toFixed(2)} MAD</div>
            </div>

            <button onClick={stopTrajet} style={{ width: '100%', padding: '16px', borderRadius: 16, background: '#8B1A17', color: 'white', border: 'none', fontWeight: 600, fontSize: 16, cursor: 'pointer', fontFamily: C.fontSans }}>
              Terminer le trajet
            </button>
          </div>
        )}

        {/* STOPPED */}
        {phase === 'stopped' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Carte GPS */}
            {gpsPoints.current.length > 1 && (
              <div style={{ borderRadius: 20, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                <TrajetMapStrava points={gpsPoints.current} speedMax={speedMax} incidents={[
                  ...accelEvents.current.filter(e => e.type === 'freinage' && e.lat).map(e => ({ lat: e.lat!, lng: e.lng!, type: 'freinage' as const })),
                  ...accelEvents.current.filter(e => e.type === 'acceleration' && e.lat).map(e => ({ lat: e.lat!, lng: e.lng!, type: 'acceleration' as const })),
                ]} height={200} interactive={true} />
              </div>
            )}

            {/* Score final */}
            <div style={{ background: score >= 80 ? C.greenMid : score >= 60 ? C.amberDark : '#8B1A17', borderRadius: 20, padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.3px', marginBottom: 8 }}>SCORE FINAL</div>
              <div style={{ fontSize: 64, fontWeight: 600, color: 'white', lineHeight: 1, fontFamily: C.fontMono }}>{score}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>/100</div>
              <div style={{ marginTop: 10, fontSize: 15, color: 'white', fontWeight: 500 }}>
                {score >= 90 ? 'Excellent conducteur !' : score >= 80 ? 'Bon conducteur' : score >= 60 ? 'Conduite à améliorer' : 'Conduite dangereuse'}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[
                { val: `${km.toFixed(2)}`, unit: 'km', label: 'Distance' },
                { val: formatDuration(duration), unit: '', label: 'Durée' },
                { val: `${speedMax}`, unit: 'km/h', label: 'Max' },
                { val: String(events.filter(e=>e.type==='freinage').length), unit: '', label: 'Freinages' },
                { val: String(events.filter(e=>e.type==='acceleration').length), unit: '', label: 'Accél.' },
                { val: String(excessVitesse), unit: '', label: 'Excès' },
              ].map((s, i) => (
                <div key={i} style={{ background: C.white, borderRadius: 12, padding: '12px 8px', textAlign: 'center', border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, fontFamily: C.fontMono }}>{s.val}{s.unit && <span style={{ fontSize: 10, color: C.textTertiary }}> {s.unit}</span>}</div>
                  <div style={{ fontSize: 10, color: C.textTertiary, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Coaching */}
            <div style={{ background: C.amberLight, borderRadius: 16, border: `1px solid rgba(245,166,35,0.2)`, overflow: 'hidden' }}>
              <div style={{ background: C.amberDark, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14 }}>💡</span>
                <span style={{ color: 'white', fontWeight: 600, fontSize: 13 }}>Coaching personnalisé</span>
              </div>
              <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(() => {
                  const freinages = events.filter(e => e.type === 'freinage').length
                  const accels = events.filter(e => e.type === 'acceleration').length
                  const conseils = []
                  if (excessVitesse > 10) conseils.push({ icon: '🚨', text: `${excessVitesse} excès de vitesse. Respectez les limites pour protéger votre score.`, bg: C.redLight, color: C.redDark })
                  else if (freinages > 5) conseils.push({ icon: '🛑', text: `${freinages} freinages brusques. Anticipez les ralentissements.`, bg: C.redLight, color: C.redDark })
                  else if (freinages > 2) conseils.push({ icon: '⚠️', text: `${freinages} freinages détectés. Gardez vos distances.`, bg: C.amberLight, color: C.amberDark })
                  else conseils.push({ icon: '✅', text: 'Excellente maîtrise du freinage ! Continuez à anticiper.', bg: 'rgba(62,189,111,0.1)', color: C.greenAccent })
                  if (score >= 90) conseils.push({ icon: '🏅', text: `Score ${score}/100 — Vous bénéficiez de la réduction maximale -15%.`, bg: 'rgba(62,189,111,0.1)', color: C.greenAccent })
                  else if (score >= 80) conseils.push({ icon: '📈', text: `Score ${score}/100 — Encore quelques points pour atteindre -15%.`, bg: C.blueLight, color: C.blue })
                  else conseils.push({ icon: '💪', text: `Score ${score}/100 — Réduisez vos incidents pour améliorer votre prime.`, bg: C.amberLight, color: C.amberDark })
                  return conseils.map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: c.bg, borderRadius: 10 }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{c.icon}</span>
                      <span style={{ fontSize: 12, color: c.color, lineHeight: 1.5 }}>{c.text}</span>
                    </div>
                  ))
                })()}
              </div>
            </div>

            {/* WhatsApp share */}
            <button onClick={() => {
              const txt = `🚗 Mon trajet DriveScore — Score : ${score}/100 | ${km.toFixed(2)} km | ${(km*0.5).toFixed(2)} MAD\n${score >= 90 ? '🏅 Excellent !' : score >= 80 ? '✅ Bon conducteur' : '💪 En progression'}\n👉 drivescore-eight.vercel.app`
              window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, '_blank')
            }} style={{ width: '100%', padding: '13px', borderRadius: 14, background: '#25D366', color: 'white', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: C.fontSans }}>
              📲 Partager sur WhatsApp
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => navigate('/trajets')} style={{ flex: 1, padding: '14px', borderRadius: 14, border: `1px solid ${C.borderStrong}`, background: C.white, color: C.textSecondary, fontWeight: 500, fontSize: 14, cursor: 'pointer', fontFamily: C.fontSans }}>
                Mes trajets
              </button>
              <button onClick={saveTrajet} style={{ flex: 2, padding: '14px', borderRadius: 14, background: C.greenMid, color: 'white', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: C.fontSans }}>
                Sauvegarder
              </button>
            </div>
          </div>
        )}

        {/* SAVING */}
        {phase === 'saving' && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ width: 40, height: 40, border: `2px solid ${C.greenBright}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <div style={{ fontSize: 16, fontWeight: 500, color: C.textPrimary }}>Sauvegarde en cours...</div>
          </div>
        )}

        {/* SAVED */}
        {phase === 'saved' && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: C.textPrimary }}>Trajet sauvegardé !</div>
            <div style={{ fontSize: 13, color: C.textTertiary, marginTop: 6 }}>Redirection vers le tableau de bord...</div>
          </div>
        )}
      </div>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const WAFA = {
  vert: '#2E7D32', vertDark: '#1B5E20', or: '#F5A623',
  orDark: '#D4891A', orLight: '#FDF3E0', noir: '#0F172A',
  gris: '#F8FAFC', grisMid: '#E2E8F0',
}

const PROFILES = [
  { id: 'prudent', label: 'Prudent', icon: '🕊️', score: 92, desc: 'Conduite douce et anticipée' },
  { id: 'normal', label: 'Normal', icon: '🚗', score: 78, desc: 'Conduite standard' },
  { id: 'sportif', label: 'Sportif', icon: '🏎️', score: 58, desc: 'Conduite rapide et vive' },
]

const TRAJETS = [
  { id: 'travail', label: 'Domicile/Travail', icon: '🏢', bonus: 5 },
  { id: 'loisirs', label: 'Loisirs', icon: '🎯', bonus: 0 },
  { id: 'mixte', label: 'Mixte', icon: '🔀', bonus: 2 },
]

function getReduction(score: number) {
  if (score >= 90) return 15
  if (score >= 80) return 10
  if (score >= 70) return 5
  return 0
}

function getScoreColor(score: number) {
  if (score >= 90) return '#16A34A'
  if (score >= 80) return '#2E7D32'
  if (score >= 70) return '#D97706'
  return '#DC2626'
}

function getScoreLabel(score: number) {
  if (score >= 90) return '🏅 Excellent'
  if (score >= 80) return '✅ Bon conducteur'
  if (score >= 70) return '⚠️ Moyen'
  return '🔴 À améliorer'
}

export default function Simulateur() {
  const navigate = useNavigate()
  const [km, setKm] = useState(500)
  const [profile, setProfile] = useState(PROFILES[0])
  const [trajet, setTrajet] = useState(TRAJETS[0])
  const [nocturne, setNocturne] = useState(false)
  const [anciennete, setAnciennete] = useState(5)

  const scoreBase = profile.score + trajet.bonus + (anciennete >= 5 ? 3 : 0) - (nocturne ? 8 : 0)
  const score = Math.min(100, Math.max(0, scoreBase))
  const reduction = getReduction(score)
  const prime = Math.round((200 + km * 0.5) * (1 - reduction / 100))
  const eco = Math.max(0, 600 - prime)
  const eco12 = eco * 12
  const scoreColor = getScoreColor(score)

  const shareText = `Je viens de simuler ma prime DriveScore by Wafa Assurance : ${prime} MAD/mois au lieu de 600 MAD ! Économie : ${eco} MAD/mois 🚗💚`

  return (
    <div style={{ minHeight: '100vh', background: WAFA.gris, fontFamily: 'Inter,system-ui,sans-serif' }}>

      {/* HEADER */}
      <div style={{ background: `linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`, padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <button onClick={() => navigate('/login')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            ← Retour
          </button>
          <img src="/wafa-logo.png" alt="Wafa" style={{ width: 32, height: 32, borderRadius: 8 }} />
        </div>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>💡 Simulez votre prime</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Style Snapshot · Sans engagement · Résultat immédiat</div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px' }}>

        {/* RÉSULTAT EN TEMPS RÉEL — toujours visible */}
        <div style={{ background: `linear-gradient(135deg,#052E16,${WAFA.vertDark})`, borderRadius: 20, padding: '18px', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            {/* Score gauge */}
            <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                <circle cx="40" cy="40" r="32" fill="none" stroke={scoreColor} strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 32 * score / 100} ${2 * Math.PI * 32}`}
                  strokeLinecap="round" transform="rotate(-90 40 40)" style={{ transition: 'all 0.4s ease' }} />
                <text x="40" y="36" textAnchor="middle" fill="white" fontSize="18" fontWeight="900" fontFamily="Inter">{score}</text>
                <text x="40" y="50" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="Inter">/100</text>
              </svg>
            </div>
            {/* Prime + label */}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', marginBottom: 2 }}>VOTRE PRIME</div>
              <div style={{ fontSize: 42, fontWeight: 900, color: WAFA.or, lineHeight: 1, transition: 'all 0.3s' }}>{prime}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>MAD/mois</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: scoreColor, marginTop: 4 }}>{getScoreLabel(score)}</div>
            </div>
          </div>

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
            {[
              { val: `-${reduction}%`, label: 'Réduction', color: '#86EFAC' },
              { val: `+${eco} MAD`, label: 'Éco/mois', color: WAFA.or },
              { val: `+${eco12} MAD`, label: 'Éco/an', color: '#60A5FA' },
            ].map((k, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: k.color, transition: 'all 0.3s' }}>{k.val}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Comparaison */}
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>600 MAD</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>Assurance classique</div>
            </div>
            <div style={{ fontSize: 16, color: '#86EFAC' }}>→</div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#86EFAC', transition: 'all 0.3s' }}>{prime} MAD</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>Avec DriveScore</div>
            </div>
          </div>
        </div>

        {/* SLIDER KM */}
        <div style={{ background: 'white', borderRadius: 16, padding: '14px 16px', marginBottom: 10, border: `0.5px solid ${WAFA.grisMid}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em' }}>KILOMÉTRAGE MENSUEL</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: WAFA.noir }}>{km} <span style={{ fontSize: 12, color: '#94A3B8' }}>km</span></div>
          </div>
          <input type="range" min="100" max="3000" step="50" value={km}
            onChange={e => setKm(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: WAFA.vert, cursor: 'pointer' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#CBD5E1', marginTop: 4 }}>
            <span>100 km · 250 MAD</span>
            <span>3 000 km · 1 700 MAD</span>
          </div>
        </div>

        {/* PROFIL */}
        <div style={{ background: 'white', borderRadius: 16, padding: '14px 16px', marginBottom: 10, border: `0.5px solid ${WAFA.grisMid}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em', marginBottom: 10 }}>PROFIL DE CONDUITE</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {PROFILES.map(p => (
              <button key={p.id} onClick={() => setProfile(p)} style={{
                padding: '10px 6px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                border: `2px solid ${profile.id === p.id ? WAFA.vert : WAFA.grisMid}`,
                background: profile.id === p.id ? '#F0FDF4' : 'white', transition: 'all 0.15s',
              }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{p.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: profile.id === p.id ? WAFA.vert : '#475569' }}>{p.label}</div>
                <div style={{ fontSize: 9, color: '#94A3B8', marginTop: 2 }}>~{p.score}/100</div>
              </button>
            ))}
          </div>
        </div>

        {/* TYPE DE TRAJET */}
        <div style={{ background: 'white', borderRadius: 16, padding: '14px 16px', marginBottom: 10, border: `0.5px solid ${WAFA.grisMid}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em', marginBottom: 10 }}>TYPE DE TRAJET HABITUEL</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {TRAJETS.map(t => (
              <button key={t.id} onClick={() => setTrajet(t)} style={{
                padding: '10px 6px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                border: `2px solid ${trajet.id === t.id ? WAFA.vert : WAFA.grisMid}`,
                background: trajet.id === t.id ? '#F0FDF4' : 'white', transition: 'all 0.15s',
              }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{t.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: trajet.id === t.id ? WAFA.vert : '#475569' }}>{t.label}</div>
                {t.bonus > 0 && <div style={{ fontSize: 9, color: '#16A34A' }}>+{t.bonus} pts</div>}
              </button>
            ))}
          </div>
        </div>

        {/* OPTIONS AVANCÉES */}
        <div style={{ background: 'white', borderRadius: 16, padding: '14px 16px', marginBottom: 14, border: `0.5px solid ${WAFA.grisMid}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em', marginBottom: 12 }}>OPTIONS AVANCÉES</div>

          {/* Ancienneté permis */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: WAFA.noir, fontWeight: 500 }}>🪪 Ancienneté du permis</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: anciennete >= 5 ? WAFA.vert : WAFA.orDark }}>{anciennete} ans {anciennete >= 5 ? '+3 pts' : ''}</span>
            </div>
            <input type="range" min="1" max="30" value={anciennete}
              onChange={e => setAnciennete(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: WAFA.vert, cursor: 'pointer' }} />
          </div>

          {/* Conduite nocturne */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: nocturne ? '#FEF2F2' : WAFA.gris, borderRadius: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: WAFA.noir }}>🌙 Conduite nocturne fréquente</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>Après 21h — pénalité -8 pts</div>
            </div>
            <div onClick={() => setNocturne(!nocturne)} style={{
              width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
              background: nocturne ? '#EF4444' : '#CBD5E1', position: 'relative', transition: 'background 0.2s',
            }}>
              <div style={{ position: 'absolute', top: 2, left: nocturne ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
          </div>
        </div>

        {/* CTAs */}
        <button onClick={() => navigate('/inscription')} style={{
          width: '100%', padding: '16px', borderRadius: 14, marginBottom: 10,
          background: `linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`,
          color: 'white', border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(46,125,50,0.35)',
        }}>
          🚀 Créer mon compte — {prime} MAD/mois →
        </button>

        <button onClick={() => {
          const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' → drivescore-eight.vercel.app')}`
          window.open(url, '_blank')
        }} style={{
          width: '100%', padding: '14px', borderRadius: 14, marginBottom: 10,
          background: '#25D366', color: 'white', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer',
        }}>
          📲 Partager sur WhatsApp
        </button>

        <button onClick={() => navigate('/login')} style={{
          width: '100%', padding: '12px', borderRadius: 14,
          background: 'transparent', border: `1.5px solid ${WAFA.grisMid}`,
          color: '#64748B', fontWeight: 600, fontSize: 13, cursor: 'pointer',
        }}>
          J'ai déjà un compte → Se connecter
        </button>

        <p style={{ textAlign: 'center', fontSize: 10, color: '#94A3B8', lineHeight: 1.6, marginTop: 16, padding: '0 8px' }}>
          Simulation basée sur 600 MAD/mois pour une assurance classique.<br />
          Prime réelle calculée selon votre comportement de conduite réel.<br />
          Conforme CNDP (Loi 09-08) · Agréé ACAPS · Wafa Assurance © 2026
        </p>
      </div>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const WAFA = {
  vert: '#2E7D32', vertDark: '#1B5E20', or: '#F5A623',
  orDark: '#D4891A', orLight: '#FDF3E0', noir: '#0F172A',
  gris: '#F8FAFC', grisMid: '#E2E8F0',
}

const PROFILES = [
  { id: 'prudent', label: 'Prudent', icon: '🕊️', score: 92 },
  { id: 'normal', label: 'Normal', icon: '🚗', score: 78 },
  { id: 'sportif', label: 'Sportif', icon: '🏎️', score: 58 },
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
  if (score >= 90) return 'Excellent'
  if (score >= 80) return 'Bon conducteur'
  if (score >= 70) return 'Moyen'
  return 'À améliorer'
}

function getTip(score: number, eco: number) {
  if (score >= 90) return `✅ Votre profil prudent vous économise ${eco} MAD/mois`
  if (score >= 80) return `📈 Améliorez votre score pour économiser encore plus`
  if (score >= 70) return `💡 Réduisez vos freinages pour passer à -15% de réduction`
  return `⚠️ Adoptez une conduite plus souple pour bénéficier des réductions`
}

export default function Simulateur() {
  const navigate = useNavigate()
  const [km, setKm] = useState(500)
  const [profile, setProfile] = useState(PROFILES[0])

  const base = 200
  const kmCost = Math.round(km * 0.5)
  const subtotal = base + kmCost
  const reduction = getReduction(profile.score)
  const prime = Math.round(subtotal * (1 - reduction / 100))
  const eco = Math.max(0, 600 - prime)
  const scoreColor = getScoreColor(profile.score)

  return (
    <div style={{ minHeight: '100vh', background: WAFA.gris, fontFamily: 'Inter,system-ui,sans-serif' }}>

      {/* HEADER */}
      <div style={{ background: `linear-gradient(135deg,${WAFA.vertDark},${WAFA.vert})`, padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button onClick={() => navigate('/login')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            ← Retour
          </button>
          <img src="/wafa-logo.png" alt="Wafa" style={{ width: 32, height: 32, borderRadius: 8 }} />
        </div>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>💡 Simulez votre prime</div>
          <div style={{ fontSize: 13, opacity: 0.7 }}>Sans engagement · Résultat immédiat</div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px' }}>

        {/* SLIDER KM */}
        <div style={{ background: 'white', borderRadius: 16, padding: '16px', marginBottom: 12, border: `0.5px solid ${WAFA.grisMid}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em', marginBottom: 8 }}>KILOMÉTRAGE MENSUEL ESTIMÉ</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
            <span style={{ fontSize: 36, fontWeight: 900, color: WAFA.noir }}>{km}</span>
            <span style={{ fontSize: 14, color: '#94A3B8' }}>km/mois</span>
          </div>
          <input type="range" min="100" max="3000" step="50" value={km}
            onChange={e => setKm(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: WAFA.vert, cursor: 'pointer' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#CBD5E1', marginTop: 4 }}>
            <span>100 km</span>
            <span>3 000 km</span>
          </div>
        </div>

        {/* PROFIL */}
        <div style={{ background: 'white', borderRadius: 16, padding: '16px', marginBottom: 12, border: `0.5px solid ${WAFA.grisMid}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em', marginBottom: 12 }}>VOTRE PROFIL DE CONDUITE</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {PROFILES.map(p => (
              <button key={p.id} onClick={() => setProfile(p)} style={{
                padding: '12px 6px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                border: `2px solid ${profile.id === p.id ? WAFA.vert : WAFA.grisMid}`,
                background: profile.id === p.id ? '#F0FDF4' : 'white',
                transition: 'all 0.15s',
              }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{p.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: profile.id === p.id ? WAFA.vert : '#475569' }}>{p.label}</div>
                <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>Score ~{p.score}</div>
              </button>
            ))}
          </div>
        </div>

        {/* RÉSULTAT */}
        <div style={{ background: `linear-gradient(135deg,#052E16,${WAFA.vertDark})`, borderRadius: 20, padding: '20px', marginBottom: 12 }}>

          {/* Prime principale */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', marginBottom: 4 }}>VOTRE PRIME MENSUELLE</div>
            <div style={{ fontSize: 56, fontWeight: 900, color: WAFA.or, lineHeight: 1 }}>{prime}</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>MAD / mois</div>
          </div>

          {/* Comparaison */}
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>600 MAD</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>Assurance classique</div>
            </div>
            <div style={{ fontSize: 20, color: '#86EFAC' }}>→</div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#86EFAC' }}>{prime} MAD</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>Avec DriveScore</div>
            </div>
          </div>

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
            {[
              { val: `${profile.score}/100`, label: 'Score estimé', color: scoreColor },
              { val: `-${reduction}%`, label: 'Réduction', color: '#86EFAC' },
              { val: `+${eco} MAD`, label: 'Économie/mois', color: WAFA.or },
            ].map((k, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: k.color }}>{k.val}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Score bar */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Score de conduite estimé</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor }}>{getScoreLabel(profile.score)}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 20, height: 8, overflow: 'hidden' }}>
              <div style={{ width: `${profile.score}%`, height: '100%', background: scoreColor, borderRadius: 20, transition: 'width 0.4s ease' }} />
            </div>
          </div>

          {/* Tip */}
          <div style={{ background: 'rgba(134,239,172,0.1)', border: '1px solid rgba(134,239,172,0.2)', borderRadius: 10, padding: '10px 12px', marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: '#86EFAC', lineHeight: 1.5 }}>{getTip(profile.score, eco)}</span>
          </div>

          {/* CTAs */}
          <button onClick={() => navigate('/inscription')} style={{
            width: '100%', padding: '16px', borderRadius: 14,
            background: WAFA.or, color: WAFA.noir,
            border: 'none', fontWeight: 800, fontSize: 15,
            cursor: 'pointer', marginBottom: 8,
          }}>
            🚀 Créer mon compte gratuit →
          </button>
          <button onClick={() => navigate('/login')} style={{
            width: '100%', padding: '13px', borderRadius: 14,
            background: 'rgba(255,255,255,0.1)', color: 'white',
            border: '1px solid rgba(255,255,255,0.2)', fontWeight: 600, fontSize: 13,
            cursor: 'pointer',
          }}>
            J'ai déjà un compte → Se connecter
          </button>
        </div>

        {/* NOTE LÉGALE */}
        <div style={{ textAlign: 'center', fontSize: 10, color: '#94A3B8', lineHeight: 1.6, padding: '0 8px' }}>
          Simulation indicative basée sur 600 MAD/mois pour une assurance classique.<br />
          Prime réelle calculée selon votre comportement réel de conduite.<br />
          Conforme CNDP (Loi 09-08) · Agréé ACAPS · Wafa Assurance © 2026
        </div>
      </div>
    </div>
  )
}

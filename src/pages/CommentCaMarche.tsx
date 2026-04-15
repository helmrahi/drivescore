import { useNavigate } from 'react-router-dom'

const C = {
  greenDeep: '#0D2E1C', greenMid: '#1E5C35', greenAccent: '#2A8A50', greenBright: '#3EBD6F',
  amber: '#F5A623', amberLight: '#FDF0D5', amberDark: '#8B5E00',
  red: '#E5403A', redLight: '#FDEAEA', redDark: '#8B1A17',
  blue: '#2D7DD2', blueLight: '#E8F2FC',
  white: '#FFFFFF', surface: '#F7F8F6', surface2: '#EDEFEB',
  textPrimary: '#0D1F16', textSecondary: '#4A6355', textTertiary: '#8AA898',
  border: 'rgba(13,46,28,0.08)', borderStrong: 'rgba(13,46,28,0.14)',
  fontSans: "'DM Sans', sans-serif", fontMono: "'DM Mono', monospace",
}

export default function CommentCaMarche() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: C.surface, fontFamily: C.fontSans, paddingBottom: 32 }}>

      {/* HEADER */}
      <div style={{ background: C.greenDeep, padding: '16px 20px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'radial-gradient(circle, rgba(62,189,111,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', borderRadius: 10, padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>← Retour</button>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>Comment ça marche ?</div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px' }}>

        {/* HERO */}
        <div style={{ background: C.greenDeep, borderRadius: 22, padding: '28px 24px', textAlign: 'center', marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'radial-gradient(circle, rgba(62,189,111,0.2) 0%, transparent 70%)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(62,189,111,0.15)', border: '1px solid rgba(62,189,111,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>🚗</div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: 'white', marginBottom: 8, letterSpacing: '-0.3px' }}>Comment fonctionne DriveScore ?</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: 0 }}>
              Un score juste, basé sur votre comportement réel. Conduisez naturellement — notre algorithme fait le reste.
            </p>
          </div>
        </div>

        {/* PRINCIPE */}
        <div style={{ background: C.white, borderRadius: 20, padding: '18px', marginBottom: 12, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.3px', marginBottom: 14 }}>LE PRINCIPE</div>
          <div style={{ background: C.greenDeep, borderRadius: 14, padding: '16px', textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.3px', marginBottom: 6 }}>SCORE DE DÉPART</div>
            <div style={{ fontSize: 48, fontWeight: 600, color: C.amber, lineHeight: 1, fontFamily: C.fontMono }}>100</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Chaque trajet commence parfait</div>
          </div>
          <p style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.6, textAlign: 'center', margin: 0 }}>
            Des points sont ajustés selon votre comportement. <strong style={{ color: C.textPrimary, fontWeight: 600 }}>Plus vous conduisez prudemment, plus votre prime baisse.</strong>
          </p>
        </div>

        {/* CE QU'ON MESURE */}
        <div style={{ background: C.white, borderRadius: 20, padding: '18px', marginBottom: 12, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.3px', marginBottom: 14 }}>CE QUE NOUS ANALYSONS</div>
          {[
            { icon: '🛑', label: 'Freinage', sub: 'Anticipez les ralentissements — gardez vos distances', bg: C.redLight, ibg: 'rgba(229,64,58,0.1)' },
            { icon: '⚡', label: 'Accélération', sub: 'Démarrez progressivement — économisez du carburant', bg: C.amberLight, ibg: 'rgba(245,166,35,0.1)' },
            { icon: '🚦', label: 'Vitesse', sub: 'Limites détectées automatiquement via GPS OpenStreetMap', bg: C.redLight, ibg: 'rgba(229,64,58,0.1)' },
            { icon: '🌙', label: 'Horaires', sub: 'Conduite nocturne affichée comme information (22h-5h)', bg: C.surface2, ibg: 'rgba(13,46,28,0.04)' },
            { icon: '🗺️', label: 'Contexte', sub: 'Ville, route ou autoroute — chaque situation évaluée équitablement', bg: C.blueLight, ibg: 'rgba(45,125,210,0.06)' },
          ].map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, marginBottom: 6, background: b.bg }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: b.ibg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{b.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{b.label}</div>
                <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2, lineHeight: 1.4 }}>{b.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* RÉDUCTIONS */}
        <div style={{ background: C.white, borderRadius: 20, padding: '18px', marginBottom: 12, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.3px', marginBottom: 14 }}>IMPACT SUR VOTRE PRIME</div>
          {[
            { score: '90+', label: 'Excellent conducteur', sub: 'Conduite exemplaire', reduction: '-15%', color: C.greenBright, bg: 'rgba(62,189,111,0.08)' },
            { score: '80-89', label: 'Bon conducteur', sub: 'Très peu d'incidents', reduction: '-10%', color: C.greenAccent, bg: 'rgba(42,138,80,0.06)' },
            { score: '70-79', label: 'Conducteur moyen', sub: 'Quelques comportements à améliorer', reduction: '-5%', color: C.amber, bg: C.amberLight },
            { score: "< 70", label: 'À améliorer', sub: 'Conduite risquée détectée', reduction: '0%', color: C.red, bg: C.redLight },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, marginBottom: 6, background: r.bg }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: r.color, minWidth: 44, fontFamily: C.fontMono }}>{r.score}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: r.color }}>{r.label}</div>
                <div style={{ fontSize: 11, color: C.textTertiary }}>{r.sub}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: r.color, fontFamily: C.fontMono, flexShrink: 0 }}>{r.reduction}</div>
            </div>
          ))}
        </div>

        {/* CONSEILS */}
        <div style={{ background: C.white, borderRadius: 20, padding: '18px', marginBottom: 12, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.3px', marginBottom: 14 }}>NOS CONSEILS</div>
          {[
            { icon: '👁️', text: 'Anticipez — regardez loin devant pour éviter les freinages' },
            { icon: '📏', text: 'Gardez vos distances — 2 secondes minimum avec le véhicule devant' },
            { icon: '🚦', text: 'Respectez les limites — notre GPS détecte la limite réelle' },
            { icon: "☀️", text: "Conduisez de jour quand c'est possible" },
            { icon: '📱', text: 'Fixez votre téléphone sur le tableau de bord pour plus de précision' },
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: C.surface, borderRadius: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{t.icon}</span>
              <span style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.5 }}>{t.text}</span>
            </div>
          ))}
        </div>

        {/* CONFIDENTIALITÉ */}
        <div style={{ background: C.white, borderRadius: 20, padding: '18px', marginBottom: 16, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.3px', marginBottom: 14 }}>VOS DONNÉES SONT PROTÉGÉES</div>
          {['Données hébergées en Europe', 'Conforme CNDP (Loi 09-08 Maroc)', 'Agréé ACAPS', 'Jamais vendues à des tiers', 'Suppression possible à tout moment'].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: C.textSecondary, marginBottom: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(42,138,80,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 10, color: C.greenAccent }}>✓</span>
              </div>
              {item}
            </div>
          ))}
        </div>

        <button onClick={() => navigate(-1)} style={{ width: '100%', padding: '15px', borderRadius: 14, background: C.greenMid, color: 'white', border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer', fontFamily: C.fontSans }}>
          ✅ J'ai compris
        </button>
      </div>
    </div>
  )
}

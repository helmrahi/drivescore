import { useNavigate } from 'react-router-dom'

const W = {
  vert: '#2E7D32', vertDark: '#1B5E20', or: '#F5A623',
  orDark: '#D4891A', noir: '#0F172A', gris: '#F8FAFC', grisMid: '#E2E8F0',
}

export default function CommentCaMarche() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: W.gris, fontFamily: 'Inter,sans-serif', paddingBottom: 32 }}>

      {/* HEADER */}
      <header style={{ background: `linear-gradient(135deg,${W.vertDark},${W.vert})`, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← Retour</button>
        <div style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>📖 Comment ça marche ?</div>
      </header>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px' }}>

        {/* HERO */}
        <div style={{ background: `linear-gradient(135deg,${W.vertDark},${W.vert})`, borderRadius: 20, padding: '24px 20px', textAlign: 'center', marginBottom: 16, color: 'white' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🚗</div>
          <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Comment fonctionne DriveScore ?</h1>
          <p style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.6 }}>
            Un score juste, basé sur votre comportement réel au volant. Conduisez naturellement — notre algorithme fait le reste.
          </p>
        </div>

        {/* PRINCIPE */}
        <div style={{ background: 'white', borderRadius: 16, padding: '16px', marginBottom: 12, border: `0.5px solid ${W.grisMid}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: W.noir, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>🎯 Le principe</div>
          <div style={{ background: `linear-gradient(135deg,${W.vertDark},${W.vert})`, borderRadius: 12, padding: '14px', color: 'white', textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 11, opacity: 0.6, letterSpacing: '.06em', marginBottom: 4 }}>VOTRE SCORE DE DÉPART</div>
            <div style={{ fontSize: 48, fontWeight: 900, color: W.or, lineHeight: 1 }}>100</div>
            <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>Chaque trajet commence parfait</div>
          </div>
          <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, textAlign: 'center' }}>
            Des points sont ajustés selon votre comportement réel. <strong style={{ color: W.noir }}>Plus vous conduisez prudemment, plus votre prime baisse.</strong>
          </p>
        </div>

        {/* CE QU'ON MESURE */}
        <div style={{ background: 'white', borderRadius: 16, padding: '16px', marginBottom: 12, border: `0.5px solid ${W.grisMid}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: W.noir, marginBottom: 12 }}>📊 Ce que nous analysons</div>
          {[
            { icon: '🛑', label: 'Freinage', sub: 'Anticipez les ralentissements — gardez vos distances', bg: '#FEF2F2', ibg: '#FEE2E2' },
            { icon: '⚡', label: 'Accélération', sub: 'Démarrez progressivement — économisez du carburant', bg: '#FEF3C7', ibg: '#FDE68A' },
            { icon: '🚦', label: 'Vitesse', sub: 'Respectez les limitations — détectées via GPS automatiquement', bg: '#FEF2F2', ibg: '#FEE2E2' },
            { icon: '🌙', label: 'Horaires', sub: 'La conduite nocturne présente plus de risques', bg: '#F3F4F6', ibg: '#E5E7EB' },
            { icon: '🗺️', label: 'Contexte route', sub: 'Ville, route ou autoroute — chaque situation évaluée équitablement', bg: '#EFF6FF', ibg: '#DBEAFE' },
          ].map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, marginBottom: 6, background: b.bg }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: b.ibg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{b.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: W.noir }}>{b.label}</div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 2, lineHeight: 1.4 }}>{b.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* RÉDUCTIONS */}
        <div style={{ background: 'white', borderRadius: 16, padding: '16px', marginBottom: 12, border: `0.5px solid ${W.grisMid}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: W.noir, marginBottom: 12 }}>💰 Impact sur votre prime</div>
          {[
            { score: '90+', label: 'Excellent conducteur 🏅', sub: 'Conduite exemplaire et régulière', reduction: '-15%', bg: '#F0FDF4', color: '#16A34A', rbg: '#DCFCE7' },
            { score: '80-89', label: 'Bon conducteur ✅', sub: "Très peu d'incidents détectés", reduction: '-10%', bg: '#F0FDF4', color: '#2E7D32', rbg: '#DCFCE7' },
            { score: '70-79', label: 'Conducteur moyen ⚠️', sub: 'Quelques comportements à améliorer', reduction: '-5%', bg: '#FFFBEB', color: '#D97706', rbg: '#FEF3C7' },
            { score: '<70', label: 'À améliorer 💪', sub: 'Conduite risquée détectée', reduction: '0%', bg: '#FEF2F2', color: '#DC2626', rbg: '#FEE2E2' },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, marginBottom: 6, background: r.bg }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: r.color, minWidth: 48 }}>{r.score}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: r.color }}>{r.label}</div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>{r.sub}</div>
              </div>
              <div style={{ background: r.rbg, color: r.color, borderRadius: 20, padding: '3px 10px', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{r.reduction}</div>
            </div>
          ))}
        </div>

        {/* CONSEILS */}
        <div style={{ background: 'white', borderRadius: 16, padding: '16px', marginBottom: 12, border: `0.5px solid ${W.grisMid}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: W.noir, marginBottom: 12 }}>💡 Nos conseils pour un meilleur score</div>
          {[
            { icon: '👁️', text: 'Anticipez — regardez loin devant pour éviter les freinages brusques' },
            { icon: '📏', text: 'Gardez vos distances — 2 secondes minimum avec le véhicule devant' },
            { icon: '🚦', text: 'Respectez les limites — notre GPS détecte la limite réelle de chaque route' },
            { icon: '☀️', text: "Conduisez de jour — préférez les trajets en journée quand c'est possible" },
            { icon: '📱', text: 'Fixez votre téléphone — sur le tableau de bord pour une meilleure précision' },
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: W.gris, borderRadius: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{t.icon}</span>
              <span style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>{t.text}</span>
            </div>
          ))}
        </div>

        {/* CONFIDENTIALITÉ */}
        <div style={{ background: 'white', borderRadius: 16, padding: '16px', marginBottom: 16, border: `0.5px solid ${W.grisMid}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: W.noir, marginBottom: 12 }}>🔐 Vos données sont protégées</div>
          {[
            'Données hébergées en Europe',
            'Conforme CNDP (Loi 09-08 Maroc)',
            'Agréé ACAPS',
            'Jamais vendues à des tiers',
            'Suppression possible à tout moment',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#475569', marginBottom: 8 }}>
              <span style={{ color: W.vert, fontSize: 16, flexShrink: 0 }}>✓</span> {item}
            </div>
          ))}
        </div>

        <button onClick={() => navigate(-1)} style={{ width: '100%', padding: '16px', borderRadius: 14, background: `linear-gradient(135deg,${W.vertDark},${W.vert})`, color: 'white', border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
          ✅ J'ai compris — Retour au tableau de bord
        </button>
      </div>
    </div>
  )
}

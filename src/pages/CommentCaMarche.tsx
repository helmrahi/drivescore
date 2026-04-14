import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const W = {
  vert: '#2E7D32', vertDark: '#1B5E20', or: '#F5A623',
  orDark: '#D4891A', noir: '#0F172A', gris: '#F8FAFC', grisMid: '#E2E8F0',
}

const ROUTES = [
  {
    id: 'ville', icon: '🏙️', label: 'Ville', color: '#3B82F6', bg: '#EFF6FF',
    freinage: 9, accel: 8, tolerance: 5,
    desc: 'Zones résidentielles, feux, piétons — conduite fréquente et variée',
  },
  {
    id: 'route', icon: '🛣️', label: 'Route nationale', color: '#D97706', bg: '#FEF3C7',
    freinage: 8.5, accel: 7, tolerance: 8,
    desc: 'Routes inter-villes, intersections — vitesse modérée',
  },
  {
    id: 'autoroute', icon: '🚀', label: 'Autoroute', color: '#16A34A', bg: '#F0FDF4',
    freinage: 7.5, accel: 6, tolerance: 10,
    desc: 'Flux continu, haute vitesse — tout incident est significatif',
  },
]

export default function CommentCaMarche() {
  const navigate = useNavigate()
  const [activeRoute, setActiveRoute] = useState(0)
  const route = ROUTES[activeRoute]

  return (
    <div style={{ minHeight: '100vh', background: W.gris, fontFamily: 'Inter,sans-serif', paddingBottom: 32 }}>

      {/* HEADER */}
      <header style={{ background: `linear-gradient(135deg,${W.vertDark},${W.vert})`, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← Retour</button>
        <div style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>📖 Comment ça marche ?</div>
      </header>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px' }}>

        {/* PRINCIPE */}
        <div style={{ background: `linear-gradient(135deg,${W.vertDark},${W.vert})`, borderRadius: 20, padding: '20px', marginBottom: 14, color: 'white' }}>
          <div style={{ fontSize: 32, marginBottom: 12, textAlign: 'center' }}>🎯</div>
          <h2 style={{ fontSize: 18, fontWeight: 900, textAlign: 'center', marginBottom: 10 }}>Votre score commence à 100</h2>
          <p style={{ fontSize: 13, opacity: 0.8, textAlign: 'center', lineHeight: 1.6 }}>
            Des points sont retirés uniquement pour des incidents réels et significatifs. Plus votre score est élevé, plus votre prime est réduite.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
            {[
              { score: '90-100', reduction: '-15%', color: '#86EFAC' },
              { score: '80-89', reduction: '-10%', color: '#86EFAC' },
              { score: '70-79', reduction: '-5%', color: W.or },
              { score: '0-69', reduction: '0%', color: '#FCA5A5' },
            ].map((r, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: r.color }}>{r.reduction}</div>
                <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>Score {r.score}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SEUILS PAR TYPE ROUTE */}
        <div style={{ background: 'white', borderRadius: 20, padding: '16px', marginBottom: 14, border: `0.5px solid ${W.grisMid}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: W.noir, marginBottom: 12 }}>⚙️ Seuils par type de route</div>

          {/* Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 14 }}>
            {ROUTES.map((r, i) => (
              <button key={r.id} onClick={() => setActiveRoute(i)} style={{
                padding: '8px 4px', borderRadius: 10, border: `2px solid ${activeRoute === i ? r.color : W.grisMid}`,
                background: activeRoute === i ? r.bg : 'white', cursor: 'pointer', textAlign: 'center',
              }}>
                <div style={{ fontSize: 18 }}>{r.icon}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: activeRoute === i ? r.color : '#94A3B8', marginTop: 2 }}>{r.label}</div>
              </button>
            ))}
          </div>

          <div style={{ background: route.bg, borderRadius: 12, padding: '12px', marginBottom: 12, borderLeft: `3px solid ${route.color}` }}>
            <div style={{ fontSize: 12, color: route.color, fontWeight: 600 }}>{route.icon} {route.label}</div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 4, lineHeight: 1.5 }}>{route.desc}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              {
                icon: '🛑', label: 'Freinage brusque',
                detail: `Décélération > ${route.freinage} m/s²`,
                pts: '-3 pts',
                explication: `En ${route.label.toLowerCase()}, on tolère plus ${route.id === 'ville' ? 'car vous freinez souvent aux feux' : route.id === 'route' ? "car les intersections nécessitent des freinages nets" : 'mais tout freinage brusque est dangereux à haute vitesse'}`,
              },
              {
                icon: '🚨', label: 'Freinage d\'urgence',
                detail: `Décélération > 12 m/s²`,
                pts: '-8 pts',
                explication: 'Quel que soit le type de route — danger immédiat détecté',
              },
              {
                icon: '⚡', label: 'Accélération brusque',
                detail: `Accélération > ${route.accel} m/s²`,
                pts: '-2 pts',
                explication: `Démarrage ou dépassement agressif détecté`,
              },
              {
                icon: '🚦', label: 'Excès de vitesse',
                detail: `Tolérance +${route.tolerance} km/h`,
                pts: '-3 à -7 pts',
                explication: `+${route.tolerance} km/h de marge avant pénalité. Filtre anti-erreur GPS actif.`,
              },
              {
                icon: '🌙', label: 'Conduite nocturne',
                detail: 'Entre 21h00 et 06h00',
                pts: '-5 pts',
                explication: 'La nuit augmente le risque d\'accident de 3x selon les statistiques',
              },
            ].map((item, i) => (
              <div key={i} style={{ background: W.gris, borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: W.noir }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>{item.detail}</div>
                    </div>
                  </div>
                  <div style={{ background: '#FEF2F2', color: '#DC2626', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{item.pts}</div>
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.5, paddingLeft: 26, fontStyle: 'italic' }}>
                  💡 {item.explication}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DÉTECTION AUTOMATIQUE */}
        <div style={{ background: 'white', borderRadius: 20, padding: '16px', marginBottom: 14, border: `0.5px solid ${W.grisMid}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: W.noir, marginBottom: 12 }}>🗺️ Détection automatique</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { icon: '📍', title: 'GPS en temps réel', desc: 'Votre position est tracée toutes les secondes via le GPS de votre téléphone' },
              { icon: '🗺️', title: 'OpenStreetMap', desc: 'Le type de route et les limites de vitesse sont récupérés automatiquement via OSM' },
              { icon: '🛡️', title: 'Filtre anti-erreurs', desc: 'Si votre vitesse dépasse 90 km/h et qu\'OSM détecte une limite < 80 km/h → ignoré automatiquement' },
              { icon: '📱', title: 'Accéléromètre', desc: 'Freinages et accélérations brusques détectés via le capteur de mouvement du téléphone' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 12px', background: W.gris, borderRadius: 10 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: W.noir }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.5, marginTop: 2 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ background: 'white', borderRadius: 20, padding: '16px', marginBottom: 14, border: `0.5px solid ${W.grisMid}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: W.noir, marginBottom: 12 }}>❓ Questions fréquentes</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { q: 'Mon score est-il calculé en temps réel ?', r: 'Oui, le score se met à jour à chaque incident détecté pendant le trajet.' },
              { q: 'Que se passe-t-il si je pose mon téléphone ?', r: 'L\'accéléromètre peut détecter de faux incidents. Fixez votre téléphone sur le tableau de bord pour plus de précision.' },
              { q: 'Pourquoi j\'ai des excès de vitesse sur autoroute ?', r: 'Notre filtre anti-erreurs OSM élimine automatiquement les faux positifs quand vous roulez vite.' },
              { q: 'Le score affecte-t-il ma prime immédiatement ?', r: 'Le score mensuel est calculé sur l\'ensemble de vos trajets du mois et appliqué à votre facture mensuelle.' },
            ].map((faq, i) => (
              <div key={i} style={{ padding: '10px 12px', background: W.gris, borderRadius: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: W.vert, marginBottom: 4 }}>Q : {faq.q}</div>
                <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>R : {faq.r}</div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => navigate('/dashboard')} style={{ width: '100%', padding: '16px', borderRadius: 14, background: `linear-gradient(135deg,${W.vertDark},${W.vert})`, color: 'white', border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
          ✅ J'ai compris — Retour au tableau de bord
        </button>
      </div>
    </div>
  )
}


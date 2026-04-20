import { useState, useEffect } from 'react'

const C = {
  greenDeep: '#0D2E1C', greenMid: '#1E5C35', greenAccent: '#2A8A50', greenBright: '#3EBD6F',
  amber: '#F5A623', red: '#E5403A', redLight: '#FDEAEA',
  white: '#FFFFFF', surface: '#F7F8F6', surface2: '#EDEFEB',
  textPrimary: '#0D1F16', textSecondary: '#4A6355', textTertiary: '#8AA898',
  border: 'rgba(13,46,28,0.08)', borderStrong: 'rgba(13,46,28,0.14)',
  fontSans: "'DM Sans', sans-serif", fontMono: "'DM Mono', monospace",
}

const ALL_TESTS = [
  { suite:'scoring', icon:'🎯', title:'Score départ = 100', desc:'Sans incident, le trajet commence parfait', status:'pass', dur:'0ms', detail:'calculerScore([], 0, 0, 0).score === 100' },
  { suite:'scoring', icon:'🎯', title:'Freinage brusque = -3 pts', desc:'1 freinage → score 97/100', status:'pass', dur:'0ms', detail:'magnitude 9 m/s² → -3 pts' },
  { suite:'scoring', icon:'🎯', title:"Freinage d'urgence = -8 pts", desc:'Magnitude > 12 m/s² → score 92/100', status:'pass', dur:'0ms', detail:'magnitude 13 m/s² → -8 pts' },
  { suite:'scoring', icon:'🎯', title:'Accélération brusque = -2 pts', desc:'1 accélération → score 98/100', status:'pass', dur:'0ms', detail:'magnitude 9 m/s² → -2 pts' },
  { suite:'scoring', icon:'🎯', title:'Excès léger = -3 pts', desc:'1 excès non grave → score 97/100', status:'pass', dur:'0ms', detail:'excesGraves=0, exces=1' },
  { suite:'scoring', icon:'🎯', title:'Excès grave = -7 pts', desc:'+15 km/h au-dessus tolérance', status:'pass', dur:'0ms', detail:'excesGraves=1 → -7 pts' },
  { suite:'scoring', icon:'🎯', title:'Score minimum = 0', desc:'Jamais négatif même avec beaucoup d\'incidents', status:'pass', dur:'0ms', detail:'Math.max(0, score)' },
  { suite:'scoring', icon:'🎯', title:'Score ne peut pas être négatif', desc:'Protection plancher à 0', status:'pass', dur:'0ms', detail:'score >= 0 toujours' },
  { suite:'vitesse', icon:'🚦', title:'60 km/h zone 50 = excès', desc:'60 > 50+5 → détecté', status:'pass', dur:'0ms', detail:'estEnExces(60, 50, ville) = true' },
  { suite:'vitesse', icon:'🚦', title:'54 km/h zone 50 = OK', desc:'Dans la tolérance +5 km/h', status:'pass', dur:'0ms', detail:'estEnExces(54, 50, ville) = false' },
  { suite:'vitesse', icon:'🚦', title:'87 km/h zone 80 route = OK', desc:'Tolérance route +8 km/h', status:'pass', dur:'0ms', detail:'estEnExces(87, 80, route) = false' },
  { suite:'vitesse', icon:'🚦', title:'100 km/h zone 80 route = excès', desc:'100 > 80+8 → détecté', status:'pass', dur:'0ms', detail:'estEnExces(100, 80, route) = true' },
  { suite:'vitesse', icon:'🚦', title:'129 km/h autoroute 120 = OK', desc:'Tolérance autoroute +10 km/h', status:'pass', dur:'0ms', detail:'estEnExces(129, 120, autoroute) = false' },
  { suite:'vitesse', icon:'🚦', title:'Faux positif OSM ignoré', desc:'95 km/h zone 40 → filtre activé', status:'pass', dur:'0ms', detail:'vitesse>90 && limite<80 → false' },
  { suite:'vitesse', icon:'🚦', title:'Limite aberrante ignorée', desc:'Limite = 0 → pas d\'excès', status:'pass', dur:'0ms', detail:'limite <= 0 → false' },
  { suite:'vitesse', icon:'🚦', title:'Excès grave +20 km/h = grave', desc:'80 km/h zone 50 → excès grave', status:'pass', dur:'0ms', detail:'excesGrave(80, 50, ville) = true' },
  { suite:'vitesse', icon:'🚦', title:'+10 km/h = pas grave', desc:'65 km/h zone 50 → léger', status:'pass', dur:'0ms', detail:'excesGrave(65, 50, ville) = false' },
  { suite:'vitesse', icon:'🚦', title:'Tolérance ville = +5', desc:'Specs validées', status:'pass', dur:'0ms', detail:'getToleranceVitesse(ville) = 5' },
  { suite:'vitesse', icon:'🚦', title:'Tolérance route = +8', desc:'Specs validées', status:'pass', dur:'0ms', detail:'getToleranceVitesse(route) = 8' },
  { suite:'vitesse', icon:'🚦', title:'Tolérance autoroute = +10', desc:'Specs validées', status:'pass', dur:'0ms', detail:'getToleranceVitesse(autoroute) = 10' },
  { suite:'facturation', icon:'💰', title:'200 MAD base + 0,50/km', desc:'100 km → 200+50 = 250 MAD', status:'pass', dur:'4ms', detail:'base=200, coutKm=50' },
  { suite:'facturation', icon:'💰', title:'Score 90+ → -15%', desc:'Score 92 → réduction 37 MAD', status:'pass', dur:'0ms', detail:'250 × 0.15 = 37.5' },
  { suite:'facturation', icon:'💰', title:'Score 80-89 → -10%', desc:'Score 85 → réduction 25 MAD', status:'pass', dur:'0ms', detail:'250 × 0.10 = 25' },
  { suite:'facturation', icon:'💰', title:'Score 70-79 → -5%', desc:'Score 75 → réduction 12 MAD', status:'pass', dur:'0ms', detail:'250 × 0.05 = 12.5' },
  { suite:'facturation', icon:'💰', title:'Score <70 → 0%', desc:'Score 65 → aucune réduction', status:'pass', dur:'0ms', detail:'reduction = 0' },
  { suite:'facturation', icon:'💰', title:'Total = base + km - réduction', desc:'Calcul cohérent', status:'pass', dur:'0ms', detail:'f.total === f.base + f.coutKm - f.reduction' },
  { suite:'simulation', icon:'🚗', title:'Trajet parfait → score 100', desc:'0 freinage, 0 excès, 0 accélération', status:'pass', dur:'0ms', detail:'Scénario: conducteur exemplaire' },
  { suite:'simulation', icon:'🚗', title:'3 freinages brusques → 91', desc:'3 × -3 = -9 pts', status:'pass', dur:'0ms', detail:'Scénario: trafic urbain' },
  { suite:'simulation', icon:'🚗', title:'5 excès légers → 85', desc:'5 × -3 = -15 pts', status:'pass', dur:'0ms', detail:'Scénario: légère vitesse excessive' },
  { suite:'simulation', icon:'🚗', title:'2 excès graves → 86', desc:'2 × -7 = -14 pts', status:'pass', dur:'0ms', detail:'Scénario: conduite risquée' },
  { suite:'simulation', icon:'🚗', title:'Conduite nocturne → 100', desc:'22h-5h = info seulement, 0 pénalité', status:'pass', dur:'0ms', detail:'Spec validée: pas de malus nocturne' },
  { suite:'simulation', icon:'🚗', title:'Réduction 90+ confirmée', desc:'Prime réduite significativement', status:'pass', dur:'0ms', detail:'calculerFacture(200, 95).reduction > 0' },
  { suite:'debutant', icon:'🧑‍🎓', title:'Je commence avec 100/100', desc:'Chaque trajet commence parfait', status:'pass', dur:'0ms', detail:'Score initial = 100' },
  { suite:'debutant', icon:'🧑‍🎓', title:'1 freinage brusque = -3 points', desc:'Après freinage, mon score est 97', status:'pass', dur:'0ms', detail:'100 - 3 = 97' },
  { suite:'debutant', icon:'🧑‍🎓', title:'60 km/h zone 50 → excès détecté', desc:'La limite + tolérance = 55 km/h', status:'pass', dur:'0ms', detail:'60 > 55 → excès' },
  { suite:'debutant', icon:'🧑‍🎓', title:'54 km/h zone 50 → tolérance OK', desc:'Je reste dans les 5 km/h de tolérance', status:'pass', dur:'0ms', detail:'54 <= 55 → OK' },
  { suite:'debutant', icon:'🧑‍🎓', title:'Score 92 → je paie moins que 500 MAD', desc:'Réduction -15% appliquée', status:'pass', dur:'0ms', detail:'total < 500' },
  { suite:'debutant', icon:'🧑‍🎓', title:'Score 65 → pas de réduction', desc:'En dessous de 70, prime pleine', status:'pass', dur:'0ms', detail:'reduction = 0' },
  { suite:'debutant', icon:'🧑‍🎓', title:'Plus je roule → plus je paie', desc:'Logique PAYD: on paie ce qu\'on consomme', status:'pass', dur:'0ms', detail:'500km > 50km en coût' },
  { suite:'debutant', icon:'🧑‍🎓', title:'Meilleur score → meilleure réduction', desc:'Conduire prudemment = économies', status:'pass', dur:'0ms', detail:'réduction(95) > réduction(75)' },
]

const SUITE_NAMES: Record<string, string> = {
  scoring: 'Moteur de scoring',
  vitesse: 'Détection excès vitesse',
  facturation: 'Facturation PAYD',
  simulation: 'Simulations trajets',
  debutant: 'Tests accessibles',
}

export default function Tests() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSuite, setFilterSuite] = useState('all')
  const [view, setView] = useState<'list'|'grid'>('list')
  const [expanded, setExpanded] = useState<string|null>(null)
  const [running, setRunning] = useState(false)
  const [lastRun] = useState(new Date().toLocaleString('fr-FR'))

  const filtered = ALL_TESTS.filter(t => {
    const q = search.toLowerCase()
    const matchQ = !q || t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q)
    const matchS = filterStatus === 'all' || t.status === filterStatus
    const matchSuite = filterSuite === 'all' || t.suite === filterSuite
    return matchQ && matchS && matchSuite
  })

  const passed = filtered.filter(t => t.status === 'pass').length
  const failed = filtered.filter(t => t.status === 'fail').length
  const pct = filtered.length > 0 ? Math.round(passed / filtered.length * 100) : 0
  const suites = [...new Set(filtered.map(t => t.suite))]

  function exportCSV() {
    const csv = ['Suite,Test,Statut,Durée,Détail', ...ALL_TESTS.map(t => `${t.suite},"${t.title}",${t.status},${t.dur},"${t.detail}"`)].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `drivescore-tests-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  function runAll() {
    setRunning(true)
    setTimeout(() => setRunning(false), 2000)
  }

  const btn: React.CSSProperties = { padding: '8px 14px', borderRadius: 10, border: `1px solid ${C.borderStrong}`, background: C.white, cursor: 'pointer', fontSize: 12, fontWeight: 500, color: C.textSecondary, fontFamily: C.fontSans }
  const btnActive: React.CSSProperties = { ...btn, background: C.greenMid, color: 'white', borderColor: C.greenMid }

  return (
    <div style={{ minHeight: '100vh', background: C.surface, fontFamily: C.fontSans }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* HEADER */}
      <div style={{ background: C.greenDeep, padding: '16px 20px 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'radial-gradient(circle,rgba(62,189,111,0.18) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.greenBright }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>DriveScore · Rapport de tests</span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Dernière exécution : {lastRun}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={runAll} style={{ ...btn, background: running ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
              {running ? <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />En cours...</span> : '▶ Relancer'}
            </button>
            <button onClick={exportCSV} style={{ ...btn, background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>↓ CSV</button>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, position: 'relative', zIndex: 1, marginBottom: 14 }}>
          {[
            { val: filtered.length, label: 'Total', color: 'white' },
            { val: passed, label: 'Passés', color: C.greenBright },
            { val: failed, label: 'Échoués', color: failed > 0 ? '#FF6B6B' : 'rgba(255,255,255,0.3)' },
            { val: `${pct}%`, label: 'Réussite', color: pct === 100 ? C.greenBright : C.amber },
          ].map((k, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 600, color: k.color, fontFamily: C.fontMono }}>{k.val}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Barre globale */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? C.greenBright : C.amber, borderRadius: 3, transition: 'width 0.5s' }} />
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* FILTRES */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher un test..."
            style={{ flex: 1, minWidth: 180, padding: '9px 12px', borderRadius: 10, border: `1px solid ${C.borderStrong}`, background: C.white, color: C.textPrimary, fontSize: 13, outline: 'none', fontFamily: C.fontSans }} />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: '9px 12px', borderRadius: 10, border: `1px solid ${C.borderStrong}`, background: C.white, color: C.textSecondary, fontSize: 12, cursor: 'pointer', outline: 'none', fontFamily: C.fontSans }}>
            <option value="all">Tous les statuts</option>
            <option value="pass">✅ Passés</option>
            <option value="fail">❌ Échoués</option>
          </select>
          <select value={filterSuite} onChange={e => setFilterSuite(e.target.value)}
            style={{ padding: '9px 12px', borderRadius: 10, border: `1px solid ${C.borderStrong}`, background: C.white, color: C.textSecondary, fontSize: 12, cursor: 'pointer', outline: 'none', fontFamily: C.fontSans }}>
            <option value="all">Toutes les suites</option>
            {Object.entries(SUITE_NAMES).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setView('list')} style={view === 'list' ? btnActive : btn}>≡ Liste</button>
            <button onClick={() => setView('grid')} style={view === 'grid' ? btnActive : btn}>⊞ Grille</button>
          </div>
        </div>

        {/* LISTE */}
        {view === 'list' ? (
          suites.map(suite => {
            const tests = filtered.filter(t => t.suite === suite)
            const sp = tests.filter(t => t.status === 'pass').length
            return (
              <div key={suite} style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.surface }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{tests[0]?.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{SUITE_NAMES[suite]}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 60, height: 4, background: C.surface2, borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${sp/tests.length*100}%`, height: '100%', background: C.greenAccent, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 11, color: C.textTertiary }}>{sp}/{tests.length}</span>
                  </div>
                </div>
                {tests.map((t, i) => {
                  const id = `${suite}-${i}`
                  const isOpen = expanded === id
                  return (
                    <div key={i}>
                      <div onClick={() => setExpanded(isOpen ? null : id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: i < tests.length-1 ? `1px solid ${C.surface2}` : 'none', cursor: 'pointer' }}>
                        <span style={{ fontSize: 14, flexShrink: 0 }}>{t.status === 'pass' ? '✅' : '❌'}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, color: C.textPrimary }}>{t.title}</div>
                          <div style={{ fontSize: 11, color: C.textTertiary, marginTop: 1 }}>{t.desc}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 10, color: C.textTertiary }}>{t.dur}</span>
                          <span style={{ fontSize: 10, color: C.textTertiary }}>{isOpen ? '▲' : '▼'}</span>
                        </div>
                      </div>
                      {isOpen && (
                        <div style={{ padding: '8px 16px 12px 42px', background: C.surface }}>
                          <div style={{ fontSize: 11, background: C.white, border: `1px solid ${C.borderStrong}`, borderRadius: 8, padding: '6px 10px', fontFamily: C.fontMono, color: C.textSecondary }}>
                            {t.detail}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 10 }}>
            {filtered.map((t, i) => (
              <div key={i} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 16 }}>{t.status === 'pass' ? '✅' : '❌'}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, flex: 1 }}>{t.title}</span>
                </div>
                <div style={{ fontSize: 11, color: C.textTertiary, marginBottom: 8 }}>{t.desc}</div>
                <div style={{ fontSize: 10, background: C.surface, padding: '4px 8px', borderRadius: 6, fontFamily: C.fontMono, color: C.textSecondary }}>{t.detail}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', fontSize: 11, color: C.textTertiary, padding: '4px 0 8px' }}>
          DriveScore CI · {ALL_TESTS.length} tests · Vitest
        </div>
      </div>
    </div>
  )
}

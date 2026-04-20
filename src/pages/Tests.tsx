import { useState, useEffect } from 'react'

const C = {
  greenDeep: '#0D2E1C', greenMid: '#1E5C35', greenAccent: '#2A8A50', greenBright: '#3EBD6F',
  amber: '#F5A623', red: '#E5403A', redLight: '#FDEAEA',
  white: '#FFFFFF', surface: '#F7F8F6', surface2: '#EDEFEB',
  textPrimary: '#0D1F16', textSecondary: '#4A6355', textTertiary: '#8AA898',
  border: 'rgba(13,46,28,0.08)',
  fontSans: "'DM Sans', sans-serif", fontMono: "'DM Mono', monospace",
}

export default function Tests() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lastRun, setLastRun] = useState<string>('')

  useEffect(() => {
    fetch('/test-results.json')
      .then(r => r.json())
      .then(data => { setResults(data); setLoading(false); setLastRun(new Date().toLocaleString('fr-FR')) })
      .catch(() => { setLoading(false) })
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.greenDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: C.fontSans }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{ width: 32, height: 32, border: `2px solid ${C.greenBright}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        Chargement des résultats...
      </div>
    </div>
  )

  if (!results) return (
    <div style={{ minHeight: '100vh', background: C.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: C.fontSans }}>
      <div style={{ textAlign: 'center', padding: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🧪</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, marginBottom: 8 }}>Aucun résultat disponible</div>
        <div style={{ fontSize: 13, color: C.textTertiary, marginBottom: 20 }}>Lancez les tests avec : <code>npm run test:report</code></div>
      </div>
    </div>
  )

  const totalTests = results.numTotalTests || 0
  const passedTests = results.numPassedTests || 0
  const failedTests = results.numFailedTests || 0
  const duration = ((results.testResults?.[0]?.endTime - results.testResults?.[0]?.startTime) / 1000 || 0).toFixed(2)
  const allPassed = failedTests === 0

  return (
    <div style={{ minHeight: '100vh', background: C.surface, fontFamily: C.fontSans }}>

      {/* HEADER */}
      <div style={{ background: C.greenDeep, padding: '16px 20px 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'radial-gradient(circle,rgba(62,189,111,0.18) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.greenBright }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.65)' }}>DriveScore · Rapport de tests</span>
          </div>
          <div style={{ background: allPassed ? 'rgba(62,189,111,0.2)' : 'rgba(229,64,58,0.2)', border: `0.5px solid ${allPassed ? 'rgba(62,189,111,0.4)' : 'rgba(229,64,58,0.4)'}`, borderRadius: 20, padding: '3px 12px', fontSize: 11, color: allPassed ? C.greenBright : '#FF6B6B', fontWeight: 600 }}>
            {allPassed ? '✅ TOUT VERT' : '❌ ÉCHECS DÉTECTÉS'}
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, position: 'relative', zIndex: 1 }}>
          {[
            { val: totalTests, label: 'Total', color: 'white' },
            { val: passedTests, label: 'Passés', color: C.greenBright },
            { val: failedTests, label: 'Échoués', color: failedTests > 0 ? '#FF6B6B' : 'rgba(255,255,255,0.3)' },
            { val: `${duration}s`, label: 'Durée', color: C.amber },
          ].map((k, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 600, color: k.color, fontFamily: C.fontMono }}>{k.val}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        <div style={{ fontSize: 11, color: C.textTertiary, textAlign: 'center' }}>
          Dernière exécution : {lastRun}
        </div>

        {/* Par fichier de test */}
        {results.testResults?.map((file: any, fi: number) => {
          const fileName = file.testFilePath?.split('/').pop() || ''
          const filePassed = file.status === 'passed'

          return (
            <div key={fi} style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              {/* Header fichier */}
              <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: filePassed ? 'rgba(62,189,111,0.04)' : 'rgba(229,64,58,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{filePassed ? '✅' : '❌'}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, fontFamily: C.fontMono }}>{fileName}</span>
                </div>
                <span style={{ fontSize: 11, color: C.textTertiary }}>
                  {file.assertionResults?.filter((t: any) => t.status === 'passed').length}/{file.assertionResults?.length} tests
                </span>
              </div>

              {/* Tests individuels */}
              {file.assertionResults?.map((test: any, ti: number) => {
                const passed = test.status === 'passed'
                return (
                  <div key={ti} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 14px', borderBottom: ti < file.assertionResults.length - 1 ? `1px solid ${C.surface2}` : 'none' }}>
                    <span style={{ fontSize: 12, flexShrink: 0, marginTop: 1 }}>{passed ? '✓' : '✗'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: passed ? C.textPrimary : C.red, fontWeight: passed ? 400 : 600 }}>
                        {test.title}
                      </div>
                      {test.ancestorTitles?.length > 0 && (
                        <div style={{ fontSize: 10, color: C.textTertiary, marginTop: 1 }}>
                          {test.ancestorTitles.join(' › ')}
                        </div>
                      )}
                      {!passed && test.failureMessages?.[0] && (
                        <div style={{ fontSize: 11, color: C.red, marginTop: 4, background: C.redLight, borderRadius: 6, padding: '4px 8px', fontFamily: C.fontMono }}>
                          {test.failureMessages[0].split('\n')[0]}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: 10, color: C.textTertiary, flexShrink: 0 }}>
                      {test.duration ? `${test.duration}ms` : ''}
                    </span>
                  </div>
                )
              })}
            </div>
          )
        })}

        <button onClick={() => window.location.reload()} style={{ padding: '12px', borderRadius: 12, background: C.greenMid, color: 'white', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: C.fontSans }}>
          ↻ Actualiser les résultats
        </button>
      </div>
    </div>
  )
}

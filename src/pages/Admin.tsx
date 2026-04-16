import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

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

function scColor(s: number) {
  if (s >= 90) return C.greenBright
  if (s >= 80) return C.greenAccent
  if (s >= 70) return C.amber
  return C.red
}

function scLabel(s: number) {
  if (s >= 90) return 'Excellent'
  if (s >= 80) return 'Bon'
  if (s >= 70) return 'Moyen'
  return 'Faible'
}

export default function Admin() {
  const navigate = useNavigate()
  const [auth, setAuth] = useState(false)
  const [pwd, setPwd] = useState('')
  const [tab, setTab] = useState<'dashboard'|'conducteurs'|'trajets'|'stats'>('dashboard')
  const [conducteurs, setConducteurs] = useState<any[]>([])
  const [trajets, setTrajets] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedDriver, setSelectedDriver] = useState<any>(null)
  const ADMIN_PWD = 'wafa2026admin'

  useEffect(() => {
    if (auth) loadData()
  }, [auth])

  async function loadData() {
    setLoading(true)
    const [{ data: p }, { data: t }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('trajets').select('*').order('created_at', { ascending: false })
    ])
    setConducteurs(p || [])
    setTrajets(t || [])
    setLoading(false)
  }

  // Stats globales
  const totalConducteurs = conducteurs.length
  const totalTrajets = trajets.length
  const totalKm = parseFloat(trajets.reduce((s, t) => s + (t.km || 0), 0).toFixed(1))
  const totalRevenu = parseFloat(trajets.reduce((s, t) => s + (t.cout_mad || 0), 0).toFixed(2))
  const avgScore = totalTrajets > 0 ? Math.round(trajets.reduce((s, t) => s + (t.score_trajet || 0), 0) / totalTrajets) : 0

  // Stats par conducteur
  const driverStats = conducteurs.map(c => {
    const dTrajets = trajets.filter(t => t.pseudo_id === c.pseudo_id)
    const dKm = parseFloat(dTrajets.reduce((s, t) => s + (t.km || 0), 0).toFixed(1))
    const dScore = dTrajets.length > 0 ? Math.round(dTrajets.reduce((s, t) => s + (t.score_trajet || 0), 0) / dTrajets.length) : 0
    const dRevenu = parseFloat(dTrajets.reduce((s, t) => s + (t.cout_mad || 0), 0).toFixed(2))
    const dFreinages = dTrajets.reduce((s, t) => s + (t.freinages_brusques || 0), 0)
    const dExces = dTrajets.reduce((s, t) => s + (t.exces_vitesse_count || 0), 0)
    const reduction = dScore >= 90 ? 15 : dScore >= 80 ? 10 : dScore >= 70 ? 5 : 0
    const prime = Math.round((200 + dKm * 0.5) * (1 - reduction / 100))
    return { ...c, trajets: dTrajets.length, km: dKm, score: dScore, revenu: dRevenu, freinages: dFreinages, exces: dExces, prime, reduction }
  }).sort((a, b) => b.score - a.score)

  const filteredDrivers = driverStats.filter(d =>
    !search || `${d.prenom} ${d.nom} ${d.email}`.toLowerCase().includes(search.toLowerCase())
  )

  // Export CSV
  function exportCSV() {
    const rows = [
      ['Prénom', 'Nom', 'Email', 'Trajets', 'Km', 'Score', 'Prime MAD', 'Réduction%', 'Freinages', 'Excès', 'Inscription'],
      ...driverStats.map(d => [d.prenom, d.nom, d.email, d.trajets, d.km, d.score, d.prime, d.reduction, d.freinages, d.exces, d.created_at?.split('T')[0]])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `drivescore_conducteurs_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  function exportTrajetCSV() {
    const rows = [
      ['Pseudo', 'Date', 'Km', 'Score', 'Type', 'Coût MAD', 'Freinages', 'Excès', 'Nocturne', 'Départ', 'Arrivée'],
      ...trajets.map(t => [t.pseudo_id, t.date_trajet, t.km, t.score_trajet, t.type_route, t.cout_mad, t.freinages_brusques, t.exces_vitesse_count, t.conduite_nocturne ? 'Oui' : 'Non', t.ville_depart || '', t.ville_arrivee || ''])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `drivescore_trajets_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  // LOGIN
  if (!auth) return (
    <div style={{ minHeight: '100vh', background: C.greenDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: C.fontSans }}>
      <div style={{ background: C.white, borderRadius: 20, padding: '36px', width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: C.greenMid, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 20 }}>🛡️</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: C.textPrimary }}>Back-office Wafa</div>
          <div style={{ fontSize: 12, color: C.textTertiary, marginTop: 4 }}>DriveScore Administration</div>
        </div>
        <input type="password" placeholder="Mot de passe admin" value={pwd}
          onChange={e => setPwd(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && pwd === ADMIN_PWD && setAuth(true)}
          style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${C.borderStrong}`, fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, marginBottom: 12, fontFamily: C.fontMono }} />
        {pwd && pwd !== ADMIN_PWD && <div style={{ color: C.red, fontSize: 12, marginBottom: 8 }}>Mot de passe incorrect</div>}
        <button onClick={() => pwd === ADMIN_PWD && setAuth(true)}
          style={{ width: '100%', padding: '13px', borderRadius: 12, background: C.greenMid, color: 'white', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: C.fontSans }}>
          Accéder au back-office
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.surface, fontFamily: C.fontSans }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} * {box-sizing:border-box}`}</style>

      {/* HEADER */}
      <div style={{ background: C.greenDeep, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.greenBright, boxShadow: '0 0 8px rgba(62,189,111,0.6)' }} />
          <span style={{ color: 'white', fontWeight: 600, fontSize: 15 }}>DriveScore <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>Admin</span></span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={loadData} style={{ background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontFamily: C.fontSans }}>
            ↻ Actualiser
          </button>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontFamily: C.fontSans }}>
            ← App
          </button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '0 24px', display: 'flex', gap: 0 }}>
        {[
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'conducteurs', label: '👥 Conducteurs' },
          { id: 'trajets', label: '🗺️ Trajets' },
          { id: 'stats', label: '📈 Statistiques' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} style={{
            padding: '14px 16px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: C.fontSans,
            background: 'none', borderBottom: tab === t.id ? `2px solid ${C.greenAccent}` : '2px solid transparent',
            color: tab === t.id ? C.greenAccent : C.textTertiary,
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: '20px 24px', maxWidth: 1200, margin: '0 auto' }}>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ width: 32, height: 32, border: `2px solid ${C.greenBright}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          </div>
        )}

        {/* DASHBOARD TAB */}
        {!loading && tab === 'dashboard' && (
          <div>
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Conducteurs', val: totalConducteurs, unit: '', color: C.blue, icon: '👥' },
                { label: 'Trajets', val: totalTrajets, unit: '', color: C.greenAccent, icon: '🗺️' },
                { label: 'Km parcourus', val: totalKm, unit: 'km', color: C.amber, icon: '🛣️' },
                { label: 'Revenus', val: totalRevenu, unit: 'MAD', color: C.greenBright, icon: '💰' },
                { label: 'Score moyen', val: avgScore, unit: '/100', color: scColor(avgScore), icon: '⭐' },
              ].map((k, i) => (
                <div key={i} style={{ background: C.white, borderRadius: 16, padding: '16px', border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 20, marginBottom: 8 }}>{k.icon}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: k.color, fontFamily: C.fontMono }}>{k.val}<span style={{ fontSize: 12, color: C.textTertiary, marginLeft: 3 }}>{k.unit}</span></div>
                  <div style={{ fontSize: 12, color: C.textTertiary, marginTop: 4 }}>{k.label}</div>
                </div>
              ))}
            </div>

            {/* Top 5 conducteurs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: C.white, borderRadius: 16, padding: '18px', border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.3px', marginBottom: 14 }}>TOP 5 CONDUCTEURS</div>
                {driverStats.slice(0, 5).map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 4 ? `1px solid ${C.border}` : 'none' }}>
                    <span style={{ fontSize: 16 }}>{['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{d.prenom} {d.nom}</div>
                      <div style={{ fontSize: 11, color: C.textTertiary }}>{d.km} km · {d.trajets} trajets</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: scColor(d.score), fontFamily: C.fontMono }}>{d.score}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: C.white, borderRadius: 16, padding: '18px', border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.3px', marginBottom: 14 }}>RÉPARTITION SCORES</div>
                {[
                  { label: 'Excellent (90+)', count: driverStats.filter(d => d.score >= 90).length, color: C.greenBright },
                  { label: 'Bon (80-89)', count: driverStats.filter(d => d.score >= 80 && d.score < 90).length, color: C.greenAccent },
                  { label: 'Moyen (70-79)', count: driverStats.filter(d => d.score >= 70 && d.score < 80).length, color: C.amber },
                  { label: 'Faible (<70)', count: driverStats.filter(d => d.score < 70).length, color: C.red },
                ].map((r, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: C.textSecondary }}>{r.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: r.color, fontFamily: C.fontMono }}>{r.count}</span>
                    </div>
                    <div style={{ height: 6, background: C.surface2, borderRadius: 3 }}>
                      <div style={{ width: `${totalConducteurs > 0 ? (r.count/totalConducteurs*100) : 0}%`, height: '100%', background: r.color, borderRadius: 3, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                ))}

                <div style={{ marginTop: 16, padding: '12px', background: C.amberLight, borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: C.amberDark, fontWeight: 500, marginBottom: 4 }}>REVENUS MENSUELS ESTIMÉS</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.amberDark, fontFamily: C.fontMono }}>
                    {driverStats.reduce((s, d) => s + d.prime, 0)} MAD
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONDUCTEURS TAB */}
        {!loading && tab === 'conducteurs' && (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <input placeholder="Rechercher par nom, email..." value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: `1px solid ${C.borderStrong}`, fontSize: 14, outline: 'none', fontFamily: C.fontSans, background: C.white }} />
              <button onClick={exportCSV} style={{ padding: '10px 16px', borderRadius: 10, background: C.greenMid, color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: C.fontSans }}>
                📥 Export CSV
              </button>
            </div>

            <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
                <thead>
                  <tr style={{ background: C.surface }}>
                    {['Conducteur', 'Email', 'Trajets', 'Km', 'Score', 'Prime', 'Réduction', 'Incidents', 'Inscription'].map((h, i) => (
                      <th key={i} style={{ padding: '10px 14px', fontSize: 11, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.3px', textAlign: 'left', borderBottom: `1px solid ${C.border}` }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredDrivers.map((d, i) => (
                    <tr key={i} onClick={() => setSelectedDriver(selectedDriver?.id === d.id ? null : d)}
                      style={{ borderBottom: `1px solid ${C.border}`, cursor: 'pointer', background: selectedDriver?.id === d.id ? 'rgba(42,138,80,0.04)' : 'white' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{d.prenom} {d.nom}</div>
                        <div style={{ fontSize: 11, color: C.textTertiary }}>{d.pseudo_id}</div>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: C.textSecondary }}>{d.email}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: C.textPrimary, fontFamily: C.fontMono }}>{d.trajets}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: C.textPrimary, fontFamily: C.fontMono }}>{d.km}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: `${scColor(d.score)}20`, color: scColor(d.score), padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, fontFamily: C.fontMono }}>{d.score}</span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: C.amberDark, fontFamily: C.fontMono }}>{d.prime} MAD</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: d.reduction > 0 ? 'rgba(62,189,111,0.1)' : C.surface2, color: d.reduction > 0 ? C.greenAccent : C.textTertiary, padding: '3px 8px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>-{d.reduction}%</span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: C.textSecondary, fontFamily: C.fontMono }}>{d.freinages}f / {d.exces}e</td>
                      <td style={{ padding: '12px 14px', fontSize: 11, color: C.textTertiary }}>{d.created_at?.split('T')[0]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Détail conducteur sélectionné */}
            {selectedDriver && (
              <div style={{ marginTop: 16, background: C.white, borderRadius: 16, padding: '20px', border: `1px solid ${C.greenAccent}40` }}>
                <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.3px', marginBottom: 14 }}>DÉTAIL — {selectedDriver.prenom?.toUpperCase()} {selectedDriver.nom?.toUpperCase()}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 14 }}>
                  {[
                    { label: 'Score moyen', val: `${selectedDriver.score}/100`, color: scColor(selectedDriver.score) },
                    { label: 'Km parcourus', val: `${selectedDriver.km} km`, color: C.blue },
                    { label: 'Prime estimée', val: `${selectedDriver.prime} MAD`, color: C.amberDark },
                    { label: 'Réduction', val: `-${selectedDriver.reduction}%`, color: C.greenAccent },
                  ].map((k, i) => (
                    <div key={i} style={{ background: C.surface, borderRadius: 12, padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: k.color, fontFamily: C.fontMono }}>{k.val}</div>
                      <div style={{ fontSize: 11, color: C.textTertiary, marginTop: 3 }}>{k.label}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, marginBottom: 10 }}>DERNIERS TRAJETS</div>
                  {trajets.filter(t => t.pseudo_id === selectedDriver.pseudo_id).slice(0, 5).map((t, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                      <span style={{ color: C.textSecondary }}>{t.date_trajet} · {t.type_route} · {t.km} km</span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {(t.freinages_brusques || 0) > 0 && <span style={{ color: C.red, fontSize: 11 }}>🛑{t.freinages_brusques}</span>}
                        {(t.exces_vitesse_count || 0) > 0 && <span style={{ color: C.amber, fontSize: 11 }}>⚡{t.exces_vitesse_count}</span>}
                        <span style={{ color: scColor(t.score_trajet), fontWeight: 700, fontFamily: C.fontMono }}>{t.score_trajet}/100</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TRAJETS TAB */}
        {!loading && tab === 'trajets' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: C.textSecondary }}>{trajets.length} trajets au total</div>
              <button onClick={exportTrajetCSV} style={{ padding: '10px 16px', borderRadius: 10, background: C.greenMid, color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: C.fontSans }}>
                📥 Export CSV Trajets
              </button>
            </div>

            <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' as const, minWidth: 800 }}>
                <thead>
                  <tr style={{ background: C.surface }}>
                    {['Conducteur', 'Date', 'Km', 'Type', 'Score', 'Coût', 'Freinages', 'Excès', 'Vitesse max', 'Nocturne'].map((h, i) => (
                      <th key={i} style={{ padding: '10px 14px', fontSize: 11, color: C.textTertiary, fontWeight: 500, textAlign: 'left', borderBottom: `1px solid ${C.border}` }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trajets.slice(0, 100).map((t, i) => {
                    const driver = conducteurs.find(c => c.pseudo_id === t.pseudo_id)
                    return (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, color: C.textPrimary }}>{driver?.prenom} {driver?.nom}</td>
                        <td style={{ padding: '10px 14px', fontSize: 12, color: C.textSecondary }}>{t.date_trajet}</td>
                        <td style={{ padding: '10px 14px', fontSize: 12, fontFamily: C.fontMono }}>{t.km}</td>
                        <td style={{ padding: '10px 14px' }}><span style={{ background: C.surface2, color: C.textSecondary, padding: '2px 8px', borderRadius: 20, fontSize: 11 }}>{t.type_route}</span></td>
                        <td style={{ padding: '10px 14px' }}><span style={{ color: scColor(t.score_trajet), fontWeight: 700, fontFamily: C.fontMono }}>{t.score_trajet}</span></td>
                        <td style={{ padding: '10px 14px', fontSize: 12, color: C.amberDark, fontFamily: C.fontMono }}>{t.cout_mad} MAD</td>
                        <td style={{ padding: '10px 14px', fontSize: 12, color: (t.freinages_brusques||0) > 0 ? C.red : C.textTertiary, fontFamily: C.fontMono }}>{t.freinages_brusques||0}</td>
                        <td style={{ padding: '10px 14px', fontSize: 12, color: (t.exces_vitesse_count||0) > 0 ? C.amber : C.textTertiary, fontFamily: C.fontMono }}>{t.exces_vitesse_count||0}</td>
                        <td style={{ padding: '10px 14px', fontSize: 12, fontFamily: C.fontMono }}>{t.vitesse_max||0} km/h</td>
                        <td style={{ padding: '10px 14px', fontSize: 11 }}>{t.conduite_nocturne ? '🌙 Oui' : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STATS TAB */}
        {!loading && tab === 'stats' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Incidents */}
            <div style={{ background: C.white, borderRadius: 16, padding: '18px', border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.3px', marginBottom: 14 }}>INCIDENTS TOTAUX</div>
              {[
                { label: 'Freinages brusques', val: trajets.reduce((s,t) => s+(t.freinages_brusques||0),0), color: C.red, icon: '🛑' },
                { label: 'Excès de vitesse', val: trajets.reduce((s,t) => s+(t.exces_vitesse_count||0),0), color: C.amber, icon: '⚡' },
                { label: 'Trajets nocturnes', val: trajets.filter(t=>t.conduite_nocturne).length, color: C.blue, icon: '🌙' },
              ].map((s,i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 2 ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{s.icon}</span>
                    <span style={{ fontSize: 13, color: C.textSecondary }}>{s.label}</span>
                  </div>
                  <span style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: C.fontMono }}>{s.val}</span>
                </div>
              ))}
            </div>

            {/* Types routes */}
            <div style={{ background: C.white, borderRadius: 16, padding: '18px', border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.3px', marginBottom: 14 }}>TYPES DE ROUTES</div>
              {['ville', 'route', 'autoroute', 'mixte'].map((type, i) => {
                const count = trajets.filter(t => t.type_route === type).length
                const pct = totalTrajets > 0 ? Math.round(count/totalTrajets*100) : 0
                return (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: C.textSecondary, textTransform: 'capitalize' }}>{type}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, fontFamily: C.fontMono }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: 6, background: C.surface2, borderRadius: 3 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: C.greenAccent, borderRadius: 3 }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Revenus par mois */}
            <div style={{ background: C.white, borderRadius: 16, padding: '18px', border: `1px solid ${C.border}`, gridColumn: '1 / -1' }}>
              <div style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.3px', marginBottom: 14 }}>REVENUS PAR MOIS (6 derniers mois)</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 120 }}>
                {Array.from({length: 6}, (_, i) => {
                  const d = new Date()
                  d.setMonth(d.getMonth() - (5 - i))
                  const m = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
                  const rev = parseFloat(trajets.filter(t => t.date_trajet?.startsWith(m)).reduce((s,t) => s+(t.cout_mad||0),0).toFixed(0))
                  const maxRev = 500
                  const h = Math.max(8, (rev/maxRev)*100)
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{ fontSize: 11, color: C.textSecondary, fontFamily: C.fontMono }}>{rev}</div>
                      <div style={{ width: '100%', height: `${h}%`, background: C.greenAccent, borderRadius: '4px 4px 0 0', minHeight: 8 }} />
                      <div style={{ fontSize: 10, color: C.textTertiary }}>{d.toLocaleDateString('fr-FR', {month:'short'})}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

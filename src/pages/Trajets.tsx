import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Trajets() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ km: '', type_route: 'ville', ville_depart: '', ville_arrivee: '', conduite_nocturne: false, freinages_brusques: 0, exces_vitesse_count: 0 })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [trajets, setTrajets] = useState<any[]>([])

  const score = Math.max(0, 100 - form.freinages_brusques * 3 - form.exces_vitesse_count * 5 - (form.conduite_nocturne ? 5 : 0))
  const scoreColor = score >= 80 ? '#065F46' : score >= 60 ? '#F97316' : '#EF4444'

  useEffect(() => {
    async function loadTrajets() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('pseudo_id').eq('id', user.id).single()
      if (profile) {
        const { data } = await supabase.from('trajets').select('*').eq('pseudo_id', profile.pseudo_id).order('created_at', { ascending: false }).limit(10)
        setTrajets(data || [])
      }
    }
    loadTrajets()
  }, [success])

  async function soumettre(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/login'); return }
    const { data: profile } = await supabase.from('profiles').select('pseudo_id').eq('id', user.id).single()
    if (profile) {
      const km = parseFloat(form.km)
      await supabase.from('trajets').insert({
        pseudo_id: profile.pseudo_id,
        km, type_route: form.type_route,
        ville_depart: form.ville_depart,
        ville_arrivee: form.ville_arrivee,
        conduite_nocturne: form.conduite_nocturne,
        freinages_brusques: form.freinages_brusques,
        exces_vitesse_count: form.exces_vitesse_count,
        score_trajet: score,
        cout_mad: parseFloat((km * 0.5).toFixed(2))
      })
      setSuccess(true)
      setForm({ km:'', type_route:'ville', ville_depart:'', ville_arrivee:'', conduite_nocturne:false, freinages_brusques:0, exces_vitesse_count:0 })
      setTimeout(() => setSuccess(false), 3000)
    }
    setLoading(false)
  }

  const inp = { width:'100%', padding:'12px 16px', borderRadius:12, border:'1.5px solid #E2E8F0', fontSize:14, outline:'none', boxSizing:'border-box' } as React.CSSProperties

  return (
    <div style={{minHeight:'100vh',background:'#F8FAFC',fontFamily:'Inter,sans-serif'}}>
      <header style={{background:'white',borderBottom:'1px solid #E2E8F0',padding:'14px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={() => navigate('/dashboard')} style={{background:'none',border:'none',cursor:'pointer',color:'#64748B',fontWeight:600,fontSize:14,display:'flex',alignItems:'center',gap:4}}>
          ← Dashboard
        </button>
        <h1 style={{fontSize:18,fontWeight:700,color:'#0F172A',margin:0}}>Déclarer un trajet</h1>
      </header>

      <div style={{maxWidth:600,margin:'0 auto',padding:'24px 16px'}}>
        {success && (
          <div style={{background:'#F0FDF4',border:'1px solid #86EFAC',borderRadius:12,padding:'16px',marginBottom:20,color:'#065F46',fontWeight:600,fontSize:14,textAlign:'center'}}>
            ✅ Trajet enregistré ! Score : {score}/100
          </div>
        )}

        <div style={{background:'white',borderRadius:20,padding:24,boxShadow:'0 1px 4px rgba(0,0,0,0.08)',marginBottom:20}}>
          <div style={{background:'linear-gradient(135deg,#065F46,#047857)',borderRadius:16,padding:20,marginBottom:20,textAlign:'center',color:'white'}}>
            <p style={{margin:'0 0 4px',fontSize:13,opacity:0.8}}>Score estimé de ce trajet</p>
            <div style={{fontSize:56,fontWeight:800,lineHeight:1}}>{score}</div>
            <div style={{fontSize:14,opacity:0.8}}>/100</div>
          </div>

          <form onSubmit={soumettre} style={{display:'flex',flexDirection:'column',gap:16}}>
            <div>
              <label style={{display:'block',fontSize:14,fontWeight:600,color:'#374151',marginBottom:6}}>Kilomètres parcourus *</label>
              <input type="number" required min="1" max="1999" placeholder="Ex: 45" value={form.km}
                onChange={e => setForm(f => ({...f, km: e.target.value}))} style={inp} />
              {form.km && <p style={{fontSize:12,color:'#F97316',margin:'4px 0 0'}}>Coût estimé : {(parseFloat(form.km||'0') * 0.5).toFixed(2)} MAD</p>}
            </div>

            <div>
              <label style={{display:'block',fontSize:14,fontWeight:600,color:'#374151',marginBottom:8}}>Type de route</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                {[{id:'ville',label:'🏙️ Ville'},{id:'route',label:'🛣️ Route'},{id:'autoroute',label:'🚀 Auto'},{id:'mixte',label:'🔀 Mixte'}].map(t => (
                  <button key={t.id} type="button" onClick={() => setForm(f => ({...f, type_route:t.id}))}
                    style={{padding:'10px 6px',borderRadius:10,border:`2px solid ${form.type_route===t.id?'#065F46':'#E2E8F0'}`,background:form.type_route===t.id?'#F0FDF4':'white',color:form.type_route===t.id?'#065F46':'#374151',fontWeight:600,fontSize:12,cursor:'pointer'}}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div>
                <label style={{display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:5}}>Ville départ</label>
                <input placeholder="Casablanca" value={form.ville_depart} onChange={e => setForm(f => ({...f, ville_depart:e.target.value}))} style={inp} />
              </div>
              <div>
                <label style={{display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:5}}>Ville arrivée</label>
                <input placeholder="Rabat" value={form.ville_arrivee} onChange={e => setForm(f => ({...f, ville_arrivee:e.target.value}))} style={inp} />
              </div>
            </div>

            <div style={{background:'#FFF7ED',borderRadius:12,padding:16}}>
              <p style={{fontSize:13,fontWeight:700,color:'#F97316',margin:'0 0 12px'}}>⚠️ Incidents de conduite</p>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:13,color:'#374151'}}>🛑 Freinages brusques (-3pts chacun)</span>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <button type="button" onClick={() => setForm(f => ({...f, freinages_brusques:Math.max(0,f.freinages_brusques-1)}))}
                      style={{width:28,height:28,borderRadius:8,border:'1px solid #E2E8F0',background:'white',cursor:'pointer',fontWeight:700}}>-</button>
                    <span style={{fontWeight:700,minWidth:20,textAlign:'center'}}>{form.freinages_brusques}</span>
                    <button type="button" onClick={() => setForm(f => ({...f, freinages_brusques:f.freinages_brusques+1}))}
                      style={{width:28,height:28,borderRadius:8,border:'1px solid #E2E8F0',background:'white',cursor:'pointer',fontWeight:700}}>+</button>
                  </div>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:13,color:'#374151'}}>🚨 Excès de vitesse (-5pts chacun)</span>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <button type="button" onClick={() => setForm(f => ({...f, exces_vitesse_count:Math.max(0,f.exces_vitesse_count-1)}))}
                      style={{width:28,height:28,borderRadius:8,border:'1px solid #E2E8F0',background:'white',cursor:'pointer',fontWeight:700}}>-</button>
                    <span style={{fontWeight:700,minWidth:20,textAlign:'center'}}>{form.exces_vitesse_count}</span>
                    <button type="button" onClick={() => setForm(f => ({...f, exces_vitesse_count:f.exces_vitesse_count+1}))}
                      style={{width:28,height:28,borderRadius:8,border:'1px solid #E2E8F0',background:'white',cursor:'pointer',fontWeight:700}}>+</button>
                  </div>
                </div>
                <label style={{display:'flex',alignItems:'center',gap:10,fontSize:13,color:'#374151',cursor:'pointer'}}>
                  <input type="checkbox" checked={form.conduite_nocturne} onChange={e => setForm(f => ({...f, conduite_nocturne:e.target.checked}))} style={{accentColor:'#065F46'}} />
                  🌙 Conduite nocturne (-5pts)
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{padding:'16px',borderRadius:14,background:scoreColor,color:'white',border:'none',fontWeight:700,fontSize:16,cursor:'pointer'}}>
              {loading ? 'Enregistrement...' : `✅ Enregistrer — Score ${score}/100`}
            </button>
          </form>
        </div>

        {trajets.length > 0 && (
          <div style={{background:'white',borderRadius:20,padding:24,boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>
            <h2 style={{fontSize:16,fontWeight:700,color:'#0F172A',marginBottom:16}}>Historique récent</h2>
            {trajets.map((t,i) => (
              <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',background:'#F8FAFC',borderRadius:10,marginBottom:8}}>
                <div>
                  <p style={{fontWeight:600,fontSize:14,color:'#0F172A',margin:0}}>{t.km} km — {t.type_route}</p>
                  <p style={{fontSize:12,color:'#94A3B8',margin:0}}>{t.date_trajet} · {t.cout_mad} MAD</p>
                </div>
                <div style={{padding:'4px 10px',borderRadius:20,fontSize:13,fontWeight:700,background:t.score_trajet>=80?'#F0FDF4':'#FFF7ED',color:t.score_trajet>=80?'#065F46':'#F97316'}}>
                  {t.score_trajet}/100
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const C = {
  greenDeep: '#0D2E1C', greenMid: '#1E5C35', greenAccent: '#2A8A50', greenBright: '#3EBD6F',
  amber: '#F5A623', white: '#FFFFFF', surface: '#F7F8F6',
  textPrimary: '#0D1F16', textSecondary: '#4A6355', textTertiary: '#8AA898',
  border: 'rgba(13,46,28,0.08)', borderStrong: 'rgba(13,46,28,0.14)',
  fontSans: "'DM Sans', sans-serif",
}

export default function CompleteProfil() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    if (!prenom.trim()) { setError('Le prénom est obligatoire'); return }
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { navigate('/login'); return }
    await supabase.from('profiles').update({ prenom: prenom.trim(), nom: nom.trim() }).eq('id', session.user.id)
    navigate('/dashboard')
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: C.greenDeep, fontFamily: C.fontSans }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'radial-gradient(circle,rgba(62,189,111,0.18) 0%,transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ padding: '40px 24px 0', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 32 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.greenBright }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>DriveScore · Wafa Assurance</span>
        </div>
        <div style={{ fontSize: 26, fontWeight: 600, color: 'white', letterSpacing: '-0.5px', marginBottom: 8 }}>
          Bienvenue !<br /><span style={{ color: C.amber }}>Une dernière étape.</span>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
          Complétez votre profil pour accéder à DriveScore
        </div>
      </div>

      <div style={{ background: C.surface, borderRadius: '22px 22px 0 0', padding: '28px 22px 40px', marginTop: 32, minHeight: '65vh', animation: 'fadeUp 0.3s ease' }}>

        {error && (
          <div style={{ background: '#FDEAEA', border: '1px solid rgba(229,64,58,0.2)', color: '#8B1A17', padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: 13 }}>
            ⚠ {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.4px', marginBottom: 6 }}>PRÉNOM *</div>
              <input value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Sara"
                style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${C.borderStrong}`, fontSize: 14, outline: 'none', background: C.white, fontFamily: C.fontSans, boxSizing: 'border-box' as const }} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: C.textTertiary, fontWeight: 500, letterSpacing: '0.4px', marginBottom: 6 }}>NOM</div>
              <input value={nom} onChange={e => setNom(e.target.value)} placeholder="Alami"
                style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${C.borderStrong}`, fontSize: 14, outline: 'none', background: C.white, fontFamily: C.fontSans, boxSizing: 'border-box' as const }} />
            </div>
          </div>

          <div style={{ background: 'rgba(42,138,80,0.06)', borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(42,138,80,0.12)' }}>
            <div style={{ fontSize: 11, color: C.greenAccent, fontWeight: 600, marginBottom: 6 }}>VOTRE COMPTE DRIVESCORE</div>
            <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.6 }}>
              Score de conduite en temps réel · Réduction jusqu'à -15% · Carte GPS des trajets
            </div>
          </div>

          <button onClick={submit} disabled={loading || !prenom.trim()} style={{
            width: '100%', padding: '14px', borderRadius: 14, fontFamily: C.fontSans,
            background: loading || !prenom.trim() ? '#EDEFEB' : C.greenMid,
            color: loading || !prenom.trim() ? C.textTertiary : 'white',
            border: 'none', fontWeight: 600, fontSize: 15,
            cursor: loading || !prenom.trim() ? 'not-allowed' : 'pointer',
          }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                Enregistrement...
              </span>
            ) : 'Accéder à DriveScore →'}
          </button>
        </div>
      </div>
    </div>
  )
}

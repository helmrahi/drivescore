import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const C = {
  greenDeep: '#0D2E1C', greenMid: '#1E5C35', greenBright: '#3EBD6F',
  surface: '#F7F8F6', textPrimary: '#0D1F16', textTertiary: '#8AA898',
  fontSans: "'DM Sans', sans-serif",
}

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/dashboard')
      } else if (event === 'PASSWORD_RECOVERY') {
        navigate('/reset-password')
      } else {
        setTimeout(() => navigate('/login'), 3000)
      }
    })
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: C.greenDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: C.fontSans }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: `3px solid ${C.greenBright}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ fontSize: 16, fontWeight: 500, color: 'white', marginBottom: 8 }}>Activation en cours...</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Redirection vers votre tableau de bord</div>
      </div>
    </div>
  )
}

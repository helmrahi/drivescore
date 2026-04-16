import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    async function handle() {
      // Attendre que Supabase établisse la session depuis l'URL
      await new Promise(r => setTimeout(r, 1500))
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Créer profil si manquant
        const { data: existing } = await supabase
          .from('profiles').select('id').eq('id', session.user.id).single()
        
        if (!existing) {
          const meta = session.user.user_metadata || {}
          const prenom = meta.full_name?.split(' ')[0] || meta.name?.split(' ')[0] || 'Conducteur'
          const pseudoId = 'DS' + Math.random().toString(36).substr(2, 8).toUpperCase()
          await supabase.from('profiles').insert({
            id: session.user.id, pseudo_id: pseudoId,
            prenom, nom: meta.full_name?.split(' ').slice(1).join(' ') || '',
            email: session.user.email, role: 'client',
            consentement_gps: false, consentement_marketing: false,
            afficher_leaderboard: false,
          })
        }
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    }
    handle()
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#0D2E1C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #3EBD6F', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ color: 'white', fontSize: 14, fontWeight: 500 }}>Connexion en cours...</div>
      </div>
    </div>
  )
}

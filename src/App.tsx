import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { useAuth } from './hooks/useAuth'
import React from 'react'
import Login from './pages/Login'
import Inscription from './pages/Inscription'
import Dashboard from './pages/Dashboard'
import Trajets from './pages/Trajets'
import Telematics from './pages/Telematics'
import AuthCallback from './pages/AuthCallback'
import NPS from './pages/NPS'
import Admin from './pages/Admin'
import ResetPassword from './pages/ResetPassword'
import Simulateur from './pages/Simulateur'
import CommentCaMarche from './pages/CommentCaMarche'
import Leaderboard from './pages/Leaderboard'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0D2E1C'}}>
      <div style={{width:36,height:36,border:'3px solid #3EBD6F',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
  // Délai anti-flash pour OAuth
  if (!user && !loading) return <Navigate to="/login" replace />
  if (!user) return null
  return <>{children}</>
}

function NPSWrapper() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [score, setScore] = React.useState(0)
  const [km, setKm] = React.useState(0)

  React.useEffect(() => {
    async function load() {
      if (!profile?.pseudo_id) return
      const now = new Date()
      const { data } = await supabase.from('trajets').select('score_trajet,km').eq('pseudo_id', profile.pseudo_id).gte('date_trajet', `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`)
      if (data?.length) {
        const avg = Math.round(data.reduce((s,t) => s+(t.score_trajet||0),0)/data.length)
        const totalKm = parseFloat(data.reduce((s,t) => s+(t.km||0),0).toFixed(1))
        setScore(avg); setKm(totalKm)
      }
    }
    load()
  }, [profile])

  return <NPS pseudoId={profile?.pseudo_id||''} score={score} km={km} onClose={() => navigate("/dashboard")} />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/trajets" element={<ProtectedRoute><Trajets /></ProtectedRoute>} />
        <Route path="/telematics" element={<ProtectedRoute><Telematics /></ProtectedRoute>} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/nps" element={<ProtectedRoute><NPSWrapper /></ProtectedRoute>} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/simulateur" element={<Simulateur />} />
        <Route path="/comment-ca-marche" element={<CommentCaMarche />} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

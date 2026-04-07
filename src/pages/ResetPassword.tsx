import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'request' | 'update'>('request');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access_token') && hash.includes('type=recovery')) {
      setStep('update');
    }
  }, []);

  const handleRequestReset = async () => {
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://drivescore-eight.vercel.app/reset-password',
    });
    setLoading(false);
    if (error) alert(error.message);
    else setSent(true);
  };

  const handleUpdatePassword = async () => {
    if (!password) return;
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) alert(error.message);
    else {
      alert('Mot de passe mis à jour !');
      navigate('/login');
    }
  };

  return (
    <>
      <style>{`
        .reset-left { display: none; }
        @media (min-width: 768px) { .reset-left { display: flex; } }
      `}</style>
      <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>

        <div className="reset-left" style={{
          flex: '0 0 46%', flexDirection: 'column', justifyContent: 'center',
          padding: '60px 48px', color: 'white',
          background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <img src="/wafa-logo.png" alt="Wafa" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#F5A623' }}>WAFA ASSURANCE</div>
              <div style={{ fontSize: 11, background: '#F5A623', color: '#1B5E20', padding: '2px 8px', borderRadius: 4, fontWeight: 700, marginTop: 2, display: 'inline-block' }}>DRIVESCORE PAYD</div>
            </div>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>
            Conduisez mieux,<br />
            <span style={{ color: '#F5A623' }}>payez moins.</span>
          </h1>
          <p style={{ fontSize: 15, opacity: 0.85, lineHeight: 1.6 }}>
            La première assurance auto télématique au Maroc.
          </p>
        </div>

        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '32px 20px', background: '#f8f9fa'
        }}>
          <div style={{ width: '100%', maxWidth: 400 }}>

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <img src="/wafa-logo.png" alt="Wafa" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', marginBottom: 10 }} />
              <div style={{ fontWeight: 900, fontSize: 15, color: '#1A1A1A' }}>
                WAFA <span style={{ color: '#2E7D32' }}>ASSURANCE</span>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 20, padding: '28px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #E8E8E8' }}>

              {step === 'request' && !sent && (
                <>
                  <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: '#1A1A1A' }}>Mot de passe oublié ?</h2>
                  <p style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>
                    Entrez votre email et nous vous enverrons un lien de réinitialisation.
                  </p>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#888', display: 'block', marginBottom: 6 }}>ADRESSE EMAIL</label>
                  <input
                    type="email" placeholder="votre@email.com" value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '14px 16px', marginBottom: 16, border: '1.5px solid #e0e0e0', borderRadius: 12, fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                  />
                  <button onClick={handleRequestReset} disabled={loading || !email} style={{
                    width: '100%', padding: '16px', background: '#2E7D32', color: 'white',
                    border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700,
                    cursor: 'pointer', opacity: loading || !email ? 0.6 : 1
                  }}>
                    {loading ? 'Envoi...' : '→ Envoyer le lien'}
                  </button>
                </>
              )}

              {step === 'request' && sent && (
                <>
                  <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, color: '#1A1A1A' }}>Email envoyé !</h2>
                  <div style={{ background: '#f0faf3', border: '1.5px solid #2E7D32', borderRadius: 12, padding: 16, textAlign: 'center', fontSize: 14, color: '#2E7D32', fontWeight: 600 }}>
                    ✓ Lien envoyé à {email}
                  </div>
                </>
              )}

              {step === 'update' && (
                <>
                  <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: '#1A1A1A' }}>Nouveau mot de passe</h2>
                  <p style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>Choisissez un nouveau mot de passe sécurisé.</p>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#888', display: 'block', marginBottom: 6 }}>NOUVEAU MOT DE PASSE</label>
                  <input
                    type="password" placeholder="••••••••••" value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '14px 16px', marginBottom: 16, border: '1.5px solid #e0e0e0', borderRadius: 12, fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                  />
                  <button onClick={handleUpdatePassword} disabled={loading || !password} style={{
                    width: '100%', padding: '16px', background: '#2E7D32', color: 'white',
                    border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700,
                    cursor: 'pointer', opacity: loading || !password ? 0.6 : 1
                  }}>
                    {loading ? 'Mise à jour...' : '✓ Confirmer'}
                  </button>
                </>
              )}

              <button onClick={() => navigate('/login')} style={{
                width: '100%', marginTop: 12, padding: '13px',
                background: 'transparent', border: '1.5px solid #e0e0e0',
                borderRadius: 12, fontSize: 14, color: '#666',
                cursor: 'pointer', fontWeight: 600
              }}>
                ← Retour à la connexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

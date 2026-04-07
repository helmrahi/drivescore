import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'request' | 'update'>('request');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleRequestReset = async () => {
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://drivescore-eight.vercel.app/reset-password',
    });
    setLoading(false);
    if (!error) setSent(true);
  };

  const handleUpdatePassword = async () => {
    if (!password) return;
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (!error) navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      {/* Left panel - même que Login */}
      <div style={{
        width: '45%', background: 'linear-gradient(135deg, #1a5c2a 0%, #2d7a3a 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 48px', color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <div style={{
            width: 48, height: 48, background: '#f5a623', borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22
          }}>🛡️</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#f5a623' }}>WAFA ASSURANCE</div>
            <div style={{ fontSize: 11, background: '#f5a623', color: '#1a5c2a', padding: '2px 8px', borderRadius: 4, fontWeight: 700, marginTop: 2 }}>DRIVESCORE PAYD</div>
          </div>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>
          Conduisez mieux,<br />
          <span style={{ color: '#f5a623' }}>payez moins.</span>
        </h1>
        <p style={{ fontSize: 15, opacity: 0.85, lineHeight: 1.6 }}>
          La première assurance auto télématique au Maroc. Votre prime calculée sur vos kilomètres réels et votre comportement de conduite.
        </p>
      </div>

      {/* Right panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 48px', background: '#f8f9fa'
      }}>
        <div style={{
          width: '100%', maxWidth: 440,
          background: 'white', borderRadius: 20,
          padding: '40px 36px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, color: '#1a1a1a' }}>
            {sent ? 'Email envoyé !' : 'Mot de passe oublié ?'}
          </h2>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 28 }}>
            {sent
              ? 'Vérifiez votre boîte mail et cliquez sur le lien pour réinitialiser.'
              : 'Entrez votre email et nous vous enverrons un lien de réinitialisation.'}
          </p>

          {!sent && (
            <>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#888' }}>
                ADRESSE EMAIL
              </label>
              <input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%', padding: '14px 16px', marginTop: 8, marginBottom: 20,
                  border: '1.5px solid #e0e0e0', borderRadius: 12, fontSize: 14,
                  outline: 'none', boxSizing: 'border-box'
                }}
              />
              <button
                onClick={handleRequestReset}
                disabled={loading || !email}
                style={{
                  width: '100%', padding: '16px', background: '#1a5c2a',
                  color: 'white', border: 'none', borderRadius: 12,
                  fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  opacity: loading || !email ? 0.6 : 1
                }}
              >
                {loading ? 'Envoi...' : '→ Envoyer le lien'}
              </button>
            </>
          )}

          {sent && (
            <div style={{
              background: '#f0faf3', border: '1.5px solid #2d7a3a',
              borderRadius: 12, padding: '16px', textAlign: 'center',
              fontSize: 14, color: '#1a5c2a', fontWeight: 600
            }}>
              ✓ Lien envoyé à {email}
            </div>
          )}

          <button
            onClick={() => navigate('/login')}
            style={{
              width: '100%', marginTop: 16, padding: '12px',
              background: 'transparent', border: '1.5px solid #e0e0e0',
              borderRadius: 12, fontSize: 14, color: '#666',
              cursor: 'pointer', fontWeight: 600
            }}
          >
            ← Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
}

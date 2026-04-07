import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async () => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      alert(error.message);
    } else {
      alert('Mot de passe mis à jour !');
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-[#C8102E]">Nouveau mot de passe</h2>
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border rounded-lg px-4 py-3 mb-4"
        />
        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full bg-[#C8102E] text-white py-3 rounded-lg font-semibold"
        >
          {loading ? 'Mise à jour...' : 'Confirmer'}
        </button>
      </div>
    </div>
  );
}

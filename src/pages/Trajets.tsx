import React, { useState, useEffect } from 'react';
import { supabase } from '../client';
import './Trajets.css';

const Trajets = () => {
  const [trajets, setTrajets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrajets = async () => {
      const { data, error } = await supabase
        .from('trajets')
        .select('*');
      if (error) console.log('Error fetching trajets:', error);
      else setTrajets(data);
      setLoading(false);
    };
    fetchTrajets();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="trajets-container">
      <h1>Mes Trajets</h1>
      <ul>
        {trajets.map((trajet) => (
          <li key={trajet.id}>{trajet.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Trajets;

import { useState, useEffect } from 'react';
import api from '../services/api';

export function useDashboard() {
  const [stats, setStats] = useState({
    casConfirmes: 0,
    deces: 0,
    guerisons: 0,
    regionsAlerte: 0,
    totalRegions: 24,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsRes = await api.get('/stats');
        const regionsRes = await api.get('/regions');
        
        const data = statsRes.data || {};
        const regionsData = regionsRes.data || [];

        setStats({
          
          casConfirmes: Number(data.total_cas) || 0,
          deces: Number(data.total_deces) || 0,
          guerisons: Number(data.total_hospitalisations) || 0,
          regionsAlerte: Number(data.regions_actives) || 0,
          totalRegions: regionsData.length || 24,
          loading: false,
          error: null
        });
      } catch (err) {
        console.error("Erreur API:", err);
        setStats(prev => ({ 
          ...prev, 
          loading: false, 
          error: "Erreur de connexion au serveur. Vérifie que le backend est lancé." 
        }));
      }
    };

    fetchStats();
  }, []);

  return stats;
}
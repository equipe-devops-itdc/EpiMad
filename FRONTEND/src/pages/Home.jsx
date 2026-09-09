import { useState, useEffect } from 'react';
import api from '../services/api';
import Header from '../components/layout/Header';
import StatsCard from '../components/layout/StatsCard';
import { Activity, Skull, Heart, Shield, FileDown, Brain } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import RegionPanel from '../components/maps/RegionPanel';
import RegionMap from '../components/maps/RegionMap';

export default function Home() {
  const stats = useDashboard();

  const [maladies, setMaladies] = useState([]);
  const [selectedMaladieId, setSelectedMaladieId] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

  useEffect(() => {
    api.get('/maladies')
      .then((response) => {
        setMaladies(response.data);
        if (response.data.length > 0) setSelectedMaladieId(null);
      })
      .catch((err) => console.error("Erreur chargement maladies:", err));
  }, []);

  if (stats.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-emerald-50/30">
        <p className="text-emerald-800 text-lg font-medium animate-pulse">Chargement des données épidémiologiques...</p>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-emerald-50/30">
        <p className="text-red-600 text-lg font-semibold bg-red-50 px-6 py-3 rounded-xl border border-red-200">
           Erreur : {stats.error}
        </p>
      </div>
    );
  }

  const casConfirmes = stats.casConfirmes ?? 0;
  const deces = stats.deces ?? 0;
  const guerisons = stats.guerisons ?? 0;
  const regionsAlerte = stats.regionsAlerte ?? 0;
  const totalRegions = stats.totalRegions ?? 24;

   return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <Header />
      
      <main className="space-y-6">
        <div className="mb-6">
          <p className="text-sm text-slate-500 uppercase tracking-wider mb-3 font-semibold">
            Tableau de Bord Exécutif · Ministère de la Santé Publique
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4 leading-tight">
            Situation <span className="text-emerald-600 italic">épidémiologique</span><br />
            nationale
          </h1>
          <p className="text-slate-600 max-w-4xl text-base sm:text-lg leading-relaxed">
            Consolidation en temps réel des données OMS, du Ministère de la Santé 
            et des ONG partenaires sur les 24 régions : 6 maladies surveillées, avec 
            détection automatique des seuils épidémiques.
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="px-5 py-2.5 bg-white rounded-xl text-sm border border-emerald-100 shadow-sm">
            <span className="text-slate-500">Dernière ingestion ETL :</span>
            <span className="font-bold text-emerald-700 ml-2 tabular-nums">il y a 8 min</span>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-6 py-2.5 bg-white border-2 border-emerald-200 text-emerald-700 rounded-xl hover:bg-emerald-50 flex items-center justify-center gap-2 transition-all shadow-sm font-semibold">
              <FileDown size={18} />
              <span>Bulletin PDF</span>
            </button>
            <button className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2 transition-all shadow-md font-semibold">
              <Brain size={18} />
              <span>Rapport</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard title="Cas Confirmés" value={casConfirmes.toLocaleString()} trend="up" trendValue="+4.2%" icon={Activity} color="primary" />
          <StatsCard title="Décès Cumulés" value={deces.toLocaleString()} trend="down" trendValue="-1.8%" icon={Skull} color="danger" />
          <StatsCard title="Guérisons" value={guerisons.toLocaleString()} trend="up" trendValue="+6.1%" icon={Heart} color="success" />
          <StatsCard title="Régions en Alerte" value={`${regionsAlerte} / ${totalRegions}`} trend="up" trendValue="+2%" icon={Shield} color="warning" />
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-emerald-100">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Cartographie épidémiologique</h2>
            <p className="text-sm text-slate-500 mt-1">24 régions · Filtrage par maladie</p>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="w-full lg:w-64">
              <label className="block text-sm font-bold text-slate-700 mb-2">Filtrer par maladie</label>
              <select
                value={selectedMaladieId || ''}
                onChange={(e) => setSelectedMaladieId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer transition-all"
              >
                <option value="">Toutes les maladies</option>
                {maladies.length > 0 ? (
                  maladies.map((maladie) => (
                    <option key={maladie.id} value={maladie.id}>
                      {maladie.nom_officiel || maladie.nom}
                    </option>
                  ))
                ) : (
                  <option disabled>Chargement...</option>
                )}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-sm font-bold text-slate-700 mr-2">Niveau d'alerte :</span>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-xs text-slate-600 font-medium">Stable</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><span className="text-xs text-slate-600 font-medium">Modéré</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div><span className="text-xs text-slate-600 font-medium">Elevé</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-600"></div><span className="text-xs text-slate-600 font-medium">Critique</span></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RegionMap 
                onRegionSelect={(regionData) => setSelectedRegion({...regionData})} 
                selectedRegion={selectedRegion} 
                maladieId={selectedMaladieId} 
              />
            </div>
            <div className="lg:col-span-1">
              <RegionPanel 
                region={selectedRegion} 
                maladieNom={maladies.find(m => m.id === selectedMaladieId)?.nom} 
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
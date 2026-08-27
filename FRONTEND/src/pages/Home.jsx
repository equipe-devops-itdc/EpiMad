import { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import StatsCard from '../components/layout/StatsCard';
import { Activity, Skull, Heart, Shield, FileDown, Brain } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import RegionPanel from '../components/maps/RegionPanel';
import Legend from '../components/maps/Legend';
import RegionMap from '../components/maps/RegionMap';

export default function Home() {
  const stats = useDashboard();

  // 1. Gestion des états pour la carte et les maladies
  const [maladies, setMaladies] = useState([]);
  const [selectedMaladieId, setSelectedMaladieId] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

  // 2. Chargement des maladies au démarrage
  useEffect(() => {
    console.log("Appel API /maladies en cours...")
    api.get('/maladies')
      .then((response) => {
        console.log(" Réponse API reçue:", response.data);
        console.log(" Nombre de maladies:", response.data.length);
        setMaladies(response.data);
        if (response.data.length > 0) {
          setSelectedMaladieId(null);
        }
      })
      .catch((err) => 
        {console.error("Erreur chargement maladies:", err);
        console.error("Détails:", err.response?.data);
    });
  }, []);

  // 3. Affichage pendant le chargement des stats
  if (stats.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500 text-lg animate-pulse">Chargement des données épidémiologiques...</p>
      </div>
    );
  }

  // 4. Affichage en cas d'erreur
  if (stats.error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-red-500 text-lg font-semibold">⚠️ Erreur : {stats.error}</p>
      </div>
    );
  }

  // 5. Variables sécurisées
  const casConfirmes = stats.casConfirmes ?? 0;
  const deces = stats.deces ?? 0;
  const guerisons = stats.guerisons ?? 0;
  const regionsAlerte = stats.regionsAlerte ?? 0;
  const totalRegions = stats.totalRegions ?? 24;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar FIXE à gauche */}
      <Sidebar />
      
      <div className="ml-64">
        <Header />
        
        <main className="p-8">
          {/* Header Section */}
          <div className="mb-10">
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-3 font-medium">
              Tableau de Bord Exécutif · Ministère de la Santé Publique
            </p>
            <h1 className="text-5xl font-bold text-primary mb-4 leading-tight">
              Situation <span className="text-primary italic">épidémiologique</span><br />
              nationale
            </h1>
            <p className="text-gray-600 max-w-4xl text-lg leading-relaxed">
              Consolidation en temps réel des données OMS, du Ministère de la Santé 
              et des ONG partenaires sur les 24 régions: 6 maladies surveillées, de 
              détection automatique des seuils épidémiques.
            </p>
          </div>

          {/* Actions Bar */}
          <div className="flex justify-between items-center mb-10">
            <div className="flex gap-4">
              <div className="px-5 py-2.5 bg-white rounded-lg text-sm border border-gray-200 shadow-sm">
                <span className="text-gray-500">Dernière ingestion ETL :</span>
                <span className="font-semibold text-primary ml-2">il y a 8 min</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-2.5 bg-white border-2 border-primary text-primary rounded-lg hover:bg-blue-50 flex items-center gap-2 transition-all shadow-sm font-medium">
                <FileDown size={18} />
                <span className="font-medium">Bulletin PDF</span>
              </button>
              <button className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-all shadow-md font-medium">
                <Brain size={18} />
                <span className="font-medium">Rapport IA</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-6 mb-10">
            <StatsCard
              title="Cas Confirmés"
              value={casConfirmes.toLocaleString()}
              trend="up"
              trendValue="+4.2%"
              icon={Activity}
              color="primary"
            />
            <StatsCard
              title="Décès Cumulés"
              value={deces.toLocaleString()}
              trend="down"
              trendValue="-1.8%"
              icon={Skull}
              color="danger"
            />
            <StatsCard
              title="Guérisons"
              value={guerisons.toLocaleString()}
              trend="up"
              trendValue="+6.1%"
              icon={Heart}
              color="success"
            />
            <StatsCard
              title="Régions en Alerte"
              value={`${regionsAlerte} / ${totalRegions}`}
              trend="up"
              trendValue="+2%"
              icon={Shield}
              color="warning"
            />
          </div>

          {/* Cartography Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-10">
            
            {/* 1. Titre en haut à gauche */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Cartographie épidémiologique</h2>
              <p className="text-sm text-gray-500 mt-1">24 régions · Filtrage par maladie</p>
            </div>

            {/* 2. Contrôles : Dropdown à GAUCHE, Légende à DROITE */}
            <div className="flex justify-between items-center mb-6">
              
              {/* Dropdown à gauche */}
              <div className="w-64">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrer par maladie
                </label>
                <select
                  value={selectedMaladieId || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    console.log(" Maladie sélectionnée:", value);
                    setSelectedMaladieId(value ? parseInt(value) : null);
                  }}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer transition-all"
                >
                  <option value="">Toutes les maladies</option>
                  {maladies.length > 0 ? (
                    maladies.map((maladie) => (
                      <option key={maladie.id} value={maladie.id}>
                        {maladie.nom_officiel || maladie.nom }
                      </option>
                    ))
                  ) : (
                    <option disabled>Chargement...</option>
                  )}
                </select>
              </div>

              {/* Légende des niveaux d'alerte à DROITE */}
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm font-semibold text-gray-700">Niveau d'alerte :</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 border border-green-600"></div>
                  <span className="text-xs text-gray-700">Stable</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 border border-yellow-600"></div>
                  <span className="text-xs text-gray-700">Modéré</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500 border border-orange-600"></div>
                  <span className="text-xs text-gray-700">Élevé</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-600 border border-red-700"></div>
                  <span className="text-xs text-gray-700">Critique</span>
                </div>
              </div>

            </div>

            {/* 3. Layout : Carte à gauche (2/3) - Panneau à droite (1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Carte Leaflet à gauche */}
              <div className="lg:col-span-2">
                <RegionMap
                  onRegionSelect={(regionData) => {
                    console.log(" Home reçoit la region:", regionData.nom);
                    setSelectedRegion({...regionData});
                  }}
                  selectedRegion={selectedRegion}
                  maladieId={selectedMaladieId}
                />
              </div>

              {/* Panneau de détails à droite */}
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
    </div>
  );
}
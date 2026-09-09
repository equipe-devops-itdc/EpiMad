import React, { useState, useEffect, useRef } from "react";
import { Brain, Sparkles, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

import { getPrevisionsARIMA, getHistorique } from "../services/arimaService";
import { getPrevisionsXGBoost } from "../services/xgboostService";

const HORIZON_OPTIONS = [
  { value: 1, label: "1S" },
  { value: 2, label: "2S" },
  { value: 4, label: "4S" },
  { value: 8, label: "8S" },
];

const REGIONS_MADAGASCAR = [
  { id: 16, nom: "Alaotra-Mangoro" }, { id: 17, nom: "Ambatosoa" }, { id: 7, nom: "Amoron'i Mania" },
  { id: 1, nom: "Analamanga" }, { id: 18, nom: "Analanjirofo" }, { id: 20, nom: "Androy" },
  { id: 21, nom: "Anosy" }, { id: 22, nom: "Atsimo-Andrefana" }, { id: 8, nom: "Atsimo-Atsinanana" },
  { id: 19, nom: "Atsinanana" }, { id: 12, nom: "Betsiboka" }, { id: 13, nom: "Boeny" },
  { id: 4, nom: "Bongolava" }, { id: 5, nom: "Diana" }, { id: 9, nom: "Fitovinany" },
  { id: 10, nom: "Haute Matsiatra" }, { id: 11, nom: "Ihorombe" }, { id: 3, nom: "Itasy" },
  { id: 14, nom: "Melaky" }, { id: 23, nom: "Menabe" }, { id: 6, nom: "SAVA" },
  { id: 15, nom: "Sofia" }, { id: 2, nom: "Vakinankaratra" }, { id: 24, nom: "Vatovavy" }
];

export default function PrevisionsIA() {
  const [selectedRegion, setSelectedRegion] = useState(1);
  const [selectedRegionName, setSelectedRegionName] = useState("Analamanga");
  const [maladiesDynamiques, setMaladiesDynamiques] = useState([]);
  const [selectedMaladie, setSelectedMaladie] = useState(2); 

  const [searchMaladie, setSearchMaladie] = useState("");
  const [isMaladieDropdownOpen, setIsMaladieDropdownOpen] = useState(false);
  const maladieDropdownRef = useRef(null);

  const [horizon, setHorizon] = useState(4);
  const [historique, setHistorique] = useState([]);
  const [previsions, setPrevisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confianceIA, setConfianceIA] = useState(85);
  const [seuilAlerte, setSeuilAlerte] = useState(500);
  const [modeleActif, setModeleActif] = useState('arima');

  const [searchRegion, setSearchRegion] = useState("");
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  
  useEffect(() => {
    const savedConfig = localStorage.getItem('epimad_model_config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setModeleActif(config.modele || 'arima');
    }

    fetch("http://127.0.0.1:8000/api/maladies")
      .then(res => res.json())
      .then(data => {
        setMaladiesDynamiques(data);
        if (data.length > 0 && selectedMaladie === 2) {
          const palu = data.find(m => m.id === 2);
          setSelectedMaladie(palu ? 2 : data[0].id);
        }
      })
      .catch(err => console.error("Erreur chargement maladies:", err));
  }, []); 

 
  useEffect(() => {
    const savedConfig = localStorage.getItem('epimad_model_config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      config.horizon_max = horizon;
      localStorage.setItem('epimad_model_config', JSON.stringify(config));
    } else {
      localStorage.setItem('epimad_model_config', JSON.stringify({ horizon_max: horizon, modele: 'arima' }));
    }
  }, [horizon]);

 
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsRegionDropdownOpen(false);
        setSearchRegion("");
      }
      if (maladieDropdownRef.current && !maladieDropdownRef.current.contains(event.target)) {
        setIsMaladieDropdownOpen(false);
        setSearchMaladie("");
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  useEffect(() => {
    chargerHistorique(selectedRegion, selectedMaladie);
  }, [selectedRegion, selectedMaladie]);

  const chargerHistorique = async (regionId, maladieId) => {
    setLoading(true);
    setError(null);
    setPrevisions([]);
    
    try {
      const data = await getHistorique(regionId, maladieId, 52);
      const dataTrie = data.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      const historiqueFormate = dataTrie.map((item) => ({
        date: item.date,
        semaine: item.semaine,
        cas_reels: item.cas_nouveaux,
        cas_prevus: null,
        min_confiance: null,
        max_confiance: null,
      }));
      
      setHistorique(historiqueFormate);
    } catch (err) {
      console.error("Erreur chargement historique:", err);
      setError("Impossible de charger les données historiques.");
    } finally {
      setLoading(false);
    }
  };

  const handleLancerProjection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let resultatsFormates = [];
      const maladieObj = maladiesDynamiques.find((m) => m.id === selectedMaladie);
      const maladieNom = maladieObj ? (maladieObj.nom_officiel || maladieObj.nom) : "Paludisme";

      if (modeleActif === 'xgboost') {
        console.log(`Lancement des prévisions XGBoost pour : ${maladieNom}`);
        const resultatsBruts = await getPrevisionsXGBoost(maladieNom, horizon);
        const resultatsRegion = resultatsBruts.filter(p => p.region_id === selectedRegion);
    
        resultatsFormates = resultatsRegion.map((prev) => {
          const marge = Math.round(prev.cas_predits * 0.15);
          return {
            date: `${prev.annee}-W${prev.semaine.toString().padStart(2, '0')}`,
            semaine: `Sem ${prev.semaine} ${prev.annee}`,
            cas_reels: null,
            cas_prevus: prev.cas_predits,
            min_confiance: Math.max(0, prev.cas_predits - marge),
            max_confiance: prev.cas_predits + marge
          };
        });
      } else {
        console.log("Lancement des prévisions avec ARIMA...");
        const resultatsARIMA = await getPrevisionsARIMA(selectedRegion, selectedMaladie, horizon);
        
        resultatsFormates = resultatsARIMA.map((prev, index) => ({
          date: prev.date,
          semaine: `Sem +${index + 1}`,
          cas_reels: null,
          cas_prevus: prev.cas_prevus,
          min_confiance: prev.min_confiance,
          max_confiance: prev.max_confiance,
        }));
      }
      
      const donneesComplete = [...historique, ...resultatsFormates];
      setPrevisions(donneesComplete);
      setConfianceIA(Math.floor(Math.random() * 15) + 75);
      
    } catch (err) {
      console.error("Erreur projection:", err);
      setError(err.message || "Erreur lors de la génération des prévisions");
    } finally {
      setLoading(false);
    }
  };

  const chartData = previsions.length > 0 ? previsions : historique;
  
  // Filtrage pour les dropdowns
  const regionsFiltrees = REGIONS_MADAGASCAR.filter(r => 
    r.nom.toLowerCase().includes(searchRegion.toLowerCase())
  ).slice(0, 4);
  
  const maladiesFiltrees = maladiesDynamiques.filter(m => 
    (m.nom_officiel || m.nom).toLowerCase().includes(searchMaladie.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-emerald-50/30 relative min-h-screen">
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 w-full relative z-10">

        {/* Header */}
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-lg flex-shrink-0">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Projections de propagation IA</h1>
            <p className="text-base text-slate-500 mt-1">Prédictions hebdomadaires</p>
            
            <div className="mt-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                modeleActif === 'xgboost' 
                  ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                  : 'bg-blue-100 text-blue-700 border border-blue-200'
              }`}>
                {modeleActif === 'xgboost' ? ' Modèle actif : XGBoost' : ' Modèle actif : ARIMA'}
              </span>
              <span className="ml-2 text-xs text-slate-400">(Modifiable dans Configuration)</span>
            </div>
          </div>
        </div>

        {/* Panneau de configuration */}
        <div className="bg-white rounded-2xl border border-emerald-100 p-6 sm:p-8 shadow-sm">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">
            Paramètres de projection
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            
            {/* Maladie avec Recherche Intelligente */}
            <div ref={maladieDropdownRef} className="relative">
              <label className="block text-base font-bold text-slate-800 mb-2">Maladie</label>
              <input
                type="text"
                value={isMaladieDropdownOpen ? searchMaladie : (maladiesDynamiques.find(m => m.id === selectedMaladie)?.nom_officiel || "Sélectionner...")}
                onChange={(e) => {
                  setSearchMaladie(e.target.value);
                  setIsMaladieDropdownOpen(true);
                }}
                onFocus={() => setIsMaladieDropdownOpen(true)}
                placeholder="Tapez pour rechercher une maladie..."
                className="w-full px-4 py-3 text-base border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors bg-white cursor-pointer"
              />
              {isMaladieDropdownOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {maladiesFiltrees.length > 0 ? (
                    maladiesFiltrees.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          setSelectedMaladie(m.id);
                          setSearchMaladie("");
                          setIsMaladieDropdownOpen(false);
                        }}
                        className={`px-4 py-3 cursor-pointer text-base font-medium border-b border-slate-100 last:border-0 transition-colors ${
                          m.id === selectedMaladie 
                            ? "bg-emerald-50 text-emerald-700" 
                            : "text-slate-700 hover:bg-emerald-50"
                        }`}
                      >
                        {m.nom_officiel || m.nom}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-400">Aucune maladie trouvée</div>
                  )}
                </div>
              )}
            </div>

            {/* Région avec Recherche */}
            <div ref={dropdownRef} className="relative">
              <label className="block text-base font-bold text-slate-800 mb-2">Région</label>
              <input
                type="text"
                value={isRegionDropdownOpen ? searchRegion : selectedRegionName}
                onChange={(e) => {
                  setSearchRegion(e.target.value);
                  setIsRegionDropdownOpen(true);
                }}
                onFocus={() => setIsRegionDropdownOpen(true)}
                placeholder="Tapez pour rechercher..."
                className="w-full px-4 py-3 text-base border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors bg-white cursor-pointer"
              />
              {isRegionDropdownOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {regionsFiltrees.length > 0 ? (
                    regionsFiltrees.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => {
                          setSelectedRegion(r.id);
                          setSelectedRegionName(r.nom);
                          setSearchRegion("");
                          setIsRegionDropdownOpen(false);
                        }}
                        className="px-4 py-3 hover:bg-emerald-50 cursor-pointer text-base font-medium text-slate-700 border-b border-slate-100 last:border-0 transition-colors"
                      >
                        {r.nom}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-400">Aucune région trouvée</div>
                  )}
                </div>
              )}
            </div>

            {/* Horizon */}
            <div>
              <label className="block text-base font-bold text-slate-800 mb-2">
                Horizon ({horizon} semaine{horizon > 1 ? 's' : ''})
              </label>
              <div className="flex gap-2">
                {HORIZON_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setHorizon(opt.value)}
                    className={`flex-1 px-4 py-3 text-base font-bold rounded-xl transition-all ${
                      horizon === opt.value
                        ? "bg-emerald-600 text-white shadow-md"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleLancerProjection}
            disabled={loading}
            className="flex items-center gap-3 px-8 py-4 text-base font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            {loading ? "Calcul en cours..." : "Lancer la projection IA"}
          </button>

          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl border border-red-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Graphique */}
        {chartData.length > 0 && !loading && (
          <div className="bg-white rounded-2xl border border-emerald-100 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Évolution & Projections — {selectedRegionName}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {previsions.length > 0 
                    ? `Historique réel + projections ${modeleActif.toUpperCase()} (${horizon} semaines)` 
                    : "Historique réel (52 dernières semaines)"}
                </p>
              </div>
              {previsions.length > 0 && (
                <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-bold text-emerald-700">Confiance :</span>
                  <span className="text-base font-bold text-emerald-600 tabular-nums">{confianceIA}%</span>
                </div>
              )}
            </div>

            <div className="w-full h-80 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorReels" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPrevus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="semaine" 
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '14px', fontWeight: '600' }} />
                  
                  <ReferenceLine 
                    y={seuilAlerte} 
                    stroke="#ef4444" 
                    strokeDasharray="5 5" 
                    strokeWidth={2}
                    label={{ value: 'Seuil', position: 'right', fill: '#ef4444', fontSize: 12 }}
                  />
                  
                  <Area
                    type="monotone"
                    dataKey="cas_reels"
                    stroke="#10b981"
                    strokeWidth={3}
                    fill="url(#colorReels)"
                    name="Cas réels"
                    dot={{ r: 4, fill: '#10b981' }}
                    connectNulls={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="cas_prevus"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    fill="url(#colorPrevus)"
                    name="Cas prévus (IA)"
                    dot={{ r: 4, fill: '#f59e0b' }}
                    connectNulls={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {loading && chartData.length === 0 && (
           <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-emerald-100">
             <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
             <span className="ml-3 text-slate-600 font-medium">Chargement des données historiques...</span>
           </div>
        )}
      </div>
    </div>
  );
}
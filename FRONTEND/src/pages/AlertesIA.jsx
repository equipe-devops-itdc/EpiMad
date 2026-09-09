import React, { useState, useEffect } from "react";
import { 
  Bell, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Filter, 
  RefreshCw,
  Eye,
  FileText
} from "lucide-react";
import { getAlertes } from "../services/alertesService";

export default function AlertesIA() {
  const [alertes, setAlertes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [derniereMaj, setDerniereMaj] = useState(null);
  const [horizonUtilise, setHorizonUtilise] = useState(4);
  // États des filtres
  const [filtrePriorite, setFiltrePriorite] = useState("TOUT");
  const [filtreType, setFiltreType] = useState("TOUT");

  const chargerAlertes = async () => {
    setLoading(true);
    try {
      const saveConfig = localStorage.getItem("epimad_model_config");
      const horizon = saveConfig ? JSON.parse(saveConfig).horizon_max || 4 : 4;
      const data = await getAlertes(horizon);
      
      console.log("Horizon lu depuis la config :", horizon);
      
      setAlertes(data.data || []);
      setDerniereMaj(data.derniere_maj);
      setHorizonUtilise(data.horizon_utilise || horizon);
    } catch (error) {
      console.error("Erreur chargement alertes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerAlertes();
  }, []);

  // Calcul des statistiques pour les cartes
  const stats = {
    total: alertes.length,
    critique: alertes.filter(a => a.priorite === "CRITIQUE").length,
    elevee: alertes.filter(a => a.priorite === "ELEVEE").length,
    traitees: alertes.filter(a => a.statut === "TRAITEE").length
  };

  // Filtrage des alertes
  const alertesFiltrees = alertes.filter(alerte => {
    const matchPriorite = filtrePriorite === "TOUT" || alerte.priorite === filtrePriorite;
    const matchType = filtreType === "TOUT" || alerte.type === filtreType;
    return matchPriorite && matchType;
  });

  const getPrioriteStyles = (priorite) => {
    switch (priorite) {
      case "CRITIQUE": return "bg-red-50 border-red-200 text-red-700";
      case "ELEVEE": return "bg-orange-50 border-orange-200 text-orange-700";
      case "MODEREE": return "bg-yellow-50 border-yellow-200 text-yellow-700";
      default: return "bg-slate-50 border-slate-200 text-slate-700";
    }
  };

  const getBadgeColor = (priorite) => {
    switch (priorite) {
      case "CRITIQUE": return "bg-red-100 text-red-700 border-red-200";
      case "ELEVEE": return "bg-orange-100 text-orange-700 border-orange-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 w-full relative z-10 bg-gray-50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Bell className="w-8 h-8 text-red-600" />
            Alertes IA
          </h1>
         <p className="text-slate-500 mt-1">
             Détection automatique des risques épidémiques basée sur les prédictions 
            <span className="font-semibold text-emerald-600"> à {horizonUtilise} semaines</span>.
            </p>
        </div>
        <button 
          onClick={chargerAlertes}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Alertes</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{stats.total}</p>
          </div>
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
            <Bell className="w-6 h-6 text-slate-600" />
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-red-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-600">Critiques</p>
            <p className="text-3xl font-bold text-red-700 mt-1">{stats.critique}</p>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-orange-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-orange-600">Élevées</p>
            <p className="text-3xl font-bold text-orange-700 mt-1">{stats.elevee}</p>
          </div>
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600">Dernière MAJ</p>
            <p className="text-sm font-bold text-emerald-700 mt-2">
              {derniereMaj ? new Date(derniereMaj).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}) : '--:--'}
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <Filter className="w-4 h-4" />
          <span>Filtres :</span>
        </div>
        
        <select 
          value={filtrePriorite} 
          onChange={(e) => setFiltrePriorite(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="TOUT">Toutes priorités</option>
          <option value="CRITIQUE">Critique</option>
          <option value="ELEVEE">Élevée</option>
        </select>

        <select 
          value={filtreType} 
          onChange={(e) => setFiltreType(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="TOUT">Tous types</option>
          <option value="DEPASSEMENT_SEUIL">Dépassement de seuil</option>
          <option value="TENDANCE_FORTE">Tendance forte</option>
        </select>
      </div>

      
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-slate-200">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="ml-3 text-slate-600 font-medium">Chargement des alertes...</span>
          </div>
        ) : alertesFiltrees.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">Aucune alerte ne correspond à vos filtres.</p>
          </div>
        ) : (
          alertesFiltrees.map((alerte) => (
            <div 
              key={alerte.id} 
              className={`bg-white rounded-xl border-l-4 p-5 shadow-sm hover:shadow-md transition-shadow ${getPrioriteStyles(alerte.priorite)}`}
              style={{ borderLeftColor: alerte.priorite === "CRITIQUE" ? "#ef4444" : alerte.priorite === "ELEVEE" ? "#f97316" : "#eab308" }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                
                {/* Contenu de l'alerte */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{alerte.icone}</span>
                    <h3 className="text-lg font-bold">{alerte.titre}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getBadgeColor(alerte.priorite)}`}>
                      {alerte.priorite}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      {alerte.type === "DEPASSEMENT_SEUIL" ? "Seuil" : "Tendance"}
                    </span>
                  </div>
                  
                  <p className="text-slate-700 mb-3 font-medium">{alerte.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <strong>Région :</strong> {alerte.region}
                    </span>
                    <span className="flex items-center gap-1">
                      <strong>Maladie :</strong> {alerte.maladie}
                    </span>
                    <span className="flex items-center gap-1">
                      <strong>Date :</strong> {new Date(alerte.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col gap-2 flex-shrink-0">
                  <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                    <Eye className="w-4 h-4" />
                    Détails
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
                    <FileText className="w-4 h-4" />
                    Rapport
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { Search, ShieldAlert, Eye, Filter, AlertTriangle } from "lucide-react";
import { getComparatifRegions } from "../services/comparatifService";

export default function ComparatifRegions() {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtreRisque, setFiltreRisque] = useState("TOUS");
  const [expandedRegionId, setExpandedRegionId] = useState(null);

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    setLoading(true);
    try {
      const data = await getComparatifRegions();
      setRegions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const regionsFiltrees = regions.filter(r => {
    const matchSearch = r.nom.toLowerCase().includes(search.toLowerCase());
    const matchRisque = filtreRisque === "TOUS" || r.risque_global === filtreRisque;
    return matchSearch && matchRisque;
  });

  const getBadgeStyle = (risque) => {
    switch (risque) {
      case "CRITIQUE": return "bg-red-100 text-red-700 border-red-200";
      case "ÉLEVÉ": return "bg-orange-100 text-orange-700 border-orange-200";
      case "MODÉRÉ": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }
  };

  const getMaladieBadgeStyle = (risque) => {
    switch (risque) {
      case "CRITIQUE": return "bg-red-50 text-red-700 border-red-200";
      case "ÉLEVÉ": return "bg-orange-50 text-orange-700 border-orange-200";
      case "MODÉRÉ": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default: return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 w-full relative z-10 bg-gray-50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-emerald-600" />
            Comparatif des 24 Régions
          </h1>
          <p className="text-slate-500 mt-1">Classement dynamique avec toutes les maladies actives.</p>
        </div>
        <div className="text-sm text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          <span className="font-bold text-slate-800">{regions.length}</span> régions analysées
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une région..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <select 
            value={filtreRisque} 
            onChange={(e) => setFiltreRisque(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
          >
            <option value="TOUS">Tous les niveaux</option>
            <option value="CRITIQUE">Critique</option>
            <option value="ÉLEVÉ">Élevé</option>
            <option value="MODÉRÉ">Modéré</option>
            <option value="STABLE">Stable</option>
          </select>
        </div>
      </div>

      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Chargement des données...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Rang</th>
                  <th className="px-6 py-4 font-semibold">Région</th>
                  <th className="px-6 py-4 font-semibold">Maladies Actives</th>
                  <th className="px-6 py-4 font-semibold">Risque Global</th>
                  <th className="px-6 py-4 font-semibold">Cas Total</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {regionsFiltrees.map((region, index) => {
                  const isExpanded = expandedRegionId === region.id;
                  const maladiesAafficher = isExpanded ? region.maladies : region.maladies.slice(0, 4);
                  const nbCachees = region.maladies.length - 4;

                  return (
                    <tr key={region.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-400">#{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{region.nom}</div>
                        <div className="text-xs text-slate-500">ID: {region.id}</div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {maladiesAafficher.map((maladie, idx) => (
                            <span 
                              key={idx}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getMaladieBadgeStyle(maladie.risque)}`}
                              title={`${maladie.nom}: ${maladie.cas} cas (${maladie.ratio}% du seuil)`}
                            >
                              {maladie.nom.split(' ')[0]}
                              {maladie.risque === "CRITIQUE" && <AlertTriangle className="w-3 h-3" />}
                            </span>
                          ))}
                          
                          {/* Bouton pour voir plus */}
                          {!isExpanded && nbCachees > 0 && (
                            <button
                              onClick={() => setExpandedRegionId(region.id)}
                              className="px-2 py-1 rounded-md text-xs font-bold bg-slate-200 text-slate-700 border border-slate-300 hover:bg-slate-300 cursor-pointer transition-colors"
                            >
                              +{nbCachees}
                            </button>
                          )}
                  
                          {isExpanded && nbCachees > 0 && (
                            <button
                              onClick={() => setExpandedRegionId(null)}
                              className="px-2 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-300 hover:bg-emerald-200 cursor-pointer transition-colors"
                            >
                              Voir moins
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getBadgeStyle(region.risque_global)}`}>
                          {region.risque_global}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono font-semibold text-slate-700">
                        {region.cas_total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
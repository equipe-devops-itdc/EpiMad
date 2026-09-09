import React, { useState, useEffect } from "react";
import { Activity, Calendar, TrendingUp, TrendingDown, Minus, ShieldCheck, ShieldX, Search } from "lucide-react";

export default function Maladies() {
  const [maladies, setMaladies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/maladies/overview")
      .then((res) => res.json())
      .then((data) => {
        setMaladies(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur chargement maladies:", err);
        setMaladies([]);
        setLoading(false);
      });
  }, []);

  const maladiesArray = Array.isArray(maladies) ? maladies : [];
  
  const maladiesFiltrees = maladiesArray.filter((m) =>
    (m.nom || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 w-full relative z-10 bg-gray-50 min-h-screen">
      
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Activity className="w-8 h-8 text-emerald-600" />
            Catalogue des Maladies
          </h1>
          <p className="text-slate-500 mt-1">Tendances épidémiologiques en temps réel.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une maladie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Maladies</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Données collectées</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Dernière MAJ</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Période 1<br/><span className="text-[10px] font-normal text-slate-400">(Origine)</span></th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Période 2<br/><span className="text-[10px] font-normal text-slate-400">(Nouveaux)</span></th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Variation</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Tendance(8 sem)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total 2026</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {maladiesFiltrees.length > 0 ? (
                maladiesFiltrees.map((m) => {
                  const p1 = m.periode_1_total || 0;
                  const p2 = m.periode_2_total || 0;
                  const varPct = m.variation_pct || 0;
                  
                  
                  let couleurVar = "text-slate-600";
                  let iconeVar = <Minus className="w-4 h-4" />;
                  let texteTendance = "Stable";
                  let couleurTendance = "bg-slate-100 text-slate-700 border-slate-200";
                  
                  if (varPct > 10) {
                    couleurVar = "text-red-600";
                    iconeVar = <TrendingUp className="w-4 h-4" />;
                    texteTendance = "Hausse";
                    couleurTendance = "bg-red-100 text-red-700 border-red-200";
                  } else if (varPct < -10) {
                    couleurVar = "text-emerald-600";
                    iconeVar = <TrendingDown className="w-4 h-4" />;
                    texteTendance = "Baisse";
                    couleurTendance = "bg-emerald-100 text-emerald-700 border-emerald-200";
                  }
                  
                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{m.nom || "Inconnu"}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">ID: {m.id}</td>
                      <td className="px-6 py-4">
                        {m.actif ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-3.5 h-3.5" /> Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <ShieldX className="w-3.5 h-3.5" /> Inactif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {m.periode || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">{m.derniere_maj || "-"}</td>
                      
                      {/* Période 1 (Origine / Ancienne) */}
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-semibold text-blue-600">{p1.toLocaleString('fr-FR')}</span>
                      </td>
                      
                      {/* Période 2 (Nouveaux / Récente) */}
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-semibold text-emerald-600">{p2.toLocaleString('fr-FR')}</span>
                      </td>
                      
                      {/* Variation */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center gap-1 text-sm font-bold ${couleurVar}`}>
                          {iconeVar}
                          {varPct > 0 ? '+' : ''}{varPct.toFixed(1)}%
                        </span>
                      </td>
                      
                      {/* Tendance */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${couleurTendance}`}>
                          {texteTendance}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-right">
                        <span className="text-lg font-bold text-slate-800">
                          {(m.total_cas_annee || 0).toLocaleString('fr-FR')}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="px-6 py-12 text-center text-slate-500">
                    Aucune maladie trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
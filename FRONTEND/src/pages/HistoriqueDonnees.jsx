import React, { useState, useEffect } from "react";
import { History, Filter, Download, Calendar, MapPin, Activity } from "lucide-react";

export default function HistoriqueDonnees() {
  const API_URL = "http://127.0.0.1:8000/api/historique-donnees";
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const [maladies, setMaladies] = useState([]);
  const [regions, setRegions] = useState([]);
  const [data, setData] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filtres
  const [filterMaladie, setFilterMaladie] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [filterDateDebut, setFilterDateDebut] = useState("");
  const [filterDateFin, setFilterDateFin] = useState("");

  useEffect(() => {
    fetchMaladies();
    fetchRegions();
  }, []);

    const fetchMaladies = async () => {
    console.log("[fetchMaladies] Début du chargement...");
    console.log("Token:", localStorage.getItem("token") ? "PRÉSENT" : "MANQUANT");
    
    try {
      const response = await fetch(`${API_URL}/maladies`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      console.log(" Status réponse:", response.status);
      console.log(" URL appelée:", `${API_URL}/maladies`);
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Maladies reçues:", data);
        setMaladies(data);
      } else {
        const errorText = await response.text();
        console.error(" Erreur HTTP:", response.status, errorText);
      }
    } catch (error) {
      console.error(" Exception:", error);
    }
  };

  const fetchRegions = async () => {
    console.log("[fetchRegions] Début du chargement...");
    
    try {
      const response = await fetch(`${API_URL}/regions`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      console.log("Status réponse:", response.status);
      console.log("URL appelée:", `${API_URL}/regions`);
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Régions reçues:", data);
        setRegions(data);
      } else {
        const errorText = await response.text();
        console.error(" Erreur HTTP:", response.status, errorText);
      }
    } catch (error) {
      console.error(" Exception:", error);
    }
  };

  const handleRechercher = async () => {
    setLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (filterMaladie) params.append("maladie_id", filterMaladie);
      if (filterRegion) params.append("region_id", filterRegion);
      if (filterDateDebut) params.append("date_debut", filterDateDebut);
      if (filterDateFin) params.append("date_fin", filterDateFin);

      const response = await fetch(`${API_URL}/?${params.toString()}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.data);
        setStatistics(result.statistics);
      } else {
        alert("Erreur lors de la récupération des données");
      }
    } catch (error) {
      alert("Erreur : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilterMaladie("");
    setFilterRegion("");
    setFilterDateDebut("");
    setFilterDateFin("");
    setData([]);
    setStatistics(null);
  };

  const handleExportCSV = () => {
    if (data.length === 0) return;

    const headers = "Date,Région,Cas nouveaux,Décès,Guéris,Hospitalisations,Taux incidence,Taux létalité,Niveau alerte\n";
    const rows = data.map(item => 
      `${item.date},${item.region_nom},${item.cas_nouveaux},${item.deces},${item.gueris},${item.hospitalisations},${item.taux_incidence},${item.taux_letalite},${item.niveau_alerte}`
    ).join("\n");

    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historique_${filterMaladie || 'toutes'}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 w-full relative z-10 bg-gray-50 min-h-screen">
      
      {/* En-tête */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-3">
          <History className="w-8 h-8 text-emerald-600" />
          Historique des Données Épidémiologiques
        </h1>
        <p className="text-slate-500 mt-1">
          Consultez l'historique des cas par maladie, région et période
        </p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5 text-emerald-600" />
          Filtres de recherche
        </h2>

        <div className="grid md:grid-cols-4 gap-4">
          
          {/* Maladie */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Activity className="w-4 h-4 inline mr-1" />
              Maladie
            </label>
            <select
              value={filterMaladie}
              onChange={(e) => setFilterMaladie(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="">Toutes les maladies</option>
              {maladies.map((m) => (
                <option key={m.id} value={m.id}>{m.nom}</option>
              ))}
            </select>
          </div>

          {/* Région */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Région
            </label>
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="">Toutes les régions</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>{r.nom}</option>
              ))}
            </select>
          </div>

          {/* Date début */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date début
            </label>
            <input
              type="date"
              value={filterDateDebut}
              onChange={(e) => setFilterDateDebut(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Date fin */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date fin
            </label>
            <input
              type="date"
              value={filterDateFin}
              onChange={(e) => setFilterDateFin(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* Boutons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleRechercher}
            disabled={loading}
            className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? "Recherche..." : "Rechercher"}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Statistiques */}
      {statistics && (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-sm text-slate-500 mb-1">Total des cas</p>
            <p className="text-2xl font-bold text-emerald-600">{statistics.total_cas.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-sm text-slate-500 mb-1">Décès</p>
            <p className="text-2xl font-bold text-red-600">{statistics.total_deces.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-sm text-slate-500 mb-1">Guéris</p>
            <p className="text-2xl font-bold text-blue-600">{statistics.total_gueris.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-sm text-slate-500 mb-1">Hospitalisations</p>
            <p className="text-2xl font-bold text-orange-600">{statistics.total_hospitalisations.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Tableau de résultats */}
      {data.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Résultats</h2>
              <p className="text-sm text-slate-500 mt-1">
                {data.length} ligne{data.length > 1 ? "s" : ""} trouvée{data.length > 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Exporter CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-3 text-xs font-bold text-slate-600 uppercase">Date</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-600 uppercase">Région</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-600 uppercase">Cas</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-600 uppercase">Décès</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-600 uppercase">Guéris</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-600 uppercase">Hospitalisés</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-600 uppercase">Alerte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(item.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{item.region_nom}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.cas_nouveaux}</td>
                    <td className="px-6 py-4 text-sm text-red-600 font-medium">{item.deces}</td>
                    <td className="px-6 py-4 text-sm text-blue-600">{item.gueris}</td>
                    <td className="px-6 py-4 text-sm text-orange-600">{item.hospitalisations}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        item.niveau_alerte === "Critique" ? "bg-red-100 text-red-700" :
                        item.niveau_alerte === "Élevé" ? "bg-orange-100 text-orange-700" :
                        item.niveau_alerte === "Modéré" ? "bg-yellow-100 text-yellow-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {item.niveau_alerte}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Message si aucun résultat */}
      {data.length === 0 && !loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">Aucune donnée trouvée</p>
          <p className="text-slate-400 text-sm mt-2">Utilisez les filtres ci-dessus pour rechercher des données</p>
        </div>
      )}
    </div>
  );
}
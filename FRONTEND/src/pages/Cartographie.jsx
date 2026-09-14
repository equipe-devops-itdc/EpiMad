import { useState, useEffect } from 'react';
import { Map, Filter, Download, Activity } from 'lucide-react';
import RegionMap from '../components/maps/RegionMap';

export default function Cartographie() {
  const [maladies, setMaladies] = useState([]);
  const [selectedMaladie, setSelectedMaladie] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaladies = async () => {
      try {
        console.log("Chargement des maladies pour la carte...");
        const token = localStorage.getItem("token");
        const response = await fetch("http://127.0.0.1:8000/api/maladies", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        console.log(" Status:", response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log("✅ Maladies reçues:", data);
          setMaladies(data);
          if (data.length > 0) {
            setSelectedMaladie(data[0].id.toString());
          }
        } else {
          console.error(" Erreur API:", response.status);
        }
      } catch (error) {
        console.error(" Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaladies();
  }, []);

  const handleExport = () => {
    alert("Fonctionnalité d'export de la carte en développement...");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 w-full relative z-10 bg-gray-50">
      
      {/* En-tête */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Map className="w-8 h-8 text-emerald-600" />
          Cartographie Épidémiologique
        </h1>
        <p className="text-slate-500 mt-1">
          Visualisation géographique des données de surveillance sur les 24 régions de Madagascar
        </p>
      </div>

     
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          
         
          <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-slate-600">
              <Filter className="w-5 h-5" />
              <span className="font-medium text-sm">Filtrer par maladie</span>
            </div>
            <select
              value={selectedMaladie}
              onChange={(e) => setSelectedMaladie(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm bg-white min-w-[200px]"
            >
              <option value="">Toutes les maladies</option>
              {maladies.length > 0 ? (
                maladies.map((m) => (
                  <option key={m.id} value={m.id.toString()}>
                    {m.nom || m.nom_officiel}
                  </option>
                ))
              ) : (
                <option value="" disabled>Aucune maladie disponible</option>
              )}
            </select>
          </div>

         
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Exporter la carte
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-[700px] w-full">
          <RegionMap 
            maladieId={selectedMaladie ? parseInt(selectedMaladie) : null}
          />
        </div>
      </div>

     
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600" />
          Niveau d'alerte
        </h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
            <span className="text-sm text-slate-600">Stable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-slate-600">Modéré</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span className="text-sm text-slate-600">Élevé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-sm text-slate-600">Critique</span>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import api from '../../services/api';

export default function RegionMap({ onRegionSelect, selectedRegion, maladieId }) {
  const [regionsData, setRegionsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = maladieId ? { maladie_id: maladieId } : {};
        const response = await api.get('/carto', { params });
        console.log(" Données reçues de l'API pour la carte:", response.data);
        setRegionsData(response.data);
      } catch (err) {
        console.error("Erreur API carto:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [maladieId]);

  const getColor = (niveau) => {
    switch(niveau?.toLowerCase()) {
      case 'critique': return '#DC2626';
      case 'eleve': return '#F97316';
      case 'modere': return '#FACC15';
      case 'stable': return '#22C55E';
      default: return '#9CA3AF';
    }
  };

  const getRadius = (cas) => {
    const calculatedRadius = (cas || 0) / 400;
    return Math.max(10, Math.min(calculatedRadius, 35));
  };

  if (loading) {
    return (
      <div className="h-[600px] bg-gray-100 rounded-xl flex items-center justify-center">
        <p className="text-gray-600">Chargement de la carte...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden border border-gray-200 shadow-lg">
      <MapContainer 
        key={`map-${maladieId}`}
        center={[-18.7669, 46.8691]}
        zoom={6}
        minZoom={5}
        maxZoom={11}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {regionsData.map((region) => {
          // 
          console.log(` RENDU CARTE : ${region.nom} | Cas: ${region.cas} | Décès: ${region.deces}`);
          
          return (
            <CircleMarker
              key={`marker-${region.id}-${region.cas}`}
              center={[region.lat, region.lng]}
              radius={getRadius(region.cas)}
              pathOptions={{ 
                color: getColor(region.niveau),       
                fillColor: getColor(region.niveau),   
                fillOpacity: 0.5,
                weight: 2,
              }}
              eventHandlers={{ 
                click: () => {
                  console.log(" Clic sur région:", region.nom);
                  onRegionSelect && onRegionSelect(region);
                }
              }}
            >
              <Popup>
                <div className="text-center p-2 min-w-[220px]">
                  <h3 className="font-bold text-xl text-gray-800 mb-3">{region.nom}</h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Population</span>
                      <span className="font-semibold text-gray-800">{region.pop?.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Cas confirmés</span>
                      <span className="font-bold text-blue-600">{region.cas?.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Décès</span>
                      <span className="font-bold text-red-600">{region.deces?.toLocaleString() || 0}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Guéris</span>
                      <span className="font-bold text-green-600">{region.gueris?.toLocaleString() || 0}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Niveau d'alerte</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                        region.niveau === 'critique' ? 'bg-red-600' :
                        region.niveau === 'eleve' ? 'bg-orange-500' :
                        region.niveau === 'modere' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}>
                        {region.niveau === 'critique' ? 'Critique' :
                         region.niveau === 'eleve' ? 'Élevé' :
                         region.niveau === 'modere' ? 'Modéré' :
                         'Stable'}
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
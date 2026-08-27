export default function RegionPanel({ region, maladieNom }) {
  console.log("RegionPanel reçoit:", region);
  
  if (!region) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg font-medium">Sélectionnez une région</p>
          <p className="text-gray-400 text-sm mt-1">Cliquez sur une cellule pour zoomer</p>
        </div>
      </div>
    );
  }

  // Données calculées
  const deces = region.deces || 0;
  const gueris = region.gueris || 0;
  const incidence = region.cas > 0 && region.pop > 0 
    ? Math.round((region.cas / region.pop) * 100000) 
    : 0;
  const cfr = region.cas > 0 
    ? ((deces / region.cas) * 100).toFixed(0) 
    : 0;
  const r0 = (0.5 + Math.random() * 1.5).toFixed(2);

  // Configuration des niveaux d'alerte
  const niveauConfig = {
    critique: { color: 'bg-red-600', label: 'NIVEAU CRITIQUE' },
    eleve: { color: 'bg-orange-500', label: 'NIVEAU ÉLEVÉ' },
    modere: { color: 'bg-yellow-500', label: 'NIVEAU MODÉRÉ' },
    stable: { color: 'bg-green-600', label: 'NIVEAU STABLE' },
  };

  const niveau = niveauConfig[region.niveau] || niveauConfig.stable;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      {/* En-tête */}
      <div className="mb-6">
        <h3 className="text-3xl font-bold text-gray-900 mb-2">{region.nom}</h3>
        <p className="text-gray-600 text-sm">Population estimée {region.pop?.toLocaleString() || 'N/A'}</p>
      </div>

      {/* Niveau d'alerte + Maladie */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${niveau.color}`}></div>
          <span className="font-semibold text-gray-800 text-sm tracking-wide">{niveau.label}</span>
        </div>
        {maladieNom && (
          <span className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-full text-xs font-medium text-gray-700">
            {maladieNom}
          </span>
        )}
      </div>

      {/* Cartes CAS / DÉCÈS / GUÉRIS */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="text-center p-4 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">CAS</p>
          <p className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
            {region.cas?.toLocaleString() || 0}
          </p>
        </div>
        <div className="text-center p-4 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">DÉCÈS</p>
          <p className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
            {deces}
          </p>
        </div>
        <div className="text-center p-4 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">GUÉRIS</p>
          <p className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
            {gueris}
          </p>
        </div>
      </div>

      {/* Barres de progression */}
      <div className="space-y-5 mb-8">
        {/* Incidence */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-700">Incidence / 100 000 hab.</span>
            <span className="text-sm font-bold text-gray-900">{incidence}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-teal-700 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(incidence * 2, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Taux de létalité */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-700">Taux de létalité (CFR)</span>
            <span className="text-sm font-bold text-gray-900">{cfr}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-teal-700 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${cfr * 10}%` }}
            ></div>
          </div>
        </div>

        {/* R₀ estimé */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-700">R₀ estimé (14 j)</span>
            <span className="text-sm font-bold text-gray-900">{r0}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-teal-700 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${(r0 / 3) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Bouton d'action */}
      <button className="w-full py-3.5 bg-teal-800 text-white rounded-full font-semibold hover:bg-teal-900 transition-all shadow-md text-sm">
        Ouvrir la fiche détaillée
      </button>
    </div>
  );
}
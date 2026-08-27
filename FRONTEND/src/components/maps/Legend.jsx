export default function Legend() {
  const niveaux = [
    { label: 'Stable', color: 'bg-green-500', border: 'border-green-600' },
    { label: 'Modéré', color: 'bg-yellow-500', border: 'border-yellow-600' },
    { label: 'Élevé', color: 'bg-orange-500', border: 'border-orange-600' },
    { label: 'Critique', color: 'bg-red-600', border: 'border-red-700' },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase">Niveau d'alerte</h4>
      <div className="space-y-2">
        {niveaux.map((niveau, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full border-2 ${niveau.color} ${niveau.border}`}></div>
            <span className="text-sm text-gray-700 font-medium">{niveau.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
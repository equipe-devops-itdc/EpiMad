import React, { useState } from "react";
import { Settings2, Save, RotateCcw, Brain, Sliders, CheckCircle } from "lucide-react";

const DEFAULT_CONFIG = {
  modele: "arima",
  horizon_max: 4,
  intervalle_confiance: 95,
  sensibilite: 70,
  bruit_minimum: 5,
  historique_semaines: 52,
  ponderation_recente: 70,
};

const MODELS = [
  { 
    value: "arima", 
    label: "Modèle Statistique (ARIMA)", 
    desc: "Autorégressif intégré, robuste pour les séries temporelles épidémiologiques" 
  },
  { 
    value: "xgboost", 
    label: "Modèle Machine Learning (XGBoost)", 
    desc: "Gradient boosting, idéal pour les données complexes et non-linéaires" 
  },
];

// Composant Section
function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-emerald-100 p-8 shadow-sm">
      <div className="flex items-center gap-4 mb-8 pb-5 border-b border-emerald-100">
        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
          <Icon className="w-6 h-6 text-emerald-700" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      </div>
      <div className="space-y-8">{children}</div>
    </div>
  );
}

// Composant Field
function Field({ label, hint, children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
      <div className="sm:col-span-5">
        <p className="text-base font-bold text-slate-800">{label}</p>
        {hint && <p className="text-sm text-slate-500 mt-2 leading-relaxed">{hint}</p>}
      </div>
      <div className="sm:col-span-7">{children}</div>
    </div>
  );
}

export default function ConfigModeles() {
  
  const savedConfig = localStorage.getItem('epimad_model_config');
  const initialConfig = savedConfig ? JSON.parse(savedConfig) : DEFAULT_CONFIG;
  
  const [config, setConfig] = useState({ ...DEFAULT_CONFIG });
  const [saved, setSaved] = useState(false);

  const set = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {

    localStorage.setItem('epimad_model_config', JSON.stringify(config));
    console.log("Sauvegarde de la configuration:", config);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => setConfig({ ...DEFAULT_CONFIG });

  return (
    <div className="flex flex-col h-full bg-emerald-50/30 relative">
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 w-full relative z-10">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-lg">
              <Settings2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Configuration des modèles de prédiction</h1>
              <p className="text-base text-slate-500 mt-1">Paramètres des algorithmes ARIMA et XGBoost pour les projections épidémiologiques</p>
            </div>
          </div>
        </div>

        {saved && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 text-base font-medium text-emerald-800 shadow-sm">
            <CheckCircle className="w-6 h-6 flex-shrink-0 text-emerald-600" />
            Configuration sauvegardée avec succès dans le système.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Modèle */}
          <Section icon={Brain} title="Modèle de prédiction">
            <div className="space-y-4 mb-8">
              {MODELS.map(m => (
                <label 
                  key={m.value} 
                  className={`flex items-start gap-5 p-5 rounded-xl border-2 cursor-pointer transition-all ${
                    config.modele === m.value 
                      ? "border-emerald-500 bg-emerald-50 shadow-sm" 
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <input 
                    type="radio" 
                    name="modele" 
                    value={m.value} 
                    checked={config.modele === m.value} 
                    onChange={e => set("modele", e.target.value)} 
                    className="mt-1 w-5 h-5 text-emerald-600 accent-emerald-600" 
                  />
                  <div>
                    <p className="text-base font-bold text-slate-800">{m.label}</p>
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <Field label="Horizon de prévision" hint="Nombre de semaines futures projetées">
              <div className="flex items-center gap-5">
                <input 
                  type="range" min={2} max={12} step={2} value={config.horizon_max}
                  onChange={e => set("horizon_max", Number(e.target.value))}
                  className="flex-1 h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600" 
                />
                <span className="w-24 text-center text-base font-bold text-emerald-700 bg-emerald-100 rounded-lg py-2 tabular-nums border border-emerald-200">
                  {config.horizon_max} sem.
                </span>
              </div>
            </Field>

            <Field label="Intervalle de confiance" hint="Niveau de confiance statistique des bornes (%)">
              <div className="flex items-center gap-5">
                <input 
                  type="range" min={50} max={99} step={5} value={config.intervalle_confiance}
                  onChange={e => set("intervalle_confiance", Number(e.target.value))}
                  className="flex-1 h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600" 
                />
                <span className="w-24 text-center text-base font-bold text-emerald-700 bg-emerald-100 rounded-lg py-2 tabular-nums border border-emerald-200">
                  {config.intervalle_confiance}%
                </span>
              </div>
            </Field>
          </Section>

         
          <Section icon={Sliders} title="Sensibilité de détection">
            <Field label="Niveau de sensibilité" hint="Plus élevé = plus d'alertes (risque accru de faux positifs)">
              <div className="flex items-center gap-5">
                <input 
                  type="range" min={10} max={100} step={5} value={config.sensibilite}
                  onChange={e => set("sensibilite", Number(e.target.value))}
                  className="flex-1 h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600" 
                />
                <span className={`w-24 text-center text-base font-bold rounded-lg py-2 tabular-nums border-2 ${
                  config.sensibilite >= 80 ? "text-white bg-red-500 border-red-600" : 
                  config.sensibilite >= 60 ? "text-white bg-emerald-500 border-emerald-600" : 
                  "text-white bg-blue-500 border-blue-600"
                }`}>
                  {config.sensibilite}%
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-3 flex items-center gap-2">
                {config.sensibilite >= 80 ? "⚠️ Haute sensibilité — nombreuses alertes" : 
                 config.sensibilite >= 60 ? "✓ Sensibilité équilibrée" : 
                 "ℹ️ Basse sensibilité — alertes rares"}
              </p>
            </Field>

            <Field label="Bruit minimum ignoré" hint="Variations inférieures à ce seuil sont filtrées">
              <div className="flex items-center gap-5">
                <input 
                  type="range" min={1} max={20} step={1} value={config.bruit_minimum}
                  onChange={e => set("bruit_minimum", Number(e.target.value))}
                  className="flex-1 h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600" 
                />
                <span className="w-24 text-center text-base font-bold text-white bg-slate-500 rounded-lg py-2 tabular-nums border-2 border-slate-600">
                  {config.bruit_minimum}%
                </span>
              </div>
            </Field>

            <Field label="Données historiques" hint="Nombre de semaines passées utilisées pour l'entraînement">
              <div className="flex items-center gap-5">
                <input 
                  type="range" min={4} max={26} step={2} value={config.historique_semaines}
                  onChange={e => set("historique_semaines", Number(e.target.value))}
                  className="flex-1 h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600" 
                />
                <span className="w-24 text-center text-base font-bold text-white bg-slate-500 rounded-lg py-2 tabular-nums border-2 border-slate-600">
                  {config.historique_semaines} sem.
                </span>
              </div>
            </Field>

            <Field label="Pondération récente" hint="% de poids accordé aux semaines les plus récentes">
              <div className="flex items-center gap-5">
                <input 
                  type="range" min={30} max={95} step={5} value={config.ponderation_recente}
                  onChange={e => set("ponderation_recente", Number(e.target.value))}
                  className="flex-1 h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600" 
                />
                <span className="w-24 text-center text-base font-bold text-white bg-slate-500 rounded-lg py-2 tabular-nums border-2 border-slate-600">
                  {config.ponderation_recente}%
                </span>
              </div>
            </Field>
          </Section>

        </div>

        <div className="flex justify-end gap-4 pb-6 pt-4 border-t border-emerald-100">
          <button 
            onClick={handleReset} 
            className="flex items-center gap-2 px-7 py-4 text-base font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RotateCcw className="w-5 h-5" />
            Réinitialiser les valeurs par défaut
          </button>
          <button 
            onClick={handleSave} 
            className="flex items-center gap-2 px-9 py-4 text-base font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-lg"
          >
            {saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {saved ? "Configuration sauvegardée" : "Sauvegarder la configuration"}
          </button>
        </div>
      </div>
    </div>
  );
}
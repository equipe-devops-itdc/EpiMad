import React from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Brain, Bell, TrendingUp, ChevronRight } from "lucide-react";

export default function Accueil() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Activity,
      title: "Surveillance en Temps Réel",
      description: "Suivi épidémiologique des 24 régions de Madagascar avec données actualisées",
      color: "emerald"
    },
    {
      icon: Brain,
      title: "Prédictions IA",
      description: "Modèles ARIMA et XGBoost pour anticiper les épidémies",
      color: "blue"
    },
    {
      icon: Bell,
      title: "Alertes Automatiques",
      description: "Détection automatique des seuils épidémiques et alertes précoces",
      color: "red"
    },
    {
      icon: TrendingUp,
      title: "Analyses Avancées",
      description: "Tableaux de bord interactifs et rapports détaillés",
      color: "purple"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-700 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Tableau de Bord Épidémiologique<br />
              <span className="text-emerald-200">Ministère de la Santé Publique</span>
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100 max-w-3xl mx-auto">
              Surveillance en temps réel, prédictions IA et alertes précoces pour les 24 régions de Madagascar
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-8 py-4 bg-white text-emerald-700 rounded-xl font-semibold text-lg hover:bg-emerald-50 transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                Accéder au Dashboard
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate("/previsions")}
                className="px-8 py-4 bg-emerald-700/50 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-semibold text-lg hover:bg-emerald-700/70 transition-colors"
              >
                Voir les Prédictions
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
            Fonctionnalités Principales
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              const colorClasses = {
                emerald: "bg-emerald-100 text-emerald-700",
                blue: "bg-blue-100 text-blue-700",
                red: "bg-red-100 text-red-700",
                purple: "bg-purple-100 text-purple-700"
              };
              
              return (
                <div 
                  key={idx} 
                  className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-slate-100"
                >
                  <div className={`w-14 h-14 ${colorClasses[feature.color]} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-md text-center">
              <p className="text-4xl font-bold text-emerald-600 mb-2">24</p>
              <p className="text-slate-600 text-sm">Régions Surveillées</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md text-center">
              <p className="text-4xl font-bold text-blue-600 mb-2">6</p>
              <p className="text-slate-600 text-sm">Maladies Suivies</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md text-center">
              <p className="text-4xl font-bold text-purple-600 mb-2">2</p>
              <p className="text-slate-600 text-sm">Modèles IA</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md text-center">
              <p className="text-4xl font-bold text-red-600 mb-2">24/7</p>
              <p className="text-slate-600 text-sm">Surveillance</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
import { useState, useEffect } from 'react';
import {
  Activity, Skull, Heart, AlertTriangle, TrendingUp, TrendingDown,
  Users, MapPin, Loader2
} from 'lucide-react';

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function Home() {
  const [kpi, setKpi] = useState(null);
  const [evolution, setEvolution] = useState([]);
  const [repartition, setRepartition] = useState([]);
  const [topRegions, setTopRegions] = useState([]);
  const [comparatif, setComparatif] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://127.0.0.1:8000/api/dashboard";
  const token = localStorage.getItem("token");

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const endpoints = ['/kpi', '/evolution-cas', '/repartition-maladies', '/top-regions', '/comparatif-regions'];
      const responses = await Promise.all(
        endpoints.map(ep => 
          fetch(`${API_URL}${ep}`, { headers: { "Authorization": `Bearer ${token}` } })
        )
      );
      const data = await Promise.all(responses.map(r => r.json()));
      setKpi(data[0]);
      setEvolution(data[1]);
      setRepartition(data[2]);
      setTopRegions(data[3]);
      setComparatif(data[4]);
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: "Cas Confirmés",
      value: kpi?.total_cas?.toLocaleString() || 0,
      icon: Activity,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      trend: "+4.2%",
      trendUp: true,
      subtitle: "Total cumulé année 2026"
    },
    {
      title: "Décès Cumulés",
      value: kpi?.total_deces?.toLocaleString() || 0,
      icon: Skull,
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      trend: "-1.8%",
      trendUp: false,
      subtitle: `Taux: ${kpi?.taux_letalite || 0}%(2026)`
    },
    {
      title: "Guérisons",
      value: kpi?.total_gueris?.toLocaleString() || 0,
      icon: Heart,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      trend: "+6.1%",
      trendUp: true,
      subtitle: `Taux: ${kpi?.taux_guerison || 0}%(2026)`
    },
    {
      title: "Régions en Alerte",
      value: `${kpi?.regions_alerte || 0} / ${kpi?.total_regions || 24}`,
      icon: AlertTriangle,
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      trend: "+2",
      trendUp: true,
      subtitle: "Seuil: >500 cas"
    }
  ];

return (
  <div className="flex-1 overflow-y-auto w-full min-w-0 bg-gray-50">
    
    <header className="bg-gradient-to-r from-[#0d3b28] to-[#155c3d] px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between text-white shadow-md relative overflow-hidden w-full">
      
      <div className="text-center flex-1 px-2">
        <div className="text-[9px] sm:text-[11px] tracking-wider opacity-90 uppercase font-medium">
          EpiMad
        </div>
        <div className="text-[11px] sm:text-sm font-bold tracking-wide mt-0.5 uppercase leading-tight">
          Surveillance Épidémiologique Nationale
        </div>
      </div>
      <div className="w-9 sm:w-10 flex-shrink-0" />
      
      {/* BARRE  */}
      <div className="absolute bottom-0 left-0 right-0 flex h-1">
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-red-600"></div>
        <div className="flex-1 bg-emerald-600"></div>
      </div>
    </header>

    {/* PADDING */}
    <div className="p-4 sm:p-6 lg:p-8">
      
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800">
          Tableau de Bord de Performance
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
          Vue d'ensemble des indicateurs clés (KPI) et tendances épidémiologiques
        </p>
      </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpiCards.map((kpi, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className={`${kpi.bgColor} p-2 sm:p-3 rounded-lg`}>
                  <kpi.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${kpi.iconColor}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs sm:text-sm font-medium ${kpi.trendUp ? 'text-red-600' : 'text-emerald-600'}`}>
                  {kpi.trendUp ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />}
                  {kpi.trend}
                </div>
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-slate-600 mb-1">{kpi.title}</h3>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 mb-1">{kpi.value}</p>
              <p className="text-xs text-slate-400">{kpi.subtitle}</p>
            </div>
          ))}
        </div>

        {/* Graphiques - Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Évolution des Cas et Décès
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mois" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="cas" stroke="#3b82f6" strokeWidth={2} name="Cas" />
                <Line type="monotone" dataKey="deces" stroke="#ef4444" strokeWidth={2} name="Décès" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Répartition par Maladie
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={repartition}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  fontSize={12}
                >
                  {repartition.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphiques - Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          
         
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              Top 10 Régions (Cas confirmés)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topRegions} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis type="category" dataKey="region" stroke="#64748b" fontSize={11} width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Bar dataKey="cas" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-emerald-600" />
              Décès vs Guérisons par Région
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparatif}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="region" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="deces" fill="#ef4444" name="Décès" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gueris" fill="#10b981" name="Guérisons" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
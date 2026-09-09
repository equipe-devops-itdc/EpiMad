import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Bell, 
  Settings, 
  User, 
  LogOut,
  ChevronDown,
  Activity,
  Map,
  FileText,
  Brain
} from "lucide-react";

export default function HeaderNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dashboardMenuOpen, setDashboardMenuOpen] = useState(false);

  const menuItems = [
    { path: "/", label: "Accueil", icon: LayoutDashboard },
    { path: "/dashboard", label: "Epi Dashboard", icon: Activity },
    { path: "/cartographie", label: "Cartographie", icon: Map },
    { path: "/alertes", label: "Alertes IA", icon: Bell },
    { path: "/previsions", label: "Prédictions", icon: TrendingUp },
    { path: "/rapports", label: "Rapports", icon: FileText },
    { path: "/config", label: "Config. IA", icon: Brain },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo et Nom */}
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">EpiMad</h1>
              <p className="text-xs text-slate-500 -mt-1">Surveillance Épidémiologique</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? "bg-emerald-50 text-emerald-700" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Compte</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800">R. Fetranaina</p>
                  <p className="text-xs text-slate-500">Administrateur - MinSanP</p>
                </div>
                <button
                  onClick={() => {
                    navigate("/profil");
                    setDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Mon Profil
                </button>
                <button
                  onClick={() => {
                    navigate("/parametres");
                    setDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Paramètres
                </button>
                <div className="border-t border-slate-100 mt-2 pt-2">
                  <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
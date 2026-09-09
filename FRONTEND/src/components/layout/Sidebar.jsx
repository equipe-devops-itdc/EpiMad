import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  Activity, 
  Bell, 
  FileText, 
  Users, 
  Database,
  Stethoscope,
  Brain,
  Settings,
  BarChart3,
  Upload
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: "Vue d'ensemble", path: '/' },
    { icon: Map, label: 'Cartographie', path: '/cartographie' },
    { icon: Activity, label: 'Maladies', path: '/maladies' },
    { icon: Bell, label: 'Alertes', path: '/alertes' },
    { icon: FileText, label: 'Rapports', path: '/rapports' },
    { icon: BarChart3, label: 'Comparatif', path: '/comparatif' },
     { icon: Brain, label: 'Prédictions', active: false, path: '/previsions' },
    { icon: Settings, label: 'Config. Modeles', path: '/config-modeles' },
    { icon: Upload, label: 'Import de fichiers', path: '/import' },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-primary to-blue-800 text-white min-h-screen fixed top-0 left-0 p-4 flex flex-col z-50">
      
      <div className="mb-10 mt-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
            <Stethoscope size={28} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight">
              Epi<span className="text-orange-500">Mada</span>
            </h1>
            <p className="text-xs text-gray-300 uppercase tracking-wider">Surveillance Epidémiologique</p>
          </div>
        </div>
      </div>

      
      <nav className="space-y-1 flex-1">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 px-4">DECISIONNEL</p>
        {menuItems.map((item, index) => {
          
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={index}
              to={item.path}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-white/20 text-white shadow-lg' 
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

     
      <div className="pt-6 border-t border-gray-700/50">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 px-4">ADMINISTRATION</p>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white rounded-lg transition-all">
          <Users size={20} />
          <span className="font-medium">Utilisateurs</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white rounded-lg transition-all">
          <Database size={20} />
          <span className="font-medium">Sources de données</span>
        </button>
      </div>

      
      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg backdrop-blur-sm">
        <p className="text-xs text-gray-400 uppercase mb-1">SESSION</p>
        <p className="text-sm font-semibold text-white">R. Fetranaina</p>
        <p className="text-xs text-gray-400">Administrateur · MinSanP</p>
      </div>
    </div>
  );
}
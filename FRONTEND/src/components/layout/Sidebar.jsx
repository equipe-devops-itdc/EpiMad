import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Map, Activity, Bell, FileText, Users, Database,
  Stethoscope, BarChart3, Upload, LogOut, Archive,
  ChevronLeft, Menu
} from 'lucide-react';
import caduceeLogo from '../../assets/caducee.png';

export default function Sidebar({ isCollapsed, onToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const allMenuItems = [
    { icon: LayoutDashboard, label: "Vue d'ensemble", path: '/home', roles: ['Admin', 'Epidemiologiste', 'Lecteur'] },
    { icon: Map, label: 'Cartographie', path: '/cartographie', roles: ['Admin', 'Epidemiologiste', 'Lecteur'] },
    { icon: Activity, label: 'Maladies', path: '/maladies', roles: ['Admin', 'Epidemiologiste', 'Lecteur', 'Saisisseur'] },
    { icon: Bell, label: 'Alertes', path: '/alertes', roles: ['Admin', 'Epidemiologiste'] },
    { icon: FileText, label: 'Rapports', path: '/rapports', roles: ['Admin', 'Epidemiologiste', 'Lecteur'] },
    { icon: BarChart3, label: 'Comparatif', path: '/comparatif', roles: ['Admin', 'Epidemiologiste'] },
    { icon: Stethoscope, label: 'Prédictions', path: '/previsions', roles: ['Admin', 'Epidemiologiste'] },
    { icon: LayoutDashboard, label: 'Config. Modèles', path: '/config-modeles', roles: ['Admin', 'Epidemiologiste'] },
    { icon: Upload, label: 'Import de fichiers', path: '/import', roles: ['Admin', 'Epidemiologiste', 'Saisisseur'] },
    { icon: Archive, label: 'Historique Données', path: '/historique-donnees', roles: ['Admin', 'Epidemiologiste', 'Lecteur'] },
  ];

  const adminOnlyItems = [
    { icon: Users, label: 'Gestion Utilisateurs', path: '/gestion-utilisateurs', roles: ['Admin'] },
    { icon: Database, label: 'Sources de données', path: '/sources-donnees', roles: ['Admin'] },
  ];

  const visibleMenuItems = allMenuItems.filter(item => item.roles.includes(user?.role));
  const visibleAdminItems = adminOnlyItems.filter(item => item.roles.includes(user?.role));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
    <div className={`bg-gradient-to-b from-[#0d3b28] to-[#155c3d] text-white h-screen fixed top-0 left-0 flex flex-col z-40 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        
    <div className="p-4 border-b border-white/10 flex items-center justify-center flex-shrink-0">
      {!isCollapsed ? (
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden p-1">
              <img 
                src={caduceeLogo} 
                alt="Logo EpiMad" 
                className="w-full h-full object-contain"
              />
            </div>    
            <div className="whitespace-nowrap">
              <h1 className="font-bold text-lg tracking-tight">
                Epi<span className="text-emerald-400">Mad</span>
              </h1>
              <p className="text-[10px] text-emerald-200 uppercase tracking-wider">
                Surveillance
              </p>
           </div>
         </div>

        <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title="Réduire le menu"
         >
          <ChevronLeft size={20} />
        </button>
    </div>

  ) : (
    
    <button
      onClick={onToggle}
      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
      title="Ouvrir le menu"
    >
      <Menu size={22} />
    </button>

  )}

</div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {!isCollapsed && (
            <p className="text-[10px] text-emerald-300/70 uppercase tracking-wider mb-3 px-4 font-semibold">
              Décisionnel
            </p>
          )}
          
          {visibleMenuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <div
                key={index}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.label : ''}
              >
                <item.icon size={20} className="flex-shrink-0" />
                {!isCollapsed && <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>}
              </div>
            );
          })}

          {visibleAdminItems.length > 0 && (
            <div className="pt-6 mt-6 border-t border-white/10">
              {!isCollapsed && (
                <p className="text-[10px] text-emerald-300/70 uppercase tracking-wider mb-3 px-4 font-semibold">
                  Administration
                </p>
              )}
              {visibleAdminItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <div
                    key={index}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? 'bg-white/20 text-white shadow-lg' 
                        : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <item.icon size={20} className="flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>}
                  </div>
                );
              })}
            </div>
          )}
        </nav>

        <div className="p-3 border-t border-white/10 bg-black/20 flex-shrink-0">
          {!isCollapsed ? (
            <>
              <div className="mb-3 px-1">
                <p className="text-[10px] text-emerald-300/70 uppercase mb-1 font-semibold">Session</p>
                {user ? (
                  <>
                    <p className="text-sm font-semibold text-white truncate">{user.prenom} {user.nom}</p>
                    <p className="text-[10px] text-emerald-200">{user.role} · MinSanP</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">Non connecté</p>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-lg transition-all text-sm font-medium border border-red-600/30 hover:border-red-600"
              >
                <LogOut size={16} />
                <span>Déconnexion</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-3 text-red-300 hover:bg-red-600/20 hover:text-white rounded-lg transition-all"
              title="Déconnexion"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import LoadingScreen from './components/layout/LoadingScreen';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/layout/Footer';

import Home from './pages/Home';
import ConfigModeles from './pages/ConfigModeles';
import PrevisionsIA from './pages/PrevisionsIA';
import AlertesIA from './pages/AlertesIA';
import ComparatifRegions from './pages/ComparatifRegions';
import ImportETL from './pages/ImportETL';
import Maladies from './pages/Maladies';
import Login from './pages/Login';
import ValidationAttente from './pages/ValidationAttente';
import GestionUtilisateurs from './pages/GestionUtilisateurs';
import Register from './pages/Register';
import HistoriqueDonnees from './pages/HistoriqueDonnees';
import Cartographie from './pages/Cartographie';
import Rapports from './pages/Rapports';

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // ← STATE ICI
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <LoadingScreen />;

  const publicPages = ['/login', '/register', '/validation-attente'];
  const showSidebar = !publicPages.includes(location.pathname);
  const sidebarWidth = isSidebarCollapsed ? 64 : 256;

return (
  <div className="min-h-screen bg-gray-50 overflow-x-hidden">

    {showSidebar && (
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
    )}

    <main
      className={`
        min-h-screen
        min-w-0
        transition-[margin-left]
        duration-300
        ease-in-out
        ${showSidebar
          ? isSidebarCollapsed
            ? 'ml-16'
            : 'ml-64'
          : 'ml-0'
        }
      `}
    >
        <Routes>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/validation-attente" element={<ValidationAttente />} />
          
          <Route path="/home" element={<ProtectedRoute allowedRoles={['Admin', 'Epidemiologiste', 'Lecteur', 'Saisisseur']}><Home /></ProtectedRoute>} />
          
          <Route path="/maladies" element={<ProtectedRoute allowedRoles={['Admin', 'Epidemiologiste', 'Lecteur', 'Saisisseur']}><Maladies /></ProtectedRoute>} />
          
          <Route path="/config-modeles" element={<ProtectedRoute allowedRoles={['Admin', 'Epidemiologiste']}><ConfigModeles /></ProtectedRoute>} />
          
          <Route path="/previsions" element={<ProtectedRoute allowedRoles={['Admin', 'Epidemiologiste']}><PrevisionsIA /></ProtectedRoute>} />
          
          <Route path="/alertes" element={<ProtectedRoute allowedRoles={['Admin', 'Epidemiologiste']}><AlertesIA /></ProtectedRoute>} />
          
          <Route path="/comparatif" element={<ProtectedRoute allowedRoles={['Admin', 'Epidemiologiste', 'Lecteur']}><ComparatifRegions /></ProtectedRoute>} />
         
          <Route path="/historique-donnees" element={<ProtectedRoute allowedRoles={['Admin', 'Epidemiologiste', 'Lecteur']}><HistoriqueDonnees /></ProtectedRoute>} />
          
          <Route path="/import" element={<ProtectedRoute allowedRoles={['Admin', 'Epidemiologiste', 'Saisisseur']}><ImportETL /></ProtectedRoute>} />
          
          <Route path="/gestion-utilisateurs" element={<ProtectedRoute allowedRoles={['Admin']}><GestionUtilisateurs /></ProtectedRoute>} />
         
          <Route path="/cartographie" element={<ProtectedRoute allowedRoles={['Admin', 'Epidemiologiste', 'Lecteur']}><Cartographie /></ProtectedRoute>} />
          
          <Route path="/rapports" element={<ProtectedRoute allowedRoles={['Admin', 'Epidemiologiste', 'Lecteur']}><Rapports /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/home" replace />} />
        
        </Routes>
        <Footer />
         </main>
      </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
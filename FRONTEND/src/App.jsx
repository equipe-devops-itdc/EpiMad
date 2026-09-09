import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import LoadingScreen from './components/layout/LoadingScreen';
import ChatWidget from './components/chat/ChatWidget';
import Home from './pages/Home';
import ConfigModeles from './pages/ConfigModeles';
import PrevisionsIA from './pages/PrevisionsIA';
import AlertesIA from './pages/AlertesIA';
import ComparatifRegions from './pages/ComparatifRegions';
import ImportETL from './pages/ImportETL';
import Maladies from './pages/Maladies';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Router>

      <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
        <div className="fixed left-0 top-0 h-screen z-40">
          <Sidebar />
        </div>
        
        <div className="flex-1 ml-64 w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/config-modeles" element={<ConfigModeles />} />
            <Route path="/previsions" element={<PrevisionsIA />} />
            <Route path="/alertes" element={<AlertesIA />} />
            <Route path="/comparatif" element={<ComparatifRegions />} />
            <Route path="/import" element={<ImportETL />} />
            <Route path="/maladies" element={<Maladies />} />
          </Routes>
        </div>
      </div>
      
    </Router>
  );
}

export default App;
import { Search, Download, Bell } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="p-4">
        <div className="flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-primary bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">FLUX OMS · MINISTERE · EN DIRECT</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher une région, une maladie..."
                className="pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full w-96 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
              />
            </div>

            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm">
              <Download size={18} />
              <span className="font-medium">Exporter</span>
            </button>

           
            <button className="relative p-2.5 hover:bg-gray-100 rounded-lg transition-all">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                4
              </span>
            </button>
            <div className="px-4 py-2.5 bg-primary/10 rounded-lg text-sm border border-primary/20">
              <span className="text-secondary">Sem. épi.</span>
              <span className="font-bold ml-2 text-primary">2026-W28</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
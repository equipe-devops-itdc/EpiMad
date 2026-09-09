import React from "react";
import { Activity } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-blue-600 flex flex-col items-center justify-center z-50">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full border-4 border-blue-400 flex items-center justify-center animate-pulse">
          <Activity className="w-12 h-12 text-white animate-bounce" />
        </div>
        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-white animate-spin" />
      </div>

      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          EpiMad
        </h1>
        <p className="text-blue-100 text-lg font-medium animate-pulse">
          Chargement des données épidémiologiques...
        </p>
        <p className="text-blue-200 text-sm">
          Surveillance Epidémiologique · Madagascar
        </p>
      </div>

      <div className="mt-12 w-64 h-1 bg-blue-800 rounded-full overflow-hidden">
        <div className="h-full bg-white rounded-full animate-[loading_2s_ease-in-out_infinite]" 
             style={{ 
               width: '60%',
               animation: 'loading 1.5s ease-in-out infinite'
             }} 
        />
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
}
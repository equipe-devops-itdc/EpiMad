import React from "react";
import { FileText } from "lucide-react";

export default function Rapports() {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 w-full relative z-10 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-3">
          <FileText className="w-8 h-8 text-emerald-600" />
          Rapports Épidémiologiques
        </h1>
        <p className="text-slate-500 mt-1">
          Page en cours de développement...
        </p>
      </div>
      
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
        <FileText className="w-24 h-24 text-slate-300 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-slate-700 mb-2"> Page en construction</h2>
        <p className="text-slate-500">
          Les rapports et bulletins seront disponibles prochainement.
        </p>
      </div>
    </div>
  );
}
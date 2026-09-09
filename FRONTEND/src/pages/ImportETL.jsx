import React, { useState, useEffect } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Download, X, Brain, Loader2 } from "lucide-react";
import { getMaladies, uploadData } from "../services/importService";

export default function ImportETL() {
  const [file, setFile] = useState(null);
  const [maladieNom, setMaladieNom] = useState("");
  const [maladiesExistantes, setMaladiesExistantes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    getMaladies()
      .then((data) => {
        const liste = Array.isArray(data) ? data : data.data || [];
        setMaladiesExistantes(liste);
      })
      .catch((err) => console.error("Erreur chargement maladies:", err));
  }, []);

  const handleUpload = async () => {
    if (!file || !maladieNom.trim()) return;
    
    setUploading(true);
    setResult(null);

    try {
     
      const data = await uploadData(file, maladieNom.trim());
      setResult({ success: true, ...data });
    } catch (error) {
      setResult({ success: false, message: error.message });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = "date,region,district,cas_notifies,cas_confirmes,cas_suspects,tests_effectues,taux_positivite,guerisons,deces,nouveaux_cas_confirmes,nouveaux_deces,source";
    const sampleRow = "2026-09-01,Analamanga,Antananarivo I,100,90,10,200,45,80,2,90,1,CHU";
    const csvContent = `${headers}\n${sampleRow}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "modele_import_epimad.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 w-full relative z-10 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Upload className="w-8 h-8 text-emerald-600" />
          Import de Données Pour ETL
        </h1>
        <p className="text-slate-500 mt-1">
          Entrez le nom de la maladie, uploadez le CSV, pour alimenter le système.
        </p>
      </div>

     
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">1</span>
          Nom de la maladie
        </h2>
        
        
        <input
          list="maladies-options"
          value={maladieNom}
          onChange={(e) => setMaladieNom(e.target.value)}
          placeholder="Tapez le nom (ex: Paludisme) ou choisissez..."
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none bg-white text-base"
        />
        <datalist id="maladies-options">
          {maladiesExistantes.map((m) => (
            <option key={m.id} value={m.nom_officiel || m.nom} />
          ))}
        </datalist>
        
        <p className="text-xs text-slate-500 mt-2">
          ℹ️ Si la maladie n'existe pas, le système la créera automatiquement avec un nouvel ID.
        </p>
      </div>

      
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">2</span>
          Fichier de données (CSV)
        </h2>
        
        <label className="block border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 hover:border-emerald-400 transition-colors cursor-pointer relative">
          <input 
            type="file" 
            accept=".csv,.xlsx,.xls" 
            onChange={(e) => setFile(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-700 font-semibold text-lg">
            {file ? file.name : "Cliquez ou glissez votre fichier ici"}
          </p>
        </label>

        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={handleUpload}
            disabled={!file || !maladieNom.trim() || uploading}
            className="flex-1 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
          >
            {uploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Traitement...</> : "Importer et Lancer l'IA"}
          </button>
          
        </div>
      </div>

      {/* Résultat */}
      {result && (
        <div className={`rounded-xl p-6 border shadow-sm ${result.success ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
          <div className="flex items-start gap-4">
            {result.success ? <CheckCircle className="w-8 h-8 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />}
            <div className="flex-1">
              <h3 className={`text-xl font-bold ${result.success ? "text-emerald-800" : "text-red-800"}`}>
                {result.success ? "Succès !" : "Échec"}
              </h3>
              <p className={`mt-1 font-medium ${result.success ? "text-emerald-700" : "text-red-700"}`}>{result.message}</p>
              
              {result.success && (
                <div className="mt-4 space-y-3">
                  <div className="bg-white/60 p-3 rounded-lg border border-emerald-100">
                    <p className="text-sm font-bold text-emerald-800">🦠 Statut Maladie :</p>
                    <p className="text-sm text-emerald-700">{result.maladie_status}</p>
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg border border-emerald-100">
                    <p className="text-sm font-bold text-emerald-800 flex items-center gap-2"><Brain className="w-4 h-4" /> Statut IA :</p>
                    <p className="text-sm text-emerald-700">{result.ia_status}</p>
                  </div>
                  <a href="/previsions" className="inline-block mt-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm">
                    Aller aux Prédictions ➔
                  </a>
                </div>
              )}
              
              {result.errors && result.errors.length > 0 && (
                <ul className="mt-4 text-sm text-red-700 bg-red-100 p-3 rounded-lg space-y-1 max-h-40 overflow-y-auto">
                  {result.errors.map((err, i) => <li key={i}>• {err}</li>)}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
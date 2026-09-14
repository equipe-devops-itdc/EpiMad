import React, { useState, useEffect } from "react";
import {
  Upload, CheckCircle, AlertCircle, Download, X,
  Brain, Loader2, Eye, Send, History, Plus, Trash2,
  FileSpreadsheet, Pencil, ShieldCheck, AlertTriangle
} from "lucide-react";

export default function ImportETL() {
  // Configuration API
  const API_URL = "http://127.0.0.1:8000/api/import";
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  });

  const [activeTab, setActiveTab] = useState("import");
  const [mode, setMode] = useState("csv");
  const [etape, setEtape] = useState(1);
  const [nomDonnees, setNomDonnees] = useState("");
  const [maladieNom, setMaladieNom] = useState("");
  const [maladiesExistantes, setMaladiesExistantes] = useState([]);
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [importId, setImportId] = useState(null);
  const [historyList, setHistoryList] = useState([]);

  
  const [manualRows, setManualRows] = useState([{
    date: "", region: "", district: "", cas: 0, deces: 0, gueris: 0, hospitalisations: 0
  }]);

  useEffect(() => {
  
    setMaladiesExistantes([
      { id: 1, nom_officiel: "Paludisme" },
      { id: 2, nom_officiel: "Dengue" },
      { id: 3, nom_officiel: "Peste" },
      { id: 4, nom_officiel: "Choléra" }
    ]);
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/history`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setHistoryList(data);
      }
    } catch (error) {
      console.error("Erreur chargement historique:", error);
    }
  };

  const handleSaveDraft = async () => {
    if (!nomDonnees.trim() || !maladieNom.trim()) {
      alert("Veuillez remplir le nom des données et la maladie.");
      return;
    }
    setUploading(true);
    setResult(null);

    try {
      const payload = {
        nom_donnees: nomDonnees,
        maladie_nom: maladieNom,
        type_import: mode,
        donnees: previewData
      };

      const response = await fetch(`${API_URL}/draft`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Erreur lors de la sauvegarde");
      }

      const data = await response.json();
      setImportId(data.id);
      setEtape(2);

    } catch (error) {
      alert("Erreur : " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleVerify = async () => {
    const isValid = validateData();
    if (!isValid) return;
    setUploading(true);

    try {
      const response = await fetch(`${API_URL}/${importId}/verify`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ donnees_corrigees: previewData })
      });

      if (!response.ok) throw new Error("Erreur lors de la validation");
      
      setEtape(3);

    } catch (error) {
      alert("Erreur : " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitETL = async () => {
    setUploading(true);

    try {
      const response = await fetch(`${API_URL}/${importId}/submit-etl`, {
        method: "POST",
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Erreur lors de l'import ETL");
      }

      const data = await response.json();
      
      setResult({
        success: true,
        message: data.message,
        maladie_status: "Maladie traitée avec succès (Upsert)",
        ia_status: "Données intégrées dans le système"
      });

      fetchHistory();
      
      // Reset
      setEtape(1);
      setNomDonnees("");
      setMaladieNom("");
      setFile(null);
      setPreviewData([]);
      setImportId(null);
      setManualRows([{ date: "", region: "", district: "", cas: 0, deces: 0, gueris: 0, hospitalisations: 0 }]);

    } catch (error) {
      setResult({ success: false, message: error.message });
    } finally {
      setUploading(false);
    }
  };

  // FONCTIONS UTILITAIRES 
  const parseCSV = (text) => {
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map(h => h.trim());
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim());
      const row = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ""; });
      data.push(row);
    }
    return data;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const parsed = parseCSV(text);
      setPreviewData(parsed);
    };
    reader.readAsText(selectedFile);
  };

  const addManualRow = () => {
    setManualRows([...manualRows, { date: "", region: "", district: "", cas: 0, deces: 0, gueris: 0, hospitalisations: 0 }]);
  };

  const updateManualRow = (index, field, value) => {
    const newRows = [...manualRows];
    newRows[index][field] = value;
    setManualRows(newRows);
  };

  const removeManualRow = (index) => {
    setManualRows(manualRows.filter((_, i) => i !== index));
  };

  const validateData = () => {
    const newErrors = [];
    const regionsValid = ["Analamanga", "Atsimo-Atsinanana", "Diana", "Boeny", "Betsiboka"];

    previewData.forEach((row, idx) => {
      if (!row.date || !row.region) {
        newErrors.push({ row: idx + 1, field: "date/region", message: "Date et région obligatoires" });
      }
      if (row.cas !== undefined && parseInt(row.cas) < 0) {
        newErrors.push({ row: idx + 1, field: "cas", message: "Nombre de cas négatif" });
      }
      if (row.deces !== undefined && parseInt(row.deces) < 0) {
        newErrors.push({ row: idx + 1, field: "deces", message: "Nombre de décès négatif" });
      }
      if (row.region && !regionsValid.includes(row.region)) {
        newErrors.push({ row: idx + 1, field: "region", message: `Région "${row.region}" non reconnue` });
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const updateCell = (rowIdx, field, value) => {
    const newData = [...previewData];
    newData[rowIdx][field] = value;
    setPreviewData(newData);
    setErrors(errors.filter(e => !(e.row === rowIdx + 1 && e.field === field)));
  };

  const downloadTemplate = () => {
    const headers = "date,region,district,cas,deces,gueris,hospitalisations";
    const sampleRow = "2026-09-01,Analamanga,Antananarivo I,100,2,80,15";
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

  const getStatutColor = (statut) => {
    switch (statut) {
      case "Importe": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Verifie": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Brouillon": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 w-full relative z-10 bg-gray-50 min-h-screen">
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Upload className="w-8 h-8 text-emerald-600" />
          Import de Données ETL
        </h1>
        <p className="text-slate-500 mt-1">Saisissez ou importez vos données, vérifiez-les, puis soumettez-les à l'ETL.</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("import")}
          className={`px-5 py-3 font-semibold text-sm transition-colors flex items-center gap-2 ${activeTab === "import" ? "text-emerald-700 border-b-2 border-emerald-600" : "text-slate-500 hover:text-slate-700"}`}
        >
          <Upload className="w-4 h-4" /> Nouvel Import
        </button>
        <button
          onClick={() => setActiveTab("historique")}
          className={`px-5 py-3 font-semibold text-sm transition-colors flex items-center gap-2 ${activeTab === "historique" ? "text-emerald-700 border-b-2 border-emerald-600" : "text-slate-500 hover:text-slate-700"}`}
        >
          <History className="w-4 h-4" /> Historique ({historyList.length})
        </button>
      </div>

      {activeTab === "import" && (
        <>
          {/* Indicateur d'étapes */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              {[
                { num: 1, label: "Configuration", icon: FileSpreadsheet },
                { num: 2, label: "Vérification", icon: Eye },
                { num: 3, label: "Soumission ETL", icon: Send }
              ].map((step, idx) => (
                <React.Fragment key={step.num}>
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                      etape > step.num ? "bg-emerald-600 text-white" : etape === step.num ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-600" : "bg-slate-100 text-slate-400"
                    }`}>
                      {etape > step.num ? <CheckCircle className="w-6 h-6" /> : <step.icon className="w-5 h-5" />}
                    </div>
                    <span className={`text-xs font-medium mt-2 ${etape >= step.num ? "text-emerald-700" : "text-slate-400"}`}>{step.label}</span>
                  </div>
                  {idx < 2 && <div className={`flex-1 h-1 mx-2 rounded ${etape > step.num ? "bg-emerald-600" : "bg-slate-200"}`} />}
                </React.Fragment>
              ))}
            </div>
          </div>

          
          {etape === 1 && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">1</span>
                  Informations générales
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nom du jeu de données *</label>
                    <input type="text" value={nomDonnees} onChange={(e) => setNomDonnees(e.target.value)} placeholder="Ex: Cas_Paludisme_Septembre_2026" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Maladie associée *</label>
                    <input list="maladies-options" value={maladieNom} onChange={(e) => setMaladieNom(e.target.value)} placeholder="Tapez ou choisissez..." className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none" />
                    <datalist id="maladies-options">
                      {maladiesExistantes.map((m) => <option key={m.id} value={m.nom_officiel} />)}
                    </datalist>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">2</span>
                  Mode de saisie
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <label className={`p-6 border-2 rounded-xl text-left transition-all cursor-pointer ${mode === "csv" ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-slate-300"}`}>
                    <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                    <FileSpreadsheet className={`w-10 h-10 mb-3 ${mode === "csv" ? "text-emerald-600" : "text-slate-400"}`} />
                    <h3 className="font-bold text-slate-800">Import CSV</h3>
                    <p className="text-sm text-slate-500 mt-1">{file ? `✅ ${file.name}` : "Cliquez pour choisir un fichier CSV"}</p>
                  </label>

                  <button type="button" onClick={() => setMode("manuel")} className={`p-6 border-2 rounded-xl text-left transition-all ${mode === "manuel" ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-slate-300"}`}>
                    <Pencil className={`w-10 h-10 mb-3 ${mode === "manuel" ? "text-emerald-600" : "text-slate-400"}`} />
                    <h3 className="font-bold text-slate-800">Saisie manuelle</h3>
                    <p className="text-sm text-slate-500 mt-1">Entrez les données ligne par ligne</p>
                  </button>
                </div>

                {mode === "manuel" && (
                  <div className="mt-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-3 py-2 text-left text-xs font-bold text-slate-600">Date</th>
                            <th className="px-3 py-2 text-left text-xs font-bold text-slate-600">Région</th>
                            <th className="px-3 py-2 text-left text-xs font-bold text-slate-600">District</th>
                            <th className="px-3 py-2 text-left text-xs font-bold text-slate-600">Cas</th>
                            <th className="px-3 py-2 text-left text-xs font-bold text-slate-600">Décès</th>
                            <th className="px-3 py-2 text-left text-xs font-bold text-slate-600">Guéris</th>
                            <th className="px-3 py-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {manualRows.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-100">
                              <td className="px-2 py-1"><input type="date" value={row.date} onChange={(e) => updateManualRow(idx, "date", e.target.value)} className="w-full px-2 py-1 border border-slate-200 rounded text-sm" /></td>
                              <td className="px-2 py-1"><input type="text" value={row.region} onChange={(e) => updateManualRow(idx, "region", e.target.value)} className="w-full px-2 py-1 border border-slate-200 rounded text-sm" /></td>
                              <td className="px-2 py-1"><input type="text" value={row.district} onChange={(e) => updateManualRow(idx, "district", e.target.value)} className="w-full px-2 py-1 border border-slate-200 rounded text-sm" /></td>
                              <td className="px-2 py-1"><input type="number" value={row.cas} onChange={(e) => updateManualRow(idx, "cas", e.target.value)} className="w-full px-2 py-1 border border-slate-200 rounded text-sm" /></td>
                              <td className="px-2 py-1"><input type="number" value={row.deces} onChange={(e) => updateManualRow(idx, "deces", e.target.value)} className="w-full px-2 py-1 border border-slate-200 rounded text-sm" /></td>
                              <td className="px-2 py-1"><input type="number" value={row.gueris} onChange={(e) => updateManualRow(idx, "gueris", e.target.value)} className="w-full px-2 py-1 border border-slate-200 rounded text-sm" /></td>
                              <td className="px-2 py-1">
                                <button onClick={() => removeManualRow(idx)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button type="button" onClick={addManualRow} className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Ajouter une ligne
                    </button>
                  </div>
                )}

                {mode === "csv" && (
                  <button type="button" onClick={downloadTemplate} className="mt-4 text-sm text-emerald-700 hover:underline flex items-center gap-2">
                    <Download className="w-4 h-4" /> Télécharger le modèle CSV
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={uploading || (mode === "csv" && !file) || (mode === "manuel" && manualRows.length === 0) || !nomDonnees.trim() || !maladieNom.trim()}
                  className="mt-6 w-full px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
                >
                  {uploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Sauvegarde...</> : <><Eye className="w-5 h-5" /> Passer à la vérification</>}
                </button>
              </div>
            </div>
          )}

          
          {etape === 2 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">2</span>
                  Vérification des données
                </h2>
                <button onClick={() => setEtape(1)} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
                  <X className="w-4 h-4" /> Retour
                </button>
              </div>

              {errors.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-800">{errors.length} erreur(s) détectée(s)</p>
                    <p className="text-sm text-amber-700">Corrigez les cellules en rouge avant de continuer.</p>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-50">
                    <tr className="border-b border-slate-200">
                      {Object.keys(previewData[0] || {}).map((key) => (
                        <th key={key} className="px-3 py-2 text-left text-xs font-bold text-slate-600 uppercase">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, rowIdx) => (
                      <tr key={rowIdx} className="border-b border-slate-100 hover:bg-slate-50">
                        {Object.entries(row).map(([key, value]) => {
                          const hasError = errors.some(e => e.row === rowIdx + 1 && e.field === key);
                          return (
                            <td key={key} className="px-2 py-1">
                              <input
                                type="text"
                                value={value}
                                onChange={(e) => updateCell(rowIdx, key, e.target.value)}
                                className={`w-full px-2 py-1 border rounded text-sm ${hasError ? "border-red-400 bg-red-50 text-red-700" : "border-slate-200 bg-white"}`}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setEtape(1)} className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors">Modifier</button>
                <button onClick={handleVerify} disabled={uploading} className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50">
                  {uploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Validation...</> : <><ShieldCheck className="w-5 h-5" /> Valider la vérification</>}
                </button>
              </div>
            </div>
          )}

          
          {etape === 3 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">3</span>
                Soumission à l'ETL
              </h2>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-12 h-12 text-emerald-600 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-emerald-800">Données vérifiées et prêtes !</h3>
                    <p className="text-emerald-700 mt-2"><strong>{previewData.length} lignes</strong> vont être importées dans le système ETL.</p>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-white/60 p-2 rounded"><span className="text-emerald-600 font-semibold">Jeu de données :</span><p className="text-emerald-800">{nomDonnees}</p></div>
                      <div className="bg-white/60 p-2 rounded"><span className="text-emerald-600 font-semibold">Maladie :</span><p className="text-emerald-800">{maladieNom}</p></div>
                      <div className="bg-white/60 p-2 rounded"><span className="text-emerald-600 font-semibold">Mode :</span><p className="text-emerald-800">{mode === "csv" ? "Import CSV" : "Saisie manuelle"}</p></div>
                      <div className="bg-white/60 p-2 rounded"><span className="text-emerald-600 font-semibold">Par :</span><p className="text-emerald-800">{user?.prenom} {user?.nom}</p></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setEtape(2)} className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors">Retour à la vérification</button>
                <button onClick={handleSubmitETL} disabled={uploading} className="flex-1 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50">
                  {uploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Importation en cours...</> : <><Send className="w-5 h-5" /> Soumettre à l'ETL</>}
                </button>
              </div>
            </div>
          )}

          {/* Résultat */}
          {result && (
            <div className={`rounded-xl p-6 border shadow-sm ${result.success ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
              <div className="flex items-start gap-4">
                {result.success ? <CheckCircle className="w-8 h-8 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />}
                <div className="flex-1">
                  <h3 className={`text-xl font-bold ${result.success ? "text-emerald-800" : "text-red-800"}`}>{result.success ? "Import réussi !" : "Échec"}</h3>
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
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      
      {activeTab === "historique" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-600" /> Historique des imports
            </h2>
            <p className="text-sm text-slate-500 mt-1">{user?.role === "Admin" ? "Tous les imports effectués par les saisisseurs" : "Vos imports personnels"}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-3 text-xs font-bold text-slate-600 uppercase">Nom des données</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-600 uppercase">Type</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-600 uppercase">Lignes</th>
                  {user?.role === "Admin" && (
                    <>
                      <th className="px-6 py-3 text-xs font-bold text-slate-600 uppercase">Saisisseur</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-600 uppercase">Email</th>
                    </>
                  )}
                  <th className="px-6 py-3 text-xs font-bold text-slate-600 uppercase">Date</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-600 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyList.length > 0 ? historyList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{item.nom_donnees}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-xs font-medium">
                        {item.type_import === "csv" ? <FileSpreadsheet className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
                        {item.type_import === "csv" ? "CSV" : "Manuel"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.lignes_count}</td>
                    {user?.role === "Admin" && (
                      <>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.saisisseur_nom}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.saisisseur_email}</td>
                      </>
                    )}
                    <td className="px-6 py-4 text-sm text-slate-600">{new Date(item.date_creation).toLocaleDateString('fr-FR')}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${getStatutColor(item.statut)}`}>{item.statut}</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={user?.role === "Admin" ? 7 : 5} className="px-6 py-12 text-center text-slate-500">
                      Aucun historique d'import trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
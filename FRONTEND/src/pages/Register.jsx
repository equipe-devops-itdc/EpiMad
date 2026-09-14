import React, { useState } from "react";
import { Eye, EyeOff, ShieldAlert, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import caduceeLogo from '../assets/caducee.png';

// Regex : Lettres (avec accents) et espaces uniquement
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s]+$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const FORBIDDEN_CHARS_REGEX = /[%?><*+]/;

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ nom: "", prenom: "", email: "", password: "", passwordConfirm: "" });
  const [errors, setErrors] = useState({ nom: "", prenom: "", email: "", password: "", passwordConfirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    let newErrors = { nom: "", prenom: "", email: "", password: "", passwordConfirm: "" };
    let isValid = true;

    if (!NAME_REGEX.test(form.nom.trim())) {
      newErrors.nom = "Lettres et espaces uniquement.";
      isValid = false;
    }
    if (!NAME_REGEX.test(form.prenom.trim())) {
      newErrors.prenom = "Lettres et espaces uniquement.";
      isValid = false;
    }
    if (!form.email) {
      newErrors.email = "L'email est requis.";
      isValid = false;
    } else if (FORBIDDEN_CHARS_REGEX.test(form.email)) {
      newErrors.email = "Caractères interdits (% ? > < * +).";
      isValid = false;
    } else if (!EMAIL_REGEX.test(form.email)) {
      newErrors.email = "Format invalide.";
      isValid = false;
    }
    if (form.password.length < 6) {
      newErrors.password = "Minimum 6 caractères.";
      isValid = false;
    }
    if (form.password !== form.passwordConfirm) {
      newErrors.passwordConfirm = "Les mots de passe ne correspondent pas.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const bodyData = {
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        password_confirm: form.passwordConfirm
      };

      const response = await fetch("http://127.0.0.1:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();
    
      if (response.ok) {
        navigate("/validation-attente", { state: { email: form.email } });
      } else {
        setError(data.detail || "Erreur lors de l'inscription.");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col font-sans">
      <header className="bg-gradient-to-r from-[#0d3b28] to-[#155c3d] px-6 sm:px-10 py-4 flex items-center justify-between text-white shadow-md">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden p-1">
          <img src={caduceeLogo} alt="Logo EpiMad" className="w-full h-full object-contain" />
        </div>
        <div className="text-center">
          <div className="text-[11px] sm:text-xs tracking-widest opacity-90 uppercase">EpiMad</div>
          <div className="text-sm sm:text-base font-bold tracking-wide mt-1 uppercase">Surveillance Épidémiologique Nationale</div>
        </div>
        <div className="w-12" />
      </header>

      <div className="h-2 w-full flex">
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#FC3D3D]" />
        <div className="flex-1 bg-[#007A3D]" />
      </div>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-[1400px] flex flex-col md:flex-row gap-10 items-stretch">
          
          <section className="flex-1 bg-gradient-to-br from-[#e8f0e8] to-[#f0f5f0] rounded-2xl p-10 flex flex-col justify-center shadow-lg border border-[#d4d4d4]">
            <div className="max-w-2xl">
              <h1 className="font-serif text-[#7a1030] text-xl sm:text-2xl leading-snug mb-6">
                Rejoignez le réseau national de surveillance épidémiologique.
              </h1>
              <p className="text-[14px] sm:text-[15px] leading-relaxed text-gray-700 mb-8 text-justify">
                En créant un compte sur la plateforme EpiMad, vous contribuez activement à la protection de la santé publique à Madagascar. Votre accès vous permettra de consulter les données, générer des rapports et participer à la riposte sanitaire.
              </p>
              <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#155c3d] border-l-[4px] border-[#155c3d] pl-3 bg-white/60 py-2 pr-3 rounded-r-md shadow-sm">
                <ShieldAlert size={18} />
                Accès sécurisé et contrôlé
              </span>
            </div>
          </section>

          <section className="w-full md:w-[480px] bg-white rounded-2xl p-8 sm:p-12 flex flex-col justify-center shadow-xl border border-[#d4d4d4] min-h-[600px]">
            <form onSubmit={handleSubmit} className="w-full">
              <h2 className="font-serif text-[#7a1030] text-3xl mb-2 text-center">Inscription</h2>
              <p className="text-[14px] text-gray-500 mb-6 text-center">Créez votre espace professionnel</p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-5 flex items-center gap-2">
                  <ShieldAlert size={16} /> {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm mb-5 flex items-center gap-2">
                  <CheckCircle size={16} /> {success}
                </div>
              )}

              {/* Responsive*/}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[13px] font-medium text-gray-600 mb-2">Nom</label>
                  <input 
                    type="text" 
                    value={form.nom} 
                    onChange={handleChange("nom")} 
                    placeholder="RAKOTO" 
                    className={`w-full px-4 py-3 border rounded-md text-sm focus:outline-none focus:ring-2 transition-all ${errors.nom ? "border-red-500 focus:ring-red-500/30" : "border-[#d4d4d4] focus:ring-[#155c3d]/30 focus:border-[#155c3d]"}`} 
                  />
                  {errors.nom && <p className="text-red-600 text-xs mt-1.5">{errors.nom}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-600 mb-2">Prénom</label>
                  <input 
                    type="text" 
                    value={form.prenom} 
                    onChange={handleChange("prenom")} 
                    placeholder="Jean" 
                    className={`w-full px-4 py-3 border rounded-md text-sm focus:outline-none focus:ring-2 transition-all ${errors.prenom ? "border-red-500 focus:ring-red-500/30" : "border-[#d4d4d4] focus:ring-[#155c3d]/30 focus:border-[#155c3d]"}`} 
                  />
                  {errors.prenom && <p className="text-red-600 text-xs mt-1.5">{errors.prenom}</p>}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-[13px] font-medium text-gray-600 mb-2">Adresse e-mail</label>
                <input 
                  type="email" 
                  value={form.email} 
                  onChange={handleChange("email")} 
                  placeholder="vous@sante.gov.mg" 
                  className={`w-full px-4 py-3 border rounded-md text-sm focus:outline-none focus:ring-2 transition-all ${errors.email ? "border-red-500 focus:ring-red-500/30" : "border-[#d4d4d4] focus:ring-[#155c3d]/30 focus:border-[#155c3d]"}`} 
                />
                {errors.email && <p className="text-red-600 text-xs mt-1.5">{errors.email}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-[13px] font-medium text-gray-600 mb-2">Mot de passe</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={form.password} 
                    onChange={handleChange("password")} 
                    placeholder="Minimum 6 caractères" 
                    className={`w-full px-4 py-3 pr-10 border rounded-md text-sm focus:outline-none focus:ring-2 transition-all ${errors.password ? "border-red-500 focus:ring-red-500/30" : "border-[#d4d4d4] focus:ring-[#155c3d]/30 focus:border-[#155c3d]"}`} 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-600 text-xs mt-1.5">{errors.password}</p>}
              </div>

              <div className="mb-6">
                <label className="block text-[13px] font-medium text-gray-600 mb-2">Confirmer le mot de passe</label>
                <div className="relative">
                  <input 
                    type={showConfirm ? "text" : "password"} 
                    value={form.passwordConfirm} 
                    onChange={handleChange("passwordConfirm")} 
                    placeholder="••••••••" 
                    className={`w-full px-4 py-3 pr-10 border rounded-md text-sm focus:outline-none focus:ring-2 transition-all ${errors.passwordConfirm ? "border-red-500 focus:ring-red-500/30" : "border-[#d4d4d4] focus:ring-[#155c3d]/30 focus:border-[#155c3d]"}`} 
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.passwordConfirm && <p className="text-red-600 text-xs mt-1.5">{errors.passwordConfirm}</p>}
              </div>

              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-md bg-[#7a1030] text-white font-semibold text-[16px] hover:bg-[#5c0c24] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg">
                {loading ? "Création en cours..." : "Créer mon compte"}
              </button>

              <p className="text-[13px] text-gray-500 text-center mt-6">
                Déjà un compte ? <Link to="/login" className="text-[#155c3d] hover:underline font-medium">Se connecter</Link>
              </p>
              
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
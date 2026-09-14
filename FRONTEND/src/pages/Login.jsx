import React, { useState } from "react";
import { Eye, EyeOff, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import caduceeLogo from '../assets/caducee.png';

const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const FORBIDDEN_CHARS_REGEX = /[%?><*+]/;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    const value = field === "remember" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    
    // Validation
    if (field === "email") {
      setErrors(prev => ({ ...prev, email: "" }));
    } else if (field === "password") {
      setErrors(prev => ({ ...prev, password: "" }));
    }
  };

  const validateForm = () => {
    let newErrors = { email: "", password: "" };
    let isValid = true;

    if (!form.email) {
      newErrors.email = "L'adresse e-mail est requise.";
      isValid = false;
    } else if (FORBIDDEN_CHARS_REGEX.test(form.email)) {
      newErrors.email = "Caractères interdits (% ? > < * +).";
      isValid = false;
    } else if (!EMAIL_REGEX.test(form.email)) {
      newErrors.email = "Format invalide (lettres, chiffres, @ et . uniquement).";
      isValid = false;
    }

    if (!form.password) {
      newErrors.password = "Le mot de passe est requis.";
      isValid = false;
    } else if (form.password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", form.email);
      formData.append("password", form.password);

      const response = await fetch("http://127.0.0.1:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/home");
      } else {
        setError(data.detail || "Identifiant ou mot de passe incorrect");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur. Vérifiez que le backend est lancé.");
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
          
          <section className="flex-1 bg-gradient-to-br from-[#e8f0e8] to-[#f0f5f0] rounded-2xl p-8 sm:p-14 flex flex-col justify-center shadow-lg border border-[#d4d4d4] min-h-[600px]">
            <h1 className="font-serif text-[#7a1030] text-2xl sm:text-[28px] leading-snug mb-8">
              Dans notre engagement constant pour protéger la santé publique et anticiper les menaces sanitaires, 
              nous devons nous tourner vers les moyens les plus innovants pour assurer une détection rapide et 
              une réponse efficace face aux épidémies.
            </h1>
            <p className="text-[15px] sm:text-[16px] leading-relaxed text-gray-700 mb-6 text-justify">
              Il est indéniable que nous vivons à une époque où la surveillance épidémiologique 
              est plus cruciale que jamais. C'est pourquoi le Ministère de la Santé met en lumière 
              aujourd'hui le rôle essentiel des plateformes numériques dans la détection précoce, 
              le suivi et la gestion des maladies.
            </p>
            <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#155c3d] border-l-[4px] border-[#155c3d] pl-3 bg-white/60 py-2.5 pr-4 rounded-r-md shadow-sm">
              <ShieldAlert size={20} />
              Plateforme Nationale de Surveillance Épidémiologique (EpiMad)
            </span>
          </section>

          <section className="w-full md:w-[480px] bg-white rounded-2xl p-8 sm:p-12 flex flex-col justify-center shadow-xl border border-[#d4d4d4] min-h-[600px]">
            <form onSubmit={handleSubmit} className="w-full">
              <h2 className="font-serif text-[#7a1030] text-3xl mb-2 text-center">Connexion</h2>
              <p className="text-[14px] text-gray-500 mb-8 text-center">Accédez à votre espace de surveillance</p>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-6 flex items-center gap-2">
                  <ShieldAlert size={16} /> {error}
                </div>
              )}

              <div className="mb-5">
                <label htmlFor="email" className="block text-[13px] font-medium text-gray-600 mb-2">Adresse e-mail</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  placeholder="vous@sante.gov.mg"
                  className={`w-full px-4 py-3 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.email ? "border-red-500 focus:ring-red-500/30" : "border-[#d4d4d4] focus:ring-[#155c3d]/30 focus:border-[#155c3d]"
                  }`}
                />
                {errors.email && <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1"><ShieldAlert size={12}/> {errors.email}</p>}
              </div>

              <div className="mb-5">
                <label htmlFor="pass" className="block text-[13px] font-medium text-gray-600 mb-2">Mot de passe</label>
                <div className="relative">
                  <input
                    id="pass"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange("password")}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 pr-10 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 transition-all ${
                      errors.password ? "border-red-500 focus:ring-red-500/30" : "border-[#d4d4d4] focus:ring-[#155c3d]/30 focus:border-[#155c3d]"
                    }`}
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1"><ShieldAlert size={12}/> {errors.password}</p>}
              </div>

              <div className="flex items-center justify-between text-[13px] text-gray-500 mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.remember} onChange={handleChange("remember")} className="w-4 h-4 accent-[#155c3d] rounded border-gray-300" />
                  Se souvenir de moi
                </label>
                <a href="#" className="text-[#155c3d] hover:underline font-medium">Mot de passe oublié ?</a>
              </div>

              <div className="text-center mb-8">
                <a href="/register" className="text-[#155c3d] hover:underline font-medium">Pas de compte ? Créer un compte</a>
              </div>

              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-md bg-[#7a1030] text-white font-semibold text-[16px] hover:bg-[#5c0c24] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg">
                {loading ? "Connexion en cours..." : "Se connecter"}
              </button>

              <p className="text-[12px] text-gray-400 text-center mt-8">Accès strictement réservé aux agents de santé autorisés.</p>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
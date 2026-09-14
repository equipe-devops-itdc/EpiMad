import React from "react";
import { Shield, Clock, Mail, CheckCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function ValidationAttente() {
  const location = useLocation();
  const userEmail = location.state?.email || "votre email";

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col font-sans">
      
      <header className="bg-gradient-to-r from-[#0d3b28] to-[#155c3d] px-6 sm:px-10 py-4 flex items-center justify-between text-white shadow-md">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl shadow-inner">
          
        </div>
        <div className="text-center">
          <div className="text-[11px] sm:text-xs tracking-widest opacity-90 uppercase">
            EpiMad
          </div>
          <div className="text-sm sm:text-base font-bold tracking-wide mt-1 uppercase">
            Surveillance Épidémiologique Nationale
          </div>
        </div>
        <div className="w-12" />
      </header>

      
      <div className="h-2 w-full flex">
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#FC3D3D]" />
        <div className="flex-1 bg-[#007A3D]" />
      </div>

      
      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-10 sm:p-14 text-center">
          
          
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#155c3d] to-[#0d3b28] rounded-full mb-8 shadow-lg">
            <Clock className="w-12 h-12 text-white" />
          </div>

          
          <h1 className="font-serif text-[#7a1030] text-3xl sm:text-4xl mb-4">
            Demande de compte en cours de validation
          </h1>

          {/* Sous-titre */}
          <p className="text-gray-600 text-lg mb-8">
            Votre inscription a été enregistrée avec succès
          </p>

          {/* Message principal */}
          <div className="bg-[#e8f0e8] border-l-4 border-[#155c3d] p-6 rounded-lg mb-8 text-left">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-[#155c3d] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-[#155c3d] mb-2">
                  Que se passe-t-il maintenant ?
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Pour garantir la sécurité des données de santé publique, chaque nouvelle inscription 
                  doit être validée manuellement par un administrateur. 
                  Cette vérification prend généralement <strong>Quelques heures</strong>.
                </p>
              </div>
            </div>
          </div>

          
          <div className="mb-8">
            <p className="text-gray-600 mb-2">
              Un email de confirmation a été envoyé à :
            </p>
            <p className="font-semibold text-[#155c3d] text-lg flex items-center justify-center gap-2">
              <Mail className="w-5 h-5" />
              {userEmail}
            </p>
          </div>

         
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-[#155c3d] rounded-full text-white font-bold mb-2">
                1
              </div>
              <p className="text-sm text-gray-700 font-medium">Inscription soumise</p>
            </div>
            <div className="bg-[#155c3d]/10 p-4 rounded-lg border-2 border-[#155c3d]/30">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-[#155c3d] rounded-full text-white font-bold mb-2">
                2
              </div>
              <p className="text-sm text-gray-700 font-medium">Validation en cours</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full text-white font-bold mb-2">
                3
              </div>
              <p className="text-sm text-gray-700 font-medium">Accès activé</p>
            </div>
          </div>

          {/* Informations importantes */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mb-8">
            <p className="text-amber-800 text-sm">
              <strong>Important :</strong> Vous recevrez un email dès que votre compte sera activé. 
              Pensez à vérifier vos courriers indésirables (spam) si vous ne recevez pas notre réponse.
            </p>
          </div>

          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-[#7a1030] text-white font-semibold rounded-md hover:bg-[#5c0c24] transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Retour à la page de connexion
            </Link>
            <a
              href="mailto:support@epimad.mg"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-[#7a1030] font-semibold rounded-md border-2 border-[#7a1030] hover:bg-[#7a1030] hover:text-white transition-all duration-200"
            >
              Contacter le support
            </a>
          </div>

          {/* Note de sécurité */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
              <CheckCircle className="w-4 h-4 text-[#155c3d]" />
              <span>Plateforme sécurisée et conforme aux normes de santé publique</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
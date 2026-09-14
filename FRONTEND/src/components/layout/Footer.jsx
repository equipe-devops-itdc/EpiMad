import { Stethoscope, Mail, MessageCircle, FileText, Shield, Heart, Globe } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0d3320] text-white mt-auto" style={{ fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif" }}>
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                <Stethoscope className="w-5 h-5 text-[#0d3320]" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base tracking-wide">
                  EPI<span className="text-emerald-400">MAD</span>
                </h3>
                <p className="text-[10px] text-emerald-300 uppercase tracking-widest">Surveillance Épidémiologique</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-2">
              Plateforme nationale de surveillance épidémiologique du Ministère de la Santé Publique de Madagascar.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <Shield className="w-3 h-3 text-emerald-500" />
              <span>Données sécurisées et confidentielles</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-widest border-b border-emerald-700 pb-2">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-800/50 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Email</p>
                  <a href="mailto:contact@epimad.mg" className="text-sm text-white hover:text-emerald-400 transition-colors">
                    contact@epimad.mg
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-800/50 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">WhatsApp</p>
                  <a href="https://wa.me/261346731657" target="_blank" rel="noopener noreferrer" className="text-sm text-white hover:text-emerald-400 transition-colors">
                    +261 34 67 316 57
                  </a>
                </div>
              </li>
            </ul>
          </div>

         
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-widest border-b border-emerald-700 pb-2">
              Ressources
            </h4>
            <ul className="space-y-2">
              {[
                { label: 'Documentation OMS', href: '#' },
                { label: 'MinSanP', href: '#' },
                { label: 'Support technique', href: '#' },
                { label: 'Politique de confidentialité', href: '#' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-2 group"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-500 group-hover:text-emerald-400" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-emerald-900/60">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            
           
            <div className="text-center sm:text-left">
              <p className="text-sm text-white font-medium">
                © {currentYear} <span className="text-emerald-400 font-bold">EpiMad</span> — Ministère de la Santé Publique de Madagascar
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Tous droits réservés · Système national de surveillance épidémiologique
              </p>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Heart className="w-3 h-3 text-red-400 fill-red-400" />
                <span>Pour la santé publique</span>
              </div>
              <div className="h-3 w-px bg-emerald-800"></div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Globe className="w-3 h-3 text-emerald-500" />
                <span>https://epimad.mg (v1.0.0)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
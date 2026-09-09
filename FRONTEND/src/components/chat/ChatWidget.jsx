import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";


const SUGGESTED_QUESTIONS = [
  "Cas de paludisme à Analamanga ?",
  "Quelle région a le plus de cas ?",
  "Explique la prédiction de la semaine prochaine",
  "Quel est le seuil d'alerte actuel ?"
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

 
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Bonjour ! Je suis l'assistant EpiMad . Je peux vous aider à analyser les données épidémiologiques, les prédictions IA ou les alertes. Que souhaitez-vous savoir ?",
      sender: "bot",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async (text = inputValue) => {
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      text: text,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);


    setTimeout(() => {
      let botResponse = "Je n'ai pas encore de données spécifiques pour cette question, mais je travaille à connecter ma base de données pour vous répondre précisément !";
      
      const lowerText = text.toLowerCase();
      if (lowerText.includes("paludisme") && lowerText.includes("analamanga")) {
        botResponse = " Selon les dernières données, Analamanga a enregistré **1 250 nouveaux cas** de paludisme cette semaine. La tendance est en légère baisse (-4.2%) par rapport à la semaine précédente.";
      } else if (lowerText.includes("région") && lowerText.includes("plus")) {
        botResponse = "🔴 La région d'**Analamanga** présente actuellement le plus grand nombre de cas cumulés, suivie de près par **Atsinanana**. Je vous recommande de consulter la carte choroplèthe pour une vue d'ensemble.";
      } else if (lowerText.includes("seuil") || lowerText.includes("alerte")) {
        botResponse = "🚨 Le seuil d'alerte épidémique est actuellement fixé à **500 cas pour 100 000 habitants** sur une période de 7 jours. Ce seuil est configurable dans la page 'Configuration IA'.";
      } else if (lowerText.includes("prédiction") || lowerText.includes("semaine prochaine")) {
        botResponse = " Selon le modèle ARIMA actif, nous prévoyons une stabilisation des cas pour la semaine prochaine (Sem +1), avec une marge de confiance de 85%. Le modèle XGBoost, quant à lui, anticipe une légère hausse de 5%.";
      }

      const botMsg = {
        id: Date.now() + 1,
        text: botResponse,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      
      {isOpen && (
        <div className="mb-4 w-[380px] sm:w-[420px] bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden flex flex-col animate-[slideUp_0.3s_ease-out]">
          
          
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Assistant EpiMad</h3>
                <p className="text-emerald-100 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  En ligne · IA Epidémiologique
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          
          <div className="flex-1 h-[400px] overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-2 max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                    msg.sender === "user" ? "bg-emerald-100 text-emerald-700" : "bg-teal-600 text-white"
                  }`}>
                    {msg.sender === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </div>
                  
                 
                  <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.sender === "user" 
                      ? "bg-emerald-600 text-white rounded-tr-none" 
                      : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                  }`}>
                    
                    <p className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ 
                      __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                    }} />
                    <p className={`text-[10px] mt-1.5 text-right ${
                      msg.sender === "user" ? "text-emerald-100" : "text-slate-400"
                    }`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
           
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

         
          {messages.length <= 1 && !isTyping && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent transition-all">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question épidémiologique..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 resize-none max-h-24 py-2 px-2"
                rows={1}
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isTyping}
                className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              L'IA peut faire des erreurs. Vérifiez les données critiques dans les tableaux.
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 ${
          isOpen 
            ? "bg-slate-700 text-white rotate-90" 
            : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white animate-[pulse_2s_infinite]"
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
      </button>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
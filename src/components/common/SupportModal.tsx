import React, { useState } from 'react';
import { X, Heart, Copy, Check } from 'lucide-react';
import { APP_CONFIG } from '../../config/appConfig';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const phoneNumber = '932252226';
  const formattedPhone = '932 252 226';

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(phoneNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDontShow30Days = () => {
    const thirtyDaysFromNow = Date.now() + 30 * 24 * 60 * 60 * 1000;
    localStorage.setItem(APP_CONFIG.dontShowSupportModalKey, String(thirtyDaysFromNow));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-center border border-slate-100">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Heart className="w-8 h-8 fill-pink-500 stroke-pink-600" />
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">
          ¿Te salvamos del Excel?
        </h2>

        <p className="text-slate-600 text-xs sm:text-sm mb-5 leading-relaxed">
          {APP_CONFIG.appName} es una herramienta gratuita e independiente. Si te resultó útil para armar tu semestre, puedes apoyar voluntariamente su servidor y mantenimiento.
        </p>

        {/* Clean Yape Number Display */}
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 mb-6 text-center space-y-2">
          <span className="font-extrabold text-purple-900 text-sm tracking-wider uppercase bg-purple-200/60 px-3 py-1 rounded-full inline-block">
            YAPE
          </span>
          
          <div className="pt-1">
            <span className="font-mono text-2xl font-black text-purple-950 tracking-wider">
              {formattedPhone}
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="mt-2 bg-purple-700 hover:bg-purple-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center space-x-1.5 mx-auto active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>¡Número copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar número Yape</span>
              </>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={onClose}
            className="w-full bg-molinero-700 hover:bg-molinero-800 text-white font-bold py-3 rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-95"
          >
            ¡Gracias, continuar!
          </button>
          
          <div className="flex items-center justify-between text-xs pt-2 text-slate-500">
            <button
              onClick={onClose}
              className="hover:underline text-slate-500"
            >
              Quizá después
            </button>

            <button
              onClick={handleDontShow30Days}
              className="hover:underline text-slate-500"
            >
              No mostrar por 30 días
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

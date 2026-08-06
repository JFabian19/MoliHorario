import React from 'react';
import { X, Sparkles, AlertTriangle, Download, Share2, MessageSquare, CheckCircle } from 'lucide-react';
import { APP_CONFIG } from '../../config/appConfig';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-molinero-900 mb-4 flex items-center gap-2">
          ¿Cómo usar {APP_CONFIG.appName}?
        </h2>

        <div className="space-y-4 text-sm text-slate-700">
          <div className="p-4 bg-molinero-50 border border-molinero-200 rounded-xl space-y-2">
            <h3 className="font-bold text-molinero-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-molinero-600" />
              1. Armado manual de horario
            </h3>
            <p>
              Busca tus cursos por código, nombre o profesor. Selecciona la sección deseada para agregar automáticamente sus horas de teoría, práctica o laboratorio al calendario.
            </p>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
            <h3 className="font-bold text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              2. Detector de cruces automático
            </h3>
            <p>
              Si dos secciones seleccionadas comparten el mismo día y rango horario, se marcarán visualmente los conflictos para que puedas reemplazarla o cancelarla.
            </p>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-2">
            <h3 className="font-bold text-purple-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              3. Generador automático de combinaciones
            </h3>
            <p>
              ¿No sabes qué seccion elegir? Usa el botón <strong>Generar Alternativas</strong>. Selecciona tus cursos deseados y el algoritmo calculará combinaciones sin cruces ajustadas a tus preferencias (días libres, sin clases de noche, etc.).
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-600" />
              4. Exportación e integración
            </h3>
            <p>
              Exporta tu horario completo como imagen PNG nítida, compártelo mediante enlace único o descarga tus horarios como archivo JSON para respaldarlos en localStorage.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-molinero-700 hover:bg-molinero-800 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

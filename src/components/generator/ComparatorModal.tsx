import React from 'react';
import { X, Check, Award, Calendar, Clock, AlertCircle } from 'lucide-react';
import { ScheduleAlternative } from '../../types/academic';

interface ComparatorModalProps {
  isOpen: boolean;
  alternatives: ScheduleAlternative[];
  onClose: () => void;
  onSelectAlternative: (alt: ScheduleAlternative) => void;
}

export const ComparatorModal: React.FC<ComparatorModalProps> = ({
  isOpen,
  alternatives,
  onClose,
  onSelectAlternative
}) => {
  if (!isOpen || alternatives.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Comparador de Horarios</h2>
            <p className="text-xs text-slate-500">Compara métricas clave lado a lado para tomar la mejor decisión</p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Matrix Table */}
        <div className="my-4 overflow-x-auto flex-grow pr-1 custom-scrollbar">
          <div className="min-w-[600px] border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-200">
            
            {/* Header Row: Alternative Names & Scores */}
            <div className={`grid grid-cols-${alternatives.length + 1} bg-slate-900 text-white p-4 font-bold text-sm`}>
              <div className="text-slate-400 font-semibold text-xs self-center">Métrica / Criterio</div>
              {alternatives.map((alt, idx) => (
                <div key={alt.id} className="text-center space-y-1">
                  <div className="text-gold-400 text-xs font-mono uppercase">Opción #{idx + 1}</div>
                  <div className="text-base font-extrabold flex items-center justify-center gap-1">
                    <Award className="w-4 h-4 text-gold-500" /> Score {alt.score}
                  </div>
                  <button
                    onClick={() => {
                      onSelectAlternative(alt);
                      onClose();
                    }}
                    className="mt-2 bg-gold-500 hover:bg-gold-400 text-molinero-950 text-xs font-bold px-3 py-1 rounded-lg transition-colors"
                  >
                    Elegir Opción #{idx + 1}
                  </button>
                </div>
              ))}
            </div>

            {/* Metric 1: Days with classes */}
            <div className={`grid grid-cols-${alternatives.length + 1} p-3.5 text-xs text-slate-800 bg-white items-center`}>
              <div className="font-semibold text-slate-600">Días con clases</div>
              {alternatives.map(alt => (
                <div key={alt.id} className="text-center font-bold text-slate-900">
                  {alt.stats.daysWithClasses} días
                </div>
              ))}
            </div>

            {/* Metric 2: Total Hours */}
            <div className={`grid grid-cols-${alternatives.length + 1} p-3.5 text-xs text-slate-800 bg-slate-50 items-center`}>
              <div className="font-semibold text-slate-600">Total horas lectivas</div>
              {alternatives.map(alt => (
                <div key={alt.id} className="text-center font-bold text-slate-900">
                  {alt.stats.totalHours} horas
                </div>
              ))}
            </div>

            {/* Metric 3: Total Gaps */}
            <div className={`grid grid-cols-${alternatives.length + 1} p-3.5 text-xs text-slate-800 bg-white items-center`}>
              <div className="font-semibold text-slate-600">Horas de hueco</div>
              {alternatives.map(alt => (
                <div key={alt.id} className="text-center font-bold">
                  {alt.stats.totalGaps === 0 ? (
                    <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">0h (Continuo)</span>
                  ) : (
                    <span className="text-amber-700">{alt.stats.totalGaps}h libre</span>
                  )}
                </div>
              ))}
            </div>

            {/* Metric 4: Range (First Start - Last End) */}
            <div className={`grid grid-cols-${alternatives.length + 1} p-3.5 text-xs text-slate-800 bg-slate-50 items-center`}>
              <div className="font-semibold text-slate-600">Rango de horario</div>
              {alternatives.map(alt => (
                <div key={alt.id} className="text-center font-mono font-semibold text-slate-800">
                  {alt.stats.earliestStart} - {alt.stats.latestEnd}
                </div>
              ))}
            </div>

            {/* Metric 5: Average Entry/Exit */}
            <div className={`grid grid-cols-${alternatives.length + 1} p-3.5 text-xs text-slate-800 bg-white items-center`}>
              <div className="font-semibold text-slate-600">Promedio Entrada / Salida</div>
              {alternatives.map(alt => (
                <div key={alt.id} className="text-center text-slate-700">
                  {alt.stats.avgStartHour} / {alt.stats.avgEndHour}
                </div>
              ))}
            </div>

            {/* Metric 6: Sections & Courses List */}
            <div className={`grid grid-cols-${alternatives.length + 1} p-3.5 text-xs text-slate-800 bg-slate-50 items-start`}>
              <div className="font-semibold text-slate-600">Secciones elegidas</div>
              {alternatives.map(alt => (
                <div key={alt.id} className="space-y-1 text-center">
                  {alt.selectedSections.map(sec => (
                    <div key={sec.sectionId} className="text-[11px] font-medium text-slate-800">
                      <strong>{sec.courseCode}</strong> ({sec.sectionName})
                    </div>
                  ))}
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Note */}
        <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1 pt-2">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Las puntuaciones corresponden al ranking ajustado según tus preferencias configuradas.</span>
        </p>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { SelectedSection, ClassSession } from '../../types/academic';
import { timeToMinutes } from '../../utils/timeUtils';
import { Trash2, AlertTriangle, MapPin, User, RotateCcw, RotateCw } from 'lucide-react';

interface WeeklyCalendarProps {
  scheduleName: string;
  selectedSections: SelectedSection[];
  onRemoveSection: (courseCode: string) => void;
  onClearAll: () => void;
}

// Pastel colors for minimalist blocks matching reference image
const PASTEL_BLOCK_STYLES = [
  { bg: 'bg-[#e6f7ec]', border: 'border-l-4 border-l-emerald-600 border-t border-r border-b border-emerald-200 text-emerald-950' },
  { bg: 'bg-[#fef7d9]', border: 'border-l-4 border-l-amber-500 border-t border-r border-b border-amber-200 text-amber-950' },
  { bg: 'bg-[#edf4ff]', border: 'border-l-4 border-l-blue-600 border-t border-r border-b border-blue-200 text-blue-950' },
  { bg: 'bg-[#f5eefb]', border: 'border-l-4 border-l-purple-600 border-t border-r border-b border-purple-200 text-purple-950' },
  { bg: 'bg-[#fef2f2]', border: 'border-l-4 border-l-rose-500 border-t border-r border-b border-rose-200 text-rose-950' },
];

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  scheduleName,
  selectedSections,
  onRemoveSection,
  onClearAll
}) => {
  const [activeMobileDay, setActiveMobileDay] = useState<number>(1); // 1 = Lunes

  // Check if Sunday has any classes
  const hasSunday = selectedSections.some(s => s.sessions.some(sess => sess.day === 7));
  const days = [
    { num: 1, name: 'LUNES', short: 'LUN' },
    { num: 2, name: 'MARTES', short: 'MAR' },
    { num: 3, name: 'MIÉRCOLES', short: 'MIÉ' },
    { num: 4, name: 'JUEVES', short: 'JUE' },
    { num: 5, name: 'VIERNES', short: 'VIE' },
    { num: 6, name: 'SÁBADO', short: 'SÁB' },
  ];
  if (hasSunday) {
    days.push({ num: 7, name: 'DOMINGO', short: 'DOM' });
  }

  const startHour = 7;
  const endHour = 22;
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  // Collect flat list of all session blocks with section metadata
  const allBlocks = selectedSections.flatMap((sec, secIdx) =>
    sec.sessions.map(sess => ({
      section: sec,
      session: sess,
      style: PASTEL_BLOCK_STYLES[secIdx % PASTEL_BLOCK_STYLES.length],
      startMin: timeToMinutes(sess.start),
      endMin: timeToMinutes(sess.end)
    }))
  );

  // Detect overlapping blocks to flag conflicts visually
  const conflictBlockIds = new Set<string>();
  for (let i = 0; i < allBlocks.length; i++) {
    for (let j = i + 1; j < allBlocks.length; j++) {
      const b1 = allBlocks[i];
      const b2 = allBlocks[j];
      if (b1.section.courseCode !== b2.section.courseCode && b1.session.day === b2.session.day) {
        if (b1.startMin < b2.endMin && b1.endMin > b2.startMin) {
          conflictBlockIds.add(b1.session.id);
          conflictBlockIds.add(b2.session.id);
        }
      }
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 flex flex-col h-full min-h-[650px] lg:min-h-[780px]">
      
      {/* Calendar Main Title & Top Right Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {scheduleName || 'Mi horario principal'}
          </h2>
          <p className="text-xs text-slate-500">{selectedSections.length} asignaturas seleccionadas</p>
        </div>

        {/* Action Controls: Undo, Redo, Limpiar */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onClearAll}
            disabled={selectedSections.length === 0}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors flex items-center space-x-1.5 disabled:opacity-40"
            title="Vaciar horario"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </button>
        </div>
      </div>

      {/* Conflicts Alert Banner */}
      {conflictBlockIds.size > 0 && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-2.5 rounded-xl text-xs font-bold mb-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>Existe un cruce de horario entre tus asignaturas seleccionadas.</span>
          </div>
        </div>
      )}

      {/* Mobile Day Selector Bar */}
      <div className="md:hidden flex items-center justify-between bg-slate-100 p-1.5 rounded-xl mb-3">
        {days.map(d => (
          <button
            key={d.num}
            onClick={() => setActiveMobileDay(d.num)}
            className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
              activeMobileDay === d.num
                ? 'bg-[#004D34] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {d.short}
          </button>
        ))}
      </div>

      {/* Calendar Grid Container */}
      <div className="overflow-x-auto flex-grow relative custom-scrollbar">
        <div className="min-w-[700px] md:min-w-full h-full flex flex-col">
          
          {/* Days Header Row */}
          <div className="grid grid-cols-7 bg-white sticky top-0 z-10 border-b border-slate-200">
            <div className="p-2 text-center text-xs font-bold text-slate-400 border-r border-slate-100 w-16">
              Hora
            </div>
            {days.map(d => (
              <div
                key={d.num}
                className={`p-2.5 text-center text-xs font-extrabold tracking-wider border-r border-slate-100 ${
                  activeMobileDay === d.num ? 'bg-emerald-50 text-emerald-900' : 'text-slate-700'
                }`}
              >
                <span className="hidden md:inline">{d.name}</span>
                <span className="md:hidden">{d.short}</span>
              </div>
            ))}
          </div>

          {/* Grid Rows Body with Dashed Lines */}
          <div className="relative flex-grow grid grid-cols-7 divide-x divide-slate-100">
            
            {/* Hour labels column */}
            <div className="w-16 divide-y divide-slate-100 bg-white">
              {hours.map(h => (
                <div key={h} className="h-14 text-[11px] font-mono text-slate-400 p-1 text-right pr-2">
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Days columns */}
            {days.map(d => (
              <div key={d.num} className="relative h-full divide-y divide-dashed divide-slate-200 bg-white">
                {hours.map(h => (
                  <div key={h} className="h-14 hover:bg-slate-50/40 transition-colors"></div>
                ))}

                {/* Render Session Blocks for Day `d.num` */}
                {allBlocks
                  .filter(b => b.session.day === d.num)
                  .map(b => {
                    const topPx = ((b.startMin - startHour * 60) / 60) * 56; // 56px per hour
                    const heightPx = ((b.endMin - b.startMin) / 60) * 56;
                    const hasConflict = conflictBlockIds.has(b.session.id);

                    return (
                      <div
                        key={b.session.id}
                        style={{
                          top: `${topPx}px`,
                          height: `${heightPx}px`,
                        }}
                        className={`absolute left-0.5 right-0.5 rounded-lg p-2 shadow-xs overflow-hidden transition-all group z-10 ${b.style.bg} ${b.style.border} ${
                          hasConflict ? '!border-l-rose-600 !border-rose-300 ring-2 ring-rose-400' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-extrabold text-xs tracking-tight truncate">
                            {b.section.courseCode} - Sec {b.section.sectionName}
                          </span>

                          <span className="text-[10px] font-bold uppercase opacity-80 bg-white/60 px-1 rounded">
                            {b.session.type.slice(0, 1)}
                          </span>
                        </div>

                        <div className="text-xs font-extrabold truncate mt-0.5">
                          {b.section.courseName}
                        </div>

                        {b.section.teacher && (
                          <div className="text-[11px] opacity-90 truncate mt-1 flex items-center gap-1 font-medium">
                            <User className="w-3 h-3 opacity-70" />
                            <span>{b.section.teacher.name}</span>
                          </div>
                        )}

                        {b.session.classroom && (
                          <div className="text-[10px] opacity-80 truncate mt-0.5 flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 opacity-70" />
                            <span>{b.session.classroom}</span>
                          </div>
                        )}

                        {/* Quick Delete Hover Button */}
                        <button
                          onClick={() => onRemoveSection(b.section.courseCode)}
                          className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity shadow"
                          title="Quitar curso"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
              </div>
            ))}

          </div>

        </div>
      </div>

    </div>
  );
};

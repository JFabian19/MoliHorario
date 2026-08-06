import React, { useState, useMemo } from 'react';
import { X, Sparkles, Filter, Check, ArrowRight, Layers, Award, Search, Plus, Trash2 } from 'lucide-react';
import { AcademicCourse, GeneratorPreferences, ScheduleAlternative, SelectedSection } from '../../types/academic';
import { ScheduleGenerator } from '../../utils/generatorAlgorithm';

interface GeneratorModalProps {
  isOpen: boolean;
  courses: AcademicCourse[];
  selectedSections: SelectedSection[];
  onClose: () => void;
  onSaveAlternative: (alternative: ScheduleAlternative) => void;
  onOpenComparator: (alternatives: ScheduleAlternative[]) => void;
}

export const GeneratorModal: React.FC<GeneratorModalProps> = ({
  isOpen,
  courses,
  selectedSections,
  onClose,
  onSaveAlternative,
  onOpenComparator
}) => {
  // Initial course codes from current active schedule
  const initialCourseCodes = Array.from(new Set(selectedSections.map(s => s.courseCode)));
  const [selectedCourseCodes, setSelectedCourseCodes] = useState<string[]>(initialCourseCodes);

  // Search & Filter state for adding courses inside generator modal
  const [modalSearchTerm, setModalSearchTerm] = useState<string>('');
  const [modalDeptFilter, setModalDeptFilter] = useState<string>('');

  // Preference Settings
  const [noBefore, setNoBefore] = useState<string>('08:00');
  const [noAfter, setNoAfter] = useState<string>('20:00');
  const [freeDays, setFreeDays] = useState<number[]>([]);
  const [minimizeGaps, setMinimizeGaps] = useState<boolean>(true);
  const [minimizeDays, setMinimizeDays] = useState<boolean>(false);
  const [maxHoursPerDay, setMaxHoursPerDay] = useState<number>(8);

  const [generatedAlternatives, setGeneratedAlternatives] = useState<ScheduleAlternative[] | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Unique departments for dropdown
  const departments = useMemo(() => {
    const set = new Set<string>();
    courses.forEach(c => {
      if (c.department) set.add(c.department);
    });
    return Array.from(set).sort();
  }, [courses]);

  // Filtered course catalog for inclusion modal
  const filteredCatalog = useMemo(() => {
    const term = modalSearchTerm.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (!term && !modalDeptFilter) return [];

    return courses.filter(c => {
      if (modalDeptFilter && c.department !== modalDeptFilter) return false;
      if (term) {
        const codeNorm = c.code.toLowerCase();
        const nameNorm = c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (!codeNorm.includes(term) && !nameNorm.includes(term)) return false;
      }
      return true;
    });
  }, [courses, modalSearchTerm, modalDeptFilter]);

  if (!isOpen) return null;

  const toggleCourseCode = (code: string) => {
    if (selectedCourseCodes.includes(code)) {
      setSelectedCourseCodes(selectedCourseCodes.filter(c => c !== code));
    } else {
      setSelectedCourseCodes([...selectedCourseCodes, code]);
    }
  };

  const toggleFreeDay = (dayNum: number) => {
    if (freeDays.includes(dayNum)) {
      setFreeDays(freeDays.filter(d => d !== dayNum));
    } else {
      setFreeDays([...freeDays, dayNum]);
    }
  };

  const handleRunGenerator = () => {
    if (selectedCourseCodes.length === 0) {
      alert('Selecciona al menos 1 curso para generar combinaciones.');
      return;
    }

    setIsProcessing(true);
    setGeneratedAlternatives(null);

    const targetCourses = courses.filter(c => selectedCourseCodes.includes(c.code));

    const prefs: GeneratorPreferences = {
      noClassesBefore: noBefore,
      noClassesAfter: noAfter,
      freeDays: freeDays,
      minimizeGaps: minimizeGaps,
      minimizeDays: minimizeDays,
      prioritizeTopProfessors: false,
      excludedTeachers: [],
      lockedSections: {},
      excludedSections: [],
      maxHoursPerDay: maxHoursPerDay
    };

    setTimeout(() => {
      const results = ScheduleGenerator.generateAlternatives(targetCourses, prefs, 30);
      setGeneratedAlternatives(results);
      setIsProcessing(false);
    }, 100);
  };

  const toggleCompareSelection = (altId: string) => {
    if (selectedForCompare.includes(altId)) {
      setSelectedForCompare(selectedForCompare.filter(id => id !== altId));
    } else {
      if (selectedForCompare.length < 3) {
        setSelectedForCompare([...selectedForCompare, altId]);
      } else {
        alert('Solo puedes comparar hasta 3 alternativas a la vez.');
      }
    }
  };

  const handleLaunchComparator = () => {
    if (!generatedAlternatives) return;
    const selected = generatedAlternatives.filter(a => selectedForCompare.includes(a.id));
    onOpenComparator(selected);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl relative max-h-[92vh] flex flex-col border border-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 bg-emerald-100 text-[#004D34] rounded-2xl flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Generador Automático de Horarios
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Encuentra las mejores combinaciones sin cruces de horario
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-grow my-4 space-y-5 pr-1 custom-scrollbar">
          
          {/* 1. Courses Selection Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-900 tracking-wider uppercase flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#004D34]" />
                <span>Cursos a incluir en la combinación ({selectedCourseCodes.length})</span>
              </label>

              {selectedCourseCodes.length > 0 && (
                <button
                  onClick={() => setSelectedCourseCodes([])}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Desmarcar todos
                </button>
              )}
            </div>

            {/* Currently Selected Course Chips */}
            <div className="flex flex-wrap gap-2">
              {selectedCourseCodes.length === 0 ? (
                <p className="text-xs text-amber-700 font-semibold bg-amber-50 p-2 rounded-lg border border-amber-200">
                  No has seleccionado ningún curso. Busca e incluye asignaturas abajo.
                </p>
              ) : (
                selectedCourseCodes.map(code => {
                  const courseObj = courses.find(c => c.code === code);
                  return (
                    <span
                      key={code}
                      onClick={() => toggleCourseCode(code)}
                      className="bg-[#004D34] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 cursor-pointer hover:bg-rose-700 transition-colors shadow-xs"
                      title="Haz clic para quitar"
                    >
                      <span>{code} {courseObj ? `- ${courseObj.name}` : ''}</span>
                      <X className="w-3.5 h-3.5" />
                    </span>
                  );
                })
              )}
            </div>

            {/* Course Search & Department Selector for adding courses */}
            <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={modalDeptFilter}
                onChange={(e) => setModalDeptFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004D34] font-medium"
              >
                <option value="">Filtrar por Departamento...</option>
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <div className="relative flex items-center">
                <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={modalSearchTerm}
                  onChange={(e) => setModalSearchTerm(e.target.value)}
                  placeholder="Buscar curso para añadir..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004D34]"
                />
              </div>
            </div>

            {/* Filtered Search Results for Adding */}
            {filteredCatalog.length > 0 && (
              <div className="max-h-36 overflow-y-auto bg-white rounded-xl border border-slate-200 p-2 space-y-1 custom-scrollbar">
                {filteredCatalog.slice(0, 15).map(c => {
                  const isChecked = selectedCourseCodes.includes(c.code);
                  return (
                    <div
                      key={c.id}
                      onClick={() => toggleCourseCode(c.code)}
                      className={`p-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        isChecked ? 'bg-emerald-50 text-emerald-950 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span><strong className="font-mono">{c.code}</strong> - {c.name} ({c.department})</span>
                      <button className={`p-1 rounded ${isChecked ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                        {isChecked ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Preferences Configuration */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 tracking-wider uppercase flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-[#004D34]" />
              <span>Preferencias de Horario</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">No iniciar clases antes de:</label>
                <select
                  value={noBefore}
                  onChange={(e) => setNoBefore(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800"
                >
                  <option value="07:00">07:00 (Cualquier hora)</option>
                  <option value="08:00">08:00</option>
                  <option value="09:00">09:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">No salir de clases después de:</label>
                <select
                  value={noAfter}
                  onChange={(e) => setNoAfter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800"
                >
                  <option value="18:00">18:00</option>
                  <option value="19:00">19:00</option>
                  <option value="20:00">20:00</option>
                  <option value="21:00">21:00</option>
                  <option value="22:00">22:00 (Sin límite)</option>
                </select>
              </div>
            </div>

            {/* Free Days selection */}
            <div>
              <label className="block text-xs text-slate-600 font-semibold mb-1.5">Días requeridos libres:</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { num: 1, name: 'Lunes' },
                  { num: 2, name: 'Martes' },
                  { num: 3, name: 'Miércoles' },
                  { num: 4, name: 'Jueves' },
                  { num: 5, name: 'Viernes' },
                  { num: 6, name: 'Sábado' },
                ].map(d => {
                  const isSelected = freeDays.includes(d.num);
                  return (
                    <button
                      key={d.num}
                      type="button"
                      onClick={() => toggleFreeDay(d.num)}
                      className={`text-xs px-3.5 py-2 rounded-xl border font-bold transition-all ${
                        isSelected
                          ? 'bg-[#004D34] text-white border-[#004D34] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {d.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="flex items-center space-x-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={minimizeGaps}
                  onChange={(e) => setMinimizeGaps(e.target.checked)}
                  className="rounded text-[#004D34] focus:ring-[#004D34] w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800">Minimizar horas huecas</span>
              </label>

              <label className="flex items-center space-x-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={minimizeDays}
                  onChange={(e) => setMinimizeDays(e.target.checked)}
                  className="rounded text-[#004D34] focus:ring-[#004D34] w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800">Concentrar clases en menos días</span>
              </label>
            </div>
          </div>

          {/* Action Trigger Button */}
          <button
            onClick={handleRunGenerator}
            disabled={isProcessing}
            className="w-full bg-[#004D34] hover:bg-[#003825] text-white font-extrabold py-3.5 rounded-2xl text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span>{isProcessing ? 'Calculando combinaciones...' : 'GENERAR COMBINACIONES'}</span>
          </button>

          {/* Results section */}
          {generatedAlternatives !== null && (
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Alternativas encontradas ({generatedAlternatives.length})
                </h3>

                {selectedForCompare.length > 0 && (
                  <button
                    onClick={handleLaunchComparator}
                    className="bg-gold-500 hover:bg-gold-600 text-molinero-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1 shadow-sm"
                  >
                    <span>Comparar ({selectedForCompare.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {generatedAlternatives.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 font-medium text-center">
                  No se encontraron combinaciones que cumplan con todos los filtros estrictos. Prueba suavizando la hora de inicio o desmarcando días libres.
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                  {generatedAlternatives.map((alt, idx) => {
                    const isCompared = selectedForCompare.includes(alt.id);

                    return (
                      <div
                        key={alt.id}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-300 transition-all"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="bg-emerald-100 text-emerald-900 font-extrabold text-xs px-2.5 py-0.5 rounded-md">
                              Opción #{idx + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              Puntaje: {alt.score} pts
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 mt-1.5 space-x-3">
                            <span>{alt.stats.daysWithClasses} días con clase</span>
                            <span>•</span>
                            <span>{alt.stats.totalGaps}h huecas</span>
                            <span>•</span>
                            <span>{alt.stats.earliestStart} - {alt.stats.latestEnd}</span>
                          </div>

                          <div className="flex flex-wrap gap-1 mt-2">
                            {alt.selectedSections.map(s => (
                              <span key={s.sectionId} className="bg-white border border-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                {s.courseCode} ({s.sectionName})
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                          <button
                            onClick={() => toggleCompareSelection(alt.id)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                              isCompared
                                ? 'bg-gold-500 text-molinero-950 border-gold-500'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {isCompared ? 'Comparando' : '+ Comparar'}
                          </button>

                          <button
                            onClick={() => {
                              onSaveAlternative(alt);
                              onClose();
                            }}
                            className="bg-[#004D34] hover:bg-[#003825] text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                          >
                            Aplicar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HelpModal } from './components/common/HelpModal';
import { SupportModal } from './components/common/SupportModal';
import { CourseSearch } from './components/courses/CourseSearch';
import { CourseDetailsModal } from './components/courses/CourseDetailsModal';
import { WeeklyCalendar } from './components/schedule/WeeklyCalendar';
import { ScheduleManager } from './components/schedule/ScheduleManager';
import { GeneratorModal } from './components/generator/GeneratorModal';
import { ComparatorModal } from './components/generator/ComparatorModal';
import { ProfessorReviewsModal } from './components/reviews/ProfessorReviewsModal';

import { AcademicCourse, MetadataJsonDataset, SavedSchedule, SelectedSection, ScheduleAlternative } from './types/academic';
import { StorageUtils } from './utils/storageUtils';
import { ShareUtils } from './utils/shareUtils';
import { PngExporter } from './utils/pngExporter';
import { APP_CONFIG } from './config/appConfig';
import { AlertCircle, CheckCircle2, BookOpen, Calendar as CalendarIcon, Sparkles, Layers, ArrowRight } from 'lucide-react';

export const App: React.FC = () => {
  const [courses, setCourses] = useState<AcademicCourse[]>([]);
  const [metadata, setMetadata] = useState<MetadataJsonDataset | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Schedules state
  const [schedules, setSchedules] = useState<SavedSchedule[]>([]);
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null);

  // Mobile View Tab state ('SEARCH' or 'CALENDAR')
  const [mobileTab, setMobileTab] = useState<'SEARCH' | 'CALENDAR'>('SEARCH');

  // Modals state
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<AcademicCourse | null>(null);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showGeneratorModal, setShowGeneratorModal] = useState<boolean>(false);
  const [showComparatorModal, setShowComparatorModal] = useState<boolean>(false);
  const [comparatorAlternatives, setComparatorAlternatives] = useState<ScheduleAlternative[]>([]);
  const [showScheduleManager, setShowScheduleManager] = useState<boolean>(false);
  const [showReviewsModal, setShowReviewsModal] = useState<boolean>(false);
  const [reviewTarget, setReviewTarget] = useState<{ key: string; name: string } | null>(null);
  const [showSupportModal, setShowSupportModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active schedule object
  const activeSchedule = schedules.find(s => s.id === activeScheduleId) || schedules[0] || null;

  // 1. Initial Load: Fetch JSON data & initialize local storage
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [cRes, mRes] = await Promise.all([
          fetch('/data/cursos.json'),
          fetch('/data/metadata.json')
        ]);

        if (!cRes.ok) throw new Error("No se pudo cargar el boletín de cursos (cursos.json)");

        const cData = await cRes.ok ? await cRes.json() : null;
        const mData = mRes.ok ? await mRes.json() : null;

        if (cData && Array.isArray(cData.courses)) {
          setCourses(cData.courses);
        }
        if (mData) {
          setMetadata(mData);
        }

        // Initialize LocalStorage schedules
        const loadedSchedules = StorageUtils.loadSchedules();
        if (loadedSchedules.length === 0) {
          const initial = StorageUtils.createSchedule('Mi horario principal', mData?.period || APP_CONFIG.academicPeriodDefault);
          setSchedules([initial]);
          setActiveScheduleId(initial.id);
        } else {
          setSchedules(loadedSchedules);
          const savedActiveId = StorageUtils.getActiveScheduleId();
          if (savedActiveId && loadedSchedules.some(s => s.id === savedActiveId)) {
            setActiveScheduleId(savedActiveId);
          } else {
            setActiveScheduleId(loadedSchedules[0].id);
          }
        }

        // 2. Check for Share Link in URL hash
        if (window.location.hash && cData && Array.isArray(cData.courses)) {
          const decoded = ShareUtils.decodeHashToSchedule(window.location.hash);
          if (decoded) {
            const { reconstructed, missing } = ShareUtils.reconstructSections(decoded, cData.courses);
            if (reconstructed.length > 0) {
              const sharedSchedule = StorageUtils.createSchedule(
                `Compartido (${decoded.period})`,
                decoded.period,
                reconstructed
              );
              setSchedules(prev => [...prev, sharedSchedule]);
              setActiveScheduleId(sharedSchedule.id);
              showToast(`Horario compartido cargado (${reconstructed.length} cursos).`);

              if (missing.length > 0) {
                alert(`Advertencia: Ciertos cursos no se encontraron en este periodo: ${missing.join(', ')}`);
              }
            }
          }
        }
      } catch (err: any) {
        console.error("Data loading error:", err);
        setLoadError(err.message || 'Error al cargar los datos académicos');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Synchronize active schedule changes to LocalStorage
  const updateActiveScheduleSections = (newSections: SelectedSection[]) => {
    if (!activeSchedule) return;

    const updatedSchedules = schedules.map(s => {
      if (s.id === activeSchedule.id) {
        return {
          ...s,
          selectedSections: newSections,
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });

    setSchedules(updatedSchedules);
    StorageUtils.saveSchedules(updatedSchedules);
  };

  // Add or replace section
  const handleAddSection = (section: SelectedSection) => {
    if (!activeSchedule) return;

    const filtered = activeSchedule.selectedSections.filter(s => s.courseCode !== section.courseCode);
    updateActiveScheduleSections([...filtered, section]);
    showToast(`Sección ${section.sectionName} agregada a ${section.courseCode}`);
  };

  // Remove course from schedule
  const handleRemoveCourse = (courseCode: string) => {
    if (!activeSchedule) return;
    const filtered = activeSchedule.selectedSections.filter(s => s.courseCode !== courseCode);
    updateActiveScheduleSections(filtered);
    showToast(`Curso ${courseCode} removido del horario`);
  };

  // Clear all courses
  const handleClearAllCourses = () => {
    if (!activeSchedule) return;
    if (confirm('¿Estás seguro de vaciar todas las secciones de este horario?')) {
      updateActiveScheduleSections([]);
      showToast('Horario vaciado.');
    }
  };

  // PNG Export Handler
  const handleExportPng = async () => {
    if (!activeSchedule || activeSchedule.selectedSections.length === 0) {
      alert('Agrega al menos una sección a tu horario antes de exportar.');
      return;
    }

    const success = await PngExporter.exportToPng(
      activeSchedule,
      metadata?.generatedAt ? new Date(metadata.generatedAt).toLocaleDateString() : 'Agosto 2026'
    );

    if (success) {
      const hideUntil = localStorage.getItem(APP_CONFIG.dontShowSupportModalKey);
      if (!hideUntil || Date.now() > Number(hideUntil)) {
        setTimeout(() => setShowSupportModal(true), 600);
      }
    } else {
      alert('Error al generar la imagen del horario.');
    }
  };

  // Share Link Handler
  const handleShareLink = () => {
    if (!activeSchedule || activeSchedule.selectedSections.length === 0) {
      alert('Tu horario está vacío. Agrega secciones antes de compartir.');
      return;
    }

    const hashStr = ShareUtils.encodeScheduleToHash(activeSchedule.period, activeSchedule.selectedSections);
    const fullUrl = `${window.location.origin}${window.location.pathname}${hashStr}`;

    navigator.clipboard.writeText(fullUrl).then(() => {
      showToast('Enlace compartible copiado al portapapeles!');
    }).catch(() => {
      alert(`Copia este enlace: ${fullUrl}`);
    });
  };

  // Schedule Management Handlers
  const handleCreateSchedule = (name: string) => {
    const created = StorageUtils.createSchedule(name, metadata?.period || APP_CONFIG.academicPeriodDefault);
    setSchedules(StorageUtils.loadSchedules());
    setActiveScheduleId(created.id);
    showToast(`Horario "${created.name}" creado`);
  };

  const handleRenameSchedule = (id: string, newName: string) => {
    const updated = schedules.map(s => s.id === id ? { ...s, name: newName } : s);
    setSchedules(updated);
    StorageUtils.saveSchedules(updated);
  };

  const handleDuplicateSchedule = (id: string) => {
    const target = schedules.find(s => s.id === id);
    if (!target) return;
    const dup = StorageUtils.createSchedule(`${target.name} (Copia)`, target.period, [...target.selectedSections]);
    setSchedules(StorageUtils.loadSchedules());
    setActiveScheduleId(dup.id);
    showToast(`Horario duplicado`);
  };

  const handleDeleteSchedule = (id: string) => {
    if (schedules.length <= 1) return;
    const filtered = schedules.filter(s => s.id !== id);
    setSchedules(filtered);
    StorageUtils.saveSchedules(filtered);
    if (activeScheduleId === id) {
      setActiveScheduleId(filtered[0].id);
    }
  };

  const handleOpenReviewsForTeacher = (key: string, name: string) => {
    setReviewTarget({ key, name });
    setShowReviewsModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f2f9f4] text-slate-900 flex flex-col items-center justify-center space-y-4 font-sans">
        <div className="w-12 h-12 border-4 border-[#004D34] border-t-transparent rounded-full animate-spin"></div>
        <p className="font-extrabold text-xl tracking-tight text-[#004D34] italic">MOLIHORARIO</p>
        <p className="text-xs text-slate-500 font-medium">Cargando catálogo del Boletín Académico UNALM...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#f2f9f4] text-slate-900 flex flex-col items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-md">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold">No se pudieron cargar los datos</h2>
          <p className="text-xs text-slate-600">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#004D34] hover:bg-[#003825] text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f9f4] flex flex-col font-sans relative">
      
      {/* Toast Notification with Quick Jump Button */}
      {toastMessage && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between space-x-3 text-xs font-bold animate-fade-in max-w-sm">
          <div className="flex items-center space-x-2 truncate">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>

          {mobileTab === 'SEARCH' && (
            <button
              onClick={() => setMobileTab('CALENDAR')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center space-x-1 flex-shrink-0 shadow-xs"
            >
              <span>Ver Horario</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* App Header */}
      <Header
        period={metadata?.period || APP_CONFIG.academicPeriodDefault}
        lastUpdated={metadata?.generatedAt || ''}
        activeSchedule={activeSchedule}
        onOpenHelp={() => setShowHelpModal(true)}
        onOpenGenerator={() => setShowGeneratorModal(true)}
        onOpenScheduleManager={() => setShowScheduleManager(true)}
        onOpenReviews={() => handleOpenReviewsForTeacher('all', 'Catálogo de Profesores')}
        onExportPng={handleExportPng}
        onShareLink={handleShareLink}
        onOpenSupportModal={() => setShowSupportModal(true)}
      />

      {/* Top Mobile View Mode Indicator */}
      <div className="lg:hidden max-w-[1600px] w-full mx-auto px-3 pt-3">
        <div className="grid grid-cols-2 gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs text-center font-extrabold text-xs">
          <button
            onClick={() => setMobileTab('SEARCH')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              mobileTab === 'SEARCH'
                ? 'bg-[#004D34] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. Buscar Cursos</span>
          </button>

          <button
            onClick={() => setMobileTab('CALENDAR')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              mobileTab === 'CALENDAR'
                ? 'bg-[#004D34] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>2. Mi Horario ({activeSchedule?.selectedSections.length || 0})</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout with bottom padding for mobile navigation */}
      <main className="flex-grow max-w-[1600px] w-full mx-auto px-3 sm:px-6 py-3 sm:py-6 pb-24 lg:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Panel: Course Search & Add */}
          <div className={`lg:col-span-4 ${mobileTab === 'SEARCH' ? 'block' : 'hidden lg:block'}`}>
            <CourseSearch
              courses={courses}
              selectedSections={activeSchedule ? activeSchedule.selectedSections : []}
              onSelectCourse={(course) => setSelectedCourseForModal(course)}
              onAddSection={handleAddSection}
              onOpenGenerator={() => setShowGeneratorModal(true)}
            />
          </div>

          {/* Right Panel: Weekly Visual Calendar */}
          <div className={`lg:col-span-8 ${mobileTab === 'CALENDAR' ? 'block' : 'hidden lg:block'}`}>
            <WeeklyCalendar
              scheduleName={activeSchedule?.name || 'Mi horario principal'}
              selectedSections={activeSchedule ? activeSchedule.selectedSections : []}
              onRemoveSection={handleRemoveCourse}
              onClearAll={handleClearAllCourses}
            />
          </div>

        </div>
      </main>

      {/* Fixed Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setMobileTab('SEARCH')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            mobileTab === 'SEARCH' ? 'text-[#004D34] font-black scale-105' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-bold">Buscar</span>
        </button>

        <button
          onClick={() => setMobileTab('CALENDAR')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl relative transition-all ${
            mobileTab === 'CALENDAR' ? 'text-[#004D34] font-black scale-105' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarIcon className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-bold">Mi Horario</span>
          {activeSchedule && activeSchedule.selectedSections.length > 0 && (
            <span className="absolute -top-1 right-2 bg-emerald-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
              {activeSchedule.selectedSections.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setShowGeneratorModal(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-amber-600 hover:text-amber-700 transition-all"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-extrabold">Generar</span>
        </button>

        <button
          onClick={() => setShowScheduleManager(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-600 hover:text-slate-900 transition-all"
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-bold">Horarios</span>
        </button>
      </nav>

      {/* App Footer */}
      <Footer metadata={metadata} />

      {/* Course Details Modal */}
      {selectedCourseForModal && (
        <CourseDetailsModal
          course={selectedCourseForModal}
          selectedSections={activeSchedule ? activeSchedule.selectedSections : []}
          onClose={() => setSelectedCourseForModal(null)}
          onAddSection={handleAddSection}
          onRemoveCourse={handleRemoveCourse}
          onOpenReviews={handleOpenReviewsForTeacher}
        />
      )}

      {/* Help Modal */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* Support Voluntary Modal */}
      <SupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />

      {/* Schedule Manager Modal */}
      <ScheduleManager
        isOpen={showScheduleManager}
        schedules={schedules}
        activeScheduleId={activeScheduleId}
        onClose={() => setShowScheduleManager(false)}
        onSelectSchedule={(id) => {
          setActiveScheduleId(id);
          StorageUtils.setActiveScheduleId(id);
        }}
        onCreateSchedule={handleCreateSchedule}
        onRenameSchedule={handleRenameSchedule}
        onDuplicateSchedule={handleDuplicateSchedule}
        onDeleteSchedule={handleDeleteSchedule}
      />

      {/* Generator Modal */}
      <GeneratorModal
        isOpen={showGeneratorModal}
        courses={courses}
        selectedSections={activeSchedule ? activeSchedule.selectedSections : []}
        onClose={() => setShowGeneratorModal(false)}
        onSaveAlternative={(alt) => {
          updateActiveScheduleSections(alt.selectedSections);
          showToast(`Horario alternativo aplicado`);
        }}
        onOpenComparator={(alts) => {
          setComparatorAlternatives(alts);
          setShowComparatorModal(true);
        }}
      />

      {/* Comparator Modal */}
      <ComparatorModal
        isOpen={showComparatorModal}
        alternatives={comparatorAlternatives}
        onClose={() => setShowComparatorModal(false)}
        onSelectAlternative={(alt) => {
          updateActiveScheduleSections(alt.selectedSections);
          setShowComparatorModal(false);
          setShowGeneratorModal(false);
          showToast(`Horario alternativo seleccionado aplicado`);
        }}
      />

      {/* Professor Reviews Modal */}
      {showReviewsModal && reviewTarget && (
        <ProfessorReviewsModal
          isOpen={showReviewsModal}
          professorKey={reviewTarget.key}
          professorName={reviewTarget.name}
          onClose={() => setShowReviewsModal(false)}
        />
      )}

    </div>
  );
};

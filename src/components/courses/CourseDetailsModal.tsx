import React, { useState } from 'react';
import { X, Clock, User, MapPin, AlertOctagon, Check, Replace, Plus } from 'lucide-react';
import { AcademicCourse, CourseSection, SelectedSection, ConflictDetail } from '../../types/academic';
import { ConflictDetector } from '../../utils/conflictDetector';
import { getCourseColor } from '../../utils/timeUtils';

interface CourseDetailsModalProps {
  course: AcademicCourse | null;
  selectedSections: SelectedSection[];
  onClose: () => void;
  onAddSection: (section: SelectedSection) => void;
  onRemoveCourse: (courseCode: string) => void;
  onOpenReviews: (professorKey: string, professorName: string) => void;
}

export const CourseDetailsModal: React.FC<CourseDetailsModalProps> = ({
  course,
  selectedSections,
  onClose,
  onAddSection,
  onRemoveCourse,
  onOpenReviews
}) => {
  const [conflictWarning, setConflictWarning] = useState<{
    section: CourseSection;
    conflicts: ConflictDetail[];
  } | null>(null);

  if (!course) return null;

  // Check if a section of this course is currently added
  const existingSelectedSection = selectedSections.find(s => s.courseCode === course.code);

  const handleSelectSection = (sec: CourseSection) => {
    // Detect conflicts against currently selected sections
    const conflicts = ConflictDetector.findConflicts(
      selectedSections,
      { code: course.code, name: course.name },
      sec
    );

    const newSelectedSec: SelectedSection = {
      courseId: course.id,
      courseCode: course.code,
      courseName: course.name,
      department: course.department,
      credits: course.credits,
      sectionId: sec.id,
      sectionName: sec.section,
      teacher: sec.teacher,
      sessions: sec.sessions,
      color: existingSelectedSection ? existingSelectedSection.color : getCourseColor(selectedSections.length)
    };

    if (conflicts.length > 0) {
      setConflictWarning({ section: sec, conflicts });
    } else {
      onAddSection(newSelectedSec);
      onClose();
    }
  };

  const handleConfirmConflictAdd = () => {
    if (!conflictWarning) return;
    const sec = conflictWarning.section;

    const newSelectedSec: SelectedSection = {
      courseId: course.id,
      courseCode: course.code,
      courseName: course.name,
      department: course.department,
      credits: course.credits,
      sectionId: sec.id,
      sectionName: sec.section,
      teacher: sec.teacher,
      sessions: sec.sessions,
      color: existingSelectedSection ? existingSelectedSection.color : getCourseColor(selectedSections.length)
    };

    onAddSection(newSelectedSec);
    setConflictWarning(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-4 flex-shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-sm bg-molinero-100 text-molinero-800 px-2.5 py-0.5 rounded-md">
                {course.code}
              </span>
              {course.credits !== null && (
                <span className="text-xs text-slate-500 font-medium">{course.credits} Créditos</span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{course.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{course.department}</p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conflict Warning Interstitial */}
        {conflictWarning ? (
          <div className="p-5 my-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3 animate-fade-in flex-grow overflow-y-auto">
            <div className="flex items-center space-x-2 text-rose-800 font-bold">
              <AlertOctagon className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>¡Cruce de horario detectado!</span>
            </div>

            <p className="text-xs text-rose-700">
              La sección <strong>{conflictWarning.section.section}</strong> se cruza en horario con otros cursos seleccionados:
            </p>

            <div className="space-y-2">
              {conflictWarning.conflicts.map((conf, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-rose-200 text-xs shadow-sm">
                  <div className="font-bold text-slate-800">
                    {conf.courseA.code} ({conf.courseA.section}) vs {conf.courseB.code} ({conf.courseB.section})
                  </div>
                  <div className="text-slate-600 mt-1">
                    Día: <span className="font-medium text-slate-900">{conf.dayName}</span> • Horario: <span className="font-medium text-slate-900">{conf.start} a {conf.end}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3">
              <button
                onClick={() => setConflictWarning(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmConflictAdd}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                Agregar de todos modos
              </button>
            </div>
          </div>
        ) : (
          /* Sections List */
          <div className="overflow-y-auto flex-grow my-4 space-y-3 pr-1 custom-scrollbar">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
              <span>Secciones disponibles ({course.sections.length})</span>
              {existingSelectedSection && (
                <button
                  onClick={() => {
                    onRemoveCourse(course.code);
                    onClose();
                  }}
                  className="text-rose-600 hover:underline font-semibold"
                >
                  Quitar curso del horario
                </button>
              )}
            </div>

            {course.sections.map(sec => {
              const isCurrentSecSelected = existingSelectedSection?.sectionId === sec.id;

              return (
                <div
                  key={sec.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrentSecSelected
                      ? 'bg-molinero-50 border-molinero-400 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:border-molinero-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-base text-slate-900">
                        Sección {sec.section}
                      </span>
                      {isCurrentSecSelected && (
                        <span className="text-[11px] bg-molinero-600 text-white font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Check className="w-3 h-3" /> Seleccionada
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleSelectSection(sec)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 ${
                        isCurrentSecSelected
                          ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          : existingSelectedSection
                          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                          : 'bg-molinero-700 hover:bg-molinero-800 text-white shadow-sm'
                      }`}
                    >
                      {isCurrentSecSelected ? (
                        <span>Re-seleccionar</span>
                      ) : existingSelectedSection ? (
                        <>
                          <Replace className="w-3.5 h-3.5" />
                          <span>Reemplazar</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Agregar</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Teacher Info */}
                  <div className="text-xs mb-3 flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-100">
                    <div className="flex items-center space-x-2 text-slate-700">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">
                        {sec.teacher ? sec.teacher.name : 'Docente no asignado (N.N.)'}
                      </span>
                    </div>

                    {sec.teacher && (
                      <button
                        onClick={() => onOpenReviews(sec.teacher!.key, sec.teacher!.name)}
                        className="text-[11px] text-purple-700 hover:underline font-semibold"
                      >
                        Ver reseñas
                      </button>
                    )}
                  </div>

                  {/* Sessions Schedule Blocks */}
                  <div className="space-y-1.5">
                    {sec.sessions.map(sess => (
                      <div
                        key={sess.id}
                        className="flex items-center justify-between text-xs bg-white px-3 py-2 rounded-lg border border-slate-200"
                      >
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold text-[10px] px-2 py-0.5 rounded ${
                            sess.type === 'TEORIA'
                              ? 'bg-blue-100 text-blue-800'
                              : sess.type === 'PRACTICA'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {sess.type}
                          </span>
                          <span className="font-semibold text-slate-800">{sess.dayName}</span>
                          <span className="text-slate-500 font-mono">{sess.start} - {sess.end}</span>
                        </div>

                        {sess.classroom && (
                          <div className="flex items-center space-x-1 text-slate-500 text-[11px]">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{sess.classroom}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

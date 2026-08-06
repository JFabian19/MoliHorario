import React, { useState, useMemo } from 'react';
import { Search, Filter, X, Plus, ChevronDown, ChevronUp, BookOpen, Sparkles, User, MapPin } from 'lucide-react';
import { AcademicCourse, SelectedSection, CourseSection, CourseCategory } from '../../types/academic';
import { ConflictDetector } from '../../utils/conflictDetector';
import { getCourseColor } from '../../utils/timeUtils';

interface CourseSearchProps {
  courses: AcademicCourse[];
  selectedSections: SelectedSection[];
  onSelectCourse: (course: AcademicCourse) => void;
  onAddSection: (section: SelectedSection) => void;
  onOpenGenerator: () => void;
}

export const CourseSearch: React.FC<CourseSearchProps> = ({
  courses,
  selectedSections,
  onSelectCourse,
  onAddSection,
  onOpenGenerator
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | 'ALL'>('DEPARTAMENTOS');
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [expandedCourseCode, setExpandedCourseCode] = useState<string | null>(null);
  const [showFilterOptions, setShowFilterOptions] = useState<boolean>(false);

  // Collect unique department list for dropdown based on active category
  const departments = useMemo(() => {
    const set = new Set<string>();
    courses.forEach(c => {
      if (c.department && (selectedCategory === 'ALL' || c.category === selectedCategory)) {
        set.add(c.department);
      }
    });
    return Array.from(set).sort();
  }, [courses, selectedCategory]);

  // Set of selected course codes for badge indicator
  const selectedCourseCodes = useMemo(() => {
    return new Set(selectedSections.map(s => s.courseCode));
  }, [selectedSections]);

  // Filtered course results
  const filteredCourses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (!selectedDept && !term) {
      return [];
    }

    return courses.filter(course => {
      // 0. Category Filter
      if (selectedCategory !== 'ALL' && course.category !== selectedCategory) {
        return false;
      }

      // 1. Text Search (Code, Name, Department, Teachers)
      if (term) {
        const codeNorm = course.code.toLowerCase();
        const nameNorm = course.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const deptNorm = course.department.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const teacherNamesNorm = course.sections.flatMap(s => s.teacher ? [s.teacher.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")] : []);

        const matchesText = codeNorm.includes(term) ||
          nameNorm.includes(term) ||
          deptNorm.includes(term) ||
          teacherNamesNorm.some(tn => tn.includes(term));

        if (!matchesText) return false;
      }

      // 2. Department Filter
      if (selectedDept && course.department !== selectedDept) {
        return false;
      }

      return true;
    });
  }, [courses, searchTerm, selectedCategory, selectedDept]);

  const toggleExpand = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCourseCode(expandedCourseCode === code ? null : code);
  };

  const handleAddSectionClick = (course: AcademicCourse, sec: CourseSection, e: React.MouseEvent) => {
    e.stopPropagation();
    const existingSelectedSection = selectedSections.find(s => s.courseCode === course.code);

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
  };

  return (
    <div className="bg-[#f7faf8] rounded-2xl border border-slate-200 p-4 flex flex-col h-full min-h-[600px]">
      
      {/* Sidebar Header */}
      <div className="space-y-2 mb-3 flex-shrink-0">
        <div>
          <h2 className="text-sm font-extrabold text-[#004D34] tracking-wider uppercase">
            AGREGA TUS CURSOS
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">Ciclo 2026-II</p>
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar curso o código..."
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#004D34] text-slate-900 placeholder-slate-400 shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Active Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs bg-emerald-800 text-white font-bold rounded-lg px-2.5 py-1 focus:outline-none max-w-[200px] truncate"
          >
            <option value="">Escoge Departamento...</option>
            {departments.map(d => (
              <option key={d} value={d} className="bg-white text-slate-800 font-normal">{d}</option>
            ))}
          </select>

          {selectedDept && (
            <button
              onClick={() => setSelectedDept('')}
              className="text-[11px] bg-slate-200 text-slate-700 px-2 py-1 rounded-lg flex items-center gap-1 font-medium"
            >
              <span>{selectedDept}</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Courses List */}
      <div className="overflow-y-auto flex-grow space-y-2.5 pr-1 custom-scrollbar">
        {!selectedDept && !searchTerm ? (
          <div className="text-center py-12 px-4 bg-white/60 rounded-xl border border-dashed border-slate-200 text-slate-500">
            <BookOpen className="w-8 h-8 text-[#004D34] mx-auto mb-2 opacity-50" />
            <p className="font-bold text-slate-800 text-xs">Escoge un departamento arriba</p>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Selecciona tu departamento o busca directamente un código para ver las opciones disponibles.
            </p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-10 px-4 text-slate-500">
            <p className="font-semibold text-xs text-slate-700">No se encontraron resultados</p>
          </div>
        ) : (
          filteredCourses.map((course, idx) => {
            const isSelected = selectedCourseCodes.has(course.code);
            const isExpanded = expandedCourseCode === course.code;

            return (
              <div
                key={course.id}
                onClick={() => onSelectCourse(course)}
                className={`p-3.5 rounded-xl bg-white border transition-all cursor-pointer shadow-sm hover:shadow-md ${
                  isSelected ? 'border-emerald-400 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Card Top Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: getCourseColor(idx) }}
                      ></span>
                      {course.code}
                    </span>

                    {isSelected && (
                      <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">
                        Agregado
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-bold text-slate-500">
                    {course.credits !== null ? `${course.credits} CRD` : ''}
                  </span>
                </div>

                {/* Course Title & Dept */}
                <h3 className="font-extrabold text-sm text-slate-900 mt-1.5">
                  {course.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{course.department}</p>

                {/* Accordion Toggle */}
                <div
                  onClick={(e) => toggleExpand(course.code, e)}
                  className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600 hover:text-[#004D34]"
                >
                  <span>{course.sections.length} SECCIONES DISPONIBLES</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>

                {/* Expanded Sections Sub-boxes */}
                {isExpanded && (
                  <div className="mt-2.5 space-y-2 pt-1">
                    {course.sections.map(sec => {
                      const isCurrentSec = selectedSections.some(s => s.sectionId === sec.id);

                      return (
                        <div
                          key={sec.id}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
                            isCurrentSec
                              ? 'bg-emerald-100/80 border-emerald-300'
                              : 'bg-emerald-50/50 border-emerald-200/60 hover:bg-emerald-100/40'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-slate-900">
                              Sec {sec.section} - {sec.teacher ? sec.teacher.name : 'N.N.'}
                            </div>
                            <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                              {sec.sessions.map(s => `${s.dayName.slice(0,2)} ${s.start.slice(0,5)}-${s.end.slice(0,5)} (${s.type.slice(0,1)})`).join(' / ')}
                            </div>
                          </div>

                          <button
                            onClick={(e) => handleAddSectionClick(course, sec, e)}
                            className={`p-1.5 rounded-lg font-bold transition-transform active:scale-95 ${
                              isCurrentSec
                                ? 'bg-emerald-700 text-white'
                                : 'bg-[#004D34] hover:bg-[#003825] text-white shadow-sm'
                            }`}
                            title="Agregar sección"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Sticky Bottom Action Button: GENERAR ALTERNATIVAS */}
      <div className="pt-3 border-t border-slate-200 flex-shrink-0">
        <button
          onClick={onOpenGenerator}
          className="w-full bg-[#004D34] hover:bg-[#003825] text-white font-extrabold py-3 rounded-xl text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-4 h-4 text-gold-400" />
          <span>GENERAR ALTERNATIVAS</span>
        </button>
      </div>

    </div>
  );
};

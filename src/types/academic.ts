export interface TeacherInfo {
  key: string;
  name: string;
}

export type SessionType = 'TEORIA' | 'PRACTICA' | 'LABORATORIO' | 'OTRO';

export interface ClassSession {
  id: string;
  day: number; // 1 = Lunes, 7 = Domingo
  dayName: string;
  start: string; // "HH:mm" 24h
  end: string;   // "HH:mm" 24h
  type: SessionType;
  classroom: string | null;
}

export interface CourseSection {
  id: string;
  section: string;
  teacher: TeacherInfo | null;
  theoryTeacher?: TeacherInfo | null;
  practiceTeacher?: TeacherInfo | null;
  sessions: ClassSession[];
}

export type CourseCategory = 'INGRESANTES' | 'DEPARTAMENTOS' | 'CULTURALES';

export interface AcademicCourse {
  id: string;
  code: string;
  name: string;
  credits: number | null;
  department: string;
  category?: CourseCategory;
  sections: CourseSection[];
}

export interface CursosJsonDataset {
  schemaVersion: number;
  period: string;
  generatedAt: string;
  courses: AcademicCourse[];
}

export interface MetadataJsonDataset {
  schemaVersion: number;
  period: string;
  sourceUrl: string;
  generatedAt: string;
  departmentCount: number;
  courseCount: number;
  sectionCount: number;
  sessionCount: number;
  teacherCount: number;
  extractionDurationMs: number;
  checksum: string;
  warnings: number;
  validationState: 'VALID' | 'INVALID' | 'WARNING';
}

export interface SelectedSection {
  courseId: string;
  courseCode: string;
  courseName: string;
  department: string;
  credits: number | null;
  sectionId: string;
  sectionName: string;
  teacher: TeacherInfo | null;
  theoryTeacher?: TeacherInfo | null;
  practiceTeacher?: TeacherInfo | null;
  sessions: ClassSession[];
  color: string; // Dynamic visual color block
}

export interface SavedSchedule {
  id: string;
  name: string;
  period: string;
  createdAt: string;
  updatedAt: string;
  isPrimary?: boolean;
  selectedSections: SelectedSection[];
}

export interface ConflictDetail {
  courseA: { code: string; name: string; section: string };
  courseB: { code: string; name: string; section: string };
  sessionA: ClassSession;
  sessionB: ClassSession;
  dayName: string;
  start: string;
  end: string;
}

export interface GeneratorPreferences {
  noClassesBefore: string;
  noClassesAfter: string;
  freeDays: number[];
  minimizeGaps: boolean;
  minimizeDays: boolean;
  prioritizeTopProfessors: boolean;
  excludedTeachers: string[];
  lockedSections: Record<string, string>;
  excludedSections: string[];
  maxHoursPerDay: number;
}

export interface ScheduleAlternative {
  id: string;
  score: number;
  selectedSections: SelectedSection[];
  stats: {
    totalHours: number;
    totalGaps: number;
    daysWithClasses: number;
    earliestStart: string;
    latestEnd: string;
    avgStartHour: string;
    avgEndHour: string;
    preferencesMetCount: number;
    reasons: string[];
  };
}

export interface ProfessorReview {
  id: string;
  professor_key: string;
  professor_name: string;
  course_code: string;
  course_name: string;
  period: string;
  rating: number;
  tags: string[];
  comment: string;
  created_at: string;
}

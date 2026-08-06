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

export interface ScrapeErrorItem {
  department?: string;
  course?: string;
  stage: string;
  message: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  date: string;
  diagnosticFile?: string;
}

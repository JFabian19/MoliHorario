import { CursosJsonDataset, MetadataJsonDataset } from '../types';
import { SCRAPER_CONFIG } from '../config';

export interface ValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    courses: number;
    sections: number;
    sessions: number;
    teachers: number;
  };
}

export class DataValidator {
  static validate(dataset: CursosJsonDataset): ValidationReport {
    const report: ValidationReport = {
      isValid: true,
      errors: [],
      warnings: [],
      stats: { courses: 0, sections: 0, sessions: 0, teachers: 0 }
    };

    if (!dataset || typeof dataset !== 'object') {
      report.isValid = false;
      report.errors.push("Dataset must be a valid JSON object");
      return report;
    }

    if (dataset.schemaVersion !== 1) {
      report.warnings.push(`Unexpected schemaVersion: ${dataset.schemaVersion}. Expected: 1`);
    }

    if (!dataset.period) {
      report.errors.push("Missing academic period identifier");
      report.isValid = false;
    }

    if (!Array.isArray(dataset.courses)) {
      report.errors.push("Courses property must be an array");
      report.isValid = false;
      return report;
    }

    report.stats.courses = dataset.courses.length;

    if (report.stats.courses < SCRAPER_CONFIG.minCoursesThreshold) {
      report.errors.push(`Course count (${report.stats.courses}) is below minimum threshold (${SCRAPER_CONFIG.minCoursesThreshold})`);
      report.isValid = false;
    }

    const teacherKeys = new Set<string>();

    for (const course of dataset.courses) {
      if (!course.id || !course.code || !course.name) {
        report.errors.push(`Course missing required metadata: ID=${course.id}, Code=${course.code}, Name=${course.name}`);
        report.isValid = false;
      }

      if (!Array.isArray(course.sections) || course.sections.length === 0) {
        report.warnings.push(`Course ${course.code} has 0 sections`);
        continue;
      }

      for (const section of course.sections) {
        report.stats.sections++;

        if (section.teacher) {
          teacherKeys.add(section.teacher.key);
        }

        if (!Array.isArray(section.sessions) || section.sessions.length === 0) {
          report.warnings.push(`Section ${section.id} has 0 class sessions`);
          continue;
        }

        for (const session of section.sessions) {
          report.stats.sessions++;

          if (session.day < 1 || session.day > 7) {
            report.errors.push(`Invalid day number ${session.day} in session ${session.id}`);
            report.isValid = false;
          }

          if (!/^\d{2}:\d{2}$/.test(session.start) || !/^\d{2}:\d{2}$/.test(session.end)) {
            report.errors.push(`Invalid 24h time format: start=${session.start}, end=${session.end} in session ${session.id}`);
            report.isValid = false;
          }

          const startMinutes = parseInt(session.start.slice(0, 2), 10) * 60 + parseInt(session.start.slice(3, 5), 10);
          const endMinutes = parseInt(session.end.slice(0, 2), 10) * 60 + parseInt(session.end.slice(3, 5), 10);

          if (startMinutes >= endMinutes) {
            report.errors.push(`Session start time (${session.start}) must be before end time (${session.end}) in session ${session.id}`);
            report.isValid = false;
          }
        }
      }
    }

    report.stats.teachers = teacherKeys.size;

    if (report.stats.sections < SCRAPER_CONFIG.minSectionsThreshold) {
      report.errors.push(`Section count (${report.stats.sections}) is below minimum threshold (${SCRAPER_CONFIG.minSectionsThreshold})`);
      report.isValid = false;
    }

    return report;
  }
}

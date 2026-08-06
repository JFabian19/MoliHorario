import { SelectedSection, ConflictDetail, CourseSection } from '../types/academic';
import { doSessionsOverlap } from './timeUtils';

export class ConflictDetector {
  /**
   * Detects all conflicts between an existing list of selected sections and a candidate section.
   */
  static findConflicts(
    existingSections: SelectedSection[],
    candidateCourse: { code: string; name: string },
    candidateSection: CourseSection
  ): ConflictDetail[] {
    const conflicts: ConflictDetail[] = [];

    for (const existing of existingSections) {
      // Ignore if it's the exact same course (being replaced)
      if (existing.courseCode === candidateCourse.code) continue;

      for (const sessExisting of existing.sessions) {
        for (const sessCandidate of candidateSection.sessions) {
          if (doSessionsOverlap(sessExisting, sessCandidate)) {
            conflicts.push({
              courseA: {
                code: existing.courseCode,
                name: existing.courseName,
                section: existing.sectionName
              },
              courseB: {
                code: candidateCourse.code,
                name: candidateCourse.name,
                section: candidateSection.section
              },
              sessionA: sessExisting,
              sessionB: sessCandidate,
              dayName: sessExisting.dayName,
              start: sessExisting.start,
              end: sessExisting.end
            });
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * Checks if a set of sections has any internal session overlaps.
   */
  static hasAnyConflict(sections: SelectedSection[]): boolean {
    for (let i = 0; i < sections.length; i++) {
      for (let j = i + 1; j < sections.length; j++) {
        const secA = sections[i];
        const secB = sections[j];
        if (secA.courseCode === secB.courseCode) continue;

        for (const sessA of secA.sessions) {
          for (const sessB of secB.sessions) {
            if (doSessionsOverlap(sessA, sessB)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }
}

import { AcademicCourse, SelectedSection, GeneratorPreferences, ScheduleAlternative } from '../types/academic';
import { timeToMinutes, minutesToTime, getCourseColor } from './timeUtils';
import { ConflictDetector } from './conflictDetector';

export class ScheduleGenerator {
  static generateAlternatives(
    targetCourses: AcademicCourse[],
    preferences: GeneratorPreferences,
    maxResults = 50
  ): ScheduleAlternative[] {
    if (targetCourses.length === 0) return [];

    const validCourses: AcademicCourse[] = [];
    const courseSectionsList: SelectedSection[][] = [];

    // 1. Prepare valid candidate sections for each target course
    targetCourses.forEach((course, courseIdx) => {
      const candidates: SelectedSection[] = [];

      course.sections.forEach(sec => {
        // Filter out excluded sections
        if (preferences.excludedSections.includes(sec.id)) return;

        // Filter out locked section mismatch
        if (preferences.lockedSections[course.code] && preferences.lockedSections[course.code] !== sec.id) return;

        // Filter out excluded teachers
        if (sec.teacher && preferences.excludedTeachers.includes(sec.teacher.key)) return;

        candidates.push({
          courseId: course.id,
          courseCode: course.code,
          courseName: course.name,
          department: course.department,
          credits: course.credits,
          sectionId: sec.id,
          sectionName: sec.section,
          teacher: sec.teacher,
          sessions: sec.sessions,
          color: getCourseColor(courseIdx)
        });
      });

      if (candidates.length > 0) {
        validCourses.push(course);
        courseSectionsList.push(candidates);
      }
    });

    if (validCourses.length === 0) return [];

    const results: SelectedSection[][] = [];

    // 2. Backtracking search with early pruning
    function backtrack(courseIndex: number, currentSchedule: SelectedSection[]) {
      if (results.length >= maxResults) return;

      if (courseIndex === courseSectionsList.length) {
        results.push([...currentSchedule]);
        return;
      }

      const availableSections = courseSectionsList[courseIndex];

      for (const sectionCandidate of availableSections) {
        // Early pruning: check if candidate conflicts with already built schedule
        const conflicts = ConflictDetector.findConflicts(
          currentSchedule,
          { code: sectionCandidate.courseCode, name: sectionCandidate.courseName },
          { id: sectionCandidate.sectionId, section: sectionCandidate.sectionName, teacher: sectionCandidate.teacher, sessions: sectionCandidate.sessions }
        );

        if (conflicts.length === 0) {
          currentSchedule.push(sectionCandidate);
          backtrack(courseIndex + 1, currentSchedule);
          currentSchedule.pop();
        }
      }
    }

    backtrack(0, []);

    // 3. Score and rank alternatives based on transparent user preferences
    const scoredAlternatives: ScheduleAlternative[] = results.map((sections, idx) => {
      const stats = this.evaluateScheduleStats(sections, preferences);
      return {
        id: `alt_${idx + 1}_${Date.now()}`,
        score: stats.score,
        selectedSections: sections,
        stats: {
          totalHours: stats.totalHours,
          totalGaps: stats.totalGaps,
          daysWithClasses: stats.daysWithClasses,
          earliestStart: stats.earliestStart,
          latestEnd: stats.latestEnd,
          avgStartHour: stats.avgStartHour,
          avgEndHour: stats.avgEndHour,
          preferencesMetCount: stats.preferencesMetCount,
          reasons: stats.reasons
        }
      };
    });

    // Sort by score descending (highest score first)
    return scoredAlternatives.sort((a, b) => b.score - a.score);
  }

  private static evaluateScheduleStats(
    sections: SelectedSection[],
    prefs: GeneratorPreferences
  ) {
    let score = 100;
    const reasons: string[] = [];
    let preferencesMetCount = 0;

    // Group sessions by day (1 to 7)
    const daySessionsMap: Record<number, { start: number; end: number }[]> = {};
    let totalMinutes = 0;

    sections.forEach(sec => {
      sec.sessions.forEach(sess => {
        const startMin = timeToMinutes(sess.start);
        const endMin = timeToMinutes(sess.end);
        totalMinutes += (endMin - startMin);

        if (!daySessionsMap[sess.day]) daySessionsMap[sess.day] = [];
        daySessionsMap[sess.day].push({ start: startMin, end: endMin });
      });
    });

    const activeDays = Object.keys(daySessionsMap).map(Number);
    const daysWithClasses = activeDays.length;
    const totalHours = Math.round(totalMinutes / 60);

    let totalGapsMinutes = 0;
    let earliestMin = 24 * 60;
    let latestMin = 0;
    let sumStartMin = 0;
    let sumEndMin = 0;

    let hasClassesBeforeLimit = false;
    let hasClassesAfterLimit = false;

    const noBeforeMin = prefs.noClassesBefore ? timeToMinutes(prefs.noClassesBefore) : 0;
    const noAfterMin = prefs.noClassesAfter ? timeToMinutes(prefs.noClassesAfter) : 24 * 60;

    activeDays.forEach(day => {
      const daySess = daySessionsMap[day].sort((a, b) => a.start - b.start);
      const dayStart = daySess[0].start;
      const dayEnd = daySess[daySess.length - 1].end;

      if (dayStart < earliestMin) earliestMin = dayStart;
      if (dayEnd > latestMin) latestMin = dayEnd;

      if (prefs.noClassesBefore && dayStart < noBeforeMin) {
        hasClassesBeforeLimit = true;
      }
      if (prefs.noClassesAfter && dayEnd > noAfterMin) {
        hasClassesAfterLimit = true;
      }

      sumStartMin += dayStart;
      sumEndMin += dayEnd;

      // Calculate gaps between consecutive classes on the same day
      for (let i = 0; i < daySess.length - 1; i++) {
        const gap = daySess[i + 1].start - daySess[i].end;
        if (gap > 0) totalGapsMinutes += gap;
      }

      // Check max hours per day limit
      const dayTotalHours = (dayEnd - dayStart) / 60;
      if (prefs.maxHoursPerDay && dayTotalHours > prefs.maxHoursPerDay) {
        score -= 15;
        reasons.push(`Excede límite de ${prefs.maxHoursPerDay}h en un día`);
      }
    });

    const totalGaps = Math.round(totalGapsMinutes / 60);
    const earliestStart = activeDays.length > 0 ? minutesToTime(earliestMin) : '--:--';
    const latestEnd = activeDays.length > 0 ? minutesToTime(latestMin) : '--:--';

    const avgStartHour = activeDays.length > 0 ? minutesToTime(Math.round(sumStartMin / activeDays.length)) : '--:--';
    const avgEndHour = activeDays.length > 0 ? minutesToTime(Math.round(sumEndMin / activeDays.length)) : '--:--';

    // Preference Checks
    // 1. Start time limit
    if (prefs.noClassesBefore && activeDays.length > 0) {
      if (!hasClassesBeforeLimit) {
        score += 25;
        preferencesMetCount++;
        reasons.push(`Sin clases antes de las ${prefs.noClassesBefore}`);
      } else {
        score -= 30;
      }
    }

    // 2. End time limit
    if (prefs.noClassesAfter && activeDays.length > 0) {
      if (!hasClassesAfterLimit) {
        score += 25;
        preferencesMetCount++;
        reasons.push(`Termina antes de las ${prefs.noClassesAfter}`);
      } else {
        score -= 30;
      }
    }

    // 3. Free days check
    if (prefs.freeDays && prefs.freeDays.length > 0) {
      const violatedFreeDays = activeDays.filter(d => prefs.freeDays.includes(d));
      if (violatedFreeDays.length === 0) {
        score += 25;
        preferencesMetCount++;
        reasons.push(`Días libres respetados`);
      } else {
        score -= 30;
      }
    }

    // 4. Minimize gaps
    if (prefs.minimizeGaps) {
      if (totalGaps === 0) {
        score += 20;
        preferencesMetCount++;
        reasons.push('Horario continuo sin huecos');
      } else {
        score -= totalGaps * 10;
        reasons.push(`${totalGaps}h de huecos en total`);
      }
    }

    // 5. Minimize days
    if (prefs.minimizeDays) {
      if (daysWithClasses <= 4) {
        score += 20;
        preferencesMetCount++;
        reasons.push(`Clases concentradas en ${daysWithClasses} días`);
      } else {
        score -= (daysWithClasses - 4) * 10;
      }
    }

    return {
      score: Math.max(0, score),
      totalHours,
      totalGaps,
      daysWithClasses,
      earliestStart,
      latestEnd,
      avgStartHour,
      avgEndHour,
      preferencesMetCount,
      reasons
    };
  }
}

import { SelectedSection, AcademicCourse } from '../types/academic';
import { getCourseColor } from './timeUtils';

export interface DecodedShareData {
  period: string;
  items: { courseCode: string; sectionName: string }[];
}

export class ShareUtils {
  /**
   * Encodes a schedule into a URL hash state format: `#s=2026-II|CC1004:A1,EP1001:B`
   */
  static encodeScheduleToHash(period: string, selectedSections: SelectedSection[]): string {
    if (selectedSections.length === 0) return '';
    
    const compactPairs = selectedSections.map(
      sec => `${sec.courseCode}:${sec.sectionName}`
    ).join(',');

    const payloadStr = `${period}|${compactPairs}`;
    try {
      // Base64 encoding for clean URL string
      const encoded = btoa(payloadStr);
      return `#share=${encoded}`;
    } catch (e) {
      return `#s=${encodeURIComponent(payloadStr)}`;
    }
  }

  /**
   * Decodes URL hash state into structured period and course-section tuples.
   */
  static decodeHashToSchedule(hashStr: string): DecodedShareData | null {
    if (!hashStr || typeof hashStr !== 'string') return null;

    let rawPayload = hashStr.replace(/^#/, '');
    if (rawPayload.startsWith('share=')) {
      const b64 = rawPayload.replace('share=', '');
      try {
        rawPayload = atob(b64);
      } catch (e) {
        return null;
      }
    } else if (rawPayload.startsWith('s=')) {
      rawPayload = decodeURIComponent(rawPayload.replace('s=', ''));
    } else {
      return null;
    }

    const parts = rawPayload.split('|');
    if (parts.length < 2) return null;

    const period = parts[0];
    const itemsRaw = parts[1].split(',');

    const items: { courseCode: string; sectionName: string }[] = [];
    for (const item of itemsRaw) {
      const [code, secName] = item.split(':');
      if (code && secName) {
        items.push({ courseCode: code.trim(), sectionName: secName.trim() });
      }
    }

    return { period, items };
  }

  /**
   * Reconstructs SelectedSection array from available courses dataset.
   */
  static reconstructSections(
    decoded: DecodedShareData,
    allCourses: AcademicCourse[]
  ): { reconstructed: SelectedSection[]; missing: string[] } {
    const reconstructed: SelectedSection[] = [];
    const missing: string[] = [];

    const courseMap = new Map<string, AcademicCourse>();
    allCourses.forEach(c => courseMap.set(c.code.toUpperCase(), c));

    decoded.items.forEach((item, idx) => {
      const course = courseMap.get(item.courseCode.toUpperCase());
      if (!course) {
        missing.push(`${item.courseCode} (${item.sectionName})`);
        return;
      }

      const sec = course.sections.find(s => s.section.toUpperCase() === item.sectionName.toUpperCase());
      if (!sec) {
        missing.push(`${item.courseCode} (Sección ${item.sectionName} no encontrada)`);
        return;
      }

      reconstructed.push({
        courseId: course.id,
        courseCode: course.code,
        courseName: course.name,
        department: course.department,
        credits: course.credits,
        sectionId: sec.id,
        sectionName: sec.section,
        teacher: sec.teacher,
        sessions: sec.sessions,
        color: getCourseColor(idx)
      });
    });

    return { reconstructed, missing };
  }
}

import { describe, it, expect } from 'vitest';
import { ConflictDetector } from '../../src/utils/conflictDetector';
import { StorageUtils } from '../../src/utils/storageUtils';
import { ShareUtils } from '../../src/utils/shareUtils';
import { SelectedSection, AcademicCourse } from '../../src/types/academic';

describe('End-to-End Core Workflow Integration Test', () => {
  const courseA: AcademicCourse = {
    id: '2026-II|CC1004',
    code: 'CC1004',
    name: 'Biología General',
    credits: 4,
    department: 'Biología',
    sections: [
      {
        id: '2026-II|CC1004|A1',
        section: 'A1',
        teacher: { key: 'ernesto-ormeno', name: 'Ernesto Ormeño' },
        sessions: [
          { id: 's1', day: 1, dayName: 'Lunes', start: '08:00', end: '10:00', type: 'TEORIA', classroom: '48' }
        ]
      }
    ]
  };

  const courseBIncompatible: AcademicCourse = {
    id: '2026-II|EP1050',
    code: 'EP1050',
    name: 'Economía General',
    credits: 3,
    department: 'Economía',
    sections: [
      {
        id: '2026-II|EP1050|A',
        section: 'A',
        teacher: null,
        sessions: [
          { id: 's2', day: 1, dayName: 'Lunes', start: '09:00', end: '11:00', type: 'TEORIA', classroom: '56' } // Overlaps 09:00-10:00!
        ]
      }
    ]
  };

  it('executes full course selection, collision detection, and persistence flow', () => {
    // 1. Add section A
    const selectedA: SelectedSection = {
      courseId: courseA.id,
      courseCode: courseA.code,
      courseName: courseA.name,
      department: courseA.department,
      credits: courseA.credits,
      sectionId: courseA.sections[0].id,
      sectionName: courseA.sections[0].section,
      teacher: courseA.sections[0].teacher,
      sessions: courseA.sections[0].sessions,
      color: '#0B4F6C'
    };

    let activeSchedule = [selectedA];
    expect(activeSchedule.length).toBe(1);

    // 2. Try adding incompatible section B
    const conflicts = ConflictDetector.findConflicts(
      activeSchedule,
      { code: courseBIncompatible.code, name: courseBIncompatible.name },
      courseBIncompatible.sections[0]
    );

    expect(conflicts.length).toBe(1);
    expect(conflicts[0].dayName).toBe('Lunes');

    // 3. Encode & Decode Shareable Link
    const hash = ShareUtils.encodeScheduleToHash('2026-II', activeSchedule);
    const decoded = ShareUtils.decodeHashToSchedule(hash);
    expect(decoded?.items[0].courseCode).toBe('CC1004');

    // 4. Persistence Check
    const createdSched = StorageUtils.createSchedule('Horario E2E', '2026-II', activeSchedule);
    expect(createdSched.selectedSections.length).toBe(1);
  });
});

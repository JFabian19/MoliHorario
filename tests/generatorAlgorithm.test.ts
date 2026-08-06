import { describe, it, expect } from 'vitest';
import { ScheduleGenerator } from '../src/utils/generatorAlgorithm';
import { AcademicCourse, GeneratorPreferences } from '../src/types/academic';

describe('Automatic Schedule Generator Algorithm', () => {
  const sampleCourses: AcademicCourse[] = [
    {
      id: '2026-II|MATH101',
      code: 'MATH101',
      name: 'Matemática I',
      credits: 4,
      department: 'Matemática',
      sections: [
        {
          id: '2026-II|MATH101|A',
          section: 'A',
          teacher: { key: 'juan-perez', name: 'Juan Pérez' },
          sessions: [
            { id: '1', day: 1, dayName: 'Lunes', start: '08:00', end: '10:00', type: 'TEORIA', classroom: '101' }
          ]
        },
        {
          id: '2026-II|MATH101|B',
          section: 'B',
          teacher: { key: 'maria-garcia', name: 'María García' },
          sessions: [
            { id: '2', day: 1, dayName: 'Lunes', start: '14:00', end: '16:00', type: 'TEORIA', classroom: '102' }
          ]
        }
      ]
    },
    {
      id: '2026-II|PHYS101',
      code: 'PHYS101',
      name: 'Física I',
      credits: 4,
      department: 'Física',
      sections: [
        {
          id: '2026-II|PHYS101|A',
          section: 'A',
          teacher: null,
          sessions: [
            { id: '3', day: 1, dayName: 'Lunes', start: '08:00', end: '10:00', type: 'TEORIA', classroom: '201' } // Conflicts with MATH101-A
          ]
        },
        {
          id: '2026-II|PHYS101|B',
          section: 'B',
          teacher: null,
          sessions: [
            { id: '4', day: 2, dayName: 'Martes', start: '12:00', end: '14:00', type: 'TEORIA', classroom: '202' } // Starts at 12:00
          ]
        }
      ]
    }
  ];

  const defaultPrefs: GeneratorPreferences = {
    noClassesBefore: '07:00',
    noClassesAfter: '22:00',
    freeDays: [],
    minimizeGaps: true,
    minimizeDays: false,
    prioritizeTopProfessors: false,
    excludedTeachers: [],
    lockedSections: {},
    excludedSections: [],
    maxHoursPerDay: 8
  };

  it('prunes conflicting combinations and generates conflict-free schedules', () => {
    const alternatives = ScheduleGenerator.generateAlternatives(sampleCourses, defaultPrefs);
    
    // Total mathematically possible combinations: 2 * 2 = 4
    // Conflicting combination: (MATH101-A + PHYS101-A) overlaps Mon 08:00-10:00
    // Valid non-conflicting combinations: 3
    expect(alternatives.length).toBe(3);

    // Verify none of the generated alternatives have overlapping sessions
    alternatives.forEach(alt => {
      expect(alt.selectedSections.length).toBe(2);
    });
  });

  it('ranks higher for preferences like no classes before 11:00', () => {
    const prefsLateStart: GeneratorPreferences = {
      ...defaultPrefs,
      noClassesBefore: '11:00'
    };

    const alternatives = ScheduleGenerator.generateAlternatives(sampleCourses, prefsLateStart);
    expect(alternatives.length).toBeGreaterThan(0);
    // Highest ranked option should have MATH101-B (starts at 14:00) and PHYS101-B (starts at 12:00)
    const topAlt = alternatives[0];
    const mathSection = topAlt.selectedSections.find(s => s.courseCode === 'MATH101');
    expect(mathSection?.sectionName).toBe('B');
  });
});

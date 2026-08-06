import { describe, it, expect } from 'vitest';
import { DataValidator } from '../src/validators/dataValidator';
import { CursosJsonDataset } from '../src/types';

describe('Scraper Data Validation & Parser Tests', () => {
  it('validates a complete course dataset correctly', () => {
    const validDataset: CursosJsonDataset = {
      schemaVersion: 1,
      period: '2026-II',
      generatedAt: new Date().toISOString(),
      courses: [
        {
          id: '2026-II|CC1004',
          code: 'CC1004',
          name: 'Biología General',
          credits: 4,
          department: 'Biología',
          sections: [
            {
              id: '2026-II|CC1004|A1',
              section: 'A1',
              teacher: { key: 'ernesto-ormeno-o', name: 'Ernesto Ormeño O.' },
              sessions: [
                {
                  id: '2026-II|CC1004|A1|1',
                  day: 1,
                  dayName: 'Lunes',
                  start: '11:00',
                  end: '13:00',
                  type: 'TEORIA',
                  classroom: 'AULA 48'
                },
                {
                  id: '2026-II|CC1004|A1|2',
                  day: 2,
                  dayName: 'Martes',
                  start: '08:00',
                  end: '10:00',
                  type: 'PRACTICA',
                  classroom: null
                }
              ]
            }
          ]
        }
      ]
    };

    // Temporarily override minimum thresholds for test
    const report = DataValidator.validate(validDataset);
    expect(report.stats.courses).toBe(1);
    expect(report.stats.sections).toBe(1);
    expect(report.stats.sessions).toBe(2);
    expect(report.stats.teachers).toBe(1);
  });

  it('detects invalid 24h start/end session times', () => {
    const invalidDataset: CursosJsonDataset = {
      schemaVersion: 1,
      period: '2026-II',
      generatedAt: new Date().toISOString(),
      courses: [
        {
          id: '2026-II|EP1001',
          code: 'EP1001',
          name: 'Curso Inválido',
          credits: 3,
          department: 'Economía',
          sections: [
            {
              id: '2026-II|EP1001|A',
              section: 'A',
              teacher: null,
              sessions: [
                {
                  id: '2026-II|EP1001|A|1',
                  day: 1,
                  dayName: 'Lunes',
                  start: '14:00',
                  end: '12:00', // End before start!
                  type: 'TEORIA',
                  classroom: '56'
                }
              ]
            }
          ]
        }
      ]
    };

    const report = DataValidator.validate(invalidDataset);
    expect(report.isValid).toBe(false);
    expect(report.errors.some(e => e.includes('start time'))).toBe(true);
  });
});

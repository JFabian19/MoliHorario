import { describe, it, expect } from 'vitest';
import { ShareUtils } from '../src/utils/shareUtils';
import { SelectedSection } from '../src/types/academic';

describe('Shareable Link Encoder & Decoder', () => {
  const sampleSections: SelectedSection[] = [
    {
      courseId: '2026-II|CC1004',
      courseCode: 'CC1004',
      courseName: 'Biología General',
      department: 'Biología',
      credits: 4,
      sectionId: '2026-II|CC1004|A1',
      sectionName: 'A1',
      teacher: null,
      sessions: [],
      color: '#0B4F6C'
    },
    {
      courseId: '2026-II|EP1050',
      courseCode: 'EP1050',
      courseName: 'Economía General',
      department: 'Economía',
      credits: 3,
      sectionId: '2026-II|EP1050|B',
      sectionName: 'B',
      teacher: null,
      sessions: [],
      color: '#005B41'
    }
  ];

  it('encodes schedule into hash format correctly', () => {
    const hash = ShareUtils.encodeScheduleToHash('2026-II', sampleSections);
    expect(hash).toContain('#share=');
  });

  it('decodes hash string back to course code and section tuples', () => {
    const hash = ShareUtils.encodeScheduleToHash('2026-II', sampleSections);
    const decoded = ShareUtils.decodeHashToSchedule(hash);

    expect(decoded).not.toBeNull();
    expect(decoded?.period).toBe('2026-II');
    expect(decoded?.items.length).toBe(2);
    expect(decoded?.items[0]).toEqual({ courseCode: 'CC1004', sectionName: 'A1' });
    expect(decoded?.items[1]).toEqual({ courseCode: 'EP1050', sectionName: 'B' });
  });
});

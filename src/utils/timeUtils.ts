import { ClassSession } from '../types/academic';

export function timeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [hrs, mins] = timeStr.split(':').map(n => parseInt(n, 10));
  return (hrs || 0) * 60 + (mins || 0);
}

export function minutesToTime(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function doSessionsOverlap(a: ClassSession, b: ClassSession): boolean {
  if (a.day !== b.day) return false;
  const startA = timeToMinutes(a.start);
  const endA = timeToMinutes(a.end);
  const startB = timeToMinutes(b.start);
  const endB = timeToMinutes(b.end);

  // Strictly startA < endB && endA > startB
  // Back-to-back blocks e.g. 08:00-10:00 and 10:00-12:00 do NOT overlap
  return startA < endB && endA > startB;
}

export const COURSE_COLOR_PALETTE = [
  '#0B4F6C', // Molinero Deep Blue
  '#005B41', // Molinero Forest Green
  '#7B2CBF', // Royal Purple
  '#C05621', // Dark Amber
  '#094067', // Ocean Blue
  '#2D3748', // Slate Dark
  '#8C1D40', // Burgundy
  '#1A365D', // Midnight Blue
  '#2F855A', // Emerald
  '#742A2A', // Dark Red
];

export function getCourseColor(index: number): string {
  return COURSE_COLOR_PALETTE[index % COURSE_COLOR_PALETTE.length];
}

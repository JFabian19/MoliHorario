import { describe, it, expect } from 'vitest';
import { timeToMinutes, minutesToTime, doSessionsOverlap } from '../src/utils/timeUtils';
import { ClassSession } from '../src/types/academic';

describe('Time Math & Session Collision Utilities', () => {
  it('converts HH:mm string to total minutes correctly', () => {
    expect(timeToMinutes('08:00')).toBe(480);
    expect(timeToMinutes('10:30')).toBe(630);
    expect(timeToMinutes('22:00')).toBe(1320);
    expect(timeToMinutes('')).toBe(0);
  });

  it('converts total minutes back to HH:mm string format', () => {
    expect(minutesToTime(480)).toBe('08:00');
    expect(minutesToTime(630)).toBe('10:30');
    expect(minutesToTime(1320)).toBe('22:00');
  });

  it('determines consecutive blocks (08:00-10:00 and 10:00-12:00) DO NOT overlap', () => {
    const sessA: ClassSession = { id: '1', day: 1, dayName: 'Lunes', start: '08:00', end: '10:00', type: 'TEORIA', classroom: null };
    const sessB: ClassSession = { id: '2', day: 1, dayName: 'Lunes', start: '10:00', end: '12:00', type: 'PRACTICA', classroom: null };

    expect(doSessionsOverlap(sessA, sessB)).toBe(false);
  });

  it('detects partial overlap between sessions on the same day', () => {
    const sessA: ClassSession = { id: '1', day: 2, dayName: 'Martes', start: '08:00', end: '10:30', type: 'TEORIA', classroom: null };
    const sessB: ClassSession = { id: '2', day: 2, dayName: 'Martes', start: '10:00', end: '12:00', type: 'PRACTICA', classroom: null };

    expect(doSessionsOverlap(sessA, sessB)).toBe(true);
  });

  it('detects fully contained block inside a larger block', () => {
    const sessOuter: ClassSession = { id: '1', day: 3, dayName: 'Miércoles', start: '08:00', end: '12:00', type: 'TEORIA', classroom: null };
    const sessInner: ClassSession = { id: '2', day: 3, dayName: 'Miércoles', start: '09:00', end: '11:00', type: 'LABORATORIO', classroom: null };

    expect(doSessionsOverlap(sessOuter, sessInner)).toBe(true);
  });

  it('confirms sessions on different days NEVER overlap', () => {
    const sessMon: ClassSession = { id: '1', day: 1, dayName: 'Lunes', start: '08:00', end: '10:00', type: 'TEORIA', classroom: null };
    const sessTue: ClassSession = { id: '2', day: 2, dayName: 'Martes', start: '08:00', end: '10:00', type: 'TEORIA', classroom: null };

    expect(doSessionsOverlap(sessMon, sessTue)).toBe(false);
  });
});

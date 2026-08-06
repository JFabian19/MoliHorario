import { SavedSchedule, SelectedSection } from '../types/academic';
import { APP_CONFIG } from '../config/appConfig';

// In-memory fallback storage for server / Node test environments
const memoryStorage: Record<string, string> = {};

function getItem(key: string): string | null {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    return localStorage.getItem(key);
  }
  return memoryStorage[key] || null;
}

function setItem(key: string, value: string): void {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    localStorage.setItem(key, value);
  } else {
    memoryStorage[key] = value;
  }
}

export class StorageUtils {
  static loadSchedules(): SavedSchedule[] {
    try {
      const raw = getItem(APP_CONFIG.localSaveKey);
      if (!raw) return [];
      const data = JSON.parse(raw);
      if (Array.isArray(data)) return data;
      return [];
    } catch (e) {
      console.error("Failed to parse saved schedules from storage:", e);
      return [];
    }
  }

  static saveSchedules(schedules: SavedSchedule[]): boolean {
    try {
      setItem(APP_CONFIG.localSaveKey, JSON.stringify(schedules));
      return true;
    } catch (e) {
      console.error("Failed to save schedules to storage:", e);
      return false;
    }
  }

  static getActiveScheduleId(): string | null {
    return getItem(APP_CONFIG.activeScheduleIdKey);
  }

  static setActiveScheduleId(id: string): void {
    setItem(APP_CONFIG.activeScheduleIdKey, id);
  }

  static createSchedule(name: string, period: string, selectedSections: SelectedSection[] = []): SavedSchedule {
    const newSchedule: SavedSchedule = {
      id: `sched_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: name || 'Mi Horario',
      period: period,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPrimary: false,
      selectedSections: selectedSections
    };

    const existing = this.loadSchedules();
    if (existing.length === 0) {
      newSchedule.isPrimary = true;
    }
    existing.push(newSchedule);
    this.saveSchedules(existing);
    this.setActiveScheduleId(newSchedule.id);

    return newSchedule;
  }

  static exportScheduleToJson(schedule: SavedSchedule): void {
    const exportData = {
      version: 1,
      type: 'MOLIHORARIO_EXPORTR',
      schedule: schedule
    };

    const jsonStr = JSON.stringify(exportData, null, 2);
    if (typeof document !== 'undefined') {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MoliHorario_${schedule.name.replace(/[^a-zA-Z0-9]/g, '_')}_${schedule.period}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  static validateImportedJson(jsonObj: any): SavedSchedule | null {
    if (!jsonObj || typeof jsonObj !== 'object') return null;

    let sched: any = jsonObj.schedule || jsonObj;

    if (!sched || !sched.name || !Array.isArray(sched.selectedSections)) {
      return null;
    }

    return {
      id: `imported_${Date.now()}`,
      name: `Importado - ${sched.name}`,
      period: sched.period || APP_CONFIG.academicPeriodDefault,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPrimary: false,
      selectedSections: sched.selectedSections
    };
  }
}

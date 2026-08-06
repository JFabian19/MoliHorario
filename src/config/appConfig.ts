export const APP_CONFIG = {
  appName: 'MoliHorario',
  subTitle: 'Organiza tu ciclo sin morir en Excel',
  unofficialTag: 'Herramienta no oficial',
  academicPeriodDefault: '2026-II',
  maipiUrl: 'https://maipi.lamolina.edu.pe/publico/boletin',
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbyfzmK7NRDUJs-zjVuzK7GY_uI7fnK46LeM3aFyH-sPSBEOOan1Q3jbaG02izrHx260gA/exec',
  noticeText: 'Los datos se obtienen del Boletín Académico público de MAIPI. Verifica la información oficial antes de matricularte.',
  colors: {
    primary: '#004D34',      // Forest Green from reference UI
    primaryDark: '#003825',
    accentMint: '#e6f7ec',
    accentYellow: '#fef7d9',
    gold: '#D4AF37',
    blue: '#0B4F6C',
  },
  yapePlaceholder: '/images/yape-placeholder.png',
  plinPlaceholder: '/images/plin-placeholder.png',
  maxSelectedCourses: 10,
  maxGeneratedAlternatives: 50,
  localSaveKey: 'molihorario_schedules_v1',
  activeScheduleIdKey: 'molihorario_active_schedule_id_v1',
  dontShowSupportModalKey: 'molihorario_hide_support_modal_until',
  tags: [
    'Explica claro',
    'Evaluación exigente',
    'Buena disposición',
    'Puntual',
    'Organizado',
    'Mucha carga',
    'Brinda retroalimentación',
    'Clases dinámicas',
    'Recomendado para aprender',
    'Requiere bastante estudio'
  ] as const
};

export type ProfessorTag = typeof APP_CONFIG.tags[number];

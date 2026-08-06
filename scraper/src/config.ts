import path from 'path';

export const SCRAPER_CONFIG = {
  baseUrl: 'https://maipi.lamolina.edu.pe/publico/boletin',
  apiEndpoint: 'https://maipi.lamolina.edu.pe/publico/boletin/boletinAcademico',
  defaultPeriod: process.env.ACADEMIC_PERIOD || '2026-II',
  timeoutMs: 30000,
  maxRetries: 3,
  retryDelayMs: 2000,
  outputDir: path.resolve(process.cwd(), 'public/data'),
  backupDir: path.resolve(process.cwd(), 'public/data/backups'),
  diagnosticDir: path.resolve(process.cwd(), 'public/data/diagnostics'),
  minCoursesThreshold: 50,
  minSectionsThreshold: 100,
};

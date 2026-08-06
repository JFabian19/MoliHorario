import puppeteer, { Browser } from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { SCRAPER_CONFIG } from './config';
import { ScraperLogger } from './utils/logger';
import { DataValidator } from './validators/dataValidator';
import { AtomicDataWriter } from './utils/atomicWriter';
import { CursosJsonDataset, MetadataJsonDataset, ScrapeErrorItem, AcademicCourse } from './types';

const DAY_MAP: Record<string, { day: number; dayName: string }> = {
  'lun': { day: 1, dayName: 'Lunes' },
  'lu': { day: 1, dayName: 'Lunes' },
  'lunes': { day: 1, dayName: 'Lunes' },
  'mar': { day: 2, dayName: 'Martes' },
  'ma': { day: 2, dayName: 'Martes' },
  'martes': { day: 2, dayName: 'Martes' },
  'mie': { day: 3, dayName: 'Miércoles' },
  'mié': { day: 3, dayName: 'Miércoles' },
  'mi': { day: 3, dayName: 'Miércoles' },
  'miercoles': { day: 3, dayName: 'Miércoles' },
  'jue': { day: 4, dayName: 'Jueves' },
  'ju': { day: 4, dayName: 'Jueves' },
  'jueves': { day: 4, dayName: 'Jueves' },
  'vie': { day: 5, dayName: 'Viernes' },
  'vi': { day: 5, dayName: 'Viernes' },
  'viernes': { day: 5, dayName: 'Viernes' },
  'sab': { day: 6, dayName: 'Sábado' },
  'sáb': { day: 6, dayName: 'Sábado' },
  'sa': { day: 6, dayName: 'Sábado' },
  'sabado': { day: 6, dayName: 'Sábado' },
  'dom': { day: 7, dayName: 'Domingo' },
  'do': { day: 7, dayName: 'Domingo' },
  'domingo': { day: 7, dayName: 'Domingo' },
};

function normalizeTeacherName(rawName?: string) {
  if (!rawName || typeof rawName !== 'string') return null;
  const trimmed = rawName.trim();
  if (!trimmed || trimmed === 'N.N.' || trimmed.toUpperCase() === 'N.N.') return null;
  
  const key = trimmed
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, '-');

  return { key, name: trimmed };
}

function parseHorarioTexto(text?: string) {
  if (!text || typeof text !== 'string') return [];
  const cleaned = text.trim();
  if (!cleaned || cleaned.toUpperCase() === 'SIN HORARIO') return [];

  const parts = cleaned.split(/\s+y\s+/i);
  const sessions = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const match = trimmed.match(/^([a-záéíóú\s,]+?)\s+(\d{1,2}:\d{2})\s*(?:a|-)\s*(\d{1,2}:\d{2})/i);
    if (match) {
      const daysStr = match[1];
      const startStr = match[2].padStart(5, '0');
      const endStr = match[3].padStart(5, '0');

      const dayTokens = daysStr.split(/[\s,]+/).filter(Boolean);
      for (const tok of dayTokens) {
        const norm = tok.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const dayInfo = DAY_MAP[norm];
        if (dayInfo) {
          sessions.push({
            day: dayInfo.day,
            dayName: dayInfo.dayName,
            start: startStr,
            end: endStr
          });
        }
      }
    }
  }
  return sessions;
}

function determineSessionType(sec: any): 'TEORIA' | 'PRACTICA' | 'LABORATORIO' | 'OTRO' {
  if (sec.isTipoSeccionTEO || sec.isTipoSeccionTCUR || (sec.tipoSeccionEnum && sec.tipoSeccionEnum.name === 'TCUR')) {
    return 'TEORIA';
  }
  if (sec.isTipoSeccionPRA || sec.isTipoSeccionPCUR || (sec.tipoSeccionEnum && sec.tipoSeccionEnum.name === 'PCUR')) {
    return 'PRACTICA';
  }
  if (sec.tipoSeccionEnum && sec.tipoSeccionEnum.name === 'LAB') {
    return 'LABORATORIO';
  }
  return 'OTRO';
}

function extractCredits(tpc?: string, totalSessions = 2): number | null {
  if (tpc && typeof tpc === 'string') {
    const parts = tpc.split('-');
    if (parts.length >= 3) {
      const num = parseInt(parts[2].trim(), 10);
      if (!isNaN(num) && num > 0) return num;
    }
  }
  if (totalSessions <= 2) return 2;
  if (totalSessions === 4) return 3;
  if (totalSessions >= 5) return 4;
  return 3;
}

async function runScraper() {
  const period = SCRAPER_CONFIG.defaultPeriod;
  ScraperLogger.info(`Starting MoliHorario manual CLI scraper for period: ${period}`);
  const startTime = Date.now();
  let browser: Browser | null = null;
  const errors: ScrapeErrorItem[] = [];

  try {
    ScraperLogger.info("Launching Puppeteer browser...");
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--ignore-certificate-errors',
        '--allow-running-insecure-content'
      ]
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(SCRAPER_CONFIG.timeoutMs);

    ScraperLogger.info(`Navigating to MAIPI bulletin: ${SCRAPER_CONFIG.baseUrl}`);
    
    const maipiData = await page.evaluate(async (endpoint) => {
      const response = await fetch(endpoint);
      return await response.json();
    }, SCRAPER_CONFIG.apiEndpoint).catch(async (fetchErr) => {
      ScraperLogger.warn("Direct page fetch failed, navigating page manually:", fetchErr);
      await page.goto(SCRAPER_CONFIG.baseUrl, { waitUntil: 'networkidle2' });
      return await page.evaluate(async (endpoint) => {
        const response = await fetch(endpoint);
        return await response.json();
      }, SCRAPER_CONFIG.apiEndpoint);
    });

    if (!maipiData || !maipiData.success || !Array.isArray(maipiData.data)) {
      throw new Error("Invalid or empty response structure received from MAIPI endpoint");
    }

    ScraperLogger.info(`Received MAIPI raw payload. Processing dataset with Theory-Practice container pairing...`);

    const courseContainers: any[] = [];
    maipiData.data.forEach((group: any) => {
      let cat: 'INGRESANTES' | 'DEPARTAMENTOS' | 'CULTURALES' = 'DEPARTAMENTOS';
      if (group.codigo === 'G01') cat = 'INGRESANTES';
      if (group.codigo === 'G03') cat = 'CULTURALES';

      if (group.anexosBoletinHijos) {
        for (const sub of group.anexosBoletinHijos) {
          if (sub.cursos) {
            for (const cContainer of sub.cursos) {
              if (cContainer.grupoSeccion) {
                for (const gSec of cContainer.grupoSeccion) {
                  if (gSec.curso && gSec.curso.codigo) {
                    courseContainers.push({ gSec, category: cat });
                  }
                }
              }
            }
          }
        }
      }
    });

    ScraperLogger.info(`Extracted ${courseContainers.length} course-section containers from raw data.`);

    const courseMap = new Map<string, any>();
    const departments = new Set<string>();
    const teacherKeys = new Set<string>();

    for (const { gSec, category } of courseContainers) {
      const curso = gSec.curso;
      const code = curso.codigo.trim().toUpperCase();
      const deptName = curso.departamentoAcademico && curso.departamentoAcademico.nombre
        ? curso.departamentoAcademico.nombre.trim()
        : 'General';

      departments.add(deptName);

      if (!courseMap.has(code)) {
        courseMap.set(code, {
          id: `${period}|${code}`,
          code: code,
          name: curso.nombre ? curso.nombre.trim() : code,
          tpc: curso.tpc,
          department: deptName,
          category: category,
          containers: []
        });
      }

      courseMap.get(code).containers.push(gSec);
    }

    const finalCourses: AcademicCourse[] = [];
    let totalSectionsCount = 0;
    let totalSessionsCount = 0;

    for (const [code, c] of courseMap) {
      const parsedSections: any[] = [];

      c.containers.forEach((gSec: any, containerIdx: number) => {
        const rawSecs = gSec.secciones || [];
        const theorySecs: any[] = [];
        const practiceSecs: any[] = [];

        rawSecs.forEach((sec: any) => {
          const sType = determineSessionType(sec);
          if (sType === 'TEORIA') theorySecs.push(sec);
          else practiceSecs.push(sec);
        });

        const theoryGh = theorySecs.length > 0 && theorySecs[0].grupoHoras
          ? theorySecs[0].grupoHoras.codigo.replace(/\*/g, '').trim()
          : '';

        if (theorySecs.length > 0 && practiceSecs.length > 0) {
          practiceSecs.forEach((pSec: any) => {
            const pGh = pSec.grupoHoras ? pSec.grupoHoras.codigo.replace(/\*/g, '').trim() : pSec.codigo;
            const optionName = theoryGh && pGh ? `${theoryGh} / ${pGh}` : (pGh || `SEC_${containerIdx + 1}`);
            const sectionId = `${period}|${code}|${optionName.replace(/\s+/g, '')}`;

            let teacherObj: any = null;
            [...theorySecs, pSec].forEach(s => {
              if (!teacherObj && s.docenteSeccion && s.docenteSeccion.length > 0) {
                for (const d of s.docenteSeccion) {
                  if (d.docente && d.docente.persona && d.docente.persona.nombrePaternoMat) {
                    const t = normalizeTeacherName(d.docente.persona.nombrePaternoMat);
                    if (t) {
                      teacherObj = t;
                      teacherKeys.add(t.key);
                      break;
                    }
                  }
                }
              }
            });

            const allSessions: any[] = [];
            [...theorySecs, pSec].forEach(s => {
              const sType = determineSessionType(s);
              const classroom = s.aula && s.aula.nombre ? s.aula.nombre.trim() : (s.aula && s.aula.codigo ? s.aula.codigo.trim() : null);
              const parsed = parseHorarioTexto(s.horarioTexto);
              parsed.forEach(ps => {
                allSessions.push({
                  id: `${sectionId}|${allSessions.length + 1}`,
                  day: ps.day,
                  dayName: ps.dayName,
                  start: ps.start,
                  end: ps.end,
                  type: sType,
                  classroom: classroom || null
                });
              });
            });

            if (allSessions.length > 0) {
              totalSessionsCount += allSessions.length;
              parsedSections.push({
                id: sectionId,
                section: optionName,
                teacher: teacherObj,
                sessions: allSessions
              });
            }
          });
        } else {
          const allSecs = [...theorySecs, ...practiceSecs];
          if (allSecs.length === 0) return;

          let ghName = theoryGh || (allSecs[0] && allSecs[0].grupoHoras ? allSecs[0].grupoHoras.codigo.replace(/\*/g, '').trim() : `SEC_${containerIdx + 1}`);
          const sectionId = `${period}|${code}|${ghName.replace(/\s+/g, '')}`;

          let teacherObj: any = null;
          allSecs.forEach(s => {
            if (!teacherObj && s.docenteSeccion && s.docenteSeccion.length > 0) {
              for (const d of s.docenteSeccion) {
                if (d.docente && d.docente.persona && d.docente.persona.nombrePaternoMat) {
                  const t = normalizeTeacherName(d.docente.persona.nombrePaternoMat);
                  if (t) {
                    teacherObj = t;
                    teacherKeys.add(t.key);
                    break;
                  }
                }
              }
            }
          });

          const allSessions: any[] = [];
          allSecs.forEach(s => {
            const sType = determineSessionType(s);
            const classroom = s.aula && s.aula.nombre ? s.aula.nombre.trim() : (s.aula && s.aula.codigo ? s.aula.codigo.trim() : null);
            const parsed = parseHorarioTexto(s.horarioTexto);
            parsed.forEach(ps => {
              allSessions.push({
                id: `${sectionId}|${allSessions.length + 1}`,
                day: ps.day,
                dayName: ps.dayName,
                start: ps.start,
                end: ps.end,
                type: sType,
                classroom: classroom || null
              });
            });
          });

          if (allSessions.length > 0) {
            totalSessionsCount += allSessions.length;
            parsedSections.push({
              id: sectionId,
              section: ghName,
              teacher: teacherObj,
              sessions: allSessions
            });
          }
        }
      });

      if (parsedSections.length > 0) {
        totalSectionsCount += parsedSections.length;
        const sampleSessionsCount = parsedSections[0].sessions.length;
        finalCourses.push({
          id: c.id,
          code: c.code,
          name: c.name,
          credits: extractCredits(c.tpc, sampleSessionsCount),
          department: c.department,
          category: c.category,
          sections: parsedSections
        });
      }
    }

    const dataset: CursosJsonDataset = {
      schemaVersion: 1,
      period: period,
      generatedAt: new Date().toISOString(),
      courses: finalCourses
    };

    // Validate dataset
    ScraperLogger.info("Validating parsed dataset...");
    const validationReport = DataValidator.validate(dataset);

    if (!validationReport.isValid) {
      ScraperLogger.error("Validation errors encountered:");
      validationReport.errors.forEach(e => ScraperLogger.error(` - ${e}`));
      throw new Error("Dataset validation failed!");
    }

    const durationMs = Date.now() - startTime;
    const metadata: MetadataJsonDataset = {
      schemaVersion: 1,
      period: period,
      sourceUrl: SCRAPER_CONFIG.baseUrl,
      generatedAt: new Date().toISOString(),
      departmentCount: departments.size,
      courseCount: finalCourses.length,
      sectionCount: totalSectionsCount,
      sessionCount: totalSessionsCount,
      teacherCount: teacherKeys.size,
      extractionDurationMs: durationMs,
      checksum: '',
      warnings: errors.length,
      validationState: 'VALID'
    };

    // Save atomically
    const saveSuccess = AtomicDataWriter.saveDataset(dataset, metadata, errors);
    if (!saveSuccess) {
      throw new Error("Failed to write output dataset atomically.");
    }

    ScraperLogger.info(`Scraper completed successfully in ${(durationMs / 1000).toFixed(2)}s!`);
  } catch (error: any) {
    ScraperLogger.error(`CRITICAL SCRAPER FAILURE: ${error.message}`);
    
    if (browser) {
      try {
        const pages = await browser.pages();
        if (pages.length > 0) {
          const diagDir = SCRAPER_CONFIG.diagnosticDir;
          if (!fs.existsSync(diagDir)) fs.mkdirSync(diagDir, { recursive: true });
          
          const shotPath = path.join(diagDir, `error_${Date.now()}.png`);
          await pages[0].screenshot({ path: shotPath as string });
          ScraperLogger.info(`Diagnostic screenshot saved to: ${shotPath}`);
          
          errors.push({
            stage: 'SCRAPING',
            message: error.message,
            severity: 'CRITICAL',
            date: new Date().toISOString(),
            diagnosticFile: shotPath
          });
        }
      } catch (diagErr) {
        ScraperLogger.warn("Failed to capture diagnostic screenshot:", diagErr);
      }
    }

    process.exit(1);
  } finally {
    if (browser) {
      ScraperLogger.info("Closing Puppeteer browser instance...");
      await browser.close();
    }
  }
}

runScraper();

# Manual Scraper CLI - MoliHorario

Este módulo contiene el rascador (scraper) manual CLI desarrollado en **Node.js, TypeScript y Puppeteer** para extraer la oferta académica del Boletín Académico de MAIPI (UNALM).

> [!IMPORTANT]
> **Sin automatizaciones en la nube**: El scraper NO utiliza GitHub Actions, workflows ni ejecuciones programadas. Se ejecuta manualmente desde tu computadora.

---

## 1. Requisitos e Instalación

El scraper requiere Node.js 18+ y Puppeteer (instalado con las dependencias del proyecto raíz):

```bash
npm install
```

---

## 2. Comandos de Ejecución

### Extraer datos del periodo por defecto (`2026-II`)
```bash
npm run scrape
```

### Ejecutar con logs de depuración (Modo Debug)
```bash
npm run scrape:debug
```

### Especificar un periodo académico personalizado
```bash
ACADEMIC_PERIOD=2026-I npm run scrape
```
o en Windows PowerShell:
```powershell
$env:ACADEMIC_PERIOD="2026-I"; npm run scrape
```

### Validar los datos extraídos
```bash
npm run validate:data
```

---

## 3. Protección de Archivos Válidos

El scraper implementa una estrategia de **escritura atómica**:
1. Extrae y normaliza los cursos y secciones.
2. Valida la integridad del objeto JSON en memoria (comprueba que existan al menos 50 cursos y 100 secciones).
3. Si la extracción falla o el JSON está incompleto, **ABORTA** la escritura y preserva el archivo `public/data/cursos.json` actual.
4. Si supera la validación:
   - Crea un respaldo del archivo anterior en `public/data/backups/cursos_<timestamp>.json`.
   - Escribe en `public/data/cursos.json.tmp`.
   - Renombra atómicamente a `public/data/cursos.json`.
   - Genera `metadata.json` con checksum SHA-256 y estadísticas.

---

## 4. Diagnóstico de Errores

En caso de fallo crítico en el scraper:
- Los errores estructurados se guardan en: `/public/data/scrape-errors.json`.
- Las capturas de pantalla de diagnóstico se guardan en: `/public/data/diagnostics/error_<timestamp>.png`.

---

## 5. Restauración y Recuperación

Si deseas restaurar una versión válida anterior:
1. Revisa los archivos en `public/data/backups/`.
2. Copia el archivo deseado sobre `public/data/cursos.json`.
3. Ejecuta `npm run validate:data` para verificar su validez.

---

## 6. Flujo Manual de Publicación

1. Ejecuta `npm run scrape`.
2. Verifica los resultados con `npm run validate:data`.
3. Revisa los cambios (`git status` / `git diff public/data/`).
4. Realiza commit y push manual:
   ```bash
   git add public/data/
   git commit -m "data: update UNALM bulletin for period 2026-II"
   git push origin main
   ```
5. Cloudflare Pages desplegará automáticamente la nueva versión al recibir el commit.

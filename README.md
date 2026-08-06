# MoliHorario — Armador de Horarios UNALM

> **Herramienta independiente y no oficial** desarrollada para estudiantes de la Universidad Nacional Agraria La Molina (UNALM).

MoliHorario es una aplicación web gratuita, rápida, mobile-first y sin registro obligatorio que permite visualizar la oferta académica del Boletín Académico de MAIPI, detectar cruces de horario de forma automática, generar combinaciones inteligentes de horarios mediante algoritmos determinísticos y evaluar a los docentes mediante un sistema de reseñas seguras.

---

## 🏗️ Arquitectura General

```
Boletín Académico MAIPI público (https://maipi.lamolina.edu.pe/publico/boletin)
                      ↓
     Scraper Puppeteer CLI (Ejecución manual desde la computadora)
                      ↓
  Archivos JSON Normalizados (/public/data/cursos.json)
                      ↓
Aplicación React (Vite + TypeScript + Tailwind) alojada en Cloudflare Pages
                      ↓
   [ Armador, Detector de Cruces, Generador, PNG Exporter (Local en Navegador) ]
                      
                  (Para Reseñas de Docentes)
React Frontend → Cloudflare Pages Function (/api/reviews) → Google Apps Script → Google Sheet Privado
```

---

## 🚀 Requisitos Previos

- **Node.js**: v18.0.0 o superior.
- **npm**: v9.0.0 o superior.

---

## 🛠️ Instalación y Desarrollo Local

1. Clonar el repositorio e instalar dependencias:
   ```bash
   git clone https://github.com/tu-usuario/molihorario.git
   cd molihorario
   npm install
   ```

2. Iniciar el servidor de desarrollo local:
   ```bash
   npm run dev
   ```
   Abre tu navegador en `http://localhost:3000`.

---

## 📜 Comandos Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor local de desarrollo con Vite |
| `npm run build` | Compila la aplicación frontend para producción |
| `npm run preview` | Previsualiza el bundle de producción localmente |
| `npm run test` | Ejecuta la suite de pruebas unitarias e integración con Vitest |
| `npm run typecheck` | Comprueba que no existan errores de tipos en TypeScript |
| `npm run lint` | Ejecuta las verificaciones de código |
| `npm run check` | Ejecuta verificación completa (`typecheck`, `test`, `build`) |
| `npm run scrape` | Ejecuta manualmente el scraper Puppeteer |
| `npm run scrape:debug` | Ejecuta el scraper en modo depuración con registros detallados |
| `npm run validate:data` | Valida la integridad del archivo `public/data/cursos.json` |

---

## 🔄 Actualización Manual de la Oferta Académica (Scraper)

> [!NOTE]
> **Sin GitHub Actions ni Cron Jobs**: El scraping y la actualización de los datos se realizan de manera 100% manual por el administrador del proyecto desde su computadora.

### Pasos para actualizar los cursos:

1. **Ejecutar el scraper**:
   ```bash
   npm run scrape
   ```
   *Para actualizar a un periodo específico:*
   ```bash
   ACADEMIC_PERIOD=2026-II npm run scrape
   ```

2. **Validar los datos generados**:
   ```bash
   npm run validate:data
   ```

3. **Revisar los cambios en Git**:
   ```bash
   git status
   git diff public/data/
   ```

4. **Subir los cambios al repositorio**:
   ```bash
   git add public/data/
   git commit -m "data: update UNALM bulletin courses for period 2026-II"
   git push origin main
   ```

5. **Despliegue automático**: Cloudflare Pages detectará el nuevo commit y desplegará la actualización automáticamente.

---

## 🌐 Despliegue en Cloudflare Pages

1. Inicia sesión en la consola de [Cloudflare Dashboard](https://dash.cloudflare.com).
2. Ve a **Workers & Pages > Create > Pages > Connect to Git**.
3. Selecciona tu repositorio `molihorario`.
4. Configura los parámetros de build:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Haz clic en **Save and Deploy**.

---

## 🔒 Variables de Entorno (Cloudflare Pages & Turnstile)

Crea y configura las siguientes variables en **Settings > Environment variables** en Cloudflare Pages:

```env
# Clave pública de Turnstile (expuesta al frontend)
VITE_TURNSTILE_SITE_KEY=tu_turnstile_site_key_publica

# Clave secreta de Turnstile (privada en Pages Functions)
TURNSTILE_SECRET_KEY=tu_turnstile_secret_key_privada

# URL del webhook desplegado en Google Apps Script
APPS_SCRIPT_API_URL=https://script.google.com/macros/s/AKfycbx_TU_ID/exec

# Clave secreta compartida con Google Apps Script
APPS_SCRIPT_SHARED_SECRET=moli_secret_compartido_seguro
```

---

## 📊 Configuración de Google Sheets & Google Apps Script (Reseñas)

Revisa la guía detallada paso a paso en [`/apps-script/README.md`](file:///apps-script/README.md).

### Resumen rápido:
1. Crea un Google Sheet llamado `MoliHorario_DB`.
2. Crea los encabezados requeridos en la pestaña `Reviews`:
   `id`, `professor_key`, `professor_name`, `course_code`, `course_name`, `period`, `rating`, `tags`, `comment`, `created_at`, `status`, `moderation_notes`, `fingerprint_hash`, `report_count`.
3. Copia el código de `apps-script/Code.gs` en **Extensiones > Apps Script**.
4. Configura las Script Properties: `SPREADSHEET_ID` y `SHARED_SECRET`.
5. Despliega como **Aplicación Web** abierta a todo público.
6. Modera las reseñas cambiando la columna `status` a `approved` o `rejected`.

---

## 🖼️ Sustitución de los Códigos QR (Yape y Plin)

Para personalizar los códigos QR de apoyo voluntario:
1. Reemplaza los archivos de imagen en:
   - `/public/images/yape-placeholder.png`
   - `/public/images/plin-placeholder.png`
2. Asegúrate de mantener la resolución recomendada (300x300px o superior) en formato PNG.

---

## ⚖️ Aviso Legal

Esta aplicación es una **herramienta independiente y no oficial**. No posee afiliación oficial ni institucional con la Universidad Nacional Agraria La Molina (UNALM). Todos los datos expuestos provienen de la información pública disponible en el Boletín Académico de MAIPI.

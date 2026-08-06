# Configuración de Google Sheets & Google Apps Script - MoliHorario

Este módulo gestiona la base de datos privada de reseñas de docentes en Google Sheets y el script de backend en Google Apps Script.

---

## 1. Creación de la Hoja de Cálculo

1. Crea una nueva hoja en [Google Sheets](https://sheets.google.com).
2. Nombra el documento: `MoliHorario_DB`.
3. Renombra la primera pestaña como: `Reviews`.
4. Agrega los siguientes encabezados en la **Fila 1**:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| id | professor_key | professor_name | course_code | course_name | period | rating | tags | comment | created_at | status | moderation_notes | fingerprint_hash | report_count |

5. **Configuración Visual**:
   - Inmoviliza la primera fila (**Ver > Inmovilizar > 1 fila**).
   - Activa el filtro en la primera fila (**Datos > Crear un filtro**).
   - Agrega **Validación de Datos** en la columna K (`status`) para permitir únicamente las opciones: `pending`, `approved`, `rejected`.
   - Agrega **Formato Condicional** en la columna `status`:
     - `approved` → Fondo verde claro.
     - `pending` → Fondo amarillo claro.
     - `rejected` → Fondo rojo claro.

---

## 2. Hoja de Estadísticas (`Stats`)

Crea una segunda pestaña llamada `Stats` para ver resúmenes en tiempo real con estas fórmulas:

- **Reseñas Pendientes**: `=CONTAR.SI(Reviews!K:K, "pending")`
- **Reseñas Aprobadas**: `=CONTAR.SI(Reviews!K:K, "approved")`
- **Reseñas Rechazadas**: `=CONTAR.SI(Reviews!K:K, "rejected")`
- **Promedio General**: `=PROMEDIO(Reviews!G:G)`

---

## 3. Despliegue de Apps Script

1. En tu Google Sheet, ve a **Extensiones > Apps Script**.
2. Pega el contenido de `apps-script/Code.gs` y reemplaza `appsscript.json`.
3. Configura las Propiedades del Script (**Configuración del proyecto > Propiedades del script**):
   - `SPREADSHEET_ID` → ID de tu Google Sheet (extraído de la URL).
   - `SHARED_SECRET` → Una clave secreta aleatoria (ej: `moli_sec_9847239487293847`).
4. Haz clic en **Desplegar > Nuevo despliegue**:
   - Tipo: **Aplicación web**.
   - Ejecutar como: **Yo**.
   - Quién tiene acceso: **Cualquier persona (incluso anónima)**.
5. Copia la URL del despliegue (ej. `https://script.google.com/macros/s/.../exec`).

---

## 4. Moderación Manual de Reseñas

1. Cuando un estudiante envía una reseña, entra automáticamente con estado `pending`.
2. Como moderador, abre tu Google Sheet `MoliHorario_DB`.
3. Filtra la columna `status` por `pending`.
4. Revisa que el comentario cumpla las reglas de comunidad.
5. Cambia el estado a `approved` para hacerla visible en la aplicación web, o a `rejected` para descartarla.

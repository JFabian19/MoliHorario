import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Palette, Type, Check, Sparkles, Copy, Layout, Eye, RefreshCw } from 'lucide-react';
import { SavedSchedule, SelectedSection } from '../../types/academic';
import { APP_CONFIG } from '../../config/appConfig';

interface ExportConfigModalProps {
  schedule: SavedSchedule | null;
  lastUpdateDateStr?: string;
  onClose: () => void;
}

export interface ExportFontOption {
  id: string;
  name: string;
  fontFamily: string;
  previewClass: string;
  tag: string;
}

export interface ExportThemeOption {
  id: string;
  name: string;
  headerBg: string;
  headerText: string;
  accentColor: string;
  canvasBg: string;
  gridLineColor: string;
  textColor: string;
}

const FONT_OPTIONS: ExportFontOption[] = [
  { id: 'poppins', name: 'Poppins', fontFamily: "'Poppins', sans-serif", previewClass: 'font-sans font-bold', tag: 'Aesthetic ⭐' },
  { id: 'outfit', name: 'Outfit', fontFamily: "'Outfit', sans-serif", previewClass: 'font-sans font-bold', tag: 'Trendy 🌸' },
  { id: 'caveat', name: 'Caveat', fontFamily: "'Caveat', cursive", previewClass: 'font-cursive text-lg font-bold', tag: 'Coquette 💕' },
  { id: 'comfortaa', name: 'Comfortaa', fontFamily: "'Comfortaa', cursive", previewClass: 'font-sans font-bold', tag: 'Dulce ✨' },
  { id: 'playfair', name: 'Playfair', fontFamily: "'Playfair Display', serif", previewClass: 'font-serif font-bold', tag: 'Elegante 📖' },
  { id: 'inter', name: 'Inter', fontFamily: "'Inter', sans-serif", previewClass: 'font-sans font-bold', tag: 'Limpio 🌿' },
  { id: 'firacode', name: 'Fira Code', fontFamily: "'Fira Code', monospace", previewClass: 'font-mono font-bold', tag: 'Tech 💻' },
];

const THEME_OPTIONS: ExportThemeOption[] = [
  {
    id: 'molinero',
    name: 'Molinero Verde & Dorado',
    headerBg: '#005B41',
    headerText: '#FFFFFF',
    accentColor: '#EAB308',
    canvasBg: '#FFFFFF',
    gridLineColor: '#E2E8F0',
    textColor: '#1E293B',
  },
  {
    id: 'pastel',
    name: 'Pastel Cute Aesthetic',
    headerBg: '#F472B6',
    headerText: '#FFFFFF',
    accentColor: '#FDE047',
    canvasBg: '#FFF9FB',
    gridLineColor: '#FCE7F3',
    textColor: '#831843',
  },
  {
    id: 'cyberdark',
    name: 'Cyber Dark Midnight',
    headerBg: '#0F172A',
    headerText: '#38BDF8',
    accentColor: '#A855F7',
    canvasBg: '#090D16',
    gridLineColor: '#1E293B',
    textColor: '#F8FAFC',
  },
  {
    id: 'rosegold',
    name: 'Rose Gold & Warm',
    headerBg: '#991B1B',
    headerText: '#FEF2F2',
    accentColor: '#F59E0B',
    canvasBg: '#FFFBEB',
    gridLineColor: '#FDE68A',
    textColor: '#78350F',
  },
  {
    id: 'minimal',
    name: 'Minimal Slate',
    headerBg: '#334155',
    headerText: '#F8FAFC',
    accentColor: '#38BDF8',
    canvasBg: '#FFFFFF',
    gridLineColor: '#CBD5E1',
    textColor: '#0F172A',
  },
];

const PALETTE_COLORS = [
  '#004D34', '#0284C7', '#7C3AED', '#DB2777', '#EA580C',
  '#059669', '#4F46E5', '#C026D3', '#D97706', '#2563EB',
  '#10B981', '#F43F5E', '#8B5CF6', '#06B6D4', '#64748B'
];

export const ExportConfigModal: React.FC<ExportConfigModalProps> = ({
  schedule,
  lastUpdateDateStr = 'Agosto 2026',
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedFont, setSelectedFont] = useState<ExportFontOption>(FONT_OPTIONS[0]); // Poppins default
  const [selectedTheme, setSelectedTheme] = useState<ExportThemeOption>(THEME_OPTIONS[0]);
  const [courseColors, setCourseColors] = useState<Record<string, string>>({});
  
  // Customization Toggles
  const [showTeachers, setShowTeachers] = useState<boolean>(true);
  const [showClassrooms, setShowClassrooms] = useState<boolean>(true);
  const [showCredits, setShowCredits] = useState<boolean>(true);

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Initialize course colors
  useEffect(() => {
    if (schedule && schedule.selectedSections) {
      const colorMap: Record<string, string> = {};
      schedule.selectedSections.forEach((sec, idx) => {
        colorMap[sec.courseCode] = sec.color || PALETTE_COLORS[idx % PALETTE_COLORS.length];
      });
      setCourseColors(colorMap);
    }
  }, [schedule]);

  // Render canvas whenever configuration changes
  useEffect(() => {
    drawCanvas();
  }, [selectedFont, selectedTheme, courseColors, showTeachers, showClassrooms, showCredits, schedule]);

  const drawCanvas = () => {
    if (!canvasRef.current || !schedule) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1600;
    const height = 1100;
    canvas.width = width;
    canvas.height = height;

    const fontFamily = selectedFont.fontFamily;

    // 1. Background
    ctx.fillStyle = selectedTheme.canvasBg;
    ctx.fillRect(0, 0, width, height);

    // 2. Header Banner
    ctx.fillStyle = selectedTheme.headerBg;
    ctx.fillRect(0, 0, width, 115);

    // Title
    ctx.fillStyle = selectedTheme.headerText;
    ctx.font = `bold 36px ${fontFamily}`;
    ctx.fillText(`${APP_CONFIG.appName} — ${schedule.name}`, 40, 54);

    // Subtitle
    ctx.fillStyle = selectedTheme.accentColor;
    ctx.font = `600 20px ${fontFamily}`;
    const totalCredits = schedule.selectedSections.reduce((sum, s) => sum + (s.credits || 0), 0);
    const creditText = showCredits ? ` | ${totalCredits} Créditos` : '';
    ctx.fillText(`Periodo Académico: ${schedule.period}${creditText}`, 40, 90);

    // Right Tag
    ctx.fillStyle = selectedTheme.headerText;
    ctx.font = `15px ${fontFamily}`;
    ctx.textAlign = 'right';
    ctx.fillText(`${APP_CONFIG.unofficialTag} | Actualizado: ${lastUpdateDateStr}`, width - 40, 68);
    ctx.textAlign = 'left';

    // 3. Grid Setup
    const gridLeft = 120;
    const gridTop = 165;
    const gridRight = width - 40;
    const gridBottom = height - 80;

    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const hasSunday = schedule.selectedSections.some(s => s.sessions.some(sess => sess.day === 7));
    if (hasSunday) days.push('Domingo');

    const colWidth = (gridRight - gridLeft) / days.length;
    const startHour = 7;
    const endHour = 22;
    const totalHours = endHour - startHour;
    const rowHeight = (gridBottom - gridTop) / totalHours;

    // Header Days Bar
    ctx.fillStyle = selectedTheme.headerBg;
    ctx.globalAlpha = 0.08;
    ctx.fillRect(gridLeft, gridTop - 40, gridRight - gridLeft, 40);
    ctx.globalAlpha = 1.0;

    ctx.strokeStyle = selectedTheme.gridLineColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(gridLeft, gridTop - 40, gridRight - gridLeft, 40);

    days.forEach((dayName, idx) => {
      const x = gridLeft + idx * colWidth;
      ctx.fillStyle = selectedTheme.textColor;
      ctx.font = `bold 18px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.fillText(dayName, x + colWidth / 2, gridTop - 14);
    });
    ctx.textAlign = 'left';

    // Hour Rows
    for (let h = startHour; h <= endHour; h++) {
      const y = gridTop + (h - startHour) * rowHeight;
      
      ctx.fillStyle = selectedTheme.textColor;
      ctx.globalAlpha = 0.7;
      ctx.font = `500 15px ${fontFamily}`;
      ctx.textAlign = 'right';
      ctx.fillText(`${String(h).padStart(2, '0')}:00`, gridLeft - 15, y + 5);
      ctx.globalAlpha = 1.0;

      ctx.beginPath();
      ctx.strokeStyle = selectedTheme.gridLineColor;
      ctx.moveTo(gridLeft, y);
      ctx.lineTo(gridRight, y);
      ctx.stroke();
    }
    ctx.textAlign = 'left';

    // Vertical Lines
    for (let d = 0; d <= days.length; d++) {
      const x = gridLeft + d * colWidth;
      ctx.beginPath();
      ctx.strokeStyle = selectedTheme.gridLineColor;
      ctx.moveTo(x, gridTop - 40);
      ctx.lineTo(x, gridBottom);
      ctx.stroke();
    }

    // 4. Session Blocks
    schedule.selectedSections.forEach(sec => {
      const color = courseColors[sec.courseCode] || sec.color || '#0284C7';

      sec.sessions.forEach(sess => {
        if (sess.day < 1 || sess.day > days.length) return;

        const dayIdx = sess.day - 1;
        const [startH, startM] = sess.start.split(':').map(Number);
        const [endH, endM] = sess.end.split(':').map(Number);

        const startMinRel = (startH - startHour) * 60 + startM;
        const endMinRel = (endH - startHour) * 60 + endM;

        const blockX = gridLeft + dayIdx * colWidth + 3;
        const blockWidth = colWidth - 6;
        const blockY = gridTop + (startMinRel / 60) * rowHeight + 2;
        const blockHeight = ((endMinRel - startMinRel) / 60) * rowHeight - 4;

        // Block Background
        ctx.fillStyle = color;
        ctx.fillRect(blockX, blockY, blockWidth, blockHeight);

        // Border Accent
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(blockX, blockY, blockWidth, blockHeight);

        // Block Content
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold 14px ${fontFamily}`;
        ctx.fillText(`${sec.courseCode} - Sec ${sec.sectionName}`, blockX + 8, blockY + 20);

        ctx.font = `bold 13px ${fontFamily}`;
        ctx.fillText(sec.courseName.slice(0, 28), blockX + 8, blockY + 38);

        let details = `[${sess.type === 'TEORIA' ? 'TEORÍA' : sess.type === 'PRACTICA' ? 'PRÁCTICA' : sess.type}] ${sess.start}-${sess.end}`;
        if (showTeachers && sec.teacher) details += ` | ${sec.teacher.name.slice(0, 18)}`;
        if (showClassrooms && sess.classroom) details += ` (${sess.classroom})`;

        ctx.font = `500 11.5px ${fontFamily}`;
        ctx.globalAlpha = 0.95;
        ctx.fillText(details.slice(0, 48), blockX + 8, blockY + 54);
        ctx.globalAlpha = 1.0;
      });
    });

    // 5. Footer Watermark
    ctx.fillStyle = selectedTheme.headerBg;
    ctx.globalAlpha = 0.05;
    ctx.fillRect(0, height - 45, width, 45);
    ctx.globalAlpha = 1.0;

    ctx.fillStyle = selectedTheme.textColor;
    ctx.globalAlpha = 0.7;
    ctx.font = `13px ${fontFamily}`;
    ctx.fillText(`✨ Horario personalizado con MoliHorario (${APP_CONFIG.unofficialTag}) - UNALM`, 40, height - 18);
    ctx.globalAlpha = 1.0;
  };

  const handleDownloadPng = () => {
    if (!canvasRef.current || !schedule) return;
    setIsExporting(true);

    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `Horario_UNALM_${schedule.name.replace(/\s+/g, '_')}_${selectedFont.id}_${selectedTheme.id}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      setIsExporting(false);
      onClose();
    }, 200);
  };

  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (blob && navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2500);
        } else {
          alert("Tu navegador no soporta copiar imágenes directamente. Descárgala con el botón 'Descargar PNG'.");
        }
      });
    } catch (e) {
      console.error("Copy image error:", e);
      alert("No se pudo copiar la imagen al portapapeles.");
    }
  };

  const handleCourseColorChange = (courseCode: string, color: string) => {
    setCourseColors(prev => ({ ...prev, [courseCode]: color }));
  };

  if (!schedule) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-3xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl relative max-h-[95vh] flex flex-col overflow-hidden animate-slide-up border border-slate-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Personalizar Exportación de Horario
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Configura la tipografía, paleta de colores y estilo visual antes de descargar.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Content: Split 2 Columns (Controls Left, Live Preview Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-4 overflow-y-auto flex-grow pr-1 custom-scrollbar">
          
          {/* Left Column: Controls & Styling Settings */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* 1. Typography Font Selector */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-purple-600" />
                  <span>Tipografía & Estilo</span>
                </span>
                <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                  {selectedFont.tag}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FONT_OPTIONS.map(font => (
                  <button
                    key={font.id}
                    onClick={() => setSelectedFont(font)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      selectedFont.id === font.id
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md scale-105'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    <span className={`block text-sm ${font.previewClass}`}>{font.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Color Theme Preset Selector */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-pink-600" />
                <span>Tema & Paleta General</span>
              </span>

              <div className="space-y-2">
                {THEME_OPTIONS.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme)}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                      selectedTheme.id === theme.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-purple-500/50'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold">{theme.name}</span>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-4 h-4 rounded-full border border-white/40 shadow-xs" style={{ backgroundColor: theme.headerBg }} />
                      <div className="w-4 h-4 rounded-full border border-white/40 shadow-xs" style={{ backgroundColor: theme.accentColor }} />
                      <div className="w-4 h-4 rounded-full border border-white/40 shadow-xs" style={{ backgroundColor: theme.canvasBg }} />
                      {selectedTheme.id === theme.id && <Check className="w-4 h-4 text-emerald-400 ml-1" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Per-Course Color Customizer */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layout className="w-4 h-4 text-indigo-600" />
                <span>Colores por Curso</span>
              </span>

              <div className="space-y-2 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                {schedule.selectedSections.map(sec => (
                  <div key={sec.courseCode} className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-900 truncate max-w-[170px]">
                      {sec.courseCode} ({sec.courseName})
                    </span>

                    <div className="flex items-center space-x-1">
                      {PALETTE_COLORS.slice(0, 7).map(c => (
                        <button
                          key={c}
                          onClick={() => handleCourseColorChange(sec.courseCode, c)}
                          style={{ backgroundColor: c }}
                          className={`w-4 h-4 rounded-full transition-transform ${
                            (courseColors[sec.courseCode] || sec.color) === c ? 'scale-125 ring-2 ring-slate-900 shadow-xs' : 'hover:scale-110 opacity-80'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Display Toggles */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-700">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTeachers}
                  onChange={e => setShowTeachers(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                <span>Mostrar Docentes</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showClassrooms}
                  onChange={e => setShowClassrooms(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                <span>Mostrar Aulas</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCredits}
                  onChange={e => setShowCredits(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                <span>Mostrar Créditos</span>
              </label>
            </div>

          </div>

          {/* Right Column: Live Interactive Canvas Preview */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1.5 text-slate-800">
                <Eye className="w-4 h-4 text-emerald-600" />
                <span>Vista Previa en Tiempo Real</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">1600 x 1100 px</span>
            </div>

            {/* Canvas Container with Border Shimmer */}
            <div className="relative bg-slate-900 rounded-2xl p-2 border border-slate-800 shadow-xl overflow-hidden flex items-center justify-center flex-grow min-h-[360px]">
              <canvas
                ref={canvasRef}
                className="w-full h-auto rounded-xl max-h-[500px] object-contain shadow-2xl"
              />
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-4 flex-shrink-0">
          <button
            onClick={handleCopyImage}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-extrabold text-xs transition-colors flex items-center justify-center space-x-2"
          >
            {copySuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600">¡Imagen Copiada!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copiar Imagen</span>
              </>
            )}
          </button>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors"
            >
              Cancelar
            </button>

            <button
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-95 flex items-center justify-center space-x-2 border border-emerald-400/30"
            >
              {isExporting ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Download className="w-4 h-4 text-emerald-200" />
              )}
              <span>Descargar Imagen PNG</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

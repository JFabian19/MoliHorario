import { SavedSchedule, SelectedSection } from '../types/academic';
import { APP_CONFIG } from '../config/appConfig';

export class PngExporter {
  static async exportToPng(
    schedule: SavedSchedule,
    lastUpdateDateStr: string = 'Agosto 2026'
  ): Promise<boolean> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;

      // High-resolution canvas dimensions
      const width = 1600;
      const height = 1100;
      canvas.width = width;
      canvas.height = height;

      // 1. Background Fill
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // 2. Header Banner (Molinero Forest Green)
      ctx.fillStyle = '#005B41';
      ctx.fillRect(0, 0, width, 110);

      // Header Text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(`${APP_CONFIG.appName} - ${schedule.name}`, 40, 52);

      ctx.fillStyle = '#EAB308'; // Gold accent
      ctx.font = '600 20px sans-serif';
      ctx.fillText(`Periodo Académico: ${schedule.period}`, 40, 88);

      ctx.fillStyle = '#E2E8F0';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${APP_CONFIG.unofficialTag} | Actualizado: ${lastUpdateDateStr}`, width - 40, 68);
      ctx.textAlign = 'left'; // Reset alignment

      // 3. Grid Dimensions
      const gridLeft = 120;
      const gridTop = 160;
      const gridRight = width - 40;
      const gridBottom = height - 100;

      const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const hasSunday = schedule.selectedSections.some(s => s.sessions.some(sess => sess.day === 7));
      if (hasSunday) days.push('Domingo');

      const colWidth = (gridRight - gridLeft) / days.length;
      const startHour = 7;
      const endHour = 22;
      const totalHours = endHour - startHour;
      const rowHeight = (gridBottom - gridTop) / totalHours;

      // Draw Day Column Headers
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(gridLeft, gridTop - 40, gridRight - gridLeft, 40);
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1;
      ctx.strokeRect(gridLeft, gridTop - 40, gridRight - gridLeft, 40);

      days.forEach((dayName, idx) => {
        const x = gridLeft + idx * colWidth;
        ctx.fillStyle = '#1E293B';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(dayName, x + colWidth / 2, gridTop - 14);
      });
      ctx.textAlign = 'left';

      // Draw Hour Rows & Grid Lines
      for (let h = startHour; h <= endHour; h++) {
        const y = gridTop + (h - startHour) * rowHeight;
        
        // Hour label
        ctx.fillStyle = '#64748B';
        ctx.font = '500 15px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${String(h).padStart(2, '0')}:00`, gridLeft - 15, y + 5);

        // Horizontal grid line
        ctx.beginPath();
        ctx.strokeStyle = h === startHour || h === endHour ? '#94A3B8' : '#E2E8F0';
        ctx.moveTo(gridLeft, y);
        ctx.lineTo(gridRight, y);
        ctx.stroke();
      }
      ctx.textAlign = 'left';

      // Vertical Column Lines
      for (let d = 0; d <= days.length; d++) {
        const x = gridLeft + d * colWidth;
        ctx.beginPath();
        ctx.strokeStyle = '#CBD5E1';
        ctx.moveTo(x, gridTop - 40);
        ctx.lineTo(x, gridBottom);
        ctx.stroke();
      }

      // 4. Draw Course Session Blocks
      schedule.selectedSections.forEach(sec => {
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

          // Block Fill
          ctx.fillStyle = sec.color || '#0B4F6C';
          ctx.fillRect(blockX, blockY, blockWidth, blockHeight);

          // Border
          ctx.strokeStyle = 'rgba(0,0,0,0.2)';
          ctx.lineWidth = 1;
          ctx.strokeRect(blockX, blockY, blockWidth, blockHeight);

          // Block Text Content
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 15px sans-serif';
          ctx.fillText(`${sec.courseCode} - Sec ${sec.sectionName}`, blockX + 8, blockY + 22);

          ctx.font = '500 13px sans-serif';
          ctx.fillText(sec.courseName.slice(0, 26), blockX + 8, blockY + 40);

          let details = `[${sess.type}] ${sess.start}-${sess.end}`;
          if (sec.teacher) details += ` | ${sec.teacher.name.slice(0, 20)}`;
          if (sess.classroom) details += ` (${sess.classroom})`;

          ctx.font = '400 12px sans-serif';
          ctx.fillText(details.slice(0, 42), blockX + 8, blockY + 58);
        });
      });

      // 5. Footer Watermark & Color Legend
      ctx.fillStyle = '#F1F5F9';
      ctx.fillRect(0, height - 50, width, 50);

      ctx.fillStyle = '#475569';
      ctx.font = '14px sans-serif';
      ctx.fillText(`Generado por ${APP_CONFIG.appName} (${APP_CONFIG.unofficialTag}) - Verifica la información oficial en MAIPI antes de matricularte.`, 40, height - 20);

      // Trigger automatic PNG download
      const dataUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `Horario_UNALM_${schedule.name.replace(/\s+/g, '_')}_${schedule.period}.png`;
      downloadLink.href = dataUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      return true;
    } catch (e) {
      console.error("Failed to generate PNG schedule image:", e);
      return false;
    }
  }
}

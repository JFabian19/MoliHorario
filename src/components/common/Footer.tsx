import React from 'react';
import { APP_CONFIG } from '../../config/appConfig';
import { MetadataJsonDataset } from '../../types/academic';

interface FooterProps {
  metadata: MetadataJsonDataset | null;
}

export const Footer: React.FC<FooterProps> = ({ metadata }) => {
  const formattedDate = metadata?.generatedAt
    ? new Date(metadata.generatedAt).toLocaleString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Agosto 2026';

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
          <p className="font-medium text-slate-300">
            {APP_CONFIG.appName} — {APP_CONFIG.unofficialTag}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span>Periodo: <strong className="text-gold-400">{metadata?.period || APP_CONFIG.academicPeriodDefault}</strong></span>
            <span>•</span>
            <span>Última extracción: <strong className="text-slate-300">{formattedDate}</strong></span>
            <span>•</span>
            <span>Cursos: <strong className="text-slate-300">{metadata?.courseCount || 0}</strong></span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center pt-2 border-t border-slate-800/60 text-slate-500 text-[11px]">
          <p>{APP_CONFIG.noticeText}</p>
          <p className="font-semibold text-slate-400 shrink-0">Hecho por Thymus Solutions</p>
        </div>
      </div>
    </footer>
  );
};

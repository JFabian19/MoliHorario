import React from 'react';
import { Calendar, HelpCircle, Save, Download, Heart, Bell, Award } from 'lucide-react';
import { APP_CONFIG } from '../../config/appConfig';
import { SavedSchedule } from '../../types/academic';

interface HeaderProps {
  period: string;
  lastUpdated: string;
  activeSchedule: SavedSchedule | null;
  onOpenHelp: () => void;
  onOpenGenerator: () => void;
  onOpenScheduleManager: () => void;
  onOpenReviews: () => void;
  onExportPng: () => void;
  onShareLink: () => void;
  onOpenSupportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  period,
  lastUpdated,
  activeSchedule,
  onOpenHelp,
  onOpenScheduleManager,
  onExportPng,
  onOpenSupportModal
}) => {
  const formattedDate = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    : '08:30';

  const totalCredits = activeSchedule
    ? activeSchedule.selectedSections.reduce((acc, sec) => acc + (sec.credits || 0), 0)
    : 0;

  return (
    <header className="bg-white text-slate-900 shadow-sm border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg sm:text-2xl tracking-tighter text-[#004D34] italic font-sans">
                MOLIHORARIO
              </span>
            </div>

            <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-500 font-medium pl-3 border-l border-slate-200">
              <span>{APP_CONFIG.subTitle}</span>
              <span>•</span>
              <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                {period}
              </span>
              <span>•</span>
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                {APP_CONFIG.unofficialTag}
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">

            {/* Status & Update timestamp */}
            <div className="hidden md:flex items-center space-x-2 text-xs text-slate-500">
              <span className="bg-emerald-50 text-emerald-800 font-extrabold px-2 py-0.5 rounded border border-emerald-200">
                {period}
              </span>
              <span>Actualizado: Hoy {formattedDate}</span>
            </div>

            {/* Notification / Help bell */}
            <button
              onClick={onOpenHelp}
              className="text-slate-500 hover:text-slate-900 p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 transition-colors"
              title="Ayuda"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* Support Heart */}
            <button
              onClick={onOpenSupportModal}
              className="text-pink-600 hover:bg-pink-50 p-1.5 sm:p-2 rounded-lg transition-colors border border-pink-200 hidden sm:block"
              title="Apoyar (Yape)"
            >
              <Heart className="w-4 h-4 fill-pink-500" />
            </button>

            {/* Mis Horarios */}
            <button
              onClick={onOpenScheduleManager}
              className="bg-emerald-50 hover:bg-emerald-100/80 text-[#004D34] font-bold px-2.5 py-1.5 rounded-lg text-xs sm:text-sm border border-emerald-200 transition-colors flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{activeSchedule ? activeSchedule.name : 'Mis Horarios'}</span>
              <span className="sm:hidden">Horarios</span>
            </button>

            {/* Exportar Button (Prominent & Accessible) */}
            <button
              onClick={onExportPng}
              className="bg-[#004D34] hover:bg-[#003825] text-white font-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center space-x-1.5 ring-2 ring-[#004D34]/20 active:scale-95 cursor-pointer"
              title="Descargar imagen PNG de tu horario"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              <span>Exportar PNG</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};

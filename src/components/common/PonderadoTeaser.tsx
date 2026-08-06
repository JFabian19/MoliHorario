import React from 'react';
import { Calculator, Sparkles, Construction, TrendingUp, GraduationCap, Lock, Award, CheckCircle2 } from 'lucide-react';

export const PonderadoTeaser: React.FC = () => {
  return (
    <section className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 my-8">
      <div className="relative rounded-3xl bg-slate-950/90 border border-emerald-500/30 p-6 sm:p-10 shadow-2xl overflow-hidden group">
        
        {/* Background Decorative Grid & Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-emerald-500/15 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-teal-500/15 blur-[100px] rounded-full pointer-events-none" />

        {/* Blurred Math & Grade Formulas background preview */}
        <div className="absolute inset-0 flex items-center justify-around opacity-20 pointer-events-none select-none blur-[3px] scale-105 transition-transform duration-700 group-hover:scale-110">
          <div className="text-left font-mono text-xs sm:text-sm text-emerald-400 space-y-2 hidden sm:block">
            <p className="bg-slate-900/80 p-2 rounded border border-emerald-500/30">Ponderado = ∑(Nota × Créditos) / ∑Créditos</p>
            <p className="bg-slate-900/80 p-2 rounded border border-emerald-500/30">EP3001 (Química): 16 × 4.0 = 64.0</p>
            <p className="bg-slate-900/80 p-2 rounded border border-emerald-500/30">CC2004 (Cálculo I): 15 × 5.0 = 75.0</p>
          </div>
          <div className="text-right font-mono text-xs sm:text-sm text-teal-300 space-y-2">
            <p className="bg-slate-900/80 p-2 rounded border border-teal-500/30">Promedio Acumulado: 14.85</p>
            <p className="bg-slate-900/80 p-2 rounded border border-teal-500/30">Escala UNALM: 0 a 20 (Aprobado ≥ 10.5)</p>
            <p className="bg-slate-900/80 p-2 rounded border border-teal-500/30">Simulación de notas necesarias para el 15.0</p>
          </div>
        </div>

        {/* Main Content Container with glassmorphic overlay */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-800/90 shadow-xl">
          
          {/* Left Column: Icon & Titles */}
          <div className="space-y-4 text-center md:text-left max-w-2xl">
            
            {/* Status Tag */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 px-3.5 py-1 rounded-full text-emerald-400 text-xs font-black uppercase tracking-wider shadow-inner">
              <Construction className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>En Desarrollo • Próximamente</span>
            </div>

            {/* Main Title */}
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight flex flex-col sm:flex-row items-center sm:items-baseline gap-2">
                <span>Medidor de Ponderado</span>
                <span className="text-xs sm:text-sm font-extrabold px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl">
                  Hecho para la UNALM 🏫
                </span>
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Calcula tu promedio ponderado semestral y acumulado en segundos. Proyecta las notas que necesitas para mantener tu tercio o quinto superior en Molinero.
              </p>
            </div>

            {/* Feature Highlights Pills */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2 text-[11px] font-semibold text-slate-300">
              <div className="flex items-center space-x-1.5 bg-slate-800/90 border border-slate-700 px-3 py-1 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cálculo automático con syllabus UNALM</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-800/90 border border-slate-700 px-3 py-1 rounded-lg">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simulador de Nota Mínima</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-800/90 border border-slate-700 px-3 py-1 rounded-lg">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Histórico por Semestres</span>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Teaser Widget */}
          <div className="shrink-0 relative w-full md:w-auto flex justify-center">
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-emerald-500/40 rounded-2xl p-5 w-64 shadow-2xl text-center overflow-hidden">
              
              {/* Blurred internal preview mock */}
              <div className="space-y-3 opacity-40 blur-[1.5px] pointer-events-none">
                <div className="flex items-center justify-between text-xs text-slate-300 border-b border-slate-700 pb-2">
                  <span className="font-bold">Promedio Actual</span>
                  <span className="font-mono font-extrabold text-emerald-400">15.42</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="w-[77%] h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Meta: 16.00</span>
                  <span>Tercio Superior</span>
                </div>
              </div>

              {/* Foreground Lock & Construction Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4">
                <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-400/50 rounded-2xl flex items-center justify-center text-emerald-400 mb-2 shadow-lg animate-bounce">
                  <Calculator className="w-6 h-6" />
                </div>
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  ¡Muy Pronto!
                </span>
                <span className="text-[10px] text-emerald-300 font-semibold mt-0.5">
                  Falta muy poco 🚀
                </span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

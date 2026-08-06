import React from 'react';
import { Trophy, Flame, Star, Sparkles, Heart, Crown, Award, ShieldCheck } from 'lucide-react';

interface LeaderboardProps {
  onOpenSupportModal?: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onOpenSupportModal }) => {
  return (
    <section className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 mb-8 mt-4">
      <div className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-amber-500/20 overflow-hidden">
        
        {/* Background decorative glowing lights */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/40 px-4 py-1.5 rounded-full text-amber-300 text-xs sm:text-sm font-extrabold uppercase tracking-widest shadow-inner mb-3">
            <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>Tabla de Honor</span>
            <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
          </div>
          
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400">
            Top Donadores
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-2">
            Agradecemos a los estudiantes y la comunidad que apoyan el mantenimiento y servidores de MoliHorario.
          </p>
        </div>

        {/* Podium / Cards Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-end">
          
          {/* Rank 2 - Carolina */}
          <div className="order-2 md:order-1 bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700/80 hover:border-slate-500/50 transition-all transform hover:-translate-y-1 shadow-lg text-center relative group overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-400 to-slate-200" />
            
            <div className="w-12 h-12 bg-slate-700/80 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-slate-400/50 font-black text-lg shadow-inner">
              2
            </div>

            <div className="inline-flex items-center justify-center bg-slate-700/40 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-slate-300 mb-2">
              <Award className="w-3.5 h-3.5 mr-1 text-slate-300" />
              <span>Plata</span>
            </div>

            <h3 className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors">
              Carolina
            </h3>
            
            <p className="text-slate-400 text-xs mt-1 font-medium">
              Donadora Destacada
            </p>
          </div>

          {/* Rank 1 - Miguel Luciano Ramírez Magallanes (ULTRA DECORATED & ANIMATED) */}
          <div className="order-1 md:order-2 bg-gradient-to-b from-amber-950/60 via-slate-900 to-amber-950/80 backdrop-blur-xl rounded-3xl p-7 border-2 border-amber-400/80 shadow-[0_0_40px_rgba(245,158,11,0.25)] transform hover:-translate-y-2 transition-all relative overflow-hidden text-center group">
            
            {/* Animated background shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent animate-shimmer" />

            {/* Glowing top badge */}
            <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-widest px-4 py-1 rounded-b-xl shadow-lg flex items-center space-x-1 z-20">
              <Crown className="w-3.5 h-3.5 fill-slate-950" />
              <span>NÚMERO 1</span>
              <Crown className="w-3.5 h-3.5 fill-slate-950" />
            </div>

            {/* Floating stars & sparkles background icons */}
            <Star className="absolute top-4 left-4 w-4 h-4 text-amber-400/40 animate-spin-slow" />
            <Sparkles className="absolute top-6 right-6 w-5 h-5 text-amber-300 animate-pulse" />
            <Flame className="absolute bottom-4 left-4 w-5 h-5 text-orange-400/40 animate-flame-flicker" />
            <Sparkles className="absolute bottom-6 right-6 w-4 h-4 text-amber-400/40 animate-bounce" />

            {/* Top Crown & Rank Icon */}
            <div className="relative mt-3 mb-4 inline-block">
              <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(245,158,11,0.6)] border-4 border-amber-200 relative group-hover:scale-105 transition-transform">
                <Crown className="w-10 h-10 text-slate-950 fill-yellow-200" />
              </div>
              <div className="absolute -bottom-2 -right-1 bg-orange-600 text-white rounded-full p-1 shadow-md border border-amber-300">
                <Flame className="w-4 h-4 fill-amber-300 animate-flame-flicker" />
              </div>
            </div>

            {/* Flame Name Animation */}
            <div className="space-y-1 relative z-10">
              <div className="inline-flex items-center justify-center space-x-1 text-orange-400 text-xs font-black uppercase tracking-wider bg-orange-950/70 border border-orange-500/50 px-3 py-1 rounded-full shadow-inner mb-2 animate-pulse">
                <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-500 animate-flame-flicker" />
                <span className="text-amber-300">TOP DONADOR SUPREMO</span>
                <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-500 animate-flame-flicker" />
              </div>

              {/* Name with Flame/Fire Gradient & Animation */}
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-orange-400 animate-flame-glow leading-tight">
                Miguel Luciano Ramírez Magallanes
              </h3>

              {/* Donation Amount Badge */}
              <div className="pt-2">
                <div className="inline-block bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-sm sm:text-base px-4 py-1.5 rounded-2xl shadow-[0_4px_15px_rgba(245,158,11,0.4)] border border-amber-200">
                  ⚡ Donó S/. 100.00 ⚡
                </div>
              </div>
            </div>

            {/* Decorative Stars Banner */}
            <div className="flex items-center justify-center space-x-1.5 text-amber-400 mt-4 pt-3 border-t border-amber-500/20">
              <Star className="w-4 h-4 fill-amber-400 animate-pulse" />
              <Star className="w-4 h-4 fill-amber-400 animate-pulse delay-75" />
              <Star className="w-5 h-5 fill-amber-300 animate-bounce" />
              <Star className="w-4 h-4 fill-amber-400 animate-pulse delay-75" />
              <Star className="w-4 h-4 fill-amber-400 animate-pulse" />
            </div>
          </div>

          {/* Rank 3 - Julieta */}
          <div className="order-3 bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700/80 hover:border-slate-500/50 transition-all transform hover:-translate-y-1 shadow-lg text-center relative group overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-700 to-amber-600" />
            
            <div className="w-12 h-12 bg-slate-700/80 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-amber-700/50 font-black text-lg shadow-inner">
              3
            </div>

            <div className="inline-flex items-center justify-center bg-slate-700/40 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-amber-500 mb-2">
              <Award className="w-3.5 h-3.5 mr-1 text-amber-500" />
              <span>Bronce</span>
            </div>

            <h3 className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors">
              Julieta
            </h3>

            <p className="text-slate-400 text-xs mt-1 font-medium">
              Donadora Destacada
            </p>
          </div>

        </div>

        {/* Support CTA Footer */}
        {onOpenSupportModal && (
          <div className="relative z-10 mt-10 pt-6 border-t border-slate-800 text-center flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
            <div className="flex items-center space-x-3 text-left">
              <div className="w-10 h-10 bg-pink-500/10 border border-pink-500/30 rounded-xl flex items-center justify-center text-pink-400 shrink-0">
                <Heart className="w-5 h-5 fill-pink-500/20" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">¿Quieres aparecer en esta tabla de donadores?</p>
                <p className="text-xs text-slate-400">Apoya voluntariamente con cualquier monto vía Yape.</p>
              </div>
            </div>

            <button
              onClick={onOpenSupportModal}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-lg hover:shadow-purple-500/20 active:scale-95 flex items-center space-x-2 shrink-0 border border-purple-400/30"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>Donar y aparecer en el Top</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
};

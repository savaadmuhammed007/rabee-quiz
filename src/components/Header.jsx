import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

export default function Header({ currentView, onNavigateAdmin, onNavigateHome, isAdmin }) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100/80 shadow-xs transition-all pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand Logo & Title */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 sm:gap-3 text-left group transition-transform focus:outline-none min-w-0"
          title="Go to home"
        >
          <img
            src="/logo.png"
            alt="Ma'din Logo"
            className="h-8 sm:h-10 w-auto object-contain group-hover:scale-105 transition-transform shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-bold text-base sm:text-lg text-emerald-950 font-malayalam truncate">
                ഉർവതൽ വുസ്ഖ്വ
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0 font-malayalam">
                മെഗാ ക്വിസ്
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-700/80 font-medium hidden sm:block truncate font-malayalam">
              മെഗാ ക്വിസ് മത്സരം
            </p>
          </div>
        </button>

        {/* Navigation Action Buttons (Hidden for participants; only shown when inside admin portal) */}
        {isAdmin && (
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
            >
              <span className="hidden xs:inline">Back to Quiz</span>
              <span className="xs:hidden">Quiz</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

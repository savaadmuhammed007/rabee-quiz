import React from 'react';
import { Clock, BookOpen, Award, Wifi, Play, User, Hash, MapPin, Phone } from 'lucide-react';

export default function Instructions({ participant, onStartQuiz }) {
  const candidateCode = participant?.candidateCode || participant?.participantId;
  const place = participant?.place || participant?.institution;
  const mobile = participant?.mobileNumber || participant?.phone;

  return (
    <div className="max-w-lg mx-auto px-3.5 sm:px-4 py-5 sm:py-8 animate-fadeIn">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-5 sm:mb-6 px-1">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-100 text-emerald-800 text-[11px] sm:text-xs font-bold flex items-center justify-center shrink-0">✓</span>
          <span className="text-[10px] sm:text-xs font-semibold text-emerald-800 uppercase tracking-wider hidden xs:inline font-malayalam">രജിസ്ട്രേഷൻ</span>
        </div>
        <div className="h-0.5 flex-1 mx-2 sm:mx-3 bg-emerald-300"></div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-600 text-white text-[11px] sm:text-xs font-bold flex items-center justify-center shrink-0">2</span>
          <span className="text-[10px] sm:text-xs font-bold text-emerald-950 uppercase tracking-wider font-malayalam">നിർദ്ദേശങ്ങൾ</span>
        </div>
        <div className="h-0.5 flex-1 mx-2 sm:mx-3 bg-slate-200"></div>
        <div className="flex items-center gap-1.5 sm:gap-2 opacity-50">
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-200 text-slate-600 text-[11px] sm:text-xs font-bold flex items-center justify-center shrink-0">3</span>
          <span className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider hidden xs:inline font-malayalam">ക്വിസ്</span>
        </div>
      </div>

      {/* Main Instructions Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-sm border border-emerald-100">
        {/* Participant Greeting Card */}
        <div className="flex items-center justify-between gap-2 p-3 sm:p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 mb-5 sm:mb-6">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-bold text-emerald-950 truncate font-malayalam">{participant?.name || 'Participant'}</div>
              <div className="text-[11px] sm:text-xs text-emerald-700 truncate font-malayalam">{place || 'Place'}</div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[9px] sm:text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Candidate Code</div>
            <div className="text-xs sm:text-sm font-mono font-bold text-emerald-900">{candidateCode}</div>
          </div>
        </div>

        {/* Malayalam Header */}
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-malayalam mb-1">നിർദ്ദേശങ്ങൾ</h1>
        <p className="text-[11px] sm:text-xs text-slate-500 mb-4 sm:mb-5 font-malayalam">
          ക്വിസ് ആരംഭിക്കുന്നതിന് മുൻപായി താഴെ പറയുന്ന വിവരങ്ങൾ ശ്രദ്ധിക്കുക:
        </p>

        {/* 4 Official Malayalam Instruction Rules */}
        <div className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6 text-slate-700">
          {/* Rule 1 */}
          <div className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="p-1.5 sm:p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed font-malayalam">
              5:00 മുതൽ 5:10 വരെയായിരിക്കും മത്സരം.
            </div>
          </div>

          {/* Rule 2 */}
          <div className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed font-malayalam">
              20 ചോദ്യങ്ങളാണ് ചോദ്യാവലിയിൽ ഉണ്ടായിരിക്കുക. പരമാവധി വേഗതയിൽ ഉത്തരം നൽകാൻ ശ്രമിക്കുക.
            </div>
          </div>

          {/* Rule 3 */}
          <div className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="p-1.5 sm:p-2 rounded-lg bg-teal-100 text-teal-800 shrink-0 mt-0.5">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed font-malayalam">
              വിജയികളെ നിർണയിക്കുന്നതിൽ വേഗത, ശരിയുത്തരങ്ങളുടെ കൃത്യത പരിഗണിക്കപ്പെടും.
            </div>
          </div>

          {/* Rule 4 */}
          <div className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="p-1.5 sm:p-2 rounded-lg bg-sky-100 text-sky-800 shrink-0 mt-0.5">
              <Wifi className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed font-malayalam">
              കൃത്യമായ ഇന്റർനെറ്റ് കണക്ഷൻ ഉറപ്പുവരുത്തേണ്ടതാണ്.
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={onStartQuiz}
          className="w-full min-h-[50px] py-3.5 px-5 sm:px-6 rounded-xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:scale-[0.99] transition-all shadow-lg shadow-emerald-800/25 flex items-center justify-center gap-2.5 cursor-pointer font-malayalam"
        >
          <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white shrink-0" />
          <span>ക്വിസ് ആരംഭിക്കുക (Start Quiz)</span>
        </button>

        <p className="text-[10px] sm:text-[11px] text-center text-slate-400 mt-2.5 sm:mt-3 font-malayalam">
          "Start Quiz" ക്ലിക്ക് ചെയ്യുന്നതോടെ 10 മിനിറ്റ് കൗണ്ട്ഡൗൺ ആരംഭിക്കുന്നതാണ്.
        </p>
      </div>
    </div>
  );
}

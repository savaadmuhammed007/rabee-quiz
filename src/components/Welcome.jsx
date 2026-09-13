import React from 'react';
import { BookOpen, Clock, Zap, Award, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { QUIZ_CONFIG } from '../data/questions';

export default function Welcome({ onStartRegistration, onResumeQuiz, isCompleted, hasInProgress, participant }) {
  return (
    <div className="max-w-xl mx-auto px-3.5 sm:px-4 py-6 sm:py-12 animate-fadeIn">
      {/* Official Emblem */}
      <div className="flex justify-center mb-3 sm:mb-4">
        <img
          src="/logo.png"
          alt="Ma'din Al Islamiyya Campus"
          className="h-16 sm:h-20 w-auto object-contain"
        />
      </div>

      {/* Decorative Arabic Greeting Banner */}
      <div className="text-center mb-5 sm:mb-6">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-800 text-[11px] sm:text-xs font-semibold tracking-wide border border-emerald-200 shadow-xs mb-2.5 sm:mb-3">
          <span>✨ Rabi' al-Awwal 1447 AH Special</span>
        </div>
        <h1 className="text-2xl xs:text-3xl sm:text-4xl font-extrabold text-emerald-950 font-malayalam mb-1.5 sm:mb-2">
          {QUIZ_CONFIG.title}
        </h1>
        <p className="text-emerald-800 font-semibold text-sm sm:text-base font-malayalam">
          {QUIZ_CONFIG.subtitle}
        </p>
        <p className="text-slate-500 text-[11px] sm:text-xs mt-1 max-w-md mx-auto px-2">
          An authentic knowledge challenge celebrating the life and teachings of the Prophet Muhammad ﷺ
        </p>
      </div>

      {/* Main Info Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-7 shadow-sm border border-emerald-100/80 mb-5 sm:mb-6">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-3.5 sm:mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
          <span>Quiz Highlights</span>
        </h2>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-5 sm:mb-6">
          <div className="p-2.5 sm:p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center sm:items-start gap-2.5 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-600 text-white shrink-0">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs sm:text-sm text-emerald-950 truncate">20 Questions</div>
              <div className="text-[10px] sm:text-xs text-slate-500 truncate">Multiple Choice</div>
            </div>
          </div>

          <div className="p-2.5 sm:p-3.5 rounded-xl bg-amber-50/70 border border-amber-100 flex items-center sm:items-start gap-2.5 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-amber-600 text-white shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs sm:text-sm text-amber-950 truncate">10 Minutes</div>
              <div className="text-[10px] sm:text-xs text-slate-500 truncate">Auto-submits</div>
            </div>
          </div>

          <div className="p-2.5 sm:p-3.5 rounded-xl bg-teal-50/60 border border-teal-100 flex items-center sm:items-start gap-2.5 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-teal-600 text-white shrink-0">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs sm:text-sm text-teal-950 truncate">Speed Bonus</div>
              <div className="text-[10px] sm:text-xs text-slate-500 truncate">Up to +10 marks</div>
            </div>
          </div>

          <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center sm:items-start gap-2.5 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-slate-700 text-white shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs sm:text-sm text-slate-900 truncate">Instant Record</div>
              <div className="text-[10px] sm:text-xs text-slate-500 truncate">100% in-browser</div>
            </div>
          </div>
        </div>

        {/* Status Callout if already completed or in progress */}
        {isCompleted ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 mb-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900">
              <p className="font-bold">You have already submitted this quiz.</p>
              <p className="mt-0.5 text-emerald-700">
                Attempt recorded for participant <span className="font-mono font-semibold">{participant?.participantId || 'Participant'}</span>. Retakes are not permitted.
              </p>
            </div>
          </div>
        ) : hasInProgress ? (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 mb-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
            <div className="text-xs text-amber-900">
              <p className="font-bold">Active Quiz in Progress!</p>
              <p className="mt-0.5 text-amber-700">
                Your 10-minute timer is currently counting down. Resume now to complete your answers before time expires.
              </p>
            </div>
          </div>
        ) : null}

        {/* Action Button */}
        {isCompleted ? (
          <button
            onClick={onResumeQuiz}
            className="w-full py-3.5 px-5 rounded-xl font-bold text-sm text-white bg-emerald-700 hover:bg-emerald-800 transition-all shadow-md shadow-emerald-800/20 flex items-center justify-center gap-2"
          >
            <span>View Submission Receipt</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : hasInProgress ? (
          <button
            onClick={onResumeQuiz}
            className="w-full py-3.5 px-5 rounded-xl font-bold text-sm text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 animate-bounce"
          >
            <span>Resume Quiz (Timer Running)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onStartRegistration}
            className="w-full py-3.5 px-5 rounded-xl font-bold text-base text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 transition-all shadow-md shadow-emerald-700/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <span>Register & Start Quiz</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Note on Participation Rules */}
      <div className="text-center text-xs text-slate-400 space-y-1">
        <p>• Registration restricted to official candidates (MAICQ01 – MAICQ35)</p>
        <p>• Only 1 submission allowed per browser device</p>
        <p>• Answers and scores are recorded for administrative evaluation only</p>
      </div>
    </div>
  );
}

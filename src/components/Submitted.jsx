import React, { useState, useEffect } from 'react';
import { CheckCircle2, ShieldCheck, Sparkles, MapPin, Calendar, User, Phone, Hash, ListChecks, ChevronDown, ChevronUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatDateTime } from '../utils/storage';
import SubmittedAnswersList from './common/SubmittedAnswersList';

export default function Submitted({ participant, result }) {
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    // Subtle, tasteful celebration burst
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#059669', '#10b981', '#f59e0b', '#34d399'],
        disableForReducedMotion: true,
      });
    } catch {
      // ignore if canvas is unavailable
    }
  }, []);

  const candidateCode = participant?.candidateCode || result?.candidateCode || participant?.participantId || result?.participantId || 'RABEE-0001';
  const name = participant?.name || result?.name || 'Participant';
  const place = participant?.place || result?.place || participant?.institution || result?.institution;
  const mobileNumber = participant?.mobileNumber || result?.mobileNumber || participant?.phone || result?.phone;
  const answers = result?.answers || {};

  return (
    <div className="max-w-md mx-auto px-3.5 sm:px-4 py-8 sm:py-12 animate-fadeIn text-center">
      {/* Success Emblem */}
      <div className="relative inline-block mb-5 sm:mb-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-xs shadow-xs">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </div>
      </div>

      {/* Required Text */}
      <h1 className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-emerald-950 font-serif mb-1.5 sm:mb-2">
        Quiz Submitted Successfully
      </h1>
      <p className="text-xs sm:text-base text-emerald-800 font-semibold mb-5 sm:mb-6 font-malayalam">
        ഉർവതൽ വുസ്ഖ്വ മെഗാ ക്വിസ് മത്സരത്തിൽ പങ്കെടുത്തതിന് നന്ദി.
      </p>

      {/* Submission Receipt Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-emerald-100 text-left mb-4 sm:mb-5">
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Official Receipt</span>
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Recorded
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-slate-400" /> Candidate Code
            </span>
            <span className="font-mono font-bold text-emerald-900 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-100">
              {candidateCode}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" /> Name
            </span>
            <span className="font-bold text-slate-900">
              {name}
            </span>
          </div>

          {place && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Place
              </span>
              <span className="font-medium text-slate-800">
                {place}
              </span>
            </div>
          )}

          {mobileNumber && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Mobile Number
              </span>
              <span className="font-medium text-slate-800">
                {mobileNumber}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Submission Time
            </span>
            <span className="text-slate-700 font-medium">
              {formatDateTime(result?.submittedAt || new Date().toISOString())}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Your answers have been stored locally on this device. Official evaluation and prize distributions will be announced by the event administration.
          </p>
        </div>
      </div>

      {/* Option to Show Submitted Answers */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 text-left mb-6">
        <button
          type="button"
          onClick={() => setShowAnswers((prev) => !prev)}
          className="w-full flex items-center justify-between font-bold text-xs text-emerald-900 hover:text-emerald-950 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-emerald-600" />
            <span>Show My Submitted Answers (20 Questions)</span>
          </div>
          {showAnswers ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showAnswers && (
          <div className="mt-4 pt-3 border-t border-slate-100 animate-fadeIn">
            <p className="text-[11px] text-slate-500 mb-3">
              Review of the answers you submitted during this attempt:
            </p>
            <SubmittedAnswersList
              userAnswers={answers}
              showCorrectAnswers={false}
            />
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400">
        You may now safely close this browser window.
      </p>
    </div>
  );
}

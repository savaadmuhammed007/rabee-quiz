import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle, ChevronLeft, ChevronRight, CheckCircle2, HelpCircle, Send, Check } from 'lucide-react';
import { QUIZ_CONFIG, questions } from '../data/questions';
import { getRemainingTime, formatSecondsToMS, saveQuizState } from '../utils/storage';

export default function Quiz({ quizState, onSubmitQuiz, onAutoSubmit }) {
  const [currentIdx, setCurrentIdx] = useState(quizState?.currentQuestion || 0);
  const [answers, setAnswers] = useState(quizState?.answers || {});
  const [remainingSeconds, setRemainingSeconds] = useState(() => 
    getRemainingTime(quizState?.startedAt)
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const timerRef = useRef(null);
  const autoSubmittedRef = useRef(false);

  // Sync state changes to localStorage whenever answers or current question change
  useEffect(() => {
    if (quizState?.startedAt) {
      saveQuizState({
        startedAt: quizState.startedAt,
        answers,
        currentQuestion: currentIdx,
        status: 'in_progress',
      });
    }
  }, [answers, currentIdx, quizState?.startedAt]);

  // Robust resilient timer hook
  useEffect(() => {
    if (!quizState?.startedAt) return;

    const tick = () => {
      const remaining = getRemainingTime(quizState.startedAt);
      setRemainingSeconds(remaining);

      if (remaining <= 0 && !autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        if (timerRef.current) clearInterval(timerRef.current);
        onAutoSubmit();
      }
    };

    // Immediate initial check
    tick();

    // Set interval ticking every 500ms for smooth update
    timerRef.current = setInterval(tick, 500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizState?.startedAt, onAutoSubmit]);

  const currentQ = questions[currentIdx];
  const answeredCount = Object.keys(answers).filter((k) => answers[k] !== undefined && answers[k] !== null).length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  const isUrgent = remainingSeconds <= QUIZ_CONFIG.warningThresholdSeconds; // < 2 minutes (120s)

  const handleSelectOption = (optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIndex,
    }));
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handleManualSubmit = () => {
    setShowConfirmModal(true);
  };

  const confirmSubmit = () => {
    setShowConfirmModal(false);
    onSubmitQuiz(answers);
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-2xl mx-auto px-3.5 sm:px-4 py-3 sm:py-6 pb-28 sm:pb-32 animate-fadeIn">
      {/* Fixed Sticky Header for Timer & Progress */}
      <div className="sticky top-14 sm:top-16 z-30 -mx-3.5 sm:-mx-4 px-3.5 sm:px-4 py-2.5 sm:py-3 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs mb-4 sm:mb-5">
        <div className="flex items-center justify-between gap-2">
          {/* Answered Counter */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
              {answeredCount}/{questions.length}
            </div>
            <div>
              <div className="text-[10px] sm:text-[11px] font-bold text-emerald-950 uppercase tracking-wider">Progress</div>
              <div className="text-[11px] sm:text-xs text-slate-500 font-medium">{answeredCount} Answered</div>
            </div>
          </div>

          {/* Resilient Countdown Timer */}
          <div
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border font-mono font-bold text-xs sm:text-sm transition-colors ${
              isUrgent
                ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                : 'bg-emerald-50 text-emerald-900 border-emerald-200'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isUrgent ? 'text-rose-600' : 'text-emerald-700'}`} />
            <span>{formatSecondsToMS(remainingSeconds)}</span>
            <span className="text-[10px] font-sans font-medium uppercase text-slate-500 hidden sm:inline">
              left
            </span>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Urgent Timer Alert Banner */}
        {isUrgent && (
          <div className="mt-2 text-center text-[11px] sm:text-xs font-semibold text-rose-600 flex items-center justify-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Less than 2 minutes remaining! Review and submit your answers.</span>
          </div>
        )}
      </div>

      {/* Question Navigator (5 columns on mobile, 10 on desktop) */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-xs border border-emerald-100/80 mb-4 sm:mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">Question Navigator</span>
          <span className="text-[10px] sm:text-xs text-slate-400">Tap to jump</span>
        </div>

        {/* Responsive Grid: 5 columns on phones gives ~50px comfortable touch targets */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
          {questions.map((q, idx) => {
            const isCurrent = idx === currentIdx;
            const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null;

            let buttonClass = 'bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-300';
            if (isCurrent) {
              buttonClass = 'bg-emerald-700 text-white font-bold ring-2 ring-emerald-400 ring-offset-1 border-transparent shadow-xs';
            } else if (isAnswered) {
              buttonClass = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold';
            }

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(idx)}
                className={`h-9 sm:h-9 rounded-lg border text-xs sm:text-xs flex items-center justify-center transition-all cursor-pointer relative ${buttonClass}`}
                title={`Question ${idx + 1}: ${isAnswered ? 'Answered' : 'Unanswered'}`}
              >
                <span>{idx + 1}</span>
                {isAnswered && !isCurrent && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-600 border border-white"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-emerald-700"></span>
            <span>Current</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-emerald-100 border border-emerald-300"></span>
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-slate-100 border border-slate-200"></span>
            <span>Unanswered</span>
          </div>
        </div>
      </div>

      {/* Active Question Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-7 shadow-sm border border-emerald-100 mb-5 sm:mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] sm:text-xs font-bold tracking-wide">
            <span>Question {currentIdx + 1} of {questions.length}</span>
          </span>
          <span className="text-[11px] sm:text-xs text-slate-400 font-medium">
            {answers[currentQ.id] !== undefined ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Answered
              </span>
            ) : (
              'Not answered yet'
            )}
          </span>
        </div>

        {/* Question Text */}
        <h2 className="text-base sm:text-xl font-bold text-slate-900 leading-relaxed mb-4 sm:mb-6 break-words font-malayalam">
          {currentQ.question}
        </h2>

        {/* 4 Options */}
        <div className="space-y-2.5 sm:space-y-3">
          {currentQ.options.map((optionText, optIdx) => {
            const isSelected = answers[currentQ.id] === optIdx;

            return (
              <button
                key={optIdx}
                type="button"
                onClick={() => handleSelectOption(optIdx)}
                className={`w-full min-h-[52px] sm:min-h-[56px] p-3 sm:p-4 rounded-xl border text-left transition-all flex items-center gap-2.5 sm:gap-3.5 cursor-pointer active:scale-[0.99] ${
                  isSelected
                    ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-400/30 text-emerald-950 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/30'
                }`}
              >
                {/* Radio Letter Badge */}
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-slate-300 text-slate-600'
                  }`}
                >
                  {optionLabels[optIdx]}
                </div>

                {/* Option Text */}
                <span className="text-xs sm:text-base font-medium flex-1 leading-relaxed break-words font-malayalam">
                  {optionText}
                </span>

                {/* Selected Checkmark */}
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Sticky Action Bar with iOS Safe-Area Insets */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-emerald-100 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] px-3.5 sm:px-4 shadow-lg z-30">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          {/* Previous Button */}
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer shrink-0 ${
              currentIdx === 0
                ? 'opacity-40 border-slate-200 text-slate-400 cursor-not-allowed'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </button>

          {/* Submit Quiz Button */}
          <button
            onClick={handleManualSubmit}
            className="flex-1 sm:flex-initial px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Submit Quiz</span>
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={currentIdx === questions.length - 1}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer shrink-0 ${
              currentIdx === questions.length - 1
                ? 'opacity-40 border-slate-200 text-slate-400 cursor-not-allowed'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Confirmation Dialog Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 transform transition-all">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">
              Submit Your Quiz?
            </h3>
            <p className="text-xs text-slate-500 text-center mb-4">
              Are you sure you want to submit your quiz?
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 mb-4 text-center">
              <div className="text-xs text-slate-500 font-medium">Answered Summary</div>
              <div className="text-lg font-bold text-emerald-900 font-mono mt-0.5">
                {answeredCount} / {questions.length} Answered
              </div>
              {answeredCount < questions.length && (
                <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-left">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{questions.length - answeredCount} ചോദ്യങ്ങൾക്ക് ഉത്തരം നൽകിയിട്ടില്ല!</span>
                  </div>
                  <p className="text-[11px] text-amber-800 mt-1 font-malayalam leading-relaxed">
                    ശ്രദ്ധിക്കുക: എല്ലാ ചോദ്യങ്ങൾക്കും (20/20) ഉത്തരം നൽകിയാൽ മാത്രമേ സ്പീഡ് ബോണസ് മാർക്കുകൾ ലഭിക്കുകയുള്ളൂ.
                  </p>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 text-center mb-5">
              Once submitted, your answers cannot be altered and your attempt will be permanently recorded.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Continue Quiz
              </button>
              <button
                type="button"
                onClick={confirmSubmit}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 cursor-pointer"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { CheckCircle2, XCircle, HelpCircle, Check, X } from 'lucide-react';
import { questions } from '../../data/questions';

export default function SubmittedAnswersList({
  userAnswers = {},
  showCorrectAnswers = true,
  isScrollable = false,
  maxHeightClass = 'max-h-[420px]',
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'correct' | 'incorrect' | 'unanswered'

  const optionLabels = ['A', 'B', 'C', 'D'];

  const answersList = questions.map((q) => {
    const selectedIdx = userAnswers?.[q.id];
    const hasAnswered = selectedIdx !== undefined && selectedIdx !== null;
    const isCorrect = hasAnswered && Number(selectedIdx) === q.correctAnswer;

    return {
      question: q,
      selectedIdx,
      hasAnswered,
      isCorrect,
    };
  });

  const correctCount = answersList.filter((a) => a.isCorrect).length;
  const incorrectCount = answersList.filter((a) => a.hasAnswered && !a.isCorrect).length;
  const unansweredCount = answersList.filter((a) => !a.hasAnswered).length;

  const filteredList = answersList.filter((item) => {
    if (filter === 'correct') return item.isCorrect;
    if (filter === 'incorrect') return item.hasAnswered && !item.isCorrect;
    if (filter === 'unanswered') return !item.hasAnswered;
    return true;
  });

  return (
    <div className="space-y-3.5">
      {/* Filter Tabs Bar */}
      {showCorrectAnswers && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap ${
              filter === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Questions ({questions.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('correct')}
            className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              filter === 'correct'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Correct ({correctCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('incorrect')}
            className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              filter === 'incorrect'
                ? 'bg-rose-700 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/60'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Incorrect ({incorrectCount})</span>
          </button>

          {unansweredCount > 0 && (
            <button
              type="button"
              onClick={() => setFilter('unanswered')}
              className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                filter === 'unanswered'
                  ? 'bg-amber-700 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Unanswered ({unansweredCount})</span>
            </button>
          )}
        </div>
      )}

      {/* Questions Breakdown List */}
      <div
        className={`space-y-3 ${
          isScrollable ? `${maxHeightClass} overflow-y-auto pr-1` : ''
        }`}
      >
        {filteredList.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            No questions found in the selected filter ({filter}).
          </div>
        ) : (
          filteredList.map(({ question: q, selectedIdx, hasAnswered, isCorrect }) => (
            <div
              key={q.id}
              className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all shadow-2xs ${
                showCorrectAnswers
                  ? isCorrect
                    ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                    : hasAnswered
                    ? 'bg-rose-50/30 border-rose-200 hover:border-rose-300'
                    : 'bg-slate-50/70 border-slate-200'
                  : hasAnswered
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              {/* Question Top Header */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 shadow-2xs">
                  Q{String(q.id).padStart(2, '0')}
                </span>

                {showCorrectAnswers && (
                  <div className="shrink-0">
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <Check className="w-3 h-3 stroke-[3]" /> Correct (+1)
                      </span>
                    ) : hasAnswered ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        <X className="w-3 h-3 stroke-[3]" /> Incorrect (0)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200 text-slate-700">
                        Unanswered
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Malayalam Question Text */}
              <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed mb-3 break-words font-malayalam">
                {q.question}
              </p>

              {/* Answers Comparison Container */}
              <div className="space-y-2 text-xs">
                {/* Candidate's Submission */}
                <div
                  className={`p-2.5 sm:p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-baseline gap-1.5 sm:gap-2.5 ${
                    showCorrectAnswers
                      ? isCorrect
                        ? 'bg-emerald-100/50 border-emerald-200 text-emerald-950'
                        : hasAnswered
                        ? 'bg-rose-100/40 border-rose-200 text-rose-950'
                        : 'bg-white border-slate-200 text-slate-500'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  <span className="font-bold shrink-0 uppercase tracking-wider text-[10px] sm:text-[11px] opacity-75">
                    Participant's Response:
                  </span>

                  {hasAnswered ? (
                    <span className="font-semibold break-words leading-relaxed font-malayalam text-xs sm:text-sm">
                      <span className="font-mono font-bold mr-1.5 inline-block px-1.5 py-0.2 rounded bg-white/80 border border-slate-200/60 shadow-2xs">
                        {optionLabels[selectedIdx]}
                      </span>
                      {q.options[selectedIdx]}
                    </span>
                  ) : (
                    <span className="italic font-medium text-slate-400 text-xs">
                      No option selected (Unanswered)
                    </span>
                  )}
                </div>

                {/* Show Master Correct Key if Participant was Incorrect or Unanswered */}
                {showCorrectAnswers && !isCorrect && (
                  <div className="p-2.5 sm:p-3 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-baseline gap-1.5 sm:gap-2.5">
                    <span className="font-bold shrink-0 uppercase tracking-wider text-[10px] sm:text-[11px] text-emerald-800">
                      Official Correct Answer:
                    </span>
                    <span className="font-bold break-words leading-relaxed font-malayalam text-xs sm:text-sm text-emerald-900">
                      <span className="font-mono font-bold mr-1.5 inline-block px-1.5 py-0.2 rounded bg-emerald-100 border border-emerald-300 shadow-2xs">
                        {optionLabels[q.correctAnswer]}
                      </span>
                      {q.options[q.correctAnswer]}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  Zap,
  Award,
  Calendar,
  Hash,
  ListChecks,
  Info,
  Copy,
  Check,
  Percent,
  Timer,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { formatDateTime, formatSecondsToMS } from '../../utils/storage';
import SubmittedAnswersList from '../common/SubmittedAnswersList';

export default function ParticipantDetailModal({
  participant,
  result,
  initialTab = 'overview',
  onClose,
  onDeleteParticipant,
}) {
  const [activeTab, setActiveTab] = useState(initialTab || 'overview');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync tab if initialTab changes
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (!participant && !result) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [participant, result]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    if (!participant && !result) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [participant, result, onClose]);

  if (!participant && !result) return null;

  // Consolidate participant and result fields
  const data = result || participant || {};
  const candidateCode =
    result?.candidateCode ||
    participant?.candidateCode ||
    result?.participantId ||
    participant?.participantId ||
    'RABEE-0000';
  const name = result?.name || participant?.name || 'Participant';
  const place =
    result?.place ||
    participant?.place ||
    result?.institution ||
    participant?.institution ||
    '';
  const mobile =
    result?.mobileNumber ||
    participant?.mobileNumber ||
    result?.phone ||
    participant?.phone ||
    '';
  const email = result?.email || participant?.email || '';
  const registeredAt = participant?.registeredAt || result?.registeredAt;
  const userAnswers = result?.answers || {};
  const totalQuestions = result?.totalQuestions || 20;
  const answeredCount =
    result?.answeredCount ??
    Object.keys(userAnswers).filter(
      (k) => userAnswers[k] !== undefined && userAnswers[k] !== null && userAnswers[k] !== ''
    ).length;
  const correctCount = result?.correctAnswers ?? 0;
  const bonusMarks = result?.bonusMarks ?? 0;
  const finalScore = result?.finalScore ?? correctCount;
  const completionSeconds = result?.completionSeconds ?? 0;
  const completionTime =
    result?.completionTime || formatSecondsToMS(completionSeconds);
  const accuracyPct = Math.round((correctCount / totalQuestions) * 100);
  const isSubmitted = !!result || data.status === 'submitted';

  const handleCopy = (text, type) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      if (type === 'code') {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } else if (type === 'phone') {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
      }
    }
  };

  // Speed Bonus Tier Descriptor
  const getSpeedTierNote = (secs, bonus, answered, total) => {
    if (answered !== undefined && total !== undefined && answered < total) {
      return `Speed Bonus: 0 pts (All ${total} questions must be attended to earn bonus. ${answered}/${total} attended)`;
    }
    if (!bonus || bonus <= 0) return 'Standard Completion (+0 speed bonus)';
    const mins = Math.max(1, Math.ceil((secs || 0) / 60));
    return `Speed Bonus: Completed in ≤ ${mins} mins (+${bonus} pts)`;
  };

  return (
    <div
      onClick={(e) => {
        // Dismiss when clicking outer dark backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-candidate-name"
    >
      {/* Modal Shell */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[94vh] sm:max-h-[90vh] flex flex-col shadow-2xl border border-slate-200/80 overflow-hidden">
        {/* ================= FIXED HEADER (ALWAYS VISIBLE) ================= */}
        <div className="shrink-0 bg-white border-b border-slate-100 px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            {/* Avatar Pill */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-bold font-mono text-sm sm:text-base shadow-sm shrink-0">
              {candidateCode.slice(-3) || '001'}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                  Evaluation Dossier
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isSubmitted
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : data.status === 'in_progress'
                      ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {isSubmitted ? 'Submitted' : data.status === 'in_progress' ? 'In Progress' : 'Registered'}
                </span>
              </div>

              <h2
                id="modal-candidate-name"
                className="text-base sm:text-lg font-bold text-slate-900 truncate font-malayalam leading-tight mt-0.5"
                title={name}
              >
                {name}
              </h2>
            </div>
          </div>

          {/* Close Button - Always visible, high contrast, accessible */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onClose}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer border border-slate-200/80 shadow-2xs"
              aria-label="Close Evaluation Details"
              title="Close (Esc)"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* ================= FIXED STICKY TAB SELECTOR ================= */}
        <div className="shrink-0 bg-slate-50/90 backdrop-blur-xs border-b border-slate-200/80 px-4 sm:px-6 py-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white text-emerald-950 shadow-xs border border-emerald-200/70'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Overview & Evaluation</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('answers')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'answers'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <ListChecks className="w-4 h-4" />
            <span>Submitted Answers (20)</span>
            {result && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'answers' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {correctCount}/20
              </span>
            )}
          </button>
        </div>

        {/* ================= SCROLLABLE BODY (SINGLE UNIFIED CONTAINER) ================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* TAB 1: OVERVIEW & SCORES */}
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-5 animate-fadeIn">
              {/* EVALUATION HERO CARD (IMPRESSIVE & VISUAL) */}
              {result ? (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-900 text-white p-4 sm:p-6 shadow-md border border-emerald-800/40">
                  {/* Subtle Background Geometric Glow */}
                  <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none" />
                  <div className="absolute left-1/3 -top-12 w-32 h-32 rounded-full bg-teal-400/10 blur-xl pointer-events-none" />

                  {/* Header Row */}
                  <div className="relative flex items-center justify-between gap-2 pb-3.5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                        <Award className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                        Official Evaluation
                      </span>
                    </div>

                    <span className="text-[11px] font-medium text-emerald-100/80 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                      {result.submissionType || 'Evaluated'}
                    </span>
                  </div>

                  {/* Center Hero Score */}
                  <div className="relative py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider font-semibold text-emerald-300/90">
                        Total Performance Score
                      </div>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white drop-shadow-xs">
                          {finalScore}
                        </span>
                        <span className="text-sm sm:text-base font-semibold text-emerald-300/80">
                          / 30 Marks Max
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-200/80 mt-1">
                        {getSpeedTierNote(completionSeconds, bonusMarks, answeredCount, totalQuestions)}
                      </p>
                    </div>

                    {/* Quick Jump Action */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('answers')}
                      className="w-full sm:w-auto py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-emerald-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0"
                    >
                      <ListChecks className="w-4 h-4" />
                      <span>Inspect 20 Answers</span>
                    </button>
                  </div>

                  {/* 3 Metrics Pods */}
                  <div className="relative grid grid-cols-3 gap-2 sm:gap-3 pt-2">
                    {/* Correct Answers */}
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 sm:p-3 border border-white/10 text-center">
                      <div className="text-[10px] sm:text-[11px] font-semibold text-emerald-200/90 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Correct
                      </div>
                      <div className="text-base sm:text-xl font-bold font-mono text-white mt-0.5">
                        {correctCount}
                        <span className="text-[11px] text-emerald-200/80 font-normal"> / {totalQuestions}</span>
                      </div>
                      <div className="text-[10px] text-emerald-300 font-medium mt-0.5">
                        {accuracyPct}% Accuracy
                      </div>
                    </div>

                    {/* Speed Bonus */}
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 sm:p-3 border border-white/10 text-center">
                      <div className="text-[10px] sm:text-[11px] font-semibold text-teal-200/90 flex items-center justify-center gap-1">
                        <Zap className="w-3 h-3 text-amber-300" /> Speed Bonus
                      </div>
                      <div className="text-base sm:text-xl font-bold font-mono text-teal-300 mt-0.5">
                        +{bonusMarks}
                      </div>
                      <div className="text-[10px] text-teal-200 font-medium mt-0.5">
                        Speed Tier Marks
                      </div>
                    </div>

                    {/* Time Elapsed */}
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 sm:p-3 border border-white/10 text-center">
                      <div className="text-[10px] sm:text-[11px] font-semibold text-emerald-200/90 flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-300" /> Time
                      </div>
                      <div className="text-base sm:text-xl font-bold font-mono text-white mt-0.5">
                        {completionTime}
                      </div>
                      <div className="text-[10px] text-emerald-300 font-medium mt-0.5">
                        {completionSeconds}s total
                      </div>
                    </div>
                  </div>

                  {/* Accuracy Bar */}
                  <div className="relative mt-3 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between text-[11px] text-emerald-200/90 mb-1">
                      <span>Quiz Accuracy</span>
                      <span className="font-mono font-bold text-white">{accuracyPct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, accuracyPct))}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-amber-950">
                      Quiz Submission Incomplete
                    </h4>
                    <p className="text-xs text-amber-800 mt-0.5">
                      This participant is registered but has not completed their quiz submission yet.
                      Once submitted, evaluation scores and answer breakdown will appear here.
                    </p>
                  </div>
                </div>
              )}

              {/* CANDIDATE PROFILE CARD */}
              <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <User className="w-3.5 h-3.5 text-emerald-700" />
                    Participant Profile
                  </span>
                  <span className="text-[11px] text-slate-400">Verified Registration</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Candidate Code with Copy */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200/70 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                        <Hash className="w-3 h-3 text-slate-400" /> Candidate Code
                      </span>
                      <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                        {candidateCode}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(candidateCode, 'code')}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer"
                      title="Copy Candidate Code"
                    >
                      {copiedCode ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Mobile Number with Call & Copy */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200/70 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> Mobile Number
                      </span>
                      <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                        {mobile ? (
                          <a
                            href={`tel:${mobile}`}
                            className="hover:text-emerald-700 hover:underline transition-colors"
                          >
                            {mobile}
                          </a>
                        ) : (
                          'Not provided'
                        )}
                      </div>
                    </div>
                    {mobile && (
                      <button
                        type="button"
                        onClick={() => handleCopy(mobile, 'phone')}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer"
                        title="Copy Phone Number"
                      >
                        {copiedPhone ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Full Name */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200/70">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" /> Full Name
                    </span>
                    <div className="font-bold text-slate-900 text-sm mt-0.5 font-malayalam">
                      {name}
                    </div>
                  </div>

                  {/* Place / Institution */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200/70">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> Place / Institution
                    </span>
                    <div className="font-bold text-slate-900 text-sm mt-0.5 font-malayalam">
                      {place || 'Not provided'}
                    </div>
                  </div>

                  {/* Registration Time */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200/70">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" /> Registered At
                    </span>
                    <div className="text-slate-800 text-xs mt-0.5 font-medium">
                      {formatDateTime(registeredAt)}
                    </div>
                  </div>

                  {/* Submission Time */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200/70">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> Submitted At
                    </span>
                    <div className="text-slate-800 text-xs mt-0.5 font-medium">
                      {result?.submittedAt ? formatDateTime(result.submittedAt) : 'Pending submission'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUBMITTED ANSWERS (20 QUESTIONS) */}
          {activeTab === 'answers' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                    <ListChecks className="w-4 h-4 text-emerald-700" />
                    Evaluation Key & Candidate Response
                  </h3>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Inspect each question response against the official master answer key.
                  </p>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs shrink-0">
                  <span className="bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-lg font-bold border border-emerald-200">
                    {correctCount} Correct
                  </span>
                  <span className="bg-rose-100 text-rose-900 px-2.5 py-1 rounded-lg font-bold border border-rose-200">
                    {20 - correctCount} Incorrect
                  </span>
                </div>
              </div>

              {/* Answers list without nested scroll container */}
              <SubmittedAnswersList
                userAnswers={userAnswers}
                showCorrectAnswers={true}
                isScrollable={false}
              />
            </div>
          )}
        </div>

        {/* ================= FIXED FOOTER (ALWAYS VISIBLE) ================= */}
        <div className="shrink-0 bg-slate-50 border-t border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
            <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
              {candidateCode}
            </span>
            {result && (
              <span className="hidden sm:inline font-semibold text-emerald-800">
                Score: {finalScore}/25 ({correctCount}/20 Correct)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onDeleteParticipant && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="py-2 px-3 sm:px-3.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer"
                title="Delete participant from records"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Delete</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="py-2 px-4 sm:px-5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <span>Close Dossier</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-700 text-slate-300 rounded font-normal">
                ESC
              </kbd>
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowDeleteConfirm(false);
            }}
            className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">Delete Participant?</h4>
                  <p className="text-xs text-slate-500">Permanent data removal</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to permanently delete candidate{' '}
                <strong className="text-slate-900 font-mono">{candidateCode}</strong>{' '}
                (<span className="font-malayalam font-bold">{name}</span>)? All registration records and quiz scores will be permanently deleted.
              </p>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteParticipant?.(candidateCode);
                    setShowDeleteConfirm(false);
                    onClose();
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Yes, Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

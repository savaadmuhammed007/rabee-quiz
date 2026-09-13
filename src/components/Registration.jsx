import React, { useState, useEffect } from 'react';
import { Hash, User, MapPin, CheckCircle2, ArrowRight, Shield, AlertCircle, Sparkles } from 'lucide-react';
import { findCandidateByCode } from '../data/candidates';
import { saveParticipant } from '../utils/storage';

export default function Registration({ onCompleteRegistration, initialData }) {
  const [candidateCode, setCandidateCode] = useState(
    initialData?.candidateCode || initialData?.participantId || ''
  );
  const [matchedCandidate, setMatchedCandidate] = useState(null);
  const [error, setError] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);

  // Sync initialData if present
  useEffect(() => {
    const code = (initialData?.candidateCode || initialData?.participantId || '').trim().toUpperCase();
    if (code) {
      const match = findCandidateByCode(code);
      if (match) {
        setCandidateCode(match.code);
        setMatchedCandidate(match);
      }
    }
  }, [initialData]);

  const handleCodeChange = (e) => {
    const rawVal = e.target.value;
    const formattedVal = rawVal.toUpperCase().trim();
    setCandidateCode(rawVal.toUpperCase());
    setHasInteracted(true);

    if (!formattedVal) {
      setMatchedCandidate(null);
      setError('');
      return;
    }

    const match = findCandidateByCode(formattedVal);
    if (match) {
      setMatchedCandidate(match);
      setError('');
    } else {
      setMatchedCandidate(null);
      // If user typed 7+ characters (like full MAICQxx) or characters that don't match pattern, show feedback
      if (formattedVal.length >= 6) {
        setError('Candidate code not found. Please enter your valid code (MAICQ01 - MAICQ35).');
      } else {
        setError('');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setHasInteracted(true);

    const match = findCandidateByCode(candidateCode);
    if (!match) {
      setError('Please enter a valid candidate code from the official list (MAICQ01 to MAICQ35).');
      return;
    }

    const saved = saveParticipant({
      name: match.name,
      candidateCode: match.code,
      participantId: match.code,
      place: match.place,
      institution: match.place,
      mobileNumber: '',
      phone: '',
    });

    onCompleteRegistration(saved);
  };

  return (
    <div className="max-w-lg mx-auto px-3.5 sm:px-4 py-5 sm:py-8 animate-fadeIn">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-5 sm:mb-6 px-1">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-600 text-white text-[11px] sm:text-xs font-bold flex items-center justify-center shrink-0">1</span>
          <span className="text-[10px] sm:text-xs font-bold text-emerald-950 uppercase tracking-wider">Candidate Entry</span>
        </div>
        <div className="h-0.5 flex-1 mx-2 sm:mx-3 bg-emerald-200"></div>
        <div className="flex items-center gap-1.5 sm:gap-2 opacity-50">
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-200 text-slate-600 text-[11px] sm:text-xs font-bold flex items-center justify-center shrink-0">2</span>
          <span className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider hidden xs:inline">Instructions</span>
        </div>
        <div className="h-0.5 flex-1 mx-2 sm:mx-3 bg-slate-200"></div>
        <div className="flex items-center gap-1.5 sm:gap-2 opacity-50">
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-200 text-slate-600 text-[11px] sm:text-xs font-bold flex items-center justify-center shrink-0">3</span>
          <span className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider hidden xs:inline">Quiz</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-sm border border-emerald-100">
        <div className="mb-5 sm:mb-6">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">Candidate Verification</h1>
            <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-right shrink-0">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Step 1 of 3</span>
            </div>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
            Enter your official candidate code to automatically verify your details and begin the quiz.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Candidate Code Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="candidateCodeInput" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Candidate Code <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] sm:text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                Range: MAICQ01 – MAICQ35
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Hash className="w-4 h-4" />
              </div>
              <input
                id="candidateCodeInput"
                type="text"
                name="candidateCode"
                value={candidateCode}
                onChange={handleCodeChange}
                placeholder="e.g. MAICQ01"
                autoComplete="off"
                autoFocus
                className={`w-full pl-10 pr-10 py-3 rounded-xl border text-base sm:text-lg font-mono uppercase tracking-wider text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  matchedCandidate
                    ? 'border-emerald-500 bg-emerald-50/20 focus:ring-emerald-200 font-bold'
                    : error
                    ? 'border-rose-300 bg-rose-50/40 focus:ring-rose-200'
                    : 'border-slate-200 bg-slate-50/50 focus:border-emerald-500 focus:bg-white focus:ring-emerald-100 font-semibold'
                }`}
              />
              {matchedCandidate && (
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-emerald-600 animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
            </div>

            {error && (
              <p className="text-rose-600 text-xs mt-1.5 flex items-center gap-1.5 animate-fadeIn">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </div>

          {/* Automatically Populated Candidate Card */}
          {matchedCandidate ? (
            <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/90 via-teal-50/60 to-white p-4 sm:p-5 shadow-xs animate-fadeIn space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Candidate Details Verified</span>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-700 text-white shadow-xs">
                  {matchedCandidate.code}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Name Card */}
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/90 border border-emerald-100 shadow-2xs">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Full Name</div>
                    <div className="text-sm sm:text-base font-bold text-slate-900 font-serif truncate" title={matchedCandidate.name}>
                      {matchedCandidate.name}
                    </div>
                  </div>
                </div>

                {/* Place Card */}
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/90 border border-emerald-100 shadow-2xs">
                  <div className="p-2 rounded-lg bg-teal-100 text-teal-800 shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Place / Town</div>
                    <div className="text-sm sm:text-base font-semibold text-slate-800 truncate" title={matchedCandidate.place}>
                      {matchedCandidate.place}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-emerald-700 text-center font-medium pt-1">
                ✓ Name and place automatically loaded from official roster
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-center">
              <p className="text-xs text-slate-500">
                Type your candidate code above to view your name and place automatically.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!matchedCandidate}
              className={`w-full min-h-[50px] py-3.5 px-5 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                matchedCandidate
                  ? 'text-white bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] shadow-emerald-800/25 ring-2 ring-emerald-600/30'
                  : 'text-slate-400 bg-slate-200 cursor-not-allowed shadow-none'
              }`}
            >
              <span>{matchedCandidate ? 'Confirm & Proceed to Instructions' : 'Enter Valid Code to Proceed'}</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </form>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          The 10-minute timer will NOT start until you click "Start Quiz".
        </p>
      </div>
    </div>
  );
}

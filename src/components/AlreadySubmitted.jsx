import React, { useState } from 'react';
import { Lock, ShieldCheck, User, MapPin, Calendar, Phone, Hash, ListChecks, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { formatDateTime } from '../utils/storage';
import SubmittedAnswersList from './common/SubmittedAnswersList';

export default function AlreadySubmitted({ participant, result, onResetDevice }) {
  const [showAnswers, setShowAnswers] = useState(false);

  const candidateCode = participant?.candidateCode || result?.candidateCode || participant?.participantId || result?.participantId || 'RABEE-0001';
  const name = participant?.name || result?.name || 'Participant';
  const place = participant?.place || result?.place || participant?.institution || result?.institution;
  const mobileNumber = participant?.mobileNumber || result?.mobileNumber || participant?.phone || result?.phone;
  const answers = result?.answers || {};

  return (
    <div className="max-w-md mx-auto px-3.5 sm:px-4 py-8 sm:py-12 animate-fadeIn text-center">
      {/* Locked Emblem */}
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-inner">
        <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-amber-700" />
      </div>

      {/* Required Heading & Subtitle */}
      <h1 className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif mb-1.5 sm:mb-2">
        You Have Already Submitted
      </h1>
      <p className="text-xs sm:text-base text-slate-600 font-medium mb-5 sm:mb-6 font-malayalam">
        ഉർവതൽ വുസ്ഖ്വ മെഗാ ക്വിസ് മത്സരത്തിൽ നിങ്ങളുടെ പങ്കാളിത്തം രേഖപ്പെടുത്തിക്കഴിഞ്ഞു.
      </p>

      {/* Participant Attempt Info */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 text-left mb-4 sm:mb-5">
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Attempt Details</span>
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Locked Attempt
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-slate-400" /> Candidate Code
            </span>
            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
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

          {result?.submittedAt && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Submitted At
              </span>
              <span className="text-slate-700 font-medium">
                {formatDateTime(result.submittedAt)}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            To prevent unfair advantages, each participant device is restricted to exactly one submission. Multiple attempts are not permitted.
          </p>
        </div>
      </div>

      {/* Option to Show Submitted Answers */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 text-left mb-6">
        <button
          type="button"
          onClick={() => setShowAnswers((prev) => !prev)}
          className="w-full flex items-center justify-between font-bold text-xs text-slate-800 hover:text-slate-900 cursor-pointer"
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

      {/* Retake / Reset Option */}
      {onResetDevice && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 text-center mb-6">
          <p className="text-xs text-slate-700 font-bold mb-1 font-malayalam">
            ഈ ഉപകരണത്തിലെ പഴയ വിവരങ്ങൾ മായ്ച്ച് പുതിയ എൻട്രി നൽകണോ?
          </p>
          <p className="text-[11px] text-slate-400 mb-3">
            If you need to reset this device to take the quiz again or submit fresh details, click below:
          </p>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('നിങ്ങളുടെ ഉപകരണത്തിലെ മുൻപത്തെ സബ്മിഷൻ വിവരങ്ങൾ നീക്കം ചെയ്ത് പുതിയതായി തുടങ്ങണോ?\n\nAre you sure you want to reset this device and start a fresh quiz entry?')) {
                onResetDevice();
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset This Device (പുതിയ എൻട്രി നൽകുക)</span>
          </button>
        </div>
      )}

      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 text-center">
        If you believe this is an error or need assistance, please contact your Rabee Quiz coordinator.
      </div>
    </div>
  );
}

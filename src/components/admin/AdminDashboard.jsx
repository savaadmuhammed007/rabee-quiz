import React from 'react';
import {
  Users,
  CheckCircle,
  Clock,
  Zap,
  FileSpreadsheet,
  Download,
  AlertCircle,
  ArrowUpRight,
  Award,
  ShieldAlert,
  Eye,
  RefreshCw,
  Cloud,
  CloudOff,
} from 'lucide-react';
import {
  exportResultsCSV,
  exportParticipantsCSV,
  formatSecondsToMS,
  getGoogleSheetUrl,
  formatDateTime,
} from '../../utils/storage';

export default function AdminDashboard({
  participants,
  results,
  onNavigateTab,
  onSelectParticipant,
  onSyncCloud,
  isSyncing,
  lastSynced,
}) {
  const totalRegistrations = participants.length;
  const totalSubmissions = results.length;
  const completedQuizzes = results.filter((r) => r.status === 'submitted').length;
  const incompleteAttempts = Math.max(0, totalRegistrations - totalSubmissions);

  const hasSheet = Boolean(getGoogleSheetUrl());

  // Compute fastest completion
  const fastestSeconds = results.length > 0
    ? Math.min(...results.map((r) => r.completionSeconds || 600))
    : null;

  // Compute average completion time
  const avgSeconds = results.length > 0
    ? Math.round(results.reduce((acc, curr) => acc + (curr.completionSeconds || 600), 0) / results.length)
    : null;

  // Compute average score
  const avgScore = results.length > 0
    ? (results.reduce((acc, curr) => acc + (curr.finalScore || 0), 0) / results.length).toFixed(1)
    : null;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Cloud Sync Status Banner */}
      {hasSheet ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-xl bg-white/10 shrink-0 mt-0.5">
              <Cloud className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="text-xs leading-relaxed">
              <div className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                <span>Google Sheets Live Sync Connected</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p className="text-emerald-100/90 mt-0.5">
                Participant registrations and quiz submissions are synced to your Google Sheet. Tap to merge latest submissions.
                {lastSynced && (
                  <span className="block text-[11px] text-emerald-300/80 mt-0.5">
                    Last synced: {formatDateTime(lastSynced)}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onSyncCloud}
            disabled={isSyncing}
            className="py-2 px-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-xs flex items-center gap-2 shrink-0 transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Cloud Submissions'}</span>
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
              <CloudOff className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-xs leading-relaxed">
              <div className="font-bold text-sm text-amber-300 flex items-center gap-1.5">
                <span>Submissions From Other Devices Not Showing?</span>
              </div>
              <p className="text-slate-200/90 mt-0.5">
                Because this app runs in the browser, mobile submissions stay on participants' phones until Google Sheet sync is enabled. Connect your Google Sheet to receive all submissions here live!
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('settings')}
            className="py-2 px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-xs cursor-pointer"
          >
            <span>Connect Google Sheet</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Total Registrations */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Registrations</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
            {totalRegistrations}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1">Total registered</div>
        </div>

        {/* Total Submissions */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Submissions</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">
            {totalSubmissions}
          </div>
          <div className="text-[10px] sm:text-[11px] text-emerald-600 mt-1 font-medium truncate">
            {totalRegistrations > 0 ? `${Math.round((totalSubmissions / totalRegistrations) * 100)}% completed` : 'No attempts'}
          </div>
        </div>

        {/* Fastest Completion */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Fastest Time</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono">
            {fastestSeconds !== null ? formatSecondsToMS(fastestSeconds) : '--:--'}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1">
            {fastestSeconds !== null ? `${fastestSeconds}s completion` : 'Pending'}
          </div>
        </div>

        {/* Average Completion Time */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Average Time</span>
            <Clock className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-teal-700 font-mono">
            {avgSeconds !== null ? formatSecondsToMS(avgSeconds) : '--:--'}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 truncate">
            {avgScore !== null ? `Avg: ${avgScore} pts` : 'Pending'}
          </div>
        </div>
      </div>

      {/* Secondary Metrics & Incomplete Attempts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
            <span>Quiz Attempt Breakdown</span>
            <span className="text-xs font-normal text-slate-400">Total: {totalRegistrations}</span>
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-700 font-medium">Completed & Submitted:</span>
                <span className="font-bold text-slate-800">{completedQuizzes}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{
                    width: `${totalRegistrations > 0 ? (completedQuizzes / totalRegistrations) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-amber-700 font-medium">Incomplete / In-Progress:</span>
                <span className="font-bold text-slate-800">{incompleteAttempts}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{
                    width: `${totalRegistrations > 0 ? (incompleteAttempts / totalRegistrations) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick CSV Export Actions */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              One-Click Data Exports
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Download standard CSV spreadsheets formatted for direct import into Google Sheets or Excel.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => exportResultsCSV()}
              className="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Results CSV</span>
            </button>

            <button
              onClick={() => exportParticipantsCSV()}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Participants</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Submissions Leader preview */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            Top Scoring Submissions (Preview)
          </h3>
          <button
            onClick={() => onNavigateTab('results')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Results</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {results.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No quiz submissions yet. Participants will appear here once they complete the quiz.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-2.5">ID</th>
                  <th className="pb-2.5">Participant</th>
                  <th className="pb-2.5">Place</th>
                  <th className="pb-2.5">Time</th>
                  <th className="pb-2.5 text-center">Correct</th>
                  <th className="pb-2.5 text-center">Speed Bonus</th>
                  <th className="pb-2.5 text-center">Final Score</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...results]
                  .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
                  .slice(0, 5)
                  .map((res) => {
                    const code = res.candidateCode || res.participantId;
                    const matchingParticipant = participants.find(
                      (p) => (p.candidateCode || p.participantId) === code
                    );

                    return (
                      <tr key={res.participantId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 font-mono font-semibold text-slate-700">{res.participantId}</td>
                        <td className="py-2.5 font-bold text-slate-900">{res.name}</td>
                        <td className="py-2.5 text-slate-600">{res.institution || '-'}</td>
                        <td className="py-2.5 font-mono text-slate-700">{res.completionTime}</td>
                        <td className="py-2.5 text-center font-bold text-emerald-800">{res.correctAnswers}/20</td>
                        <td className="py-2.5 text-center font-bold text-teal-700">+{res.bonusMarks}</td>
                        <td className="py-2.5 text-center font-extrabold text-emerald-950 font-mono text-sm">
                          {res.finalScore}
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => onSelectParticipant?.(matchingParticipant, res, 'overview')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

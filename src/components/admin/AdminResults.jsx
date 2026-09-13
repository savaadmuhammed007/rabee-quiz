import React, { useState, useMemo } from 'react';
import { Search, Download, Award, ArrowUpDown, Eye, Clock, Zap, CheckCircle2, MapPin, ListChecks, Trash2, AlertTriangle } from 'lucide-react';
import { exportResultsCSV, formatDateTime } from '../../utils/storage';

export default function AdminResults({ results, participants, onSelectParticipant, onDeleteParticipant }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('finalScore');
  const [sortDirection, setSortDirection] = useState('desc');
  const [resultToDelete, setResultToDelete] = useState(null);

  // Filter and sort results
  const filteredResults = useMemo(() => {
    return results
      .filter((r) => {
        const code = r.candidateCode || r.participantId || '';
        const name = r.name || '';
        const place = r.place || r.institution || '';
        const mobile = r.mobileNumber || r.phone || '';

        return (
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          place.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mobile.includes(searchTerm)
        );
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (sortField === 'submittedAt') {
          valA = new Date(valA || 0).getTime();
          valB = new Date(valB || 0).getTime();
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [results, searchTerm, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'finalScore' || field === 'correctAnswers' ? 'desc' : 'asc');
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Search & CSV Action Bar */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search results by name, candidate code, or place..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-base sm:text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
          />
        </div>

        <button
          onClick={() => exportResultsCSV()}
          className="py-2 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Results CSV</span>
        </button>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            Evaluation Scores & Rankings ({filteredResults.length})
          </h3>
          <span className="text-[10px] sm:text-[11px] text-slate-400 hidden xs:inline">
            Click table columns to sort
          </span>
        </div>

        {/* Mobile Horizontal Scroll Indicator */}
        <div className="sm:hidden px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 text-center">
          ↔ Swipe table horizontally to see all columns
        </div>

        {filteredResults.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No quiz results submitted yet. Results will appear here automatically upon submission.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th
                    onClick={() => handleSort('candidateCode')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-800"
                  >
                    <div className="flex items-center gap-1">
                      <span>Candidate Code</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('name')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-800"
                  >
                    <div className="flex items-center gap-1">
                      <span>Name</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('place')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-800"
                  >
                    <div className="flex items-center gap-1">
                      <span>Place</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('completionSeconds')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-800 text-center"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Time</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('correctAnswers')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-800 text-center"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Correct</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('bonusMarks')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-800 text-center"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Speed Bonus</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('finalScore')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-800 text-center"
                  >
                    <div className="flex items-center justify-center gap-1 font-bold text-emerald-950">
                      <span>Final Score</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('submittedAt')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-800"
                  >
                    <div className="flex items-center gap-1">
                      <span>Submission Time</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.map((r, index) => {
                  const code = r.candidateCode || r.participantId;
                  const matchingParticipant = participants.find((p) => (p.candidateCode || p.participantId) === code);
                  const place = r.place || r.institution;

                  return (
                    <tr key={code} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {code}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{r.name}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {place || '-'}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-700">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 font-semibold">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {r.completionTime}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-emerald-800 text-sm">
                          {r.correctAnswers}
                        </span>
                        <span className="text-[10px] text-slate-400">/20</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-0.5 font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full text-xs">
                          <Zap className="w-3 h-3" /> +{r.bonusMarks}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-extrabold text-base text-emerald-950 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-200">
                          {r.finalScore}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {formatDateTime(r.submittedAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectParticipant(matchingParticipant, r, 'answers')}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-[11px] font-semibold transition-colors cursor-pointer"
                            title="View all 20 submitted answers"
                          >
                            <ListChecks className="w-3 h-3" />
                            <span>Answers</span>
                          </button>
                          <button
                            onClick={() => onSelectParticipant(matchingParticipant, r, 'overview')}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-semibold transition-colors cursor-pointer"
                            title="View participant dossier"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Dossier</span>
                          </button>
                          <button
                            onClick={() => setResultToDelete(r)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-semibold transition-colors cursor-pointer"
                            title="Delete result & participant"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span className="hidden xs:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {resultToDelete && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setResultToDelete(null);
          }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">Delete Quiz Result?</h4>
                <p className="text-xs text-slate-500">Permanent data removal</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete candidate{' '}
              <strong className="text-slate-900 font-mono">
                {resultToDelete.candidateCode || resultToDelete.participantId}
              </strong>{' '}
              (<span className="font-malayalam font-bold">{resultToDelete.name}</span>)? Their evaluation scores ({resultToDelete.finalScore} pts) and submission records will be deleted.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResultToDelete(null)}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const code = resultToDelete.candidateCode || resultToDelete.participantId;
                  onDeleteParticipant?.(code);
                  setResultToDelete(null);
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
  );
}

import React, { useState } from 'react';
import { FileSpreadsheet, RotateCcw, Trash2, Database, KeyRound, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles } from 'lucide-react';
import { getSpeedRules, saveSpeedRules, getAdminPassword, setAdminPassword, seedSampleData, resetCurrentAttempt, clearAllLocalData } from '../../utils/storage';

export default function AdminSettings({ onDataRefreshed, onResetCurrentAttempt }) {
  const [speedRules, setSpeedRules] = useState(() => getSpeedRules());
  const [adminPassword, setAdminPwd] = useState(() => getAdminPassword());
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const showNotification = (msg, type = 'success') => {
    setStatusMessage({ text: msg, type });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!newPasswordInput.trim()) {
      showNotification('Password cannot be empty', 'error');
      return;
    }
    if (newPasswordInput.trim().length < 4) {
      showNotification('Password must be at least 4 characters', 'error');
      return;
    }

    setAdminPassword(newPasswordInput);
    setAdminPwd(newPasswordInput);
    setNewPasswordInput('');
    showNotification('Admin gate password updated successfully');
  };

  const handleSeedDemoData = () => {
    const res = seedSampleData();
    onDataRefreshed();
    showNotification(`Generated ${res.participantsCount} sample participants with ${res.resultsCount} submitted results.`);
  };

  const handleResetAttempt = () => {
    resetCurrentAttempt();
    onResetCurrentAttempt();
    showNotification('Current quiz attempt cleared! You can now take the quiz again on this browser.');
  };

  const handleConfirmClearAll = () => {
    clearAllLocalData();
    setShowClearConfirm(false);
    onDataRefreshed();
    onResetCurrentAttempt();
    showNotification('All local quiz data has been completely erased.', 'warning');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            statusMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : statusMessage.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* 1. Google Sheets CSV Backup Workflow */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
            <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Google Sheets Workflow Guide
            </h3>
            <p className="text-xs text-slate-500">
              How to manage results permanently without a backend database
            </p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70 text-xs text-slate-600 space-y-2.5">
          <p className="font-semibold text-slate-800">
            Because this is a 100% frontend-only application, there are no secret Google API keys or cloud servers:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 pl-1">
            <li>Open the <span className="font-semibold text-slate-800">Results</span> tab in this Admin Panel.</li>
            <li>Click the <span className="font-semibold text-emerald-700">"Export Results CSV"</span> button to download the spreadsheet file.</li>
            <li>Open <a href="https://sheets.google.com" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-semibold">Google Sheets</a> in a new tab.</li>
            <li>Go to <span className="font-semibold text-slate-800">File &gt; Import &gt; Upload</span> and choose your downloaded CSV file.</li>
            <li>Select <span className="font-semibold text-slate-800">"Replace current sheet"</span> or <span className="font-semibold text-slate-800">"Create new sheet"</span> to share and archive results with your team.</li>
          </ol>
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium mt-2">
            💡 Frontend-only mode: Export the results as CSV and import them into Google Sheets for backup and certificate generation.
          </div>
        </div>
      </div>

      {/* 2. Speed Bonus Configuration */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Speed Bonus Configuration
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Participants who complete the 20 questions faster earn extra bonus marks added to their correct answer base score.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {speedRules.map((rule, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-800">{rule.label}</div>
                <div className="text-[11px] text-slate-400">Within {rule.maxSeconds} seconds</div>
              </div>
              <span className="font-mono font-bold text-sm text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg">
                +{rule.bonus} pts
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Demo & Testing Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Testing & Demonstration Utilities
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Useful buttons to simulate participants or re-test the quiz experience on this browser.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Seed Demo Data */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-bold text-xs text-slate-800 mb-1">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Seed Sample Data</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Adds 7 sample participants with diverse completion times, speed bonuses, and evaluation scores for demonstration.
              </p>
            </div>
            <button
              onClick={handleSeedDemoData}
              className="w-full py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Generate 7 Sample Participants
            </button>
          </div>

          {/* Reset Current Attempt */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-bold text-xs text-slate-800 mb-1">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span>Reset Current Device Attempt</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Clears your current participant lock and completed quiz state so you can test the quiz from the beginning.
              </p>
            </div>
            <button
              onClick={handleResetAttempt}
              className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Reset Attempt & Allow Retake
            </button>
          </div>
        </div>
      </div>

      {/* 4. Admin Gate Password */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Admin Gate Password
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Current password: <code className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">{adminPassword}</code>
        </p>

        <form onSubmit={handleUpdatePassword} className="flex gap-2 max-w-sm">
          <input
            type="text"
            value={newPasswordInput}
            onChange={(e) => setNewPasswordInput(e.target.value)}
            placeholder="New admin password"
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer"
          >
            Update
          </button>
        </form>
      </div>

      {/* 5. Danger Zone: Clear All Local Data */}
      <div className="bg-rose-50/50 rounded-2xl p-6 border border-rose-200">
        <div className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-1">
          <AlertTriangle className="w-4 h-4" />
          <span>Danger Zone: Clear All Data</span>
        </div>
        <p className="text-xs text-rose-700 mb-4">
          Permanently delete all registered participants, quiz attempts, and results from this browser's localStorage.
        </p>

        <button
          onClick={() => setShowClearConfirm(true)}
          className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
        >
          Clear All Local Data
        </button>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-1">
              Erase All Local Data?
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              This action cannot be undone. All participants and results stored in this browser will be permanently deleted.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAll}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
              >
                Yes, Erase Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

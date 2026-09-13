import React, { useState } from 'react';
import {
  FileSpreadsheet,
  RotateCcw,
  Trash2,
  Database,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Cloud,
  CloudOff,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Code,
  Share2,
} from 'lucide-react';
import {
  getSpeedRules,
  saveSpeedRules,
  getAdminPassword,
  setAdminPassword,
  seedSampleData,
  resetCurrentAttempt,
  clearAllLocalData,
  bumpQuizSession,
  resetCloudGoogleSheet,
  getGoogleSheetUrl,
  setGoogleSheetUrl,
  testGoogleSheetConnection,
  GOOGLE_APPS_SCRIPT_TEMPLATE,
  formatDateTime,
} from '../../utils/storage';

export default function AdminSettings({
  onDataRefreshed,
  onResetCurrentAttempt,
  onSyncCloud,
  isSyncing,
  lastSynced,
}) {
  const [speedRules, setSpeedRules] = useState(() => getSpeedRules());
  const [adminPassword, setAdminPwd] = useState(() => getAdminPassword());
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [copiedResetLink, setCopiedResetLink] = useState(false);

  // Google Sheets state
  const [sheetUrlInput, setSheetUrlInput] = useState(() => getGoogleSheetUrl());
  const [savedSheetUrl, setSavedSheetUrl] = useState(() => getGoogleSheetUrl());
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [showScriptViewer, setShowScriptViewer] = useState(false);

  const showNotification = (msg, type = 'success') => {
    setStatusMessage({ text: msg, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleSaveSheetUrl = (e) => {
    e?.preventDefault();
    const cleanUrl = sheetUrlInput.trim();
    if (cleanUrl && !cleanUrl.startsWith('https://script.google.com/')) {
      showNotification('Google Sheet Web App URL should start with https://script.google.com/...', 'warning');
    }
    setGoogleSheetUrl(cleanUrl);
    setSavedSheetUrl(cleanUrl);
    setTestStatus(null);
    showNotification(cleanUrl ? 'Google Sheet Web App URL saved successfully!' : 'Google Sheet URL removed.');
    onDataRefreshed?.();
  };

  const handleTestConnection = async () => {
    const targetUrl = sheetUrlInput.trim();
    if (!targetUrl) {
      showNotification('Please enter a Google Sheet Web App URL first.', 'error');
      return;
    }
    setIsTesting(true);
    setTestStatus(null);
    try {
      setGoogleSheetUrl(targetUrl);
      setSavedSheetUrl(targetUrl);
      const res = await testGoogleSheetConnection();
      if (res.success) {
        setTestStatus({
          type: 'success',
          message: `Connected successfully! Found ${res.participantsCount} participants and ${res.resultsCount} submissions in sheet.`,
        });
        showNotification('Connection test passed! Syncing data now...');
        onSyncCloud?.();
      } else {
        setTestStatus({
          type: 'error',
          message: `Connection failed: ${res.error || 'Check that "Who has access" is set to "Anyone"'}`,
        });
      }
    } catch (err) {
      setTestStatus({
        type: 'error',
        message: `Connection error: ${err.message}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setCopiedScript(true);
    showNotification('Google Apps Script code copied to clipboard! Paste into Extensions > Apps Script.');
    setTimeout(() => setCopiedScript(false), 3000);
  };

  const handleCopyShareLink = () => {
    const origin = window.location.origin;
    const path = window.location.pathname;
    const shareUrl = `${origin}${path}?sheet=${encodeURIComponent(savedSheetUrl)}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedShareLink(true);
    showNotification('Sharable quiz link copied! Participants opening this link will auto-sync to your Google Sheet.');
    setTimeout(() => setCopiedShareLink(false), 3500);
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

  const getResetQuizLink = () => {
    try {
      const url = new URL(window.location.href);
      const basePath = url.origin + url.pathname.replace(/\/admin\/?$/i, '') || '/';
      return `${basePath}?reset=1`;
    } catch {
      return `${window.location.origin}/?reset=1`;
    }
  };

  const handleCopyResetLink = () => {
    const link = getResetQuizLink();
    try {
      navigator.clipboard.writeText(link);
      setCopiedResetLink(true);
      showNotification('Retake / Reset link copied! Anyone visiting this link will have their device reset.');
      setTimeout(() => setCopiedResetLink(false), 2500);
    } catch {
      showNotification('Failed to copy to clipboard', 'error');
    }
  };

  const handleConfirmClearAll = async () => {
    setIsClearingAll(true);
    try {
      // 1. Wipe local browser quiz records
      clearAllLocalData();

      // 2. Bump session ID so any other connected devices reset automatically
      bumpQuizSession();

      // 3. Dispatch cloud reset to Google Sheet
      const sheetUrl = getGoogleSheetUrl();
      if (sheetUrl && sheetUrl.includes('/exec')) {
        await resetCloudGoogleSheet(sheetUrl);
      }

      setShowClearConfirm(false);
      onDataRefreshed();
      onResetCurrentAttempt();
      showNotification('All quiz data has been erased (Local storage wiped + Google Sheet reset + Device sessions cleared).', 'warning');
    } catch (err) {
      setShowClearConfirm(false);
      onDataRefreshed();
      onResetCurrentAttempt();
      showNotification('Cleared local data, but cloud reset returned: ' + err.message, 'warning');
    } finally {
      setIsClearingAll(false);
    }
  };

  const isConfigured = Boolean(savedSheetUrl);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 shadow-xs transition-all ${
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

      {/* 1. Google Sheets Live Sync Configuration */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {isConfigured ? <Cloud className="w-5 h-5" /> : <CloudOff className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Google Sheets Live Cloud Sync
                </h3>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  isConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {isConfigured ? '● Active' : 'Not Connected'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Collect quiz submissions from all participant phones in real-time without a paid server
              </p>
            </div>
          </div>

          {/* Quick Sync Button */}
          {isConfigured && (
            <button
              onClick={onSyncCloud}
              disabled={isSyncing}
              className="py-1.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Cloud Data Now'}</span>
            </button>
          )}
        </div>

        {/* Sync Status / Info Card */}
        {isConfigured ? (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold text-emerald-950">✓ Connected Web App: </span>
              <span className="font-mono text-[11px] text-emerald-800 truncate block sm:inline">
                {savedSheetUrl.length > 55 ? `${savedSheetUrl.slice(0, 55)}...` : savedSheetUrl}
              </span>
              {lastSynced && (
                <div className="text-[11px] text-emerald-700/80 mt-0.5">
                  Last synchronized: {formatDateTime(lastSynced)}
                </div>
              )}
            </div>

            {/* Copy Sharable Link */}
            <button
              onClick={handleCopyShareLink}
              className="py-1.5 px-3 rounded-lg bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
            >
              {copiedShareLink ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedShareLink ? 'Link Copied!' : 'Copy Auto-Sync Quiz Link'}</span>
            </button>
          </div>
        ) : (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">⚠️ Why are submissions from other phones not showing?</span>
            <p className="text-amber-800/90 mt-1">
              Because browsers cannot share local storage across different devices, answers taken on participant mobile phones stay on their phones.
              Connecting a free Google Sheet allows all phones to submit their candidate code, score, speed bonus, completion time, and Q1–Q20 answers directly to your spreadsheet!
            </p>
          </div>
        )}

        {/* Web App URL Form */}
        <form onSubmit={handleSaveSheetUrl} className="space-y-3 mb-6">
          <label className="block text-xs font-bold text-slate-800">
            Google Apps Script Web App URL (or Google Sheet Link)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={sheetUrlInput}
              onChange={(e) => {
                setSheetUrlInput(e.target.value);
                setTestStatus(null);
              }}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-emerald-500 bg-slate-50/50"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Save URL
              </button>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !sheetUrlInput.trim()}
                className="py-2.5 px-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
              </button>
            </div>
          </div>

          {/* Live URL Helper / Format Detection */}
          {sheetUrlInput.trim() && (
            <div>
              {sheetUrlInput.includes('docs.google.com/spreadsheets') && (
                <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-[11px] text-teal-900">
                  <span className="font-bold">✓ Google Spreadsheet link detected: </span>
                  Live evaluator results will be read directly via Google Sheets API (make sure sheet sharing is set to "Anyone with the link can view").
                  For participant phones to submit their answers, also deploy the Apps Script Web App below.
                </div>
              )}
              {(sheetUrlInput.endsWith('/dev') || sheetUrlInput.includes('/dev?')) && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-900">
                  <span className="font-bold">⚠️ /dev URL detected: </span>
                  Test URLs ending in <code>/dev</code> require Google login and will cause "Failed to fetch". In Apps Script, click Deploy &gt; New deployment &gt; select "Web app" &gt; set "Who has access" to "Anyone", and copy the <code>/exec</code> URL.
                </div>
              )}
              {(sheetUrlInput.includes('home/projects') || sheetUrlInput.includes('/edit')) && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                  <span className="font-bold">⚠️ Apps Script Editor link detected: </span>
                  This is your code editing window link. Click the blue <strong>Deploy &gt; New deployment</strong> button (top right), select "Web app", set access to "Anyone", and copy the Web App URL ending in <code>/exec</code>.
                </div>
              )}
              {sheetUrlInput.includes('script.google.com/macros/s/') && sheetUrlInput.includes('/exec') && (
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 font-medium">
                  ✓ Valid Google Apps Script Web App URL format.
                </div>
              )}
            </div>
          )}

          {/* Test Status feedback */}
          {testStatus && (
            <div>
              {testStatus.type === 'error' ? (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-2.5">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-rose-900">Connection Failed: Google blocked access ("Failed to fetch")</div>
                      <div className="text-[11px] text-rose-800/90 mt-0.5">{testStatus.message}</div>
                    </div>
                  </div>

                  <div className="bg-white/90 p-3 rounded-lg border border-rose-200 text-slate-800 space-y-1.5">
                    <div className="font-bold text-rose-900 text-xs">⚡ How to fix in 30 seconds:</div>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-700 pl-1">
                      <li>In your Google Sheet, click <strong className="text-slate-900">Extensions &gt; Apps Script</strong>.</li>
                      <li>Click the blue <strong className="text-slate-900">Deploy</strong> button (top right) &gt; select <strong className="text-slate-900">Manage deployments</strong>.</li>
                      <li>Click the <strong className="text-slate-900">pencil (Edit) icon</strong> on your active deployment.</li>
                      <li>Change <strong className="text-slate-900">Who has access</strong> from <em>"Only myself"</em> to <strong className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300">"Anyone"</strong>.</li>
                      <li>Under Version, click the dropdown and choose <strong className="text-slate-900">"New version"</strong>.</li>
                      <li>Click <strong className="text-slate-900">Deploy</strong>, then re-test connection here!</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{testStatus.message}</span>
                </div>
              )}
            </div>
          )}
        </form>

        {/* 5-Step Setup Instructions */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <span>5-Minute Google Sheets Setup Instructions</span>
            </h4>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleCopyScript}
                className="py-1.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Code Copied!' : 'Copy Apps Script Code'}</span>
              </button>

              <button
                onClick={() => setShowScriptViewer(!showScriptViewer)}
                className="py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Code className="w-3.5 h-3.5 text-slate-500" />
                <span>{showScriptViewer ? 'Hide Code' : 'View Code'}</span>
              </button>
            </div>
          </div>

          {/* Code Viewer */}
          {showScriptViewer && (
            <div className="mb-4">
              <div className="p-3 bg-slate-900 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-56 scrollbar-thin border border-slate-800">
                <pre>{GOOGLE_APPS_SCRIPT_TEMPLATE}</pre>
              </div>
            </div>
          )}

          <ol className="space-y-3 text-xs text-slate-600">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
              <div>
                <span>Create a new blank spreadsheet at </span>
                <a
                  href="https://sheets.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 font-bold underline inline-flex items-center gap-0.5"
                >
                  sheets.google.com <ExternalLink className="w-3 h-3 inline" />
                </a>
                <span> and name it <strong className="text-slate-800">"ഉർവതൽ വുസ്ഖ്വ മെഗാ ക്വിസ്"</strong>.</span>
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
              <div>
                <span>In Google Sheets, click </span>
                <strong className="text-slate-800">Extensions &gt; Apps Script</strong>
                <span> in the top menu bar.</span>
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
              <div>
                <span>Delete everything inside <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-800">Code.gs</code>, click </span>
                <button
                  onClick={handleCopyScript}
                  className="font-bold text-emerald-700 underline cursor-pointer hover:text-emerald-900"
                >
                  "Copy Apps Script Code"
                </button>
                <span>, paste it into the editor, and click the floppy disk <strong className="text-slate-800">Save</strong> icon (Ctrl+S).</span>
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">4</span>
              <div>
                <span>Click the blue <strong className="text-slate-800">Deploy &gt; New deployment</strong> button (top right):</span>
                <ul className="list-disc list-inside space-y-1 mt-1 pl-2 text-slate-600">
                  <li>Select type: <strong className="text-slate-800">Web app</strong> (gear icon)</li>
                  <li>Execute as: <strong className="text-slate-800">Me (your Google email)</strong></li>
                  <li>Who has access: <strong className="text-emerald-700 font-bold">Anyone</strong> <em>(⚠️ Critical: Must be set to "Anyone" so participant devices can submit answers)</em></li>
                  <li>Click <strong className="text-slate-800">Deploy</strong> and authorize Google access.</li>
                </ul>
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">5</span>
              <div>
                <span>Copy the generated <strong className="text-slate-800">Web app URL</strong> (ends with <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">/exec</code>), paste it into the box above, and click <strong className="text-slate-800">Save URL</strong>.</span>
              </div>
            </li>
          </ol>
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

      {/* 5. Danger Zone: Reset All Quiz Data (Cloud & Devices) */}
      <div className="bg-rose-50/50 rounded-2xl p-6 border border-rose-200">
        <div className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-1">
          <AlertTriangle className="w-4 h-4" />
          <span>Danger Zone: Reset All Quiz Data (Cloud & All Devices)</span>
        </div>
        <p className="text-xs text-rose-700 mb-4">
          Permanently erase all registered participants and submitted results from this browser, wipe rows in Google Sheets, and bump the session ID so any participant devices that previously submitted can immediately start fresh.
        </p>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowClearConfirm(true)}
            className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset All Quiz Data Everywhere</span>
          </button>

          <button
            type="button"
            onClick={handleCopyResetLink}
            className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-2"
          >
            {copiedResetLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedResetLink ? 'Reset Link Copied!' : 'Copy Retake / Reset Quiz Link'}</span>
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-1">
              Reset All Quiz Data?
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              This will erase all participants and results locally, wipe the rows in your connected Google Sheet, and automatically reset any participant phones so they can register and take the quiz anew.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={isClearingAll}
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isClearingAll}
                onClick={handleConfirmClearAll}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isClearingAll && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isClearingAll ? 'Erasing...' : 'Yes, Reset Everything'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

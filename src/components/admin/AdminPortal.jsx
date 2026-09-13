import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Award,
  Settings,
  LogOut,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Cloud,
} from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import AdminParticipants from './AdminParticipants';
import AdminResults from './AdminResults';
import AdminSettings from './AdminSettings';
import ParticipantDetailModal from './ParticipantDetailModal';
import {
  setAdminAuth,
  exportResultsCSV,
  deleteParticipant,
  syncFromGoogleSheet,
  getGoogleSheetUrl,
  getLastSyncTime,
} from '../../utils/storage';

export default function AdminPortal({
  participants,
  results,
  onRefreshData,
  onExitAdmin,
  onResetAttempt,
}) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);
  const [lastSynced, setLastSynced] = useState(() => getLastSyncTime());

  // Trigger auto-sync on mount if a Google Sheet URL is configured
  useEffect(() => {
    const sheetUrl = getGoogleSheetUrl();
    if (sheetUrl) {
      handleSyncCloud(true); // silent initial sync
    }
  }, []);

  const handleSyncCloud = async (silent = false) => {
    const sheetUrl = getGoogleSheetUrl();
    if (!sheetUrl) {
      if (!silent) {
        setSyncMessage({
          type: 'warning',
          text: 'Please configure your Google Sheet Web App URL in Settings first.',
        });
        setTimeout(() => setSyncMessage(null), 4500);
      }
      return;
    }

    setIsSyncing(true);
    try {
      const res = await syncFromGoogleSheet();
      if (res.success) {
        setLastSynced(res.lastSyncedAt);
        onRefreshData?.();
        if (!silent) {
          setSyncMessage({
            type: 'success',
            text: `Synced with Google Sheet! Merged ${res.participantsCount} participants and ${res.resultsCount} quiz submissions.`,
          });
          setTimeout(() => setSyncMessage(null), 4500);
        }
      } else {
        if (!silent) {
          setSyncMessage({
            type: 'error',
            text: res.error || 'Failed to sync with Google Sheet.',
          });
          setTimeout(() => setSyncMessage(null), 5500);
        }
      }
    } catch (err) {
      if (!silent) {
        setSyncMessage({
          type: 'error',
          text: err.message || 'Error connecting to Google Sheet.',
        });
        setTimeout(() => setSyncMessage(null), 5500);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    setAdminAuth(false);
    onExitAdmin();
  };

  const handleSelectParticipant = (participant, result, initialTab = 'overview') => {
    setSelectedDossier({ participant, result, initialTab });
  };

  const handleDeleteParticipant = (candidateCode) => {
    deleteParticipant(candidateCode);
    if (
      selectedDossier &&
      ((selectedDossier.participant?.candidateCode || selectedDossier.participant?.participantId) === candidateCode ||
       (selectedDossier.result?.candidateCode || selectedDossier.result?.participantId) === candidateCode)
    ) {
      setSelectedDossier(null);
    }
    onRefreshData?.();
  };

  const hasSheetConfigured = Boolean(getGoogleSheetUrl());

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'participants', label: `Participants (${participants.length})`, icon: Users },
    { id: 'results', label: `Results (${results.length})`, icon: Award },
    { id: 'settings', label: 'Settings & Cloud Sync', icon: Settings },
  ];

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 animate-fadeIn">
      {/* Sync Status Toast Banner */}
      {syncMessage && (
        <div
          className={`mb-4 p-3 sm:p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2.5 transition-all shadow-xs ${
            syncMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : syncMessage.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {syncMessage.type === 'error' || syncMessage.type === 'warning' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{syncMessage.text}</span>
          </div>
          <button
            onClick={() => setSyncMessage(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer font-bold px-1.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Admin Top Header */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-emerald-100 shadow-xs mb-5 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <img src="/logo.png" alt="Ma'din Logo" className="h-9 sm:h-10 w-auto object-contain shrink-0" />
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 font-serif">ഉർവതൽ വുസ്ഖ്വ | Evaluator Portal</h1>
              <span className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded shrink-0 flex items-center gap-1 ${
                hasSheetConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {hasSheetConfigured ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span>Live Sync</span>
                  </>
                ) : (
                  <span>Local Mode</span>
                )}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Evaluator controls, live Google Sheet synchronization, and participant tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          {/* Cloud Sync Button */}
          <button
            onClick={() => handleSyncCloud(false)}
            disabled={isSyncing}
            title={hasSheetConfigured ? 'Sync latest submissions from Google Sheet' : 'Configure Google Sheet URL in Settings'}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              hasSheetConfigured
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : hasSheetConfigured ? 'Sync Sheet' : 'Set Sheet URL'}</span>
          </button>

          <button
            onClick={() => exportResultsCSV()}
            className="py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Results CSV</span>
            <span className="sm:hidden">Export CSV</span>
          </button>

          <button
            onClick={handleLogout}
            className="py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
            <span>Exit</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 border-b border-slate-200/80 scrollbar-none">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab View */}
      {activeTab === 'dashboard' && (
        <AdminDashboard
          participants={participants}
          results={results}
          onNavigateTab={setActiveTab}
          onSelectParticipant={handleSelectParticipant}
          onSyncCloud={() => handleSyncCloud(false)}
          isSyncing={isSyncing}
          lastSynced={lastSynced}
        />
      )}

      {activeTab === 'participants' && (
        <AdminParticipants
          participants={participants}
          results={results}
          onSelectParticipant={handleSelectParticipant}
          onDeleteParticipant={handleDeleteParticipant}
        />
      )}

      {activeTab === 'results' && (
        <AdminResults
          results={results}
          participants={participants}
          onSelectParticipant={handleSelectParticipant}
          onDeleteParticipant={handleDeleteParticipant}
        />
      )}

      {activeTab === 'settings' && (
        <AdminSettings
          onDataRefreshed={onRefreshData}
          onResetCurrentAttempt={onResetAttempt}
          onSyncCloud={() => handleSyncCloud(false)}
          isSyncing={isSyncing}
          lastSynced={lastSynced}
        />
      )}

      {/* Dossier Modal */}
      {selectedDossier && (
        <ParticipantDetailModal
          participant={selectedDossier.participant}
          result={selectedDossier.result}
          initialTab={selectedDossier.initialTab}
          onClose={() => setSelectedDossier(null)}
          onDeleteParticipant={handleDeleteParticipant}
        />
      )}
    </div>
  );
}

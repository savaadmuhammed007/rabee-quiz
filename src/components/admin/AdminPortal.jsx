import React, { useState } from 'react';
import { LayoutDashboard, Users, Award, Settings, LogOut, ArrowLeft, ShieldCheck, Download } from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import AdminParticipants from './AdminParticipants';
import AdminResults from './AdminResults';
import AdminSettings from './AdminSettings';
import ParticipantDetailModal from './ParticipantDetailModal';
import { setAdminAuth, exportResultsCSV, deleteParticipant } from '../../utils/storage';

export default function AdminPortal({
  participants,
  results,
  onRefreshData,
  onExitAdmin,
  onResetAttempt,
}) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDossier, setSelectedDossier] = useState(null);

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

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'participants', label: `Participants (${participants.length})`, icon: Users },
    { id: 'results', label: `Results (${results.length})`, icon: Award },
    { id: 'settings', label: 'Settings & Data', icon: Settings },
  ];

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 animate-fadeIn">
      {/* Admin Top Header */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-emerald-100 shadow-xs mb-5 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <img src="/logo.png" alt="Ma'din Logo" className="h-9 sm:h-10 w-auto object-contain shrink-0" />
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 font-serif">ഉർവതൽ വുസ്ഖ്വ | Evaluator Portal</h1>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                Local Admin
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Evaluator controls, participant tracking, and Google Sheets CSV export
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
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
            <span>Exit Admin</span>
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

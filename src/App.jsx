import React, { useState, useEffect, useCallback } from 'react';
import { Lock } from 'lucide-react';
import Header from './components/Header';
import Welcome from './components/Welcome';
import Registration from './components/Registration';
import Instructions from './components/Instructions';
import Quiz from './components/Quiz';
import Submitted from './components/Submitted';
import AlreadySubmitted from './components/AlreadySubmitted';
import AdminLogin from './components/admin/AdminLogin';
import AdminPortal from './components/admin/AdminPortal';

import {
  getParticipant,
  getQuizState,
  getQuizResult,
  isQuizCompleted,
  startQuizSession,
  submitQuizAttempt,
  getRemainingTime,
  getAllParticipants,
  getAllResults,
  checkAdminAuth,
  setGoogleSheetUrl,
  resetCurrentAttempt,
  checkAndEnforceQuizSession,
  isHardDeadlinePassed,
  STORAGE_KEYS,
} from './utils/storage';

export default function App() {
  // Current view state: 'welcome' | 'registration' | 'instructions' | 'quiz' | 'submitted' | 'already_submitted' | 'admin_login' | 'admin_portal'
  const [currentView, setCurrentView] = useState('welcome');
  const [participant, setParticipant] = useState(null);
  const [quizState, setQuizState] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [allParticipants, setAllParticipants] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Initialize and load saved storage state on mount
  const refreshStorageData = useCallback(() => {
    const p = getParticipant();
    const qState = getQuizState();
    const qResult = getQuizResult();
    const isCompleted = isQuizCompleted();
    const participantsList = getAllParticipants();
    const resultsList = getAllResults();
    const isAuthed = checkAdminAuth();

    setParticipant(p);
    setQuizState(qState);
    setQuizResult(qResult);
    setAllParticipants(participantsList);
    setAllResults(resultsList);
    setIsAdminAuthenticated(isAuthed);

    return { p, qState, qResult, isCompleted, isAuthed };
  }, []);

  // Resilient helper to check if current browser URL points to admin page on any host
  const isAdminURL = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    return (
      path.endsWith('/admin') ||
      path.endsWith('/admin/') ||
      path.includes('/admin') ||
      hash.includes('admin') ||
      search.includes('admin')
    );
  };

  useEffect(() => {
    // 1. Check if URL requests immediate device reset (?reset=1, ?clear=1, ?retake=1)
    try {
      const params = new URLSearchParams(window.location.search);
      const wantsReset = params.has('reset') || params.has('clear') || params.has('retake');

      if (wantsReset) {
        resetCurrentAttempt();
        localStorage.removeItem(STORAGE_KEYS.ALL_PARTICIPANTS);
        localStorage.removeItem(STORAGE_KEYS.ALL_RESULTS);
        try {
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete('reset');
          cleanUrl.searchParams.delete('clear');
          cleanUrl.searchParams.delete('retake');
          window.history.replaceState(null, '', cleanUrl.pathname + (cleanUrl.search ? cleanUrl.search : '') + cleanUrl.hash);
        } catch {}
      } else {
        // 2. Enforce active quiz session version across all devices
        // (Automatically resets devices that took tests in older sessions)
        checkAndEnforceQuizSession();
      }

      // 3. Check if URL query contains sheet configuration (e.g. ?sheet=https://script.google.com/...)
      const sheetParam = params.get('sheet') || params.get('sheetUrl');
      if (sheetParam && sheetParam.startsWith('http')) {
        setGoogleSheetUrl(sheetParam);
      }
    } catch {
      // ignore
    }

    const handleRouteSync = () => {
      const { p, qState, qResult, isCompleted, isAuthed } = refreshStorageData();

      // Check if URL requests separate admin page
      if (isAdminURL()) {
        if (isAuthed) {
          setCurrentView('admin_portal');
        } else {
          setCurrentView('admin_login');
        }
        return;
      }

      // Main Quiz Participant views
      if (isCompleted) {
        setCurrentView('already_submitted');
      } else if (qState && qState.startedAt) {
        const remaining = getRemainingTime(qState.startedAt);
        if (remaining <= 0) {
          // Expired while offline or refreshed at zero
          const finalResult = submitQuizAttempt('timeout');
          setQuizResult(finalResult);
          setCurrentView('submitted');
        } else {
          // In-progress quiz attempt
          setCurrentView('quiz');
        }
      } else if (p && p.participantId) {
        // Registered participant awaiting instructions/start
        setCurrentView('instructions');
      } else {
        setCurrentView('welcome');
      }
    };

    handleRouteSync();

    window.addEventListener('popstate', handleRouteSync);
    window.addEventListener('hashchange', handleRouteSync);

    // Global deadline monitoring interval:
    // If the clock reaches 5:11 PM and there is an unsubmitted active quiz, auto-submit immediately!
    const deadlineInterval = setInterval(() => {
      const isCompleted = isQuizCompleted();
      const qState = getQuizState();
      if (!isCompleted && qState?.startedAt) {
        const remaining = getRemainingTime(qState.startedAt);
        if (remaining <= 0) {
          const finalResult = submitQuizAttempt('timeout');
          setQuizResult(finalResult);
          setAllResults(getAllResults());
          setAllParticipants(getAllParticipants());
          setCurrentView('submitted');
        }
      }
    }, 1000);

    return () => {
      window.removeEventListener('popstate', handleRouteSync);
      window.removeEventListener('hashchange', handleRouteSync);
      clearInterval(deadlineInterval);
    };
  }, [refreshStorageData]);

  // Handle participant registration
  const handleRegistrationComplete = (savedParticipant) => {
    setParticipant(savedParticipant);
    setAllParticipants(getAllParticipants());
    setCurrentView('instructions');
  };

  // Handle Start Quiz click (10-minute timer begins here)
  const handleStartQuiz = () => {
    if (isHardDeadlinePassed()) {
      alert('The quiz entry period has ended at 5:10 PM. No new attempts can be started.');
      return;
    }
    const newSession = startQuizSession();
    setQuizState(newSession);
    setCurrentView('quiz');
  };

  // Handle Manual Submission
  const handleManualSubmit = (answers) => {
    const result = submitQuizAttempt('manual');
    setQuizResult(result);
    setAllResults(getAllResults());
    setAllParticipants(getAllParticipants());
    setCurrentView('submitted');
  };

  // Handle Automatic Submission on Timeout (remaining <= 0)
  const handleAutoSubmit = () => {
    const result = submitQuizAttempt('timeout');
    setQuizResult(result);
    setAllResults(getAllResults());
    setAllParticipants(getAllParticipants());
    setCurrentView('submitted');
  };

  // Admin Navigation Handlers (Accessible via /admin or #admin)
  // Admin Navigation Handlers (Accessible via /#admin, ?admin, or /admin)
  const handleOpenAdmin = () => {
    window.location.hash = '#admin';
    if (checkAdminAuth()) {
      setIsAdminAuthenticated(true);
      setCurrentView('admin_portal');
    } else {
      setCurrentView('admin_login');
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setCurrentView('admin_portal');
    if (!window.location.hash.includes('admin')) {
      window.location.hash = '#admin';
    }
  };

  const handleExitAdmin = () => {
    setIsAdminAuthenticated(false);
    // Clean up hash without losing base pathname (crucial for GitHub Pages /rabee-quiz/)
    if (window.location.hash.includes('admin')) {
      try {
        const cleanURL = window.location.pathname + window.location.search;
        window.history.replaceState(null, '', cleanURL);
      } catch {
        window.location.hash = '';
      }
    }
    if (window.location.pathname.includes('admin')) {
      try {
        const basePath = window.location.pathname.replace(/\/admin\/?$/i, '') || '/';
        window.history.replaceState(null, '', basePath);
      } catch {
        // ignore
      }
    }

    // Return to appropriate user view
    const isCompleted = isQuizCompleted();
    const qState = getQuizState();
    const p = getParticipant();
    if (isCompleted) {
      setCurrentView('already_submitted');
    } else if (qState?.startedAt && getRemainingTime(qState.startedAt) > 0) {
      setCurrentView('quiz');
    } else if (p?.participantId) {
      setCurrentView('instructions');
    } else {
      setCurrentView('welcome');
    }
  };

  const handleResetAttemptForTesting = () => {
    refreshStorageData();
    handleExitAdmin();
  };

  const hasInProgressAttempt = !!quizState?.startedAt && getRemainingTime(quizState.startedAt) > 0 && !isQuizCompleted();
  const isCompletedAttempt = isQuizCompleted();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 selection:bg-emerald-200 selection:text-emerald-900">
      {/* Header */}
      <Header
        currentView={currentView}
        onNavigateAdmin={handleOpenAdmin}
        onNavigateHome={() => {
          if (currentView.startsWith('admin')) {
            handleExitAdmin();
          } else if (isCompletedAttempt) {
            setCurrentView('already_submitted');
          } else {
            setCurrentView('welcome');
          }
        }}
        isAdmin={currentView === 'admin_portal' || currentView === 'admin_login'}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 flex flex-col">
        {currentView === 'welcome' && (
          <Welcome
            onStartRegistration={() => setCurrentView('registration')}
            onResumeQuiz={() => {
              if (isCompletedAttempt) {
                setCurrentView('already_submitted');
              } else if (hasInProgressAttempt) {
                setCurrentView('quiz');
              }
            }}
            isCompleted={isCompletedAttempt}
            hasInProgress={hasInProgressAttempt}
            participant={participant}
          />
        )}

        {currentView === 'registration' && (
          <Registration
            onCompleteRegistration={handleRegistrationComplete}
            initialData={participant}
          />
        )}

        {currentView === 'instructions' && (
          <Instructions
            participant={participant}
            onStartQuiz={handleStartQuiz}
          />
        )}

        {currentView === 'quiz' && (
          <Quiz
            quizState={quizState}
            onSubmitQuiz={handleManualSubmit}
            onAutoSubmit={handleAutoSubmit}
          />
        )}

        {currentView === 'submitted' && (
          <Submitted
            participant={participant}
            result={quizResult}
          />
        )}

        {currentView === 'already_submitted' && (
          <AlreadySubmitted
            participant={participant}
            result={quizResult}
            onResetDevice={() => {
              resetCurrentAttempt();
              refreshStorageData();
              setCurrentView('welcome');
            }}
          />
        )}

        {currentView === 'admin_login' && (
          <AdminLogin
            onLoginSuccess={handleAdminLoginSuccess}
            onCancel={handleExitAdmin}
          />
        )}

        {currentView === 'admin_portal' && (
          <AdminPortal
            participants={allParticipants}
            results={allResults}
            onRefreshData={refreshStorageData}
            onExitAdmin={handleExitAdmin}
            onResetAttempt={handleResetAttemptForTesting}
          />
        )}
      </main>

      {/* Subtle Footer (No admin links shown to participants) */}
      <footer className="py-5 px-4 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white/60">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-malayalam font-semibold text-slate-600">ഉർവതൽ വുസ്ഖ്വ • മെഗാ ക്വിസ് മത്സരം</span>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>100% In-Browser Quiz</span>
            <button
              type="button"
              onClick={handleOpenAdmin}
              className="p-1 rounded text-slate-300 hover:text-slate-500 transition-colors cursor-pointer"
              title="Admin Portal Gate"
              aria-label="Admin Portal Gate"
            >
              <Lock className="w-3 h-3" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

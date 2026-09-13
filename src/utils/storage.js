/**
 * Rabee Quiz - LocalStorage Data Management Layer
 * 100% frontend-only storage utilities.
 * Handles participant registration, resilient timer timestamps,
 * hidden scoring, speed bonus calculations, and CSV exports.
 */

import { QUIZ_CONFIG, questions } from '../data/questions.js';

export const STORAGE_KEYS = {
  PARTICIPANT: 'rabee_participant',
  QUIZ_STATE: 'rabee_quiz_state',
  QUIZ_RESULT: 'rabee_quiz_result',
  QUIZ_COMPLETED: 'rabee_quiz_completed',
  ALL_PARTICIPANTS: 'rabee_all_participants',
  ALL_RESULTS: 'rabee_all_results',
  SPEED_RULES: 'rabee_speed_rules',
  ADMIN_AUTH: 'rabee_admin_auth',
  ADMIN_PASSWORD: 'rabee_admin_password',
  GOOGLE_SHEET_URL: 'rabee_google_sheet_url',
  LAST_SYNC_TIME: 'rabee_last_sync_time',
};

const DEFAULT_ADMIN_PASSWORD = 'rabee2026';

// Helper for safe JSON parse
const safeParse = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
};

// Helper for safe JSON stringify
const safeSet = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
    return false;
  }
};

// Format seconds into MM:SS
export const formatSecondsToMS = (totalSeconds) => {
  if (totalSeconds == null || isNaN(totalSeconds)) return '00:00';
  const sec = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// Format ISO date string into readable local format
export const formatDateTime = (isoString) => {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
};

// Generate next sequential Participant ID (e.g. RABEE-0001)
export const generateParticipantId = () => {
  const all = getAllParticipants();
  const nextNum = all.length + 1;
  return `RABEE-${String(nextNum).padStart(4, '0')}`;
};

// --- PARTICIPANT UTILITIES ---

export const getParticipant = () => {
  return safeParse(STORAGE_KEYS.PARTICIPANT, null);
};

export const getAllParticipants = () => {
  return safeParse(STORAGE_KEYS.ALL_PARTICIPANTS, []);
};

export const saveParticipant = (participantData) => {
  const current = getParticipant();
  const candidateCode = (
    participantData.candidateCode ||
    participantData.participantId ||
    current?.candidateCode ||
    current?.participantId ||
    ''
  ).trim().toUpperCase();
  
  const record = {
    participantId: candidateCode,
    candidateCode: candidateCode,
    name: (participantData.name || '').trim(),
    phone: (participantData.mobileNumber || participantData.phone || '').trim(),
    mobileNumber: (participantData.mobileNumber || participantData.phone || '').trim(),
    place: (participantData.place || participantData.institution || '').trim(),
    institution: (participantData.place || participantData.institution || '').trim(),
    email: (participantData.email || '').trim(),
    registeredAt: participantData.registeredAt || new Date().toISOString(),
    status: 'registered',
  };

  // Save current active participant
  safeSet(STORAGE_KEYS.PARTICIPANT, record);

  // Add / update in all participants list
  const all = getAllParticipants();
  const existingIndex = all.findIndex((p) => (p.candidateCode || p.participantId) === record.candidateCode);
  if (existingIndex >= 0) {
    all[existingIndex] = { ...all[existingIndex], ...record };
  } else {
    all.push(record);
  }
  safeSet(STORAGE_KEYS.ALL_PARTICIPANTS, all);

  return record;
};

// --- SPEED RULES UTILITIES ---

export const getSpeedRules = () => {
  return safeParse(STORAGE_KEYS.SPEED_RULES, QUIZ_CONFIG.defaultSpeedRules);
};

export const saveSpeedRules = (rules) => {
  return safeSet(STORAGE_KEYS.SPEED_RULES, rules);
};

// Calculate bonus marks based on seconds elapsed
export const calculateSpeedBonus = (elapsedSeconds, rules = null) => {
  const activeRules = rules || getSpeedRules();
  const duration = Math.floor(elapsedSeconds);

  // Must be strictly within 10 minutes (600s) to earn any speed bonus
  if (duration > QUIZ_CONFIG.durationSeconds) {
    return 0;
  }

  // Find lowest matching threshold
  for (const tier of activeRules) {
    if (duration <= tier.maxSeconds) {
      return tier.bonus;
    }
  }

  return 0;
};

// --- QUIZ STATE UTILITIES ---

export const getQuizState = () => {
  return safeParse(STORAGE_KEYS.QUIZ_STATE, null);
};

export const saveQuizState = (state) => {
  return safeSet(STORAGE_KEYS.QUIZ_STATE, state);
};

export const clearQuizState = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.QUIZ_STATE);
  } catch (err) {
    console.error('Error clearing quiz state:', err);
  }
};

/**
 * Starts the quiz by recording startedAt timestamp.
 * Only called when participant clicks "Start Quiz".
 */
export const startQuizSession = () => {
  const existingState = getQuizState();
  if (existingState && existingState.startedAt) {
    return existingState;
  }

  const newState = {
    startedAt: Date.now(),
    answers: {},
    currentQuestion: 0,
    status: 'in_progress',
  };

  saveQuizState(newState);

  // Update participant status in all_participants
  const participant = getParticipant();
  if (participant) {
    const all = getAllParticipants();
    const idx = all.findIndex((p) => p.participantId === participant.participantId);
    if (idx >= 0) {
      all[idx].status = 'in_progress';
      safeSet(STORAGE_KEYS.ALL_PARTICIPANTS, all);
    }
  }

  return newState;
};

/**
 * Calculates remaining time in seconds against 600s total duration.
 * Survives page refreshes and reload because it derives from Date.now() - startedAt.
 */
export const getRemainingTime = (startedAt) => {
  if (!startedAt) return QUIZ_CONFIG.durationSeconds;
  const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
  const remaining = QUIZ_CONFIG.durationSeconds - elapsedSeconds;
  return Math.max(0, remaining);
};

// --- SCORING & EVALUATION ---

export const calculateScore = (userAnswers = {}, questionList = questions, elapsedSeconds = 600) => {
  let correctAnswers = 0;
  
  questionList.forEach((q) => {
    const answer = userAnswers[q.id];
    if (answer !== undefined && answer !== null && Number(answer) === q.correctAnswer) {
      correctAnswers += 1;
    }
  });

  const baseScore = correctAnswers * 1; // 1 mark per correct answer
  const bonusMarks = calculateSpeedBonus(elapsedSeconds);
  const finalScore = baseScore + bonusMarks;

  return {
    correctAnswers,
    totalQuestions: questionList.length,
    baseScore,
    bonusMarks,
    finalScore,
  };
};

// --- SUBMISSION & RESULTS ---

export const isQuizCompleted = () => {
  const completedFlag = localStorage.getItem(STORAGE_KEYS.QUIZ_COMPLETED);
  return completedFlag === 'true' || completedFlag === true;
};

export const getQuizResult = () => {
  return safeParse(STORAGE_KEYS.QUIZ_RESULT, null);
};

export const getAllResults = () => {
  return safeParse(STORAGE_KEYS.ALL_RESULTS, []);
};

/**
 * Finalizes and saves the quiz attempt.
 * Evaluates scores strictly internally and stores result in localStorage.
 */
export const submitQuizAttempt = (reason = 'manual') => {
  const participant = getParticipant() || {
    participantId: 'GUEST-0001',
    name: 'Anonymous Participant',
    institution: 'General',
  };
  const state = getQuizState() || { startedAt: Date.now() - 600000, answers: {} };

  const startedAt = state.startedAt || Date.now() - 600000;
  const submittedAtMs = Date.now();
  const elapsedSeconds = Math.min(
    QUIZ_CONFIG.durationSeconds,
    Math.max(1, Math.floor((submittedAtMs - startedAt) / 1000))
  );

  const scoring = calculateScore(state.answers || {}, questions, elapsedSeconds);

  const candidateCode = participant.candidateCode || participant.participantId || 'RABEE-0001';
  const place = participant.place || participant.institution || '';
  const mobileNumber = participant.mobileNumber || participant.phone || '';

  const resultRecord = {
    participantId: candidateCode,
    candidateCode,
    name: participant.name,
    phone: mobileNumber,
    mobileNumber,
    place,
    institution: place,
    email: participant.email || '',
    registeredAt: participant.registeredAt || new Date().toISOString(),
    startedAt: new Date(startedAt).toISOString(),
    submittedAt: new Date(submittedAtMs).toISOString(),
    completionSeconds: elapsedSeconds,
    completionTime: formatSecondsToMS(elapsedSeconds),
    correctAnswers: scoring.correctAnswers,
    totalQuestions: scoring.totalQuestions,
    baseScore: scoring.baseScore,
    bonusMarks: scoring.bonusMarks,
    finalScore: scoring.finalScore,
    answers: { ...(state.answers || {}) },
    submissionType: reason === 'timeout' ? 'Auto-submitted (Time Limit)' : 'Manual Submission',
    status: 'submitted',
  };

  // Save current result
  safeSet(STORAGE_KEYS.QUIZ_RESULT, resultRecord);

  // Set completed lock flag
  localStorage.setItem(STORAGE_KEYS.QUIZ_COMPLETED, 'true');

  // Clear in-progress quiz state
  clearQuizState();

  // Update participant status in all_participants
  const allParticipants = getAllParticipants();
  const pIdx = allParticipants.findIndex((p) => (p.candidateCode || p.participantId) === candidateCode);
  if (pIdx >= 0) {
    allParticipants[pIdx].status = 'submitted';
    safeSet(STORAGE_KEYS.ALL_PARTICIPANTS, allParticipants);
  }

  // Add / update in all_results
  const allResults = getAllResults();
  const existingResultIdx = allResults.findIndex((r) => (r.candidateCode || r.participantId) === candidateCode);
  if (existingResultIdx >= 0) {
    allResults[existingResultIdx] = resultRecord;
  } else {
    allResults.push(resultRecord);
  }
  safeSet(STORAGE_KEYS.ALL_RESULTS, allResults);

  return resultRecord;
};

// --- CSV EXPORT UTILITIES ---

const escapeCSV = (value) => {
  if (value == null) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
};

export const exportResultsCSV = () => {
  const results = getAllResults();
  if (!results.length) {
    return { success: false, message: 'No quiz results to export yet.' };
  }

  const questionHeaders = questions.map((q) => `Q${q.id} Answer`);
  const headers = [
    'Candidate Code',
    'Name',
    'Place',
    'Mobile Number',
    'Registration Time',
    'Start Time',
    'Submission Time',
    'Completion Time (MM:SS)',
    'Completion Seconds',
    'Correct Answers (out of 20)',
    'Base Score',
    'Bonus Marks',
    'Final Score',
    'Submission Type',
    'Status',
    ...questionHeaders,
  ];

  const rows = results.map((r) => {
    const questionCols = questions.map((q) => {
      const selectedOpt = r.answers?.[q.id];
      if (selectedOpt === undefined || selectedOpt === null) {
        return escapeCSV('Unanswered');
      }
      const optLetter = ['A', 'B', 'C', 'D'][selectedOpt] || '';
      const optText = q.options[selectedOpt] || '';
      return escapeCSV(`(${optLetter}) ${optText}`);
    });

    return [
      escapeCSV(r.candidateCode || r.participantId),
      escapeCSV(r.name),
      escapeCSV(r.place || r.institution),
      escapeCSV(r.mobileNumber || r.phone),
      escapeCSV(formatDateTime(r.registeredAt)),
      escapeCSV(formatDateTime(r.startedAt)),
      escapeCSV(formatDateTime(r.submittedAt)),
      escapeCSV(r.completionTime),
      escapeCSV(r.completionSeconds),
      escapeCSV(r.correctAnswers),
      escapeCSV(r.baseScore),
      escapeCSV(r.bonusMarks),
      escapeCSV(r.finalScore),
      escapeCSV(r.submissionType),
      escapeCSV(r.status),
      ...questionCols,
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
  downloadBlob(csvContent, `Rabee_Quiz_Results_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
  return { success: true, count: results.length };
};

export const exportParticipantsCSV = () => {
  const participants = getAllParticipants();
  if (!participants.length) {
    return { success: false, message: 'No participants registered to export.' };
  }

  const headers = [
    'Candidate Code',
    'Name',
    'Place',
    'Mobile Number',
    'Registration Time',
    'Current Status',
  ];

  const rows = participants.map((p) => [
    escapeCSV(p.candidateCode || p.participantId),
    escapeCSV(p.name),
    escapeCSV(p.place || p.institution),
    escapeCSV(p.mobileNumber || p.phone),
    escapeCSV(formatDateTime(p.registeredAt)),
    escapeCSV(p.status || 'registered'),
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
  downloadBlob(csvContent, `Rabee_Quiz_Participants_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
  return { success: true, count: participants.length };
};

const downloadBlob = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// --- ADMIN & DEMO UTILITIES ---

export const getAdminPassword = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD) || DEFAULT_ADMIN_PASSWORD;
  } catch {
    return DEFAULT_ADMIN_PASSWORD;
  }
};

export const setAdminPassword = (newPassword) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, newPassword.trim());
    return true;
  } catch {
    return false;
  }
};

export const checkAdminAuth = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  } catch {
    return false;
  }
};

export const setAdminAuth = (isAuthed) => {
  try {
    if (isAuthed) {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    }
  } catch (e) {
    console.error('SessionStorage error:', e);
  }
};

// Reset demo: allows tester to retake the quiz cleanly without deleting other records
export const resetCurrentAttempt = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.QUIZ_COMPLETED);
    localStorage.removeItem(STORAGE_KEYS.QUIZ_STATE);
    localStorage.removeItem(STORAGE_KEYS.QUIZ_RESULT);
    localStorage.removeItem(STORAGE_KEYS.PARTICIPANT);
    return true;
  } catch (err) {
    console.error('Error resetting current attempt:', err);
    return false;
  }
};

// Delete a single participant and their quiz results permanently
export const deleteParticipant = (candidateCodeOrId) => {
  if (!candidateCodeOrId) return false;
  const target = String(candidateCodeOrId).trim().toUpperCase();

  try {
    // 1. Remove from all_participants
    const allParticipants = getAllParticipants();
    const updatedParticipants = allParticipants.filter((p) => {
      const code = (p.candidateCode || p.participantId || '').trim().toUpperCase();
      return code !== target;
    });
    safeSet(STORAGE_KEYS.ALL_PARTICIPANTS, updatedParticipants);

    // 2. Remove from all_results
    const allResults = getAllResults();
    const updatedResults = allResults.filter((r) => {
      const code = (r.candidateCode || r.participantId || '').trim().toUpperCase();
      return code !== target;
    });
    safeSet(STORAGE_KEYS.ALL_RESULTS, updatedResults);

    // 3. If target matches active session participant, clear current session
    const currentParticipant = getParticipant();
    const currentCode = (currentParticipant?.candidateCode || currentParticipant?.participantId || '').trim().toUpperCase();
    if (currentCode === target) {
      localStorage.removeItem(STORAGE_KEYS.PARTICIPANT);
      localStorage.removeItem(STORAGE_KEYS.QUIZ_STATE);
      localStorage.removeItem(STORAGE_KEYS.QUIZ_RESULT);
      localStorage.removeItem(STORAGE_KEYS.QUIZ_COMPLETED);
    }

    return true;
  } catch (err) {
    console.error(`Error deleting participant ${candidateCodeOrId}:`, err);
    return false;
  }
};

// Clear all local quiz data completely
export const clearAllLocalData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.PARTICIPANT);
    localStorage.removeItem(STORAGE_KEYS.QUIZ_STATE);
    localStorage.removeItem(STORAGE_KEYS.QUIZ_RESULT);
    localStorage.removeItem(STORAGE_KEYS.QUIZ_COMPLETED);
    localStorage.removeItem(STORAGE_KEYS.ALL_PARTICIPANTS);
    localStorage.removeItem(STORAGE_KEYS.ALL_RESULTS);
    localStorage.removeItem(STORAGE_KEYS.SPEED_RULES);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_PASSWORD);
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    return true;
  } catch (err) {
    console.error('Error clearing all local data:', err);
    return false;
  }
};

// Seed realistic sample data for testing Admin Dashboard & CSV exports
export const seedSampleData = () => {
  const sampleParticipants = [
    {
      participantId: 'RABEE-0001',
      name: 'Zayd ibn Harith',
      phone: '+91 98450 12345',
      email: 'zayd.h@example.com',
      institution: 'Darul Uloom Academy',
      registeredAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      startedAt: new Date(Date.now() - 3600000 * 5 + 120000).toISOString(),
      submittedAt: new Date(Date.now() - 3600000 * 5 + 120000 + 265000).toISOString(),
      completionSeconds: 265, // 4m 25s (< 5m => +10 bonus)
      completionTime: '04:25',
      correctAnswers: 19,
      totalQuestions: 20,
      baseScore: 19,
      bonusMarks: 10,
      finalScore: 29,
      submissionType: 'Manual Submission',
      status: 'submitted',
    },
    {
      participantId: 'RABEE-0002',
      name: 'Fatimah Az-Zahra',
      phone: '+91 98450 67890',
      email: 'fatimah.z@example.com',
      institution: 'Al-Madinah Islamic Institute',
      registeredAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      startedAt: new Date(Date.now() - 3600000 * 4 + 60000).toISOString(),
      submittedAt: new Date(Date.now() - 3600000 * 4 + 60000 + 380000).toISOString(),
      completionSeconds: 380, // 6m 20s (5-7m => +7 bonus)
      completionTime: '06:20',
      correctAnswers: 20,
      totalQuestions: 20,
      baseScore: 20,
      bonusMarks: 7,
      finalScore: 27,
      submissionType: 'Manual Submission',
      status: 'submitted',
    },
    {
      participantId: 'RABEE-0003',
      name: 'Bilal Al-Habashi',
      phone: '+91 98765 43210',
      email: 'bilal.h@example.com',
      institution: 'An-Noor Higher Secondary',
      registeredAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      startedAt: new Date(Date.now() - 3600000 * 3 + 180000).toISOString(),
      submittedAt: new Date(Date.now() - 3600000 * 3 + 180000 + 490000).toISOString(),
      completionSeconds: 490, // 8m 10s (7-9m => +5 bonus)
      completionTime: '08:10',
      correctAnswers: 17,
      totalQuestions: 20,
      baseScore: 17,
      bonusMarks: 5,
      finalScore: 22,
      submissionType: 'Manual Submission',
      status: 'submitted',
    },
    {
      participantId: 'RABEE-0004',
      name: 'Maryam Bint Imran',
      phone: '+91 97410 55443',
      email: 'maryam.i@example.com',
      institution: 'Crescent College of Arts & Science',
      registeredAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      startedAt: new Date(Date.now() - 3600000 * 2 + 100000).toISOString(),
      submittedAt: new Date(Date.now() - 3600000 * 2 + 100000 + 565000).toISOString(),
      completionSeconds: 565, // 9m 25s (9-10m => +2 bonus)
      completionTime: '09:25',
      correctAnswers: 16,
      totalQuestions: 20,
      baseScore: 16,
      bonusMarks: 2,
      finalScore: 18,
      submissionType: 'Manual Submission',
      status: 'submitted',
    },
    {
      participantId: 'RABEE-0005',
      name: 'Salman Al-Farsi',
      phone: '+91 99887 76655',
      email: 'salman.f@example.com',
      institution: 'Islamic Research Foundation',
      registeredAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      startedAt: new Date(Date.now() - 3600000 * 1.5 + 45000).toISOString(),
      submittedAt: new Date(Date.now() - 3600000 * 1.5 + 45000 + 600000).toISOString(),
      completionSeconds: 600, // 10m (auto submitted timeout => 0 bonus)
      completionTime: '10:00',
      correctAnswers: 14,
      totalQuestions: 20,
      baseScore: 14,
      bonusMarks: 0,
      finalScore: 14,
      submissionType: 'Auto-submitted (Time Limit)',
      status: 'submitted',
    },
    {
      participantId: 'RABEE-0006',
      name: 'Aisha Siddiqah',
      phone: '+91 91234 56780',
      email: 'aisha.s@example.com',
      institution: 'Al-Huda International',
      registeredAt: new Date(Date.now() - 1800000).toISOString(),
      status: 'registered',
    },
    {
      participantId: 'RABEE-0007',
      name: 'Umar Al-Faruq',
      phone: '+91 98801 23456',
      email: 'umar.f@example.com',
      institution: 'Al-Azhar University Wing',
      registeredAt: new Date(Date.now() - 900000).toISOString(),
      status: 'in_progress',
    },
  ];

  const participantsList = sampleParticipants.map((p) => ({
    participantId: p.participantId,
    candidateCode: p.participantId,
    name: p.name,
    phone: p.phone,
    mobileNumber: p.phone,
    place: p.institution,
    institution: p.institution,
    email: p.email,
    registeredAt: p.registeredAt,
    status: p.status,
  }));

  const resultsList = sampleParticipants
    .filter((p) => p.status === 'submitted')
    .map((p) => ({
      participantId: p.participantId,
      candidateCode: p.participantId,
      name: p.name,
      phone: p.phone,
      mobileNumber: p.phone,
      place: p.institution,
      institution: p.institution,
      email: p.email,
      registeredAt: p.registeredAt,
      startedAt: p.startedAt,
      submittedAt: p.submittedAt,
      completionSeconds: p.completionSeconds,
      completionTime: p.completionTime,
      correctAnswers: p.correctAnswers,
      totalQuestions: p.totalQuestions,
      baseScore: p.baseScore,
      bonusMarks: p.bonusMarks,
      finalScore: p.finalScore,
      submissionType: p.submissionType,
      status: 'submitted',
    }));

  safeSet(STORAGE_KEYS.ALL_PARTICIPANTS, participantsList);
  safeSet(STORAGE_KEYS.ALL_RESULTS, resultsList);

  return { participantsCount: participantsList.length, resultsCount: resultsList.length };
};


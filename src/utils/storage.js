/**
 * Rabee Quiz - LocalStorage Data Management Layer
 * 100% frontend-only storage utilities.
 * Handles participant registration, resilient timer timestamps,
 * hidden scoring, speed bonus calculations, and CSV exports.
 */

import { QUIZ_CONFIG, questions } from '../data/questions.js';
import { DEFAULT_GOOGLE_SHEET_URL } from '../config/sheetConfig.js';

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

  // Asynchronously sync new registration to Google Sheet
  try {
    sendToGoogleSheet({ action: 'register', participant: record }).catch((err) => {
      console.warn('Google Sheet registration sync notice:', err);
    });
  } catch (err) {
    console.warn('Google Sheet registration sync notice:', err);
  }

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

  // Asynchronously sync completed attempt to Google Sheet
  try {
    sendToGoogleSheet({ action: 'submit', result: resultRecord }).catch((err) => {
      console.warn('Google Sheet submission sync notice:', err);
    });
  } catch (err) {
    console.warn('Google Sheet submission sync notice:', err);
  }

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

// --- GOOGLE SHEETS LIVE SYNC UTILITIES ---

export const getGoogleSheetUrl = () => {
  try {
    const saved = (localStorage.getItem(STORAGE_KEYS.GOOGLE_SHEET_URL) || '').trim();
    if (saved) return saved;
    return (DEFAULT_GOOGLE_SHEET_URL || '').trim();
  } catch {
    return (DEFAULT_GOOGLE_SHEET_URL || '').trim();
  }
};

export const setGoogleSheetUrl = (url) => {
  try {
    const trimmed = (url || '').trim();
    if (!trimmed) {
      localStorage.removeItem(STORAGE_KEYS.GOOGLE_SHEET_URL);
    } else {
      localStorage.setItem(STORAGE_KEYS.GOOGLE_SHEET_URL, trimmed);
    }
    return true;
  } catch (err) {
    console.error('Error saving Google Sheet URL:', err);
    return false;
  }
};

export const getLastSyncTime = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME) || null;
  } catch {
    return null;
  }
};

// Send registration or completed quiz result to Google Sheet Web App
export const sendToGoogleSheet = async (payload) => {
  const scriptUrl = getGoogleSheetUrl();
  if (!scriptUrl) {
    console.warn('sendToGoogleSheet: No Google Sheet URL configured on this device.');
    return { success: false, reason: 'No Google Sheet URL configured' };
  }

  // A docs.google.com/spreadsheets link cannot accept POST webhooks
  if (scriptUrl.includes('docs.google.com/spreadsheets')) {
    console.warn('sendToGoogleSheet: Cannot POST to spreadsheet link. Must be Apps Script Web App (/exec).');
    return { success: false, reason: 'Requires Google Apps Script Web App URL ending in /exec' };
  }

  try {
    const jsonString = JSON.stringify(payload);

    // 1. Primary delivery: standard fetch with no-cors
    const fetchPromise = fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: jsonString,
    });

    // 2. High-reliability mobile fallback: navigator.sendBeacon (guarantees delivery on iOS/Android tab close)
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      try {
        const blob = new Blob([jsonString], { type: 'text/plain;charset=utf-8' });
        navigator.sendBeacon(scriptUrl, blob);
      } catch (beaconErr) {
        // Beacon is an enhancement, fetch is primary
      }
    }

    await fetchPromise;
    console.log('sendToGoogleSheet: Dispatched payload successfully');
    return { success: true };
  } catch (err) {
    console.warn('Google Sheet sync notice:', err.message);
    return { success: false, error: err.message };
  }
};

// Extract spreadsheet ID from Google Sheet or Apps Script URL
export const extractSpreadsheetId = (url) => {
  if (!url) return null;
  const match = String(url).match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};

// JSONP Fetcher to bypass browser CORS preflight restrictions
export const fetchJSONP = (url, timeoutMs = 12000) => {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      return reject(new Error('JSONP is only supported in browser environments.'));
    }
    const callbackName = 'google_sheet_cb_' + Math.random().toString(36).substring(2, 9);
    const script = document.createElement('script');
    const sep = url.includes('?') ? '&' : '?';
    script.src = `${url}${sep}callback=${callbackName}&_t=${Date.now()}`;
    script.async = true;

    let timer = null;
    const cleanup = () => {
      if (timer) clearTimeout(timer);
      delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
    };

    timer = setTimeout(() => {
      cleanup();
      reject(new Error('Connection timed out. In Apps Script, check that "Who has access" is set to "Anyone".'));
    }, timeoutMs);

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('Browser blocked script loading. Make sure "Who has access" is set to "Anyone".'));
    };

    document.head.appendChild(script);
  });
};

// Google Visualization API (gviz/tq) parsing helpers for direct spreadsheet reading
const parseGvizResponse = (gvizText) => {
  const start = gvizText.indexOf('{');
  const end = gvizText.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('Invalid response from Google Sheets.');
  }
  return JSON.parse(gvizText.substring(start, end + 1));
};

const parseGvizResults = (gvizData) => {
  if (!gvizData || !gvizData.table || !Array.isArray(gvizData.table.rows)) return [];
  const rows = gvizData.table.rows;
  const results = [];

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i]?.c;
    if (!cells || !cells[0] || cells[0].v == null) continue;
    const code = String(cells[0].v).trim();
    if (!code || code.toLowerCase() === 'candidate code') continue;

    const answersObj = {};
    for (let q = 1; q <= 20; q++) {
      const cell = cells[10 + q];
      if (cell && cell.v !== null && cell.v !== undefined && cell.v !== '') {
        answersObj[q] = Number(cell.v);
      }
    }

    results.push({
      candidateCode: code,
      participantId: code,
      name: String(cells[1]?.v || ''),
      place: String(cells[2]?.v || ''),
      institution: String(cells[2]?.v || ''),
      mobileNumber: String(cells[3]?.v || ''),
      phone: String(cells[3]?.v || ''),
      finalScore: Number(cells[4]?.v || 0),
      correctAnswers: Number(cells[5]?.v || 0),
      totalQuestions: 20,
      bonusMarks: Number(cells[6]?.v || 0),
      completionTime: String(cells[7]?.v || ''),
      completionSeconds: Number(cells[8]?.v || 0),
      submissionType: String(cells[9]?.v || 'Manual Submission'),
      submittedAt: String(cells[10]?.v || ''),
      status: 'submitted',
      answers: answersObj,
    });
  }
  return results;
};

const parseGvizParticipants = (gvizText) => {
  try {
    const gvizData = parseGvizResponse(gvizText);
    if (!gvizData || !gvizData.table || !Array.isArray(gvizData.table.rows)) return [];
    const rows = gvizData.table.rows;
    const participants = [];
    for (let i = 0; i < rows.length; i++) {
      const cells = rows[i]?.c;
      if (!cells || !cells[0] || cells[0].v == null) continue;
      const code = String(cells[0].v).trim();
      if (!code || code.toLowerCase() === 'candidate code') continue;
      participants.push({
        candidateCode: code,
        participantId: code,
        name: String(cells[1]?.v || ''),
        place: String(cells[2]?.v || ''),
        institution: String(cells[2]?.v || ''),
        mobileNumber: String(cells[3]?.v || ''),
        phone: String(cells[3]?.v || ''),
        email: String(cells[4]?.v || ''),
        registeredAt: String(cells[5]?.v || ''),
        status: String(cells[6]?.v || 'registered'),
      });
    }
    return participants;
  } catch {
    return [];
  }
};

export const fetchGoogleSheetDirect = async (spreadsheetId) => {
  const resResults = await fetch(
    `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=Results`
  );
  if (!resResults.ok) {
    throw new Error(
      `Access denied (status ${resResults.status}). Please ensure your Google Sheet is shared with "Anyone with the link can view".`
    );
  }
  const textResults = await resResults.text();
  const jsonResults = parseGvizResponse(textResults);
  const results = parseGvizResults(jsonResults);

  let participants = [];
  try {
    const resPart = await fetch(
      `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=Participants`
    );
    if (resPart.ok) {
      const textPart = await resPart.text();
      participants = parseGvizParticipants(textPart);
    }
  } catch {
    // Participants tab is optional
  }

  return { results, participants };
};

// Test Google Sheet connectivity
export const testGoogleSheetConnection = async () => {
  const scriptUrl = getGoogleSheetUrl();
  if (!scriptUrl) return { success: false, error: 'Google Sheet URL is not set.' };

  const spreadsheetId = extractSpreadsheetId(scriptUrl);

  // PATH A: Google Spreadsheet Direct URL
  if (spreadsheetId && !scriptUrl.includes('script.google.com')) {
    try {
      const data = await fetchGoogleSheetDirect(spreadsheetId);
      return {
        success: true,
        source: 'gviz',
        resultsCount: data.results.length,
        participantsCount: data.participants.length,
      };
    } catch (err) {
      return {
        success: false,
        error: `Could not read Google Sheet: ${err.message}. Share the sheet with "Anyone with the link can view".`,
      };
    }
  }

  // PATH B: Google Apps Script Web App
  try {
    let cloudData = null;
    let fetchError = null;

    try {
      const response = await fetch(scriptUrl, { method: 'GET', redirect: 'follow' });
      if (response.ok) {
        cloudData = await response.json();
      } else {
        fetchError = `HTTP ${response.status}`;
      }
    } catch (e) {
      fetchError = e.message;
    }

    if (!cloudData) {
      try {
        cloudData = await fetchJSONP(scriptUrl, 8000);
      } catch (jsonpErr) {
        console.warn('JSONP test fallback failed:', jsonpErr);
      }
    }

    if (!cloudData || (cloudData.status !== 'success' && !cloudData.results && !cloudData.participants)) {
      const isDev = scriptUrl.endsWith('/dev') || scriptUrl.includes('/dev?');
      const isEditor = scriptUrl.includes('home/projects') || scriptUrl.includes('/edit');

      let tip = 'In Apps Script, click Deploy > Manage deployments > Edit, and ensure "Who has access" is set to "Anyone" (NOT "Only myself").';
      if (isDev) tip = 'This is a /dev test URL. Please deploy a New Deployment as "Web app" and use the /exec URL.';
      if (isEditor) tip = 'This is the script editor link. In Apps Script, click Deploy > New deployment > Web app, and copy the URL ending in /exec.';

      return {
        success: false,
        error: `Google connection blocked (${fetchError || 'Failed to fetch'}). ${tip}`,
      };
    }

    return {
      success: true,
      source: 'apps_script',
      status: cloudData.status,
      resultsCount: Array.isArray(cloudData.results) ? cloudData.results.length : 0,
      participantsCount: Array.isArray(cloudData.participants) ? cloudData.participants.length : 0,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// Fetch cloud submissions from Google Sheet Web App and merge into local admin data
export const syncFromGoogleSheet = async () => {
  const scriptUrl = getGoogleSheetUrl();
  if (!scriptUrl) return { success: false, error: 'Google Sheet URL is not set. Go to Settings to configure it.' };

  const spreadsheetId = extractSpreadsheetId(scriptUrl);

  let rawResults = [];
  let rawParticipants = [];
  let sourceUsed = 'apps_script';

  // PATH A: If Google Spreadsheet link provided, read via gviz
  if (spreadsheetId && !scriptUrl.includes('script.google.com')) {
    try {
      const direct = await fetchGoogleSheetDirect(spreadsheetId);
      rawResults = direct.results;
      rawParticipants = direct.participants;
      sourceUsed = 'gviz';
    } catch (err) {
      return {
        success: false,
        error: `Direct Google Sheet read failed: ${err.message}. Share your sheet as "Anyone with the link can view".`,
      };
    }
  } else {
    // PATH B: Google Apps Script Web App
    let cloudData = null;
    let fetchError = null;

    try {
      const response = await fetch(scriptUrl, {
        method: 'GET',
        redirect: 'follow',
      });
      if (response.ok) {
        cloudData = await response.json();
      } else {
        fetchError = `HTTP ${response.status}`;
      }
    } catch (err) {
      fetchError = err.message;
    }

    // Try JSONP fallback if fetch was blocked by CORS
    if (!cloudData) {
      try {
        cloudData = await fetchJSONP(scriptUrl, 10000);
      } catch (jsonpErr) {
        console.warn('JSONP fallback failed:', jsonpErr.message);
      }
    }

    if (!cloudData || (cloudData.status !== 'success' && !cloudData.results && !cloudData.participants)) {
      const isDev = scriptUrl.endsWith('/dev') || scriptUrl.includes('/dev?');
      const isEditor = scriptUrl.includes('home/projects') || scriptUrl.includes('/edit');

      let tip = 'In Apps Script, click Deploy > Manage deployments > Edit, and ensure "Who has access" is set to "Anyone" (not "Only myself").';
      if (isDev) tip = 'This is a /dev test URL. In Apps Script, click Deploy > New deployment > Web app and copy the /exec URL.';
      if (isEditor) tip = 'This is the script editor link. In Apps Script, click Deploy > New deployment > Web app and copy the /exec URL.';

      return {
        success: false,
        error: `Google connection blocked (${fetchError || 'Failed to fetch'}). ${tip}`,
      };
    }

    rawResults = Array.isArray(cloudData.results) ? cloudData.results : [];
    rawParticipants = Array.isArray(cloudData.participants) ? cloudData.participants : [];
  }

  // 1. Merge Participants
  const localParticipants = getAllParticipants();
  const pMap = new Map();
  localParticipants.forEach((p) => {
    const code = (p.candidateCode || p.participantId || '').trim().toUpperCase();
    if (code) pMap.set(code, p);
  });

  rawParticipants.forEach((p) => {
    const code = (p.candidateCode || p.participantId || '').trim().toUpperCase();
    if (code) {
      const prev = pMap.get(code) || {};
      pMap.set(code, { ...prev, ...p });
    }
  });

  const finalParticipants = Array.from(pMap.values());
  safeSet(STORAGE_KEYS.ALL_PARTICIPANTS, finalParticipants);

  // 2. Merge Results
  const localResults = getAllResults();
  const rMap = new Map();
  localResults.forEach((r) => {
    const code = (r.candidateCode || r.participantId || '').trim().toUpperCase();
    if (code) rMap.set(code, r);
  });

  rawResults.forEach((r) => {
    const code = (r.candidateCode || r.participantId || '').trim().toUpperCase();
    if (code) {
      const prev = rMap.get(code) || {};
      rMap.set(code, { ...prev, ...r });
    }
  });

  const finalResults = Array.from(rMap.values());
  safeSet(STORAGE_KEYS.ALL_RESULTS, finalResults);

  // Record last sync timestamp
  const nowIso = new Date().toISOString();
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, nowIso);
  } catch {
    // ignore
  }

  return {
    success: true,
    source: sourceUsed,
    participantsCount: finalParticipants.length,
    resultsCount: finalResults.length,
    lastSyncedAt: nowIso,
  };
};

export const GOOGLE_APPS_SCRIPT_TEMPLATE = `// ==========================================
// Google Apps Script for "ഉർവതൽ വുസ്ഖ്വ മെഗാ ക്വിസ്"
// Paste into Extensions > Apps Script in Google Sheets
// ==========================================

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Acquire lock for up to 30 seconds to handle concurrent participant submissions
    lock.tryLock(30000);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var raw = '';
    if (e && e.postData && e.postData.contents) {
      raw = e.postData.contents;
    } else if (e && e.parameter && e.parameter.data) {
      raw = e.parameter.data;
    }

    if (!raw) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'No payload' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    var action = data.action;

    // 1. Record Completed Quiz Results
    if (action === 'submit' || data.result) {
      var r = data.result || data;
      var resultsSheet = ss.getSheetByName('Results');
      if (!resultsSheet) {
        resultsSheet = ss.insertSheet('Results');
        var headers = [
          'Candidate Code', 'Name', 'Place', 'Mobile Number',
          'Final Score', 'Correct Answers', 'Speed Bonus',
          'Completion Time', 'Completion Seconds', 'Submission Type', 'Submitted At'
        ];
        for (var i = 1; i <= 20; i++) {
          headers.push('Q' + i + ' Answer');
        }
        resultsSheet.appendRow(headers);
        resultsSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#d1fae5');
        resultsSheet.setFrozenRows(1);
      }

      var row = [
        r.candidateCode || r.participantId || '',
        r.name || '',
        r.place || r.institution || '',
        r.mobileNumber || r.phone || '',
        Number(r.finalScore || 0),
        Number(r.correctAnswers || 0),
        Number(r.bonusMarks || 0),
        r.completionTime || '',
        Number(r.completionSeconds || 0),
        r.submissionType || 'Manual Submission',
        r.submittedAt || new Date().toISOString()
      ];

      var answers = r.answers || {};
      for (var q = 1; q <= 20; q++) {
        var ans = answers[q];
        row.push(ans !== undefined && ans !== null ? ans : '');
      }

      // Check if candidate already submitted; update if exists, otherwise append
      var dataRange = resultsSheet.getDataRange().getValues();
      var codeToFind = String(r.candidateCode || r.participantId || '').trim().toUpperCase();
      var existingRow = -1;
      for (var j = 1; j < dataRange.length; j++) {
        if (String(dataRange[j][0]).trim().toUpperCase() === codeToFind) {
          existingRow = j + 1;
          break;
        }
      }

      if (existingRow > 1) {
        resultsSheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
      } else {
        resultsSheet.appendRow(row);
      }

      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Result recorded' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Record Registration
    if (action === 'register' || data.participant) {
      var p = data.participant || data;
      var partSheet = ss.getSheetByName('Participants');
      if (!partSheet) {
        partSheet = ss.insertSheet('Participants');
        var pHeaders = ['Candidate Code', 'Name', 'Place', 'Mobile Number', 'Email', 'Registered At', 'Status'];
        partSheet.appendRow(pHeaders);
        partSheet.getRange(1, 1, 1, pHeaders.length).setFontWeight('bold').setBackground('#e0f2fe');
        partSheet.setFrozenRows(1);
      }

      var pRow = [
        p.candidateCode || p.participantId || '',
        p.name || '',
        p.place || p.institution || '',
        p.mobileNumber || p.phone || '',
        p.email || '',
        p.registeredAt || new Date().toISOString(),
        p.status || 'registered'
      ];

      var pData = partSheet.getDataRange().getValues();
      var pCode = String(p.candidateCode || p.participantId || '').trim().toUpperCase();
      var pIdx = -1;
      for (var k = 1; k < pData.length; k++) {
        if (String(pData[k][0]).trim().toUpperCase() === pCode) {
          pIdx = k + 1;
          break;
        }
      }

      if (pIdx > 1) {
        partSheet.getRange(pIdx, 1, 1, pRow.length).setValues([pRow]);
      } else {
        partSheet.appendRow(pRow);
      }

      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Participant registered' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var results = [];
    var participants = [];

    // Read Results
    var resultsSheet = ss.getSheetByName('Results');
    if (resultsSheet) {
      var rData = resultsSheet.getDataRange().getValues();
      if (rData.length > 1) {
        for (var i = 1; i < rData.length; i++) {
          var row = rData[i];
          if (!row[0]) continue;
          var answersObj = {};
          for (var q = 1; q <= 20; q++) {
            if (row[10 + q] !== '' && row[10 + q] !== undefined) {
              answersObj[q] = Number(row[10 + q]);
            }
          }
          results.push({
            candidateCode: String(row[0]),
            participantId: String(row[0]),
            name: String(row[1] || ''),
            place: String(row[2] || ''),
            institution: String(row[2] || ''),
            mobileNumber: String(row[3] || ''),
            phone: String(row[3] || ''),
            finalScore: Number(row[4] || 0),
            correctAnswers: Number(row[5] || 0),
            totalQuestions: 20,
            bonusMarks: Number(row[6] || 0),
            completionTime: String(row[7] || ''),
            completionSeconds: Number(row[8] || 0),
            submissionType: String(row[9] || 'Manual Submission'),
            submittedAt: String(row[10] || ''),
            status: 'submitted',
            answers: answersObj
          });
        }
      }
    }

    // Read Participants
    var partSheet = ss.getSheetByName('Participants');
    if (partSheet) {
      var pData = partSheet.getDataRange().getValues();
      if (pData.length > 1) {
        for (var j = 1; j < pData.length; j++) {
          var pRow = pData[j];
          if (!pRow[0]) continue;
          participants.push({
            candidateCode: String(pRow[0]),
            participantId: String(pRow[0]),
            name: String(pRow[1] || ''),
            place: String(pRow[2] || ''),
            institution: String(pRow[2] || ''),
            mobileNumber: String(pRow[3] || ''),
            phone: String(pRow[3] || ''),
            email: String(pRow[4] || ''),
            registeredAt: String(pRow[5] || ''),
            status: String(pRow[6] || 'registered')
          });
        }
      }
    }

    var payload = {
      status: 'success',
      results: results,
      participants: participants
    };

    var output = JSON.stringify(payload);
    var callback = e && e.parameter && e.parameter.callback;
    if (callback) {
      return ContentService.createTextOutput(callback + '(' + output + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    return ContentService.createTextOutput(output)
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    var errPayload = { status: 'error', error: err.toString() };
    var callback = e && e.parameter && e.parameter.callback;
    if (callback) {
      return ContentService.createTextOutput(callback + '(' + JSON.stringify(errPayload) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(JSON.stringify(errPayload))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;

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


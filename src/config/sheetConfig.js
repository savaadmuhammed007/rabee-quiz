/**
 * Google Sheet Live Sync Configuration
 *
 * If you set your Google Apps Script Web App URL below or via VITE_GOOGLE_SHEET_URL,
 * every participant device opening the quiz will automatically send registrations
 * and completed submissions to your Google Sheet without any manual setup per phone!
 */

export const DEFAULT_GOOGLE_SHEET_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_SHEET_URL)
    ? import.meta.env.VITE_GOOGLE_SHEET_URL.trim()
    : '';

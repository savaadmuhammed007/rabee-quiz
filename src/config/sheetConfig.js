/**
 * Google Sheet Live Sync Configuration (Multi-Device Endpoint)
 * Exact same architecture as Nuvana Giveaway.
 *
 * If set below or via VITE_GOOGLE_SCRIPT_URL in .env,
 * every single participant device opening the quiz on any phone
 * will automatically submit registrations and quiz attempts to your Google Sheet!
 */

export const DEFAULT_GOOGLE_SHEET_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_GOOGLE_SCRIPT_URL || import.meta.env.VITE_GOOGLE_SHEET_URL))
    ? (import.meta.env.VITE_GOOGLE_SCRIPT_URL || import.meta.env.VITE_GOOGLE_SHEET_URL).trim()
    : '';


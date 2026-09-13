/**
 * ==============================================================================
 * ഉർവതൽ വുസ്ഖ്വ മെഗാ ക്വിസ് 2026 (Ma'din Al Islamiyya)
 * Google Apps Script - Multi-Device Live Cloud Sync Endpoint
 * ==============================================================================
 * 
 * Instructions:
 * 1. Open Google Sheets (https://sheets.new)
 * 2. Name your spreadsheet: "ഉർവതൽ വുസ്ഖ്വ മെഗാ ക്വിസ് 2026"
 * 3. Go to Extensions > Apps Script
 * 4. Delete any default code, paste this entire file, and click Save (💾)
 * 5. Click "Deploy" (top right) > "New deployment"
 * 6. Select type: "Web app" (⚙️ icon)
 * 7. Description: "Rabee Mega Quiz API"
 * 8. Execute as: "Me"
 * 9. Who has access: "Anyone" ⚠️ (CRITICAL: MUST BE "Anyone" so participant devices can submit without login)
 * 10. Click "Deploy", authorize Google access, and copy the Web App URL (ends with /exec)!
 * 11. Paste that Web App URL in your .env (VITE_GOOGLE_SCRIPT_URL=...) or Admin Settings.
 * ==============================================================================
 */

const RESULTS_SHEET_NAME = "Results";
const PARTICIPANTS_SHEET_NAME = "Participants";

const RESULTS_HEADERS = [
  "Candidate Code",
  "Name",
  "Place",
  "Mobile Number",
  "Final Score",
  "Correct Answers",
  "Speed Bonus",
  "Completion Time",
  "Completion Seconds",
  "Submission Type",
  "Submitted At",
  "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9", "Q10",
  "Q11", "Q12", "Q13", "Q14", "Q15", "Q16", "Q17", "Q18", "Q19", "Q20"
];

const PARTICIPANTS_HEADERS = [
  "Candidate Code",
  "Name",
  "Place",
  "Mobile Number",
  "Email",
  "Registered At",
  "Status"
];

function setupResultsSheet(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(RESULTS_HEADERS);
    const range = sheet.getRange(1, 1, 1, RESULTS_HEADERS.length);
    range.setBackground("#065F46"); // Emerald
    range.setFontColor("#FFFFFF");
    range.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  try {
    sheet.getRange(1, 4, sheet.getMaxRows(), 1).setNumberFormat("@"); // Plain text phone
  } catch (e) {}
}

function setupParticipantsSheet(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(PARTICIPANTS_HEADERS);
    const range = sheet.getRange(1, 1, 1, PARTICIPANTS_HEADERS.length);
    range.setBackground("#0F766E"); // Teal
    range.setFontColor("#FFFFFF");
    range.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  try {
    sheet.getRange(1, 4, sheet.getMaxRows(), 1).setNumberFormat("@");
  } catch (e) {}
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(15000);

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Parse incoming data (supports URL-encoded form parameters and JSON)
    let data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    const action = data.action || (data.result ? "submit" : (data.participant ? "register" : "submit"));

    // 1. SUBMIT QUIZ RESULT
    if (action === "submit" || data.finalScore !== undefined || data.result) {
      const r = data.result || data;
      let sheet = ss.getSheetByName(RESULTS_SHEET_NAME);
      if (!sheet) {
        sheet = ss.insertSheet(RESULTS_SHEET_NAME);
      }
      setupResultsSheet(sheet);

      const candidateCode = String(r.candidateCode || r.participantId || "").trim().toUpperCase();
      const name = String(r.name || "").trim();
      const place = String(r.place || r.institution || "").trim();
      const rawPhone = String(r.mobileNumber || r.phone || "").trim();
      const phone = rawPhone ? "'" + rawPhone.replace(/^'/, "") : "";
      const finalScore = Number(r.finalScore || 0);
      const correctAnswers = Number(r.correctAnswers || 0);
      const bonusMarks = Number(r.bonusMarks || 0);
      const completionTime = String(r.completionTime || "");
      const completionSeconds = Number(r.completionSeconds || 0);
      const submissionType = String(r.submissionType || "Manual Submission");
      const submittedAt = String(r.submittedAt || new Date().toISOString());

      // Parse answers (can be object, JSON string, or individual q1...q20 parameters)
      let answers = {};
      if (typeof r.answers === "string") {
        try { answers = JSON.parse(r.answers); } catch (e) { answers = {}; }
      } else if (r.answers && typeof r.answers === "object") {
        answers = r.answers;
      }

      const row = [
        candidateCode,
        name,
        place,
        phone,
        finalScore,
        correctAnswers,
        bonusMarks,
        completionTime,
        completionSeconds,
        submissionType,
        submittedAt
      ];

      for (let q = 1; q <= 20; q++) {
        let ans = answers[q] !== undefined ? answers[q] : (data["Q" + q] || data["q" + q] || "");
        row.push(ans !== undefined && ans !== null ? ans : "");
      }

      // Check if candidate code already exists in Results; update if found, otherwise append
      const allData = sheet.getDataRange().getValues();
      let existingRow = -1;
      for (let i = 1; i < allData.length; i++) {
        if (String(allData[i][0]).trim().toUpperCase() === candidateCode) {
          existingRow = i + 1;
          break;
        }
      }

      if (existingRow > 1) {
        sheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
      } else {
        sheet.appendRow(row);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "submit",
        candidateCode: candidateCode,
        message: "Quiz submission recorded successfully"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. REGISTER PARTICIPANT
    if (action === "register" || data.participant) {
      const p = data.participant || data;
      let sheet = ss.getSheetByName(PARTICIPANTS_SHEET_NAME);
      if (!sheet) {
        sheet = ss.insertSheet(PARTICIPANTS_SHEET_NAME);
      }
      setupParticipantsSheet(sheet);

      const candidateCode = String(p.candidateCode || p.participantId || "").trim().toUpperCase();
      const name = String(p.name || "").trim();
      const place = String(p.place || p.institution || "").trim();
      const rawPhone = String(p.mobileNumber || p.phone || "").trim();
      const phone = rawPhone ? "'" + rawPhone.replace(/^'/, "") : "";
      const email = String(p.email || "").trim();
      const registeredAt = String(p.registeredAt || new Date().toISOString());
      const status = String(p.status || "registered");

      const pRow = [
        candidateCode,
        name,
        place,
        phone,
        email,
        registeredAt,
        status
      ];

      const allData = sheet.getDataRange().getValues();
      let existingRow = -1;
      for (let i = 1; i < allData.length; i++) {
        if (String(allData[i][0]).trim().toUpperCase() === candidateCode) {
          existingRow = i + 1;
          break;
        }
      }

      if (existingRow > 1) {
        sheet.getRange(existingRow, 1, 1, pRow.length).setValues([pRow]);
      } else {
        sheet.appendRow(pRow);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "register",
        candidateCode: candidateCode,
        message: "Participant registered successfully"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. RESET / CLEAR ALL DATA
    if (action === "clear_all" || action === "reset") {
      var cleared = { results: 0, participants: 0 };
      var rSheet = ss.getSheetByName(RESULTS_SHEET_NAME);
      if (rSheet && rSheet.getLastRow() > 1) {
        cleared.results = rSheet.getLastRow() - 1;
        rSheet.deleteRows(2, rSheet.getLastRow() - 1);
      }
      var pSheet = ss.getSheetByName(PARTICIPANTS_SHEET_NAME);
      if (pSheet && pSheet.getLastRow() > 1) {
        cleared.participants = pSheet.getLastRow() - 1;
        pSheet.deleteRows(2, pSheet.getLastRow() - 1);
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "clear_all",
        cleared: cleared,
        message: "All participant registrations and quiz results have been cleared successfully"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 4. DELETE A SINGLE PARTICIPANT
    if (action === "delete") {
      var codeToDelete = String(data.candidateCode || data.participantId || "").trim().toUpperCase();
      if (codeToDelete) {
        var resSheet = ss.getSheetByName(RESULTS_SHEET_NAME);
        if (resSheet && resSheet.getLastRow() > 1) {
          var rVals = resSheet.getDataRange().getValues();
          for (var ri = rVals.length - 1; ri >= 1; ri--) {
            if (String(rVals[ri][0]).trim().toUpperCase() === codeToDelete) {
              resSheet.deleteRow(ri + 1);
            }
          }
        }
        var partSheet = ss.getSheetByName(PARTICIPANTS_SHEET_NAME);
        if (partSheet && partSheet.getLastRow() > 1) {
          var pVals = partSheet.getDataRange().getValues();
          for (var pi = pVals.length - 1; pi >= 1; pi--) {
            if (String(pVals[pi][0]).trim().toUpperCase() === codeToDelete) {
              partSheet.deleteRow(pi + 1);
            }
          }
        }
        return ContentService.createTextOutput(JSON.stringify({
          status: "success",
          action: "delete",
          candidateCode: codeToDelete,
          message: "Candidate " + codeToDelete + " deleted successfully"
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Unknown action"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Check if GET action is requested (e.g. ?action=reset)
    if (e && e.parameter && (e.parameter.action === "reset" || e.parameter.action === "clear_all")) {
      var rSheet = ss.getSheetByName(RESULTS_SHEET_NAME);
      if (rSheet && rSheet.getLastRow() > 1) {
        rSheet.deleteRows(2, rSheet.getLastRow() - 1);
      }
      var pSheet = ss.getSheetByName(PARTICIPANTS_SHEET_NAME);
      if (pSheet && pSheet.getLastRow() > 1) {
        pSheet.deleteRows(2, pSheet.getLastRow() - 1);
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "reset",
        message: "All sheets cleared via GET action"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const results = [];
    const participants = [];

    // 1. Read Results
    const resultsSheet = ss.getSheetByName(RESULTS_SHEET_NAME);
    if (resultsSheet) {
      const rData = resultsSheet.getDataRange().getValues();
      if (rData.length > 1) {
        for (let i = 1; i < rData.length; i++) {
          const row = rData[i];
          if (!row[0]) continue;
          const answersObj = {};
          for (let q = 1; q <= 20; q++) {
            if (row[10 + q] !== "" && row[10 + q] !== undefined) {
              answersObj[q] = Number(row[10 + q]);
            }
          }
          results.push({
            candidateCode: String(row[0]),
            participantId: String(row[0]),
            name: String(row[1] || ""),
            place: String(row[2] || ""),
            institution: String(row[2] || ""),
            mobileNumber: String(row[3] || "").replace(/^'/, ""),
            phone: String(row[3] || "").replace(/^'/, ""),
            finalScore: Number(row[4] || 0),
            correctAnswers: Number(row[5] || 0),
            totalQuestions: 20,
            bonusMarks: Number(row[6] || 0),
            completionTime: String(row[7] || ""),
            completionSeconds: Number(row[8] || 0),
            submissionType: String(row[9] || "Manual Submission"),
            submittedAt: String(row[10] || ""),
            status: "submitted",
            answers: answersObj
          });
        }
      }
    }

    // 2. Read Participants
    const partSheet = ss.getSheetByName(PARTICIPANTS_SHEET_NAME);
    if (partSheet) {
      const pData = partSheet.getDataRange().getValues();
      if (pData.length > 1) {
        for (let j = 1; j < pData.length; j++) {
          const pRow = pData[j];
          if (!pRow[0]) continue;
          participants.push({
            candidateCode: String(pRow[0]),
            participantId: String(pRow[0]),
            name: String(pRow[1] || ""),
            place: String(pRow[2] || ""),
            institution: String(pRow[2] || ""),
            mobileNumber: String(pRow[3] || "").replace(/^'/, ""),
            phone: String(pRow[3] || "").replace(/^'/, ""),
            email: String(pRow[4] || ""),
            registeredAt: String(pRow[5] || ""),
            status: String(pRow[6] || "registered")
          });
        }
      }
    }

    const payload = {
      status: "success",
      totalResults: results.length,
      totalParticipants: participants.length,
      results: results,
      participants: participants
    };

    const output = JSON.stringify(payload);
    const callback = e && e.parameter && e.parameter.callback;
    if (callback) {
      return ContentService.createTextOutput(callback + "(" + output + ")")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    return ContentService.createTextOutput(output)
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    const errPayload = { status: "error", message: err.toString() };
    const callback = e && e.parameter && e.parameter.callback;
    if (callback) {
      return ContentService.createTextOutput(callback + "(" + JSON.stringify(errPayload) + ")")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(JSON.stringify(errPayload))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

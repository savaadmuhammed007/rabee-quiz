# 📊 Google Sheets Live Backend Integration Guide for "ഉർവതൽ വുസ്ഖ്വ മെഗാ ക്വിസ്"

This quiz application uses **Google Sheets** via **Google Apps Script** as a real-time, multi-device cloud database. Participant registrations and completed quiz submissions from all mobile phones are automatically recorded into your spreadsheet!

---

## 🚀 3-Minute Setup (Same as Nuvana Giveaway)

### Step 1: Create a Google Sheet
1. Open [Google Sheets](https://sheets.new) and create a new blank spreadsheet.
2. Name it: **`ഉർവതൽ വുസ്ഖ്വ മെഗാ ക്വിസ് 2026`**

### Step 2: Open Apps Script
1. In the Google Sheet top menu, click **Extensions** → **Apps Script**.
2. Erase any existing code in the editor.
3. Open the file [`google-apps-script/Code.gs`](./google-apps-script/Code.gs) in this project, copy all its code, and paste it into the Apps Script editor.
4. Click **Save (💾)** or press `Ctrl + S`.

### Step 3: Deploy as Web App
1. Click the blue **Deploy** button (top right) → select **New deployment**.
2. Click the gear icon (⚙️) next to "Select type" and choose **Web app**.
3. Fill in the deployment details:
   - **Description**: `Rabee Mega Quiz API`
   - **Execute as**: `Me (your-email@gmail.com)`
   - **Who has access**: **`Anyone`** ⚠️ *(Crucial: Must be "Anyone" so participant devices can submit scores securely without login)*
4. Click **Deploy**.
5. Grant access / Authorize permissions if prompted by Google.
6. Copy the **Web App URL** (it will look like `https://script.google.com/macros/s/AKfycb.../exec`).

### Step 4: Connect to Your Website (Multi-Device Sync)
Set your copied URL in either of two ways:

#### Option A: In-App Admin Settings (Immediate)
1. On the quiz website, open the Admin Portal (via `/#admin`).
2. Go to **Settings & Cloud Sync**.
3. Paste your Web App URL into the box and click **Save URL** & **Test Connection**.

#### Option B: Environment Variable / Default Config (`.env` or `sheetConfig.js`)
In `.env` or `src/config/sheetConfig.js`:
```env
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycb.../exec
```
Once deployed, **every participant phone opening the quiz automatically submits to your Google Sheet!**

---

## 📋 Google Sheet Tabs Automatically Formatted:

### 1. `Results` Tab:
1. **Candidate Code**: e.g., `RABEE-0001`
2. **Name**: Full Name
3. **Place**: Institution / Location
4. **Mobile Number**: Formatted as plain text
5. **Final Score**: Correct answers + Speed bonus
6. **Correct Answers**: Count out of 20
7. **Speed Bonus**: Bonus marks (≤ 2m: +10, ≤ 3m: +9, ≤ 4m: +8, down to ≤ 10m: +2)
8. **Completion Time**: Duration in `MM:SS` format
9. **Completion Seconds**: Elapsed seconds
10. **Submission Type**: Manual or Time Limit
11. **Submitted At**: Timestamp
12. **Q1 – Q20**: Detailed participant answers for every question

### 2. `Participants` Tab:
1. **Candidate Code**
2. **Name**
3. **Place**
4. **Mobile Number**
5. **Email**
6. **Registered At**
7. **Status**

---

## 🔄 How to Reset All Data & Allow Devices to Retake the Quiz:

1. **Automatic Device Reset (Zero Action Needed)**:
   - When you push/deploy this update, all participant devices automatically reset on next visit because the Quiz Session has been bumped to `round1`.
2. **From the "Already Submitted" Screen**:
   - Any device showing "You Have Already Submitted" now has a button: **`Reset This Device (പുതിയ എൻട്രി നൽകുക)`**. Tapping it instantly clears that device.
3. **From Admin Settings**:
   - Click **`Reset All Quiz Data Everywhere`** under Danger Zone.
   - Or click **`Copy Retake / Reset Quiz Link`** (`/?reset=1`) to share via WhatsApp.
4. **In Google Sheets**:
   - To remove past test entries (e.g. `TEST-0001`), select rows 2 and below in both the **`Results`** and **`Participants`** sheets, right-click, and choose **Delete rows**.

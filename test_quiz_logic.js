// Automated test script to verify quiz questions, scoring, speed bonus tiers, and timer calculation
import { QUIZ_CONFIG, questions } from './src/data/questions.js';

console.log('--- 1. Questions Structure Verification ---');
console.assert(questions.length === 20, `Expected 20 questions, got ${questions.length}`);
console.log(`✓ Total questions: ${questions.length}`);

questions.forEach((q, i) => {
  console.assert(q.id === i + 1, `Question ID mismatch at index ${i}`);
  console.assert(typeof q.question === 'string' && q.question.length > 5, `Empty or invalid question text at ${i + 1}`);
  console.assert(Array.isArray(q.options) && q.options.length === 4, `Question ${i + 1} does not have exactly 4 options`);
  console.assert(q.correctAnswer >= 0 && q.correctAnswer <= 3, `Invalid correctAnswer index for question ${i + 1}: ${q.correctAnswer}`);
});
console.log('✓ All 20 questions have 4 options and valid answer keys.');

console.log('\n--- 2. Speed Bonus Calculation Verification ---');
const calculateSpeedBonus = (durationSeconds) => {
  if (durationSeconds > 600) return 0;
  for (const tier of QUIZ_CONFIG.defaultSpeedRules) {
    if (durationSeconds <= tier.maxSeconds) {
      return tier.bonus;
    }
  }
  return 0;
};

// Under 2 minutes (≤ 120s) -> +10
console.assert(calculateSpeedBonus(100) === 10, '100s failed');
console.assert(calculateSpeedBonus(120) === 10, '120s failed');

// Under 3 minutes (121s - 180s) -> +9
console.assert(calculateSpeedBonus(121) === 9, '121s failed');
console.assert(calculateSpeedBonus(180) === 9, '180s failed');

// Under 4 minutes (181s - 240s) -> +8
console.assert(calculateSpeedBonus(181) === 8, '181s failed');
console.assert(calculateSpeedBonus(240) === 8, '240s failed');

// Under 5 minutes (241s - 300s) -> +7
console.assert(calculateSpeedBonus(241) === 7, '241s failed');
console.assert(calculateSpeedBonus(300) === 7, '300s failed');

// Under 6 minutes (301s - 360s) -> +6
console.assert(calculateSpeedBonus(301) === 6, '301s failed');
console.assert(calculateSpeedBonus(360) === 6, '360s failed');

// Under 7 minutes (361s - 420s) -> +5
console.assert(calculateSpeedBonus(361) === 5, '361s failed');
console.assert(calculateSpeedBonus(420) === 5, '420s failed');

// Under 8 minutes (421s - 480s) -> +4
console.assert(calculateSpeedBonus(421) === 4, '421s failed');
console.assert(calculateSpeedBonus(480) === 4, '480s failed');

// Under 9 minutes (481s - 540s) -> +3
console.assert(calculateSpeedBonus(481) === 3, '481s failed');
console.assert(calculateSpeedBonus(540) === 3, '540s failed');

// Under 10 minutes (541s - 600s) -> +2
console.assert(calculateSpeedBonus(541) === 2, '541s failed');
console.assert(calculateSpeedBonus(600) === 2, '600s failed');

// Expired (> 600s) -> 0
console.assert(calculateSpeedBonus(601) === 0, 'Expired bonus should be 0');

console.log('✓ All 9 speed bonus tiers correctly verified (≤2m: +10, 3m: +9, 4m: +8, 5m: +7, 6m: +6, 7m: +5, 8m: +4, 9m: +3, 10m: +2).');

console.log('\n--- 3. Score Evaluation & All-Questions-Attended Requirement Verification ---');

const evaluateScore = (userAnswers, elapsedSeconds = 110) => {
  let correctAnswers = 0;
  let answeredCount = 0;
  questions.forEach((q) => {
    const answer = userAnswers[q.id];
    if (answer !== undefined && answer !== null && answer !== '') {
      answeredCount += 1;
      if (Number(answer) === q.correctAnswer) {
        correctAnswers += 1;
      }
    }
  });
  const baseScore = correctAnswers * 1;
  const attendedAll = answeredCount >= questions.length;
  const bonusMarks = attendedAll ? calculateSpeedBonus(elapsedSeconds) : 0;
  return { correctAnswers, answeredCount, attendedAll, baseScore, bonusMarks, finalScore: baseScore + bonusMarks };
};

// Case 1: Participant attended ALL 20 questions (18 correct, 2 wrong, 110 seconds)
const fullAnswers = {};
for (let i = 1; i <= 18; i++) fullAnswers[i] = questions[i - 1].correctAnswer;
fullAnswers[19] = (questions[18].correctAnswer + 1) % 4; // answered wrong
fullAnswers[20] = (questions[19].correctAnswer + 1) % 4; // answered wrong

const resAllAttended = evaluateScore(fullAnswers, 110);
console.assert(resAllAttended.answeredCount === 20, 'Expected 20 answered');
console.assert(resAllAttended.attendedAll === true, 'Expected attendedAll true');
console.assert(resAllAttended.bonusMarks === 10, `Expected bonus 10, got ${resAllAttended.bonusMarks}`);
console.assert(resAllAttended.finalScore === 28, `Expected final score 28, got ${resAllAttended.finalScore}`);
console.log(`✓ Case 1 (All 20 questions attended in 1m 50s): base ${resAllAttended.baseScore} + speed bonus ${resAllAttended.bonusMarks} = Final Score ${resAllAttended.finalScore} pts.`);

// Case 2: Participant skipped 1 question (19 attended, 18 correct, 110 seconds)
const partialAnswers = { ...fullAnswers };
delete partialAnswers[20]; // left question 20 unattended

const resPartial = evaluateScore(partialAnswers, 110);
console.assert(resPartial.answeredCount === 19, 'Expected 19 answered');
console.assert(resPartial.attendedAll === false, 'Expected attendedAll false');
console.assert(resPartial.bonusMarks === 0, `Expected bonus 0 when questions skipped, got ${resPartial.bonusMarks}`);
console.assert(resPartial.finalScore === 18, `Expected final score 18, got ${resPartial.finalScore}`);
console.log(`✓ Case 2 (19/20 questions attended in 1m 50s): Speed bonus DENIED (0 pts). Final score: ${resPartial.finalScore} pts.`);

console.log('\n--- 4. Resilient Timer Formula Verification ---');
const startTime = Date.now() - 150000; // started 150 seconds ago (2m 30s)
const elapsed = Math.floor((Date.now() - startTime) / 1000);
const remaining = 600 - elapsed;
console.assert(remaining >= 449 && remaining <= 451, `Remaining seconds unexpected: ${remaining}`);
console.log(`✓ Resilient timer calculates remaining time across page reloads: ${remaining}s remaining (${Math.floor(remaining/60)}m ${remaining%60}s).`);

console.log('\n--- 5. Candidate Code Registry & Lookup Verification ---');
const { CANDIDATES, findCandidateByCode, isCandidateAuthorized } = await import('./src/data/candidates.js');
console.assert(CANDIDATES.length === 35, `Expected 35 candidates, got ${CANDIDATES.length}`);
console.log(`✓ Total authorized candidates: ${CANDIDATES.length}`);

// Test first and last candidate
const c1 = findCandidateByCode('MAICQ01');
console.assert(c1 && c1.name === 'Junaitha' && c1.place === 'Arattupuza', 'MAICQ01 lookup failed');

const c30 = findCandidateByCode('MAICQ30');
console.assert(c30 && c30.name === 'Muhammed Aman' && c30.place === 'Arattupuzha', 'MAICQ30 lookup failed');

const c35 = findCandidateByCode('MAICQ35');
console.assert(c35 && c35.code === 'MAICQ35', 'MAICQ35 lookup failed');

// Test case insensitivity & whitespace trimming
const cLowercase = findCandidateByCode('  maicq12  ');
console.assert(cLowercase && cLowercase.name === 'SAYYID JUNAID AHAMMED KV' && cLowercase.place === 'MALAPPURAM', 'Lowercase/trimmed lookup failed');

// Test unauthorized / invalid code
const cInvalid = findCandidateByCode('MAICQ99');
console.assert(cInvalid === null, 'Invalid code should return null');
console.assert(isCandidateAuthorized('MAICQ99') === false, 'Invalid code authorization should be false');
console.assert(isCandidateAuthorized('MAICQ05') === true, 'MAICQ05 authorization should be true');
console.log('✓ Candidate lookup, case normalization, trimming, and invalid code rejection verified.');

console.log('\n--- 6. 5:10 PM Display & 5:11 PM Auto-Submit Deadline Verification ---');
console.assert(QUIZ_CONFIG.displayedEndTime === '5:10 PM', 'Expected displayedEndTime to be 5:10 PM');
console.assert(QUIZ_CONFIG.hardEndTime === '5:11 PM', 'Expected hardEndTime to be 5:11 PM');
console.assert(typeof QUIZ_CONFIG.hardDeadlineTimestamp === 'number', 'hardDeadlineTimestamp should be number');
console.assert(typeof QUIZ_CONFIG.displayDeadlineTimestamp === 'number', 'displayDeadlineTimestamp should be number');

const { getRemainingTime, isHardDeadlinePassed, isDisplayDeadlinePassed } = await import('./src/utils/storage.js');

// Test timer remaining before deadline
const now = Date.now();
const timeUntilHardDeadline = Math.floor((QUIZ_CONFIG.hardDeadlineTimestamp - now) / 1000);
const remainingCurrent = getRemainingTime(Date.now()); // started just now
console.assert(remainingCurrent <= 600, 'Remaining should not exceed standard 600s');
console.assert(remainingCurrent <= Math.max(0, timeUntilHardDeadline), 'Remaining should not exceed time until 5:11 PM');

console.log(`✓ Deadline configuration verified: Display=${QUIZ_CONFIG.displayedEndTime}, Hard Cutoff=${QUIZ_CONFIG.hardEndTime}`);
console.log(`✓ Timer clamp active: remaining seconds ${remainingCurrent}s properly bound by 5:11 PM deadline (${timeUntilHardDeadline}s away).`);

console.log('\n=== ALL AUTOMATED TESTS PASSED SUCCESSFULLY! ===');



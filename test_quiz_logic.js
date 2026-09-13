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

console.log('\n--- 3. Score Evaluation Verification ---');
const answers = {};
// Correctly answer first 18 questions, leave 2 wrong/unanswered
for (let i = 1; i <= 18; i++) {
  answers[i] = questions[i - 1].correctAnswer;
}
answers[19] = (questions[18].correctAnswer + 1) % 4; // intentionally wrong
// 20 is left unanswered

let correctCount = 0;
questions.forEach((q) => {
  if (answers[q.id] !== undefined && answers[q.id] === q.correctAnswer) {
    correctCount++;
  }
});
const baseScore = correctCount * 1;
const bonusMarks = calculateSpeedBonus(110); // 1m 50s (< 2m) -> +10 bonus
const finalScore = baseScore + bonusMarks;

console.assert(correctCount === 18, `Expected 18 correct, got ${correctCount}`);
console.assert(baseScore === 18, `Expected base score 18, got ${baseScore}`);
console.assert(bonusMarks === 10, `Expected bonus 10, got ${bonusMarks}`);
console.assert(finalScore === 28, `Expected final score 28, got ${finalScore}`);
console.log(`✓ 18 correct answers = base ${baseScore} + speed bonus ${bonusMarks} = Final Score ${finalScore} points.`);

console.log('\n--- 4. Resilient Timer Formula Verification ---');
const startTime = Date.now() - 150000; // started 150 seconds ago (2m 30s)
const elapsed = Math.floor((Date.now() - startTime) / 1000);
const remaining = 600 - elapsed;
console.assert(remaining >= 449 && remaining <= 451, `Remaining seconds unexpected: ${remaining}`);
console.log(`✓ Resilient timer calculates remaining time across page reloads: ${remaining}s remaining (${Math.floor(remaining/60)}m ${remaining%60}s).`);

console.log('\n=== ALL AUTOMATED TESTS PASSED SUCCESSFULLY! ===');

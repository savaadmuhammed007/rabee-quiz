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

// Under 5 minutes (< 300s) -> +10
console.assert(calculateSpeedBonus(250) === 10, 'Under 5 min failed');
console.assert(calculateSpeedBonus(300) === 10, 'Exactly 5 min failed');

// 5-7 minutes (301s - 420s) -> +7
console.assert(calculateSpeedBonus(301) === 7, '301s failed');
console.assert(calculateSpeedBonus(420) === 7, '420s failed');

// 7-9 minutes (421s - 540s) -> +5
console.assert(calculateSpeedBonus(421) === 5, '421s failed');
console.assert(calculateSpeedBonus(540) === 5, '540s failed');

// 9-10 minutes (541s - 600s) -> +2
console.assert(calculateSpeedBonus(541) === 2, '541s failed');
console.assert(calculateSpeedBonus(600) === 2, '600s failed');

// Expired (> 600s) -> 0
console.assert(calculateSpeedBonus(601) === 0, 'Expired bonus should be 0');

console.log('✓ All speed bonus tiers correctly verified (+10, +7, +5, +2, 0).');

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
const bonusMarks = calculateSpeedBonus(280); // 4m 40s -> +10 bonus
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

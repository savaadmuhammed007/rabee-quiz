/**
 * Rabee Quiz 2026 - Official Question Bank
 * Exactly 20 authentic multiple-choice questions in Malayalam.
 * 
 * IMPORTANT:
 * - 'correctAnswer' is the zero-based index (0, 1, 2, or 3) of the correct option.
 * - This answer key is processed strictly internally by scoring utilities.
 * - It is NEVER sent or exposed to the participant's quiz or submission view.
 */

export const QUIZ_CONFIG = {
  title: "ഉർവതൽ വുസ്ഖ്വ",
  subtitle: "മെഗാ ക്വിസ് മത്സരം",
  totalQuestions: 20,
  durationMinutes: 10,
  durationSeconds: 600, // exactly 10 minutes (600 seconds)
  warningThresholdSeconds: 120, // visual alert when < 2 minutes remain
  defaultSpeedRules: [
    { label: "Under 2 minutes (≤ 120s)", maxSeconds: 120, bonus: 10 },
    { label: "Under 3 minutes (121s - 180s)", maxSeconds: 180, bonus: 9 },
    { label: "Under 4 minutes (181s - 240s)", maxSeconds: 240, bonus: 8 },
    { label: "Under 5 minutes (241s - 300s)", maxSeconds: 300, bonus: 7 },
    { label: "Under 6 minutes (301s - 360s)", maxSeconds: 360, bonus: 6 },
    { label: "Under 7 minutes (361s - 420s)", maxSeconds: 420, bonus: 5 },
    { label: "Under 8 minutes (421s - 480s)", maxSeconds: 480, bonus: 4 },
    { label: "Under 9 minutes (481s - 540s)", maxSeconds: 540, bonus: 3 },
    { label: "Under 10 minutes (541s - 600s)", maxSeconds: 600, bonus: 2 },
  ],
};

export const questions = [
  {
    id: 1,
    question: "നബി തങ്ങൾക്ക് ആദ്യമായി സലാം പറഞ്ഞ സ്വഹാബി ആര് ?",
    options: [
      "അബ്ദുല്ലാഹിബ്നു മസ്ഊദ് (റ)",
      "അബൂബക്കർ സിദ്ദീഖ് (റ)",
      "അബൂദറുൽ ഗിഫാരി (റ)",
      "അലിയ്യ് ബിൻ അബീത്വാലിബ് (റ)"
    ],
    correctAnswer: 2
  },
  {
    id: 2,
    question: "നബി തങ്ങൾ ആദ്യമായി രഹസ്യ പ്രബോധനം നടത്തിയ സ്ഥലം ?",
    options: [
      "ദാറുന്നദ്വ",
      "ദാറുൽ അർഖം",
      "ദാറു റഹ്മ",
      "ദാറുൽ അംറ്"
    ],
    correctAnswer: 1
  },
  {
    id: 3,
    question: "അലി (റ) വിൻ്റെ മൂന്നാമത്തെ മകൻ്റെ പേരെന്ത്?",
    options: [
      "ഹസൻ",
      "ഇഹ്സാൻ",
      "ഹുസൈൻ",
      "മുഹ്സിൻ"
    ],
    correctAnswer: 3
  },
  {
    id: 4,
    question: "ഖന്തഖ് യുദ്ധത്തിൽ മദീനയുടെ ഏത് ഭാഗത്താണ് കിടങ്ങ് കുഴിച്ചത്?",
    options: [
      "കിഴക്ക്",
      "വടക്ക്",
      "തെക്ക്",
      "പടിഞ്ഞാറ്"
    ],
    correctAnswer: 1
  },
  {
    id: 5,
    question: "നബി തങ്ങളുടെ ഉമ്മയുടെ സഹോദരങ്ങളിൽ ഒരാൾ അസ്വദ് ആണ്. മറ്റു രണ്ട് പേർ ആരെല്ലാം ?",
    options: [
      "അബൂ യാഖൂത്, അബ്ദുള്ള",
      "ഫുറൈഅ, അബൂ യാഖൂത്",
      "ഫുളൈൽ, അബൂ യാഖൂത്",
      "അസ്വദ്, ഫുളൈൽ"
    ],
    correctAnswer: 1
  },
  {
    id: 6,
    question: "ഉസ്മാൻ (റ) വിൻ്റെ ഖിലാഫത്ത് കാലം എത്ര?",
    options: [
      "12 വർഷം, 12 മാസം, 18 ദിവസം",
      "12 വർഷം, 11 മാസം, 18 ദിവസം",
      "11 വർഷം, 11 മാസം, 18 ദിവസം",
      "18 വർഷം, 11 മാസം, 12 ദിവസം"
    ],
    correctAnswer: 2
  },
  {
    id: 7,
    question: "ഉമർ (റ) വിൻ്റെ സഹോദരിയെയും സഹോദരീ ഭർത്താവിനെയും ഖുർആൻ പഠിപ്പിക്കാൻ വന്നതാര് ?",
    options: [
      "ഖബ്ബാബ് (റ)",
      "അബൂ ഉബൈദ (റ)",
      "ഖുബൈബ് (റ)",
      "ജഅ്ഫർ (റ)"
    ],
    correctAnswer: 0
  },
  {
    id: 8,
    question: "നബി തങ്ങൾ ഏറ്റവും സ്നേഹിക്കുന്ന വ്യക്തികൾ ആരൊക്കെയെന്ന് ആയിഷ ബീവിയോട് ചോദിച്ചപ്പോൾ അവിടുന്നു മൂന്നാമതായി പറഞ്ഞത് ആരെയാണ് ?",
    options: [
      "അബൂബക്കർ (റ)",
      "ഉമർ (റ)",
      "അലി (റ)",
      "അബൂ ഉബൈദ (റ)"
    ],
    correctAnswer: 3
  },
  {
    id: 9,
    question: "നബി തങ്ങളുടെ ജനന സമയത്ത് ആമിന ബീവിക്ക് സഹായിയായി വന്ന വനിത ആര് ?",
    options: [
      "ഷിഫാ ബിൻത് അംറ്",
      "റുഖയ്യ",
      "ബറക",
      "ഫാത്തിമ ബിൻത് ഉമർ"
    ],
    correctAnswer: 0
  },
  {
    id: 10,
    question: "പ്രവാചക ചരിത്രം വിശകലനം ചെയ്യുന്ന Muhammad: A Prophet for Our Time എന്ന പുസ്തകത്തിൻ്റെ രചയിതാവ് ആര്?",
    options: [
      "കാരൻ ആംസ്ട്രോങ്",
      "മൈക്കിൾ മോർഗൻ",
      "ഗ്രിഗർ ഷോളർ",
      "റിച്ചാർഡ് ഗബ്രിയേൽ"
    ],
    correctAnswer: 0
  },
  {
    id: 11,
    question: "ബദ്രീങ്ങളുടെ മഹത്വം വിവരിക്കുന്ന ഖുർആനിക സൂക്തം ഏത് ?",
    options: [
      "സൂറതുൽ മാഇദ",
      "സൂറതു ന്നൂർ",
      "സൂറതുൽ ഫത്ഹ്",
      "സൂറതു അൻഫാൽ"
    ],
    correctAnswer: 3
  },
  {
    id: 12,
    question: "നബി തങ്ങൾ പങ്കെടുക്കാത്ത യുദ്ധങ്ങൾക്ക് പറയുന്ന പേരെന്ത്?",
    options: [
      "ഹർബ്",
      "ഗസ്വത്ത്",
      "സരിയ്യത്ത്",
      "ഫത്ഹ്"
    ],
    correctAnswer: 2
  },
  {
    id: 13,
    question: "അസ്മാഅ് ബിൻത് അബീബക്കർ (റ) വിനെ വിശേഷിപ്പിക്കുന്ന പേരെന്ത്?",
    options: [
      "ദുന്നൂറൈൻ",
      "ദുൽ ഹിമം",
      "ദാതുന്നിതാഖൈൻ",
      "ദുൽ ഹുദൈഫ്"
    ],
    correctAnswer: 2
  },
  {
    id: 14,
    question: "സൗർ ഗുഹയിൽ നബി തങ്ങൾക്ക് പാലുമായി എത്തിയതാര് ?",
    options: [
      "ആമിർ ബിൻ ഫുഹൈർ",
      "അസ്മാഅ് ബീവി",
      "അബൂബക്കർ (റ)",
      "ഇബ്നു ഉമർ (റ)"
    ],
    correctAnswer: 0
  },
  {
    id: 15,
    question: "നബി തങ്ങൾക്ക് മുമ്പുള്ള ഖദീജ ബീവിയുടെ ഭർത്താക്കന്മാർ ആരെല്ലാം ?",
    options: [
      "ഹിന്ദ്, അത്വീഖ്",
      "അബൂ ഹാല, അത്വീഖ്",
      "അബൂ ഹാല, ബറക",
      "ഹാല, ഹിന്ദ്"
    ],
    correctAnswer: 1
  },
  {
    id: 16,
    question: "ഉമ്മു സലമ ബീവിയുടെ ജനാസ നിസ്കാരത്തിന് നേതൃത്വം നൽകിയതാര് ?",
    options: [
      "അബൂബക്കർ (റ)",
      "ഉസ്മാൻ (റ)",
      "സഈദ് (റ)",
      "അബൂ ഹുറൈറ (റ)"
    ],
    correctAnswer: 3
  },
  {
    id: 17,
    question: "അബൂ ഹഫ്സ എന്ന പേരിൽ അറിയപ്പെടുന്ന സഹാബി ആര് ?",
    options: [
      "ഉസ്മാൻ (റ)",
      "സഈദ് (റ)",
      "സൈദ് (റ)",
      "ഉമർ (റ)"
    ],
    correctAnswer: 3
  },
  {
    id: 18,
    question: "ഏത് യുദ്ധ സമയത്താണ് റുഖയ്യ ബീവി വഫാത്തായത് ?",
    options: [
      "ഖന്തഖ്",
      "ഉഹ്ദ്",
      "ബദ്ർ",
      "ഹുനൈൻ"
    ],
    correctAnswer: 2
  },
  {
    id: 19,
    question: "തഖ്വയുടെ മേൽ തറക്കല്ലിട്ട പള്ളി എന്ന് ഖുർആൻ വിശേഷിപ്പിച്ചത് ഏത് പള്ളിയെയാണ് ?",
    options: [
      "മസ്ജിദുൽ അഖ്സ",
      "മസ്ജിദുൽ ഖുബാ",
      "മസ്ജിദു തഖ്വ",
      "മസ്ജിദുൽ ഹറാം"
    ],
    correctAnswer: 1
  },
  {
    id: 20,
    question: "മാരിയത്തുൽ ഖിബ്തിയ്യ എന്നവർ ജനിച്ച രാജ്യം ഏത്?",
    options: [
      "മലേഷ്യ",
      "മൊറോക്കോ",
      "ഈജിപ്ത്",
      "ഇറാഖ്"
    ],
    correctAnswer: 2
  }
];

'use strict';

const { CAT, FISH, EGG, parseScore, calcGroupEmojis, calcScore, calcAwards, sortedKeys, esc, formatNames } = require('./lib');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a 10-emoji array by repeating a pattern. */
function emojis10(...items) {
  const arr = [];
  for (const [emoji, count] of items) {
    for (let i = 0; i < count; i++) arr.push(emoji);
  }
  return arr;
}

function makeEntry(name, emojiArr) {
  return { name, score: calcScore(emojiArr), emojis: emojiArr };
}

// ---------------------------------------------------------------------------
// parseScore
// ---------------------------------------------------------------------------

describe('parseScore', () => {
  const VALID_SHARE = `catfishing.net\n#626 - 5/10\n🐈🐟🐟🐟🐈\n🐈🐈🐟🐈🐟`;

  test('returns puzzle number and 10 emojis for valid input', () => {
    const result = parseScore(VALID_SHARE);
    expect(result.error).toBeUndefined();
    expect(result.puzzle).toBe(626);
    expect(result.emojis).toHaveLength(10);
  });

  test('returns puzzle number as an integer (not string)', () => {
    const result = parseScore(VALID_SHARE);
    expect(typeof result.puzzle).toBe('number');
    expect(result.puzzle).toBe(626);
  });

  test('correctly extracts all three emoji types', () => {
    const share = `catfishing.net\n#1 - 5/10\n🐈🐟🥚🐈🐟\n🥚🐈🐟🐈🐟`;
    const result = parseScore(share);
    expect(result.emojis).toEqual([CAT, FISH, EGG, CAT, FISH, EGG, CAT, FISH, CAT, FISH]);
  });

  test('returns error when no puzzle number found', () => {
    const result = parseScore('no puzzle number here 🐈🐟🐟🐟🐈🐈🐈🐟🐈🐟');
    expect(result.error).toBeDefined();
    expect(result.puzzle).toBeUndefined();
  });

  test('returns error with count when fewer than 10 emojis', () => {
    const result = parseScore('catfishing.net\n#626\n🐈🐟🐟');
    expect(result.error).toBeDefined();
    expect(result.error).toMatch(/3/);
  });

  test('returns error with count when more than 10 emojis', () => {
    const result = parseScore('catfishing.net\n#626\n🐈🐟🐟🐟🐈🐈🐈🐟🐈🐟🐈🐈');
    expect(result.error).toBeDefined();
    expect(result.error).toMatch(/12/);
  });

  test('ignores non-emoji characters between emojis', () => {
    const share = '#1\n🐈 text 🐟\n(notes) 🥚🐈🐟🥚🐈🐟🐈🐟';
    const result = parseScore(share);
    expect(result.error).toBeUndefined();
    expect(result.emojis).toHaveLength(10);
  });

  test('singular emoji in error message when count is 1', () => {
    const result = parseScore('#626 🐈');
    expect(result.error).toMatch(/1 emoji\b/);
  });
});

// ---------------------------------------------------------------------------
// calcGroupEmojis — README: "How the group score works"
// ---------------------------------------------------------------------------

describe('calcGroupEmojis', () => {
  test('anyone got CAT → group gets CAT', () => {
    const entries = [
      makeEntry('A', emojis10([CAT, 1], [FISH, 9])),
      makeEntry('B', emojis10([FISH, 10])),
    ];
    const group = calcGroupEmojis(entries);
    expect(group[0]).toBe(CAT);
  });

  test('CAT beats EGG: one CAT, one EGG on same question → group gets CAT', () => {
    const entries = [
      makeEntry('A', emojis10([CAT, 1], [FISH, 9])),
      makeEntry('B', emojis10([EGG, 1], [FISH, 9])),
    ];
    const group = calcGroupEmojis(entries);
    expect(group[0]).toBe(CAT);
  });

  test('nobody got CAT, someone got EGG → group gets EGG', () => {
    const entries = [
      makeEntry('A', emojis10([EGG, 1], [FISH, 9])),
      makeEntry('B', emojis10([FISH, 10])),
    ];
    const group = calcGroupEmojis(entries);
    expect(group[0]).toBe(EGG);
  });

  test('everyone got FISH → group gets FISH', () => {
    const entries = [
      makeEntry('A', emojis10([FISH, 10])),
      makeEntry('B', emojis10([FISH, 10])),
    ];
    const group = calcGroupEmojis(entries);
    expect(group.every(e => e === FISH)).toBe(true);
  });

  test('single entry: group mirrors individual', () => {
    const emojiArr = [CAT, FISH, EGG, CAT, FISH, EGG, CAT, FISH, EGG, FISH];
    const entries  = [makeEntry('Solo', emojiArr)];
    expect(calcGroupEmojis(entries)).toEqual(emojiArr);
  });

  test('all 10 positions are computed independently', () => {
    // Q0: A has CAT, B has FISH → CAT
    // Q1: A has FISH, B has EGG  → EGG
    // Q2: A has FISH, B has FISH → FISH
    const emojiA = [CAT,  FISH, FISH, CAT, CAT, CAT, CAT, CAT, CAT, CAT];
    const emojiB = [FISH, EGG,  FISH, CAT, CAT, CAT, CAT, CAT, CAT, CAT];
    const group = calcGroupEmojis([makeEntry('A', emojiA), makeEntry('B', emojiB)]);
    expect(group[0]).toBe(CAT);
    expect(group[1]).toBe(EGG);
    expect(group[2]).toBe(FISH);
  });

  test('returns exactly 10 elements', () => {
    const entries = [makeEntry('A', emojis10([CAT, 10]))];
    expect(calcGroupEmojis(entries)).toHaveLength(10);
  });
});

// ---------------------------------------------------------------------------
// calcScore — README: "🐈 as 1 point, 🥚 as 0.5"
// ---------------------------------------------------------------------------

describe('calcScore', () => {
  test('all CAT → "10/10"', () => {
    expect(calcScore(emojis10([CAT, 10]))).toBe('10/10');
  });

  test('all FISH → "0/10"', () => {
    expect(calcScore(emojis10([FISH, 10]))).toBe('0/10');
  });

  test('all EGG → "5/10"', () => {
    expect(calcScore(emojis10([EGG, 10]))).toBe('5/10');
  });

  test('5 CAT + 5 FISH → "5/10"', () => {
    expect(calcScore(emojis10([CAT, 5], [FISH, 5]))).toBe('5/10');
  });

  test('1 CAT + 1 EGG + 8 FISH → "1.5/10"', () => {
    expect(calcScore([CAT, EGG, FISH, FISH, FISH, FISH, FISH, FISH, FISH, FISH])).toBe('1.5/10');
  });

  test('real fixture — Cara NO scores 4.5/10', () => {
    // From scores-history/scores.json puzzle 626
    const caraEmojis = [CAT, FISH, FISH, CAT, CAT, CAT, EGG, FISH, FISH, FISH];
    expect(calcScore(caraEmojis)).toBe('4.5/10');
  });
});

// ---------------------------------------------------------------------------
// sortedKeys
// ---------------------------------------------------------------------------

describe('sortedKeys', () => {
  test('returns keys sorted numerically descending', () => {
    expect(sortedKeys({ '626': [], '627': [], '625': [] })).toEqual(['627', '626', '625']);
  });

  test('numeric sort, not lexicographic: 100 > 10 > 9', () => {
    expect(sortedKeys({ '10': [], '9': [], '100': [] })).toEqual(['100', '10', '9']);
  });

  test('empty object → empty array', () => {
    expect(sortedKeys({})).toEqual([]);
  });

  test('single key → single-element array', () => {
    expect(sortedKeys({ '42': [] })).toEqual(['42']);
  });
});

// ---------------------------------------------------------------------------
// esc
// ---------------------------------------------------------------------------

describe('esc', () => {
  test('escapes &', () => expect(esc('a&b')).toBe('a&amp;b'));
  test('escapes <', () => expect(esc('a<b')).toBe('a&lt;b'));
  test('escapes >', () => expect(esc('a>b')).toBe('a&gt;b'));
  test('escapes "', () => expect(esc('a"b')).toBe('a&quot;b'));
  test('escapes multiple special chars', () => {
    expect(esc('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });
  test('plain string passes through unchanged', () => {
    expect(esc('hello world')).toBe('hello world');
  });
});

// ---------------------------------------------------------------------------
// formatNames
// ---------------------------------------------------------------------------

describe('formatNames', () => {
  test('empty set → empty string', () => {
    expect(formatNames(new Set())).toBe('');
  });

  test('one name → wrapped in strong', () => {
    expect(formatNames(new Set(['Alice']))).toBe('<strong>Alice</strong>');
  });

  test('two names → "A and B"', () => {
    expect(formatNames(new Set(['Alice', 'Bob']))).toBe('<strong>Alice</strong> and <strong>Bob</strong>');
  });

  test('three names → "A, B and C"', () => {
    expect(formatNames(new Set(['Alice', 'Bob', 'Carol']))).toBe('<strong>Alice</strong>, <strong>Bob</strong> and <strong>Carol</strong>');
  });

  test('four names → "A, B, C and D"', () => {
    expect(formatNames(new Set(['A', 'B', 'C', 'D']))).toBe('<strong>A</strong>, <strong>B</strong>, <strong>C</strong> and <strong>D</strong>');
  });

  test('names with special HTML chars are escaped', () => {
    expect(formatNames(new Set(['<script>']))).toBe('<strong>&lt;script&gt;</strong>');
  });
});

// ---------------------------------------------------------------------------
// calcAwards — README: Crown, Nerd badge, Peach
// ---------------------------------------------------------------------------

describe('calcAwards', () => {
  describe('single player — no awards', () => {
    test('all Sets are empty with one player', () => {
      const entries = [makeEntry('Solo', emojis10([CAT, 10]))];
      const { kings, nerds, peaches } = calcAwards(entries);
      expect(kings.size).toBe(0);
      expect(nerds.size).toBe(0);
      expect(peaches.size).toBe(0);
    });
  });

  // --- Crown ---
  describe('Crown (👑) — highest scorer', () => {
    test('higher scorer gets Crown', () => {
      const entries = [
        makeEntry('A', emojis10([CAT, 7], [FISH, 3])), // 7/10
        makeEntry('B', emojis10([CAT, 3], [FISH, 7])), // 3/10
      ];
      const { kings } = calcAwards(entries);
      expect(kings.has('A')).toBe(true);
      expect(kings.has('B')).toBe(false);
    });

    test('tied players both share the Crown', () => {
      const tiedEmojis = emojis10([CAT, 5], [FISH, 5]);
      const entries = [makeEntry('A', tiedEmojis), makeEntry('B', tiedEmojis)];
      const { kings } = calcAwards(entries);
      expect(kings.has('A')).toBe(true);
      expect(kings.has('B')).toBe(true);
    });

    test('all players tied → all share Crown', () => {
      const e = emojis10([CAT, 5], [FISH, 5]);
      const entries = [makeEntry('A', e), makeEntry('B', e), makeEntry('C', e)];
      const { kings } = calcAwards(entries);
      expect(kings.size).toBe(3);
    });
  });

  // --- Peach ---
  describe('Peach (🍑) — lowest scorer', () => {
    test('lower scorer gets Peach', () => {
      const entries = [
        makeEntry('A', emojis10([CAT, 7], [FISH, 3])),
        makeEntry('B', emojis10([CAT, 3], [FISH, 7])),
      ];
      const { peaches } = calcAwards(entries);
      expect(peaches.has('B')).toBe(true);
      expect(peaches.has('A')).toBe(false);
    });

    test('tied lowest scorers both get Peach', () => {
      const entries = [
        makeEntry('A', emojis10([CAT, 7], [FISH, 3])),  // 7/10 — king
        makeEntry('B', emojis10([CAT, 3], [FISH, 7])),  // 3/10 — peach
        makeEntry('C', emojis10([CAT, 3], [FISH, 7])),  // 3/10 — peach
      ];
      const { peaches } = calcAwards(entries);
      expect(peaches.has('B')).toBe(true);
      expect(peaches.has('C')).toBe(true);
    });

    test('Crown takes priority: same score → Crown wins, no Peach', () => {
      // README: "if someone is both the highest and lowest scorer (e.g. everyone else tied),
      // the 👑 takes priority and they don't get the 🍑"
      const tied = emojis10([CAT, 5], [FISH, 5]);
      const entries = [makeEntry('A', tied), makeEntry('B', tied)];
      const { kings, peaches } = calcAwards(entries);
      expect(kings.size).toBe(2);   // both are kings
      expect(peaches.size).toBe(0); // both removed from peaches
    });
  });

  // --- Nerd badge ---
  describe('Nerd badge (🤓) — solo correct on a question', () => {
    test('solo correct on a question earns nerd badge', () => {
      // A gets Q0 right alone
      const emojiA = [CAT, FISH, FISH, FISH, FISH, FISH, FISH, FISH, FISH, FISH];
      const emojiB = [FISH, FISH, FISH, FISH, FISH, FISH, FISH, FISH, FISH, FISH];
      const { nerds } = calcAwards([makeEntry('A', emojiA), makeEntry('B', emojiB)]);
      expect(nerds.has('A')).toBe(true);
    });

    test('two players correct on same question → neither gets nerd for that question', () => {
      const emojiA = [CAT, FISH, FISH, FISH, FISH, FISH, FISH, FISH, FISH, FISH];
      const emojiB = [CAT, FISH, FISH, FISH, FISH, FISH, FISH, FISH, FISH, FISH];
      const { nerds } = calcAwards([makeEntry('A', emojiA), makeEntry('B', emojiB)]);
      expect(nerds.size).toBe(0);
    });

    test('single player → no nerd badge even if all correct', () => {
      const entries = [makeEntry('Solo', emojis10([CAT, 10]))];
      const { nerds } = calcAwards(entries);
      expect(nerds.size).toBe(0);
    });

    test('player can earn nerd on at least one question while others tie on others', () => {
      // A solo-correct on Q0; A and B both correct on Q1
      const emojiA = [CAT, CAT, FISH, FISH, FISH, FISH, FISH, FISH, FISH, FISH];
      const emojiB = [FISH, CAT, FISH, FISH, FISH, FISH, FISH, FISH, FISH, FISH];
      const { nerds } = calcAwards([makeEntry('A', emojiA), makeEntry('B', emojiB)]);
      expect(nerds.has('A')).toBe(true);
    });

    test('nobody correct on a question → no nerd for that question', () => {
      const emojiA = [FISH, FISH, FISH, FISH, FISH, FISH, FISH, FISH, FISH, FISH];
      const emojiB = [FISH, FISH, FISH, FISH, FISH, FISH, FISH, FISH, FISH, FISH];
      const { nerds } = calcAwards([makeEntry('A', emojiA), makeEntry('B', emojiB)]);
      expect(nerds.size).toBe(0);
    });

    test('player can simultaneously hold nerd + king badges', () => {
      // A: 8/10, solo correct on Q0 → king + nerd
      // B: 3/10, not solo correct anywhere
      const emojiA = [CAT, CAT, CAT, CAT, CAT, CAT, CAT, CAT, FISH, FISH];
      const emojiB = [FISH, CAT, CAT, CAT, FISH, FISH, FISH, FISH, FISH, FISH];
      const { kings, nerds } = calcAwards([makeEntry('A', emojiA), makeEntry('B', emojiB)]);
      expect(kings.has('A')).toBe(true);
      expect(nerds.has('A')).toBe(true);
    });
  });

  // --- Integration: real puzzle 626 fixture ---
  describe('integration — puzzle 626 fixture', () => {
    const puzzle626 = [
      { name: 'Cara NO',  emojis: [CAT, FISH, FISH, CAT, CAT,  CAT, EGG, FISH, FISH, FISH] }, // 4.5
      { name: 'Casey',    emojis: [FISH, FISH, FISH, CAT, CAT,  CAT, CAT, FISH, CAT,  FISH] }, // 5
      { name: 'Josh',     emojis: [CAT, FISH, FISH, FISH, FISH, FISH, CAT, FISH, CAT, FISH] }, // 3
      { name: 'Lora',     emojis: [CAT, CAT, FISH, CAT, CAT,  CAT, CAT, FISH, CAT,  FISH] }, // 7
      { name: 'Matt',     emojis: [CAT, CAT, FISH, CAT, CAT,  CAT, CAT, FISH, CAT,  FISH] }, // 7
      { name: 'Richard',  emojis: [CAT, FISH, FISH, CAT, FISH, CAT, CAT, FISH, CAT,  FISH] }, // 5
      { name: 'Steph',    emojis: [CAT, FISH, FISH, FISH, CAT, CAT, CAT, FISH, CAT,  FISH] }, // 5
    ].map(e => makeEntry(e.name, e.emojis));

    test('Lora and Matt (7/10) share the Crown', () => {
      const { kings } = calcAwards(puzzle626);
      expect(kings.has('Lora')).toBe(true);
      expect(kings.has('Matt')).toBe(true);
      expect(kings.size).toBe(2);
    });

    test('Josh (3/10) gets the Peach', () => {
      const { peaches } = calcAwards(puzzle626);
      expect(peaches.has('Josh')).toBe(true);
      expect(peaches.size).toBe(1);
    });

    test('no nerd badges — no question was solo-correct', () => {
      const { nerds } = calcAwards(puzzle626);
      expect(nerds.size).toBe(0);
    });

    test('group score is 7/10', () => {
      const group = calcGroupEmojis(puzzle626);
      expect(calcScore(group)).toBe('7/10');
    });
  });
});

'use strict';

const CAT  = '\u{1F408}'; // 🐈
const FISH = '\u{1F41F}'; // 🐟
const EGG  = '\u{1F95A}'; // 🥚
const VALID_EMOJIS = new Set([CAT, FISH, EGG]);

// --- Parsing ---
function parseScore(text) {
  const puzzleMatch = text.match(/#(\d+)/);
  if (!puzzleMatch) return { error: 'Could not find a puzzle number (like #626) in the pasted text.' };
  const emojis = [];
  for (const ch of text) {
    if (VALID_EMOJIS.has(ch)) emojis.push(ch);
  }
  if (emojis.length !== 10) {
    return { error: `Found ${emojis.length} emoji${emojis.length === 1 ? '' : 's'} — expected exactly 10. Make sure you paste the complete share text.` };
  }
  return { puzzle: parseInt(puzzleMatch[1], 10), emojis };
}

// --- Group logic ---
function calcGroupEmojis(entries) {
  return Array.from({ length: 10 }, (_, i) => {
    const col = entries.map(e => e.emojis[i]);
    if (col.includes(CAT)) return CAT;
    if (col.includes(EGG)) return EGG;
    return FISH;
  });
}

function calcScore(emojis) {
  const n = emojis.reduce((s, e) => s + (e === CAT ? 1 : e === EGG ? 0.5 : 0), 0);
  return `${n}/10`;
}

// --- Awards ---
// Returns { kings: Set<string>, nerds: Set<string>, peaches: Set<string> }
// Single-player entries produce empty Sets (awards require >1 player).
function calcAwards(entries) {
  const nerds = new Set();
  if (entries.length > 1) {
    for (let i = 0; i < 10; i++) {
      const solos = entries.filter(e => e.emojis[i] === CAT);
      if (solos.length === 1) nerds.add(solos[0].name);
    }
  }
  const scored = entries.filter(e => e.emojis?.length).map(e => ({
    name: e.name,
    value: e.emojis.reduce((s, em) => s + (em === CAT ? 1 : em === EGG ? 0.5 : 0), 0)
  }));
  const topScore    = scored.length ? Math.max(...scored.map(e => e.value)) : NaN;
  const bottomScore = scored.length ? Math.min(...scored.map(e => e.value)) : NaN;
  const kings   = entries.length > 1 && scored.length ? new Set(scored.filter(e => e.value === topScore).map(e => e.name))    : new Set();
  const peaches = entries.length > 1 && scored.length ? new Set(scored.filter(e => e.value === bottomScore).map(e => e.name)) : new Set();
  // Kings take priority — no one can hold both crown and peach
  for (const name of kings) { peaches.delete(name); }
  return { kings, nerds, peaches };
}

// --- UI helpers ---
function sortedKeys(data) {
  return Object.keys(data).sort((a, b) => b - a);
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatNames(set) {
  const arr = [...set].map(n => `<strong>${esc(n)}</strong>`);
  if (arr.length === 0) return '';
  if (arr.length === 1) return arr[0];
  if (arr.length === 2) return `${arr[0]} and ${arr[1]}`;
  return arr.slice(0, -1).join(', ') + ` and ${arr[arr.length - 1]}`;
}

if (typeof module !== 'undefined') {
  module.exports = { CAT, FISH, EGG, parseScore, calcGroupEmojis, calcScore, calcAwards, sortedKeys, esc, formatNames };
}

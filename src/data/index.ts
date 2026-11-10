import raw from './content.json';

export type Status = 'finding' | 'theory' | 'arg' | 'interp' | 'contested';
export type Discipline = 'psych' | 'phil' | 'behav';
export type Concept = {
  id: string; t: string; dek: string; d: Discipline[]; th: string[]; k: string[]; lvl: 1 | 2; st: Status; kw: string;
  idea: string; mech?: string; lim?: string; insight: string; why: string; life: string[];
  tension: { sides: [string, string][]; note: string };
  rel: [string, string][]; deeper: [string, string, string][];
};
export type Thinker = { tr?: string[]; u?: number; tag?: string; n: string; y: string; f: string; s: string; major?: number; line: string; vs: string };
export type Book = {
  id: string; t: string; a: string; y: number; k: string[]; col: string; thesis: string; c: string[];
  summary?: string; ideas?: string[]; surprise?: string; crit?: string;
};
// Every passage has an author; the curated ones also carry a note and the ideas they lead to.
export type Quote = { id: string; q: string; a: string; s?: string; k?: string; b?: string; c?: string[]; n?: string };
export type Tension = { q: string; a: [string, string]; b: [string, string]; c: string; pa: string; pb: string };
export type Path = { id: string; t: string; line: string; c: string[]; b: string[] };

const data = raw as unknown as {
  concepts: Concept[]; thinkers: Record<string, Thinker>; books: Book[]; paths: Path[];
  questions: [string, string[]][]; themes: Record<string, string>; tensions: Tension[]; daily: string[];
  quotes: Quote[]; collections: Record<string, string>; startShelf: string[]; schools: string[]; syn: Record<string, string>;
};

export const CONCEPTS = data.concepts;
export const THINKERS = data.thinkers;
export const BOOKS = data.books;
export const QUOTES = data.quotes;
export const quoteById: Record<string, Quote> = Object.fromEntries(QUOTES.map(q => [q.id, q]));
export const PATHS = data.paths;
export const QUESTIONS = data.questions;
export const THEME_LINES = data.themes;
export const TENSIONS = data.tensions;
export const COLLECTIONS = data.collections;
export const START_SHELF = data.startShelf;
export const SCHOOLS = data.schools;

export const byId: Record<string, Concept> = Object.fromEntries(CONCEPTS.map(c => [c.id, c]));
export const bookById: Record<string, Book> = Object.fromEntries(BOOKS.map(b => [b.id, b]));
export const pathById: Record<string, Path> = Object.fromEntries(PATHS.map(p => [p.id, p]));

export const STATUS: Record<Status, { label: string; desc: string }> = {
  finding: { label: 'Established finding', desc: 'A replicated empirical result. Its interpretation may still be argued.' },
  theory: { label: 'Psychological theory', desc: 'A framework from clinical or theoretical work. Partly testable, partly not.' },
  arg: { label: 'Philosophical argument', desc: 'A reasoned position. Judge it by its reasoning, not by data.' },
  interp: { label: 'Interpretation', desc: 'A way of reading human life. Illuminating, hard to test.' },
  contested: { label: 'Contested', desc: 'An influential claim with serious evidence or argument against it.' },
};
export const DISC: Record<Discipline, string> = { psych: 'Psychology', phil: 'Philosophy', behav: 'Human behavior' };
export const DEPTH: Record<1 | 2, string> = { 1: 'Advanced', 2: 'Very advanced' };
export const year = (y: number) => (y < 0 ? `c. ${-y} BCE` : y < 1000 ? `c. ${y}` : String(y));

/* ---------- Graph ---------- */
const inbound: Record<string, [string, string][]> = {};
CONCEPTS.forEach(c => c.rel.forEach(([to, why]) => { (inbound[to] ||= []).push([c.id, why]); }));
export const inboundOf = (id: string) => inbound[id] || [];
export function neighbors(id: string): string[] {
  const s = new Set(byId[id].rel.map(r => r[0]));
  inboundOf(id).forEach(([f]) => s.add(f));
  s.delete(id);
  return [...s].filter(x => byId[x]);
}
export const booksFor = (conceptId: string) => BOOKS.filter(b => b.c.includes(conceptId));
export const booksBy = (thinkerId: string) => BOOKS.filter(b => b.k.includes(thinkerId));
export const ideasBy = (thinkerId: string) => CONCEPTS.filter(c => c.k.includes(thinkerId));
export const pathsWith = (conceptId: string) => PATHS.filter(p => p.c.includes(conceptId));
export const thinkersIn = (school: string) => Object.keys(THINKERS).filter(k => THINKERS[k].s === school).sort((a, b) => surname(a).localeCompare(surname(b)));
export const surname = (k: string) => THINKERS[k].n.split(' ').pop() as string;
export const booksIn = (col: string) => BOOKS.filter(b => b.col === col).sort((a, b) => a.y - b.y || a.t.localeCompare(b.t));

const counts: Record<string, number> = {};
CONCEPTS.forEach(c => c.th.forEach(t => (counts[t] = (counts[t] || 0) + 1)));
export const THEMES = Object.keys(THEME_LINES).filter(t => counts[t]);
export const themeCount = (t: string) => counts[t] || 0;
// The doors shown first. The rest stay one tap away.
export const PRIMARY_THEMES = ['Love', 'Fear', 'Identity', 'Desire', 'Power', 'Death', 'Meaning', 'Freedom', 'Belonging', 'Self'];

/* ---------- Daily rotation ---------- */
export function dayNumber(d = new Date()) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 864e5) + d.getFullYear() * 366;
}
// The very first idea anyone sees. Chosen because almost everyone has felt it.
export const FIRST_IDEA = { id: 'wanting-liking', headline: 'Wanting ≠ Liking', teaser: 'You can desperately want something and feel surprisingly little once you have it.' };
export function todayConcept(read: string[]) {
  const day = dayNumber(); const seen = new Set(read);
  for (let i = 0; i < data.daily.length; i++) { const c = byId[data.daily[(day + i) % data.daily.length]]; if (!seen.has(c.id)) return c; }
  return byId[data.daily[day % data.daily.length]];
}
export function dailyQuestions(n: number) {
  const out: string[] = []; const day = dayNumber();
  for (let i = 0; out.length < n; i++) { const q = QUESTIONS[(day * 7 + i * 5) % QUESTIONS.length][0]; if (!out.includes(q)) out.push(q); }
  return out;
}

/* ---------- Recommendation: adjacent, not more of the same ---------- */
export function recommend(trail: string[], n: number) {
  const seen = new Set(trail); const recent = trail.slice(-12);
  if (!recent.length) return [] as { id: string; why: string }[];
  const score: Record<string, number> = {}; const via: Record<string, Set<string>> = {};
  recent.forEach((v, i) => {
    const w = 1 + i / recent.length;
    neighbors(v).forEach(nb => { if (seen.has(nb)) return; score[nb] = (score[nb] || 0) + w; (via[nb] ||= new Set()).add(v); });
  });
  const dc: Record<string, number> = {};
  recent.forEach(v => byId[v].d.forEach(d => (dc[d] = (dc[d] || 0) + 1)));
  const top = Object.keys(dc).sort((a, b) => dc[b] - dc[a])[0];
  Object.keys(score).forEach(k => { if (via[k].size > 1) score[k] *= 1.8; if (!byId[k].d.includes(top as Discipline)) score[k] *= 1.3; });
  return Object.keys(score).sort((a, b) => score[b] - score[a]).slice(0, n).map(k => {
    const v = [...via[k]]; let why: string;
    if (v.length > 1) why = `Connects ${byId[v[0]].t.toLowerCase()} and ${byId[v[1]].t.toLowerCase()}.`;
    else { const r = byId[v[0]].rel.find(x => x[0] === k); why = r ? `${r[1]}.` : `Linked from ${byId[v[0]].t.toLowerCase()}.`; }
    return { id: k, why };
  });
}
// After reading an idea: the next step, preferring one not yet read.
export function nextAfter(id: string, read: string[], pathId?: string) {
  if (pathId && pathById[pathId]) {
    const p = pathById[pathId].c; const i = p.indexOf(id);
    if (i >= 0 && i < p.length - 1) return { id: p[i + 1], why: `Next in “${pathById[pathId].t}”` };
  }
  const r = byId[id].rel.find(([x]) => !read.includes(x)) ?? byId[id].rel[0];
  return { id: r[0], why: r[1] };
}

/* ---------- Search: human questions first, then ideas, thinkers, books ---------- */
const STOP = new Set("a an the of to and or but is are am be do does did i im i'm me my we you your it its in on at for with why what how when who whom which that this those these so can cant can't some people person someone something get gets got once more less much very really feel feels make makes about from by as if not no they them their there have has had will would should could just than then into out up even keep always ever".split(' '));
const stem = (w: string) => w.replace(/['’]s$/, '').replace(/(ing|edly|ed|es|s|ly)$/, '');
const raw2 = (s: string) => (s.toLowerCase().match(/[a-z'’]+/g) || []).filter(w => !STOP.has(w) && w.length > 2);
const toks = (s: string) => raw2(s).map(stem);
function expand(q: string) {
  const base = raw2(q); const out = new Set(base.map(stem));
  base.forEach(w => { const s = data.syn[w] || data.syn[stem(w)]; if (s) s.split(' ').forEach(x => out.add(stem(x))); });
  return [...out];
}
const near = (a: string, t: string) => a === t || (t.length > 4 && a.startsWith(t)) || (a.length > 4 && t.startsWith(a));
const cIndex = CONCEPTS.map(c => ({ id: c.id, title: toks(c.t), kw: toks(c.kw), dek: toks(c.dek), th: toks(c.th.join(' ')), body: toks(`${c.idea} ${c.insight} ${c.why}`) }));
const qIndex = QUESTIONS.map(([q, ids]) => ({ q, ids, t: toks(q) }));
const tIndex = Object.keys(THINKERS).map(k => ({ id: k, name: toks(THINKERS[k].n), raw: THINKERS[k].n.toLowerCase(), meta: toks(`${THINKERS[k].s} ${THINKERS[k].f} ${THINKERS[k].line}`) }));
const bIndex = BOOKS.map(b => ({ id: b.id, title: toks(b.t), rawT: b.t.toLowerCase(), author: toks(b.a), body: toks(b.thesis) }));

const pIndex = QUOTES.map(x => ({ id: x.id, raw: x.q.toLowerCase(), t: toks(`${x.q} ${x.a}`), cur: x.n ? 1 : 0 }));
export type SearchResult = { question: string | null; ideas: string[]; thinkers: string[]; books: string[]; quotes: string[] };
export function search(query: string): SearchResult {
  const q = query.trim().toLowerCase();
  const qt = expand(q);
  if (q.length < 2) return { question: null, ideas: [], thinkers: [], books: [], quotes: [] };
  const hit = (arr: string[], w: number) => arr.reduce((n, x) => n + (qt.some(t => near(x, t)) ? w : 0), 0);

  const cs: Record<string, number> = {};
  cIndex.forEach(r => { const s = hit(r.title, 6) + hit(r.kw, 3) + hit(r.dek, 2) + hit(r.th, 3) + hit(r.body, 0.6); if (s) cs[r.id] = s; });
  let best: (typeof qIndex)[number] | null = null; let bestS = 0;
  const own = toks(q);
  qIndex.forEach(r => { const m = r.t.filter(w => qt.some(t => near(w, t))).length; const s = m / Math.max(r.t.length, own.length || 1); if (s > bestS) { bestS = s; best = r; } });
  const b0 = bestS >= 0.4 ? (best as (typeof qIndex)[number] | null) : null;
  if (b0) b0.ids.forEach((id, i) => (cs[id] = (cs[id] || 0) + 14 - i * 2));

  const ts: Record<string, number> = {};
  tIndex.forEach(r => { const s = (r.raw.includes(q) ? 20 : 0) + hit(r.name, 8) + hit(r.meta, 0.8); if (s >= 2) ts[r.id] = s; });
  const bs: Record<string, number> = {};
  bIndex.forEach(r => { const s = (r.rawT.includes(q) ? 20 : 0) + hit(r.title, 5) + hit(r.author, 6) + hit(r.body, 1); if (s >= 2) bs[r.id] = s; });

  const ps: Record<string, number> = {};
  pIndex.forEach(r => { const s = (r.raw.includes(q) ? 20 : 0) + hit(r.t, 1.5) + r.cur; if (s >= 4) ps[r.id] = s; });
  const sort = (o: Record<string, number>) => Object.keys(o).sort((a, b) => o[b] - o[a]);
  return { question: b0 ? b0.q : null, ideas: sort(cs).slice(0, 8), thinkers: sort(ts).slice(0, 6), books: sort(bs).slice(0, 6), quotes: sort(ps).slice(0, 12) };
}

/* ---------- Icons for themes (Ionicons, same on both platforms) ---------- */

// One short line for lists: the hand-written tag, else the first sentence of the longer description.
export const tagOf = (k: string) => THINKERS[k].tag ?? THINKERS[k].line.split(/(?<=[.!?])\s/)[0];

// Writers are grouped three ways: the essential names, the underrated, and the living or recent.
export const isContemporary = (k: string) => /^b\./.test(THINKERS[k].y) || Number((THINKERS[k].y.match(/(\d{4})$/) ?? [])[1]) >= 2000;
export const underrated = () => Object.keys(THINKERS).filter(k => THINKERS[k].u).sort((a, b) => surname(a).localeCompare(surname(b)));
export const contemporary = () => Object.keys(THINKERS).filter(isContemporary).sort((a, b) => surname(a).localeCompare(surname(b)));

// Passages lead somewhere: each belongs to ideas, and sometimes to a book. Chosen for relevance first, then rotated by day.
export const quotesFor = (conceptId: string) => QUOTES.filter(q => q.n && q.c?.includes(conceptId));
export const quotesIn = (bookId: string) => QUOTES.filter(q => q.b === bookId);
export const CURATED = QUOTES.filter(q => q.n);
export function quoteToday(trail: string[]) {
  const near = trail.length ? quotesFor(trail[trail.length - 1]) : [];
  if (near.length) return near[Math.floor(Date.now() / 864e5) % near.length];
  return CURATED[Math.floor(Date.now() / 864e5) % CURATED.length];
}

// A theme as a small world: one place to start, a few neighbours, the people and books around it, and a thread through it.
export function themeWorld(name: string, read: string[]) {
  const all = CONCEPTS.filter(x => x.th.includes(name));
  const ordered = [...all].sort((a, b) => (read.includes(a.id) ? 1 : 0) - (read.includes(b.id) ? 1 : 0) || b.rel.length - a.rel.length);
  const start = ordered[0];
  const ideas = ordered.slice(1);
  const kc: Record<string, number> = {};
  all.forEach(x => x.k.forEach(k => (kc[k] = (kc[k] || 0) + 1)));
  const thinkers = Object.keys(kc).filter(k => THINKERS[k]).sort((a, b) => kc[b] - kc[a]);
  const books: Book[] = [];
  all.forEach(x => booksFor(x.id).forEach(b => { if (!books.includes(b)) books.push(b); }));
  const thread = [start.id]; let cur = start;
  for (let i = 0; i < 3; i++) { const r = cur.rel.find(([x]) => !thread.includes(x) && byId[x]); if (!r) break; thread.push(r[0]); cur = byId[r[0]]; }
  return { all, start, ideas, thinkers, books, thread };
}
// Where a person's attention has gone: themes of the ideas they have read, most frequent first.
export function leaningThemes(read: string[]) {
  const n: Record<string, number> = {};
  read.forEach(id => byId[id]?.th.forEach(t => (n[t] = (n[t] || 0) + 1)));
  return Object.keys(n).sort((a, b) => n[b] - n[a]);
}
// Something outside the usual: an unread idea that shares none of the reader's leading themes.
export function somethingNew(read: string[]) {
  const lean = leaningThemes(read).slice(0, 3);
  const pool = CONCEPTS.filter(x => !read.includes(x.id) && !x.th.some(t => lean.includes(t)));
  return pool.length ? pool[Math.floor(Date.now() / 864e5) % pool.length] : null;
}

// A thinker belongs to several traditions, not one label. The school is the fallback.
export const traditionsOf = (k: string) => THINKERS[k].tr ?? [THINKERS[k].s];
export const nearby = (k: string, n = 4) => {
  const mine = traditionsOf(k);
  return Object.keys(THINKERS).filter(x => x !== k).map(x => [x, traditionsOf(x).filter(t => mine.includes(t)).length + (THINKERS[x].s === THINKERS[k].s ? 0.5 : 0)] as const).filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]).slice(0, n).map(([x]) => x);
};
// Books are grouped by what a reader is after, not by shelf.
export const BOOK_GROUPS: Record<string, string[]> = { Psychology: ['self', 'therapy', 'human'], Philosophy: ['exist', 'ethics'], Society: ['society'], Mind: ['mind', 'judgment'], Relationships: ['love'] };
export const themesOfBook = (b: Book) => { const n: Record<string, number> = {}; b.c.forEach(id => byId[id]?.th.forEach(t => PRIMARY_THEMES.includes(t) && (n[t] = (n[t] || 0) + 1))); return Object.keys(n).sort((a, c) => n[c] - n[a]).slice(0, 3); };

// Reading time from the text itself; the discipline a reader would shelve it under.
export const minutesOf = (c: Concept) => Math.max(2, Math.round(`${c.idea} ${c.insight} ${c.why} ${c.life.join(' ')} ${c.tension.note}`.split(/\s+/).length / 190));
// Where to begin: one idea to start with, then foundations, then deeper.
export const depthOf = (c: Concept) => (c.id === FIRST_IDEA.id ? 'Start here' : c.lvl === 1 ? 'Foundations' : 'Deeper');
export const discOf = (c: Concept) => (c.d[0] === 'phil' ? 'Philosophy' : 'Psychology');
const TGROUP: Record<string, string> = { 'Psychoanalysis & depth psychology': 'Psychology', 'Humanistic & existential therapy': 'Psychology', 'Development & attachment': 'Psychology', 'Social psychology': 'Psychology', 'Judgment & behavior': 'Psychology', 'Mind, brain & emotion': 'Psychology', 'Existentialism & phenomenology': 'Philosophy', 'Philosophy of mind & language': 'Philosophy', 'Ethics & political philosophy': 'Philosophy', 'Classical roots': 'Philosophy', 'Critical theory & power': 'Society', 'Society & culture': 'Society' };
export const groupOfThinker = (k: string) => TGROUP[THINKERS[k].s] ?? 'Philosophy';
export const allThinkers = () => Object.keys(THINKERS).sort((a, b) => surname(a).localeCompare(surname(b)));
export const startShelf = () => START_SHELF.map(id => bookById[id]);

import { byId, THINKERS } from '@/data';
import { PATHS } from '@/data';
import { dayKey, useNotebook } from './notebook';
import { useTrail } from './trail';

// Intellectual progress, derived from behaviour. Nothing here is a score: it is only a record of where attention has been.
export function useProgress() {
  const nb = useNotebook();
  const { trail } = useTrail();
  const keys = Object.keys(nb.flags);
  const explored = keys.filter(k => k.startsWith('x:') && byId[k.slice(2)]).map(k => k.slice(2));
  const thinkers = new Set<string>();
  keys.filter(k => k.startsWith('t:') && THINKERS[k.slice(2)]).forEach(k => thinkers.add(k.slice(2)));
  explored.forEach(id => byId[id].k.forEach(k => THINKERS[k] && thinkers.add(k)));
  const books = keys.filter(k => k.startsWith('b:')).map(k => k.slice(2));
  const passages = Object.keys(nb.passages ?? {}).length;
  // Days. A streak is consecutive days with at least one finished idea; today not yet done does not break it.
  const days = nb.days ?? {};
  const goal = nb.goal ?? 1;
  const today = (days[dayKey()] ?? []).length;
  let streak = 0; const d = new Date(); if (!today) d.setDate(d.getDate() - 1);
  while ((days[dayKey(d)] ?? []).length) { streak++; d.setDate(d.getDate() - 1); }
  const mon = new Date(); mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7));
  const week = ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, i) => { const x = new Date(mon); x.setDate(mon.getDate() + i); const k = dayKey(x); return { label, done: (days[k] ?? []).length > 0, isToday: k === dayKey() }; });
  // The current path: the one chosen at the start, then the next with something left to read.
  const chosen = Object.keys(nb.flags).find(k => k.startsWith('path:'))?.slice(5);
  const ordered = [...PATHS].sort((a, b) => (a.id === chosen ? -1 : 0) - (b.id === chosen ? -1 : 0));
  const path = ordered.find(p => p.c.some(x => !nb.flags['x:' + x])) ?? ordered[0];
  const nextIdea = path.c.find(x => !nb.flags['x:' + x]) ?? path.c[0];
  return { streak, today, goal, goalMet: today >= goal, week, path, nextIdea, onboarded: !!nb.flags.onboarded, explored, thinkers: [...thinkers], books, passages, trail, isExplored: (id: string) => !!nb.flags['x:' + id] };
}

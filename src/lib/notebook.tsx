import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

// A private notebook kept on the device: saved ideas, positions on open questions,
// your own examples, and small "seen it once" flags the app uses to teach itself.
export type Side = 'a' | 'b' | 'own';
export type Position = { side: Side; words: string; at: number };
export type Note = { text: string; at: number };
type Book = { positions: Record<string, Position>; notes: Record<string, Note>; saved: Record<string, number>; flags: Record<string, boolean>; passages: Record<string, number>; days: Record<string, string[]>; goal: number };

export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const KEY = 'thc.notebook.v2';
const EMPTY: Book = { positions: {}, notes: {}, saved: {}, flags: {}, passages: {}, days: {}, goal: 1 };
type Ctx = Book & {
  ready: boolean;
  setPosition: (tensionKey: string, p: Omit<Position, 'at'>) => void;
  clearPosition: (tensionKey: string) => void;
  setNote: (conceptId: string, text: string) => void;
  toggleSave: (conceptId: string) => void;
  setFlag: (flag: string) => void;
  togglePassage: (quoteId: string) => void;
  completeIdea: (conceptId: string) => void;
  setGoal: (n: number) => void;
};
const NotebookCtx = createContext<Ctx>({ ...EMPTY, ready: false, setPosition: () => {}, clearPosition: () => {}, setNote: () => {}, toggleSave: () => {}, setFlag: () => {}, togglePassage: () => {}, completeIdea: () => {}, setGoal: () => {} });

export function NotebookProvider({ children }: { children: ReactNode }) {
  const [book, setBook] = useState<Book>(EMPTY);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem(KEY).then(v => { if (v) setBook({ ...EMPTY, ...JSON.parse(v) }); }).catch(() => {}).finally(() => setReady(true));
  }, []);
  const update = useCallback((fn: (b: Book) => Book) => setBook(b => { const n = fn(b); AsyncStorage.setItem(KEY, JSON.stringify(n)).catch(() => {}); return n; }), []);

  const value = useMemo<Ctx>(() => ({
    ...book, ready,
    setPosition: (k, p) => update(b => ({ ...b, positions: { ...b.positions, [k]: { ...p, at: Date.now() } } })),
    clearPosition: k => update(b => { const positions = { ...b.positions }; delete positions[k]; return { ...b, positions }; }),
    setNote: (id, text) => update(b => {
      const notes = { ...b.notes };
      if (text.trim()) notes[id] = { text, at: Date.now() }; else delete notes[id];
      return { ...b, notes };
    }),
    toggleSave: id => update(b => { const saved = { ...b.saved }; if (saved[id]) delete saved[id]; else saved[id] = Date.now(); return { ...b, saved }; }),
    togglePassage: id => update(b => { const passages = { ...(b.passages ?? {}) }; if (passages[id]) delete passages[id]; else passages[id] = Date.now(); return { ...b, passages }; }),
    completeIdea: id => update(b => {
      const k = dayKey(); const today = b.days?.[k] ?? [];
      if (today.includes(id) && b.flags['x:' + id]) return b;
      return { ...b, flags: { ...b.flags, ['x:' + id]: true }, days: { ...(b.days ?? {}), [k]: today.includes(id) ? today : [...today, id] } };
    }),
    setGoal: n => update(b => ({ ...b, goal: n })),
    setFlag: f => update(b => (b.flags[f] ? b : { ...b, flags: { ...b.flags, [f]: true } })),
  }), [book, ready, update]);

  return <NotebookCtx.Provider value={value}>{children}</NotebookCtx.Provider>;
}
export const useNotebook = () => useContext(NotebookCtx);

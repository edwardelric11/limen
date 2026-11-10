import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { byId } from '@/data';

const KEY = 'thc.trail.v1';
type TrailCtx = { trail: string[]; ready: boolean; visit: (id: string) => void; clear: () => void; has: (id: string) => boolean };
const Ctx = createContext<TrailCtx>({ trail: [], ready: false, visit: () => {}, clear: () => {}, has: () => false });

// Reading history stays on the device. It only feeds "Continue" recommendations.
export function TrailProvider({ children }: { children: ReactNode }) {
  const [trail, setTrail] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem(KEY).then(v => { if (v) setTrail((JSON.parse(v) as string[]).filter(id => byId[id])); }).catch(() => {}).finally(() => setReady(true));
  }, []);
  const persist = (t: string[]) => { AsyncStorage.setItem(KEY, JSON.stringify(t)).catch(() => {}); return t; };
  const visit = useCallback((id: string) => setTrail(t => persist([...t.filter(x => x !== id), id].slice(-60))), []);
  const clear = useCallback(() => setTrail(persist([])), []);
  const value = useMemo(() => ({ trail, ready, visit, clear, has: (id: string) => trail.includes(id) }), [trail, ready, visit, clear]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useTrail = () => useContext(Ctx);

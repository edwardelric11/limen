import type { ReactNode } from 'react';
import { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { Scene, SceneCtx } from './art';

const INK = '#171A1B', BONE = '#F5F0E6', MOSS = '#172C68', SAGE = '#3157D5', OCHRE = '#E6533D', GOLD = '#F2C94C';

// The signature library. Each scene starts from one idea's contradiction and draws only that: one dominant colour, one counter-colour, empty space,
// and a composition that needs a second look. Scale and cropping do most of the work.
// [concept → tension → picture]
const PALE = '#DCE4F5';
type A = { W: number; H: number; rnd: () => number };
const sc = (bg: string, f: (a: A) => ReactNode) => ({ W, H, rnd }: SceneCtx): Scene => ({ bg, node: f({ W, H, rnd }) });
const n = (k: number) => Array.from({ length: k }, (_, i) => i);
const C = (cx: number, cy: number, r: number, fill: string) => <Circle cx={cx} cy={cy} r={r} fill={fill} />;
const R = (cx: number, cy: number, r: number, stroke: string, w = 0.8, dash?: string) => <Circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth={w} strokeDasharray={dash} />;

export const SIG: Record<string, (c: SceneCtx) => Scene> = {
  // Fear: avoidance feels safe, and makes the dark bigger. A tiny form backs away from a tiny threat; behind it, a vast shadow.
  sigFear: sc(BONE, ({ H }) => <>{C(6, H * 0.62, H * 0.9, MOSS)}{C(H * 0.72, H * 0.6, 2.6, INK)}{C(90, H * 0.6, 2, OCHRE)}</>),
  // Desire: the nearer it gets, the further it goes. The target leaves ghosts of where it was, and then leaves the frame.
  sigDesire: sc(SAGE, ({ H }) => <>{C(14, H * 0.5, 7, BONE)}{n(4).map(i => <G key={i}>{R(40 + i * 16, H * 0.5, 7, BONE, 0.7, '1.6 1.8')}</G>)}{C(100 + 2, H * 0.5, 7, OCHRE)}{C(86, H * 0.5, 7, OCHRE)}</>),
  // Identity: one person, versions that never quite line up.
  sigIdentity: sc(BONE, ({ H }) => <>{[[44, 0, INK], [50, -3, OCHRE], [56, 2, SAGE], [47, 5, MOSS], [58, -5, INK]].map(([x, y, c], i) => <G key={i}>{R(x as number, H * 0.5 + (y as number), H * 0.34, c as string, i === 2 ? 3 : 1.1)}</G>)}{C(52, H * 0.5, 3, OCHRE)}</>),
  // Love: two separate structures, each reshaped to fit the other.
  sigLove: sc(BONE, ({ H }) => <><Path d={`M 0 0 H 47 V ${H * 0.34} A ${H * 0.16} ${H * 0.16} 0 0 0 47 ${H * 0.66} V ${H} H 0 Z`} fill={SAGE} /><Path d={`M 100 0 H 53 V ${H * 0.34} A ${H * 0.16} ${H * 0.16} 0 0 0 53 ${H * 0.66} V ${H} H 100 Z`} fill={OCHRE} />{<Rect x={47} y={0} width={0.6} height={H} fill={INK} />}</>),
  // Power: one form takes nearly all the room. Everything else is pushed against the edge.
  sigPower: sc(MOSS, ({ H }) => <>{C(100, H * 0.62, H * 0.78, OCHRE)}{n(6).map(i => <G key={i}>{C(8 + (i % 2) * 6, H * (0.14 + i * 0.14), 2.2, BONE)}</G>)}</>),
  // Status: identical forms; only the height and the size are different.
  sigStatus: sc(GOLD, ({ H }) => <>{[3.5, 5.5, 8, 12, 19, 34].map((r, i) => { const x = [8, 20, 33, 50, 74, 104][i]; return <G key={i}>{C(x, H * 0.84 - r * 0.9 - i * H * 0.05, r, i === 5 ? OCHRE : INK)}</G>; })}</>),
  // Freedom: a rigid system, and one element that stopped following it.
  sigFreedom: sc(BONE, ({ H }) => <>{n(48).map(i => { const x = 10 + (i % 8) * 11.5, y = H * 0.14 + Math.floor(i / 8) * (H * 0.14); return i === 5 ? null : <G key={i}>{C(x, y, 2.3, SAGE)}</G>; })}{C(94, H * 0.09, 4.4, OCHRE)}{<Path d={`M 69 ${H * 0.14} C 80 ${H * 0.14} 86 ${H * 0.1} 92 ${H * 0.09}`} stroke={OCHRE} strokeWidth={0.6} fill="none" strokeDasharray="1.2 1.6" />}</>),
  // Mortality: something large, going over the horizon.
  sigDeath: sc(BONE, ({ H }) => <>{[[10, 0.1], [26, 0.18], [42, 0.3], [58, 0.42], [74, 0.52]].map(([x, t], i) => <G key={i}><Rect x={x} y={H * t} width={14} height={H * 1.2} fill={i === 4 ? OCHRE : INK} /></G>)}<Rect x={0} y={H * 0.7} width={100} height={H * 0.3} fill={BONE} /><Rect x={0} y={H * 0.7} width={100} height={0.8} fill={INK} /><Rect x={0} y={H * 0.82} width={100} height={H * 0.18} fill={PALE} /></>),
  // Memory: the same form, replayed, changes a little each time.
  sigMemory: sc(BONE, ({ H }) => <>{n(6).map(i => <G key={i} transform={`rotate(${i * 7} ${12 + i * 15.5} ${H * 0.5})`}><Rect x={12 + i * 15.5 - 7} y={H * 0.5 - 7 - i * 0.6} width={14 + i} height={14 - i * 0.2} rx={7 - i * 1.3} fill={i === 0 ? SAGE : i === 5 ? OCHRE : i % 2 ? MOSS : SAGE} /></G>)}</>),
  // Shame: the self, mostly behind a bigger thing, looking out.
  sigShame: sc(BONE, ({ H }) => <>{C(26, H * 0.6, H * 0.24, OCHRE)}<Rect x={30} y={0} width={80} height={H} fill={MOSS} />{C(33, H * 0.56, 1.8, BONE)}</>),
  // Guilt: two forms, one cord, and no slack.
  sigGuilt: sc(GOLD, ({ H }) => <>{C(18, H * 0.25, 7, INK)}{C(82, H * 0.75, 7, OCHRE)}<Path d={`M 18 ${H * 0.25} C 90 ${H * 0.1} 10 ${H * 0.9} 82 ${H * 0.75}`} fill="none" stroke={INK} strokeWidth={2.2} strokeLinecap="round" /></>),
  // Envy: two matching forms, and a gap that is only height.
  sigEnvy: sc(OCHRE, ({ H }) => <>{<Rect x={70} y={H * 0.3} width={3} height={H * 0.7} fill={INK} />}{C(71.5, H * 0.27, 10, BONE)}{C(28, H * 0.74, 10, INK)}<Line x1={34} y1={H * 0.66} x2={65} y2={H * 0.32} stroke={INK} strokeWidth={0.6} strokeDasharray="1.2 1.8" /></>),
  // Loneliness: plenty of people, and a boundary you cannot see.
  sigLonely: sc(BONE, ({ H }) => <>{n(60).map(i => { const x = 6 + (i % 12) * 6.2, y = H * 0.12 + Math.floor(i / 12) * (H * 0.18); return x > 52 && x < 98 && y > H * 0.2 && y < H * 0.82 ? null : <G key={i}>{C(x, y, 1.6, SAGE)}</G>; })}{C(76, H * 0.52, 2.6, OCHRE)}</>),
  // Belonging: a group, and one form just starting to overlap it.
  sigBelong: sc(PALE, ({ H }) => <>{[[22, 0.42], [34, 0.58], [28, 0.7], [40, 0.38]].map(([x, y], i) => <G key={i}>{C(x as number, H * (y as number), 12, SAGE)}</G>)}{<Circle cx={66} cy={H * 0.55} r={12} fill={OCHRE} />}{R(40, H * 0.55, 12, INK, 0.8)}</>),
  // Meaning: scattered marks, turning toward one line.
  sigMeaning: sc(MOSS, ({ H }) => <>{n(14).map(i => { const x = 6 + i * 5.4, a = (1 - i / 13) * 70 * (i % 2 ? 1 : -1); return <G key={i} transform={`rotate(${a} ${x} ${H * 0.5})`}><Rect x={x - 3} y={H * 0.5 - 0.6} width={6} height={1.2} fill={BONE} /></G>; })}{C(90, H * 0.5, 4.6, GOLD)}</>),
  // Free will: the chain starts falling before the decision is announced.
  sigDominos: sc(BONE, ({ H }) => <>{n(9).map(i => <G key={i} transform={`rotate(${Math.min(i * 7, 52)} ${10 + i * 9.5} ${H * 0.78})`}><Rect x={10 + i * 9.5 - 1.8} y={H * 0.3} width={3.6} height={H * 0.48} fill={i === 8 ? OCHRE : INK} /></G>)}<Rect x={0} y={H * 0.78} width={100} height={0.8} fill={INK} />{C(16, H * 0.16, 3, SAGE)}</>),
};

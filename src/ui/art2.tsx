import type { ReactNode } from 'react';
import { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { PAL, type Scene, type SceneCtx } from './art';

// One concept, one picture. Each scene below is a single metaphor drawn for a single idea, in the LIMEN vocabulary
// (circle, plane, column, line, repetition with a change), with the vermilion/gold accent used once.
type P = (typeof PAL)[number];
type A = { W: number; H: number; rnd: () => number; P: P };
const mk = (f: (a: A) => ReactNode) => ({ W, H, rnd, v }: SceneCtx): Scene => { const P = PAL[v % PAL.length]; return { bg: P.bg, node: f({ W, H, rnd, P }) }; };
const C = (cx: number, cy: number, r: number, fill: string, k?: string | number) => <Circle key={k} cx={cx} cy={cy} r={r} fill={fill} />;
const R = (cx: number, cy: number, r: number, stroke: string, w = 0.8, dash?: string) => <Circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth={w} strokeDasharray={dash} />;
const L = (x1: number, y1: number, x2: number, y2: number, stroke: string, w = 0.8, dash?: string) => <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={w} strokeDasharray={dash} strokeLinecap="round" />;
const D = (d: string, stroke: string, w = 0.9, dash?: string) => <Path d={d} fill="none" stroke={stroke} strokeWidth={w} strokeDasharray={dash} strokeLinecap="round" strokeLinejoin="round" />;
const n = (len: number) => Array.from({ length: len }, (_, i) => i);

export const SCENES2: Record<string, (c: SceneCtx) => Scene> = {
  // a form and the larger shape it throws
  cast: mk(({ H, P, rnd }) => { const y = H * 0.72, x = 22 + rnd() * 10; return <>{C(x, y - 9, 8, P.acc)}<Rect x={x - 1.3} y={y - 3} width={2.6} height={3} fill={P.form} /><Path d={`M ${x} ${y} L ${x + 62} ${y + 4} L ${x + 62} ${y - 2} Z`} fill={P.form} />{L(6, y, 94, y, P.line, 0.5)}</>; }),
  // a small source projected onto a wall, larger and not the same
  beam: mk(({ H, P }) => <>{C(14, H * 0.5, 4.5, P.acc)}<Path d={`M 16 ${H * 0.48} L 68 ${H * 0.12} L 68 ${H * 0.88} L 16 ${H * 0.52} Z`} fill={P.soft} />{<Rect x={68} y={0} width={32} height={H} fill={P.form} />}{C(84, H * 0.5, H * 0.26, P.bg)}</>),
  // a front half, held in front of a face
  masks: mk(({ H, P }) => <>{C(46, H * 0.5, H * 0.34, P.soft)}<Path d={`M 54 ${H * 0.2} A ${H * 0.34} ${H * 0.34} 0 0 0 54 ${H * 0.8} Z`} fill={P.form} transform="translate(2 -3)" />{C(70, H * 0.3, 2.6, P.acc)}</>),
  // a whole form, one fault line
  crack: mk(({ H, P }) => <>{C(50, H * 0.5, H * 0.38, P.form)}{D(`M 50 ${H * 0.12} L 44 ${H * 0.32} L 56 ${H * 0.46} L 46 ${H * 0.64} L 53 ${H * 0.88}`, P.bg, 1.6)}{C(53, H * 0.46, 2.4, P.acc)}</>),
  // a form partly hidden behind a larger structure
  hidden: mk(({ H, P }) => <>{C(40, H * 0.58, H * 0.2, P.acc)}<Rect x={38} y={0} width={34} height={H} fill={P.form} />{<Rect x={78} y={H * 0.1} width={8} height={H * 0.9} fill={P.soft} />}</>),
  // being seen from every side
  watched: mk(({ H, P }) => <>{C(50, H * 0.5, 5, P.acc)}{R(50, H * 0.5, 13, P.line, 0.5)}{R(50, H * 0.5, 22, P.line, 0.5)}{n(16).map(i => { const a = (i / 16) * Math.PI * 2; return <G key={i}>{L(50 + Math.cos(a) * 28, H * 0.5 + Math.sin(a) * 28, 50 + Math.cos(a) * 36, H * 0.5 + Math.sin(a) * 36, P.form, 1.2)}</G>; })}</>),
  // wanting and liking: one leans forward, one is simply there
  twin: mk(({ H, P }) => <>{C(30, H * 0.5, 13, P.acc)}{D(`M 46 ${H * 0.5} L 58 ${H * 0.5} M 53 ${H * 0.42} L 58 ${H * 0.5} L 53 ${H * 0.58}`, P.line, 1)}{R(76, H * 0.5, 13, P.form, 1.4, '2 2.4')}</>),
  // fixation around one bright thing
  orbit: mk(({ H, P }) => <>{C(50, H * 0.5, 9, P.acc)}{n(3).map(i => <G key={i}>{R(50, H * 0.5, 16 + i * 8, P.line, 0.4, '1 2')}</G>)}{C(50 + 24, H * 0.5, 3, P.form)}{C(50 - 16, H * 0.5 + 0.1, 2, P.form)}</>),
  // one steps forward as the other steps back
  pursue: mk(({ H, P }) => <>{n(4).map(i => <G key={i}>{C(14 + i * 15, H * 0.34, 5, P.acc)}{C(40 + i * 17, H * 0.68, 5, P.form)}</G>)}{L(8, H * 0.51, 92, H * 0.51, P.line, 0.4, '1 2')}</>),
  // a grid, mostly dark, a few lit at no pattern
  slots: mk(({ H, P, rnd }) => { const lit = [3, 9, 11, 17, 22].map(x => (x + Math.floor(rnd() * 3)) % 27); return <>{n(27).map(i => { const x = 18 + (i % 9) * 8.5, y = H * 0.2 + Math.floor(i / 9) * (H * 0.3); return <G key={i}>{C(x, y, lit.includes(i) ? 3.4 : 2, lit.includes(i) ? P.acc : P.soft)}</G>; })}</>; }),
  // the price paid, and the thing at the top
  stairs: mk(({ H, P }) => <>{n(5).map(i => <Rect key={i} x={8 + i * 17} y={H - (i + 1) * (H * 0.15)} width={18} height={(i + 1) * (H * 0.15)} fill={i % 2 ? P.form : P.soft} />)}{C(82, H - 5 * (H * 0.15) - 6, 5, P.acc)}</>),
  // the floor tilting away
  vertigo: mk(({ H, P }) => <>{n(6).map(i => <G key={i} transform={`rotate(${i * 9} 50 ${H * 0.5})`}><Rect x={50 - 30 + i * 4} y={H * 0.5 - 30 + i * 4} width={60 - i * 8} height={60 - i * 8} fill="none" stroke={i === 5 ? P.acc : P.line} strokeWidth={i === 5 ? 2 : 0.6} /></G>)}</>),
  // a gap in the bars through which something is seen, and ignored
  curtain: mk(({ H, P }) => <>{C(50, H * 0.5, H * 0.17, P.acc)}{n(10).map(i => i === 4 || i === 5 ? null : <Rect key={i} x={i * 10 + 0.5} y={0} width={9} height={H} fill={P.form} />)}</>),
  // rows of duty, one tiny form
  rows: mk(({ H, P, rnd }) => <>{n(6).map(i => <Rect key={i} x={10} y={H * 0.1 + i * (H * 0.14)} width={30 + rnd() * 50} height={H * 0.07} fill={i % 2 ? P.soft : P.form} />)}{C(90, H * 0.1 + 3 * (H * 0.14) + H * 0.035, 3, P.acc)}</>),
  // retreating into a box with the door open
  cage: mk(({ H, P }) => <>{D(`M 80 ${H * 0.2} L 20 ${H * 0.2} L 20 ${H * 0.8} L 80 ${H * 0.8}`, P.form, 2)}{C(34, H * 0.5, 6, P.acc)}{L(80, H * 0.35, 98, H * 0.35, P.line, 0.5, '1.4 2')}</>),
  // a small hard thing driven into a mass
  wedge: mk(({ H, P }) => <><Rect x={0} y={H * 0.45} width={100} height={H * 0.55} fill={P.form} /><Path d={`M 50 ${H * 0.62} L 42 ${H * 0.14} L 58 ${H * 0.14} Z`} fill={P.acc} />{L(50, H * 0.45, 50, H * 0.62, P.bg, 0.9)}</>),
  // the slope, the rock, no summit
  boulder: mk(({ H, P }) => <>{<Path d={`M 0 ${H} L 0 ${H * 0.8} L 100 ${H * 0.22} L 100 ${H} Z`} fill={P.form} />}{C(44, H * 0.8 - 44 * 0.58 - 7, 7, P.acc)}{L(86, H * 0.28, 86, H * 0.12, P.line, 0.8)}{<Rect x={86} y={H * 0.12} width={7} height={3} fill={P.line} />}</>),
  // the same form again and again, and one beginning to leave
  identical: mk(({ H, P }) => <>{n(18).map(i => { const x = 14 + (i % 6) * 14.5, y = H * 0.24 + Math.floor(i / 6) * (H * 0.26); return <G key={i}>{C(x, y, 4.6, i === 8 ? P.acc : P.soft)}</G>; })}</>),
  // what was, what will not be
  symmetry: mk(({ H, P }) => <>{L(50, 6, 50, H - 6, P.line, 0.5)}{C(26, H * 0.5, H * 0.22, P.form)}{R(74, H * 0.5, H * 0.22, P.form, 1.4, '2 2.4')}{C(26, H * 0.5, 2.4, P.acc)}</>),
  // a form bent by what it cannot have
  tilt: mk(({ H, P }) => <>{n(3).map(i => <G key={i} transform={`rotate(${-12 + i * 3} ${30 + i * 18} ${H})`}><Rect x={22 + i * 18} y={H * 0.1 + i * 6} width={12} height={H} fill={i === 1 ? P.form : P.soft} /></G>)}<Path d={`M 78 ${H * 0.2} L 90 ${H * 0.2} L 84 ${H * 0.4} Z`} fill={P.acc} /></>),
  // two similar forms, one higher
  envy: mk(({ H, P }) => <>{<Rect x={61} y={H * 0.36} width={2} height={H * 0.64} fill={P.line} />}{C(62, H * 0.3, 11, P.form)}{C(34, H * 0.64, 11, P.acc)}{L(38, H * 0.56, 56, H * 0.36, P.line, 0.5, '1 2')}</>),
  // watched structure: cells around a centre
  panopticon: mk(({ H, P }) => <>{R(50, H * 0.5, H * 0.4, P.form, 3)}{n(12).map(i => { const a = (i / 12) * Math.PI * 2; return <G key={i}>{L(50 + Math.cos(a) * H * 0.2, H * 0.5 + Math.sin(a) * H * 0.2, 50 + Math.cos(a) * H * 0.4, H * 0.5 + Math.sin(a) * H * 0.4, P.line, 0.5)}</G>; })}{C(50, H * 0.5, 4.4, P.acc)}</>),
  // identical marks, nobody's decision
  stamps: mk(({ H, P }) => <>{n(20).map(i => <Rect key={i} x={12 + (i % 5) * 16} y={H * 0.14 + Math.floor(i / 5) * (H * 0.2)} width={11} height={H * 0.11} fill={i === 13 ? P.acc : P.form} transform={i === 13 ? 'translate(3 0)' : undefined} />)}</>),
  // lines pressing down on a flattened form
  pressed: mk(({ H, P }) => <>{n(5).map(i => <Rect key={i} x={0} y={i * (H * 0.09)} width={100} height={H * 0.03} fill={P.line} />)}<Path d={`M 30 ${H * 0.85} A 20 ${H * 0.1} 0 0 1 70 ${H * 0.85} Z`} fill={P.acc} />{<Rect x={0} y={H * 0.85} width={100} height={H * 0.15} fill={P.form} />}</>),
  // a ring of forms with a gap, and one outside it
  outside: mk(({ H, P }) => <>{n(9).map(i => i === 2 ? null : (() => { const a = (i / 9) * Math.PI * 2; return <G key={i}>{C(40 + Math.cos(a) * 20, H * 0.5 + Math.sin(a) * H * 0.34, 4.4, P.form)}</G>; })())}{C(86, H * 0.5, 4.4, P.acc)}</>),
  // a path through events, ending somewhere
  story: mk(({ H, P }) => <>{D(`M 8 ${H * 0.7} C 24 ${H * 0.2} 34 ${H * 0.9} 52 ${H * 0.45} S 80 ${H * 0.2} 92 ${H * 0.3}`, P.form, 1.6)}{[8, 30, 52, 74].map((x, i) => <G key={i}>{C(x, [H * 0.7, H * 0.52, H * 0.45, H * 0.3][i], 2.6, P.line)}</G>)}{C(92, H * 0.3, 5, P.acc)}</>),
  // blinds across a face
  veil: mk(({ H, P }) => <>{C(50, H * 0.5, H * 0.34, P.acc)}{n(7).map(i => <Rect key={i} x={0} y={H * 0.1 + i * (H * 0.12)} width={100} height={H * 0.06} fill={P.bg} />)}</>),
  // the swing, and its mirror
  pendulum: mk(({ H, P }) => <>{L(50, 0, 74, H * 0.7, P.line, 0.8)}{C(74, H * 0.7, 6, P.acc)}{L(50, 0, 26, H * 0.7, P.line, 0.4, '1 2')}{R(26, H * 0.7, 6, P.form, 1)}{D(`M 26 ${H * 0.9} Q 50 ${H * 1.05} 74 ${H * 0.9}`, P.line, 0.4, '1 2')}</>),
  // a grid on one side, a light on the other, and no bridge
  gap: mk(({ H, P }) => <>{n(12).map(i => <Rect key={i} x={8 + (i % 4) * 9} y={H * 0.2 + Math.floor(i / 4) * (H * 0.22)} width={6} height={H * 0.12} fill={P.form} />)}{L(50, 8, 50, H - 8, P.line, 0.5, '1.4 2')}{C(76, H * 0.5, H * 0.2, P.acc)}</>),
  // parts gathering into a whole that was never there
  assemble: mk(({ H, P }) => <>{[[0, 1], [1, 1], [1, 0], [0, 0]].map(([a, b], i) => <Path key={i} d={`M ${50 + (a ? 1.4 : -1.4)} ${H * 0.5 + (b ? 1.4 : -1.4)} L ${50 + (a ? 1.4 : -1.4) + (a ? 24 : -24)} ${H * 0.5 + (b ? 1.4 : -1.4)} A 24 24 0 0 ${a === b ? 1 : 0} ${50 + (a ? 1.4 : -1.4)} ${H * 0.5 + (b ? 1.4 : -1.4) + (b ? 24 : -24)} Z`} fill={i === 2 ? P.acc : i % 2 ? P.soft : P.form} />)}</>),
  // the act, and what came before it
  ramp: mk(({ H, P }) => <>{n(7).map(i => <Rect key={i} x={6 + i * 9.5} y={H * 0.8 - (i + 1) * (H * 0.09)} width={7} height={(i + 1) * (H * 0.09)} fill={P.soft} />)}{L(76, 6, 76, H - 6, P.line, 0.8)}{C(88, H * 0.5, 4.6, P.acc)}</>),
  // second place
  podium: mk(({ H, P }) => <><Rect x={10} y={H * 0.45} width={26} height={H * 0.55} fill={P.acc} /><Rect x={37} y={H * 0.25} width={26} height={H * 0.75} fill={P.form} /><Rect x={64} y={H * 0.62} width={26} height={H * 0.38} fill={P.soft} />{C(23, H * 0.45 - 6, 5, P.line)}{C(50, H * 0.25 - 6, 5, P.line)}{C(77, H * 0.62 - 6, 5, P.line)}</>),
  // a structure with nothing at its top
  hollow: mk(({ H, P }) => <>{D(`M 12 ${H * 0.9} L 50 ${H * 0.12} L 88 ${H * 0.9} Z`, P.form, 1.6)}{C(50, H * 0.12 + 5, 2.4, P.acc)}{n(9).map(i => <G key={i}>{C(14 + i * 9, H * 0.9 - 3, 2.2, P.soft)}</G>)}</>),
  // a small figure in a cone of attention, others in the dark
  spot: mk(({ H, P }) => <><Path d={`M 50 0 L 22 ${H} L 78 ${H} Z`} fill={P.soft} />{C(50, H * 0.76, 4.4, P.acc)}{n(8).map(i => <G key={i}>{C(8 + i * 12.4, H * 0.9, 1.8, P.form)}</G>)}</>),
  // a chosen weight, tied on
  ankle: mk(({ H, P }) => <>{C(36, H * 0.44, 12, P.acc)}{D(`M 36 ${H * 0.44 + 12} Q 40 ${H * 0.82} 62 ${H * 0.84}`, P.line, 0.8)}<Rect x={60} y={H * 0.74} width={26} height={H * 0.2} fill={P.form} /></>),
  // one thing sharp among soft ones
  focus: mk(({ H, P }) => <>{[[16, 8, 0.5], [32, 12, 0.6], [58, 14, 0.5], [82, 9, 0.4]].map(([x, r, o], i) => <G key={i}><Circle cx={x} cy={H * 0.5 + (i % 2 ? 6 : -6)} r={r} fill={P.soft} opacity={o} /></G>)}{C(46, H * 0.5, 9, P.acc)}{R(46, H * 0.5, 14, P.line, 0.6)}</>),
  // something small held
  cradle: mk(({ H, P }) => <>{D(`M 14 ${H * 0.42} A 36 ${H * 0.4} 0 0 0 86 ${H * 0.42}`, P.form, 4)}{C(50, H * 0.46, 8, P.acc)}</>),
  // two states, switched on request
  onoff: mk(({ H, P }) => <><Rect x={18} y={H * 0.2} width={64} height={H * 0.24} rx={H * 0.12} fill={P.soft} /><Circle cx={30} cy={H * 0.32} r={H * 0.09} fill={P.bg} /><Rect x={18} y={H * 0.56} width={64} height={H * 0.24} rx={H * 0.12} fill={P.acc} /><Circle cx={70} cy={H * 0.68} r={H * 0.09} fill={P.bg} /></>),
  // a form resting on another
  lean: mk(({ H, P }) => <>{C(38, H * 0.56, H * 0.3, P.form)}{C(38 + H * 0.3 + 6, H * 0.4, 7, P.acc)}{L(8, H * 0.86, 92, H * 0.86, P.line, 0.5)}</>),
  // a spiral that feeds itself
  consume: mk(({ H, P }) => { let d = ''; for (let i = 0; i <= 60; i++) { const a = i * 0.36, r = 3 + i * 0.5; d += `${i ? 'L' : 'M'} ${(50 + Math.cos(a) * r).toFixed(1)} ${(H * 0.5 + Math.sin(a) * r * (H / 90)).toFixed(1)} `; } return <>{D(d, P.form, 2)}{C(50, H * 0.5, 3.4, P.acc)}</>; }),
  // two pointed forms facing, a gap held between
  tension: mk(({ H, P }) => <><Path d={`M 8 ${H * 0.22} L 44 ${H * 0.5} L 8 ${H * 0.78} Z`} fill={P.form} /><Path d={`M 92 ${H * 0.22} L 56 ${H * 0.5} L 92 ${H * 0.78} Z`} fill={P.acc} />{L(46, H * 0.5, 54, H * 0.5, P.line, 0.8)}</>),
  // dots that feel like one body
  imagined: mk(({ H, P, rnd }) => <><Path d={`M 14 ${H * 0.5} C 14 ${H * 0.08} 86 ${H * 0.08} 86 ${H * 0.5} C 86 ${H * 0.92} 14 ${H * 0.92} 14 ${H * 0.5} Z`} fill="none" stroke={P.line} strokeWidth={0.6} strokeDasharray="1.4 2" />{n(22).map(i => { const a = rnd() * 6.28, r = Math.sqrt(rnd()) * 0.8; return <G key={i}>{C(50 + Math.cos(a) * r * 34, H * 0.5 + Math.sin(a) * r * H * 0.34, 1.9, i === 5 ? P.acc : P.form)}</G>; })}</>),
  // a large voice in front of a small one
  voice: mk(({ H, P }) => <>{C(18, H * 0.64, 4, P.soft)}{C(66, H * 0.5, H * 0.18, P.form)}{[1, 2, 3].map(i => <G key={i}>{R(66, H * 0.5, H * 0.18 + i * 8, P.acc, 1)}</G>)}</>),
  // two selves, a little apart
  double: mk(({ H, P }) => <>{C(44, H * 0.5, H * 0.3, P.soft)}<Circle cx={58} cy={H * 0.5} r={H * 0.3} fill="none" stroke={P.form} strokeWidth={2} />{C(51, H * 0.5, 2.6, P.acc)}</>),
  // a small win built of stones
  cairn: mk(({ H, P }) => <>{[[34, 0.8, 0], [24, 0.62, 1], [14, 0.46, 0]].map(([w, y, k], i) => <Rect key={i} x={50 - w / 2 + (k ? 3 : -2)} y={H * y} width={w} height={H * 0.15} rx={4} fill={k ? P.soft : P.form} />)}{C(52, H * 0.34, 4, P.acc)}{L(8, H * 0.95, 92, H * 0.95, P.line, 0.5)}</>),
  // the same blocks, set down differently
  rebuild: mk(({ H, P }) => <>{[[0, 0.7], [1, 0.5], [2, 0.3]].map(([i, y]) => <Rect key={i} x={18 + i * 2} y={H * y} width={30} height={H * 0.17} fill="none" stroke={P.line} strokeWidth={0.6} strokeDasharray="1.4 2" />)}{[[0, 0.7, 12], [1, 0.5, 6], [2, 0.3, 14]].map(([i, y, dx]) => <Rect key={i} x={46 + dx} y={H * y} width={30} height={H * 0.17} fill={i === 1 ? P.acc : P.form} />)}</>),
  // waves, not steps
  tide: mk(({ H, P }) => <>{n(5).map(i => <G key={i}>{D(`M 0 ${H * (0.2 + i * 0.16)} Q 15 ${H * (0.1 + i * 0.16)} 30 ${H * (0.2 + i * 0.16)} T 60 ${H * (0.2 + i * 0.16)} T 100 ${H * (0.2 + i * 0.16)}`, i === 3 ? P.acc : P.form, i === 3 ? 2 : 1.2)}</G>)}</>),
  // a room of one's own
  room: mk(({ H, P }) => <><Rect x={22} y={H * 0.14} width={56} height={H * 0.72} fill={P.soft} /><Rect x={64} y={H * 0.44} width={14} height={H * 0.42} fill={P.bg} />{C(40, H * 0.72, 6, P.acc)}<Rect x={14} y={H * 0.86} width={72} height={2.6} fill={P.form} /></>),
  // the thing wanted, further each time
  receding: mk(({ H, P }) => <>{n(6).map(i => <G key={i}>{C(10 + i * 14, H * 0.5, 9 - i * 1.3, i === 5 ? P.acc : P.form)}</G>)}{L(8, H * 0.5 + 12, 92, H * 0.5 + 12, P.line, 0.4, '1 2')}</>),
  // subject and object, not yet two
  merge: mk(({ H, P }) => <>{C(42, H * 0.5, H * 0.3, P.soft)}{C(58, H * 0.5, H * 0.3, P.form)}<Path d={`M 50 ${H * 0.5 - H * 0.2} A ${H * 0.3} ${H * 0.3} 0 0 1 50 ${H * 0.5 + H * 0.2} A ${H * 0.3} ${H * 0.3} 0 0 1 50 ${H * 0.5 - H * 0.2} Z`} fill={P.acc} /></>),
  // one rule, several courses
  branch: mk(({ H, P }) => <>{D(`M 50 ${H} L 50 ${H * 0.6} M 50 ${H * 0.6} L 22 ${H * 0.22} M 50 ${H * 0.6} L 50 ${H * 0.16} M 50 ${H * 0.6} L 80 ${H * 0.3}`, P.form, 2)}{C(22, H * 0.22, 4.4, P.soft)}{C(50, H * 0.16, 4.4, P.acc)}{C(80, H * 0.3, 4.4, P.soft)}</>),
  // a form inside a form inside a form
  nested: mk(({ H, P }) => <>{[0.44, 0.34, 0.24, 0.14].map((r, i) => <G key={i}>{C(50, H * (0.56 + i * 0.07), H * r, [P.soft, P.form, P.soft, P.acc][i])}</G>)}</>),
  // one square among circles
  misfit: mk(({ H, P }) => <>{n(15).map(i => { const x = 14 + (i % 5) * 18, y = H * 0.2 + Math.floor(i / 5) * (H * 0.3); return i === 7 ? <Rect key={i} x={x - 5} y={y - 5} width={10} height={10} fill={P.acc} /> : <G key={i}>{C(x, y, 5, P.soft)}</G>; })}</>),
  // heat from one point
  burst: mk(({ H, P }) => <>{n(14).map(i => { const a = (i / 14) * Math.PI * 2, r1 = H * 0.2, r2 = H * (i % 2 ? 0.36 : 0.46); return <G key={i}>{L(50 + Math.cos(a) * r1 * 1.2, H * 0.5 + Math.sin(a) * r1, 50 + Math.cos(a) * r2 * 1.3, H * 0.5 + Math.sin(a) * r2, P.line, i % 2 ? 1.2 : 2.4)}</G>; })}{C(50, H * 0.5, H * 0.15, P.acc)}</>),
  // a pile that grows and says nothing
  coins: mk(({ H, P }) => <>{n(5).map(i => <G key={i}>{C(24 + i * 13, H * 0.8 - i * i * 1.6, 5 + i * 1.8, i === 4 ? P.acc : i % 2 ? P.soft : P.form)}</G>)}{L(8, H * 0.92, 92, H * 0.92, P.line, 0.5)}</>),
  // two forms that stay connected
  tether: mk(({ H, P }) => <>{C(24, H * 0.3, 9, P.form)}{C(76, H * 0.7, 9, P.acc)}{D(`M 24 ${H * 0.3 + 9} C 24 ${H * 0.9} 76 ${H * 0.1} 76 ${H * 0.7 - 9}`, P.line, 1.2)}</>),
  // the word itself, repeated with a change in scale
  typo: ({ W, H, v, word = 'LIMEN' }: SceneCtx): Scene => {
    const P = PAL[v % PAL.length], s0 = Math.min(H * 0.36, 90 / (word.length * 0.66)), sizes = [1, 0.62, 0.4, 0.26];
    let y = H * 0.1;
    return { bg: P.bg, node: <>{sizes.map((k, i) => { const s = s0 * k; y += s * 0.98; return <SvgText key={i} x={7} y={y} fontFamily="Figtree_700Bold" fontSize={s} fill={i === sizes.length - 1 ? P.acc : i % 2 ? P.soft : P.form}>{word}</SvgText>; })}<Rect x={86} y={H * 0.3} width={14} height={3} fill={P.acc} /></> };
  },
};

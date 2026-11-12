import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { T } from './kit';
import { SCENES2 } from './art2';
import { SIG } from './art3';

// The LIMEN visual library. Each scene is one idea, drawn once: composed from a small shared vocabulary
// (circles, planes, columns, rows, a tiny figure, repetition with a change) in two to four colours, with overlap doing the work of depth.
// LIMEN colour roles. Cobalt = thought, ultramarine = depth, vermilion = tension, bone = reading, sand and pale blue = quiet surfaces.
// (The constant names are kept from the first palette so every scene recolours at once: MOSS is now ultramarine, SAGE cobalt, OCHRE vermilion, STONE a dusty blue.)
export const INK = '#171A1B', BONE = '#F5F0E6', MOSS = '#172C68', SAGE = '#3157D5', OCHRE = '#E6533D', STONE = '#9DB0E0';
// Gold is the interruption: an energy colour at full strength, never tinted or translucent.
export const GOLD = '#F2C94C';
export const ULTRAMARINE = MOSS, COBALT = SAGE, VERMILION = OCHRE;
const PALE_SAGE = '#DCE4F5', PALE_OCHRE = GOLD, MIST = '#E7E1D2', DEEP_OCHRE = '#A8402D';

export type SceneCtx = { W: number; H: number; rnd: () => number; v: number; word?: string };
// Palette variants for the generated scenes: a dominant field, a form, a soft tone, one accent.
export const PAL = [
  { bg: PALE_SAGE, form: MOSS, soft: SAGE, acc: OCHRE, line: INK },
  { bg: PALE_OCHRE, form: MOSS, soft: SAGE, acc: OCHRE, line: INK },
  { bg: SAGE, form: BONE, soft: STONE, acc: GOLD, line: BONE },
  { bg: MOSS, form: BONE, soft: SAGE, acc: GOLD, line: BONE },
  { bg: OCHRE, form: INK, soft: BONE, acc: MOSS, line: INK },
  { bg: BONE, form: MOSS, soft: STONE, acc: OCHRE, line: INK },
  { bg: INK, form: BONE, soft: SAGE, acc: GOLD, line: BONE },
  { bg: OCHRE, form: BONE, soft: INK, acc: GOLD, line: INK },
  { bg: SAGE, form: OCHRE, soft: BONE, acc: GOLD, line: BONE },
];
export type Scene = { bg: string; node: ReactNode; still?: boolean };

// A circle cut by hand: slightly off round.
function blob(cx: number, cy: number, r: number, rnd: () => number, wob = 0.05) {
  const n = 8, pts: [number, number][] = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, k = r * (1 + (rnd() - 0.5) * wob); pts.push([cx + Math.cos(a) * k, cy + Math.sin(a) * k]); }
  const mid = (a: [number, number], b: [number, number]): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let d = `M ${mid(pts[n - 1], pts[0]).join(' ')}`;
  for (let i = 0; i < n; i++) d += ` Q ${pts[i].join(' ')} ${mid(pts[i], pts[(i + 1) % n]).join(' ')}`;
  return d + ' Z';
}
const Figure = ({ x, y, s = 1, fill }: { x: number; y: number; s?: number; fill: string }) => (
  <G>
    <Rect x={x - 1.1 * s} y={y - 7 * s} width={2.2 * s} height={7 * s} rx={1.1 * s} fill={fill} />
    <Circle cx={x} cy={y - 8.8 * s} r={1.5 * s} fill={fill} />
  </G>
);

export const SCENES: Record<string, (c: SceneCtx) => Scene> = {
  // Fear is not the size of the threat but the size of the shadow we give it.
  fear: ({ W, H, rnd }) => {
    const g = H * 0.8;
    return { bg: PALE_OCHRE, still: true, node: <>
      <Rect x={0} y={g} width={W} height={H - g} fill={MOSS} />
      <Circle cx={14} cy={H * 0.2} r={3.2} fill={OCHRE} />
      <Path d={`M 9 ${g} C 12 ${H * 0.38}, 46 -8, 110 -8 L 110 ${g} Z`} fill={INK} opacity={0.94} />
      <Path d={`M 9 ${g} C 20 ${H * 0.5}, 56 ${H * 0.1}, 110 ${H * 0.02}`} fill="none" stroke={BONE} strokeWidth={0.35} opacity={0.5} />
      <Figure x={27} y={g} s={1.25} fill={BONE} />
    </> };
  },
  // Which version is the self? Several translucent forms, one of them aligned, the rest displaced.
  identity: ({ W, H, rnd }) => {
    const r = Math.min(H * 0.28, 25), cy = H * 0.5;
    const cols: [string, number][] = [[PALE_SAGE, 0.8], [SAGE, 0.72], [OCHRE, 0.7], [BONE, 0.55]];
    return { bg: MOSS, node: <>
      {cols.map(([c, o], i) => <Path key={i} d={blob(32 + i * 11 + (rnd() - 0.5) * 3, cy + (i % 2 ? 4 : -4) + (rnd() - 0.5) * 3, r, rnd)} fill={c} opacity={o} />)}
      <Path d={blob(43, cy, r * 1.02, rnd, 0.02)} fill="none" stroke={BONE} strokeWidth={0.5} />
    </> };
  },
  // Desire is the pursuit: the object keeps the same distance however far you come.
  desire: ({ W, H }) => {
    const y = H * 0.54, gap = 36;
    return { bg: PALE_SAGE, node: <>
      <Rect x={0} y={y + 14} width={W} height={0.5} fill={INK} opacity={0.35} />
      {[0, 1, 2, 3].map(i => { const x = 10 + i * 16, o = 0.25 + i * 0.25; return <G key={i} opacity={o}>
        <Circle cx={x} cy={y} r={2.6} fill={INK} />
        <Circle cx={x + gap} cy={y} r={9} fill={MOSS} />
      </G>; })}
      <Circle cx={82} cy={y - 18} r={2.4} fill={OCHRE} />
    </> };
  },
  // Status is nothing but arrangement: a ring of identical forms, one slightly raised.
  status: ({ W, H }) => {
    const R = Math.min(H * 0.34, 28), cx = 50, cy = H * 0.52;
    return { bg: MIST, node: <>
      {Array.from({ length: 11 }, (_, i) => { const a = (i / 11) * Math.PI * 2; return <Circle key={i} cx={cx + Math.cos(a) * R * 1.35} cy={cy + Math.sin(a) * R * 0.9} r={4.2} fill={SAGE} />; })}
      <Circle cx={cx + 1} cy={cy + 6} r={6.4} fill={STONE} opacity={0.6} />
      <Circle cx={cx} cy={cy - 3} r={6.4} fill={INK} />
      <Circle cx={cx + 2.2} cy={cy - 5.4} r={1.6} fill={OCHRE} />
    </> };
  },
  // A large structure slipping beyond the horizon; a tiny figure stays in the foreground.
  mortality: ({ W, H }) => {
    const hz = H * 0.78;
    return { bg: PALE_OCHRE, node: <>
      <Circle cx={72} cy={hz - 2} r={9} fill={OCHRE} />
      {[0, 1, 2, 3, 4].map(i => { const w = 15, h = H * 0.64 * (1 - i * 0.16), x = 6 + i * 18; return <Path key={i} d={`M ${x} ${hz} L ${x} ${hz - h + w / 2} A ${w / 2} ${w / 2} 0 0 1 ${x + w} ${hz - h + w / 2} L ${x + w} ${hz} Z`} fill={MOSS} opacity={1 - i * 0.2} />; })}
      <Rect x={0} y={hz} width={W} height={H - hz} fill={INK} opacity={0.12} />
      <Figure x={90} y={H * 0.93} s={1.1} fill={INK} />
    </> };
  },
  // The same scene, remembered four times, never quite in the same place.
  memory: ({ W, H }) => {
    const cols = [SAGE, OCHRE, MOSS];
    return { bg: MIST, node: <>
      {[0, 1, 2, 3].map(i => <G key={i} transform={`translate(${i * 3.4 - 5} ${i * 2.4 - 3})`}>
        <Circle cx={66} cy={H * 0.3} r={9} fill={i === 3 ? 'none' : cols[i % 3]} stroke={INK} strokeWidth={i === 3 ? 0.5 : 0} opacity={i === 3 ? 0.8 : 0.55} />
        <Path d={`M -12 ${H + 8} L -12 ${H * 0.66} C 26 ${H * 0.52}, 50 ${H * 0.8}, 112 ${H * 0.6} L 112 ${H + 8} Z`} fill={cols[(i + 1) % 3]} opacity={i === 3 ? 0.35 : 0.5} />
      </G>)}
    </> };
  },
  // A constraint that opens into a larger field.
  freedom: ({ W, H }) => {
    const x0 = 14, y0 = H * 0.2, w = 34, h = H * 0.6;
    return { bg: PALE_SAGE, node: <>
      <Circle cx={96} cy={H * 0.78} r={H * 0.62} fill={PALE_OCHRE} />
      <Path d={`M ${x0 + w} ${y0} L ${x0} ${y0} L ${x0} ${y0 + h} L ${x0 + w} ${y0 + h}`} fill="none" stroke={INK} strokeWidth={1.1} />
      {[[24, 6.4, 1], [53, 4.2, 0.9], [66, 6.2, 0.8], [82, 9, 0.7]].map(([x, r, o], i) => <Circle key={i} cx={x} cy={H * 0.5} r={r} fill={i === 0 ? MOSS : i === 3 ? OCHRE : SAGE} opacity={o} />)}
    </> };
  },
  // Two forms almost touching.
  // Two bodies, a gap that is neither, and the traffic across it: arcs that reach for each other, small things in transit.
  closeness: ({ W, H, rnd }) => {
    const r = Math.min(H * 0.3, 21), cy = H * 0.5, x1 = 50 - r - 3, x2 = 50 + r * 0.92 + 3;
    return { bg: PALE_OCHRE, node: <>
      {[1.5, 1.95, 2.45].map((k, i) => <Circle key={i} cx={50} cy={cy} r={r * k} fill="none" stroke={MOSS} strokeWidth={0.28} opacity={0.34 - i * 0.08} />)}
      <Path d={`M 50 ${cy - r * 0.78} Q ${50 + 7} ${cy} 50 ${cy + r * 0.78} Q ${50 - 7} ${cy} 50 ${cy - r * 0.78} Z`} fill={OCHRE} />
      <Path d={blob(x1, cy, r, rnd, 0.08)} fill={MOSS} />
      <Path d={blob(x2, cy + 2, r * 0.92, rnd, 0.08)} fill={BONE} opacity={0.96} />
      {Array.from({ length: 7 }, (_, i) => <Circle key={i} cx={x1 + i * ((x2 - x1) / 6)} cy={cy - r * 1.22 - Math.sin(i / 6 * Math.PI) * 5} r={0.55 + (i === 3 ? 0.5 : 0)} fill={i === 3 ? OCHRE : MOSS} opacity={0.7} />)}
      <Rect x={0} y={H * 0.92} width={W} height={0.5} fill={MOSS} opacity={0.35} />
    </> };
  },
  // One large thing and many small ones, and the shadow between.
  power: ({ W, H }) => ({ bg: INK, node: <>
    <Rect x={70} y={-2} width={14} height={H + 4} fill={GOLD} />
    <Path d={`M 70 ${H} L 70 ${H * 0.5} L 0 ${H * 0.86} L 0 ${H} Z`} fill={MOSS} opacity={0.55} />
    {Array.from({ length: 4 }, (_, r) => Array.from({ length: 7 }, (_, c) => <Circle key={`${r}${c}`} cx={7 + c * 8.4} cy={H * 0.22 + r * (H * 0.15)} r={2} fill={BONE} opacity={0.8} />))}
  </> }),
  // Fragments that slowly find a line.
  meaning: ({ W, H, rnd }) => ({ bg: MOSS, node: <>
    {Array.from({ length: 12 }, (_, i) => { const t = i / 11, x = 8 + i * 7.2, y = H * 0.54 - t * H * 0.1 + (1 - t) * (rnd() - 0.5) * H * 0.4, a = (1 - t) * (rnd() - 0.5) * 140 * Math.PI / 180, l = 3 + t * 3; return <Path key={i} d={`M ${x - Math.cos(a) * l} ${y - Math.sin(a) * l} L ${x + Math.cos(a) * l} ${y + Math.sin(a) * l}`} stroke={BONE} strokeWidth={1.1} strokeLinecap="round" opacity={0.45 + t * 0.55} />; })}
    <Circle cx={94} cy={H * 0.44} r={2.8} fill={GOLD} />
  </> }),
  // One mind, two halves that cannot be made to agree.
  divided: ({ W, H }) => {
    const r = Math.min(H * 0.3, 26), cy = H * 0.5;
    return { bg: INK, node: <>
      <Path d={`M 49 ${cy - r} A ${r} ${r} 0 0 0 49 ${cy + r} Z`} fill={BONE} />
      <Path d={`M 51.4 ${cy - r + 7} A ${r} ${r} 0 0 1 51.4 ${cy + r + 7} Z`} fill={SAGE} opacity={0.9} />
      <Circle cx={50.2} cy={cy - r - 8} r={1.5} fill={OCHRE} />
    </> };
  },

  // One point in a great deal of empty field.
  lonely: ({ W, H, rnd, v }) => { const P = PAL[v % PAL.length]; const x = 22 + rnd() * 56, y = H * (0.3 + rnd() * 0.4); return { bg: P.bg, node: <>
    <Circle cx={W / 2} cy={H / 2} r={H * 0.46} fill="none" stroke={P.line} strokeWidth={0.3} opacity={0.3} />
    <Circle cx={x} cy={y} r={1.8} fill={P.form} />
  </> }; },
  // Many alike, one apart.
  crowd: ({ W, H, rnd, v }) => { const P = PAL[v % PAL.length]; const cols = 7, rows = Math.max(3, Math.floor(H / 15)), gx = W / (cols + 1), gy = H / (rows + 1), oc = Math.floor(rnd() * cols), or = Math.floor(rnd() * rows); return { bg: P.bg, node: <>
    {Array.from({ length: cols * rows }, (_, i) => { const c = i % cols, r = Math.floor(i / cols); if (c === oc && r === or) return null; return <Circle key={i} cx={gx * (c + 1)} cy={gy * (r + 1)} r={2.7} fill={P.soft} />; })}
    <Circle cx={gx * (oc + 1) + gx * 0.34} cy={gy * (or + 1) - gy * 0.28} r={3.1} fill={P.acc} />
  </> }; },
  // A circuit that returns, with one gap where it could be broken.
  loop: ({ W, H, v }) => { const P = PAL[v % PAL.length], r = Math.min(H * 0.3, 25), cx = 50, cy = H * 0.5, a0 = -0.5, a1 = 4.3, pt = (a: number): [number, number] => [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; return { bg: P.bg, node: <>
    <Path d={`M ${pt(a0)[0]} ${pt(a0)[1]} A ${r} ${r} 0 1 1 ${pt(a1)[0]} ${pt(a1)[1]}`} fill="none" stroke={P.form} strokeWidth={2.4} strokeLinecap="round" />
    <Circle cx={pt(a0)[0]} cy={pt(a0)[1]} r={2.6} fill={P.acc} />
    <Circle cx={cx} cy={cy} r={1.1} fill={P.soft} />
  </> }; },
  // A start and several ways on, none marked as right.
  paths: ({ W, H, rnd, v }) => { const P = PAL[v % PAL.length], y0 = H * 0.5; return { bg: P.bg, node: <>
    {[-0.36, -0.12, 0.14, 0.38].map((k, i) => <G key={i}><Path d={`M 14 ${y0} C 44 ${y0}, 52 ${y0 + k * H * 0.5}, 86 ${y0 + k * H * 0.9}`} fill="none" stroke={i === 2 ? P.form : P.soft} strokeWidth={i === 2 ? 1.6 : 1} strokeLinecap="round" /><Circle cx={86} cy={y0 + k * H * 0.9} r={2.2} fill={i === 2 ? P.acc : P.soft} /></G>)}
    <Circle cx={14} cy={y0} r={3} fill={P.form} />
  </> }; },
  // A lens that enlarges only what matches.
  lens: ({ W, H, rnd, v }) => { const P = PAL[v % PAL.length], cx = 36 + rnd() * 28, cy = H * 0.5, R = Math.min(H * 0.3, 24); return { bg: P.bg, node: <>
    {Array.from({ length: 28 }, (_, i) => { const x = 8 + ((i * 37) % 84), y = 8 + ((i * 53) % Math.max(10, H - 16)), inside = (x - cx) ** 2 + (y - cy) ** 2 < R * R; return <Rect key={i} x={x - (inside ? 2.6 : 1.1)} y={y - (inside ? 2.6 : 1.1)} width={inside ? 5.2 : 2.2} height={inside ? 5.2 : 2.2} fill={inside ? (i % 3 ? P.form : P.acc) : P.soft} opacity={inside ? 1 : 0.7} />; })}
    <Circle cx={cx} cy={cy} r={R} fill="none" stroke={P.line} strokeWidth={0.7} />
  </> }; },
  // A quality leaves one form and turns up in another.
  transfer: ({ W, H, v }) => { const P = PAL[v % PAL.length], y = H * 0.55; return { bg: P.bg, node: <>
    <Circle cx={24} cy={y} r={Math.min(H * 0.24, 20)} fill={P.form} />
    <Circle cx={76} cy={y} r={Math.min(H * 0.2, 17)} fill={P.soft} />
    {[0, 1, 2, 3].map(i => <Circle key={i} cx={36 + i * 8} cy={y - 14 + Math.sin(i * 0.9) * -4 + i * 0.6} r={1.2 + i * 0.5} fill={P.acc} />)}
    <Circle cx={76} cy={y} r={3.2} fill={P.acc} />
  </> }; },
  // What dazzled becomes the background: the light shrinks as the field grows.
  shrink: ({ W, H, v }) => { const P = PAL[v % PAL.length]; return { bg: P.bg, node: <>
    {[0, 1, 2, 3].map(i => <G key={i}><Rect x={6 + i * 23} y={H - H * (0.3 + i * 0.16)} width={20} height={H * (0.3 + i * 0.16)} fill={P.soft} opacity={0.55 + i * 0.1} /><Circle cx={16 + i * 23} cy={H * 0.3} r={9 - i * 2} fill={i === 0 ? P.acc : P.form} /></G>)}
  </> }; },
  // A structure with parts missing, and what is not known.
  incomplete: ({ W, H, v }) => { const P = PAL[v % PAL.length], x0 = 22, y0 = H * 0.2, w = 40, h = H * 0.6; return { bg: P.bg, node: <>
    <Path d={`M ${x0} ${y0 + h} L ${x0} ${y0} L ${x0 + w} ${y0}`} fill="none" stroke={P.form} strokeWidth={1.4} strokeLinecap="round" />
    <Path d={`M ${x0 + w} ${y0 + h} L ${x0 + w} ${y0 + h * 0.55}`} fill="none" stroke={P.form} strokeWidth={1.4} strokeLinecap="round" />
    <Path d={`M ${x0 + w + 10} ${y0 + h * 0.2} A 16 16 0 0 1 ${x0 + w + 26} ${y0 + h * 0.2 + 16}`} fill="none" stroke={P.soft} strokeWidth={1} strokeDasharray="1.4 1.6" />
    <Circle cx={x0} cy={y0 + h} r={2.6} fill={P.acc} />
  </> }; },
  // Two unlike things held level.
  balance: ({ W, H, v }) => { const P = PAL[v % PAL.length], py = H * 0.7; return { bg: P.bg, node: <>
    <Path d={`M 50 ${py} L 44 ${H * 0.92} L 56 ${H * 0.92} Z`} fill={P.form} />
    <Rect x={14} y={py - 1} width={72} height={1.4} fill={P.line} />
    <Circle cx={27} cy={py - 9} r={8} fill={P.soft} />
    <Circle cx={68} cy={py - 5} r={4} fill={P.acc} />
  </> }; },
  // What lies beneath, revealed in layers.
  layers: ({ W, H, v }) => { const P = PAL[v % PAL.length]; return { bg: P.bg, node: <>
    <Circle cx={56} cy={H * 0.56} r={Math.min(H * 0.14, 11)} fill={P.acc} />
    {[0, 1, 2].map(i => <Rect key={i} x={12 + i * 6} y={H * (0.18 + i * 0.07)} width={56} height={H * 0.5} fill={i === 2 ? P.form : P.soft} opacity={0.6 + i * 0.12} />)}
  </> }; },
  // A whole, broken along a line, and the parts slightly out of true.
  fracture: ({ W, H, v }) => { const P = PAL[v % PAL.length], s = Math.min(H * 0.52, 38), x = 50 - s / 2, y = H * 0.5 - s / 2; return { bg: P.bg, node: <>
    <Path d={`M ${x} ${y} L ${x + s} ${y} L ${x} ${y + s} Z`} fill={P.form} />
    <Path d={`M ${x + s + 2.4} ${y + 2.4} L ${x + s + 2.4} ${y + s + 2.4} L ${x + 2.4} ${y + s + 2.4} Z`} fill={P.soft} />
    <Circle cx={x + s * 0.58} cy={y + s * 0.5} r={1.5} fill={P.acc} />
  </> }; },
  // One small unit, repeated, becoming a structure.
  growth: ({ W, H, v }) => { const P = PAL[v % PAL.length], n = 7, u = Math.min(5.6, (H * 0.7) / n); return { bg: P.bg, node: <>
    {Array.from({ length: n }, (_, r) => Array.from({ length: n - r }, (_, c) => <Rect key={`${r}${c}`} x={50 - ((n - r) * (u + 0.8)) / 2 + c * (u + 0.8)} y={H * 0.86 - (r + 1) * (u + 0.8)} width={u} height={u} fill={r === n - 1 ? P.acc : r > 3 ? P.form : P.soft} />))}
  </> }; },
  // Marks that grow sparse.
  time: ({ W, H, v }) => { const P = PAL[v % PAL.length]; let x = 8; return { bg: P.bg, node: <>
    {Array.from({ length: 22 }, (_, i) => { const t = i / 21; x += 2.1 + t * t * 7; return x < 94 ? <Rect key={i} x={x} y={H * 0.5 - (1 - t) * H * 0.22} width={1.1} height={(1 - t * 0.7) * H * 0.44} fill={P.form} opacity={1 - t * 0.6} /> : null; })}
    <Circle cx={92} cy={H * 0.5} r={2.2} fill={P.acc} />
  </> }; },
  // The world as a horizon, and a light at its edge.
  horizon: ({ W, H, v }) => { const P = PAL[v % PAL.length]; return { bg: P.bg, node: <>
    <Circle cx={64} cy={H * 0.62} r={11} fill={P.acc} />
    <Path d={`M 0 ${H} L 0 ${H * 0.66} C 30 ${H * 0.56}, 60 ${H * 0.7}, 100 ${H * 0.6} L 100 ${H} Z`} fill={P.soft} opacity={0.8} />
    <Path d={`M 0 ${H} L 0 ${H * 0.8} C 40 ${H * 0.72}, 70 ${H * 0.86}, 100 ${H * 0.78} L 100 ${H} Z`} fill={P.form} />
  </> }; },
  // Alienation, pulled apart: one form split in two, and the small point that is left between them.
  alienation: ({ W, H }) => { const cy = H * 0.5, r = Math.min(21, H * 0.3); return { bg: MIST, still: true, node: <>
    <Path d={`M 41 ${cy - r} A ${r} ${r} 0 0 0 41 ${cy + r} Z`} fill={MOSS} />
    <Path d={`M 59 ${cy - r} A ${r} ${r} 0 0 1 59 ${cy + r} Z`} fill={INK} />
    <Circle cx={50} cy={cy} r={1.8} fill={OCHRE} />
  </> }; },
};

// Which scene a seed gets. Ideas, themes and threads that share a visual idea share a scene, each drawn with its own variation.
export const SCENE_OF: Record<string, string> = {
  'theme:Fear': 'fear', 'terror-management': 'fear', 'path-wanting': 'desire', 'theme:Desire': 'desire', 'wanting-liking': 'desire', 'mimetic-desire': 'desire',
  persona: 'identity', 'theme:Identity': 'identity', 'path-hidden-self': 'identity', 'narcissistic-injury': 'identity', 'performativity': 'identity', 'double-consciousness': 'identity',
  'theme:Status': 'status', 'status-local': 'status', 'graded-inequality': 'status', 'silver-medal': 'status', 'envy-proximity': 'status', 'power-paradox': 'status',
  'theme:Death': 'mortality', 'path-death': 'mortality', 'symmetry-argument': 'mortality', 'time-horizons': 'mortality', 'five-stages': 'mortality', 'the-absurd': 'mortality',
  interpreter: 'memory', 'narrative-identity': 'memory', 'memory-rebuilt': 'memory', 'theme:Time': 'memory',
  'theme:Freedom': 'freedom', 'path-freedom': 'freedom', capabilities: 'freedom', 'escape-from-freedom': 'freedom', 'dizziness-of-freedom': 'freedom', 'room-of-ones-own': 'freedom',
  'theme:Love': 'closeness', 'path-love': 'closeness', 'desire-distance': 'closeness', limerence: 'closeness', 'pursue-withdraw': 'closeness', amae: 'closeness',
  'theme:Power': 'power', 'path-power': 'power', 'disciplinary-power': 'power', 'agentic-state': 'power', 'banality-of-evil': 'power', 'burnout-society': 'power',
  'theme:Meaning': 'meaning', 'path-meaning': 'meaning', 'will-to-meaning': 'meaning', 'it-depends': 'meaning',
  alienation: 'alienation', 'self-deception': 'divided', 'bad-faith': 'divided', splitting: 'divided',
};

// ---- Diagrams: ideas that are better drawn than pictured. Typography, line and one accent. ----
type DiagramName = 'adaptation' | 'dissonance' | 'choice';
export const DIAGRAM_OF: Record<string, DiagramName> = {
  'focusing-illusion': 'adaptation', 'money-happiness': 'adaptation', 'wanting-liking': 'adaptation',
  'self-deception': 'dissonance', 'effort-justification': 'dissonance', 'spiritual-victory': 'dissonance',
  'dizziness-of-freedom': 'choice', 'bad-faith': 'choice', 'serious-man': 'choice',
};
const Label = ({ x, y, children, anchor = 'start', fill = INK, size = 3.4 }: { x: number; y: number; children: string; anchor?: 'start' | 'middle' | 'end'; fill?: string; size?: number }) => (
  <SvgText x={x} y={y} textAnchor={anchor} fontFamily="Figtree_500Medium" fontSize={size} letterSpacing={0.5} fill={fill}>{children}</SvgText>
);
export function Diagram({ name, width }: { name: DiagramName; width: number }) {
  const h = width * 0.6;
  return (
    <View style={{ width, height: h, borderRadius: 14, overflow: 'hidden', backgroundColor: '#ECE5D6' }}>
      <Svg width={width} height={h} viewBox="0 0 100 60">
        {name === 'adaptation' ? <>
          <Line x1={10} y1={8} x2={10} y2={50} stroke={INK} strokeWidth={0.4} />
          <Line x1={10} y1={50} x2={92} y2={50} stroke={INK} strokeWidth={0.4} />
          <Line x1={10} y1={38} x2={92} y2={38} stroke={STONE} strokeWidth={0.3} strokeDasharray="1.4 1.6" />
          <Path d="M 10 38 L 26 38 C 30 38, 31 14, 36 14 C 44 14, 46 36, 70 36 L 92 36" fill="none" stroke={MOSS} strokeWidth={1.2} strokeLinecap="round" />
          <Circle cx={36} cy={14} r={2} fill={OCHRE} />
          <Label x={40} y={13}>THE THING ARRIVES</Label>
          <Label x={92} y={46} anchor="end" fill={SAGE}>THE NEW NORMAL</Label>
          <Label x={10} y={56}>TIME</Label>
          <Label x={13} y={9}>HOW IT FEELS</Label>
        </> : name === 'dissonance' ? <>
          <Rect x={6} y={8} width={34} height={11} rx={5.5} fill={PALE_SAGE} />
          <Label x={23} y={15} anchor="middle">WHAT I BELIEVE</Label>
          <Rect x={60} y={41} width={34} height={11} rx={5.5} fill={PALE_OCHRE} />
          <Label x={77} y={48} anchor="middle">WHAT I DO</Label>
          <Path d="M 28 19 L 44 30" stroke={MOSS} strokeWidth={0.7} />
          <Path d="M 72 41 L 56 30" stroke={MOSS} strokeWidth={0.7} />
          <Circle cx={50} cy={30} r={4.4} fill={OCHRE} />
          <Label x={50} y={41.5} anchor="middle" fill={INK}>TENSION</Label>
          <Label x={50} y={57} anchor="middle" fill={SAGE}>SOMETHING HAS TO GIVE</Label>
        </> : <>
          <Label x={50} y={9} anchor="middle">POSSIBILITY</Label>
          {[22, 50, 78].map(x => <Line key={x} x1={50} y1={12} x2={x} y2={26} stroke={SAGE} strokeWidth={0.5} />)}
          {[22, 50, 78].map(x => <Circle key={x} cx={x} cy={27} r={1.7} fill={x === 50 ? OCHRE : SAGE} />)}
          {[22, 78].map(x => <Line key={x} x1={x} y1={29} x2={50} y2={38} stroke={STONE} strokeWidth={0.4} strokeDasharray="1 1.2" />)}
          <Line x1={50} y1={29} x2={50} y2={38} stroke={MOSS} strokeWidth={0.9} />
          <Label x={50} y={43} anchor="middle" fill={MOSS}>CHOICE</Label>
          <Line x1={50} y1={45} x2={50} y2={51} stroke={MOSS} strokeWidth={0.9} />
          <Label x={50} y={56.5} anchor="middle">RESPONSIBILITY</Label>
        </>}
      </Svg>
    </View>
  );
}

// ---- Pull-quote composition: one sentence set large on a colour field, with a small form pressed into the corner. ----
export function PullQuote({ text, width, seed = 0 }: { text: string; width: number; seed?: number }) {
  const field = [MOSS, INK, DEEP_OCHRE][seed % 3];
  const mark = [GOLD, OCHRE, GOLD][seed % 3];
  return (
    <View style={{ width, backgroundColor: field, paddingLeft: 28, paddingRight: 44, paddingVertical: 46, overflow: 'hidden' }}>
      <Svg width={width * 0.5} height={width * 0.25} viewBox="0 0 100 50" style={{ position: 'absolute', right: -6, top: -10 }}>
        <Circle cx={88} cy={14} r={20} fill={mark} opacity={0.2} />
        <Circle cx={88} cy={14} r={6} fill={mark} />
      </Svg>
      <T v="display" size={26} color={BONE} style={{ lineHeight: 33 }}>{text}</T>
    </View>
  );
}


/* A reading interlude: bone ground, one large sentence, one vermilion intervention. The page stops and says one thing. */
export function Interlude({ text, width }: { text: string; width: number }) {
  const t = text.trim();
  const cut = t.length > 150 ? t.slice(0, t.lastIndexOf(' ', 150)) + '…' : t;
  return (
    <View style={{ width, backgroundColor: '#F5F0E6', paddingHorizontal: 24, paddingVertical: 44, borderTopWidth: 1, borderBottomWidth: 1, borderColor: INK }}>
      <Svg width={46} height={20} viewBox="0 0 46 20" style={{ marginBottom: 20 }}>
        <Rect x={0} y={9} width={30} height={2} fill={INK} />
        <Rect x={30} y={0} width={4} height={20} fill={OCHRE} />
        <Rect x={34} y={9} width={12} height={2} fill={INK} opacity={0.25} />
      </Svg>
      <T v="display" size={28} color={INK} style={{ lineHeight: 35 }}>{cut}</T>
    </View>
  );
}

Object.assign(SCENE_OF, {"shadow": "cast", "projection": "beam", "persona": "masks", "narcissistic-injury": "crack", "shame-guilt": "hidden", "the-look": "watched", "wanting-liking": "twin", "mimetic-desire": "typo", "limerence": "orbit", "pursue-withdraw": "pursue", "intermittent-reinforcement": "slots", "effort-justification": "stairs", "dizziness-of-freedom": "vertigo", "bad-faith": "curtain", "serious-man": "rows", "escape-from-freedom": "cage", "underground-spite": "wedge", "the-absurd": "boulder", "das-man": "typo", "symmetry-argument": "symmetry", "ressentiment": "tilt", "envy-proximity": "envy", "status-local": "typo", "disciplinary-power": "panopticon", "banality-of-evil": "stamps", "learned-helplessness": "pressed", "social-pain": "outside", "narrative-identity": "story", "self-deception": "veil", "pendulum": "pendulum", "hard-problem": "gap", "constructed-emotion": "assemble", "readiness-potential": "ramp", "silver-medal": "podium", "power-paradox": "hollow", "spotlight-effect": "spot", "self-handicapping": "ankle", "moral-attention": "focus", "ethics-of-care": "cradle", "emotional-labor": "onoff", "amae": "lean", "burnout-society": "consume", "intimate-enemy": "tension", "imagined-communities": "imagined", "speaking-for": "voice", "double-consciousness": "double", "spiritual-victory": "cairn", "memory-rebuilt": "rebuild", "five-stages": "tide", "room-of-ones-own": "room", "cruel-optimism": "receding", "pure-experience": "merge", "it-depends": "branch", "mothering-reproduces": "nested", "matter-out-of-place": "misfit", "graded-inequality": "shrink", "time-horizons": "horizon"});
Object.assign(SCENES, SCENES2);
Object.assign(SCENE_OF, {"theme:Anger": "burst", "theme:Loneliness": "lonely", "theme:Suffering": "pressed", "theme:Ego": "masks", "theme:Relationships": "orbit", "theme:Sex": "merge", "theme:Money": "coins", "theme:Work": "rows", "theme:Shame": "hidden", "theme:Guilt": "tether", "theme:Envy": "envy", "theme:Ambition": "stairs", "theme:Failure": "boulder", "theme:Success": "podium", "theme:Consciousness": "gap", "theme:Reality": "veil", "theme:Aging": "horizon", "theme:Belonging": "double", "theme:Self": "nested"});
Object.assign(SCENES, SIG);
Object.assign(SCENE_OF, {"theme:Fear": "sigFear", "terror-management": "sigFear", "theme:Desire": "sigDesire", "desire-distance": "sigDesire", "theme:Identity": "sigIdentity", "theme:Love": "sigLove", "theme:Power": "sigPower", "agentic-state": "sigPower", "theme:Status": "sigStatus", "theme:Freedom": "sigFreedom", "dizziness-of-freedom": "sigFreedom", "theme:Death": "sigDeath", "time-horizons": "sigDeath", "theme:Time": "sigMemory", "memory-rebuilt": "sigMemory", "theme:Shame": "sigShame", "shame-guilt": "sigShame", "theme:Guilt": "sigGuilt", "theme:Envy": "sigEnvy", "envy-proximity": "sigEnvy", "theme:Loneliness": "sigLonely", "loneliness-loop": "sigLonely", "theme:Belonging": "sigBelong", "imagined-communities": "sigBelong", "theme:Meaning": "sigMeaning", "will-to-meaning": "sigMeaning", "readiness-potential": "sigDominos"});

import { View, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, G, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { byId } from '@/data';
import { SCENE_OF, SCENES } from './art';
import VIZ from '@/data/viz.json';

// LIMEN's illustration system. Flat, cut-paper forms in the LIMEN palette; one dominant field, one secondary tone, one tiny accent.
// Seven compositions: landscape, window, tension, overlap, trace, field, threshold. A concept's theme chooses the metaphor.
const WORD: Record<string, string> = { 'mimetic-desire': 'WANT', 'das-man': 'THEY', 'status-local': 'STATUS' };
type Scheme = { bg: string; shape: string; form: string; accent: string; ink: string };
const SCHEMES: Scheme[] = [
  { bg: '#DCE4F5', shape: '#DCE4F5', form: '#172C68', accent: '#E6533D', ink: '#171A1B' }, // bone, pale sage, moss
  { bg: '#F2C94C', shape: '#F5F0E6', form: '#171A1B', accent: '#E6533D', ink: '#171A1B' }, // gold field
  { bg: '#172C68', shape: '#2E4A9A', form: '#F5F0E6', accent: '#E6533D', ink: '#F5F0E6' }, // moss field
  { bg: '#AEBFE8', shape: '#E8EDF9', form: '#172C68', accent: '#E6533D', ink: '#171A1B' }, // sage field
  { bg: '#171A1B', shape: '#0F1E4A', form: '#3157D5', accent: '#E6533D', ink: '#F5F0E6' }, // ink
  { bg: '#E7E1D2', shape: '#F5F0E6', form: '#171A1B', accent: '#3157D5', ink: '#171A1B' }, // stone
  { bg: '#E6533D', shape: '#F5F0E6', form: '#171A1B', accent: '#F2C94C', ink: '#171A1B' }, // red field
];
type Kind = 'landscape' | 'window' | 'tension' | 'overlap' | 'trace' | 'field' | 'threshold' | 'mask' | 'shadow' | 'mirror' | 'split' | 'look' | 'spot' | 'apart' | 'echo' | 'steps' | 'grid' | 'coin' | 'path' | 'boulder' | 'pendulum' | 'bridge' | 'clock';
const KINDS: Kind[] = ['landscape', 'window', 'tension', 'overlap', 'trace', 'field', 'threshold'];
// Each idea, theme and thread gets the picture that fits it: a mask for persona, a shadow for the shadow, two forms kept apart for distance.
const TOPIC: Record<string, Kind> = {
  shadow: 'shadow', projection: 'mirror', persona: 'mask', 'narcissistic-injury': 'mirror', splitting: 'split', 'shame-guilt': 'look', 'the-look': 'look',
  'wanting-liking': 'apart', 'mimetic-desire': 'echo', 'desire-distance': 'apart', limerence: 'apart', 'pursue-withdraw': 'apart', 'intermittent-reinforcement': 'pendulum',
  'effort-justification': 'steps', 'terror-management': 'trace', 'dizziness-of-freedom': 'trace', 'bad-faith': 'mask', 'serious-man': 'steps', 'escape-from-freedom': 'trace',
  'underground-spite': 'boulder', 'the-absurd': 'boulder', 'das-man': 'grid', 'symmetry-argument': 'mirror', ressentiment: 'shadow', 'envy-proximity': 'steps', 'status-local': 'steps',
  'agentic-state': 'grid', 'disciplinary-power': 'grid', 'banality-of-evil': 'grid', 'learned-helplessness': 'trace', 'social-pain': 'apart', interpreter: 'path', 'narrative-identity': 'path',
  'self-deception': 'mirror', 'mature-defenses': 'threshold', 'repetition-compulsion': 'echo', pendulum: 'pendulum', 'will-to-meaning': 'path', 'hard-problem': 'bridge',
  'constructed-emotion': 'overlap', 'readiness-potential': 'clock', 'loneliness-loop': 'apart', alienation: 'coin', 'time-horizons': 'clock', 'silver-medal': 'steps',
  'focusing-illusion': 'spot', 'money-happiness': 'coin', 'power-paradox': 'steps', 'spotlight-effect': 'spot', 'self-handicapping': 'boulder',
  'theme:Fear': 'trace', 'theme:Shame': 'look', 'theme:Loneliness': 'apart', 'theme:Identity': 'mask', 'theme:Self': 'overlap', 'theme:Ego': 'mirror', 'theme:Love': 'apart', 'theme:Desire': 'echo',
  'theme:Power': 'grid', 'theme:Envy': 'steps', 'theme:Freedom': 'threshold', 'theme:Death': 'landscape', 'theme:Time': 'clock', 'theme:Aging': 'clock', 'theme:Meaning': 'path', 'theme:Status': 'steps',
  'theme:Belonging': 'window', 'theme:Relationships': 'apart', 'theme:Money': 'coin', 'theme:Work': 'grid', 'theme:Success': 'steps', 'theme:Failure': 'boulder', 'theme:Suffering': 'boulder',
  'theme:Anger': 'tension', 'theme:Guilt': 'shadow', 'theme:Ambition': 'steps', 'theme:Consciousness': 'bridge', 'theme:Reality': 'mirror', 'theme:Sex': 'tension',
  'path-wanting': 'echo', 'path-hidden-self': 'mask', 'path-love': 'apart', 'path-shame': 'look', 'path-freedom': 'threshold', 'path-death': 'landscape', 'path-power': 'grid',
  'path-own-mind': 'path', 'path-stuck': 'echo', 'path-meaning': 'path',
};

export function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
// Book covers and monograms: deep tones from the same family. [ground, light, text]
export const PALETTES: [string, string, string][] = [
  ['#172C68', '#E6533D', '#F5F0E6'], ['#171A1B', '#3157D5', '#F5F0E6'], ['#3157D5', '#F2C94C', '#F5F0E6'],
  ['#E6533D', '#171A1B', '#171A1B'], ['#2747B8', '#E6533D', '#F5F0E6'], ['#2A2D3A', '#9DB0E0', '#F5F0E6'],
];

// Matte, lit from the upper left: a little lighter where the light lands, a little deeper where it falls away.
function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16), f = (v: number) => Math.max(0, Math.min(255, Math.round(amt > 0 ? v + (255 - v) * amt : v * (1 + amt))));
  return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(f).map(v => v.toString(16).padStart(2, '0')).join('');
}
function Matte({ id, color }: { id: string; color: string }) {
  return <RadialGradient id={id} cx="0.32" cy="0.28" r="0.85"><Stop offset="0" stopColor={shade(color, 0.14)} /><Stop offset="1" stopColor={shade(color, -0.16)} /></RadialGradient>;
}

function rng(seed: number) { let s = seed || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
// An imperfect round form: a circle with a little wobble, so it reads as cut by hand.
function blob(cx: number, cy: number, r: number, wob: number, rnd: () => number) {
  const n = 8, pts: [number, number][] = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, k = r * (1 + (rnd() - 0.5) * wob); pts.push([cx + Math.cos(a) * k, cy + Math.sin(a) * k]); }
  const mid = (a: [number, number], b: [number, number]): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let d = `M ${mid(pts[n - 1], pts[0]).join(' ')}`;
  for (let i = 0; i < n; i++) { const m = mid(pts[i], pts[(i + 1) % n]); d += ` Q ${pts[i].join(' ')} ${m.join(' ')}`; }
  return d + ' Z';
}
function ridge(rnd: () => number, H: number, base: number, amp: number) {
  const steps = 5, pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) pts.push([(100 / steps) * i, base + (rnd() - 0.5) * 2 * amp]);
  let d = `M 0 ${H} L 0 ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], mx = (x0 + x1) / 2; d += ` C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`; }
  return d + ` L 100 ${H} Z`;
}
const arch = (x: number, y: number, w: number, h: number) => `M ${x} ${y + h} L ${x} ${y + w / 2} A ${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} L ${x + w} ${y + h} Z`;

export function Cover({ seed, size, radius = 16, style, wide, ratio, kind, scheme }: { scheme?: number; seed: string; size: number; radius?: number; style?: ViewStyle; wide?: boolean; ratio?: number; kind?: Kind }) {
  const h = hash(seed);
  const rnd = rng(h);
  const base = seed.replace(/:(pause|interlude)$/, '');
  const sceneName = kind ? undefined : SCENE_OF[base] ?? (VIZ as Record<string, string>)[base];
  const k: Kind = kind ?? TOPIC[base] ?? KINDS[h % KINDS.length];
  const S = SCHEMES[scheme ?? (h >>> 3) % SCHEMES.length];
  const rt = ratio ?? (wide ? 0.62 : 1);
  const W = 100, H = 100 * rt;
  const scene = sceneName && SCENES[sceneName] ? SCENES[sceneName]({ W, H, rnd, v: base.startsWith('b:') ? [2, 3, 4, 7, 8][(h >>> 5) % 5] : [1, 2, 3, 4, 6, 7, 8, 2, 3][(h >>> 5) % 9], word: WORD[base] }) : null;
  const flip = !scene?.still && rnd() > 0.5;
  // Items that share a scene still read differently: a palette per seed, and a different crop of the same composition.
  const zoom = scene && !scene.still && size >= 120 ? 1 + rnd() * 0.45 : 1;
  const zx = -(W * (zoom - 1)) * rnd(), zy = -(H * (zoom - 1)) * rnd();
  const j = (a: number, b: number) => a + rnd() * (b - a);
  const gF = `mf${S.form.slice(1)}`, gS = `ms${S.shape.slice(1)}`;
  const F = `url(#${gF})`, SH = `url(#${gS})`;
  // Large pictures get an atmosphere behind the subject: a wide soft form, a thin orbit, a far-off second body. Small ones stay clean.
  const rich = size >= 170;
  const ax = j(0, 100), ay = H * j(0.1, 0.9);
  const backdrop = rich ? <>
    <Circle cx={W - ax * 0.4} cy={H * 0.95} r={H * 0.62} fill={SH} opacity={0.28} />
    <Circle cx={ax * 0.5 + 20} cy={ay} r={H * 0.5} fill="none" stroke={S.ink} strokeWidth={0.3} opacity={0.22} />
    <Circle cx={ax * 0.5 + 20} cy={ay} r={H * 0.34} fill="none" stroke={S.ink} strokeWidth={0.3} opacity={0.14} />
    <Circle cx={W - ax * 0.6 - 6} cy={H * 0.14 + ay * 0.1} r={H * 0.05} fill={F} opacity={0.55} />
  </> : null;
  let art: React.ReactNode;

  if (k === 'landscape') {
    const sx = j(24, 70), sy = H * j(0.26, 0.4), sr = j(12, 17), hz = H * 0.6;
    art = <>
      <Path d={blob(sx, sy, sr * 1.9, 0.12, rnd)} fill={SH} />
      <Circle cx={sx} cy={sy} r={sr} fill={S.accent} />
      <Path d={ridge(rnd, H, hz, H * 0.07)} fill={SH} opacity={0.9} />
      <Path d={ridge(rnd, H, H * 0.76, H * 0.06)} fill={F} />
      <Rect x={0} y={H * 0.93} width={W} height={H * 0.07} fill={S.ink} opacity={0.25} />
    </>;
  } else if (k === 'trace') {
    const g = H * 0.78, cx = j(58, 72), cy = H * 0.4, R = Math.min(34, H * 0.4);
    art = <>
      <Path d={blob(cx, cy, R, 0.06, rnd)} fill={SH} />
      <Circle cx={cx} cy={cy} r={R * 1.22} fill="none" stroke={S.form} strokeWidth={0.5} opacity={0.7} />
      <Rect x={0} y={g} width={W} height={H - g} fill={F} />
      <Rect x={j(18, 30)} y={g - 13} width={3.6} height={13} rx={1.8} fill={S.ink} />
      <Circle cx={j(18, 30) + 1.8} cy={g - 15.4} r={2.2} fill={S.ink} />
      <Circle cx={cx + R * 0.7} cy={cy - R * 0.9} r={2.3} fill={S.accent} />
    </>;
  } else if (k === 'overlap') {
    const r = Math.min(30, H * 0.3);
    art = <>
      <Path d={blob(40, H * 0.5, r, 0.1, rnd)} fill={SH} />
      <Path d={blob(58, H * 0.54, r * 0.92, 0.1, rnd)} fill={F} opacity={0.88} />
      <Path d={blob(49, H * 0.52, r * 0.5, 0.14, rnd)} fill="none" stroke={S.ink} strokeWidth={0.5} opacity={0.6} />
      <Circle cx={j(72, 84)} cy={H * j(0.16, 0.26)} r={3.4} fill={S.accent} />
    </>;
  } else if (k === 'tension') {
    const r1 = Math.min(27, H * 0.28), y = H * 0.52;
    art = <>
      <Rect x={0} y={y + r1 * 0.9} width={W} height={0.5} fill={F} opacity={0.5} />
      <Path d={blob(30, y, r1, 0.08, rnd)} fill={SH} />
      <Path d={blob(30, y, r1 * 0.55, 0.12, rnd)} fill={F} opacity={0.9} />
      <Circle cx={80} cy={y} r={7.5} fill={S.ink} />
      <Circle cx={63} cy={y} r={1.8} fill={S.accent} />
    </>;
  } else if (k === 'field') {
    art = <>
      <Rect x={j(10, 20)} y={0} width={j(44, 54)} height={H * 0.8} fill={SH} />
      <Path d={blob(j(52, 64), H * 0.62, Math.min(20, H * 0.22), 0.1, rnd)} fill={F} />
      <Rect x={j(66, 78)} y={H * 0.12} width={j(10, 16)} height={j(10, 16)} fill={S.accent} />
      <Rect x={0} y={H * 0.9} width={W} height={0.6} fill={S.ink} opacity={0.4} />
    </>;
  } else if (k === 'threshold') {
    const w1 = 52, w2 = 24, top = H * 0.14;
    art = <>
      <Path d={arch(24, top, w1, H - top)} fill={SH} />
      <Path d={arch(38, top + H * 0.2, w2, H - top - H * 0.2)} fill={F} />
      <Circle cx={50} cy={H * 0.62} r={3.6} fill={S.accent} />
      <Rect x={0} y={H * 0.94} width={W} height={H * 0.06} fill={S.ink} opacity={0.3} />
    </>;
  } else if (k === 'mask') {
    const r = Math.min(H * 0.3, 26), cy = H * 0.5;
    art = <>
      <Path d={blob(58, cy - 2, r * 0.95, 0.06, rnd)} fill={SH} />
      <Path d={blob(46, cy + 1, r, 0.06, rnd)} fill={F} />
      <Rect x={46 - r * 0.55} y={cy - r * 0.15} width={r * 0.4} height={1.8} rx={0.9} fill={S.bg} />
      <Rect x={46 + r * 0.15} y={cy - r * 0.15} width={r * 0.4} height={1.8} rx={0.9} fill={S.bg} />
      <Circle cx={80} cy={H * 0.22} r={3} fill={S.accent} />
    </>;
  } else if (k === 'shadow') {
    const r = Math.min(H * 0.26, 22), g = H * 0.8;
    art = <>
      <Rect x={0} y={g} width={W} height={H - g} fill={SH} />
      <Path d={blob(30, g - r * 1.1, r, 0.05, rnd)} fill={F} />
      <Path d={`M 30 ${g} L ${30 + r * 5} ${g} L ${30 + r * 5} ${g + 2.6} L 30 ${g + 2.6} Z`} fill={S.ink} opacity={0.35} />
      <Circle cx={78} cy={H * 0.3} r={3.2} fill={S.accent} />
    </>;
  } else if (k === 'mirror') {
    const r = Math.min(H * 0.22, 20), y = H * 0.5;
    art = <>
      <Rect x={0} y={y} width={W} height={0.7} fill={S.ink} opacity={0.5} />
      <Path d={blob(48, y - r * 1.15, r, 0.05, rnd)} fill={F} />
      <Path d={blob(53, y + r * 1.15, r, 0.18, rnd)} fill={SH} />
      <Circle cx={82} cy={y - r * 1.4} r={2.8} fill={S.accent} />
    </>;
  } else if (k === 'split') {
    const r = Math.min(H * 0.3, 26), cy = H * 0.5;
    art = <>
      <Path d={`M 47 ${cy - r} A ${r} ${r} 0 0 0 47 ${cy + r} Z`} fill={F} />
      <Path d={`M 53 ${cy - r + 4} A ${r} ${r} 0 0 1 53 ${cy + r + 4} Z`} fill={SH} />
      <Circle cx={50} cy={cy - r - 6} r={2.4} fill={S.accent} />
    </>;
  } else if (k === 'look') {
    const r = Math.min(H * 0.26, 22), cy = H * 0.5;
    art = <>
      <Path d={`M 14 ${cy} Q 50 ${cy - r * 1.7} 86 ${cy} Q 50 ${cy + r * 1.7} 14 ${cy} Z`} fill={SH} />
      <Circle cx={56} cy={cy} r={r * 0.62} fill={F} />
      <Circle cx={58} cy={cy} r={r * 0.24} fill={S.ink} />
      <Circle cx={80} cy={H * 0.18} r={2.6} fill={S.accent} />
    </>;
  } else if (k === 'spot') {
    art = <>
      <Path d={`M 44 0 L 56 0 L 84 ${H} L 16 ${H} Z`} fill={SH} opacity={0.85} />
      <Circle cx={50} cy={H * 0.72} r={Math.max(3, H * 0.05)} fill={S.ink} />
      <Rect x={0} y={H * 0.94} width={W} height={H * 0.06} fill={F} />
      <Circle cx={20} cy={H * 0.2} r={2.6} fill={S.accent} />
    </>;
  } else if (k === 'apart') {
    const r = Math.min(H * 0.26, 22), cy = H * 0.5;
    art = <>
      <Path d={blob(22, cy, r, 0.06, rnd)} fill={F} />
      <Path d={blob(80, cy, r * 0.85, 0.08, rnd)} fill={SH} />
      {[0, 1, 2, 3, 4].map(i => <Circle key={i} cx={42 + i * 5.6} cy={cy} r={0.9} fill={S.ink} opacity={0.5} />)}
      <Circle cx={52} cy={cy - r * 0.9} r={2.6} fill={S.accent} />
    </>;
  } else if (k === 'echo') {
    const r = Math.min(H * 0.26, 20), cy = H * 0.5;
    art = <>
      {[0, 1, 2, 3].map(i => <Path key={i} d={blob(20 + i * 22, cy, r * (1 - i * 0.16), 0.06, rnd)} fill={i ? S.shape : S.form} opacity={1 - i * 0.2} />)}
      <Circle cx={92} cy={H * 0.2} r={2.6} fill={S.accent} />
    </>;
  } else if (k === 'steps') {
    const n = 4, bw = 17, x0 = 14;
    art = <>
      {Array.from({ length: n }, (_, i) => <Rect key={i} x={x0 + i * bw} y={H * (0.78 - i * 0.17)} width={bw} height={H * (0.22 + i * 0.17)} fill={i === n - 1 ? S.form : S.shape} />)}
      <Circle cx={x0 + (n - 2) * bw + bw / 2} cy={H * (0.78 - (n - 2) * 0.17) - 4} r={3} fill={S.accent} />
      <Rect x={0} y={H * 0.96} width={W} height={H * 0.04} fill={S.ink} opacity={0.25} />
    </>;
  } else if (k === 'grid') {
    const cols = 7, rows = Math.max(2, Math.floor((H - 14) / 13)), gx = 100 / (cols + 1), gy = H / (rows + 1);
    art = <>
      {Array.from({ length: rows * cols }, (_, i) => { const c = i % cols, r = Math.floor(i / cols), odd = r === Math.floor(rows / 2) && c === 4; return <Rect key={i} x={gx * (c + 1) - 3 + (odd ? 5 : 0)} y={gy * (r + 1) - 3 - (odd ? 3 : 0)} width={6} height={6} fill={odd ? S.accent : S.form} opacity={odd ? 1 : 0.85} />; })}
    </>;
  } else if (k === 'coin') {
    const r = Math.min(H * 0.36, 30);
    art = <>
      <Circle cx={66} cy={H * 0.5} r={r} fill={S.accent} />
      <Circle cx={66} cy={H * 0.5} r={r * 0.68} fill="none" stroke={S.ink} strokeWidth={0.6} opacity={0.5} />
      <Path d={blob(26, H * 0.62, r * 0.55, 0.08, rnd)} fill={F} />
      <Rect x={0} y={H * 0.92} width={W} height={H * 0.08} fill={SH} />
    </>;
  } else if (k === 'path') {
    art = <>
      <Path d={blob(70, H * 0.4, Math.min(H * 0.34, 28), 0.1, rnd)} fill={SH} />
      <Path d={`M 6 ${H * 0.8} C 26 ${H * 0.8}, 24 ${H * 0.3}, 44 ${H * 0.4} S 62 ${H * 0.85}, 80 ${H * 0.55} S 92 ${H * 0.3}, 94 ${H * 0.28}`} fill="none" stroke={S.form} strokeWidth={2.2} strokeLinecap="round" />
      <Circle cx={94} cy={H * 0.28} r={3.4} fill={S.accent} />
    </>;
  } else if (k === 'boulder') {
    const sl = (x: number) => H * 0.92 - (x / 100) * H * 0.55, r = Math.min(H * 0.17, 14);
    art = <>
      <Path d={`M 0 ${H} L 0 ${sl(0)} L 100 ${sl(100)} L 100 ${H} Z`} fill={F} />
      <Circle cx={58} cy={sl(58) - r * 1.05} r={r} fill={SH} />
      <Circle cx={88} cy={H * 0.18} r={3} fill={S.accent} />
    </>;
  } else if (k === 'pendulum') {
    const r = Math.min(H * 0.1, 8), bx = 72, by = H * 0.78;
    art = <>
      <Path d={blob(28, by - 2, r, 0.06, rnd)} fill={SH} opacity={0.6} />
      <Path d={`M 50 0 L ${bx} ${by - r}`} stroke={S.ink} strokeWidth={0.7} />
      <Path d={blob(bx, by, r, 0.06, rnd)} fill={F} />
      <Circle cx={50} cy={2} r={2.4} fill={S.accent} />
    </>;
  } else if (k === 'bridge') {
    const r = Math.min(H * 0.2, 17), cy = H * 0.55;
    art = <>
      <Path d={blob(20, cy, r, 0.06, rnd)} fill={F} />
      <Rect x={82 - r} y={cy - r} width={r * 2} height={r * 2} fill={SH} />
      <Rect x={20 + r} y={cy - 0.8} width={30} height={1.6} fill={S.ink} />
      <Circle cx={20 + r + 33} cy={cy} r={2.6} fill={S.accent} />
    </>;
  } else if (k === 'clock') {
    const r = Math.min(H * 0.3, 26), cx = 50, cy = H * 0.5;
    art = <>
      <Circle cx={cx} cy={cy} r={r} fill={SH} />
      <Path d={`M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx + r * 0.87} ${cy + r * 0.5} Z`} fill={F} />
      <Circle cx={cx} cy={cy} r={1.6} fill={S.ink} />
      <Circle cx={cx + r * 1.35} cy={cy - r * 0.9} r={2.8} fill={S.accent} />
    </>;
  } else {
    const wy = H * 0.14, wh = H * 0.56;
    art = <>
      <Rect x={22} y={wy} width={40} height={wh} fill={S.accent} opacity={0.9} />
      <Rect x={22} y={wy} width={40} height={wh} fill="none" stroke={S.form} strokeWidth={2} />
      <Rect x={41} y={wy} width={2} height={wh} fill={F} />
      <Rect x={0} y={wy + wh} width={W} height={H - wy - wh} fill={F} />
      <Path d={`M 22 ${wy + wh} L 62 ${wy + wh} L 88 ${H} L 40 ${H} Z`} fill={S.accent} opacity={0.35} />
    </>;
  }
  // A little grain, so it reads as printed rather than rendered.
  const grain = Array.from({ length: 46 }, (_, i) => <Circle key={i} cx={rnd() * W} cy={rnd() * H} r={0.2 + rnd() * 0.25} fill={i % 3 ? S.ink : '#F5F0E6'} opacity={0.07} />);

  const bg = scene?.bg ?? S.bg;
  return (
    <View style={[{ width: size, height: size * rt, borderRadius: radius, overflow: 'hidden', backgroundColor: bg }, style]}>
      <Svg width={size} height={size * rt} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
        <Defs><Matte id={gF} color={S.form} /><Matte id={gS} color={S.shape} /></Defs>
        <Rect x={0} y={0} width={W} height={H} fill={bg} />
        <G transform={`translate(${zx} ${zy}) scale(${zoom})`}><G transform={flip ? `translate(${W} 0) scale(-1 1)` : undefined}>{scene ? scene.node : <>{backdrop}{art}</>}</G></G>
        {grain}
      </Svg>
    </View>
  );
}

// One colour per kind of thinker, so a glance says what they are: philosophers cobalt, psychologists ultramarine, analysts and clinicians vermilion,
// social and cultural thinkers ink, brain and life scientists gold, writers sand. [ground, mark, text, name]
export function fieldTone(f: string): [string, string, string, string] {
  const s = f.toLowerCase();
  if (/psychoanal|psychiatr|psychotherap|paediatr/.test(s)) return ['#E6533D', '#F5F0E6', '#171A1B', 'Analyst'];
  if (/neuro|biolog|epidemiolog/.test(s)) return ['#F2C94C', '#171A1B', '#171A1B', 'Scientist'];
  if (/poet|novel|writer|essay/.test(s)) return ['#D9C7A7', '#3157D5', '#171A1B', 'Writer'];
  if (/sociolog|anthropolog|historian|theorist|cultural|political/.test(s)) return ['#171A1B', '#F2C94C', '#F5F0E6', 'Social thinker'];
  if (/psycholog/.test(s)) return ['#172C68', '#E6533D', '#F5F0E6', 'Psychologist'];
  return ['#3157D5', '#F2C94C', '#F5F0E6', 'Philosopher'];
}

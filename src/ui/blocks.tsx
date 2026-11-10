import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ScrollView, Share, View, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G, Line, Text as SvgText } from 'react-native-svg';

import { COBALT } from './art';
import { bookById, byId, depthOf, discOf, START_SHELF, minutesOf, neighbors, quotesIn, type Quote, tagOf, THINKERS, themeCount, year, type Book, type Concept, type Path } from '@/data';
import { useNotebook } from '@/lib/notebook';
import { useTrail } from '@/lib/trail';
import { Card } from './card';
import { Cover, fieldTone, hash, PALETTES } from './cover';
import { ThresholdTick, BackButton, Icon, Meta, Press, Rule, StatusTag, T, KeepIcon } from './kit';
import { elevation, font, READ_MAX, shape, space, useAppWidth, useTheme } from './theme';

export const openConcept = (id: string, path?: string) => router.push({ pathname: '/concept/[id]', params: path ? { id, path } : { id } });
export const openNotes = (id: string) => router.push({ pathname: '/notes/[id]', params: { id } });
export const openBook = (id: string) => router.push({ pathname: '/book/[id]', params: { id } });
export const openThinker = (id: string) => router.push({ pathname: '/thinker/[id]', params: { id } });
export const openTheme = (name: string) => router.push({ pathname: '/theme/[name]', params: { name } });
export const openStand = (key: string) => router.push({ pathname: '/stand/[key]', params: { key } });
export const openPath = (id: string) => router.push({ pathname: '/path/[id]', params: { id } });
export const searchFor = (q: string) => router.navigate({ pathname: '/search', params: { q } });

export const MIN_PER_IDEA = 2;

/* Page scaffold. Tab roots get a large title; pushed pages get a floating back button. */
export function Screen({ title, sub, back, right, children, bottom = 110, pinned, onEnd, scrollRef, ...rest }: ScrollViewProps & { scrollRef?: React.RefObject<ScrollView | null>; title?: string; sub?: string; back?: boolean; right?: ReactNode; children: ReactNode; bottom?: number; pinned?: ReactNode; onEnd?: () => void }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {pinned ? (
        <View style={{ paddingTop: insets.top + 64, backgroundColor: c.bg, zIndex: 2 }}>
          <View style={{ width: '100%', maxWidth: READ_MAX, alignSelf: 'center' }}>
            {title ? <T v="display" size={28} accessibilityRole="header" style={{ paddingHorizontal: 20, marginBottom: 12 }}>{title}</T> : null}
            {pinned}
          </View>
        </View>
      ) : null}
      <ScrollView ref={scrollRef} contentInsetAdjustmentBehavior="never" keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
        scrollEventThrottle={64} onScroll={onEnd ? e => { const m = e.nativeEvent; if (m.contentOffset.y + m.layoutMeasurement.height > m.contentSize.height - 600) onEnd(); } : undefined}
        contentContainerStyle={{ paddingTop: pinned ? 16 : insets.top + (back ? 70 : 14), paddingBottom: insets.bottom + bottom }} {...rest}>
        <View style={{ width: '100%', maxWidth: READ_MAX, alignSelf: 'center' }}>
          {title && !pinned ? (
            <View style={{ paddingHorizontal: 20, marginBottom: sub ? 20 : 14, gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <T v="display" size={30} accessibilityRole="header" style={{ flex: 1 }}>{title}</T>
                {right}
              </View>
              {sub ? <T v="dek" size={16}>{sub}</T> : null}
            </View>
          ) : null}
          {children}
        </View>
      </ScrollView>
      {back ? <BackButton /> : null}
    </View>
  );
}

export function SeeAll({ label, onPress }: { label: string; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Press onPress={onPress} accessibilityRole="link" style={{ marginHorizontal: 20, marginTop: 6, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <T v="uiStrong" size={15} color={c.accent}>{label}</T>
      <Icon name="arrow-right" tone="accent" />
    </Press>
  );
}

/* One row pattern for everything: tag line, title, a line of text, and a small picture on the right. */
export function ListRow({ tag, title, note, seed, onPress, first, label }: { tag?: ReactNode; title: string; note?: string; seed: string; onPress: () => void; first?: boolean; label?: string }) {
  const { c } = useTheme();
  return (
    <>
      {first ? null : <Rule />}
      <Press onPress={onPress} accessibilityRole="link" accessibilityLabel={label ?? title} style={{ paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', gap: 16, alignItems: 'center' }}>
        <View style={{ flex: 1, gap: 4 }}>
          {tag}
          <T v="title" size={17}>{title}</T>
          {note ? <T v="caption" size={14.5} color={c.ink2} numberOfLines={2}>{note}</T> : null}
        </View>
        <Cover seed={seed} size={68} radius={shape.sm} />
      </Press>
    </>
  );
}

export function ConceptRow({ c, first, note, path }: { c: Concept; first?: boolean; note?: string; meta?: 'status' | 'none'; path?: string }) {
  const nb = useNotebook();
  const c0 = useTheme().c;
  const done = !!nb.flags['x:' + c.id];
  return <ListRow first={first} seed={c.id} tag={<Meta tone={done ? c0.sageInk : undefined} extra={`${done ? 'Explored · ' : ''}${discOf(c)} · ${depthOf(c)} · ${minutesOf(c)} min`} />} title={c.t} note={note ?? c.dek} label={`${c.t}. ${c.dek}`} onPress={() => openConcept(c.id, path)} />;
}

/* Section header with an optional "See all". */
export function Section({ title, action, onAction, children }: { title: string; action?: string; onAction?: () => void; children: ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ marginTop: 34 }}>
      <View style={{ paddingHorizontal: 20, marginBottom: 14, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <T v="title" size={20}>{title}</T>
        {action ? <Press onPress={onAction} hitSlop={10}><T v="uiStrong" size={14.5} color={c.accent}>{action}</T></Press> : null}
      </View>
      {children}
    </View>
  );
}

/* Visual card: a generous picture, a small metadata pill resting on its edge, then the title and a line. For carousels. */
export function VisualCard({ seed, pill, kicker, title, line, width, ratio = 0.78, onPress, label }: { seed: string; pill?: string; kicker?: string; title: string; line?: string; width: number; ratio?: number; onPress: () => void; label: string }) {
  const { c } = useTheme();
  return (
    <Card variant="content" pad={0} radius={shape.md} onPress={onPress} accessibilityRole="link" accessibilityLabel={label} style={{ width, backgroundColor: c.bg, borderWidth: 1, borderColor: '#17191C33', overflow: 'hidden', shadowOpacity: 0 }}>
      <View>
        <Cover seed={seed} size={width} ratio={ratio} radius={0} />
        <ThresholdTick style={{ right: space.lg, bottom: -11 }} />
      </View>
      <View style={{ padding: space.lg, paddingTop: space.lg, gap: 4 }}>
        {pill || kicker ? <T v="label" size={11.5}>{(pill ?? kicker ?? '').toUpperCase()}</T> : null}
        <T v="title" size={18} numberOfLines={2} style={{ lineHeight: 23 }}>{title}</T>
        {line ? <T v="caption" size={14} numberOfLines={2} style={{ lineHeight: 20 }}>{line}</T> : null}
      </View>
    </Card>
  );
}

/* Writer for carousels: round monogram and name. */
export function WriterChip({ k, width = 84 }: { k: string; width?: number }) {
  return (
    <Press onPress={() => openThinker(k)} accessibilityRole="link" accessibilityLabel={THINKERS[k].n} style={{ width, alignItems: 'center', gap: 8 }}>
      <Monogram k={k} size={72} />
      <T v="uiStrong" size={13.5} numberOfLines={2} style={{ textAlign: 'center' }}>{THINKERS[k].n.replace(/\(.*\)/, '').trim()}</T>
    </Press>
  );
}

/* Book cover: the book's own picture (drawn from its thesis) above its title, on a colour taken from the book. Small covers are the picture alone; the row beside them carries the title. */
export function BookCover({ b, width = 120, onPress }: { b: Book; width?: number; onPress?: () => void }) {
  const [bg, , ink] = PALETTES[hash(b.id) % PALETTES.length];
  const small = width < 90;
  return (
    <Press onPress={onPress ?? (() => openBook(b.id))} accessibilityRole="link" accessibilityLabel={`${b.t} by ${b.a}`} pointerEvents={small && !onPress ? "none" : "auto"}
      style={{ width, aspectRatio: 0.68, backgroundColor: bg, borderTopLeftRadius: 3, borderBottomLeftRadius: 3, borderTopRightRadius: small ? 6 : shape.sm, borderBottomRightRadius: small ? 6 : shape.sm, overflow: 'hidden', ...elevation.subtle }}>
      <View style={{ flex: small ? 1 : 0.62 }}><Cover seed={`b:${b.id}`} size={width} ratio={small ? 1.47 : 0.66} radius={0} style={{ width: '100%', height: '100%' }} /></View>
      {small ? null : (
        <View style={{ flex: 0.38, padding: 10, justifyContent: 'space-between' }}>
          <T v="title" size={width > 130 ? 15 : 13} color={ink} numberOfLines={3}>{b.t}</T>
          <T v="label" color="rgba(255,255,255,.8)" size={10.5} numberOfLines={1}>{b.a}</T>
        </View>
      )}
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: 'rgba(23,26,27,.16)' }} />
    </Press>
  );
}

export function BookRow({ b, first }: { b: Book; first?: boolean }) {
  const { c } = useTheme();
  const nb = useNotebook();
  return (
    <>
      {first ? null : <Rule />}
      <Press onPress={() => openBook(b.id)} accessibilityRole="link" style={{ paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
        <View style={{ width: 62, alignItems: 'center' }}><BookCover b={b} width={58} /></View>
        <View style={{ flex: 1, gap: 3 }}>
          <T v="title" size={16.5}>{b.t}</T>
          <T v="caption" size={13.5}>{b.a} · {year(b.y)}</T>
          <T v="body" size={14.5} color={c.ink2} numberOfLines={2} style={{ lineHeight: 21 }}>{b.thesis}</T>
          <T v="caption" size={12.5}>{[b.c.length ? `${b.c.length} idea${b.c.length > 1 ? 's' : ''}` : '', quotesIn(b.id).length ? `${quotesIn(b.id).length} passage${quotesIn(b.id).length > 1 ? 's' : ''}` : '', nb.flags['b:' + b.id] ? 'Started' : '', START_SHELF.includes(b.id) ? 'Begin here' : ''].filter(Boolean).join(' · ')}</T>
        </View>
      </Press>
    </>
  );
}

/* Thinker monogram: initials on a colour drawn from the name. */
export function Monogram({ k, size = 44 }: { k: string; size?: number }) {
  const [bg, , ink] = fieldTone(THINKERS[k].f);
  const parts = THINKERS[k].n.replace(/\(.*\)/, '').split(' ').filter(Boolean);
  const ini = (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <T v="uiStrong" size={size * 0.36} color={ink}>{ini}</T>
    </View>
  );
}

export function ThinkerRow({ k, first, sub }: { k: string; first?: boolean; sub?: string }) {
  const { c } = useTheme();
  const t = THINKERS[k];
  return (
    <>
      {first ? null : <Rule />}
      <Press onPress={() => openThinker(k)} accessibilityRole="link" style={{ paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', gap: 16, alignItems: 'center' }}>
        <Monogram k={k} />
        <View style={{ flex: 1, gap: 2 }}>
          <T v="title" size={16.5}>{t.n}</T>
          <T v="caption" size={13.5} numberOfLines={1}>{sub ?? tagOf(k)}</T>
        </View>
      </Press>
    </>
  );
}

/* Path card: the clearest way in. */
export function PathCard({ p, width, read }: { p: Path; width: number; read: string[] }) {
  const { c } = useTheme();
  const done = p.c.filter(x => read.includes(x)).length;
  return (
    <Press onPress={() => openPath(p.id)} accessibilityRole="link" accessibilityLabel={`${p.t}. ${p.c.length} ideas.`} style={{ width, gap: 10, padding: 18, borderRadius: shape.lg, backgroundColor: c.surface }}>
      <View style={{ gap: 3 }}>
        <T v="title" size={17}>{p.t}</T>
        <T v="caption" numberOfLines={2}>{p.line}</T>
        <T v="label" style={{ marginTop: 4 }}>{done ? `${done} of ${p.c.length} read` : `${p.c.length} ideas · ${p.c.length * MIN_PER_IDEA} min`}</T>
      </View>
      {done ? <View style={{ height: 3, borderRadius: 2, backgroundColor: c.surfaceHigh }}><View style={{ width: `${(done / p.c.length) * 100}%`, height: 3, borderRadius: 2, backgroundColor: c.accent }} /></View> : null}
    </Press>
  );
}

export function ThemeTile({ t, width }: { t: string; width: number }) {
  const { c } = useTheme();
  return (
    <Press onPress={() => openTheme(t)} accessibilityRole="link" accessibilityLabel={`${t}, ${themeCount(t)} ideas`}
      style={{ width, height: 76, borderRadius: shape.md, backgroundColor: c.surface, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ flex: 1 }}>
        <T v="uiStrong" size={16}>{t}</T>
        <T v="caption" size={12.5}>{themeCount(t)} ideas</T>
      </View>
    </Press>
  );
}

/* The idea's neighbourhood, tappable. */
export function Constellation({ c }: { c: Concept }) {
  const { c: col } = useTheme();
  const width = useAppWidth();
  const W = 360, H = 290, cx = W / 2, cy = H / 2, R = 108;
  const nb = neighbors(c.id).slice(0, 8);
  const pos: Record<string, [number, number]> = { [c.id]: [cx, cy] };
  nb.forEach((id, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / nb.length; pos[id] = [cx + R * 0.78 * Math.cos(a), cy + R * Math.sin(a)]; });
  const short = (s: string) => (s.length > 17 ? `${s.slice(0, 15)}…` : s);
  const cross: [string, string][] = [];
  nb.forEach((a, i) => nb.slice(i + 1).forEach(b => { if (byId[a].rel.some(r => r[0] === b) || byId[b].rel.some(r => r[0] === a)) cross.push([a, b]); }));
  const w = width - 40;
  return (
    <Svg width={w} height={(w * H) / W} viewBox={`0 0 ${W} ${H}`} accessibilityLabel={`Ideas connected to ${c.t}`}>
      {nb.map(id => <Line key={id} x1={cx} y1={cy} x2={pos[id][0]} y2={pos[id][1]} stroke={col.rule} strokeWidth={1} />)}
      {cross.map(([a, b]) => <Line key={a + b} x1={pos[a][0]} y1={pos[a][1]} x2={pos[b][0]} y2={pos[b][1]} stroke={col.rule} strokeWidth={1} strokeDasharray="2 3" />)}
      {nb.map(id => {
        const [x, y] = pos[id]; const left = x < cx - 8, right = x > cx + 8;
        return (
          <G key={id} onPress={() => openConcept(id)}>
            <Circle cx={x} cy={y} r={16} fill="transparent" />
            <Circle cx={x} cy={y} r={4.5} fill={col.bg} stroke={col.ink2} strokeWidth={1} />
            <SvgText x={left ? x - 9 : right ? x + 9 : x} y={left || right ? y + 4 : y < cy ? y - 11 : y + 19} fontSize={12} fontFamily={font.regular} fill={col.ink2} textAnchor={left ? 'end' : right ? 'start' : 'middle'}>{short(byId[id].t)}</SvgText>
          </G>
        );
      })}
      <Circle cx={cx} cy={cy} r={7} fill={col.accent} />
      <SvgText x={cx} y={cy + 22} fontSize={12.5} fontFamily={font.semibold} fill={col.ink} textAnchor="middle">{short(c.t)}</SvgText>
    </Svg>
  );
}

export function TensionBlock({ sides, note }: { sides: [string, string][]; note?: string }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: 24 }}>
      {sides.map(([who, view]) => (
        <View key={who} style={{ gap: 6 }}>
          <T v="label" color={c.ink2}>{who}</T>
          <T v="body" size={18} style={{ lineHeight: 28 }}>{view}</T>
        </View>
      ))}
      {note ? <T v="dek" size={17} style={{ marginTop: 2 }}>{note}</T> : null}
    </View>
  );
}

export function ListLink({ label, sub, onPress }: { label: string; sub?: string; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Press onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
      <View style={{ flex: 1, gap: 2 }}>
        <T v="uiStrong" size={16}>{label}</T>
        {sub ? <T v="caption">{sub}</T> : null}
      </View>
    </Press>
  );
}

export function Empty({ title, body, action, onAction }: { title: string; body: string; action?: string; onAction?: () => void }) {
  const { c } = useTheme();
  return (
    <View style={{ marginHorizontal: 20, paddingVertical: 8, gap: 6 }}>
      <Cover seed={`empty:${title}`} kind="field" size={96} ratio={0.6} radius={10} style={{ marginBottom: 8 }} />
      <T v="title" size={17}>{title}</T>
      <T v="caption" size={15}>{body}</T>
      {action ? <Press onPress={onAction} hitSlop={8} style={{ marginTop: 10, alignSelf: 'flex-start' }}><T v="uiStrong" size={15} color={c.accent}>{action}</T></Press> : null}
    </View>
  );
}

// A passage, set quietly. Curated ones open a note and lead to an idea; the rest lead to their writer or book.
export function Passage({ q, here, flat, onDark }: { q: Quote; here?: string; flat?: boolean; onDark?: boolean }) {
  const { c: base } = useTheme();
  const c = onDark ? { ...base, ink: '#F5F0E6', ink2: '#DCE4F5', ink3: '#B9C6E8', accent: '#F5F0E6', ochre: '#F2C94C', stone: '#7F94D6' } : base;
  const nb = useNotebook();
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);
  const to = q.c?.find(x => x !== here && byId[x]);
  const kept = !!nb.passages?.[q.id];
  const long = q.q.length > 360;
  const next = q.n ? null : q.b && bookById[q.b] ? { label: `From ${bookById[q.b].t} →`, go: () => openBook(q.b!) } : q.k && THINKERS[q.k] ? { label: `Meet ${THINKERS[q.k].n} →`, go: () => openThinker(q.k!) } : null;
  return (
    <View style={{ paddingHorizontal: flat ? 0 : 20, gap: 12 }}>
      <View style={{ flexDirection: 'row', gap: 14 }}>
        <View style={{ width: 2, borderRadius: 1, backgroundColor: q.n ? c.ochre : c.stone }} />
        <View style={{ flex: 1, gap: 8 }}>
          <T v="bodyLg" size={q.n ? 19 : 17.5} color={c.ink} numberOfLines={long && !more ? 7 : undefined} style={{ lineHeight: q.n ? 29 : 27, fontFamily: font.medium }}>{q.q}</T>
          {long ? <Press onPress={() => setMore(!more)} hitSlop={8}><T v="ui" size={13.5} color={c.ink3}>{more ? 'Less' : 'Read on'}</T></Press> : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {flat ? null : <Cover seed={`q:${q.id}`} size={26} ratio={1} radius={shape.sm} scheme={0} />}
            <T v="caption" size={13.5} color={c.ink3} style={{ flex: 1 }}>{q.a}{q.s ? ` · ${q.s}` : ''}</T>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 16 }}>
        {q.n ? (
          <Press onPress={() => setOpen(!open)} hitSlop={8} accessibilityRole="button" style={{ paddingVertical: 6 }}>
            <T v="uiStrong" size={14.5} color={c.accent}>{open ? 'Hide' : 'Why it stays with you'}</T>
          </Press>
        ) : next ? (
          <Press onPress={next.go} hitSlop={8} accessibilityRole="link" style={{ paddingVertical: 6, flex: 1 }}>
            <T v="uiStrong" size={14.5} color={c.accent} numberOfLines={1}>{next.label}</T>
          </Press>
        ) : <View />}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
          <Press onPress={() => { Share.share({ message: `“${q.q}” — ${q.a}${q.s ? `, ${q.s}` : ''}` }).catch(() => {}); }} hitSlop={10} accessibilityRole="button"><T v="ui" size={13.5} color={c.ink3}>Share</T></Press>
        <Press onPress={() => nb.togglePassage(q.id)} hitSlop={12} accessibilityRole="button" accessibilityLabel={kept ? 'Remove from kept passages' : 'Keep this passage'}>
          <KeepIcon kept={kept} rest={onDark ? 'onAccent' : undefined} />
        </Press>
        </View>
      </View>
      {open && q.n ? (
        <View style={{ paddingLeft: 16, gap: 10 }}>
          <T v="body" size={16.5} color={c.ink2} style={{ lineHeight: 26 }}>{q.n}</T>
          {to ? (
            <Press onPress={() => openConcept(to)} accessibilityRole="link" style={{ paddingVertical: 4 }}>
              <T v="uiStrong" size={15} color={c.accent}>Follow the thread: {byId[to].t} →</T>
            </Press>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

/* A shelf: a small picture and a name. Selected shelves get a sage ring. */
export function ShelfTile({ id, label, selected, onPress, width = 132 }: { id: string; label: string; selected?: boolean; onPress: () => void; width?: number }) {
  const { c } = useTheme();
  return (
    <Press onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: !!selected }} accessibilityLabel={label} style={{ width, gap: 8 }}>
      <View style={{ borderRadius: shape.lg + 3, padding: 3, borderWidth: 2, borderColor: selected ? c.sage : 'transparent' }}>
        <Cover seed={`col:${id}`} size={width - 10} ratio={0.62} radius={shape.lg} />
      </View>
      <T v="uiStrong" size={13.5} numberOfLines={2} color={selected ? c.accent : c.ink} style={{ paddingHorizontal: 4 }}>{label}</T>
    </Press>
  );
}

/* The featured idea: a full cobalt field. Little type, one picture, the threshold bar crossing the picture's lower edge. */
// The day's idea as one editorial object: art runs to the edges, a gold threshold crosses its lower edge, and the title is set on the page itself, broken by hand.
function compose(t: string) {
  const w = t.split(' ');
  if (w.length < 3 || t.length < 14) return t;
  let best = 1, bd = 1e9, run = 0;
  for (let i = 1; i < w.length; i++) { run += w[i - 1].length + 1; const d = Math.abs(run - (t.length - run)); if (d < bd) { bd = d; best = i; } }
  return w.slice(0, best).join(' ') + '\n' + w.slice(best).join(' ');
}
export function FeatureCard({ seed, kicker, title, line, width, onPress, label }: { seed: string; kicker: string; title: string; line?: string; width: number; onPress: () => void; label: string }) {
  const { c } = useTheme();
  return (
    <Press onPress={onPress} accessibilityRole="link" accessibilityLabel={label} style={{ width, borderRadius: shape.xl, overflow: 'hidden', backgroundColor: c.bg, borderWidth: 1, borderColor: c.rule, ...elevation.card }}>
      <View>
        <Cover seed={seed} size={width} ratio={0.56} radius={0} />
        <ThresholdTick color="#F2C94C" style={{ left: 20, bottom: -12, height: 28, width: 5 }} />
      </View>
      <View style={{ padding: 18, paddingTop: 26, gap: 8 }}>
        <T v="label" size={11.5} color={c.ink3}>{kicker.toUpperCase()}</T>
        <T v="display" size={30} numberOfLines={3} style={{ lineHeight: 34, fontFamily: font.semibold, letterSpacing: -0.5 }}>{compose(title)}</T>
        {line ? <T v="body" size={16} color={c.ink2} numberOfLines={2} style={{ lineHeight: 24 }}>{line}</T> : null}
      </View>
    </Press>
  );
}

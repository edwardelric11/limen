import { Pressable, View } from 'react-native';

import { booksFor, byId, THINKERS, tagOf } from '@/data';
import { COBALT, GOLD, INK, MOSS, OCHRE } from './art';
import { openBook, openConcept, openThinker } from './blocks';
import { Cover, fieldTone, hash, PALETTES } from './cover';
import { Press, T, ThresholdTick } from './kit';
import { font, space, useTheme } from './theme';

/* The content cards. One visual world, different objects:
   Theme  = a magazine cover (art fills the card, a solid title block sits across its lower-left corner)
   Idea   = VisualCard in blocks.tsx (art, then words, hairline frame)
   Thinker = a colour block with a cropped initial, then one line
   Thread = a line with stops, drawn in the threshold language
   Editorial = a single sentence on a field of colour
   Progress = numerals, nothing else. */

const BONE = '#F5F0E6';
const BLOCKS = [COBALT, MOSS, INK, OCHRE];

export function ThemeCard({ name, width, kicker, line, onPress }: { name: string; width: number; kicker: string; line?: string; onPress: () => void }) {
  const block = BLOCKS[hash(name) % 3];
  return (
    <Press onPress={onPress} accessibilityRole="link" accessibilityLabel={name} style={{ width, borderRadius: 6, overflow: 'hidden' }}>
      <Cover seed={`theme:${name}`} size={width} ratio={1.18} radius={0} />
      <View style={{ position: 'absolute', left: 0, bottom: 0, width: '84%', backgroundColor: block, padding: space.lg, paddingTop: 16, gap: 6 }}>
        <T v="label" size={11} color={BONE} style={{ opacity: 0.75 }}>{kicker.toUpperCase()}</T>
        <T v="display" size={26} color={BONE} style={{ lineHeight: 30 }}>{name}</T>
        {line ? <T v="body" size={14} color={BONE} numberOfLines={2} style={{ opacity: 0.9, lineHeight: 20 }}>{line}</T> : null}
      </View>
      <ThresholdTick color={GOLD} style={{ right: 18, bottom: 18, height: 30 }} />
    </Press>
  );
}

export function ThinkerCard({ k, width = 156 }: { k: string; width?: number }) {
  const { c } = useTheme();
  const t = THINKERS[k];
  const [bg, acc, ink, kind] = fieldTone(t.f);
  const parts = t.n.replace(/\(.*\)/, '').split(' ').filter(Boolean);
  const ini = (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  return (
    <Press onPress={() => openThinker(k)} accessibilityRole="link" accessibilityLabel={t.n} style={{ width, gap: 10 }}>
      <View style={{ height: width * 0.78, backgroundColor: bg, borderRadius: 6, overflow: 'hidden' }}>
        <T v="display" color={ink} style={{ position: 'absolute', left: -width * 0.04, bottom: -width * 0.2, fontSize: width * 0.72, lineHeight: width * 0.86, opacity: 0.96, includeFontPadding: false }}>{ini}</T>
        <View style={{ position: 'absolute', right: 14, top: 14, width: 16, height: 16, borderRadius: 8, backgroundColor: acc }} />
      </View>
      <View style={{ gap: 3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: bg, borderWidth: bg === '#D9C7A7' ? 0 : 0 }} /><T v="label" size={11} color={c.ink2}>{kind}</T></View>
        <T v="title" size={16.5} numberOfLines={2}>{t.n.replace(/\(.*\)/, '').trim()}</T>
        <T v="caption" size={13.5} numberOfLines={3} color={c.ink2} style={{ lineHeight: 19 }}>{tagOf(k)}</T>
      </View>
    </Press>
  );
}

/* A thread: where you are, where it goes, who thought it, what to read. Drawn as stops on one line; the bar after the first stop is the threshold. */
export function ThreadCard({ from, to, why, width }: { from: string; to: string; why: string; width: number }) {
  const { c } = useTheme();
  const thinker = byId[to].k.find(x => THINKERS[x]);
  const book = booksFor(to)[0];
  const stops: { kind: string; title: string; go: () => void }[] = [
    { kind: 'Where you were', title: byId[from].t, go: () => openConcept(from) },
    { kind: 'Next', title: byId[to].t, go: () => openConcept(to) },
    ...(thinker ? [{ kind: 'Thinker', title: THINKERS[thinker].n.replace(/\(.*\)/, '').trim(), go: () => openThinker(thinker) }] : []),
    ...(book ? [{ kind: 'Book', title: book.t, go: () => openBook(book.id) }] : []),
  ];
  return (
    <View style={{ width, paddingTop: space.sm }}>
      <T v="label" size={11.5}>FOLLOW THE THREAD</T>
      <T v="caption" size={13.5} style={{ marginTop: 4 }}>Each step leads to the next. Tap one to go there.</T>
      <T v="display" size={22} style={{ lineHeight: 28, marginTop: 14, marginBottom: 22, fontFamily: font.semibold }}>{why}</T>
      {stops.map((s, i) => {
        const on = i === 1, last = i === stops.length - 1;
        return (
          <Pressable key={s.kind} onPress={s.go} accessibilityRole="link" accessibilityLabel={`${s.kind}: ${s.title}`} style={{ flexDirection: 'row', minHeight: 58 }}>
            <View style={{ width: 28, alignItems: 'center' }}>
              <View style={{ position: 'absolute', top: i === 0 ? 12 : 0, bottom: last ? undefined : 0, height: last ? 12 : undefined, width: 1.5, backgroundColor: INK }} />
              {i === 1 ? <View style={{ position: 'absolute', top: -2, width: 22, height: 3, backgroundColor: OCHRE }} /> : null}
              <View style={{ marginTop: 4, width: on ? 16 : 12, height: on ? 16 : 12, borderRadius: 8, backgroundColor: on ? COBALT : c.bg, borderWidth: 1.5, borderColor: on ? COBALT : INK }} />
            </View>
            <View style={{ flex: 1, paddingBottom: 16, paddingLeft: 10 }}>
              <T v="label" size={10.5} color={on ? COBALT : c.ink3}>{s.kind.toUpperCase()}</T>
              <T v={on ? 'display' : 'uiStrong'} size={on ? 21 : 16.5} color={on ? COBALT : undefined} style={{ marginTop: 3, lineHeight: on ? 26 : 22, fontFamily: on ? font.semibold : undefined }}>{s.title}</T>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

type Tone = 'cobalt' | 'gold' | 'bone' | 'red';
/* A single sentence on a field. Cobalt + gold, bone + vermilion, or gold + cobalt. Not a card: a pause. */
export function EditorialCard({ tone = 'cobalt', kicker, text, width, onPress }: { tone?: Tone; kicker: string; text: string; width: number; onPress?: () => void }) {
  const bg = tone === 'cobalt' ? COBALT : tone === 'gold' ? GOLD : tone === 'red' ? '#FBE4DE' : BONE;
  const fg = tone === 'cobalt' ? BONE : INK;
  const mark = tone === 'cobalt' ? GOLD : tone === 'gold' ? COBALT : tone === 'red' ? COBALT : OCHRE;
  const body = (
    <View style={{ width, backgroundColor: bg, borderRadius: tone === 'red' ? 0 : 14, overflow: 'hidden', padding: space.lg, paddingVertical: 30, borderWidth: tone === 'bone' ? 1 : 0, borderColor: INK, minHeight: 190, justifyContent: 'flex-end' }}>
      {tone === 'red' ? <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 5, backgroundColor: OCHRE }} /> : tone === 'bone' ? <View style={{ position: 'absolute', left: space.lg, top: 0, width: 4, height: 38, backgroundColor: mark }} /> : <View style={{ position: 'absolute', right: -width * 0.12, top: -width * 0.12, width: width * 0.42, height: width * 0.42, borderRadius: width * 0.21, backgroundColor: mark }} />}
      <T v="label" size={11.5} color={fg} style={{ opacity: 0.75, marginBottom: 10 }}>{kicker.toUpperCase()}</T>
      <T v="display" size={25} color={fg} style={{ lineHeight: 31 }}>{text}</T>
    </View>
  );
  return onPress ? <Press onPress={onPress} accessibilityRole="link">{body}</Press> : body;
}

/* Progress: three numbers. */
export function ProgressCard({ ideas, thinkers, books }: { ideas: number; thinkers: number; books: number }) {
  const { c } = useTheme();
  const cell = (n: number, label: string, last?: boolean) => (
    <View style={{ flex: 1, paddingLeft: 14, borderLeftWidth: 1, borderLeftColor: last ? INK : INK }}>
      <T v="display" size={44} color={INK} style={{ lineHeight: 48 }}>{n}</T>
      <T v="caption" size={13} color={c.ink2}>{label}</T>
    </View>
  );
  return (
    <View style={{ marginHorizontal: space.lg, marginBottom: 26, paddingTop: 8 }}>
      <ThresholdTick color={OCHRE} style={{ left: 0, top: -2, height: 14, width: 4 }} />
      <T v="label" size={11.5} style={{ marginBottom: 14, marginLeft: 12 }}>YOUR PATH</T>
      <View style={{ flexDirection: 'row' }}>
        {cell(ideas, ideas === 1 ? 'idea explored' : 'ideas explored')}
        {cell(thinkers, thinkers === 1 ? 'thinker met' : 'thinkers met')}
        {cell(books, books === 1 ? 'book started' : 'books started')}
      </View>
    </View>
  );
}

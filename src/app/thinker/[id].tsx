import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { useNotebook } from '@/lib/notebook';

import { booksBy, groupOfThinker, ideasBy, nearby, QUOTES, THINKERS, traditionsOf } from '@/data';
import { BookRow, ConceptRow, Monogram, Passage, Screen, ThinkerRow } from '@/ui/blocks';
import { T } from '@/ui/kit';
import { shape, tintFor, useTheme } from '@/ui/theme';

export default function ThinkerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = THINKERS[id];
  const { c } = useTheme();
  const { setFlag } = useNotebook();
  useEffect(() => { if (t) setFlag('t:' + id); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!t) return <Screen back><T v="dek" style={{ padding: 20 }}>Not in the library.</T></Screen>;
  const ideas = ideasBy(id);
  const books = booksBy(id);
  const peers = nearby(id);
  const words = QUOTES.filter(q => q.k === id).slice(0, 2);

  return (
    <Screen back bottom={40}>
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        <Monogram k={id} size={64} />
        <T v="display" size={34} accessibilityRole="header">{t.n}</T>
        <T v="caption" size={15}>{t.f} · {t.y}</T>
        <T v="caption" size={14} color={c.accent}>{traditionsOf(id).slice(0, 4).join(' · ')}</T>
      </View>
      <View style={{ marginHorizontal: 20, marginTop: 22, padding: 18, borderRadius: shape.md, backgroundColor: tintFor(groupOfThinker(id)), gap: 8 }}>
        <T v="label">In a line</T>
        <T v="bodyLg" size={18.5}>{t.line}</T>
      </View>
      {t.vs ? (
        <View style={{ paddingHorizontal: 20, marginTop: 22, gap: 6 }}>
          <T v="label">Who pushed back</T>
          <T v="body" size={16.5}>{t.vs}</T>
        </View>
      ) : null}
      {ideas.length ? (
        <View style={{ marginTop: 28 }}>
          <T v="label" style={{ paddingHorizontal: 20, marginBottom: 2 }}>Ideas</T>
          {ideas.map((x, i) => <ConceptRow key={x.id} c={x} first={i === 0} meta="none" />)}
        </View>
      ) : null}
      {books.length ? (
        <View style={{ marginTop: 26 }}>
          <T v="label" style={{ paddingHorizontal: 20, marginBottom: 2 }}>Books</T>
          {books.map((b, i) => <BookRow key={b.id} b={b} first={i === 0} />)}
        </View>
      ) : null}
      {words.length ? (
        <View style={{ marginTop: 30, gap: 24 }}>
          <T v="label" style={{ paddingHorizontal: 20 }}>In their words</T>
          {words.map(q => <Passage key={q.id} q={q} />)}
        </View>
      ) : null}
      {peers.length ? (
        <View style={{ marginTop: 26 }}>
          <T v="label" style={{ paddingHorizontal: 20, marginBottom: 2 }}>Thinkers nearby</T>
          {peers.map((k, i) => <ThinkerRow key={k} k={k} first={i === 0} />)}
        </View>
      ) : null}
    </Screen>
  );
}

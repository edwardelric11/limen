import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { bookById, booksIn, byId, COLLECTIONS, quotesIn, START_SHELF, themesOfBook, THINKERS, year } from '@/data';
import { BookRow, ConceptRow, openTheme, Passage, ThinkerRow } from '@/ui/blocks';
import { Cover, hash, PALETTES } from '@/ui/cover';
import { useNotebook } from '@/lib/notebook';
import { BackButton, KeepIcon, Press, T } from '@/ui/kit';
import { shape, useTheme } from '@/ui/theme';

export default function BookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const b = bookById[id];
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [note, setNote] = useState('');
  const nb = useNotebook();
  const setFlag = nb.setFlag;
  useEffect(() => { if (b) setFlag('b:' + b.id); }, [b]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!b) return <View style={{ flex: 1, backgroundColor: c.bg }}><BackButton /></View>;
  const [tone, , ink] = PALETTES[hash(b.id) % PALETTES.length];
  const more = booksIn(b.col).filter(x => x.id !== b.id).sort((x, y) => hash(x.id + b.id) - hash(y.id + b.id)).slice(0, 3);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <View style={{ backgroundColor: tone, paddingTop: insets.top + 76, paddingBottom: 28, paddingHorizontal: 22, gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-end' }}>
            <View style={{ flex: 1, gap: 12 }}>
              <T v="label" color="rgba(245,240,230,.75)">{COLLECTIONS[b.col]}</T>
              <T v="display" size={34} color={ink} accessibilityRole="header">{b.t}</T>
              <T v="uiStrong" size={15} color="rgba(245,240,230,.85)">{b.a} · {year(b.y)}</T>
            </View>
            <Cover seed={`b:${b.id}`} size={84} ratio={1} radius={shape.lg} />
          </View>
        </View>

        <View style={{ paddingHorizontal: 22, paddingTop: 24, gap: 8 }}>
          <T v="label">Why read it</T>
          <T v="bodyLg" size={20} style={{ lineHeight: 30 }}>{b.thesis}</T>
          {b.summary ? (
            <View style={{ gap: 14, paddingTop: 12 }}>
              <T v="label">Summary</T>
              {b.summary.split('\n\n').map((para, i) => <T key={i} v="body" size={17} style={{ lineHeight: 27 }}>{para}</T>)}
            </View>
          ) : null}
          <T v="caption" size={13.5} style={{ paddingTop: 4 }}>{[b.c.length ? `${b.c.length} key ideas` : '', quotesIn(b.id).length ? `${quotesIn(b.id).length} passages` : '', START_SHELF.includes(b.id) ? 'Begin here' : 'Deeper', nb.flags['b:' + b.id] ? 'Started' : ''].filter(Boolean).join(' · ')}</T>
          {themesOfBook(b).length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 18, paddingTop: 6 }}>
              {themesOfBook(b).map(t => <Press key={t} onPress={() => openTheme(t)} hitSlop={6} style={{ paddingVertical: 4 }}><T v="uiStrong" size={14.5} color={c.accent}>{t}</T></Press>)}
            </View>
          ) : null}
        </View>

        {quotesIn(b.id).slice(0, 1).map(q => (
          <View key={q.id} style={{ marginTop: 28, gap: 12 }}>
            <T v="label" style={{ paddingHorizontal: 22 }}>Passages from the book</T>
            <Passage q={q} />
          </View>
        ))}

        {b.ideas ? (
          <View style={{ paddingHorizontal: 22, marginTop: 26, gap: 10 }}>
            <T v="label">{b.ideas.length} ideas from the book</T>
            {b.ideas.map((x, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 14, padding: 15, borderRadius: shape.md, borderWidth: 1, borderColor: '#DAD6CC' }}>
                <T v="display" size={22} color={c.sage} style={{ width: 24, lineHeight: 26 }}>{i + 1}</T>
                <T v="body" size={16} style={{ flex: 1, lineHeight: 24 }}>{x}</T>
              </View>
            ))}
          </View>
        ) : null}
        {b.surprise ? (
          <View style={{ paddingHorizontal: 22, marginTop: 26, gap: 8 }}>
            <T v="label">The surprising part</T>
            <T v="body" size={17}>{b.surprise}</T>
          </View>
        ) : null}
        {b.crit ? (
          <View style={{ paddingHorizontal: 22, marginTop: 26, gap: 8 }}>
            <T v="label" color={c.contested}>Where it falls short</T>
            <T v="body" size={17}>{b.crit}</T>
          </View>
        ) : null}

        {b.c.length ? (
          <View style={{ marginTop: 30 }}>
            <T v="label" style={{ paddingHorizontal: 20, marginBottom: 2 }}>Follow the thread</T>
            {b.c.map((x, i) => <ConceptRow key={x} c={byId[x]} first={i === 0} meta="none" />)}
          </View>
        ) : null}
        {b.k.length ? (
          <View style={{ marginTop: 26 }}>
            <T v="label" style={{ paddingHorizontal: 20, marginBottom: 2 }}>{b.k.length > 1 ? 'Meet the thinkers' : 'Meet the thinker'}</T>
            {b.k.filter(k => THINKERS[k]).map((k, i) => <ThinkerRow key={k} k={k} first={i === 0} />)}
          </View>
        ) : null}
        <View style={{ marginTop: 26 }}>
          <T v="label" style={{ paddingHorizontal: 20, marginBottom: 2 }}>Read next</T>
          {more.map((x, i) => <BookRow key={x.id} b={x} first={i === 0} />)}
        </View>
      </ScrollView>
      <BackButton light />
      {note ? <View pointerEvents="none" style={{ position: 'absolute', top: insets.top + 12, right: 66, backgroundColor: '#17191C', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8 }}><T v="ui" size={13} color="#F5F0E6">{note}</T></View> : null}
      <Press onPress={() => { nb.toggleSave(b.id); setNote(nb.saved[b.id] ? 'Removed from Library' : 'Kept in Library › Saved'); setTimeout(() => setNote(''), 2600); }} accessibilityRole="button" accessibilityLabel={nb.saved[b.id] ? 'Remove from your library' : 'Keep this book'}
        style={{ position: 'absolute', top: insets.top + 6, right: 14, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(245,240,230,0.94)' }}>
        <KeepIcon kept={!!nb.saved[b.id]} size="lg" rest="ink" />
      </Press>
    </View>
  );
}

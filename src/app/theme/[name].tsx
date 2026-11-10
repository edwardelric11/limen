import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { byId, THEME_LINES, THINKERS, themeWorld } from '@/data';
import { useProgress } from '@/lib/progress';
import { BookRow, ConceptRow, openConcept, Screen, ThinkerRow } from '@/ui/blocks';
import { Cover } from '@/ui/cover';
import { Press, T } from '@/ui/kit';
import { shape, useAppWidth, useTheme } from '@/ui/theme';

// A theme is a small world. Oriented first: where to start, then neighbours, people, books, and a thread through it.
export default function ThemeScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const { c } = useTheme();
  const { explored } = useProgress();
  const w = themeWorld(name, explored);
  const [all, setAll] = useState(false);
  const shown = all ? w.ideas : w.ideas.slice(0, 4);
  const Head = ({ children }: { children: string }) => <T v="title" size={19} style={{ paddingHorizontal: 20, marginBottom: 2 }}>{children}</T>;

  return (
    <Screen back bottom={40}>
      <Cover seed={`theme:${name}`} size={useAppWidth() - 40} ratio={0.62} radius={shape.xl} style={{ marginHorizontal: 20, marginBottom: 20 }} />
      <View style={{ paddingHorizontal: 20, gap: 10, marginBottom: 6 }}>
        <T v="display" size={38} accessibilityRole="header">{name}</T>
        <T v="dek" size={17}>{THEME_LINES[name]}</T>
      </View>

      <View style={{ marginTop: 26 }}>
        <T v="label" style={{ paddingHorizontal: 20, marginBottom: 2 }}>Start here</T>
        <ConceptRow c={w.start} first />
      </View>

      {w.ideas.length ? (
        <View style={{ marginTop: 34 }}>
          <Head>Ideas</Head>
          {shown.map((x, i) => <ConceptRow key={x.id} c={x} first={i === 0} />)}
          {w.ideas.length > 4 && !all ? (
            <Press onPress={() => setAll(true)} style={{ paddingHorizontal: 20, paddingVertical: 14 }}><T v="uiStrong" size={15} color={c.accent}>More ideas ({w.ideas.length - 4}) →</T></Press>
          ) : null}
        </View>
      ) : null}

      {w.thinkers.length ? (
        <View style={{ marginTop: 34 }}>
          <Head>Thinkers</Head>
          {w.thinkers.slice(0, 3).map((k, i) => <ThinkerRow key={k} k={k} first={i === 0} />)}
        </View>
      ) : null}

      {w.books.length ? (
        <View style={{ marginTop: 34 }}>
          <Head>Worth reading</Head>
          {w.books.slice(0, 3).map((b, i) => <BookRow key={b.id} b={b} first={i === 0} />)}
        </View>
      ) : null}

      {w.thread.length > 1 ? (
        <Press onPress={() => openConcept(w.thread[0])} accessibilityRole="link" style={{ marginTop: 38, marginHorizontal: 20, paddingTop: 22, gap: 6 }}>
          <T v="label">Follow the thread</T>
          <T v="title" size={17}>{w.thread.map(id => byId[id].t).join(' → ')}</T>
        </Press>
      ) : null}
    </Screen>
  );
}

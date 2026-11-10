import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Platform, TextInput, View } from 'react-native';

import { bookById, booksFor, byId, PRIMARY_THEMES, quoteById, search, THINKERS } from '@/data';
import { BookRow, ConceptRow, Empty, openConcept, openTheme, Passage, Screen, ThinkerRow } from '@/ui/blocks';
import { Card } from '@/ui/card';
import { Carousel } from '@/ui/carousel';
import { Cover } from '@/ui/cover';
import { Chip, Icon, Press, Reveal, Rule, T } from '@/ui/kit';
import { font, shape, useTheme } from '@/ui/theme';


function Group({ label, n, total, onMore, children }: { label: string; n: number; total: number; onMore: () => void; children: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ marginTop: 34 }}>
      <T v="title" size={19} style={{ paddingHorizontal: 20, marginBottom: 2 }}>{label}</T>
      {children}
      {total > n ? <Press onPress={onMore} style={{ paddingHorizontal: 20, paddingVertical: 10 }}><T v="uiStrong" size={14.5} color={c.accent}>Show {total - n} more</T></Press> : null}
    </View>
  );
}

const EXAMPLES = [
  'Why do I care what strangers think?',
  'Why does getting what I wanted stop feeling exciting?',
  "Why do I keep defending something I don't believe anymore?",
  'Why do people defend beliefs that hurt them?',
  'Why does rejection feel so painful?',
  'Why do I want something less once I have it?',
  'Why do I idealize people who don’t want me?',
  'Why do we sabotage what matters to us?',
  'Why does passion fade in long relationships?',
  'Why do I feel lonely around other people?',
];
// Terms to begin with, each with the picture of an idea that belongs to it.
const TERMS: [string, string][] = [['Projection', 'projection'], ['Attachment', 'pursue-withdraw'], ['Status', 'status-local'], ['Shame', 'shame-guilt'], ['Existentialism', 'the-absurd'], ['Jung', 'shadow'], ['Desire', 'wanting-liking'], ['Rejection', 'social-pain'], ['Power', 'disciplinary-power'], ['Memory', 'interpreter']];

// One field. Questions and terms are read the same way; the answer is organised, not listed.
export default function Search() {
  const { c } = useTheme();
  const params = useLocalSearchParams<{ q?: string }>();
  const [q, setQ] = useState(params.q ?? '');
  const [all, setAll] = useState(false);
  const [f, setF] = useState('All');
  const [focus, setFocus] = useState(false);
  useEffect(() => { if (params.q) { setQ(params.q); setAll(false); setF('All'); } }, [params.q]);
  const r = useMemo(() => search(q), [q]);
  const empty = q.trim().length >= 2 && !r.ideas.length && !r.thinkers.length && !r.books.length && !r.quotes.length;
  const examples = EXAMPLES;

  const top = r.ideas[0] ? byId[r.ideas[0]] : null;
  const related = top ? top.rel.slice(0, 4).filter(([x]) => byId[x]).map(([x]) => x) : [];
  const people = [...new Set([...(top?.k ?? []), ...r.thinkers])].filter(k => THINKERS[k]).slice(0, 3);
  const theme = PRIMARY_THEMES.find(t => q.toLowerCase().includes(t.toLowerCase()));
  const kinds = [r.ideas.length && 'Ideas', r.thinkers.length && 'Thinkers', r.books.length && 'Books', r.quotes.length && 'Passages'].filter(Boolean) as string[];
  const showFilters = !empty && q.trim().length >= 2 && kinds.length > 1 && r.ideas.length + r.thinkers.length + r.books.length + r.quotes.length >= 6;
  const books = (top ? booksFor(top.id) : []).slice(0, 2);
  const bookList = books.length ? books : r.books.slice(0, 2).map(id => bookById[id]);
  const restIdeas = r.ideas.filter(id => id !== top?.id && !related.includes(id));

  return (
    <Screen title="Search">
      <View style={{ marginHorizontal: 20, height: 48, borderRadius: 24, backgroundColor: focus ? c.bg : c.surface, borderWidth: 1.5, borderColor: focus ? c.sage : 'transparent', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10 }}>
        <Icon name="search" tone="muted" size="lg" />
        <TextInput value={q} onChangeText={t => { setQ(t); setAll(false); }} placeholder="What are you curious about?" placeholderTextColor={c.ink3} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} returnKeyType="search" autoCorrect={false}
          style={{ flex: 1, fontSize: 16.5, color: c.ink, fontFamily: font.regular, paddingVertical: 0, ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null) }} accessibilityLabel="Search: ask a question or name an idea" />
        {q ? <Press onPress={() => setQ('')} hitSlop={12} accessibilityLabel="Clear search"><Icon name="close" tone="muted" /></Press> : null}
      </View>

      {showFilters ? (
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginTop: 16 }}>
          {['All', ...kinds].map(t => <Chip key={t} label={t} selected={f === t} onPress={() => setF(t)} />)}
        </View>
      ) : null}

      {q.trim().length < 2 ? (
        <View style={{ marginTop: 34 }}>
          <T v="title" size={20} style={{ paddingHorizontal: 20, marginBottom: 14 }}>Begin with an idea</T>
          <Carousel itemW={124} gap={12}>
            {TERMS.map(([term, seed]) => (
              <Card key={term} variant="elevated" pad={0} radius={shape.lg} onPress={() => setQ(term)} accessibilityRole="button" accessibilityLabel={`Search ${term}`} style={{ width: 124 }}>
                <View style={{ borderTopLeftRadius: shape.lg, borderTopRightRadius: shape.lg, overflow: 'hidden' }}><Cover seed={seed} size={124} ratio={0.8} radius={0} /></View>
                <View style={{ padding: 12 }}><T v="uiStrong" size={14.5} numberOfLines={1}>{term}</T></View>
              </Card>
            ))}
          </Carousel>
          <T v="title" size={20} style={{ paddingHorizontal: 20, marginTop: 34, marginBottom: 4 }}>10 questions to start your journey</T>
          {examples.map((x, i) => (
            <View key={x}>
              {i ? <Rule /> : null}
              <Press onPress={() => setQ(x)} style={{ paddingHorizontal: 20, paddingVertical: 11 }}>
                <T v="body" size={16.5}>{x}</T>
              </Press>
            </View>
          ))}
        </View>
      ) : empty ? (
        <View style={{ marginTop: 30 }}>
          <Empty title="Nothing found." body="Try the feeling or the situation: envy, rejection, a job you can’t leave." />
        </View>
      ) : showFilters && f !== 'All' ? (
        <View style={{ marginTop: 20, gap: f === 'Passages' ? 28 : 0 }}>
          {f === 'Ideas' ? r.ideas.map((id, i) => <ConceptRow key={id} c={byId[id]} first={i === 0} />) : null}
          {f === 'Thinkers' ? r.thinkers.map((k, i) => <ThinkerRow key={k} k={k} first={i === 0} />) : null}
          {f === 'Books' ? r.books.map((id, i) => <BookRow key={id} b={bookById[id]} first={i === 0} />) : null}
          {f === 'Passages' ? r.quotes.map(id => <Passage key={id} q={quoteById[id]} />) : null}
        </View>
      ) : (
        <Reveal key={top?.id ?? "r"}><View style={{ marginTop: 30, gap: 38 }}>
          {r.question ? <T v="caption" size={15} style={{ paddingHorizontal: 20 }}>You may be asking: {r.question}</T> : null}

          {top ? (
            <Press onPress={() => openConcept(top.id)} accessibilityRole="link" style={{ paddingHorizontal: 20, gap: 10 }}>
              <T v="label">The idea</T>
              <T v="display" size={26}>{top.t}</T>
              <T v="dek" size={18}>{top.dek}</T>
              <T v="uiStrong" size={16} color={c.accent}>Read</T>
            </Press>
          ) : null}

          {related.length ? (
            <View style={{ paddingHorizontal: 20, gap: 8 }}>
              <T v="label">Nearby</T>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 20, rowGap: 2 }}>
                {related.map(x => <Press key={x} onPress={() => openConcept(x)} hitSlop={6} style={{ paddingVertical: 5 }}><T v="uiStrong" size={16} color={c.accent}>{byId[x].t}</T></Press>)}
              </View>
            </View>
          ) : null}

          {theme ? (
            <Press onPress={() => openTheme(theme)} accessibilityRole="link" style={{ paddingHorizontal: 20, gap: 4 }}>
              <T v="label">Theme</T>
              <T v="uiStrong" size={17} color={c.accent}>{theme} →</T>
            </Press>
          ) : null}

          {people.length ? (
            <View style={{ gap: 2 }}>
              <T v="label" style={{ paddingHorizontal: 20 }}>Thinkers</T>
              {people.map((k, i) => <ThinkerRow key={k} k={k} first={i === 0} />)}
            </View>
          ) : null}

          {bookList.length ? (
            <View style={{ gap: 4 }}>
              <T v="label" style={{ paddingHorizontal: 20 }}>Books</T>
              {bookList.map((b, i) => <BookRow key={b.id} b={b} first={i === 0} />)}
            </View>
          ) : null}

          {r.quotes.length ? (
            <View style={{ gap: 26 }}>
              <T v="label" style={{ paddingHorizontal: 20 }}>In their words</T>
              {r.quotes.slice(0, all ? 6 : 2).map(id => <Passage key={id} q={quoteById[id]} />)}
            </View>
          ) : null}

          {top && related[0] ? (
            <Press onPress={() => openConcept(related[0])} accessibilityRole="link" style={{ paddingHorizontal: 20, gap: 4 }}>
              <T v="label">Follow the thread</T>
              <T v="title" size={17}>{[top.id, ...related.slice(0, 3)].map(id => byId[id].t).join(' → ')}</T>
            </Press>
          ) : null}

          {!top && r.thinkers.length ? r.thinkers.slice(0, 3).map((k, i) => <ThinkerRow key={k} k={k} first={i === 0} />) : null}

          {restIdeas.length || r.thinkers.length > 1 || r.books.length > 2 ? (
            all ? (
              <View>
                <T v="title" size={19} style={{ paddingHorizontal: 20, marginBottom: 2 }}>More that matched</T>
                {[...restIdeas].map((id, i) => <ConceptRow key={id} c={byId[id]} first={i === 0} />)}
                {r.thinkers.filter(k => !people.includes(k)).map((k, i) => <ThinkerRow key={k} k={k} first={!restIdeas.length && i === 0} />)}
                {r.books.filter(id => !bookList.some(b => b.id === id)).map((id, i) => <BookRow key={id} b={bookById[id]} first={i === 0} />)}
              </View>
            ) : (
              <Press onPress={() => setAll(true)} hitSlop={8} style={{ paddingHorizontal: 20, alignSelf: 'flex-start' }}>
                <T v="ui" size={15} color={c.accent}>More that matched →</T>
              </Press>
            )
          ) : null}
        </View></Reveal>
      )}
    </Screen>
  );
}

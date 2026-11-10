import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, TextInput, View } from 'react-native';

import { BOOK_GROUPS, BOOKS, COLLECTIONS, CONCEPTS, QUOTES, PRIMARY_THEMES, startShelf, THEME_LINES, THINKERS, thinkersIn, underrated } from '@/data';
import { useNotebook } from '@/lib/notebook';
import { useProgress } from '@/lib/progress';
import { BookRow, ConceptRow, openConcept, Passage, openTheme, Screen, searchFor, ShelfTile, ThinkerRow, VisualCard } from '@/ui/blocks';
import { Carousel } from '@/ui/carousel';
import { ThemeCard, ThinkerCard } from '@/ui/cards';
import { Button, Chip, Icon, Press, Rule, Segmented, T } from '@/ui/kit';
import { font, useAppWidth, useTheme } from '@/ui/theme';

const START = ['jung', 'nietzsche', 'camus', 'frankl', 'fromm', 'arendt'];
const QUESTIONS = ['Start with', 'Meaning', 'Identity', 'Power', 'The unconscious', 'Freedom', 'Underrated'];
const GROUPS = ['All', ...Object.keys(BOOK_GROUPS)];
type Tab = 't' | 'i' | 'w' | 'b' | 'p';
// The tour: five stops, in the order that makes sense for a newcomer.
const TOUR: { key: Tab; label: string; why: string }[] = [
  { key: 't', label: 'Themes', why: 'Start with a question that pulls at you.' },
  { key: 'i', label: 'Ideas', why: 'Read the ideas behind it.' },
  { key: 'w', label: 'Thinkers', why: 'Meet the people who argued about it.' },
  { key: 'b', label: 'Books', why: 'Go further with a book.' },
  { key: 'p', label: 'Passages', why: 'Keep the lines worth rereading.' },
];

// People who wrote about a question: found through the ideas that carry that theme.
const aboutTheme = (t: string) => [...new Set(CONCEPTS.filter(x => x.th.includes(t)).flatMap(x => x.k))].filter(k => THINKERS[k]);

// Explore: four ways in, one tab at a time. Themes first: big human questions, then ideas, people, books.
export default function Explore() {
  const { c } = useTheme();
  const nb = useNotebook();
  const { explored } = useProgress();
  const tourDone = (k: Tab) => !!nb.flags['e:' + k];
  const themeW = Math.min(useAppWidth() * 0.62, 250);
  const [sq, setSq] = useState('');
  const sc = useRef<ScrollView>(null);
  const [tab, setTab] = useState<Tab>('t');
  useEffect(() => { if (nb.ready && !nb.flags['e:' + tab]) nb.setFlag('e:' + tab); }, [tab, nb.ready]); // eslint-disable-line react-hooks/exhaustive-deps
  const [kind, setKind] = useState('All');
  const [q, setQ] = useState('Start with');
  const [by, setBy] = useState(false);
  const [th, setTh] = useState('');
  const [grp, setGrp] = useState('All');
  const [pt, setPt] = useState('All');
  const [n, setN] = useState(8);
  const ideas = CONCEPTS.filter(x => (kind === 'All' || (kind === 'Philosophy' ? x.d.includes('phil') : x.d.includes('psych') || x.d.includes('behav'))) && (!th || x.th.includes(th)));
  const bookList = (grp === 'All' ? startShelf() : grp === 'Started' ? BOOKS.filter(b => nb.flags['b:' + b.id]) : BOOKS.filter(b => BOOK_GROUPS[grp]?.includes(b.col)).sort((a, b) => a.y - b.y || a.t.localeCompare(b.t)));
  const books = grp === 'All' ? bookList.slice(0, 12) : bookList;
  const writers = q === 'Start with' ? START : q === 'Underrated' ? underrated() : q === 'The unconscious' ? thinkersIn('Psychoanalysis & depth psychology') : aboutTheme(q);

  const head = (title: string, onAll: () => void, top = 18) => (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: top, marginBottom: 12 }}>
      <T v="title" size={19}>{title}</T>
      <Press onPress={onAll} accessibilityRole="link" hitSlop={10}><T v="uiStrong" size={14.5} color={c.accent}>See all</T></Press>
    </View>
  );
  const link = (label: string, onPress: () => void) => (
    <Press onPress={onPress} accessibilityRole="link" style={{ paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <T v="uiStrong" size={15.5} color={c.accent}>{label}</T>
      <Icon name="next" tone="accent" />
    </Press>
  );

  return (
    <Screen title="Explore" scrollRef={sc} onEnd={() => setN(v => Math.min(v + 12, ideas.length))}>
      <View style={{ marginHorizontal: 20, marginBottom: 16, height: 48, borderRadius: 24, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10 }}>
        <Icon name="search" tone="muted" size="lg" />
        <TextInput value={sq} onChangeText={setSq} onSubmitEditing={() => { if (sq.trim()) { searchFor(sq.trim()); setSq(''); } }} placeholder="What are you curious about?" placeholderTextColor={c.ink3} returnKeyType="search" autoCorrect={false} accessibilityLabel="Search ideas, thinkers and books"
          style={{ flex: 1, fontSize: 16.5, color: c.ink, fontFamily: font.regular, paddingVertical: 0, ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null) }} />
      </View>
      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        <Segmented value={tab} onChange={setTab} options={[{ key: 't', label: 'Themes' }, { key: 'i', label: 'Ideas' }, { key: 'w', label: 'Thinkers' }, { key: 'b', label: 'Books' }, { key: 'p', label: 'Passages' }]} />
      </View>

      {tab === 't' ? (
        <>
          <T v="dek" size={17} style={{ paddingHorizontal: 20, marginBottom: 8 }}>What are you trying to understand?</T>
          <Carousel itemW={themeW}>
            {PRIMARY_THEMES.map(t => {
              const all = CONCEPTS.filter(x => x.th.includes(t));
              const seen = all.filter(x => explored.includes(x.id)).length;
              return <ThemeCard key={t} name={t} width={themeW} kicker={seen ? `${seen} of ${all.length} explored` : `${all.length} ideas`} line={THEME_LINES[t]} onPress={() => openTheme(t)} />;
            })}
          </Carousel>
          {link('All themes', () => router.push('/themes'))}
          {head('People who changed the question', () => router.push('/thinkers'))}
          <Carousel itemW={156} gap={14}>{START.map(k => <ThinkerCard key={k} k={k} />)}</Carousel>
          {head('Ideas to begin with', () => setTab('i'), 26)}
          <Carousel itemW={themeW}>
            {CONCEPTS.filter(x => x.lvl === 1).slice(0, 8).map(x => <VisualCard key={x.id} seed={x.id} width={themeW} ratio={0.7} kicker={x.th[0]} title={x.t} line={x.dek} label={x.t} onPress={() => openConcept(x.id)} />)}
          </Carousel>
        </>
      ) : tab === 'i' ? (
        <>
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 12 }}>
            {['All', 'Psychology', 'Philosophy'].map(t => <Chip key={t} label={t} selected={kind === t} onPress={() => { setKind(t); setN(8); }} />)}
          </View>
          <Press onPress={() => { setBy(!by); if (by) setTh(''); }} hitSlop={8} style={{ paddingHorizontal: 20, paddingBottom: 12, alignSelf: 'flex-start' }}>
            <T v="ui" size={14} color={c.accent}>{th ? `Theme: ${th} ✕` : by ? 'Hide themes' : 'By theme'}</T>
          </Press>
          {by && !th ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 12 }}>
              {PRIMARY_THEMES.map(t => <Chip key={t} label={t} selected={false} onPress={() => { setTh(t); setN(8); }} />)}
            </ScrollView>
          ) : null}
          {ideas.slice(0, n).map((x, i) => <ConceptRow key={x.id} c={x} first={i === 0} />)}
          {link('Follow a thread', () => router.push('/threads'))}
        </>
      ) : tab === 'w' ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 12 }}>
            {QUESTIONS.map(t => <Chip key={t} label={t} selected={q === t} onPress={() => setQ(t)} />)}
          </ScrollView>
          {writers.slice(0, 6).map((k, i) => <ThinkerRow key={k} k={k} first={i === 0} />)}
          {link(`All ${Object.keys(THINKERS).length} thinkers`, () => router.push('/thinkers'))}
        </>
      ) : tab === 'p' ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 14 }}>
            {['All', ...PRIMARY_THEMES].map(t => <Chip key={t} label={t} selected={pt === t} onPress={() => setPt(t)} />)}
          </ScrollView>
          <View style={{ gap: 26 }}>
            {QUOTES.filter(x => x.n && (pt === 'All' || x.c?.some(id => CONCEPTS.find(k => k.id === id)?.th.includes(pt)))).slice(0, 8).map(x => <Passage key={x.id} q={x} />)}
          </View>
          {link(`All ${QUOTES.length} passages`, () => router.push('/passages'))}
        </>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 18 }}>
            {Object.entries(COLLECTIONS).map(([k, v]) => <ShelfTile key={k} id={k} label={v} onPress={() => router.push({ pathname: '/shelf', params: { col: k } })} />)}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 12 }}>
            {[...GROUPS, ...(BOOKS.some(b => nb.flags['b:' + b.id]) ? ['Started'] : [])].map(t => <Chip key={t} label={t} selected={grp === t} onPress={() => setGrp(t)} />)}
          </ScrollView>
          <T v="label" style={{ paddingHorizontal: 20, marginBottom: 2 }}>{grp === 'All' ? 'Worth reading first' : grp === 'Started' ? 'Started' : 'Newest first'}</T>
          {books.map((b, i) => <BookRow key={b.id} b={b} first={i === 0} />)}
          {link(`All ${BOOKS.length} books`, () => router.push('/shelf'))}
        </>
      )}
      <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
        {tab !== 'p' ? <Button full label={`Next: ${TOUR[TOUR.findIndex(x => x.key === tab) + 1].label}`} icon="arrow-right" onPress={() => { setTab(TOUR[TOUR.findIndex(x => x.key === tab) + 1].key); setN(8); sc.current?.scrollTo({ y: 0, animated: false }); }} /> : <Button full label="Back to your path" icon="arrow-right" onPress={() => router.navigate('/')} />}
      </View>
    </Screen>
  );
}

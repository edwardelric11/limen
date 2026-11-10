import { router } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { bookById, byId, CONCEPTS, startShelf, THINKERS, depthOf, discOf, FIRST_IDEA, leaningThemes, minutesOf, nextAfter, quoteToday, somethingNew, todayConcept } from '@/data';
import { useNotebook } from '@/lib/notebook';
import { useProgress } from '@/lib/progress';
import { useTrail } from '@/lib/trail';
import { BookCover, ConceptRow, FeatureCard, openConcept, Passage, Screen, searchFor, VisualCard } from '@/ui/blocks';
import { Card } from '@/ui/card';
import { EditorialCard, ThinkerCard, ThreadCard } from '@/ui/cards';
import { Carousel } from '@/ui/carousel';
import { Cover } from '@/ui/cover';
import { GoalBar, PathRoad, StreakChip, WeekStrip } from '@/ui/game';
import { Button, Icon, Meta, Press, Reveal, Rule, T, Wordmark } from '@/ui/kit';
import { elevation, shape, space, useAppWidth, useTheme } from '@/ui/theme';

// One idea. Then one way to ask, one way to continue, one thread to follow. The rest lives in Explore.
export default function Home() {
  const { c } = useTheme();
  const W = useAppWidth();
  const { trail, ready } = useTrail();
  const nb = useNotebook();
  const { explored, streak, today, goal, goalMet, week, path, nextIdea, onboarded } = useProgress();
  useEffect(() => { if (nb.ready && ready && !onboarded && !trail.length) router.replace('/welcome'); }, [nb.ready, ready, onboarded, trail.length]);
  if (!ready || !nb.ready) return <View style={{ flex: 1, backgroundColor: c.bg }} />;

  const idea = byId[nextIdea];
  const first = !explored.length;
  const last = trail[trail.length - 1];
  const resume = last ? nextAfter(last, trail) : null;
  const qs = ['Why do I care what strangers think?', 'Why does getting what I wanted stop feeling exciting?', "Why do I keep defending something I don't believe anymore?"];
  const cardW = W - 40;
  const STARTERS = ['jung', 'nietzsche', 'camus', 'frankl', 'fromm', 'arendt', 'beauvoir', 'kierkegaard'];
  const people = [...new Set([...path.c.flatMap(x => byId[x].k), ...STARTERS])].filter(k => THINKERS[k]).slice(0, 8);
  const reads = [...new Set([...path.b, ...startShelf().map(b => b.id)])].map(id => bookById[id]).filter(Boolean).slice(0, 8);
  const fresh = trail.length >= 3 ? somethingNew(trail) : null;
  const lean = leaningThemes(trail)[0];
  const cw = Math.min(cardW * 0.78, 280);
  // Continue: where the thread goes next, then what sits beside the last idea.
  const onward = last ? [resume?.id, ...byId[last].rel.map(([x]) => x)].filter((x, i, a): x is string => !!x && !!byId[x] && a.indexOf(x) === i && x !== idea.id).slice(0, 4) : [];
  // Ideas worth exploring: not yet explored, those near what you've been reading first.
  const worth = CONCEPTS.filter(x => x.id !== idea.id && !explored.includes(x.id) && !onward.includes(x.id)).sort((a, b) => Number(lean ? b.th.includes(lean) : 0) - Number(lean ? a.th.includes(lean) : 0)).slice(0, 8);

  return (
    <Screen>
      <View style={{ paddingHorizontal: 20, paddingBottom: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Press onPress={() => router.push('/about')} accessibilityRole="link" accessibilityLabel="About LIMEN">
          <Wordmark size={24} />
        </Press>
        <StreakChip n={streak} />
      </View>

      <View>
        <View style={{ paddingHorizontal: 20, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <T v="display" size={26}>People worth meeting</T>
          <Press onPress={() => router.push('/thinkers')} hitSlop={8}><T v="uiStrong" size={14} color={c.accent}>See all</T></Press>
        </View>
        <Carousel itemW={176} gap={14}>{people.map(k => <ThinkerCard key={k} k={k} width={176} />)}</Carousel>
      </View>

      <View style={{ marginTop: 44 }}>
        <View style={{ paddingHorizontal: 20, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <T v="display" size={26}>Books to read</T>
          <Press onPress={() => router.push('/shelf')} hitSlop={8}><T v="uiStrong" size={14} color={c.accent}>See all</T></Press>
        </View>
        <Carousel itemW={150} gap={14}>{reads.map(b => <BookCover key={b.id} b={b} width={150} />)}</Carousel>
      </View>

      <View style={{ marginTop: 44, gap: 4 }}>
        <T v="label" style={{ paddingHorizontal: 20 }}>{first ? 'Start here' : goalMet ? 'If you want one more' : 'Your next idea'}</T>
        <ConceptRow c={idea} first />
        <View style={{ paddingHorizontal: 20, marginTop: 8 }}><Button full label={first ? 'Start your first idea' : 'Start'} icon="arrow-right" onPress={() => openConcept(idea.id, path.id)} /></View>
      </View>

      {trail.length ? (
      <View style={{ marginTop: 48 }}>
        <View style={{ paddingHorizontal: 20, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <T v="label">Your path</T>
            <T v="display" size={24} style={{ marginTop: 4 }}>{path.t}</T>
          </View>
          <Press onPress={() => router.push('/threads')} hitSlop={8}><T v="uiStrong" size={14} color={c.accent}>All paths</T></Press>
        </View>
        <T v="caption" size={14} color={c.ink2} style={{ paddingHorizontal: 20, marginTop: 6 }}>{path.c.filter(x => explored.includes(x)).length} of {path.c.length} done. Tap the red circle to continue.</T>
        <View style={{ marginTop: 10, alignItems: 'center' }}>
          <PathRoad path={path} width={W - 40} done={id => explored.includes(id)} onOpen={id => openConcept(id, path.id)} />
        </View>
      </View>
      ) : null}

      <View style={{ marginTop: 56 }}>
        <EditorialCard tone="red" kicker={`Still debated · ${idea.t}`} text={idea.tension.note || idea.dek} width={W} onPress={() => openConcept(idea.id, path.id)} />
        <T v="caption" size={13.5} color={c.ink2} style={{ paddingHorizontal: 20, marginTop: 10 }}>Thinkers still disagree about this one. Tap to read the idea behind it.</T>
      </View>

      <Card variant="tint" tint="#172C68" radius={shape.xl} pad={space.lg} style={{ marginTop: 34, marginHorizontal: space.lg }}>
        <T v="label" color="#B9C6E8" style={{ marginBottom: 14 }}>Worth rereading</T>
        <Passage q={quoteToday(trail)} flat onDark />
      </Card>

    </Screen>
  );
}

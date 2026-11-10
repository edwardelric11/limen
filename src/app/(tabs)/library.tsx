import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { bookById, byId, nextAfter, quoteById, TENSIONS } from '@/data';
import { useProgress } from '@/lib/progress';
import { shape } from '@/ui/theme';
import { useNotebook } from '@/lib/notebook';
import { useTrail } from '@/lib/trail';
import { ProgressCard } from '@/ui/cards';
import { BookRow, ConceptRow, Empty, openConcept, openStand, Passage, Screen } from '@/ui/blocks';
import { Press, Rule, Segmented, T } from '@/ui/kit';
import { useTheme } from '@/ui/theme';

const fmt = (n: number) => new Date(n).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

// Everything here is yours and stays on this phone.
export default function Library() {
  const { c } = useTheme();
  const [tab, setTab] = useState<'saved' | 'reading' | 'thoughts' | 'history'>('saved');
  const nb = useNotebook();
  const { trail, clear } = useTrail();
  const savedBooks = Object.keys(nb.saved).filter(id => bookById[id]).sort((a, b) => nb.saved[b] - nb.saved[a]);
  const startedBooks = Object.keys(nb.flags).filter(k => k.startsWith('b:') && bookById[k.slice(2)]).map(k => bookById[k.slice(2)]);
  const inProgress = [...trail].reverse().filter(id => !nb.flags['x:' + id]).slice(0, 4);
  const saved = Object.keys(nb.saved).filter(id => byId[id]).sort((a, b) => nb.saved[b] - nb.saved[a]);
  const stances = TENSIONS.filter(t => nb.positions[t.c]).sort((a, b) => nb.positions[b.c].at - nb.positions[a.c].at);
  const examples = Object.keys(nb.notes).filter(id => byId[id]).sort((a, b) => nb.notes[b].at - nb.notes[a].at);
  const passages = Object.keys(nb.passages ?? {}).filter(id => quoteById[id]).sort((a, b) => nb.passages[b] - nb.passages[a]);
  const history = [...trail].reverse();
  const progress = useProgress();
  const upNext = trail.length ? nextAfter(trail[trail.length - 1], trail) : null;
  const stats = [progress.explored.length && `${progress.explored.length} idea${progress.explored.length > 1 ? 's' : ''} explored`, progress.thinkers.length && `${progress.thinkers.length} thinker${progress.thinkers.length > 1 ? 's' : ''}`, progress.books.length && `${progress.books.length} book${progress.books.length > 1 ? 's' : ''} started`, progress.passages && `${progress.passages} passage${progress.passages > 1 ? 's' : ''} kept`].filter(Boolean).join(' · ');

  return (
    <Screen title="Your Library" sub="What you've kept. It stays on this phone.">
      <View style={{ paddingHorizontal: 20, paddingBottom: 18 }}>
        <Segmented value={tab} onChange={setTab} options={[{ key: 'saved', label: 'Kept' }, { key: 'reading', label: 'Reading' }, { key: 'thoughts', label: 'Notes' }, { key: 'history', label: 'History' }]} />
      </View>

      {tab === 'saved' ? (
        saved.length || passages.length || savedBooks.length ? (
          <>
            {saved.map((id, i) => <ConceptRow key={id} c={byId[id]} first={i === 0} meta="none" />)}
            {savedBooks.length ? (
              <View style={{ marginTop: saved.length ? 30 : 0 }}>
                <T v="title" size={19} style={{ paddingHorizontal: 20, marginBottom: 2 }}>Books</T>
                {savedBooks.map((id, i) => <BookRow key={id} b={bookById[id]} first={i === 0} />)}
              </View>
            ) : null}
            {passages.length ? (
              <View style={{ marginTop: saved.length ? 34 : 0, gap: 26 }}>
                <T v="title" size={19} style={{ paddingHorizontal: 20, marginBottom: -8 }}>Saved passages</T>
                {passages.map(id => <Passage key={id} q={quoteById[id]} />)}
              </View>
            ) : null}
            <Press onPress={() => router.push('/passages')} style={{ paddingHorizontal: 20, paddingVertical: 22 }}><T v="uiStrong" size={15} color={c.accent}>Browse all passages →</T></Press>
          </>
        ) : <Empty title="Nothing kept yet." body="Keep an idea or a passage when it stays with you." action="Browse ideas" onAction={() => router.navigate('/explore')} />
      ) : tab === 'reading' ? (
        startedBooks.length || inProgress.length ? (
          <>
            {startedBooks.map((b, i) => <BookRow key={b.id} b={b} first={i === 0} />)}
            {inProgress.length ? (
              <View style={{ marginTop: startedBooks.length ? 30 : 0 }}>
                <T v="title" size={19} style={{ paddingHorizontal: 20, marginBottom: 2 }}>Ideas you started</T>
                {inProgress.map((id, i) => <ConceptRow key={id} c={byId[id]} first={i === 0} />)}
              </View>
            ) : null}
          </>
        ) : <Empty title="Nothing in progress." body="Books and ideas you start will wait here." action="Browse ideas" onAction={() => router.navigate('/explore')} />
      ) : tab === 'thoughts' ? (
        <>
          <T v="title" size={17} style={{ paddingHorizontal: 20, marginBottom: 4 }}>Where you stand</T>
          {stances.length ? stances.map((t, i) => {
            const p = nb.positions[t.c];
            return (
              <View key={t.c}>
                {i ? <Rule /> : null}
                <Press onPress={() => openStand(t.c)} style={{ paddingHorizontal: 20, paddingVertical: 14, gap: 4 }}>
                  <T v="title" size={17}>{t.q}</T>
                  <T v="caption" color={c.ink2}>{p.side === 'a' ? `With ${t.a[0]}` : p.side === 'b' ? `With ${t.b[0]}` : 'Your own view'} · {fmt(p.at)}</T>
                  {p.words ? <T v="body" size={15} numberOfLines={2}>“{p.words}”</T> : null}
                </Press>
              </View>
            );
          }) : <Empty title="No positions yet." body="Some ideas end in a real argument. Pick a side and read the best objection." />}
          <T v="title" size={17} style={{ paddingHorizontal: 20, marginTop: 28, marginBottom: 4 }}>Your notes</T>
          {examples.length ? examples.map((id, i) => (
            <View key={id}>
              {i ? <Rule /> : null}
              <Press onPress={() => openConcept(id)} style={{ paddingHorizontal: 20, paddingVertical: 14, gap: 4 }}>
                <T v="title" size={17}>{byId[id].t}</T>
                <T v="body" size={15} numberOfLines={3}>{nb.notes[id].text}</T>
                <T v="caption">{fmt(nb.notes[id].at)}</T>
              </Press>
            </View>
          )) : <Empty title="Your notes will live here." body="Write one where an idea meets your own life." />}
        </>
      ) : (
        history.length ? (
          <>
            <ProgressCard ideas={progress.explored.length} thinkers={progress.thinkers.length} books={progress.books.length} />
            <View style={{ paddingHorizontal: 20 }}>
              {history.slice(0, 7).reverse().map((id, i, arr) => (
                <Press key={id} onPress={() => openConcept(id)} accessibilityRole="link" style={{ flexDirection: 'row', gap: 16 }}>
                  <View style={{ alignItems: 'center', width: 10 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, marginTop: 9, backgroundColor: progress.isExplored(id) || i === arr.length - 1 ? c.sage : c.stone }} />
                    {i < arr.length - 1 ? <View style={{ width: 1, flex: 1, backgroundColor: c.rule, marginTop: 4 }} /> : null}
                  </View>
                  <View style={{ flex: 1, paddingBottom: 20, gap: 2 }}>
                    <T v="title" size={17}>{byId[id].t}</T>
                    <T v="caption" size={13.5} color={progress.isExplored(id) ? c.sageInk : undefined}>{progress.isExplored(id) ? 'Explored' : 'Started'}</T>
                  </View>
                </Press>
              ))}
            </View>
            {upNext ? (
              <Press onPress={() => openConcept(upNext.id)} accessibilityRole="link" style={{ marginTop: 10, marginHorizontal: 20, paddingTop: 20, gap: 4 }}>
                <T v="label">Where next?</T>
                <T v="title" size={19}>{byId[upNext.id].t} →</T>
                <T v="caption">{upNext.why}</T>
              </Press>
            ) : null}
            <Press onPress={clear} style={{ paddingHorizontal: 20, paddingVertical: 22 }}><T v="ui" size={14} color={c.ink3}>Clear my path</T></Press>
          </>
        ) : <Empty title="Nothing explored yet." body="Your path appears as you read." action="Browse ideas" onAction={() => router.navigate('/explore')} />
      )}
    </Screen>
  );
}

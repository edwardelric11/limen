import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Animated, KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { booksFor, byId, minutesOf, nextAfter, pathById, quotesFor, TENSIONS, THINKERS } from '@/data';
import { useNotebook } from '@/lib/notebook';
import { useTrail } from '@/lib/trail';
import { openConcept, openBook, openStand, openThinker, Passage, TensionBlock } from '@/ui/blocks';
import { DIAGRAM_OF, Diagram, Interlude, PullQuote } from '@/ui/art';
import { Cover } from '@/ui/cover';
import { Button, Chip, Icon, KeepIcon, Meta, Press, Reveal, Rule, T, ThreadLine } from '@/ui/kit';
import { dur, ease } from '@/ui/motion';
import { font, READ_MAX, shape, type, useAppWidth, useTheme } from '@/ui/theme';

// A concept is read, not swiped. It opens on the idea; each further layer appears only when asked for.
export default function Concept() {
  const { id, path } = useLocalSearchParams<{ id: string; path?: string }>();
  const c = byId[id];
  const { c: col } = useTheme();
  const insets = useSafeAreaInsets();
  const W = useAppWidth();
  const { trail, visit } = useTrail();
  const nb = useNotebook();
  const scroller = useRef<ScrollView>(null);
  const ys = useRef<Record<number, number>>({});
  const prog = useRef(new Animated.Value(0)).current;
  const dims = useRef({ h: 1, v: 1 });
  const setProg = (y: number) => Animated.timing(prog, { toValue: Math.min(1, Math.max(0, y / Math.max(1, dims.current.h - dims.current.v))), duration: dur.micro, easing: ease.standard, useNativeDriver: true }).start();
  const [shown, setShown] = useState(0); // index of the deepest layer revealed
  const [draft, setDraft] = useState(nb.notes[id]?.text ?? '');
  useEffect(() => { if (c) visit(c.id); }, [c, visit]);
  useEffect(() => { if (c && shown >= 4) nb.completeIdea(c.id); }, [c, shown]); // eslint-disable-line react-hooks/exhaustive-deps
  const next = useMemo(() => (c ? nextAfter(c.id, trail, path) : null), [c, trail, path]);
  if (!c || !next) return null;

  const isDebate = TENSIONS.some(x => x.c === c.id);
  const books = booksFor(c.id).slice(0, 2);
  const others = c.rel.filter(([x]) => x !== next.id).slice(0, 2);
  const saved = !!nb.saved[c.id];
  const quote = quotesFor(c.id)[0];

  const Label = ({ children }: { children: string }) => <T v="label" size={12} style={{ marginBottom: 14 }}>{children}</T>;
  const Layer = ({ i, children }: { i: number; children: ReactNode }) => (
    <Reveal><View onLayout={e => { ys.current[i] = e.nativeEvent.layout.y; }} style={{ marginTop: 40 }}>{children}</View></Reveal>
  );
  const More = ({ label, to }: { label: string; to: number }) => shown === to - 1 ? (
    <Press onPress={() => setShown(to)} accessibilityRole="button" style={{ marginTop: 32, height: 52, borderRadius: shape.md, backgroundColor: col.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <T v="uiStrong" size={16.5} color={col.onAccent}>{label}</T>
      <Icon name="arrow-down" tone="onAccent" />
    </Press>
  ) : null;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: col.bg }}>
      <ScrollView ref={scroller} scrollEventThrottle={32} onScroll={e => setProg(e.nativeEvent.contentOffset.y)} onContentSizeChange={(_, h) => { dims.current.h = h; }} onLayout={e => { dims.current.v = e.nativeEvent.layout.height; }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}>
        <View>
          <Cover seed={c.id} size={W} radius={0} ratio={0.78} />
        </View>
        <View style={{ width: '100%', maxWidth: READ_MAX, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 20 }}>
          <Meta st={c.st} extra={`${nb.flags['x:' + c.id] ? 'Explored · ' : ''}${minutesOf(c)} min${path && pathById[path] ? ` · ${pathById[path].t} ${pathById[path].c.indexOf(c.id) + 1}/${pathById[path].c.length}` : ''}`} />
          <T v="display" size={type.display.h1} accessibilityRole="header" style={{ marginTop: 10 }}>{c.t}</T>
          <T v="dek" size={18} style={{ marginTop: 12 }}>{c.dek}</T>

          <View style={{ marginTop: 30 }}>
            <Label>The idea</Label>
            {(() => { const m = c.idea.match(/^(.+?[.!?])\s+(.*)$/s); return m ? (<>
              <T v="display" size={type.intro.size} style={{ lineHeight: type.intro.size * type.intro.leading, marginBottom: 16 }}>{m[1]}</T>
              <T v="body" size={type.read.size} style={{ lineHeight: type.read.size * type.read.leading }}>{m[2]}</T>
            </>) : <T v="body" size={type.read.size} style={{ lineHeight: type.read.size * type.read.leading }}>{c.idea}</T>; })()}
            {DIAGRAM_OF[c.id] ? <View style={{ marginTop: 24 }}><Diagram name={DIAGRAM_OF[c.id]} width={W - 40} /></View> : null}
          </View>
          <More label="How it works" to={1} />

          {shown >= 1 ? (
            <Layer i={1}>
              <Label>How it works</Label>
              {c.mech ? <T v="body" size={type.read.size} style={{ lineHeight: type.read.size * type.read.leading, marginBottom: 20 }}>{c.mech}</T> : null}
              <T v="bodyLg" size={20} style={{ lineHeight: 30 }}>{c.insight}</T>
            </Layer>
          ) : null}
          {shown >= 1 ? <View style={{ marginTop: 40, marginHorizontal: -20 }}><Interlude text={c.why} width={W} /></View> : null}
          <More label="In practice" to={2} />

          {shown >= 2 ? (
            <Layer i={2}>
              <Label>In practice</Label>
              <View style={{ gap: 20 }}>
                {c.life.map((l, i) => <T key={i} v="body" size={type.read.size} style={{ lineHeight: type.read.size * type.read.leading }}>{l}</T>)}
              </View>
              {quote ? (
                <View style={{ marginTop: 34 }}>
                  <T v="label" size={12} style={{ marginBottom: 12 }}>Said well</T>
                  <Passage q={quote} here={c.id} flat />
                </View>
              ) : null}
              <View style={{ marginTop: 36, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#DAD6CC', gap: 10 }}>
                <T v="uiStrong" size={16}>Where have you seen this?</T>
                <T v="caption" size={14} color={col.ink2}>Write a moment from your own life. It stays on this phone and appears in your Library under notes.</T>
                <TextInput value={draft} onChangeText={setDraft} multiline
                  placeholder="At work, at home, in yourself…" placeholderTextColor={col.ink3} accessibilityLabel="Your own example"
                  style={{ minHeight: 96, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#DAD6CC', color: col.ink, fontFamily: font.regular, fontSize: 16, lineHeight: 24, textAlignVertical: 'top' }} />
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <T v="caption" size={13} color={col.ink3}>{draft.trim() === (nb.notes[id]?.text ?? '').trim() ? (draft.trim() ? 'Saved' : '') : 'Not saved yet'}</T>
                  <Chip label="Save" selected={draft.trim() !== (nb.notes[id]?.text ?? '').trim()} onPress={() => nb.setNote(c.id, draft.trim())} />
                </View>
              </View>
            </Layer>
          ) : null}
          <More label="The tension" to={3} />

          {shown >= 3 ? (
            <Layer i={3}>
              <Label>The tension</Label>
              <TensionBlock sides={c.tension.sides} note={c.tension.note} />
              {c.lim ? (
                <View style={{ marginTop: 26 }}>
                  <T v="label" size={12} style={{ marginBottom: 6 }}>What this doesn’t explain</T>
                  <T v="body" size={type.read.size} color={col.ink2} style={{ lineHeight: type.read.size * type.read.leading }}>{c.lim}</T>
                </View>
              ) : null}
              {isDebate ? (
                <Press onPress={() => openStand(c.id)} hitSlop={10} style={{ marginTop: 22, alignSelf: 'flex-start', paddingVertical: 6 }}>
                  <T v="uiStrong" size={16} color={col.accent}>{nb.positions[c.id] ? 'See where you stood' : 'Where do you stand?'}</T>
                </Press>
              ) : null}
            </Layer>
          ) : null}
          <More label="Follow the thread" to={4} />

          {shown >= 4 ? (
            <Layer i={4}>
              <View style={{ marginHorizontal: -20, marginBottom: 34 }}><PullQuote text={c.tension.note || c.why} width={W} seed={c.id.length} /></View>
              <Label>Follow the thread</Label>
              <T v="caption" size={15} color={col.ink2} style={{ marginBottom: 16, lineHeight: 22 }}>Ideas connect. Here is where this one leads next; tap to go there.</T>
              <Press onPress={() => openConcept(next.id, path)} accessibilityRole="link" style={{ gap: 4, paddingBottom: 18 }}>
                <T v="caption" size={15} color={col.accent}>You've just read</T>
                <T v="caption" size={15}>{c.t}</T>
                <ThreadLine />
                <T v="caption" size={15} color={col.ink2}>{next.why}</T>
                <T v="display" size={28}>{byId[next.id].t}</T>
              </Press>
              {others.map(([x, why]) => (
                <View key={x}>
                  <Rule inset={0} />
                  <Press onPress={() => openConcept(x)} style={{ paddingVertical: 14, gap: 2 }}>
                    <T v="title" size={19}>{byId[x].t}</T>
                    <T v="caption" numberOfLines={1}>{why}</T>
                  </Press>
                </View>
              ))}
              {c.k[1] && THINKERS[c.k[1]] ? (
                <Press onPress={() => openThinker(c.k[1])} accessibilityRole="link" style={{ paddingTop: 18, gap: 2 }}>
                  <T v="caption" size={13.5}>Another view</T>
                  <T v="uiStrong" size={16.5} color={col.accent}>Try {THINKERS[c.k[1]].n} →</T>
                </Press>
              ) : null}
              {c.k.length || books.length ? <Rule inset={0} /> : null}
              {c.k.slice(0, 1).map(k => (
                <Press key={k} onPress={() => openThinker(k)} style={{ paddingVertical: 14, gap: 2 }}>
                  <T v="label" size={10.5}>Thinker</T>
                  <T v="title" size={19}>{THINKERS[k].n}</T>
                  <T v="caption" numberOfLines={1}>{THINKERS[k].f}</T>
                </Press>
              ))}
              {books.slice(0, 1).map(b => (
                <Press key={b.id} onPress={() => openBook(b.id)} style={{ paddingVertical: 14, gap: 2 }}>
                  <T v="label" size={10.5}>Book</T>
                  <T v="title" size={19}>{b.t}</T>
                  <T v="caption" numberOfLines={1}>{b.a}</T>
                </Press>
              ))}
              <View style={{ marginTop: 34 }}>
                <Button label="Finish this idea" icon="check" onPress={() => router.push({ pathname: '/done', params: { id: c.id, ...(path ? { path } : {}) } })} />
              </View>
            </Layer>
          ) : null}
        </View>
      </ScrollView>
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, overflow: 'hidden' }}>
        <Animated.View style={{ width: W, height: 2, backgroundColor: col.sage, transform: [{ translateX: prog.interpolate({ inputRange: [0, 1], outputRange: [-W, 0] }) }] }} />
      </View>
          <View style={{ position: 'absolute', top: insets.top + 10, left: 14, right: 14, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 }} pointerEvents="box-none">
            <Press onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#17191C', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="back" size="lg" tone="onAccent" />
            </Press>
            <Press onPress={() => nb.toggleSave(c.id)} accessibilityRole="button" accessibilityLabel={saved ? 'Remove from kept' : 'Keep this idea'} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#17191C', alignItems: 'center', justifyContent: 'center' }}>
              <KeepIcon kept={saved} size="lg" rest="onAccent" />
            </Press>
          </View>
</KeyboardAvoidingView>
  );
}

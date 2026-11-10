import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BOOKS, byId, DEPTH, DISC, inboundOf, STATUS, TENSIONS, THINKERS } from '@/data';
import { useNotebook } from '@/lib/notebook';
import { useTrail } from '@/lib/trail';
import { Constellation, openBook, openConcept, openStand, openTheme, openThinker, Screen, TensionBlock } from '@/ui/blocks';
import { Press, StatusTag, T } from '@/ui/kit';
import { font, shape, useTheme } from '@/ui/theme';

function Section({ label, children }: { label: string; children: ReactNode }) {
  return <View style={{ marginTop: 32, gap: 10 }}><T v="label">{label}</T>{children}</View>;
}
function Tags({ items }: { items: { label: string; onPress: () => void }[] }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {items.map(i => (
        <Press key={i.label} onPress={i.onPress} style={{ paddingHorizontal: 14, height: 36, justifyContent: 'center', borderRadius: shape.full, backgroundColor: c.surfaceHigh }}>
          <T v="ui" size={14}>{i.label}</T>
        </Press>
      ))}
    </View>
  );
}

// Everything about one idea on a single scrolling page, for reference.
export default function Notes() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = byId[id];
  const { c: col } = useTheme();
  const insets = useSafeAreaInsets();
  const { visit, has } = useTrail();
  const { notes, setNote, positions } = useNotebook();
  const [draft, setDraft] = useState(notes[id]?.text ?? '');
  useEffect(() => { if (c) visit(c.id); }, [c, visit]);
  if (!c) return <Screen back><T v="dek" style={{ padding: 20 }}>That idea isn’t in the library.</T></Screen>;

  const books = BOOKS.filter(b => b.c.includes(c.id));
  const back = inboundOf(c.id).filter(([f]) => !c.rel.some(r => r[0] === f)).slice(0, 3);
  const leads = [...c.rel.map(([to, why]) => ({ to, why, dir: 'out' })), ...back.map(([to, why]) => ({ to, why: `Points back here: ${why.charAt(0).toLowerCase()}${why.slice(1)}`, dir: 'in' }))];
  const isDebate = TENSIONS.some(x => x.c === c.id);

  return (
    <View style={{ flex: 1 }}>
      <Screen back bottom={40} automaticallyAdjustKeyboardInsets>
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <StatusTag st={c.st} />
            <T v="label">{c.d.map(d => DISC[d]).join(' · ')} · {DEPTH[c.lvl]}</T>
          </View>
          <T v="display" size={38} accessibilityRole="header">{c.t}</T>
          <T v="dek" size={20}>{c.dek}</T>

          <Section label="The idea"><T v="body">{c.idea}</T></Section>
          <View style={{ marginTop: 32, gap: 10, padding: 18, borderRadius: shape.lg, backgroundColor: col.surface }}>
            <T v="label" color={col.accent}>The idea</T>
            <T v="bodyLg">{c.insight}</T>
          </View>
          <Section label="Why it stays with you"><T v="body">{c.why}</T></Section>
          <Section label="In real life">
            {c.life.map((l, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 12, paddingVertical: 10 }}>
                <T v="body" color={col.ink3}>–</T>
                <T v="body" style={{ flex: 1 }}>{l}</T>
              </View>
            ))}
          </Section>
          <Section label="Your example">
            <T v="caption">Where have you seen this? Only you read it.</T>
            <TextInput value={draft} onChangeText={setDraft} onBlur={() => setNote(c.id, draft)} onEndEditing={() => setNote(c.id, draft)} multiline
              placeholder="The last time I noticed this was…" placeholderTextColor={col.ink3} accessibilityLabel="Your example"
              style={{ minHeight: 96, padding: 14, borderRadius: shape.md, backgroundColor: col.surface, color: col.ink, fontFamily: font.regular, fontSize: 16.5, lineHeight: 24, textAlignVertical: 'top' }} />
          </Section>
          <Section label="The tension">
            <TensionBlock sides={c.tension.sides} note={c.tension.note} />
            {isDebate ? (
              <Press haptic onPress={() => openStand(c.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 }}>
                <T v="uiStrong" size={15} color={col.accent}>{positions[c.id] ? 'Your position, and the pushback' : 'Where do you stand?'}</T>
              </Press>
            ) : null}
          </Section>
          <Section label="Constellation">
            <View style={{ backgroundColor: col.surface, borderRadius: shape.lg, paddingVertical: 8, overflow: 'hidden' }}><Constellation c={c} /></View>
            <T v="caption">Tap an idea to go there.</T>
          </Section>
          <Section label="Where this leads">
            {leads.map(({ to, why, dir }) => (
              <Press key={to + dir} onPress={() => openConcept(to)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <T v="title" size={18}>{byId[to].t}</T>
                  <T v="caption" color={col.ink2}>{why}</T>
                </View>
                {has(to) ? <T v="label">Read</T> : null}
              </Press>
            ))}
          </Section>
          <Section label="Thinkers"><Tags items={c.k.map(k => ({ label: THINKERS[k].n, onPress: () => openThinker(k) }))} /></Section>
          <Section label="Themes"><Tags items={c.th.map(t => ({ label: t, onPress: () => openTheme(t) }))} /></Section>
          <Section label="Go deeper">
            {c.deeper.map(([t, by, why]) => (
              <View key={t} style={{ paddingVertical: 10, gap: 2 }}>
                <T v="body" style={{ fontFamily: font.medium }}>{t}</T>
                <T v="caption">{by}{why ? ` · ${why}` : ''}</T>
              </View>
            ))}
            {books.map(b => (
              <Press key={b.id} onPress={() => openBook(b.id)} style={{ paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <T v="body" style={{ fontFamily: font.medium }}>{b.t}</T>
                  <T v="caption">{b.a} · On the bookshelf</T>
                </View>
              </Press>
            ))}
          </Section>
          <Press onPress={() => router.push('/labels')} style={{ marginTop: 26, flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
            <T v="caption" style={{ flex: 1 }}>{STATUS[c.st].label}: {STATUS[c.st].desc}</T>
          </Press>
        </View>
      </Screen>

    </View>
  );
}

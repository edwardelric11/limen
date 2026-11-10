import { useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { bookById, byId, pathById } from '@/data';
import { useTrail } from '@/lib/trail';
import { BookCover, MIN_PER_IDEA, openConcept, Screen } from '@/ui/blocks';
import { Cover } from '@/ui/cover';
import { Button, Icon, Press, T } from '@/ui/kit';
import { shape, useAppWidth, useTheme } from '@/ui/theme';

// A path is a short, ordered sequence of connected ideas: the easiest way into a subject.
export default function PathScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const p = pathById[id];
  const { c } = useTheme();
  const W = useAppWidth();
  const { has } = useTrail();
  if (!p) return <Screen back><T v="dek" style={{ padding: 20 }}>That path isn’t here.</T></Screen>;
  const done = p.c.filter(has).length;
  const nextIdx = p.c.findIndex(x => !has(x));
  const start = nextIdx === -1 ? 0 : nextIdx;

  return (
    <Screen back bottom={40}>
      <View style={{ paddingHorizontal: 20, gap: 14 }}>
        <Cover seed={`path-${p.id}`} size={W - 40} radius={shape.lg} wide />
        <T v="label">Path · {p.c.length} ideas · {p.c.length * MIN_PER_IDEA} min</T>
        <T v="display" size={32} accessibilityRole="header">{p.t}</T>
        <T v="bodyLg" size={18} color={c.ink2}>{p.line}</T>
        <Button label={done === 0 ? 'Start' : done === p.c.length ? 'Read again' : `Continue with ${byId[p.c[start]].t}`} icon="arrow-right" onPress={() => openConcept(p.c[start], p.id)} />
      </View>

      {/* The sequence. Numbers are meaningful here: order is the point of a path. */}
      <View style={{ marginTop: 28, paddingHorizontal: 20 }}>
        {p.c.map((cid, i) => {
          const read = has(cid); const isNext = i === start && done < p.c.length;
          return (
            <Press key={cid} onPress={() => openConcept(cid, p.id)} accessibilityRole="link" style={{ flexDirection: 'row', gap: 14 }}>
              <View style={{ alignItems: 'center', width: 28 }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: read ? c.sage : isNext ? c.tintSage : c.surfaceHigh }}>
                  {read ? <Icon name="check" size="sm" tone="onAccent" /> : <T v="uiStrong" size={13} color={isNext ? c.accent : c.ink2}>{i + 1}</T>}
                </View>
                {i < p.c.length - 1 ? <View style={{ width: 2, flex: 1, minHeight: 20, backgroundColor: read ? c.accent : c.surfaceHigh, marginVertical: 4 }} /> : null}
              </View>
              <View style={{ flex: 1, paddingBottom: 22, gap: 3 }}>
                <T v="title" size={17}>{byId[cid].t}</T>
                <T v="caption" color={c.ink2}>{byId[cid].dek}</T>
              </View>
            </Press>
          );
        })}
      </View>

      {p.b.length ? (
        <View style={{ marginTop: 16, gap: 12 }}>
          <T v="label" style={{ paddingHorizontal: 20 }}>Go further</T>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
            {p.b.map(bid => <BookCover key={bid} b={bookById[bid]} width={120} />)}
          </ScrollView>
        </View>
      ) : null}
    </Screen>
  );
}

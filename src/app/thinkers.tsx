import { useMemo, useState } from 'react';
import { Platform, TextInput, View } from 'react-native';

import { allThinkers, groupOfThinker, THINKERS } from '@/data';
import { Screen, ThinkerRow } from '@/ui/blocks';
import { Chip, Icon, Press, T } from '@/ui/kit';
import { font, useTheme } from '@/ui/theme';

// Everyone in the library, alphabetical. Search first; one lightweight filter.
export default function Thinkers() {
  const { c } = useTheme();
  const [q, setQ] = useState('');
  const [g, setG] = useState('All');
  const [n, setN] = useState(15);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return allThinkers().filter(k => (g === 'All' || groupOfThinker(k) === g) && (s.length < 2 || `${THINKERS[k].n} ${THINKERS[k].tag ?? ''} ${(THINKERS[k].tr ?? []).join(' ')}`.toLowerCase().includes(s)));
  }, [q, g]);
  return (
    <Screen back title="Thinkers" bottom={40} onEnd={() => setN(v => Math.min(v + 30, list.length))} pinned={<>
      <View style={{ marginHorizontal: 20, height: 48, borderRadius: 24, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10, marginBottom: 10 }}>
        <Icon name="search" tone="muted" size="lg" />
        <TextInput value={q} onChangeText={t => { setQ(t); setN(15); }} placeholder="A name, or a tradition" placeholderTextColor={c.ink3} autoCorrect={false} accessibilityLabel="Search thinkers"
          style={{ flex: 1, fontSize: 16.5, color: c.ink, fontFamily: font.regular, paddingVertical: 0, ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null) }} />
      </View>
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 12 }}>
        {['All', 'Psychology', 'Philosophy', 'Society'].map(t => <Chip key={t} label={t} selected={g === t} onPress={() => { setG(t); setN(15); }} />)}
      </View>
    </>}>
      {list.slice(0, n).map((k, i) => <ThinkerRow key={k} k={k} first={i === 0} />)}
      {!list.length ? <T v="dek" style={{ paddingHorizontal: 20 }}>No one by that name.</T> : null}
    </Screen>
  );
}

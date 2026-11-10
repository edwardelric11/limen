import { useMemo, useState } from 'react';
import { Platform, TextInput, View } from 'react-native';

import { byId, PRIMARY_THEMES, QUOTES } from '@/data';
import { useNotebook } from '@/lib/notebook';
import { Passage, Screen } from '@/ui/blocks';
import { Chip, Icon, Press, T } from '@/ui/kit';
import { font, useTheme } from '@/ui/theme';

// Every passage in the library. Curated ones come first; search by words or by writer.
export default function Passages() {
  const { c } = useTheme();
  const [q, setQ] = useState('');
  const [n, setN] = useState(12);
  const nb = useNotebook();
  const [kept, setKept] = useState(false);
  const [th, setTh] = useState('');
  const list = useMemo(() => { const s = q.trim().toLowerCase(); return QUOTES.filter(x => (!kept || nb.passages?.[x.id]) && (!th || x.c?.some(id => byId[id]?.th.includes(th))) && (s.length < 2 || x.q.toLowerCase().includes(s) || x.a.toLowerCase().includes(s) || (x.s ?? '').toLowerCase().includes(s))); }, [q, kept, th, nb.passages]);
  return (
    <Screen back title="Passages" bottom={40} onEnd={() => setN(v => Math.min(v + 12, list.length))} pinned={<>
      <View style={{ marginHorizontal: 20, height: 48, borderRadius: 24, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10, marginBottom: 10 }}>
        <Icon name="search" tone="muted" size="lg" />
        <TextInput value={q} onChangeText={t => { setQ(t); setN(12); }} placeholder="A word, a writer, a book" placeholderTextColor={c.ink3} autoCorrect={false} accessibilityLabel="Search passages"
          style={{ flex: 1, fontSize: 16.5, color: c.ink, fontFamily: font.regular, paddingVertical: 0, ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null) }} />
      </View>
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 12 }}>
        <Chip label="All" selected={!kept && !th} onPress={() => { setKept(false); setTh(''); setN(12); }} />
        <Chip label="Kept" selected={kept} onPress={() => { setKept(!kept); setN(12); }} />
        {th ? <Chip label={`${th} ✕`} selected onPress={() => setTh('')} /> : null}
      </View>
    </>}>
      {!th ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, paddingHorizontal: 20, marginBottom: 20 }}>
          {PRIMARY_THEMES.map(t => <Press key={t} onPress={() => { setTh(t); setN(12); }} hitSlop={4} style={{ paddingVertical: 5 }}><T v="ui" size={14} color={c.accent}>{t}</T></Press>)}
        </View>
      ) : null}
      <View style={{ gap: 30 }}>
        {list.slice(0, n).map(x => <Passage key={x.id} q={x} />)}
      </View>
      {!list.length ? <T v="dek" style={{ paddingHorizontal: 20 }}>Nothing matches that.</T> : null}
    </Screen>
  );
}

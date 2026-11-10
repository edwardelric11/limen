import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { PRIMARY_THEMES, THEME_LINES, THEMES, themeCount } from '@/data';
import { openTheme, Screen } from '@/ui/blocks';
import { Cover } from '@/ui/cover';
import { Chip, Press, T } from '@/ui/kit';
import { font, shape, useAppWidth, useTheme } from '@/ui/theme';

// Every theme gets its own picture; the filters group them by what kind of question they are.
const GROUPS: Record<string, string[]> = {
  Feelings: ['Fear', 'Anger', 'Shame', 'Guilt', 'Envy', 'Loneliness', 'Suffering', 'Love', 'Desire'],
  Self: ['Identity', 'Ego', 'Self', 'Consciousness', 'Reality'],
  'Other people': ['Relationships', 'Sex', 'Belonging', 'Status'],
  'Work and ambition': ['Power', 'Money', 'Work', 'Ambition', 'Success', 'Failure'],
  'Big questions': ['Death', 'Meaning', 'Freedom', 'Time', 'Aging'],
};

export default function Themes() {
  const { c } = useTheme();
  const W = useAppWidth();
  const [g, setG] = useState('All');
  const all = [...PRIMARY_THEMES, ...THEMES.filter(t => !PRIMARY_THEMES.includes(t))];
  const list = g === 'All' ? all : all.filter(t => GROUPS[g]?.includes(t));
  const cw = (W - 40 - 14) / 2;
  return (
    <Screen back title="Themes" bottom={40} pinned={
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingBottom: 12 }}>
        {['All', ...Object.keys(GROUPS)].map(t => <Chip key={t} label={t} selected={g === t} onPress={() => setG(t)} />)}
      </ScrollView>
    }>
      <T v="dek" size={16} style={{ paddingHorizontal: 20, marginBottom: 18 }}>{g === 'All' ? `${all.length} themes. What are you trying to understand?` : `${list.length} themes`}</T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, paddingHorizontal: 20 }}>
        {list.map(t => (
          <Press key={t} onPress={() => openTheme(t)} accessibilityRole="link" accessibilityLabel={t} style={{ width: cw, borderRadius: shape.lg, overflow: 'hidden', borderWidth: 1, borderColor: c.rule, backgroundColor: c.bg }}>
            <Cover seed={`theme:${t}`} size={cw} ratio={0.78} radius={0} />
            <View style={{ padding: 12, paddingTop: 10, gap: 2 }}>
              <T v="display" size={19} style={{ lineHeight: 23, fontFamily: font.semibold }}>{t}</T>
              <T v="caption" size={12.5} numberOfLines={2} style={{ lineHeight: 17 }}>{THEME_LINES[t]}</T>
              <T v="label" size={10} style={{ marginTop: 4 }}>{themeCount(t)} {themeCount(t) === 1 ? 'idea' : 'ideas'}</T>
            </View>
          </Press>
        ))}
      </View>
    </Screen>
  );
}

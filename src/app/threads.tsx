import { View } from 'react-native';

import { PATHS } from '@/data';
import { MIN_PER_IDEA, openPath, Screen } from '@/ui/blocks';
import { Cover } from '@/ui/cover';
import { Press, T } from '@/ui/kit';
import { font, shape, useAppWidth, useTheme } from '@/ui/theme';

// A thread is a few ideas, read in a deliberate order.
export default function Threads() {
  const { c } = useTheme();
  const W = useAppWidth();
  return (
    <Screen back title="Threads" sub="A few ideas, in a deliberate order." bottom={40}>
      <View style={{ paddingHorizontal: 20, gap: 22 }}>
        {PATHS.map(p => (
          <Press key={p.id} onPress={() => openPath(p.id)} accessibilityRole="link" style={{ borderRadius: shape.xl, overflow: 'hidden', borderWidth: 1, borderColor: c.rule, backgroundColor: c.bg }}>
            <Cover seed={p.c[0]} size={W - 42} ratio={0.5} radius={0} />
            <View style={{ padding: 18, paddingTop: 16, gap: 4 }}>
              <T v="label" size={10.5}>{p.c.length} ideas · {p.c.length * MIN_PER_IDEA} min</T>
              <T v="display" size={24} style={{ lineHeight: 29, fontFamily: font.medium }}>{p.t}</T>
              <T v="caption" size={15} color={c.ink2}>{p.line}</T>
            </View>
          </Press>
        ))}
      </View>
    </Screen>
  );
}

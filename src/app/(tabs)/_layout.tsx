import { Tabs, type BottomTabBarProps } from 'expo-router/tabs';
import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Press, T } from '@/ui/kit';
import { elevation, font, useTheme } from '@/ui/theme';

const ITEMS: Record<string, { label: string; glyph: Glyph }> = {
  index: { label: 'Home', glyph: 'home' },
  explore: { label: 'Explore', glyph: 'explore' },
  library: { label: 'Library', glyph: 'library' },
  search: { label: 'Search', glyph: 'search' },
};

// Tab glyphs are drawn in the same vocabulary as the illustrations: flat forms, one vermilion bar crossing the line.
// At rest they are outlines in grey; active, the main form fills cobalt and the bar turns vermilion.
type Glyph = 'home' | 'explore' | 'library' | 'search';
// Material-style rounded outline icons: one stroke weight, round caps and joins, never filled. Active only changes colour.
function TabGlyph({ glyph, rest, on, active }: { glyph: Glyph; active: boolean; rest: string; on: string; bar?: string }) {
  const p = { fill: 'none', stroke: active ? on : rest, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24">
      {glyph === 'home' ? <>
        <Path {...p} d="M4 11.4 L11.1 5.1 A1.3 1.3 0 0 1 12.9 5.1 L20 11.4 V19 A1.5 1.5 0 0 1 18.5 20.5 H15 V15.5 A1 1 0 0 0 14 14.5 H10 A1 1 0 0 0 9 15.5 V20.5 H5.5 A1.5 1.5 0 0 1 4 19 Z" />
      </> : glyph === 'explore' ? <>
        <Circle {...p} cx={12} cy={12} r={9} />
        <Path {...p} d="M15.8 8.2 L13.5 13.5 L8.2 15.8 L10.5 10.5 Z" />
      </> : glyph === 'library' ? <>
        <Rect {...p} x={7} y={3} width={13} height={13} rx={2} />
        <Path {...p} d="M4 7.5 V18 A2 2 0 0 0 6 20 H16.5 M10.5 7.5 H16.5 M10.5 11 H14" />
      </> : <>
        <Circle {...p} cx={10.5} cy={10.5} r={6.5} />
        <Path {...p} d="M15.4 15.4 L20 20" />
      </>}
    </Svg>
  );
}

// A floating pill: detached from the edges, soft shadow, grey icons at rest. The active tab opens into a cobalt pill that carries its label.
const BAR_H = 64;
function TabBar({ state, navigation, insets }: BottomTabBarProps) {
  const { c } = useTheme();
  const routes = state.routes.filter(r => ITEMS[r.name]);
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: Math.max(insets.bottom, 12) , paddingHorizontal: 16 }}>
      <View style={{ height: BAR_H, borderRadius: BAR_H / 2, backgroundColor: '#FFFDF8', borderWidth: 1, borderColor: c.rule, flexDirection: 'row', alignItems: 'center', padding: 8, gap: 4, ...elevation.floating }}>
        {routes.map((r, i) => {
          const it = ITEMS[r.name];
          const focused = state.index === i;
          return (
            <Press key={r.key} haptic accessibilityRole="tab" accessibilityState={{ selected: focused }} accessibilityLabel={it.label}
              onPress={() => {
                const e = navigation.emit({ type: 'tabPress', target: r.key, canPreventDefault: true });
                if (!focused && !e.defaultPrevented) navigation.navigate(r.name, r.params);
              }}
              style={{ flex: focused ? 2.1 : 1, height: 48, borderRadius: 24, backgroundColor: focused ? c.sage : 'transparent', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              <TabGlyph glyph={it.glyph} active={focused} rest="#8A93A6" on="#FFFFFF" />
              {focused ? <T v="ui" size={13.5} color="#FFFFFF" numberOfLines={1} style={{ fontFamily: font.semibold }}>{it.label}</T> : null}
            </Press>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { c } = useTheme();
  return (
    <Tabs tabBar={p => <TabBar {...p} />} screenOptions={{ headerShown: false, animation: 'fade', sceneStyle: { backgroundColor: c.bg } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="library" />
      <Tabs.Screen name="search" />
    </Tabs>
  );
}

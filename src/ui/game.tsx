import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { byId, type Path as PathT } from '@/data';
import { Icon, Press, T } from './kit';
import { font, useTheme } from './theme';

const RED = '#E6533D';
const BLUE = '#3157D5';

/* The small progress language: a streak, a week of days, a path of stops. Calm on purpose: no lives, no ranks, no penalties. */

export function StreakFlame({ size = 20, color = RED }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path fill={color} d="M12.5 2.2c.3 3-1.2 4.6-2.7 6.3C8.3 10.200 7 11.800 7 14.300 7 17.600 9.200 20 12 20s5-2.200 5-5.200c0-1.800-.8-3.100-1.700-4.200-.3 1-.9 1.700-1.700 2 .5-3.200-.1-7.700-1.100-10.400Z" />
    </Svg>
  );
}

export function StreakChip({ n }: { n: number }) {
  const { c } = useTheme();
  return (
    <View accessibilityLabel={`${n} day streak`} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingLeft: 10, paddingRight: 14, borderRadius: 18, backgroundColor: n ? '#FBE3DD' : c.surface }}>
      <StreakFlame size={18} color={n ? RED : '#A9A598'} />
      <T v="uiStrong" size={15} color={n ? '#A8321F' : c.ink3}>{n}</T>
    </View>
  );
}

export function WeekStrip({ week }: { week: { label: string; done: boolean; isToday: boolean }[] }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      {week.map((d, i) => (
        <View key={i} style={{ alignItems: 'center', gap: 6 }}>
          <T v="caption" size={12} color={d.isToday ? c.ink : c.ink3} style={{ fontFamily: d.isToday ? font.semibold : font.regular }}>{d.label}</T>
          <View style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: d.done ? BLUE : 'transparent', borderWidth: d.done ? 0 : 2, borderColor: d.isToday ? RED : c.rule }}>
            {d.done ? <Icon name="check" size="sm" tone="onAccent" /> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

export function GoalBar({ done, goal }: { done: number; goal: number }) {
  const { c } = useTheme();
  const pct = Math.min(1, done / Math.max(1, goal));
  return (
    <View style={{ height: 10, borderRadius: 5, backgroundColor: c.surfaceHigh, overflow: 'hidden' }}>
      <View style={{ width: `${pct * 100}%`, height: 10, borderRadius: 5, backgroundColor: BLUE }} />
    </View>
  );
}

/* The path as a winding road. Done = blue with a check, current = red and pulsing with a START tag, next = quiet grey. */
const ROW = 104, NODE = 64;
export function PathRoad({ path, width, done, onOpen }: { path: PathT; width: number; done: (id: string) => boolean; onOpen: (id: string) => void }) {
  const { c } = useTheme();
  const cur = path.c.findIndex(x => !done(x));
  const offs = [0, 56, 84, 56, 0, -56, -84, -56];
  const xs = path.c.map((_, i) => width / 2 + offs[i % offs.length]);
  const ys = path.c.map((_, i) => 52 + i * ROW + (i === cur ? 18 : 0));
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => { const a = Animated.loop(Animated.sequence([Animated.timing(pulse, { toValue: 1, duration: 1100, useNativeDriver: true }), Animated.timing(pulse, { toValue: 0, duration: 1100, useNativeDriver: true })])); a.start(); return () => a.stop(); }, [pulse]);
  let d = '';
  xs.forEach((x, i) => { d += i === 0 ? `M ${x} ${ys[0]}` : ` C ${xs[i - 1]} ${(ys[i - 1] + ys[i]) / 2}, ${x} ${(ys[i - 1] + ys[i]) / 2}, ${x} ${ys[i]}`; });
  const h = ys[ys.length - 1] + 70;
  return (
    <View style={{ width, height: h }}>
      <Svg width={width} height={h} style={{ position: 'absolute' }}>
        <Path d={d} stroke={c.rule} strokeWidth={5} strokeLinecap="round" strokeDasharray="1 12" fill="none" />
      </Svg>
      {path.c.map((id, i) => {
        const isDone = done(id), isCur = i === cur;
        const left = xs[i] - NODE / 2, top = ys[i] - NODE / 2;
        const right = xs[i] <= width / 2 + 1;
        return (
          <View key={id} style={{ position: 'absolute', left: 0, top: 0, width, height: h }} pointerEvents="box-none">
            {isCur ? (
              <Animated.View pointerEvents="none" style={{ position: 'absolute', left: left - 8, top: top - 8, width: NODE + 16, height: NODE + 16, borderRadius: (NODE + 16) / 2, backgroundColor: RED, opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.28, 0.06] }) }} />
            ) : null}
            <Press haptic onPress={() => onOpen(id)} accessibilityRole="link" accessibilityLabel={`${byId[id].t}${isDone ? ', done' : isCur ? ', start here' : ''}`}
              style={{ position: 'absolute', left, top, width: NODE, height: NODE, borderRadius: NODE / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: isDone ? BLUE : isCur ? RED : c.surfaceHigh, borderBottomWidth: 5, borderBottomColor: isDone ? '#172C68' : isCur ? '#B73A26' : '#CFC5AE' }}>
              {isDone ? <Icon name="check" size="lg" tone="onAccent" /> : isCur ? <Icon name="arrow-right" size="lg" tone="onAccent" /> : <T v="uiStrong" size={18} color={c.ink3}>{i + 1}</T>}
            </Press>
            {isCur ? (
              <View pointerEvents="none" style={{ position: 'absolute', left: xs[i] - 34, top: top - 32, width: 68, height: 28, borderRadius: 14, backgroundColor: '#17191C', alignItems: 'center', justifyContent: 'center' }}>
                <T v="label" size={11.5} color="#F5F0E6">START</T>
              </View>
            ) : null}
            <T v="uiStrong" size={13.5} color={isDone || isCur ? c.ink : c.ink3} numberOfLines={2}
              style={{ position: 'absolute', top: ys[i] - 14, ...(right ? { left: xs[i] + NODE / 2 + 12, right: 8 } : { right: width - xs[i] + NODE / 2 + 12, left: 8, textAlign: 'right' }) }}>{byId[id].t}</T>
          </View>
        );
      })}
    </View>
  );
}

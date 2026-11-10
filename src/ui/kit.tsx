import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useRef, type ComponentProps, type ReactNode } from 'react';
import { Animated, Platform, Pressable, ScrollView, StyleSheet, Text, View, type PressableProps, type StyleProp, type TextProps, type TextStyle, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Svg, { Path } from 'react-native-svg';

import { STATUS, type Status } from '@/data';
import { PATHS, type IconName } from './icons';
import { dur, ease, usePop, useReducedMotion } from './motion';
import { font, shape, touch, type, useTheme } from './theme';

export type { IconName };

/* ---------- Type: one family; weight and size carry the hierarchy ---------- */
type V = 'display' | 'title' | 'dek' | 'body' | 'bodyLg' | 'label' | 'ui' | 'uiStrong' | 'caption';
export function T({ v = 'body', size, color, style, ...rest }: TextProps & { v?: V; size?: number; color?: string }) {
  const { c } = useTheme();
  const s = size;
  const base: Record<V, TextStyle> = {
    display: { fontFamily: font.semibold, fontSize: s ? (s > 26 ? Math.round(s * 0.9) : s) : 28, lineHeight: type.leading(s ? (s > 26 ? Math.round(s * 0.9) : s) : 28), letterSpacing: type.tracking(s ?? 30), color: c.ink },
    title: { fontFamily: font.semibold, fontSize: s ?? 18, lineHeight: type.leading(s ?? 18), letterSpacing: type.tracking(s ?? 18), color: c.ink },
    dek: { fontFamily: font.regular, fontSize: s ?? 17, lineHeight: (s ?? 17) * 1.5, color: c.ink2 },
    body: { fontFamily: font.regular, fontSize: s ?? type.body.size, lineHeight: (s ?? type.body.size) * type.body.leading, color: c.ink },
    bodyLg: { fontFamily: font.medium, fontSize: s ?? 18, lineHeight: (s ?? 18) * 1.5, letterSpacing: -0.1, color: c.ink },
    label: { fontFamily: font.medium, fontSize: s ?? type.label.size, lineHeight: (s ?? type.label.size) * 1.4, letterSpacing: (s ?? type.label.size) * type.label.tracking, textTransform: 'uppercase', color: c.ink3 },
    ui: { fontFamily: font.regular, fontSize: s ?? 15, color: c.ink },
    uiStrong: { fontFamily: font.medium, fontSize: s ?? 15, color: c.ink },
    caption: { fontFamily: font.regular, fontSize: s ?? 14, lineHeight: (s ?? 14) * 1.45, color: c.ink3 },
  };
  return <Text maxFontSizeMultiplier={v === 'display' ? 1.3 : 1.8} style={[base[v], color ? { color } : null, style]} {...rest} />;
}

/* Reveal: content settles into place after a choice or on entry. `delay` staggers siblings (use ~60ms steps, a few at most). */
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  const o = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(o, { toValue: 1, duration: reduce ? dur.micro : dur.emphasis, delay: reduce ? 0 : delay, easing: ease.enter, useNativeDriver: true }).start(); }, [o, delay, reduce]);
  return <Animated.View style={{ opacity: o, transform: reduce ? undefined : [{ translateY: o.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }] }}>{children}</Animated.View>;
}

/* ---------- Press: identical feedback on both platforms (slight press-in + light haptic) ---------- */
export function Press({ style, children, haptic, onPress, ...rest }: PressableProps & { style?: StyleProp<ViewStyle>; haptic?: boolean; children: ReactNode }) {
  return (
    <Pressable
      onPress={e => { if (haptic) Haptics.selectionAsync().catch(() => {}); onPress?.(e); }}
      style={state => {
        const { pressed, hovered, focused } = state as typeof state & { hovered?: boolean; focused?: boolean };
        return [style, pressed ? { opacity: 0.55 } : hovered ? { opacity: 0.82 } : null, WEB_FOCUS && focused && keyboardUser ? FOCUS_RING : null, rest.disabled ? { opacity: 0.4 } : null];
      }}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
// Keyboard focus is always visible (web). Native uses the system's own focus handling.
const WEB_FOCUS = Platform.OS === 'web';
// The ring appears for keyboard users only, not after a click or tap.
let keyboardUser = false;
if (WEB_FOCUS && typeof document !== 'undefined') {
  document.addEventListener('keydown', e => { if (e.key === 'Tab') keyboardUser = true; }, true);
  document.addEventListener('pointerdown', () => { keyboardUser = false; }, true);
  // Browsers draw their own outline on focused elements after a click; ours replaces it, for keyboard users only.
  const st = document.createElement('style');
  st.textContent = '[tabindex]:focus,[role="tab"]:focus,[role="button"]:focus,[role="link"]:focus{outline:none!important}';
  document.head.appendChild(st);
}
const FOCUS_RING = { outlineStyle: 'solid', outlineWidth: 2, outlineColor: '#3157D5', outlineOffset: 2 } as ViewStyle;

/* ---------- Icon: one family (Tabler, MIT), one stroke, four sizes, four tones ---------- */
export const ICON_SIZE = { sm: 16, md: 18, lg: 22, xl: 30 } as const;
export type IconTone = 'ink' | 'muted' | 'accent' | 'onAccent' | 'sage';
// Decorative unless given a label. Active state is a filled shape, never a colour swap alone.
export function Icon({ name, size = 'md', tone = 'ink', active, soft, label }: { name: IconName; size?: keyof typeof ICON_SIZE; tone?: IconTone; active?: boolean; soft?: boolean; label?: string }) {
  const { c } = useTheme();
  const col = { ink: c.ink, muted: c.ink3, accent: c.accent, onAccent: c.onAccent, sage: c.sage }[tone];
  const px = ICON_SIZE[size];
  return (
    <Svg width={px} height={px} viewBox="0 0 24 24" fill="none" accessible={!!label} accessibilityLabel={label} accessibilityElementsHidden={!label} importantForAccessibility={label ? 'yes' : 'no-hide-descendants'}>
      {PATHS[name].map((d, i) => <Path key={i} d={d} stroke={col} strokeWidth={size === 'xl' ? 1.5 : 1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />)}
    </Svg>
  );
}

/* Keep: one bookmark everywhere. It settles with a tiny lift when kept, and says nothing when removed. */
export function KeepIcon({ kept, size = 'md', rest = 'muted' }: { kept: boolean; size?: keyof typeof ICON_SIZE; rest?: IconTone }) {
  const { style, pop } = usePop();
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } if (kept) pop(); }, [kept]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Animated.View style={style}><Icon name="bookmark" size={size} tone={kept ? 'sage' : rest} active={kept} /></Animated.View>;
}

/* ThreadLine: the line between ideas draws itself once, top to bottom. Used where one idea leads to the next. */
export function ThreadLine({ height = 28 }: { height?: number }) {
  const { c } = useTheme();
  const reduce = useReducedMotion();
  const v = useRef(new Animated.Value(reduce ? 1 : 0)).current;
  useEffect(() => { if (!reduce) Animated.timing(v, { toValue: 1, duration: dur.emphasis, delay: 120, easing: ease.emphasis, useNativeDriver: true }).start(); }, [v, reduce]);
  return (
    <View style={{ height, width: 2, overflow: 'hidden', marginLeft: 3, marginVertical: 6 }}>
      <Animated.View style={{ height, width: 2, backgroundColor: c.sage, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [-height, 0] }) }] }} />
    </View>
  );
}

export function StatusTag({ st, onHero }: { st: Status; onHero?: boolean }) {
  const { c } = useTheme();
  return <T v="label" size={11} color={onHero ? c.onHero2 : c[st]}>{STATUS[st].label}</T>;
}

export function Button({ label, onPress, kind = 'filled', icon, disabled, loading, full }: { full?: boolean; label: string; onPress: () => void; kind?: 'filled' | 'soft' | 'onHero' | 'text'; icon?: IconName; disabled?: boolean; loading?: boolean }) {
  const { c } = useTheme();
  const m = { filled: { bg: c.sage, fg: '#FFFFFF' }, soft: { bg: c.tintSage, fg: c.accent }, onHero: { bg: c.bg, fg: c.ink }, text: { bg: 'transparent', fg: c.accent } }[kind];
  return (
    <Press haptic onPress={loading ? undefined : onPress} disabled={disabled} accessibilityRole="button" accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      style={{ backgroundColor: m.bg, borderRadius: shape.md, height: touch + 2, paddingHorizontal: kind === 'text' ? 0 : 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, alignSelf: full ? 'stretch' : 'flex-start' }}>
      {icon ? <Icon name={icon} tone={kind === 'filled' ? 'onAccent' : 'accent'} /> : null}
      <T v="uiStrong" size={15.5} color={m.fg}>{loading ? 'One moment…' : label}</T>
    </Press>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Press haptic onPress={onPress} accessibilityRole="button" accessibilityState={{ selected }} hitSlop={6}
      style={{ paddingHorizontal: 16, height: 36, borderRadius: 18, justifyContent: 'center', backgroundColor: selected ? c.ink : 'transparent', borderWidth: 1, borderColor: selected ? c.ink : '#17191C33' }}>
      <T v="uiStrong" size={14} color={selected ? c.bg : c.ink2}>{label}</T>
    </Press>
  );
}

// Segmented tabs: a soft rounded track with a solid blue pill on the active option. Scrolls sideways if the labels don't fit.
export function Segmented<K extends string>({ value, options, onChange }: { value: K; options: { key: K; label: string }[]; onChange: (k: K) => void }) {
  const { c } = useTheme();
  return (
    <View style={{ borderRadius: 26, backgroundColor: c.surface, overflow: 'hidden' }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 4, gap: 2, minWidth: '100%' }}>
        {options.map(o => {
          const on = value === o.key;
          return (
            <Press key={o.key} haptic onPress={() => onChange(o.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}
              style={{ flexGrow: 1, height: 40, paddingHorizontal: 16, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.sage : 'transparent' }}>
              <T v="ui" size={14.5} color={on ? '#FFFFFF' : c.ink2} style={{ fontFamily: on ? font.semibold : font.medium }}>{o.label}</T>
            </Press>
          );
        })}
      </ScrollView>
    </View>
  );
}

/* ---------- Frosted surface for floating chrome only (tab bar, back button, next bar, map card) ---------- */
export function Frost({ style, children, radius = shape.full }: { style?: StyleProp<ViewStyle>; children: ReactNode; radius?: number }) {
  return (
    <View style={[{ borderRadius: radius, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: '#DDD5C3', backgroundColor: 'rgba(245,240,230,0.96)' }, style]}>
      <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
      {children}
    </View>
  );
}
// Shadow lives on a wrapper so it isn't clipped by the frosted surface's overflow.
export const floatShadow: ViewStyle = { shadowColor: '#141814', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 1, borderRadius: shape.full };

/* ---------- Floating back button, identical on both platforms (swipe-back and system back still work) ---------- */
export function BackButton({ light }: { light?: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ position: 'absolute', top: insets.top + 6, left: 14, zIndex: 10 }}>
      <Press haptic onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back"
        style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#17191C' }}>
        <Icon name="back" size="lg" tone="onAccent" />
      </Press>
    </View>
  );
}

export function SectionHead({ label, note, action, onAction }: { label: string; note?: string; action?: string; onAction?: () => void }) {
  const { c } = useTheme();
  return (
    <View style={{ paddingHorizontal: 24, marginBottom: 10, gap: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <T v="label">{label}</T>
        {action ? <Press onPress={onAction} hitSlop={12}><T v="ui" size={14} color={c.accent}>{action}</T></Press> : null}
      </View>
      {note ? <T v="caption">{note}</T> : null}
    </View>
  );
}

// Not a line: rows are separated by space.
export function Rule(_: { inset?: number }) {
  return <View style={{ height: 14 }} />;
}

const SHORT: Record<Status, string> = { finding: 'Finding', theory: 'Theory', arg: 'Argument', interp: 'Interpretation', contested: 'Contested' };
/* Tag line in the style of a quiet catalogue: CLAIM TYPE · 2 MIN. Claim type is coloured; the rest is grey. */
export function Meta({ st, extra, onDark, tone }: { st?: Status; extra?: string; onDark?: boolean; tone?: string }) {
  const { c } = useTheme();
  return (
    <T v="label" size={12.5} color={onDark ? 'rgba(255,255,255,0.88)' : tone ?? c.ink3}>
      {st ? <T v="label" size={12.5} color={onDark ? '#FFFFFF' : c[st]} style={{ fontFamily: font.medium }}>{SHORT[st]}</T> : null}
      {st && extra ? ' · ' : ''}{extra}
    </T>
  );
}

/* The LIMEN wordmark. The I is a vermilion bar that rises past the cap height: one element crossing the line the others keep. */
export function Wordmark({ size = 22, color, accent = '#E6533D' }: { size?: number; color?: string; accent?: string }) {
  const { c } = useTheme();
  // Plex Sans Medium throughout. The I is the same letter, same height and stem as its neighbours, in vermilion, with a touch more air either side:
  // you read LIMEN first, and only then notice the I.
  const style = { fontFamily: font.medium, fontSize: size, lineHeight: size * 1.2, color: color ?? c.ink, letterSpacing: size * 0.07, includeFontPadding: false } as const;
  return (
    <Text accessibilityRole="header" accessibilityLabel="LIMEN" style={style}>
      L<Text style={{ color: accent }}>I</Text>MEN
    </Text>
  );
}

/* The threshold device: a short bar that crosses an edge. Cards and dividers carry it, quietly. */
export function ThresholdTick({ style, color = '#E6533D' }: { style?: StyleProp<ViewStyle>; color?: string }) {
  return <View pointerEvents="none" style={[{ position: 'absolute', width: 3, height: 22, backgroundColor: color }, style]} />;
}

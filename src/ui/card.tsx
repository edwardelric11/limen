import { Pressable, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { elevation, shape, space, surface, useTheme } from './theme';

type Variant = 'content' | 'elevated' | 'tint';
// One card. `content` is a quiet tonal surface, `elevated` rests slightly above the page, `tint` carries a pigment.
// Press settles 1px down; on web, hover lifts 1px and the shadow deepens. Everything else is the caller's content.
export function Card({ variant = 'content', tint, radius = shape.lg, pad = space.lg, onPress, style, children, ...rest }: Omit<PressableProps, 'style'> & { variant?: Variant; tint?: string; radius?: number; pad?: number; style?: StyleProp<ViewStyle>; children: ReactNode }) {
  const { c } = useTheme();
  const bg = variant === 'tint' ? tint ?? c.tintSage : variant === 'elevated' ? surface.s2 : c.surface;
  const base: ViewStyle = { backgroundColor: bg, borderRadius: radius, padding: pad, ...(variant === 'elevated' ? elevation.card : variant === 'content' ? elevation.subtle : null) };
  if (!onPress) return <View style={[base, style]}>{children}</View>;
  return (
    <Pressable onPress={onPress} {...rest}
      style={state => {
        const { pressed, hovered } = state as typeof state & { hovered?: boolean };
        return [base, style, pressed ? { transform: [{ translateY: 1 }], opacity: 0.94 } : hovered ? { transform: [{ translateY: -1 }], ...(variant === 'elevated' ? elevation.floating : elevation.card) } : null];
      }}>
      {children}
    </Pressable>
  );
}

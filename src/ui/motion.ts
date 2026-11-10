import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';

// LIMEN motion: quiet, purposeful. Three durations, four easings. Only opacity and transform are animated.
export const dur = { micro: 140, standard: 240, emphasis: 420 } as const;
export const ease = {
  standard: Easing.bezier(0.2, 0, 0, 1),
  enter: Easing.out(Easing.cubic),
  exit: Easing.in(Easing.cubic),
  emphasis: Easing.bezier(0.3, 0, 0, 1),
};

// Respects the system "reduce motion" setting. Large movement is dropped; state feedback stays.
export function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setR).catch(() => {});
    const s = AccessibilityInfo.addEventListener('reduceMotionChanged', setR);
    return () => s.remove();
  }, []);
  return r;
}

// A small confirmation for "keep": the icon settles with a tiny lift. Returns style + a trigger.
export function usePop() {
  const reduce = useReducedMotion();
  const v = useRef(new Animated.Value(1)).current;
  const pop = () => {
    if (reduce) return;
    Animated.sequence([
      Animated.timing(v, { toValue: 1.18, duration: dur.micro * 0.6, easing: ease.enter, useNativeDriver: true }),
      Animated.timing(v, { toValue: 1, duration: dur.standard, easing: ease.standard, useNativeDriver: true }),
    ]).start();
  };
  return { style: { transform: [{ scale: v }] }, pop };
}

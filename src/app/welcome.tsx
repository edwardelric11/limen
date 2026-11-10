import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PATHS } from '@/data';
import { useNotebook } from '@/lib/notebook';
import { openConcept } from '@/ui/blocks';
import { Cover } from '@/ui/cover';
import { Button, Icon, Press, T, Wordmark } from '@/ui/kit';
import { shape, useAppWidth, useTheme } from '@/ui/theme';

// First run: three short steps. What this is, what to start with, how much per day. Then straight into the first idea.
const GOALS = [
  { n: 1, t: 'Light', d: '1 idea a day, about 2 minutes' },
  { n: 2, t: 'Steady', d: '2 ideas a day, about 5 minutes' },
  { n: 3, t: 'Deep', d: '3 ideas a day, about 8 minutes' },
];
const START = ['wanting', 'hidden-self', 'love', 'shame', 'freedom', 'meaning'];

export default function Welcome() {
  const { c } = useTheme();
  const W = useAppWidth();
  const insets = useSafeAreaInsets();
  const nb = useNotebook();
  const [step, setStep] = useState(0);
  const [pathId, setPathId] = useState('wanting');
  const [goal, setGoal] = useState(1);
  const paths = PATHS.filter(p => START.includes(p.id));

  const finish = () => {
    nb.setGoal(goal);
    nb.setFlag('path:' + pathId);
    nb.setFlag('onboarded');
    const first = PATHS.find(p => p.id === pathId)!;
    router.replace('/');
    setTimeout(() => openConcept(first.c[0], pathId), 50);
  };
  const skip = () => { nb.setFlag('onboarded'); router.replace('/'); };

  const choice = (on: boolean) => ({ padding: 16, borderRadius: 20, backgroundColor: on ? c.tintSage : c.surface, borderWidth: 2, borderColor: on ? c.sage : 'transparent', gap: 3 });

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20, paddingHorizontal: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, height: 40 }}>
        {step > 0 ? <Press onPress={() => setStep(step - 1)} accessibilityRole="button" accessibilityLabel="Back" style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}><Icon name="back" /></Press> : null}
        <View style={{ flex: 1, flexDirection: 'row', gap: 6 }}>
          {[0, 1, 2].map(i => <View key={i} style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: i <= step ? c.sage : c.surfaceHigh }} />)}
        </View>
        <Press onPress={skip} hitSlop={10}><T v="uiStrong" size={14.5} color={c.ink3}>Skip</T></Press>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', gap: 22 }}>
        {step === 0 ? (
          <>
            <Cover seed="wanting-liking" size={W - 40} ratio={0.7} radius={shape.xl} />
            <View style={{ gap: 8 }}>
              <Wordmark size={30} />
              <T v="display" size={30} style={{ lineHeight: 36 }}>One idea a day, to make sense of being human.</T>
            </View>
            <View style={{ gap: 12 }}>
              {[['1', 'Read one idea. It takes about 2 minutes.'], ['2', 'Finish it to keep your streak.'], ['3', 'Follow the path to the next one.']].map(([n, t]) => (
                <View key={n} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.sage, alignItems: 'center', justifyContent: 'center' }}><T v="uiStrong" size={14} color="#fff">{n}</T></View>
                  <T v="body" size={16.5} style={{ flex: 1 }}>{t}</T>
                </View>
              ))}
            </View>
          </>
        ) : step === 1 ? (
          <>
            <View style={{ gap: 6 }}>
              <T v="display" size={30} style={{ lineHeight: 36 }}>What do you want to understand first?</T>
              <T v="caption" size={15} color={c.ink2}>You can change this any time.</T>
            </View>
            <View style={{ gap: 10 }}>
              {paths.map(p => (
                <Press key={p.id} onPress={() => setPathId(p.id)} accessibilityRole="radio" accessibilityState={{ selected: pathId === p.id }} style={choice(pathId === p.id)}>
                  <T v="title" size={17}>{p.t}</T>
                  <T v="caption" size={14} color={c.ink2}>{p.line}</T>
                </Press>
              ))}
            </View>
          </>
        ) : (
          <>
            <View style={{ gap: 6 }}>
              <T v="display" size={30} style={{ lineHeight: 36 }}>How much time each day?</T>
              <T v="caption" size={15} color={c.ink2}>Small and regular works better than long and rare.</T>
            </View>
            <View style={{ gap: 10 }}>
              {GOALS.map(g => (
                <Press key={g.n} onPress={() => setGoal(g.n)} accessibilityRole="radio" accessibilityState={{ selected: goal === g.n }} style={choice(goal === g.n)}>
                  <T v="title" size={17}>{g.t}</T>
                  <T v="caption" size={14} color={c.ink2}>{g.d}</T>
                </Press>
              ))}
            </View>
          </>
        )}
      </View>

      <Button full label={step === 0 ? 'Get started' : step === 1 ? 'Continue' : 'Start my first idea'} icon="arrow-right" onPress={() => (step < 2 ? setStep(step + 1) : finish())} />
    </View>
  );
}

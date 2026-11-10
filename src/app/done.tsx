import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

import { byId, minutesOf, nextAfter, pathById } from '@/data';
import { useProgress } from '@/lib/progress';
import { useTrail } from '@/lib/trail';
import { openConcept, Screen } from '@/ui/blocks';
import { Cover } from '@/ui/cover';
import { StreakFlame, WeekStrip } from '@/ui/game';
import { Button, Icon, Press, T } from '@/ui/kit';
import { shape, useAppWidth, useTheme } from '@/ui/theme';

// The small reward at the end of an idea: what you did, where the streak stands, and the one obvious next step.
export default function Done() {
  const { id, path } = useLocalSearchParams<{ id: string; path?: string }>();
  const { c } = useTheme();
  const W = useAppWidth();
  const { trail } = useTrail();
  const { streak, today, goal, goalMet, week, explored } = useProgress();
  const idea = byId[id];
  const pop = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.spring(pop, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }).start(); }, [pop]);
  if (!idea) return null;
  const p = path ? pathById[path] : undefined;
  const nextInPath = p?.c.find(x => !explored.includes(x) && x !== id);
  const next = nextInPath ? byId[nextInPath] : nextAfter(id, trail, path);
  const nextTitle = nextInPath ? byId[nextInPath].t : byId[next.id].t;
  const nextId = nextInPath ?? next.id;
  const pathDone = !!p && !nextInPath;
  return (
    <Screen bottom={40}>
      <View style={{ paddingHorizontal: 20, alignItems: 'center', gap: 18 }}>
        <View style={{ width: '100%' }}>
          <Cover seed={idea.id} size={W - 40} ratio={0.62} radius={shape.xl} />
          <Animated.View style={{ position: 'absolute', alignSelf: 'center', bottom: -34, width: 72, height: 72, borderRadius: 36, backgroundColor: '#3157D5', borderWidth: 5, borderColor: c.bg, alignItems: 'center', justifyContent: 'center', transform: [{ scale: pop }] }}>
            <Icon name="check" size="xl" tone="onAccent" />
          </Animated.View>
        </View>
        <View style={{ marginTop: 30, alignItems: 'center', gap: 6 }}>
          <T v="display" size={30} style={{ textAlign: 'center' }}>{pathDone ? 'Path finished' : 'Idea finished'}</T>
          <T v="body" size={16.5} color={c.ink2} style={{ textAlign: 'center' }}>{pathDone ? `You have read every idea in ${p!.t}.` : idea.t}</T>
        </View>

        <View style={{ width: '100%', flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1, padding: 16, borderRadius: 20, backgroundColor: '#FBE3DD', gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><StreakFlame size={22} /><T v="display" size={30} color="#A8321F">{streak}</T></View>
            <T v="caption" size={13} color="#A8321F">{streak === 1 ? 'day streak' : 'day streak'}</T>
          </View>
          <View style={{ flex: 1, padding: 16, borderRadius: 20, backgroundColor: c.tintSage, gap: 4 }}>
            <T v="display" size={30} color={c.sage}>{Math.min(today, goal)}/{goal}</T>
            <T v="caption" size={13} color={c.sage}>{goalMet ? 'goal met today' : 'ideas today'}</T>
          </View>
          <View style={{ flex: 1, padding: 16, borderRadius: 20, backgroundColor: c.surface, gap: 4 }}>
            <T v="display" size={30}>{explored.length}</T>
            <T v="caption" size={13} color={c.ink2}>ideas so far</T>
          </View>
        </View>

        <View style={{ width: '100%', padding: 18, borderRadius: 24, backgroundColor: c.surface }}>
          <WeekStrip week={week} />
        </View>

        <View style={{ width: '100%', gap: 10, alignItems: 'stretch', marginTop: 6 }}>
          {!pathDone ? <T v="label" size={12}>Next</T> : null}
          {!pathDone ? <T v="display" size={22}>{nextTitle}</T> : null}
          {!pathDone ? <T v="caption" size={14} color={c.ink2}>{minutesOf(byId[nextId])} min</T> : null}
          <View style={{ gap: 6, marginTop: 6 }}>
            <Button full label={pathDone ? 'Choose another path' : 'Next idea'} icon="arrow-right" onPress={() => (pathDone ? router.replace('/threads') : openConcept(nextId, path))} />
            <Press onPress={() => router.dismissAll()} hitSlop={8} style={{ height: 50, alignItems: 'center', justifyContent: 'center' }}><T v="uiStrong" size={15.5} color={c.accent}>Back to Home</T></Press>
          </View>
        </View>
      </View>
    </Screen>
  );
}

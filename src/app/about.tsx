import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { BackButton, Press, T, Wordmark } from '@/ui/kit';
import { READ_MAX, useAppWidth, useTheme } from '@/ui/theme';

// LIMEN's editorial constitution: what the name means, what is here, and what this is not.
const COBALT = '#3157D5', ULTRA = '#172C68', VERM = '#E6533D', GOLD = '#F2C94C', BONE = '#F5F0E6', INK = '#17191C';

const QS = ["Why do we want what we can't have?", 'Why does criticism hurt so much?', 'How much of who we are is actually ours?', 'Why can freedom feel frightening?'];
const HERE: [string, string][] = [
  ['Ideas', "Concepts that help explain something you've probably experienced but never quite had words for."],
  ['Thinkers', 'People who looked at familiar problems from unfamiliar angles.'],
  ['Books', 'Books that are worth reading beyond the summary.'],
  ['Threads', 'Because one idea usually leads somewhere else. A thinker leads to a book. A book raises another question. That question leads somewhere unexpected.'],
];
const ISNT = ["It's not a course.", "It's not self-help.", "It's not an encyclopedia."];

function Threshold({ w }: { w: number }) {
  const h = 230, dx = w * 0.5 - 46;
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Rect width={w} height={h} fill={COBALT} />
      <Rect x={0} y={h * 0.62} width={w} height={h * 0.38} fill={ULTRA} />
      <Path d={`M ${dx} ${h} L ${dx} ${70} A 46 46 0 0 1 ${dx + 92} 70 L ${dx + 92} ${h} Z`} fill={BONE} />
      <Circle cx={dx + 46} cy={104} r={17} fill={GOLD} />
      <Rect x={dx - 22} y={h * 0.62 - 26} width={5} height={52} fill={VERM} />
      <Circle cx={w * 0.16} cy={h * 0.72} r={5} fill={BONE} />
      <Circle cx={w * 0.84} cy={h * 0.3} r={3} fill={BONE} />
    </Svg>
  );
}

export default function About() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const W = useAppWidth(), pad = 24, tw = Math.min(W - pad * 2, READ_MAX);
  return (
    <View style={{ flex: 1, backgroundColor: BONE }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 74, paddingBottom: insets.bottom + 56 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: pad }}>
          <Wordmark size={Math.min(76, W * 0.19)} />
          <T v="body" size={17} color={c.ink2} style={{ marginTop: 22 }}>Ideas for making sense of being human.</T>
        </View>
        <View style={{ marginTop: 34 }}><Threshold w={W} /></View>

        <View style={{ paddingHorizontal: pad, marginTop: 48, gap: 20, width: tw + pad * 2 }}>
          <T v="label">Why LIMEN?</T>
          <T v="display" size={30} style={{ lineHeight: 37 }}>Some questions don't go away just because you've learned more about them.</T>
          <View style={{ gap: 4, marginTop: 4 }}>
            {QS.map(q => <T key={q} v="body" size={19} style={{ lineHeight: 30 }}>{q}</T>)}
          </View>
          <T v="body" size={18} style={{ lineHeight: 29, marginTop: 8 }}>LIMEN is a place to follow questions like these.</T>
          <T v="body" size={18} style={{ lineHeight: 29 }}>It brings together ideas from philosophy, psychology, culture, and the human sciences, then connects them to the people and books behind them.</T>
          <T v="body" size={18} style={{ lineHeight: 29 }}>You don't need to agree with any of it.</T>
          <T v="body" size={18} style={{ lineHeight: 29 }}>You just need to be curious.</T>
        </View>

        <View style={{ height: 2, width: 44, backgroundColor: VERM, marginLeft: pad, marginTop: 48 }} />
        <View style={{ paddingHorizontal: pad, marginTop: 28, gap: 16, width: tw + pad * 2 }}>
          <T v="label">The name</T>
          <T v="display" size={30} style={{ lineHeight: 37 }}>Limen is Latin for <T v="display" size={30} color={VERM} style={{ lineHeight: 37 }}>threshold</T>.</T>
          <T v="body" size={18} style={{ lineHeight: 29 }}>A threshold is where one thing becomes another: inside and outside, before and after, familiar and unfamiliar.</T>
          <T v="body" size={18} style={{ lineHeight: 29 }}>That's a useful way to think about LIMEN.</T>
          <T v="body" size={18} style={{ lineHeight: 29 }}>You arrive with a question. You leave with another one.</T>
        </View>

        <View style={{ paddingHorizontal: pad, marginTop: 56, gap: 24, width: tw + pad * 2 }}>
          <T v="label">What's here</T>
          {HERE.map(([h, t]) => (
            <View key={h} style={{ gap: 4 }}>
              <T v="title" size={21}>{h}</T>
              <T v="body" size={17} color={c.ink2} style={{ lineHeight: 26 }}>{t}</T>
            </View>
          ))}
        </View>

        <View style={{ backgroundColor: ULTRA, marginTop: 56, paddingHorizontal: pad, paddingVertical: 40, gap: 10 }}>
          <T v="label" color={GOLD} style={{ marginBottom: 6 }}>What LIMEN isn't</T>
          {ISNT.map(x => <T key={x} v="display" size={26} color={BONE} style={{ lineHeight: 33 }}>{x}</T>)}
          <T v="body" size={17} color="#C9D3F0" style={{ marginTop: 12, lineHeight: 26 }}>And it's not trying to give you the answer before you've had time to think about the question.</T>
        </View>

        <View style={{ paddingHorizontal: pad, marginTop: 56, gap: 14, width: tw + pad * 2 }}>
          <T v="label">One last thing</T>
          <T v="body" size={18} style={{ lineHeight: 29 }}>You won't agree with everything here.</T>
          <T v="body" size={18} style={{ lineHeight: 29 }}>That's part of the point.</T>
          <T v="display" size={30} style={{ lineHeight: 37, marginTop: 12 }}>Some ideas give you answers.</T>
          <T v="display" size={30} color={COBALT} style={{ lineHeight: 37 }}>The interesting ones change the question.</T>
        </View>

        <View style={{ paddingHorizontal: pad, marginTop: 64, gap: 6 }}>
          <View><Wordmark size={30} /></View>
          <T v="caption" size={13.5} color={c.ink3} style={{ marginTop: 14 }}>For the questions that stay with you.</T>
        </View>
      </ScrollView>
      <BackButton />
    </View>
  );
}

import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, TextInput, View } from 'react-native';

import { TENSIONS } from '@/data';
import { useNotebook, type Side } from '@/lib/notebook';
import { openConcept, Screen } from '@/ui/blocks';
import { Button, Icon, Press, T } from '@/ui/kit';
import { font, shape, useTheme } from '@/ui/theme';

// Take a side on an open question, then meet the strongest pressure against it. No scores.
export default function Stand() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const t = TENSIONS.find(x => x.c === key);
  const { c } = useTheme();
  const { positions, setPosition, clearPosition } = useNotebook();
  const saved = t ? positions[t.c] : undefined;
  const [side, setSide] = useState<Side | null>(saved?.side ?? null);
  const [words, setWords] = useState(saved?.words ?? '');
  const [editing, setEditing] = useState(!saved);
  if (!t) return <Screen back><T v="dek" style={{ padding: 20 }}>That question isn’t in the library.</T></Screen>;

  const options: { key: Side; who: string; view: string }[] = [
    { key: 'a', who: t.a[0], view: t.a[1] },
    { key: 'b', who: t.b[0], view: t.b[1] },
    { key: 'own', who: 'Neither, exactly', view: 'You see it another way. Say how below.' },
  ];
  const canCommit = !!side && (side !== 'own' || words.trim().length > 3);
  const pressure = (s: Side): [string, string][] => (s === 'a' ? [[t.b[0], t.pa]] : s === 'b' ? [[t.a[0], t.pb]] : [[t.b[0], t.pa], [t.a[0], t.pb]]);
  const sideLabel = (s: Side) => (s === 'a' ? `With ${t.a[0]}` : s === 'b' ? `With ${t.b[0]}` : 'Your own view');

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <Screen back bottom={60}>
        <View style={{ paddingHorizontal: 20, gap: 22 }}>
          <View style={{ gap: 10 }}>
            <T v="label">Where do you stand?</T>
            <T v="display" size={32} accessibilityRole="header">{t.q}</T>
          </View>

          {editing ? (
            <>
              <View style={{ gap: 10 }} accessibilityRole="radiogroup">
                {options.map(o => {
                  const on = side === o.key;
                  return (
                    <Press key={o.key} haptic onPress={() => setSide(o.key)} accessibilityRole="radio" accessibilityState={{ checked: on }}
                      style={{ padding: 16, gap: 4, borderRadius: shape.lg, borderWidth: on ? 2 : 1, borderColor: on ? c.accent : c.rule, backgroundColor: on ? c.surface : 'transparent' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <T v="title" size={18} style={{ flex: 1 }}>{o.who}</T>
                        <Icon name={on ? 'radio-on' : 'radio'} size="lg" tone={on ? 'accent' : 'muted'} />
                      </View>
                      <T v="body" size={15.5} color={c.ink2}>{o.view}</T>
                    </Press>
                  );
                })}
              </View>
              <View style={{ gap: 8 }}>
                <T v="label">In your own words{side === 'own' ? '' : ' (optional)'}</T>
                <TextInput value={words} onChangeText={setWords} multiline placeholder="Why? One or two sentences." placeholderTextColor={c.ink3}
                  style={{ minHeight: 110, padding: 14, borderRadius: shape.md, backgroundColor: c.surface, color: c.ink, fontFamily: font.regular, fontSize: 16.5, lineHeight: 24, textAlignVertical: 'top' }}
                  accessibilityLabel="Your position in your own words" />
              </View>
              {canCommit
                ? <Button label="Take this position" onPress={() => { setPosition(t.c, { side: side as Side, words: words.trim() }); setEditing(false); }} />
                : <T v="caption">Choose a side{side === 'own' ? ' and say how you see it' : ''} to continue.</T>}
            </>
          ) : saved ? (
            <>
              <View style={{ padding: 18, gap: 8, borderRadius: shape.lg, backgroundColor: c.surface }}>
                <T v="label">Your position · {new Date(saved.at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</T>
                <T v="title" size={20}>{sideLabel(saved.side)}</T>
                {saved.words ? <T v="dek" size={17} color={c.ink}>“{saved.words}”</T> : null}
              </View>
              <View style={{ gap: 12 }}>
                <T v="label" color={c.contested}>The best objection</T>
                {pressure(saved.side).map(([who, text]) => (
                  <View key={who} style={{ padding: 16, borderRadius: shape.md, backgroundColor: c.surface, gap: 6 }}>
                    <T v="title" size={17}>{who} would say</T>
                    <T v="bodyLg" size={17.5}>{text}</T>
                  </View>
                ))}
                <T v="dek" size={16}>Does your view hold? If it doesn't, you can change it.</T>
              </View>
              <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                <Button label="Read the idea" kind="soft" onPress={() => openConcept(t.c)} />
                <Button label="Change my mind" kind="text" onPress={() => { clearPosition(t.c); setEditing(true); }} />
              </View>
            </>
          ) : null}
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

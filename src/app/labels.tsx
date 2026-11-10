import { ScrollView, View } from 'react-native';

import { STATUS, type Status } from '@/data';
import { StatusTag, T } from '@/ui/kit';

export default function Labels() {
  return (
    <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 30, gap: 22 }}>
      <View style={{ gap: 6 }}>
        <T v="display" size={28}>How to read the labels</T>
        <T v="dek" size={16}>An argument isn’t a finding, and an interpretation isn’t a fact.</T>
      </View>
      {(Object.keys(STATUS) as Status[]).map(k => (
        <View key={k} style={{ gap: 6 }}>
          <StatusTag st={k} />
          <T v="body" size={16}>{STATUS[k].desc}</T>
        </View>
      ))}
    </ScrollView>
  );
}

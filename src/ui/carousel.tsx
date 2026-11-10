import { Children, type ReactNode } from 'react';
import { ScrollView } from 'react-native';

import { space } from './theme';

// Native horizontal scroll with snapping. The next card is always partly visible: there is more here.
export function Carousel({ itemW, gap = 18, inset = space.lg, children }: { itemW: number; gap?: number; inset?: number; children: ReactNode }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} decelerationRate="fast" snapToInterval={itemW + gap} snapToAlignment="start" disableIntervalMomentum
      contentContainerStyle={{ paddingHorizontal: inset, gap, paddingBottom: space.md }}>
      {Children.toArray(children)}
    </ScrollView>
  );
}

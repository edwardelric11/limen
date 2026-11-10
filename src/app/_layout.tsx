import { Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold } from '@expo-google-fonts/figtree';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { Platform, useWindowDimensions, View } from 'react-native';

import { NotebookProvider } from '@/lib/notebook';
import { TrailProvider } from '@/lib/trail';
import { T } from '@/ui/kit';
import { dur } from '@/ui/motion';
import { APP_MAX, useTheme } from '@/ui/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { c } = useTheme();
  const [loaded, error] = useFonts({ Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold });
  useEffect(() => { SystemUI.setBackgroundColorAsync(c.bg).catch(() => {}); }, [c.bg]);
  useEffect(() => { if (loaded || error) SplashScreen.hideAsync().catch(() => {}); }, [loaded, error]);
  if (!loaded && !error) return null;

  // One navigation model on both platforms: no system headers (each page draws its own),
  // the same slide transition, and native back gestures (iOS edge swipe, Android back) left on.
  return (
    <TrailProvider>
      <NotebookProvider>
        <StatusBar style="dark" />
        <WebFrame bg={c.bg}>
        <Stack screenOptions={{ headerShown: false, animation: 'fade', animationDuration: dur.standard, gestureEnabled: true, contentStyle: { backgroundColor: c.bg } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="labels" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.62, 1], sheetGrabberVisible: true, sheetCornerRadius: 28, contentStyle: { backgroundColor: c.surface } }} />
        </Stack>
        </WebFrame>
      </NotebookProvider>
    </TrailProvider>
  );
}

// On web (the preview) the app is shown inside a phone. On a real phone browser it fills the screen.
// On iOS and Android this renders nothing extra.
function WebFrame({ bg, children }: { bg: string; children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  if (Platform.OS !== 'web') return <>{children}</>;
  if (width < 520) return <View style={{ flex: 1, backgroundColor: bg }}>{children}</View>;
  const h = Math.min(844, height - 40);
  return (
    <View style={{ flex: 1, backgroundColor: '#E8EBEA', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: APP_MAX + 20, height: h + 20, borderRadius: 58, backgroundColor: '#17191A', padding: 10, shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 40, shadowOffset: { width: 0, height: 20 } }}>
        <View style={{ flex: 1, borderRadius: 48, overflow: 'hidden', backgroundColor: bg }}>
          <View style={{ height: 46, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 30, paddingBottom: 6, backgroundColor: bg }}>
            <T v="uiStrong" size={14.5}>9:41</T>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={{ width: 16, height: 9, borderRadius: 2, backgroundColor: '#1E2224', opacity: 0.85 }} />
              <View style={{ width: 24, height: 11, borderRadius: 3.5, borderWidth: 1, borderColor: '#1E2224', padding: 1 }}><View style={{ flex: 1, borderRadius: 2, backgroundColor: '#1E2224' }} /></View>
            </View>
          </View>
          <View style={{ flex: 1 }}>{children}</View>
          <View style={{ height: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: bg }}>
            <View style={{ width: 120, height: 4, borderRadius: 2, backgroundColor: '#1E2224' }} />
          </View>
          <View pointerEvents="none" style={{ position: 'absolute', top: 12, alignSelf: 'center', width: 104, height: 28, borderRadius: 14, backgroundColor: '#17191A' }} />
        </View>
      </View>
    </View>
  );
}

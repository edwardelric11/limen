import { Platform, useWindowDimensions } from 'react-native';

// LIMEN palette: Bone, Ink, Sage, Deep Moss, Ochre, Stone. One design for iOS and Android. Light only. One typeface: Figtree. No italics.
const light = {
  bg: '#F5F0E6', surface: '#ECE5D6', surfaceHigh: '#E2D9C6',
  ink: '#171A1B', ink2: '#4A504F', ink3: '#686C68', rule: '#DDD5C3',
  accent: '#172C68', onAccent: '#F5F0E6', accentSoft: '#E1E8F7',
  sageInk: '#2747B8', // Sage, darkened only where it has to be read as small text
  tintSage: '#E1E8F7', tintOchre: '#F1E6CF', tintMoss: '#DCE4F5', tintCool: '#ECE8DD', // paper lightly tinted with pigment
  sage: '#3157D5', ochre: '#E6533D', gold: '#F2C94C', stone: '#9DB0E0', moss: '#172C68',
  hero: '#ECE5D6', onHero: '#171A1B', onHero2: '#4A504F', heroAccent: '#172C68',
  finding: '#2747B8', theory: '#BF442C', arg: '#2747B8', interp: '#686C68', contested: '#BF442C',
  psych: '#2747B8', phil: '#BF442C', both: '#686C68',
};
export type Palette = typeof light;

// One shape scale. Controls are 48 tall: meets both the 44pt (Apple) and 48dp (Material) minimum.
// Radius: sm controls and metadata, md standard cards, lg editorial cards, xl hero surfaces. Pills only for tags and chips.
export const shape = { sm: 8, md: 12, lg: 16, xl: 20, full: 999 };
export const touch = 48;
// Spacing, depth, layers. Shadows are large, soft and low: paper resting on a surface, never a drop-shadow.
export const space = { xs: 4, sm: 8, md: 12, lg: 20, xl: 28, xxl: 40 } as const;
const shadowBase = { shadowColor: '#2A2A1E' } as const;
export const elevation = {
  subtle: { ...shadowBase, shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  card: { ...shadowBase, shadowOpacity: 0.07, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  floating: { ...shadowBase, shadowOpacity: 0.11, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 5 },
  emphasis: { ...shadowBase, shadowOpacity: 0.16, shadowRadius: 32, shadowOffset: { width: 0, height: 16 }, elevation: 8 },
} as const;
// Surfaces: 0 page, 1 tinted, 2 raised content, 3 floating. Tone first; shadow only from 2 up.
export const surface = { s0: '#F5F0E6', s1: '#ECE5D6', s2: '#FAF6EC', s3: '#FCF9F1' } as const;
export const z = { base: 0, raised: 1, nav: 10, overlay: 20 } as const;

export const font = {
  regular: 'Figtree_400Regular',
  medium: 'Figtree_500Medium',
  semibold: 'Figtree_600SemiBold',
  bold: 'Figtree_700Bold',
  serif: 'Figtree_400Regular',
  serifMedium: 'Figtree_500Medium',
};

// Context, not decoration: psychology reads sage, philosophy ochre, society cool, books moss.
export const tintFor = (group: string) => ({ Psychology: light.tintSage, Philosophy: light.tintOchre, Society: light.tintCool, Books: light.tintMoss } as Record<string, string>)[group] ?? light.surface;

export function useTheme() {
  return { c: light };
}

// Usable width. On web the app sits in a phone-sized column, so layout math must not use the window.
export const APP_MAX = 390;
export const READ_MAX = 600;
export function useAppWidth() {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' ? (width < 520 ? width : APP_MAX) : Math.min(width, 900);
}

// Typography tokens. One family (Figtree); hierarchy comes from scale, weight, tracking and line-height.
// Size sets the tracking and leading: big type is set tight and close, small type is neutral, labels are open capitals.
export const type = {
  tracking: (size: number) => (size >= 40 ? -0.03 : size >= 28 ? -0.022 : size >= 20 ? -0.012 : size >= 15 ? -0.004 : 0) * size,
  leading: (size: number) => size * (size >= 40 ? 1.05 : size >= 28 ? 1.12 : size >= 22 ? 1.22 : size >= 17 ? 1.3 : 1.35),
  label: { size: 11.5, tracking: 0.09, weight: 'medium' as const },
  body: { size: 17, leading: 1.62 },
  read: { size: 18.5, leading: 1.66 },
  intro: { size: 23, leading: 1.28 },
  display: { h1: 38, h2: 30, h3: 22 },
} as const;

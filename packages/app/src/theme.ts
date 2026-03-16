/**
 * OncoVax Dripsy Theme
 *
 * Medical/clinical palette used across both web (Next.js) and native (Expo).
 * Colors mapped from the existing Tailwind CSS variables + component usage.
 */
import { makeTheme } from 'dripsy';
import { Platform } from 'react-native';

// =============================================================================
// Font Helpers
// =============================================================================

const webFont = (font: string) =>
  Platform.select({
    web: `${font}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`,
    default: font,
  });

// =============================================================================
// Colors
// =============================================================================

const colors = {
  // Semantic tokens (mapped from CSS custom properties in globals.css)
  $background: '#ffffff',
  $foreground: '#0a0a0a',
  $card: '#ffffff',
  $cardForeground: '#0a0a0a',
  $primary: '#171717',
  $primaryForeground: '#fafafa',
  $secondary: '#f5f5f5',
  $secondaryForeground: '#171717',
  $muted: '#f5f5f5',
  $mutedForeground: '#737373',
  $accent: '#f5f5f5',
  $accentForeground: '#171717',
  $destructive: '#ef4444',
  $destructiveForeground: '#fafafa',
  $border: '#e5e5e5',
  $input: '#e5e5e5',
  $ring: '#0a0a0a',

  // Direct palette — blue (clinical/trust)
  blue50: '#eff6ff',
  blue100: '#dbeafe',
  blue200: '#bfdbfe',
  blue300: '#93c5fd',
  blue400: '#60a5fa',
  blue500: '#3b82f6',
  blue600: '#2563eb',
  blue700: '#1d4ed8',
  blue800: '#1e40af',
  blue900: '#1e3a8a',

  // Green (success/positive)
  green50: '#f0fdf4',
  green100: '#dcfce7',
  green200: '#bbf7d0',
  green300: '#86efac',
  green400: '#4ade80',
  green500: '#22c55e',
  green600: '#16a34a',
  green700: '#15803d',
  green800: '#166534',
  green900: '#14532d',

  // Red (alerts/destructive)
  red50: '#fef2f2',
  red100: '#fee2e2',
  red200: '#fecaca',
  red300: '#fca5a5',
  red400: '#f87171',
  red500: '#ef4444',
  red600: '#dc2626',
  red700: '#b91c1c',
  red800: '#991b1b',
  red900: '#7f1d1d',

  // Gray (neutral)
  gray50: '#fafafa',
  gray100: '#f5f5f5',
  gray200: '#e5e5e5',
  gray300: '#d4d4d4',
  gray400: '#a3a3a3',
  gray500: '#737373',
  gray600: '#525252',
  gray700: '#404040',
  gray800: '#262626',
  gray900: '#171717',

  // Purple (pipeline/genomics)
  purple100: '#f3e8ff',
  purple200: '#e9d5ff',
  purple300: '#d8b4fe',
  purple400: '#c084fc',
  purple500: '#a855f7',
  purple600: '#9333ea',
  purple700: '#7e22ce',
  purple800: '#6b21a8',

  // Amber (warnings/caution)
  amber100: '#fef3c7',
  amber200: '#fde68a',
  amber300: '#fcd34d',
  amber400: '#fbbf24',
  amber500: '#f59e0b',
  amber600: '#d97706',
  amber700: '#b45309',
  amber800: '#92400e',

  // Yellow
  yellow50: '#fefce8',
  yellow100: '#fef9c3',
  yellow200: '#fef08a',
  yellow300: '#fde047',
  yellow400: '#facc15',
  yellow500: '#eab308',
  yellow600: '#ca8a04',
  yellow700: '#a16207',
  yellow800: '#854d0e',

  // Indigo (clinical trials)
  indigo100: '#e0e7ff',
  indigo200: '#c7d2fe',
  indigo300: '#a5b4fc',
  indigo400: '#818cf8',
  indigo500: '#6366f1',
  indigo600: '#4f46e5',

  // Cyan (sequencing)
  cyan100: '#cffafe',
  cyan200: '#a5f3fc',
  cyan300: '#67e8f9',
  cyan400: '#22d3ee',
  cyan500: '#06b6d4',
  cyan600: '#0891b2',

  // Orange (manufacturing)
  orange100: '#ffedd5',
  orange200: '#fed7aa',
  orange300: '#fdba74',
  orange400: '#fb923c',
  orange500: '#f97316',
  orange600: '#ea580c',

  // Teal (survivorship)
  teal100: '#ccfbf1',
  teal200: '#99f6e4',
  teal300: '#5eead4',
  teal400: '#2dd4bf',
  teal500: '#14b8a6',
  teal600: '#0d9488',
  teal700: '#0f766e',
  teal800: '#115e59',

  // Utility
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

// =============================================================================
// Typography
// =============================================================================

const fonts = {
  root: webFont('Inter'),
  body: webFont('Inter'),
  heading: webFont('Inter'),
};

const fontSizes = {
  $xs: 12,
  $sm: 14,
  $base: 16,
  $lg: 18,
  $xl: 20,
  $2xl: 24,
  $3xl: 30,
  $4xl: 36,
  $5xl: 48,
};

// =============================================================================
// Spacing (4px increments matching Tailwind)
// =============================================================================

const space = {
  $0: 0,
  $1: 4,
  $2: 8,
  $3: 12,
  $4: 16,
  $5: 20,
  $6: 24,
  $7: 28,
  $8: 32,
  $10: 40,
  $12: 48,
  $14: 56,
  $16: 64,
  $20: 80,
  $24: 96,
};

// =============================================================================
// Radii
// =============================================================================

const radii = {
  $none: 0,
  $sm: 4,
  $md: 6,
  $lg: 8,
  $xl: 12,
  $2xl: 16,
  $full: 9999,
};

// =============================================================================
// Shadows (React Native shadow properties)
// =============================================================================

const shadows = {
  $sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  $md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  $lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
};

// =============================================================================
// Text Variants
// =============================================================================

const text = {
  h1: {
    fontFamily: 'heading',
    fontSize: fontSizes.$4xl,
    fontWeight: '800' as const,
    color: '$foreground',
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: 'heading',
    fontSize: fontSizes.$3xl,
    fontWeight: '700' as const,
    color: '$foreground',
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: 'heading',
    fontSize: fontSizes.$2xl,
    fontWeight: '600' as const,
    color: '$foreground',
  },
  h4: {
    fontFamily: 'heading',
    fontSize: fontSizes.$xl,
    fontWeight: '600' as const,
    color: '$foreground',
  },
  body: {
    fontFamily: 'body',
    fontSize: fontSizes.$base,
    color: '$foreground',
  },
  bodySmall: {
    fontFamily: 'body',
    fontSize: fontSizes.$sm,
    color: '$mutedForeground',
  },
  caption: {
    fontFamily: 'body',
    fontSize: fontSizes.$xs,
    color: '$mutedForeground',
  },
  label: {
    fontFamily: 'body',
    fontSize: fontSizes.$sm,
    fontWeight: '500' as const,
    color: '$foreground',
  },
  link: {
    fontFamily: 'body',
    fontSize: fontSizes.$base,
    color: '$primary',
    textDecorationLine: 'underline' as const,
  },
};

// =============================================================================
// Button Variants
// =============================================================================

const buttons = {
  primary: {
    backgroundColor: '$primary',
    paddingVertical: '$3',
    paddingHorizontal: '$6',
    borderRadius: '$md',
  },
  secondary: {
    backgroundColor: '$secondary',
    paddingVertical: '$3',
    paddingHorizontal: '$6',
    borderRadius: '$md',
  },
  destructive: {
    backgroundColor: '$destructive',
    paddingVertical: '$3',
    paddingHorizontal: '$6',
    borderRadius: '$md',
  },
  ghost: {
    backgroundColor: 'transparent',
    paddingVertical: '$3',
    paddingHorizontal: '$6',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '$border',
    paddingVertical: '$3',
    paddingHorizontal: '$6',
    borderRadius: '$md',
  },
};

// =============================================================================
// Create Theme
// =============================================================================

export const theme = makeTheme({
  colors,
  fonts,
  fontSizes,
  space,
  radii,
  shadows,
  text,
  buttons,
  breakpoints: ['640px', '768px', '1024px', '1280px'],
});

// =============================================================================
// Type Augmentation
// =============================================================================

type OncoVaxTheme = typeof theme;

declare module 'dripsy' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DripsyCustomTheme extends OncoVaxTheme {}
}

export type { OncoVaxTheme };

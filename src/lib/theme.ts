import { Platform } from 'react-native';

/* ------------------------------------------------------------------ */
/* Brand palette                                                       */
/* ------------------------------------------------------------------ */

export const theme = {
  colors: {
    primary: '#4F46E5',
    primaryDark: '#4338CA',
    primaryLight: '#818CF8',
    primarySurface: '#EEF2FF',

    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',

    gold: '#F59E0B',

    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',

    white: '#FFFFFF',
    black: '#000000',

    surfaceBorder: '#E5E7EB',

    // Auth-screen colours (LoginScreen / ProfileSetupScreen)
    bg: '#F0F2F8',
    cardBg: '#FFFFFF',
    textPrimary: '#1A202C',
    textSecondary: '#718096',
    textMuted: '#A0AEC0',
    inputBg: '#F7FAFC',
    inputBorder: '#E2E8F0',
  },

  /** Canonical status colors — use everywhere instead of local constants */
  statusColors: {
    requested: '#F59E0B',   // amber
    accepted: '#3B82F6',    // blue
    ordered: '#6366F1',     // indigo
    picked_up: '#0EA5E9',   // sky
    completed: '#22C55E',   // green
    cancelled: '#EF4444',   // red
    disputed: '#F97316',    // orange
  } as Record<string, string>,

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  radius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    full: 999,
  },

  typography: {
    h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
    h2: { fontSize: 24, fontWeight: '700' as const },
    h3: { fontSize: 20, fontWeight: '600' as const },
    h4: { fontSize: 18, fontWeight: '600' as const },
    body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
    bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
    caption: { fontSize: 12, fontWeight: '500' as const },
    label: { fontSize: 13, fontWeight: '600' as const },
  },

  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
  },

  layout: {
    maxContentWidth: 430,
  },
} as const;

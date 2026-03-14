// src/theme/index.js – AssessMate AI Design System

export const Colors = {
  // Primary brand
  primary: '#4F46E5',         // Deep indigo
  primaryDark: '#3730A3',
  primaryLight: '#818CF8',
  primarySurface: '#EEF2FF',  // Indigo tint

  // Secondary brand
  secondary: '#7C3AED',       // Purple
  secondaryLight: '#A78BFA',
  secondarySurface: '#F5F3FF',

  // Gradient arrays (use in inline linear gradient via angles)
  gradientPrimary: ['#4F46E5', '#7C3AED'],
  gradientHero: ['#3730A3', '#4F46E5', '#7C3AED'],
  gradientCard: ['#667eea', '#764ba2'],

  // Neutrals
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Semantic
  success: '#10B981',
  successSurface: '#D1FAE5',
  warning: '#F59E0B',
  warningSurface: '#FEF3C7',
  danger: '#EF4444',
  dangerSurface: '#FEE2E2',
  info: '#3B82F6',
  infoSurface: '#DBEAFE',

  // Chart palette
  chart1: '#4F46E5',
  chart2: '#7C3AED',
  chart3: '#10B981',
  chart4: '#F59E0B',
  chart5: '#EF4444',
};

export const Typography = {
  // Font sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,

  // Font weights (React Native uses string weights)
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',

  // Line heights
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
};

// 8px grid spacing system
export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const Shadow = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  colored: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
};

// Pre-built card style
export const CardStyle = {
  backgroundColor: '#FFFFFF',
  borderRadius: Radius.lg,
  padding: Spacing.md,
  ...Shadow.md,
};

export default {
  Colors,
  Typography,
  Spacing,
  Radius,
  Shadow,
  CardStyle,
};

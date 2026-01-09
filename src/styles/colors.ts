// Color palette inspired by aquarium/water theme
export const colors = {
  // Primary colors
  primary: '#0EA5E9',      // Sky Blue - water theme
  primaryLight: '#38BDF8',
  primaryDark: '#0284C7',
  
  // Secondary colors
  secondary: '#10B981',    // Emerald - healthy/nature
  secondaryLight: '#34D399',
  secondaryDark: '#059669',
  
  // Background colors (dark mode)
  background: '#0F172A',   // Slate 900
  surface: '#1E293B',      // Slate 800
  surfaceLight: '#334155', // Slate 700
  
  // Text colors
  text: '#F8FAFC',         // Slate 50
  textSecondary: '#CBD5E1', // Slate 300
  textMuted: '#94A3B8',    // Slate 400
  
  // Accent colors
  accent: '#F59E0B',       // Amber
  accentLight: '#FBBF24',
  
  // Status colors
  success: '#22C55E',      // Green
  warning: '#F59E0B',      // Amber
  danger: '#EF4444',       // Red
  info: '#3B82F6',         // Blue
  
  // Gradients
  gradientPrimary: ['#0EA5E9', '#06B6D4', '#10B981'],
  gradientSecondary: ['#1E293B', '#0F172A'],
  gradientAccent: ['#F59E0B', '#EF4444'],
  gradientWater: ['#0EA5E9', '#0284C7', '#0369A1'],
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(255, 255, 255, 0.1)',
  
  // Glass morphism
  glass: 'rgba(30, 41, 59, 0.8)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
};

export const gradients = {
  primary: ['#0EA5E9', '#10B981'] as const,
  water: ['#0EA5E9', '#0284C7', '#0369A1'] as const,
  sunset: ['#F59E0B', '#EF4444'] as const,
  dark: ['#1E293B', '#0F172A'] as const,
  card: ['rgba(30, 41, 59, 0.9)', 'rgba(15, 23, 42, 0.9)'] as const,
};

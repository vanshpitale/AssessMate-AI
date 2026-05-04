// src/components/ui/Badge.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../theme';

const VARIANTS = {
  success:  { bg: Colors.successSurface,  text: Colors.success },
  warning:  { bg: Colors.warningSurface,  text: Colors.warning },
  danger:   { bg: Colors.dangerSurface,   text: Colors.danger },
  info:     { bg: Colors.infoSurface,     text: Colors.info },
  primary:  { bg: Colors.primarySurface,  text: Colors.primary },
  secondary:{ bg: Colors.secondarySurface,text: Colors.secondary },
  neutral:  { bg: Colors.surfaceAlt,      text: Colors.textSecondary },
};

export default function Badge({ label, variant = 'neutral', dot = false, style }) {
  const theme = VARIANTS[variant] || VARIANTS.neutral;
  return (
    <View style={[styles.badge, { backgroundColor: theme.bg }, style]}>
      {dot && <View style={[styles.dot, { backgroundColor: theme.text }]} />}
      <Text style={[styles.text, { color: theme.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  dot: {
    width: 6, height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  text: {
    fontSize: Typography.xs,
    fontWeight: Typography.semiBold,
    letterSpacing: 0.3,
  },
});

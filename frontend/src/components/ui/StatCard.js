// src/components/ui/StatCard.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';

export default function StatCard({ icon, label, value, trend, trendUp, accent, style }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 400, useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0, friction: 7, useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const accentColor = accent || Colors.primary;

  return (
    <Animated.View
      style={[
        styles.card,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        style,
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: accentColor + '18' }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {trend !== undefined && (
        <View style={[styles.trendBadge, trendUp ? styles.trendUp : styles.trendDown]}>
          <Text style={[styles.trendText, { color: trendUp ? Colors.success : Colors.danger }]}>
            {trendUp ? '↑' : '↓'} {trend}
          </Text>
        </View>
      )}
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    width: 140,
    marginRight: Spacing.md,
    ...Shadow.md,
    overflow: 'hidden',
  },
  iconCircle: {
    width: 40, height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  icon: { fontSize: 20 },
  value: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  label: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    fontWeight: Typography.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trendBadge: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  trendUp: { backgroundColor: Colors.successSurface },
  trendDown: { backgroundColor: Colors.dangerSurface },
  trendText: { fontSize: Typography.xs, fontWeight: Typography.semiBold },
  accentBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 3,
  },
});

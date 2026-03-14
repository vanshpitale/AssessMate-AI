// src/components/ui/SkeletonLoader.js
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '../../theme';

function SkeletonRect({ width, height, borderRadius, style }) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.85] });

  return (
    <Animated.View
      style={[
        {
          width: width || '100%',
          height: height || 16,
          borderRadius: borderRadius ?? Radius.sm,
          backgroundColor: Colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard({ style }) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.row}>
        <SkeletonRect width={40} height={40} borderRadius={20} />
        <View style={{ flex: 1, marginLeft: Spacing.md }}>
          <SkeletonRect height={14} width="60%" style={{ marginBottom: 8 }} />
          <SkeletonRect height={12} width="80%" />
        </View>
      </View>
      <SkeletonRect height={12} style={{ marginTop: 16, marginBottom: 8 }} />
      <SkeletonRect height={12} width="70%" />
    </View>
  );
}

export default SkeletonRect;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
});

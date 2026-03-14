// src/components/ui/ProgressIndicator.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../theme';

export default function ProgressIndicator({
  value = 0,       // 0–100
  label,
  showPercent = true,
  color,
  height = 10,
  style,
  animate = true,
}) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: Math.min(Math.max(value, 0), 100),
      duration: animate ? 800 : 0,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const fillColor = color || (value >= 75 ? Colors.success : value >= 50 ? Colors.primary : Colors.warning);

  const width = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={style}>
      {(label || showPercent) && (
        <View style={styles.header}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showPercent && <Text style={[styles.percent, { color: fillColor }]}>{Math.round(value)}%</Text>}
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              width,
              height,
              backgroundColor: fillColor,
              borderRadius: Radius.full,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
  percent: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
  },
  track: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: Radius.full,
  },
});

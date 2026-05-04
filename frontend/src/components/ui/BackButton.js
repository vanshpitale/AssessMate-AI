// src/components/ui/BackButton.js
// Reusable back button using Ionicons "chevron-back"
// Usage: <BackButton nav={nav} />  or  <BackButton nav={nav} fallbackRoute="Main" />
import React, { useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius } from '../../theme';

export default function BackButton({ nav, fallbackRoute = 'Main', style }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // Subtle scale-down feedback on press
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.88,
        useNativeDriver: true,
        friction: 6,
        tension: 80,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
      }),
    ]).start();

    // Navigate back; if stack is at root, fall back to Dashboard/Main
    nav.pop();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      style={[styles.touchable, style]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Animated.View style={[styles.circle, { transform: [{ scale: scaleAnim }] }]}>
        <Ionicons name="chevron-back" size={20} color={Colors.primary} />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    // Extra hit area beyond the visible circle
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

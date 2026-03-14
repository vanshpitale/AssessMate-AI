// src/components/ui/PrimaryButton.js
import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  View,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',   // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = 'md',           // 'sm' | 'md' | 'lg'
  icon = null,
  fullWidth = true,
  style,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
  };

  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.base,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], ...(fullWidth ? { width: '100%' } : {}) }}>
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'outline' || variant === 'ghost' ? Colors.primary : '#fff'}
            size="small"
          />
        ) : (
          <View style={styles.content}>
            {icon && <View style={styles.iconWrap}>{icon}</View>}
            <Text style={[styles.label, styles[`label_${variant}`], styles[`labelSize_${size}`]]}>
              {title}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...Shadow.colored,
  },
  fullWidth: { width: '100%' },
  content: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { marginRight: Spacing.sm },

  // Sizes
  size_sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, height: 40 },
  size_md: { paddingVertical: 14, paddingHorizontal: Spacing.lg, height: 52 },
  size_lg: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, height: 60 },

  // Variants
  variant_primary: { backgroundColor: Colors.primary },
  variant_secondary: { backgroundColor: Colors.secondary },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    ...Shadow.sm,
  },
  variant_ghost: {
    backgroundColor: Colors.primarySurface,
    shadowOpacity: 0,
    elevation: 0,
  },
  variant_danger: { backgroundColor: Colors.danger },

  disabled: { opacity: 0.5 },

  // Labels
  label: { fontWeight: Typography.semiBold, letterSpacing: 0.3 },
  label_primary: { color: Colors.textInverse },
  label_secondary: { color: Colors.textInverse },
  label_outline: { color: Colors.primary },
  label_ghost: { color: Colors.primary },
  label_danger: { color: Colors.textInverse },

  labelSize_sm: { fontSize: Typography.sm },
  labelSize_md: { fontSize: Typography.base },
  labelSize_lg: { fontSize: Typography.md },
});

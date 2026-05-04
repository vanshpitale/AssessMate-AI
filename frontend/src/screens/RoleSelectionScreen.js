// src/screens/RoleSelectionScreen.js – Production UX upgrade
import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, Shadow } from '../theme';

const { width } = Dimensions.get('window');

export default function RoleSelectionScreen({ nav }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(-30)).current;
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(heroSlide, { toValue: 0, friction: 8,   useNativeDriver: true }),
      ]),
      Animated.stagger(100, [
        Animated.spring(card1Anim, { toValue: 1, friction: 7, useNativeDriver: true }),
        Animated.spring(card2Anim, { toValue: 1, friction: 7, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const handleRoleSelect = (userType) => nav.push('Login', { userType });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Gradient-like header via layered views */}
      <View style={styles.heroBg}>
        <View style={styles.heroOval1} />
        <View style={styles.heroOval2} />
      </View>

      <View style={styles.content}>
        {/* Branding */}
        <Animated.View
          style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: heroSlide }] }]}
        >
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🎓</Text>
          </View>
          <Text style={styles.appName}>AssessMate AI</Text>
          <Text style={styles.tagline}>Smart AI-Powered Evaluation Platform</Text>
        </Animated.View>

        {/* Role cards */}
        <View style={styles.rolesSection}>
          <Text style={styles.chooseText}>Choose your role to continue</Text>

          <Animated.View style={{
            opacity: card1Anim,
            transform: [{ scale: card1Anim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }, { translateY: card1Anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          }}>
            <RoleCard
              icon="👨‍🏫"
              title="I'm a Teacher"
              description="Create evaluations, scan answer sheets, and manage AI-powered grading"
              accentColor={Colors.primary}
              badgeLabel="Educator"
              onPress={() => handleRoleSelect('teacher')}
            />
          </Animated.View>

          <Animated.View style={{
            opacity: card2Anim,
            transform: [{ scale: card2Anim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }, { translateY: card2Anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          }}>
            <RoleCard
              icon="🎓"
              title="I'm a Student"
              description="View your results, answer sheets, and personal performance analytics"
              accentColor={Colors.secondary}
              badgeLabel="Learner"
              onPress={() => handleRoleSelect('student')}
            />
          </Animated.View>
        </View>

        <Text style={styles.footer}>© 2025 AssessMate AI · VESIT MCA</Text>
      </View>
    </SafeAreaView>
  );
}

function RoleCard({ icon, title, description, accentColor, badgeLabel, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn  = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, friction: 8 }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true, friction: 6 }).start();

  return (
    <TouchableOpacity onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={1}>
      <Animated.View style={[styles.roleCard, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.accentStrip, { backgroundColor: accentColor }]} />
        <View style={styles.roleCardInner}>
          <View style={[styles.roleIconCircle, { backgroundColor: accentColor + '18' }]}>
            <Text style={styles.roleIcon}>{icon}</Text>
          </View>
          <View style={styles.roleTextWrap}>
            <View style={styles.roleTitleRow}>
              <Text style={styles.roleTitle}>{title}</Text>
              <View style={[styles.roleBadge, { backgroundColor: accentColor + '18' }]}>
                <Text style={[styles.roleBadgeText, { color: accentColor }]}>{badgeLabel}</Text>
              </View>
            </View>
            <Text style={styles.roleDesc}>{description}</Text>
          </View>
          <Text style={[styles.arrow, { color: accentColor }]}>›</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  // Hero background decorations
  heroBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 280, overflow: 'hidden' },
  heroOval1: {
    position: 'absolute', top: -80, left: -60,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: Colors.primary + '18',
  },
  heroOval2: {
    position: 'absolute', top: -40, right: -80,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: Colors.secondary + '12',
  },

  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },

  // Hero section
  hero: { alignItems: 'center', paddingTop: Spacing.xl, marginBottom: Spacing.xl },
  logoCircle: {
    width: 88, height: 88,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadow.lg,
  },
  logoEmoji: { fontSize: 44 },
  appName: {
    fontSize: Typography.xxl,
    fontWeight: Typography.extraBold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  taglinePill: {
    backgroundColor: Colors.primarySurface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  taglinePillText: {
    fontSize: Typography.xs,
    color: Colors.primary,
    fontWeight: Typography.semiBold,
    letterSpacing: 0.3,
  },

  // Roles section
  rolesSection: { flex: 1, justifyContent: 'center', gap: Spacing.md },
  chooseText: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    fontWeight: Typography.medium,
    textAlign: 'center',
    marginBottom: Spacing.md,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  // Role card
  roleCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    ...Shadow.md,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 4,
  },
  accentStrip: {
    width: 4,
    alignSelf: 'stretch',
    borderTopLeftRadius: Radius.xl,
    borderBottomLeftRadius: Radius.xl,
  },
  roleCardInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  roleIconCircle: {
    width: 52, height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIcon: { fontSize: 26 },
  roleTextWrap: { flex: 1 },
  roleTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs },
  roleTitle: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginRight: Spacing.sm,
  },
  roleBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  roleBadgeText: { fontSize: 10, fontWeight: Typography.bold },
  roleDesc: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  arrow: { fontSize: 28, fontWeight: Typography.light },

  footer: {
    textAlign: 'center',
    fontSize: Typography.xs,
    color: Colors.textMuted,
    marginTop: Spacing.md,
  },
});

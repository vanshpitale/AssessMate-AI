// src/screens/LoginScreen.js – Production UX upgrade
import React, { useState, useRef, useEffect } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity,
  StyleSheet, Animated, ActivityIndicator, Modal, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../config/api';
import { storeAuthData } from '../utils/asyncStorageHelper';
import { Colors, Typography, Spacing, Radius, Shadow } from '../theme';
import InputField from '../components/ui/InputField';
import PrimaryButton from '../components/ui/PrimaryButton';
import Dropdown from '../components/Dropdown';

export default function LoginScreen({ nav }) {
  const userType = nav.params?.userType || 'teacher';
  const isTeacher = userType === 'teacher';

  const [email,     setEmail]     = useState(isTeacher ? 'pushkarjaju@ves.ac.in' : 'student@ves.ac.in');
  const [password,  setPassword]  = useState(isTeacher ? 'Pushkar01' : 'Student001');
  const [institute, setInstitute] = useState('vesit');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const instituteOptions = [
    { label: 'VESIT, MCA', value: 'vesit' },
    { label: 'SPPU, BSc',  value: 'sppu' },
    { label: 'IIT Bombay', value: 'iitb' },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8,   useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }
    setError('');
    setLoading(true);
    
    try {
      const endpoint = isTeacher ? '/auth/teacher-login' : '/auth/student-login';
      
      const response = await api.post(endpoint, {
        email_or_enrollment: email.trim(),
        password: password
      });

      const { token, role } = response.data;
      
      // Store token
      await storeAuthData(token, role);

      // Navigate
      if (role === 'student') {
        nav.replace('StudentMain', { userType: 'student' });
      } else {
        nav.replace('Main', { userType: 'teacher' });
      }
    } catch (err) {
      console.error('Login error:', err);
      // Determine error message from the backend if available
      if (err.message === 'Network Error') {
        setError('Cannot connect to server. Ensure phone & PC are on the same Wi-Fi.');
      } else {
        const msg = err.response?.data?.message || 'Network error or invalid credentials.';
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const accentColor = isTeacher ? Colors.primary : Colors.secondary;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Decorative background */}
      <View style={[styles.heroBg, { backgroundColor: accentColor }]}>
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero header */}
        <Animated.View style={[styles.heroSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.logoWrap}>
            <Text style={styles.logoEmoji}>🎓</Text>
          </View>
          <Text style={styles.appName}>AssessMate AI</Text>
          <View style={[styles.portalBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={styles.portalBadgeText}>
              {isTeacher ? '👨‍🏫 Teacher Portal' : '🎓 Student Portal'}
            </Text>
          </View>
        </Animated.View>

        {/* Form card */}
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.cardTitle}>Sign in to continue</Text>
          <Text style={styles.cardSubtitle}>
            Welcome back! Enter your credentials below.
          </Text>

          {/* Error banner */}
          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorMsg}>{error}</Text>
            </View>
          ) : null}

          <View style={{ marginTop: Spacing.md }}>
            <Dropdown
              label="Institute"
              options={instituteOptions}
              selectedValue={institute}
              onValueChange={setInstitute}
            />
          </View>

          <InputField
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@institute.ac.in"
            keyboardType="email-address"
            leftIcon={<Text style={styles.inputIcon}>✉️</Text>}
            error={error && !email.trim() ? 'Required' : ''}
          />

          <InputField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
            error={error && !password.trim() ? 'Required' : ''}
          />

          <PrimaryButton
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: Spacing.lg }}
            variant={isTeacher ? 'primary' : 'secondary'}
          />

          <View style={styles.links}>
            <TouchableOpacity>
              <Text style={[styles.link, { color: accentColor }]}>Forgot password?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => nav.push('Signup', { role: isTeacher ? 'teacher' : 'student' })}>
              <Text style={[styles.link, { color: accentColor }]}>Create account</Text>
            </TouchableOpacity>
          </View>

          {/* Back to role selection */}
          <TouchableOpacity style={styles.backRow} onPress={() => nav.replace('RoleSelection')}>
            <Text style={styles.backText}>← Choose a different role</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Bottom padding */}
        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },

  // Background hero
  heroBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 240,
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute', top: -60, right: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  bgCircle2: {
    position: 'absolute', top: 60, left: -80,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  logoWrap: {
    width: 84, height: 84,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoEmoji: { fontSize: 40 },
  appName: {
    fontSize: Typography.xxl,
    fontWeight: Typography.extraBold,
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
  },
  portalBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  portalBadgeText: {
    color: '#fff',
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
  },

  // Form card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    padding: Spacing.lg,
    ...Shadow.lg,
  },
  cardTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },

  // Error
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dangerSurface,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.danger,
  },
  errorIcon: { fontSize: 14, marginRight: Spacing.sm },
  errorMsg: {
    flex: 1,
    fontSize: Typography.sm,
    color: Colors.danger,
    fontWeight: Typography.medium,
  },

  inputIcon: { fontSize: 16 },

  // Links
  links: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  link: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
  },

  backRow: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  backText: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    fontWeight: Typography.medium,
  },
});

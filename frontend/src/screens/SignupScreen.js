import React, { useState, useRef, useEffect } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity,
  StyleSheet, Animated, Platform, KeyboardAvoidingView, Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../config/api';
import { storeAuthData } from '../utils/asyncStorageHelper';
import { isValidEmail, validatePassword } from '../utils/validationUtils';
import { Colors, Typography, Spacing, Radius, Shadow } from '../theme';
import InputField from '../components/ui/InputField';
import PrimaryButton from '../components/ui/PrimaryButton';
import Dropdown from '../components/Dropdown';

export default function SignupScreen({ nav }) {
  // Determine initial role directly from navigation parameters to fix toggle bug
  const initialRole = nav.params?.role || 'teacher';
  const [role, setRole] = useState(initialRole);
  
  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [institute, setInstitute] = useState('vesit');
  
  // Teacher Extra
  const [department, setDepartment] = useState('mca');
  
  // Student Extra
  const [enrollmentId, setEnrollmentId] = useState('');
  const [section, setSection] = useState('A');

  // UI State
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  
  // Refs for Auto-Focus Next Field Chaining
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const enrollmentRef = useRef(null);

  // Animations
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const instituteOptions = [
    { label: 'VESIT', value: 'vesit' },
    { label: 'SPPU',  value: 'sppu' },
    { label: 'IIT Bombay', value: 'iitb' },
  ];

  const departmentOptions = [
    { label: 'MCA', value: 'mca' },
    { label: 'Computer Engineering', value: 'cmpn' },
    { label: 'Information Technology', value: 'inft' },
  ];

  const sectionOptions = [
    { label: 'Division A', value: 'A' },
    { label: 'Division B', value: 'B' },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8,   useNativeDriver: true }),
    ]).start();
  }, []);

  // Basic Password Strength UI
  const getPasswordStrength = (pwd) => {
    if (pwd.length === 0) return { label: '', color: 'transparent', width: '0%' };
    const val = validatePassword(pwd);
    if (!val.isValid && pwd.length < 8) return { label: 'Weak', color: Colors.danger, width: '33%' };
    if (!val.isValid) return { label: 'Fair', color: Colors.warning, width: '66%' };
    return { label: 'Strong', color: Colors.success, width: '100%' };
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setGlobalError('');
    setFieldErrors({});
  };

  const handleSignup = async () => {
    Keyboard.dismiss();
    setGlobalError('');
    setFieldErrors({});
    let errors = {};

    // 1. Name Validation
    if (!name.trim()) errors.name = 'Name is required.';
    else if (name.trim().length < 3) errors.name = 'Name must be at least 3 characters.';

    // 2. Email Validation
    if (!email.trim()) errors.email = 'Email is required.';
    else if (!isValidEmail(email.trim())) Object.assign(errors, { email: 'Please enter a valid email address.' });

    // 3. Password Validation
    const pwdCheck = validatePassword(password);
    if (!password) {
      errors.password = 'Password is required.';
    } else if (!pwdCheck.isValid) {
      errors.password = pwdCheck.message;
    }

    // 4. Confirm Password Validation
    if (!confirmPassword) errors.confirmPassword = 'Confirm your password.';
    else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';

    // 5. Role Specific Validation
    if (role === 'student') {
      if (!enrollmentId.trim()) errors.enrollmentId = 'Enrollment ID is required.';
      if (!section.trim()) errors.section = 'Section is required.';
    } else if (role === 'teacher') {
      if (!department.trim()) errors.department = 'Department is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setGlobalError('Please fix the highlighted errors above.');
      return;
    }

    // -- All Validations Pass -> Proceed with API Call --
    setLoading(true);

    try {
      const endpoint = role === 'teacher' ? '/auth/teacher-register' : '/auth/student-register';
      
      const payload = role === 'teacher' 
        ? {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            institute,
            department
          }
        : {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            institute,
            enrollmentId: enrollmentId.trim(),
            section
          };

      const response = await api.post(endpoint, payload);
      const { token, role: returnedRole } = response.data;
      
      await storeAuthData(token, returnedRole);
      setSuccessMsg('Account created successfully!');
      
      // Delay navigation briefly to show positive reinforcement
      setTimeout(() => {
        if (returnedRole === 'student') {
          nav.replace('StudentMain', { userType: 'student' });
        } else {
          nav.replace('Main', { userType: 'teacher' });
        }
      }, 1000);

    } catch (err) {
      console.error('Signup error:', err);
      if (err.message === 'Network Error') {
        setGlobalError('Cannot connect to server. Ensure phone & PC are on the same Wi-Fi.');
      } else {
        const msg = err.response?.data?.message || 'Network error failed to create account.';
        setGlobalError(msg);
      }
      setLoading(false);
    }
  };

  const accentColor = role === 'teacher' ? Colors.primary : Colors.secondary;
  const pwStrength = getPasswordStrength(password);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
          <Animated.View style={[styles.heroSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.appName}>Create Account</Text>
            <Text style={styles.heroSubText}>Join AssessMate AI today</Text>
          </Animated.View>

          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            
            {/* Role Toggle Header */}
            <View style={styles.roleToggleContainer}>
              <TouchableOpacity 
                style={[styles.roleButton, role === 'teacher' && styles.roleButtonActiveTeacher]} 
                onPress={() => handleRoleChange('teacher')}
              >
                <Text style={[styles.roleButtonText, role === 'teacher' && styles.roleButtonTextActive]}>Teacher</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.roleButton, role === 'student' && styles.roleButtonActiveStudent]} 
                onPress={() => handleRoleChange('student')}
              >
                <Text style={[styles.roleButtonText, role === 'student' && styles.roleButtonTextActive]}>Student</Text>
              </TouchableOpacity>
            </View>

            {/* Error or Success banners */}
            {successMsg ? (
              <View style={[styles.errorBanner, { backgroundColor: Colors.success + '20', borderLeftColor: Colors.success }]}>
                <Text style={styles.errorIcon}>✅</Text>
                <Text style={[styles.errorMsg, { color: Colors.success }]}>{successMsg}</Text>
              </View>
            ) : globalError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorMsg}>{globalError}</Text>
              </View>
            ) : null}

            {/* Common Fields */}
            <InputField
              label="Full Name"
              value={name}
              onChangeText={(text) => { setName(text); setFieldErrors(e => ({ ...e, name: '' })); }}
              placeholder="Rohan Kumar"
              leftIcon={<Text style={styles.inputIcon}>👤</Text>}
              error={fieldErrors.name}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />

            <InputField
              ref={emailRef}
              label="Email Address"
              value={email}
              onChangeText={(text) => { setEmail(text); setFieldErrors(e => ({ ...e, email: '' })); }}
              placeholder="you@institute.ac.in"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Text style={styles.inputIcon}>✉️</Text>}
              error={fieldErrors.email}
              returnKeyType="next"
              onSubmitEditing={() => {
                if(role === 'student') enrollmentRef.current?.focus();
                else passwordRef.current?.focus();
              }}
            />

            <View style={{ marginBottom: Spacing.md }}>
              <Dropdown
                label="Institute"
                options={instituteOptions}
                selectedValue={institute}
                onValueChange={setInstitute}
              />
            </View>

            {/* Role Specific Fields */}
            {role === 'teacher' ? (
              <View style={{ marginBottom: Spacing.md }}>
                <Dropdown
                  label="Department"
                  options={departmentOptions}
                  selectedValue={department}
                  onValueChange={(val) => { setDepartment(val); setFieldErrors(e => ({ ...e, department: '' })); }}
                />
                {fieldErrors.department && <Text style={styles.errorTextLone}>{fieldErrors.department}</Text>}
              </View>
            ) : (
              <>
                <InputField
                  ref={enrollmentRef}
                  label="Enrollment ID"
                  value={enrollmentId}
                  onChangeText={(text) => { setEnrollmentId(text); setFieldErrors(e => ({ ...e, enrollmentId: '' })); }}
                  placeholder="Ex. 2024MCA001"
                  autoCapitalize="characters"
                  leftIcon={<Text style={styles.inputIcon}>🆔</Text>}
                  error={fieldErrors.enrollmentId}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
                <View style={{ marginBottom: Spacing.md }}>
                  <Dropdown
                    label="Section / Division"
                    options={sectionOptions}
                    selectedValue={section}
                    onValueChange={(val) => { setSection(val); setFieldErrors(e => ({ ...e, section: '' })); }}
                  />
                  {fieldErrors.section && <Text style={styles.errorTextLone}>{fieldErrors.section}</Text>}
                </View>
              </>
            )}

            {/* Password Fields */}
            <InputField
              ref={passwordRef}
              label="Password"
              value={password}
              onChangeText={(text) => { setPassword(text); setFieldErrors(e => ({ ...e, password: '' })); }}
              placeholder="••••••••"
              secureTextEntry
              leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
              error={fieldErrors.password}
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
            />

            {/* Basic Password Strength Indicator */}
            {password.length > 0 && !fieldErrors.password && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBarBackground}>
                  <View style={[styles.strengthBarFill, { width: pwStrength.width, backgroundColor: pwStrength.color }]} />
                </View>
                <Text style={[styles.strengthText, { color: pwStrength.color }]}>{pwStrength.label}</Text>
              </View>
            )}

            <InputField
              ref={confirmPasswordRef}
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={(text) => { setConfirmPassword(text); setFieldErrors(e => ({ ...e, confirmPassword: '' })); }}
              placeholder="••••••••"
              secureTextEntry
              leftIcon={<Text style={styles.inputIcon}>🔐</Text>}
              error={fieldErrors.confirmPassword}
              returnKeyType="done"
              onSubmitEditing={handleSignup}
            />

            <PrimaryButton
              title="Create Account"
              onPress={handleSignup}
              loading={loading}
              disabled={loading || !!successMsg}
              style={{ marginTop: Spacing.md }}
              variant={role === 'teacher' ? 'primary' : 'secondary'}
            />

            <TouchableOpacity style={styles.backRow} onPress={() => nav.pop()}>
              <Text style={styles.backText}>Already have an account? Sign In</Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={{ height: Spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  // Hero
  heroBg: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 200, overflow: 'hidden',
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
  heroSection: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  appName: {
    fontSize: Typography.xxl,
    fontWeight: Typography.extraBold,
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: Spacing.xs,
  },
  heroSubText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: Typography.base,
    fontWeight: Typography.medium,
  },
  
  // Card elements
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    padding: Spacing.lg,
    ...Shadow.lg,
  },
  roleToggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  roleButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  roleButtonActiveTeacher: {
    backgroundColor: Colors.primary,
    ...Shadow.sm,
  },
  roleButtonActiveStudent: {
    backgroundColor: Colors.secondary,
    ...Shadow.sm,
  },
  roleButtonText: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.textMuted,
  },
  roleButtonTextActive: {
    color: '#fff',
  },

  // Errors
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dangerSurface,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
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
  errorTextLone: {
    fontSize: Typography.xs,
    color: Colors.danger,
    marginTop: -Spacing.xs,
    marginBottom: Spacing.xs,
    fontWeight: Typography.medium,
  },
  inputIcon: { fontSize: 16 },

  // Password Strength
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: -Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  strengthBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginRight: Spacing.md,
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  strengthText: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    width: 40,
    textAlign: 'right',
  },

  // Interactions
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
    fontWeight: Typography.semiBold,
  },
});

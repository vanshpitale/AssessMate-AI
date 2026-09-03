// src/screens/ProfileScreen.js – Dynamic Profile screen
import React, { useState, useRef, useEffect } from 'react';
import {
  ScrollView, Text, View, TouchableOpacity, StyleSheet,
  Modal, Animated, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, Shadow } from '../theme';
import Badge from '../components/ui/Badge';
import api from '../config/api';
import { handleLogout } from '../utils/logoutHandler';

// Animated Toggle Switch
function ToggleSwitch({ value, onValueChange, color }) {
  const slideAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  const toggle = () => {
    const newVal = !value;
    Animated.spring(slideAnim, {
      toValue: newVal ? 1 : 0,
      useNativeDriver: false,
      friction: 6,
    }).start();
    onValueChange(newVal);
  };

  const translateX = slideAnim.interpolate({ inputRange: [0, 1], outputRange: [2, 22] });
  const trackColor = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.border, color || Colors.primary],
  });

  return (
    <TouchableOpacity onPress={toggle} activeOpacity={0.8}>
      <Animated.View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View style={[styles.thumb, { transform: [{ translateX }] }]} />
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ nav, userType }) {
  const [allowAuto,       setAllowAuto]       = useState(true);
  const [manualApproval,  setManualApproval]  = useState(false);
  const [notifications,   setNotifications]   = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    evaluatedCount: 0,
    averageScore: '0%'
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const meRes = await api.get('/auth/me');
      setProfile(meRes.data);
      if (meRes.data.role === 'teacher') {
        const statsRes = await api.get('/teacher/dashboard');
        setStats({
          evaluatedCount: statsRes.data.completedEvaluations || 0,
          averageScore: statsRes.data.averageScore || '0%'
        });
      } else {
        const reportsRes = await api.get('/student/reports');
        const reports = reportsRes.data.reports || [];
        if (reports.length > 0) {
          const sum = reports.reduce((acc, r) => acc + (r.obtainedMarks || 0), 0);
          const max = reports.reduce((acc, r) => acc + (r.totalMarks || 100), 0);
          setStats({
            evaluatedCount: reports.length,
            averageScore: max > 0 ? Math.round((sum / max) * 100) + '%' : '0%'
          });
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const isStudent = profile?.role === 'student';

  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AD';

  const name  = profile?.name || (isStudent ? 'Student' : 'Teacher');
  const role  = isStudent 
    ? `Enrollment ID: ${profile?.enrollmentId || 'N/A'}` 
    : `${profile?.department || 'MCA'} · ${profile?.institute?.toUpperCase() || 'VESIT'}`;
  const email = profile?.email || '';

  const onLogoutConfirm = async () => {
    setShowLogoutModal(false);
    await handleLogout(nav);
  };

  return (
    <View style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Avatar Header ── */}
        <View style={styles.heroHeader}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />
          <View style={styles.heroContent}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.heroName}>{name}</Text>
            <Text style={styles.heroRole}>{role}</Text>
            <Text style={styles.heroEmail}>{email}</Text>
            <View style={styles.heroBadgeRow}>
              <Badge
                label={isStudent ? '🎓 Student' : '👨‍🏫 Teacher'}
                variant="primary"
                style={{ marginRight: Spacing.sm }}
              />
              <Badge label="Pro Plan" variant="success" dot />
            </View>
          </View>
        </View>

        <View style={styles.bodyPad}>

          {/* ── Usage Stats ── */}
          <View style={styles.statsRow}>
            <StatPill icon="📝" value={String(stats.evaluatedCount)} label={isStudent ? 'Tests Graded' : 'Evaluations'} />
            <StatPill icon="⭐" value={stats.averageScore} label="Avg Score" />
            <StatPill icon="📅" value={isStudent ? (profile?.section || 'A') : 'MCA'} label={isStudent ? 'Section' : 'Dept'} />
          </View>

          {/* ── Student Academic Info ── */}
          {isStudent && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Academic Details</Text>
              <InfoRow label="Enrollment ID" value={profile?.enrollmentId || 'N/A'} />
              <InfoRow label="Section"       value={profile?.section || 'A'} />
              <InfoRow label="Institute"     value={profile?.institute?.toUpperCase() || 'VESIT'} />
            </View>
          )}

          {/* ── AI Settings (Teacher only) ── */}
          {!isStudent && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>AI Configuration</Text>
              <SettingRow
                label="Allow AI auto-feedback drafts"
                description="Gemini AI will suggest feedback automatically"
                value={allowAuto}
                onChange={setAllowAuto}
              />
              <View style={styles.divider} />
              <SettingRow
                label="Require manual approval"
                description="Review before scores are published"
                value={manualApproval}
                onChange={setManualApproval}
              />
            </View>
          )}

          {/* ── Preferences ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Preferences</Text>
            <SettingRow
              label="Push notifications"
              description="Evaluation updates and alerts"
              value={notifications}
              onChange={setNotifications}
            />
          </View>

          {/* ── Teacher-only actions ── */}
          {!isStudent && (
            <TouchableOpacity style={styles.actionBtn} onPress={() => nav.push('NewEvaluation')}>
              <Text style={styles.actionBtnIcon}>🗝️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionBtnLabel}>Manage Answer Keys & Rubrics</Text>
                <Text style={styles.actionBtnDesc}>Configure marking schemes</Text>
              </View>
              <Text style={styles.actionChevron}>›</Text>
            </TouchableOpacity>
          )}

          {/* ── Logout ── */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => setShowLogoutModal(true)}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          <Text style={styles.version}>AssessMate AI v1.0 · © 2026 VESIT</Text>
        </View>
      </ScrollView>

      {/* ── Logout Confirmation Modal ── */}
      <Modal
        transparent
        visible={showLogoutModal}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalIcon}>🚪</Text>
            <Text style={styles.modalTitle}>Log Out</Text>
            <Text style={styles.modalDesc}>Are you sure you want to log out of AssessMate AI?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalLogoutBtn} onPress={onLogoutConfirm}>
                <Text style={styles.modalLogoutText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function StatPill({ icon, value, label }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statPillIcon}>{icon}</Text>
      <Text style={styles.statPillValue}>{value}</Text>
      <Text style={styles.statPillLabel}>{label}</Text>
    </View>
  );
}

function SettingRow({ label, description, value, onChange }) {
  return (
    <View style={styles.settingRow}>
      <View style={{ flex: 1, marginRight: Spacing.md }}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && <Text style={styles.settingDesc}>{description}</Text>}
      </View>
      <ToggleSwitch value={value} onValueChange={onChange} />
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  loadingText: { marginTop: Spacing.md, fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },

  // Hero header
  heroHeader: {
    backgroundColor: Colors.primary,
    overflow: 'hidden',
    paddingBottom: Spacing.xl,
  },
  heroCircle1: {
    position: 'absolute', top: -40, right: -40,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroCircle2: {
    position: 'absolute', bottom: -20, left: -50,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(124,58,237,0.25)',
  },
  heroContent: { alignItems: 'center', paddingTop: Spacing.xl, paddingHorizontal: Spacing.lg },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText: { color: '#fff', fontSize: Typography.xl, fontWeight: Typography.bold },
  heroName: { color: '#fff', fontSize: Typography.md, fontWeight: Typography.bold, marginBottom: 2 },
  heroRole: { color: 'rgba(255,255,255,0.7)', fontSize: Typography.xs, marginBottom: 4 },
  heroEmail: { color: 'rgba(255,255,255,0.6)', fontSize: Typography.xs, marginBottom: Spacing.sm },
  heroBadgeRow: { flexDirection: 'row', alignItems: 'center' },

  bodyPad: { padding: Spacing.md },

  // Usage stats
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statPill: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.sm, alignItems: 'center', ...Shadow.sm,
  },
  statPillIcon: { fontSize: 16, marginBottom: 4 },
  statPillValue: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary },
  statPillLabel: { fontSize: 9, color: Colors.textMuted, textTransform: 'uppercase', marginTop: 2 },

  // Card
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, ...Shadow.sm, marginBottom: Spacing.md },
  cardTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.sm },

  // Toggle Switch
  track: { width: 48, height: 28, borderRadius: 14, padding: 2 },
  thumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', ...Shadow.sm },

  // Settings
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingLabel: { fontSize: Typography.sm, color: Colors.textPrimary, fontWeight: Typography.semiBold },
  settingDesc: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },

  // Info row
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs },
  infoLabel: { fontSize: Typography.xs, color: Colors.textSecondary },
  infoValue: { fontSize: Typography.xs, color: Colors.textPrimary, fontWeight: Typography.semiBold },

  // Action button
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: Radius.lg, padding: Spacing.md, ...Shadow.sm, marginBottom: Spacing.md,
  },
  actionBtnIcon: { fontSize: 20, marginRight: Spacing.md },
  actionBtnLabel: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary },
  actionBtnDesc: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  actionChevron: { fontSize: 20, color: Colors.textMuted, marginLeft: Spacing.md },

  // Logout button
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.dangerSurface, borderWidth: 1.5, borderColor: Colors.danger + '30',
    borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.xl,
  },
  logoutIcon: { fontSize: 18, marginRight: Spacing.sm },
  logoutText: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.danger },

  version: { fontSize: 10, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.md },

  // Modal logout
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.xl, width: '80%', alignItems: 'center', ...Shadow.lg },
  modalIcon: { fontSize: 32, marginBottom: Spacing.sm },
  modalTitle: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  modalDesc: { fontSize: Typography.sm, color: Colors.textMuted, textAlign: 'center', marginBottom: Spacing.lg, lineHeight: 20 },
  modalActions: { flexDirection: 'row', gap: Spacing.sm },
  modalCancelBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  modalCancelText: { fontSize: Typography.xs, color: Colors.textSecondary, fontWeight: Typography.bold },
  modalLogoutBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: Radius.md, backgroundColor: Colors.danger },
  modalLogoutText: { fontSize: Typography.xs, color: '#fff', fontWeight: Typography.bold },
});
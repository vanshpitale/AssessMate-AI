// src/screens/ProfileScreen.js – Production upgrade
import React, { useState, useRef } from 'react';
import {
  ScrollView, Text, View, TouchableOpacity, StyleSheet,
  Modal, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, Shadow } from '../theme';
import Badge from '../components/ui/Badge';
import PrimaryButton from '../components/ui/PrimaryButton';
import { getStudentInfo } from '../utils/StudentDataStore';

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

  const isStudent = userType === 'student';
  const studentInfo = isStudent ? getStudentInfo() : null;

  const initials = isStudent
    ? studentInfo.name.split(' ').map(n => n[0]).join('').slice(0, 2)
    : 'AD';

  const name  = isStudent ? studentInfo.name  : 'Dr. Anjali Deshpande';
  const role  = isStudent ? `${studentInfo.course} · ${studentInfo.semester}` : 'MCA Department · VESIT';
  const email = isStudent ? studentInfo.email : 'anjali.deshpande@ves.ac.in';

  const handleLogout = () => {
    setShowLogoutModal(false);
    nav.resetTo('RoleSelection');
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
            <StatPill icon="📝" value={isStudent ? '8' : '128'} label={isStudent ? 'Tests' : 'Evaluated'} />
            <StatPill icon="⭐" value={isStudent ? '76%' : '71%'} label="Avg Score" />
            <StatPill icon="📅" value={isStudent ? 'Sem II' : '18'} label={isStudent ? 'Semester' : 'This Month'} />
          </View>

          {/* ── Student Roll Info ── */}
          {isStudent && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Academic Details</Text>
              <InfoRow label="Roll Number" value={studentInfo.rollNumber} />
              <InfoRow label="Division"    value={studentInfo.division || 'A'} />
              <InfoRow label="Year"        value={studentInfo.year    || 'MCA-I'} />
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

          {/* ── Notifications ── */}
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
            <TouchableOpacity style={styles.actionBtn}>
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

          <Text style={styles.version}>AssessMate AI v1.0 · © 2025 VESIT</Text>
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
              <TouchableOpacity style={styles.modalLogoutBtn} onPress={handleLogout}>
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
    marginBottom: Spacing.md,
  },
  avatarText:  { color: '#fff', fontSize: Typography.xl, fontWeight: Typography.extraBold },
  heroName:    { color: '#fff', fontSize: Typography.xl, fontWeight: Typography.bold, marginBottom: 2 },
  heroRole:    { color: 'rgba(255,255,255,0.7)', fontSize: Typography.sm },
  heroEmail:   { color: 'rgba(255,255,255,0.6)', fontSize: Typography.xs, marginTop: 2, marginBottom: Spacing.md },
  heroBadgeRow:{ flexDirection: 'row', alignItems: 'center' },

  bodyPad: { padding: Spacing.md },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    marginTop: -Spacing.xl,
  },
  statPill: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadow.md,
  },
  statPillIcon:  { fontSize: 18, marginBottom: 4 },
  statPillValue: { fontSize: Typography.md, fontWeight: Typography.extraBold, color: Colors.textPrimary },
  statPillLabel: { fontSize: 9, color: Colors.textMuted, textTransform: 'uppercase', fontWeight: Typography.medium, marginTop: 2 },

  // Card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  cardTitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.sm },

  // Setting row
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.xs },
  settingLabel: { fontSize: Typography.sm, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  settingDesc:  { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },

  // Toggle
  track: {
    width: 48, height: 28, borderRadius: 14,
    justifyContent: 'center',
  },
  thumb: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#fff',
    ...Shadow.sm,
  },

  // Info row
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  infoLabel: { fontSize: Typography.sm, color: Colors.textMuted },
  infoValue: { fontSize: Typography.sm, fontWeight: Typography.semiBold, color: Colors.textPrimary },

  // Action button
  actionBtn: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  actionBtnIcon:   { fontSize: 22, marginRight: Spacing.md },
  actionBtnLabel:  { fontSize: Typography.sm, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  actionBtnDesc:   { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  actionChevron:   { fontSize: 22, color: Colors.textMuted },

  // Logout button
  logoutBtn: {
    backgroundColor: Colors.dangerSurface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.danger + '40',
  },
  logoutIcon: { fontSize: 18, marginRight: Spacing.sm },
  logoutText: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.danger },

  version: {
    textAlign: 'center',
    fontSize: Typography.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.xl,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    ...Shadow.lg,
  },
  modalIcon:  { fontSize: 40, marginBottom: Spacing.md },
  modalTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  modalDesc:  { fontSize: Typography.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.lg },
  modalActions: { flexDirection: 'row', gap: Spacing.sm, width: '100%' },
  modalCancelBtn: {
    flex: 1, padding: 14, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center',
  },
  modalCancelText: { fontSize: Typography.base, fontWeight: Typography.semiBold, color: Colors.textSecondary },
  modalLogoutBtn: {
    flex: 1, padding: 14, borderRadius: Radius.md,
    backgroundColor: Colors.danger,
    alignItems: 'center',
  },
  modalLogoutText: { fontSize: Typography.base, fontWeight: Typography.bold, color: '#fff' },
});
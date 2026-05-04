// src/screens/StudentHomeScreen.js – Design system upgrade
import React, { useState } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet, RefreshControl,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '../theme';
import { getStudentInfo, getStudentStats } from '../utils/StudentDataStore';
import Badge from '../components/ui/Badge';
import ProgressIndicator from '../components/ui/ProgressIndicator';
import SectionHeader from '../components/ui/SectionHeader';

export default function StudentHomeScreen({ nav }) {
  const student = getStudentInfo();
  const stats = getStudentStats();
  const [refreshing, setRefreshing] = useState(false);

  const initials = student.name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const avgPct = stats.averageScore;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <View style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.secondary} />}
      >
        {/* ── Hero Header ── */}
        <View style={styles.hero}>
          <View style={styles.heroBg1} />
          <View style={styles.heroBg2} />
          <View style={styles.heroContent}>
            <View style={styles.heroTop}>
              <View style={styles.greetWrap}>
                <Text style={styles.greetSmall}>Welcome back 👋</Text>
                <Text style={styles.greetName}>{student.name}</Text>
                <Text style={styles.greetSub}>{student.course} · {student.semester}</Text>
              </View>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {/* ── Stats strip ── */}
          <View style={styles.statsRow}>
            <StatBox icon="📝" label="Total Tests" value={String(stats.totalEvaluations)} accent={Colors.secondary} />
            <StatBox icon="⭐" label="Avg Score"   value={`${avgPct}%`}                  accent={Colors.primary} />
            <StatBox icon="📅" label="Semester"    value={student.semester?.split(' ').pop() || 'II'}  accent={Colors.success} />
          </View>

          {/* ── Performance bar ── */}
          <View style={styles.perfCard}>
            <View style={styles.perfRow}>
              <Text style={styles.perfTitle}>Your Performance</Text>
              <Badge label={avgPct >= 70 ? 'Good' : avgPct >= 50 ? 'Average' : 'Needs Work'} variant={avgPct >= 70 ? 'success' : avgPct >= 50 ? 'warning' : 'danger'} />
            </View>
            <ProgressIndicator value={avgPct} label="Overall Average" style={{ marginTop: Spacing.md }} />
          </View>

          {/* ── Recent Results ── */}
          <SectionHeader title="Recent Results" action="See all →" onAction={() => nav.switchTab('Results')} style={{ marginTop: Spacing.md }} />
          {stats.recentResults.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyTitle}>No results yet</Text>
              <Text style={styles.emptyDesc}>Your graded evaluations will appear here.</Text>
            </View>
          ) : (
            stats.recentResults.map(result => {
              const pct = Math.round((result.obtainedMarks / result.totalMarks) * 100);
              return (
                <TouchableOpacity
                  key={result.id}
                  style={styles.resultCard}
                  onPress={() => nav.push('StudentResultDetail', { resultId: result.id })}
                  activeOpacity={0.85}
                >
                  <View style={[styles.resultStrip, { backgroundColor: pct >= 70 ? Colors.success : Colors.warning }]} />
                  <View style={styles.resultBody}>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultName} numberOfLines={1}>{result.name}</Text>
                      <Text style={[styles.resultPct, { color: pct >= 70 ? Colors.success : Colors.warning }]}>{pct}%</Text>
                    </View>
                    <View style={styles.resultMetaRow}>
                      <Text style={styles.resultDate}>{new Date(result.date).toLocaleDateString()}</Text>
                      <Text style={styles.resultScore}>{result.obtainedMarks}/{result.totalMarks}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}

          {/* ── Quick Actions ── */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => nav.switchTab('Results')}>
              <Text style={styles.actionIcon}>📈</Text>
              <Text style={styles.actionLabel}>All Results</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary]} onPress={() => nav.switchTab('Sheets')}>
              <Text style={styles.actionIcon}>📄</Text>
              <Text style={[styles.actionLabel, styles.actionLabelSecondary]}>My Sheets</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: Spacing.xl }} />
        </View>
      </ScrollView>
    </View>
  );
}

function StatBox({ icon, label, value, accent }) {
  return (
    <View style={[styles.statBox, { borderColor: accent + '25' }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  hero: { backgroundColor: Colors.secondary, overflow: 'hidden', paddingBottom: Spacing.xl + Spacing.md },
  heroBg1: { position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.08)' },
  heroBg2: { position: 'absolute', bottom: -20, left: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(79,70,229,0.2)' },
  heroContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greetWrap: {},
  greetSmall: { color: 'rgba(255,255,255,0.7)', fontSize: Typography.sm },
  greetName:  { color: '#fff', fontSize: Typography.xl, fontWeight: Typography.bold, marginTop: 2 },
  greetSub:   { color: 'rgba(255,255,255,0.65)', fontSize: Typography.xs, marginTop: 2 },
  avatarCircle: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: Typography.bold },

  body: { padding: Spacing.md, marginTop: -Spacing.lg },

  // Stats
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    alignItems: 'center',
    ...Shadow.md,
    borderWidth: 1,
  },
  statIcon:  { fontSize: 18, marginBottom: 4 },
  statValue: { fontSize: Typography.md, fontWeight: Typography.extraBold },
  statLabel: { fontSize: 9, color: Colors.textMuted, textTransform: 'uppercase', fontWeight: Typography.medium, marginTop: 2 },

  // Perf card
  perfCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
    marginBottom: Spacing.md,
  },
  perfRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  perfTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary },

  // Result cards
  resultCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
    overflow: 'hidden',
  },
  resultStrip: { width: 4 },
  resultBody: { flex: 1, padding: Spacing.md },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultName: { fontSize: Typography.sm, fontWeight: Typography.semiBold, color: Colors.textPrimary, flex: 1, marginRight: 8 },
  resultPct:  { fontSize: Typography.md, fontWeight: Typography.extraBold },
  resultMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  resultDate: { fontSize: Typography.xs, color: Colors.textMuted },
  resultScore:{ fontSize: Typography.xs, color: Colors.textSecondary, fontWeight: Typography.medium },

  // Empty
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadow.sm,
    marginBottom: Spacing.md,
  },
  emptyIcon:  { fontSize: 32, marginBottom: Spacing.sm },
  emptyTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 4 },
  emptyDesc:  { fontSize: Typography.sm, color: Colors.textMuted, textAlign: 'center' },

  // Actions
  actionsRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: Radius.lg, padding: Spacing.md,
    gap: Spacing.sm, ...Shadow.colored,
  },
  actionBtnSecondary: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5, borderColor: Colors.secondary,
    ...Shadow.sm,
  },
  actionIcon:  { fontSize: 18 },
  actionLabel: { fontSize: Typography.sm, fontWeight: Typography.bold, color: '#fff' },
  actionLabelSecondary: { color: Colors.secondary },
});

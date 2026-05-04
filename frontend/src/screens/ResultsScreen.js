// src/screens/ResultsScreen.js – Production upgrade
import React, { useRef, useEffect } from 'react';
import {
  ScrollView, Text, TouchableOpacity, View, StyleSheet, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, Shadow } from '../theme';
import Badge from '../components/ui/Badge';
import ProgressIndicator from '../components/ui/ProgressIndicator';
import BackButton from '../components/ui/BackButton';


const DISTRIBUTION = [
  { range: '18–20', grade: 'A+', count: 6,  percent: 20, color: Colors.success },
  { range: '15–17', grade: 'A',  count: 10, percent: 33, color: '#34D399' },
  { range: '11–14', grade: 'B',  count: 9,  percent: 30, color: Colors.primary },
  { range: '7–10',  grade: 'C',  count: 4,  percent: 13, color: Colors.warning },
  { range: '0–6',   grade: 'F',  count: 1,  percent: 3,  color: Colors.danger },
];

export default function ResultsScreen({ nav }) {
  const scoreAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(scoreAnim, {
      toValue: 1, duration: 700, useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.safe}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <BackButton nav={nav} />
        <Text style={styles.headerTitle}>Evaluation Results</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Hero Score Card ── */}
        <Animated.View style={[styles.heroCard, { opacity: scoreAnim }]}>
          <View style={styles.heroBg1} />
          <View style={styles.heroBg2} />
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>Average Score</Text>
            <Text style={styles.heroScore}>14.2</Text>
            <Text style={styles.heroTotal}> / 20</Text>
            <Badge label="Good Performance ↑" variant="success" style={{ marginTop: Spacing.sm }} />
            <Text style={styles.heroMeta}>30 students · Mid Term · NMCA12</Text>
          </View>
        </Animated.View>

        {/* ── Quick Stats ── */}
        <View style={styles.quickStats}>
          <QuickStat label="Highest" value="19/20" icon="🏆" color={Colors.success} />
          <QuickStat label="Lowest"  value="4/20"  icon="📉" color={Colors.danger} />
          <QuickStat label="Pass Rate" value="97%" icon="✅" color={Colors.primary} />
        </View>

        {/* ── Distribution ── */}
        <View style={styles.section}>
          <ResultSectionHeader title="Score Distribution" subtitle="(Out of 20 marks)" />
          <View style={styles.distCard}>
            {DISTRIBUTION.map(d => (
              <View key={d.range} style={styles.distRow}>
                <View style={styles.distGradeCol}>
                  <Text style={[styles.distGrade, { color: d.color }]}>{d.grade}</Text>
                  <Text style={styles.distRange}>{d.range}</Text>
                </View>
                <View style={styles.distBarWrap}>
                  <ProgressIndicator
                    value={d.percent}
                    showPercent={false}
                    color={d.color}
                    height={10}
                  />
                </View>
                <Text style={[styles.distCount, { color: d.color }]}>{d.count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Overall Progress ── */}
        <View style={styles.section}>
          <ResultSectionHeader title="Overall Progress" />
          <View style={styles.progressCard}>
            <ProgressIndicator value={71} label="Class Pass Rate" style={{ marginBottom: Spacing.md }} />
            <ProgressIndicator value={62} label="Average Marks" color={Colors.secondary} />
          </View>
        </View>

        {/* spacer for sticky footer */}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* ── Sticky Footer ── */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity style={styles.shareBtn}>
          <Text style={styles.shareBtnText}>📤 Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.analysisBtn} onPress={() => nav.push('QuestionAnalysis')}>
          <Text style={styles.analysisBtnText}>📋 Question Analysis →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ResultSectionHeader({ title, subtitle }) {
  return (
    <View style={{ marginBottom: Spacing.sm }}>
      <Text style={shstyles.title}>{title}</Text>
      {subtitle && <Text style={shstyles.subtitle}>{subtitle}</Text>}
    </View>
  );
}
const shstyles = StyleSheet.create({
  title: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary },
  subtitle: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
});

function QuickStat({ label, value, icon, color }) {
  return (
    <View style={[styles.qs, { borderColor: color + '30', backgroundColor: color + '0C' }]}>
      <Text style={styles.qsIcon}>{icon}</Text>
      <Text style={[styles.qsValue, { color }]}>{value}</Text>
      <Text style={styles.qsLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle:{ fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary },

  scroll: { padding: Spacing.md },

  // Hero
  heroCard: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.primary,
    marginBottom: Spacing.md,
    ...Shadow.lg,
  },
  heroBg1: {
    position: 'absolute', top: -40, right: -40,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroBg2: {
    position: 'absolute', bottom: -30, left: -50,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(124,58,237,0.3)',
  },
  heroContent: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  heroLabel: { color: 'rgba(255,255,255,0.75)', fontSize: Typography.sm, fontWeight: Typography.medium },
  heroScore: { color: '#fff', fontSize: 80, fontWeight: Typography.extraBold, lineHeight: 90 },
  heroTotal: { color: 'rgba(255,255,255,0.6)', fontSize: Typography.xl, fontWeight: Typography.medium },
  heroMeta:  { color: 'rgba(255,255,255,0.6)', fontSize: Typography.xs, marginTop: Spacing.sm },

  // Quick stats
  quickStats: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  qs: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
  qsIcon:  { fontSize: 18, marginBottom: 4 },
  qsValue: { fontSize: Typography.md, fontWeight: Typography.extraBold },
  qsLabel: { fontSize: 9, color: Colors.textMuted, textTransform: 'uppercase', fontWeight: Typography.medium },

  // Section
  section: { marginBottom: Spacing.md },

  // Distribution
  distCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  distGradeCol: { width: 44 },
  distGrade:    { fontSize: Typography.sm, fontWeight: Typography.bold },
  distRange:    { fontSize: 9, color: Colors.textMuted },
  distBarWrap:  { flex: 1, marginHorizontal: Spacing.sm },
  distCount:    { width: 24, fontSize: Typography.sm, fontWeight: Typography.bold, textAlign: 'right' },

  // Progress card
  progressCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
  },

  // Sticky footer
  stickyFooter: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    ...Shadow.md,
    shadowOffset: { width: 0, height: -4 },
  },
  shareBtn: {
    paddingVertical: 14, paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnText:    { color: Colors.textSecondary, fontWeight: Typography.semiBold },
  analysisBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.colored,
  },
  analysisBtnText: { color: '#fff', fontWeight: Typography.bold, fontSize: Typography.base },
});
// src/screens/AnalyticsScreen.js – Production upgrade with bar charts & filter chips
import React, { useState } from 'react';
import {
  ScrollView, Text, View, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, Shadow } from '../theme';
import ProgressIndicator from '../components/ui/ProgressIndicator';
import Badge from '../components/ui/Badge';
import SectionHeader from '../components/ui/SectionHeader';

const SUBJECTS = ['All', 'NMCA11', 'NMCA12', 'NMCA13'];
const PERIODS  = ['This Month', 'Last Month', 'Semester'];

// Bar chart data (scores per week)
const CHART_DATA = [
  { label: 'W1', value: 58 },
  { label: 'W2', value: 63 },
  { label: 'W3', value: 71 },
  { label: 'W4', value: 68 },
  { label: 'W5', value: 76 },
  { label: 'W6', value: 74 },
];

const WEAK_AREAS = [
  { topic: 'Hypothesis Testing',     subject: 'NMCA11', score: 52, color: Colors.danger },
  { topic: 'ETL Process Design',     subject: 'NMCA13', score: 58, color: Colors.warning },
  { topic: 'SQL Joins (JDBC)',        subject: 'NMCA12', score: 64, color: Colors.warning },
  { topic: 'Data Visualization',     subject: 'NMCA11', score: 67, color: Colors.primary },
];

const TOP_STUDENTS = [
  { name: 'Priya Sharma',   score: '19.2/20', rank: 1 },
  { name: 'Rohan Mehta',    score: '18.8/20', rank: 2 },
  { name: 'Ananya Gupta',   score: '18.5/20', rank: 3 },
];

export default function AnalyticsScreen() {
  const [activeSubject, setActiveSubject] = useState('All');
  const [activePeriod,  setActivePeriod]  = useState('This Month');

  const maxVal = Math.max(...CHART_DATA.map(d => d.value));

  return (
    <View style={styles.safe}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Badge label="Live Data" variant="success" dot />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Subject filter chips ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
          <View style={styles.chipRow}>
            {SUBJECTS.map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, activeSubject === s && styles.chipActive]}
                onPress={() => setActiveSubject(s)}
              >
                <Text style={[styles.chipText, activeSubject === s && styles.chipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
            <View style={{ width: 4 }} />
            {PERIODS.map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.chip, styles.chipSecondary, activePeriod === p && styles.chipSecondaryActive]}
                onPress={() => setActivePeriod(p)}
              >
                <Text style={[styles.chipText, activePeriod === p && styles.chipTextSecondaryActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* ── Performance Trend (Bar Chart) ── */}
        <View style={styles.section}>
          <SectionHeader title="Performance Trend" action={activePeriod} />
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View>
                <Text style={styles.chartAvg}>76.5%</Text>
                <Text style={styles.chartAvgLabel}>Current Average</Text>
              </View>
              <Badge label="↑ 8.7% vs last month" variant="success" />
            </View>
            <View style={styles.barChart}>
              {CHART_DATA.map((d, i) => (
                <View key={i} style={styles.barWrap}>
                  <Text style={styles.barValue}>{d.value}%</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${(d.value / maxVal) * 100}%`,
                          backgroundColor: i === CHART_DATA.length - 1 ? Colors.primary : Colors.primaryLight,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{d.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Weak Areas ── */}
        <View style={styles.section}>
          <SectionHeader title="Weak Areas" action="See all →" />
          <View style={styles.card}>
            {WEAK_AREAS.map((w, i) => (
              <View key={i} style={[styles.weakRow, i < WEAK_AREAS.length - 1 && styles.weakRowBorder]}>
                <View style={styles.weakLeft}>
                  <Text style={styles.weakTopic}>{w.topic}</Text>
                  <Badge label={w.subject} variant="neutral" style={{ marginTop: 4 }} />
                </View>
                <View style={styles.weakRight}>
                  <Text style={[styles.weakScore, { color: w.color }]}>{w.score}%</Text>
                  <View style={{ width: 80 }}>
                    <ProgressIndicator value={w.score} showPercent={false} color={w.color} height={6} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── Subject Breakdown ── */}
        <View style={styles.section}>
          <SectionHeader title="Subject Breakdown" />
          <View style={styles.card}>
            <ProgressIndicator label="NMCA11 – Statistics"     value={62} style={{ marginBottom: Spacing.md }} />
            <ProgressIndicator label="NMCA12 – Java Full Stack" value={76} color={Colors.success} style={{ marginBottom: Spacing.md }} />
            <ProgressIndicator label="NMCA13 – ETL Engineering" value={58} />
          </View>
        </View>

        {/* ── Top Students ── */}
        <View style={styles.section}>
          <SectionHeader title="Top Performers" />
          <View style={styles.card}>
            {TOP_STUDENTS.map((s, i) => (
              <View key={i} style={[styles.studentRow, i < TOP_STUDENTS.length - 1 && styles.weakRowBorder]}>
                <View style={[styles.rankBadge, { backgroundColor: Colors.primary + (i === 0 ? 'FF' : '80') }]}>
                  <Text style={styles.rankText}>{s.rank}</Text>
                </View>
                <Text style={styles.studentName}>{s.name}</Text>
                <Text style={[styles.studentScore, { color: Colors.success }]}>{s.score}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── AI Insights ── */}
        <View style={[styles.section, { marginBottom: Spacing.xl }]}>
          <SectionHeader title="AI Insights" />
          <View style={styles.insightCard}>
            <Text style={styles.insightHeader}>🤖 Gemini AI Recommendations</Text>
            <Text style={styles.insightItem}>• Focus extra sessions on Hypothesis Testing for NMCA11 (avg 52%).</Text>
            <Text style={styles.insightItem}>• NMCA12 shows improving trend — consider advanced problems next quiz.</Text>
            <Text style={styles.insightItem}>• 3 students consistently scoring below 40%. Consider early intervention.</Text>
          </View>
        </View>

      </ScrollView>
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
  headerTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },

  scroll: { padding: Spacing.md },

  // Filter chips
  chipRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingBottom: 2 },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipActive:   { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipSecondary: {
    backgroundColor: Colors.surface,
    borderColor: Colors.secondary + '60',
  },
  chipSecondaryActive: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
  chipText:             { fontSize: Typography.xs, fontWeight: Typography.medium, color: Colors.textSecondary },
  chipTextActive:       { color: '#fff', fontWeight: Typography.bold },
  chipTextSecondaryActive: { color: '#fff', fontWeight: Typography.bold },

  section: { marginBottom: Spacing.md },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
  },

  // Bar chart
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadow.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  chartAvg:      { fontSize: Typography.xxl, fontWeight: Typography.extraBold, color: Colors.textPrimary },
  chartAvgLabel: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
    justifyContent: 'space-between',
  },
  barWrap: { alignItems: 'center', flex: 1 },
  barValue: { fontSize: 8, color: Colors.textMuted, marginBottom: 4 },
  barTrack: {
    flex: 1, width: 24,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.xs,
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: Radius.xs,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10, color: Colors.textMuted,
    marginTop: 6, fontWeight: Typography.medium,
  },

  // Weak areas
  weakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  weakRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  weakLeft:  { flex: 1 },
  weakRight: { alignItems: 'flex-end', marginLeft: Spacing.sm },
  weakTopic: { fontSize: Typography.sm, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  weakScore: { fontSize: Typography.md, fontWeight: Typography.extraBold, marginBottom: 4 },

  // Top students
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  rankBadge: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  rankText:    { color: '#fff', fontSize: Typography.xs, fontWeight: Typography.bold },
  studentName: { flex: 1, fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.textPrimary },
  studentScore:{ fontSize: Typography.sm, fontWeight: Typography.bold },

  // Insights
  insightCard: {
    backgroundColor: Colors.primarySurface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  insightHeader: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.primary, marginBottom: Spacing.sm },
  insightItem:   { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: 4 },
});
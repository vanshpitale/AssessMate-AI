// src/screens/AnalyticsScreen.js – Dynamic Performance Analytics
import React, { useState, useEffect } from 'react';
import {
  ScrollView, Text, View, TouchableOpacity, StyleSheet, ActivityIndicator
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '../theme';
import ProgressIndicator from '../components/ui/ProgressIndicator';
import Badge from '../components/ui/Badge';
import SectionHeader from '../components/ui/SectionHeader';
import api from '../config/api';

const SUBJECTS = ['All', 'NMCA11', 'NMCA12', 'NMCA13'];
const PERIODS  = ['This Month', 'Last Month', 'Semester'];

export default function AnalyticsScreen() {
  const [activeSubject, setActiveSubject] = useState('All');
  const [activePeriod,  setActivePeriod]  = useState('This Month');
  
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    averageScore: '0%',
    chartData: [],
    weakAreas: [],
    topStudents: [],
    subjectBreakdown: [],
    aiInsights: [],
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teacher/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  const chartData = analytics.chartData || [];
  const maxVal = chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) : 100;

  if (chartData.length === 0) {
    return (
      <View style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics</Text>
          <Badge label="Live Data" variant="success" dot />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>No Analytics Available</Text>
          <Text style={styles.emptyDesc}>Analytics will appear here after student evaluations are completed.</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchAnalytics}>
            <Text style={styles.refreshBtnText}>Tap to Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
          <SectionHeader title="Performance Trend" action="Evaluation-wise" />
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View>
                <Text style={styles.chartAvg}>{analytics.averageScore}</Text>
                <Text style={styles.chartAvgLabel}>Current Average</Text>
              </View>
              <Badge label="Dynamic updates" variant="success" />
            </View>
            <View style={styles.barChart}>
              {chartData.map((d, i) => (
                <View key={i} style={styles.barWrap}>
                  <Text style={styles.barValue}>{d.value}%</Text>
                  <View style={styles.barTrack}>
                    <View
                       style={[
                         styles.barFill,
                         {
                           height: `${maxVal > 0 ? (d.value / maxVal) * 100 : 0}%`,
                           backgroundColor: i === chartData.length - 1 ? Colors.primary : Colors.primaryLight,
                         },
                       ]}
                    />
                  </View>
                  <Text style={styles.barLabel} numberOfLines={1}>{d.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Weak Areas ── */}
        <View style={styles.section}>
          <SectionHeader title="Weak Areas" />
          {analytics.weakAreas.length > 0 ? (
            <View style={styles.card}>
              {analytics.weakAreas.map((w, i) => (
                <View key={i} style={[styles.weakRow, i < analytics.weakAreas.length - 1 && styles.weakRowBorder]}>
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
          ) : (
            <View style={styles.card}>
              <Text style={styles.noWeakText}>🎉 No weak areas identified. Average score is above 65% for all questions.</Text>
            </View>
          )}
        </View>

        {/* ── Subject Breakdown ── */}
        <View style={styles.section}>
          <SectionHeader title="Subject Breakdown" />
          {analytics.subjectBreakdown.length > 0 ? (
            <View style={styles.card}>
              {analytics.subjectBreakdown.map((sb, idx) => (
                <ProgressIndicator
                  key={idx}
                  label={sb.subject}
                  value={sb.score}
                  style={{ marginBottom: idx < analytics.subjectBreakdown.length - 1 ? Spacing.md : 0 }}
                />
              ))}
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.noWeakText}>No subjects data found.</Text>
            </View>
          )}
        </View>

        {/* ── Top Students ── */}
        <View style={styles.section}>
          <SectionHeader title="Top Performers" />
          {analytics.topStudents.length > 0 ? (
            <View style={styles.card}>
              {analytics.topStudents.map((s, i) => (
                <View key={i} style={[styles.studentRow, i < analytics.topStudents.length - 1 && styles.weakRowBorder]}>
                  <View style={[styles.rankBadge, { backgroundColor: Colors.primary + (i === 0 ? 'FF' : '80') }]}>
                    <Text style={styles.rankText}>{s.rank}</Text>
                  </View>
                  <Text style={styles.studentName} numberOfLines={1}>{s.name}</Text>
                  <Text style={[styles.studentScore, { color: Colors.success }]}>{s.score}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.noWeakText}>No student performance data found.</Text>
            </View>
          )}
        </View>

        {/* ── AI Insights ── */}
        <View style={[styles.section, { marginBottom: Spacing.xl }]}>
          <SectionHeader title="AI Insights" />
          <View style={styles.insightCard}>
            <Text style={styles.insightHeader}>🤖 Gemini AI Recommendations</Text>
            {analytics.aiInsights.map((insight, idx) => (
              <Text key={idx} style={styles.insightItem}>{insight}</Text>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  loadingText: { marginTop: Spacing.md, fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },

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

  // Empty state
  emptyContainer: { flex: 1, padding: Spacing.xxl, alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: 8 },
  emptyDesc: { fontSize: Typography.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.lg },
  refreshBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, borderRadius: Radius.md, backgroundColor: Colors.primary },
  refreshBtnText: { color: '#fff', fontWeight: Typography.bold, fontSize: Typography.xs },

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
  barWrap: { alignItems: 'center', flex: 1, marginHorizontal: 2 },
  barValue: { fontSize: 8, color: Colors.textMuted, marginBottom: 4 },
  barTrack: {
    flex: 1, width: '100%',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.xs,
    justifyContent: 'flex-end',
    minWidth: 16,
  },
  barFill: {
    width: '100%',
    borderRadius: Radius.xs,
  },
  barLabel: { fontSize: 8, color: Colors.textMuted, marginTop: 6, textAlign: 'center' },

  // Weak areas
  weakRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm },
  weakRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  weakLeft: { flex: 1 },
  weakTopic: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary },
  weakRight: { alignItems: 'flex-end', gap: 4 },
  weakScore: { fontSize: Typography.sm, fontWeight: Typography.bold },
  noWeakText: { fontSize: Typography.xs, color: Colors.textMuted, textAlign: 'center', paddingVertical: 8 },

  // Students list
  studentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm },
  rankBadge: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.md,
  },
  rankText: { color: '#fff', fontSize: Typography.xs, fontWeight: Typography.bold },
  studentName: { flex: 1, fontSize: Typography.sm, color: Colors.textPrimary, fontWeight: Typography.medium },
  studentScore: { fontSize: Typography.sm, fontWeight: Typography.bold },

  // AI Insights
  insightCard: {
    backgroundColor: Colors.primarySurface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  insightHeader: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.primary, marginBottom: Spacing.sm },
  insightItem: { fontSize: Typography.xs, color: Colors.textSecondary, lineHeight: 18, marginBottom: 4 },
});
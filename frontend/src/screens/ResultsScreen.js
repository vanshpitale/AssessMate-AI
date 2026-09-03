// src/screens/ResultsScreen.js – Dynamic Results Dashboard
import React, { useRef, useEffect, useState } from 'react';
import {
  ScrollView, Text, TouchableOpacity, View, StyleSheet, Animated, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, Shadow } from '../theme';
import Badge from '../components/ui/Badge';
import ProgressIndicator from '../components/ui/ProgressIndicator';
import BackButton from '../components/ui/BackButton';
import api from '../config/api';

export default function ResultsScreen({ nav }) {
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const evaluationId = nav.params.evaluationId;

  const [loading, setLoading] = useState(true);
  const [evaluation, setEvaluation] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchResults();
  }, [evaluationId]);

  const fetchResults = async () => {
    if (!evaluationId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await api.get(`/evaluations/${evaluationId}/results`);
      setEvaluation(response.data.evaluation);
      setResults(response.data.results || []);
      
      Animated.timing(scoreAnim, {
        toValue: 1, duration: 700, useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Fetch results error:', error);
      Alert.alert('Error', 'Could not load evaluation results.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading results...</Text>
      </View>
    );
  }

  const totalMarks = evaluation ? evaluation.totalMarks : 100;
  const averageScore = results.length > 0
    ? (results.reduce((sum, r) => sum + (r.finalScore || r.aiScore || 0), 0) / results.length).toFixed(1)
    : '0.0';

  const highestScore = results.length > 0 
    ? Math.max(...results.map(r => r.finalScore || r.aiScore || 0)) 
    : 0;

  const lowestScore = results.length > 0 
    ? Math.min(...results.map(r => r.finalScore || r.aiScore || 0)) 
    : 0;

  const passCount = results.filter(r => (r.finalScore || r.aiScore || 0) >= totalMarks * 0.4).length;
  const passRate = results.length > 0 ? Math.round((passCount / results.length) * 100) : 0;

  const averageMarksPercent = totalMarks > 0 ? Math.round((parseFloat(averageScore) / totalMarks) * 100) : 0;

  // Grade distribution mapping
  const grades = [
    { range: `${Math.round(totalMarks*0.9)}–${totalMarks}`, grade: 'A+', count: 0, percent: 0, color: Colors.success },
    { range: `${Math.round(totalMarks*0.75)}–${Math.round(totalMarks*0.89)}`, grade: 'A', count: 0, percent: 0, color: '#34D399' },
    { range: `${Math.round(totalMarks*0.55)}–${Math.round(totalMarks*0.74)}`, grade: 'B', count: 0, percent: 0, color: Colors.primary },
    { range: `${Math.round(totalMarks*0.4)}–${Math.round(totalMarks*0.54)}`, grade: 'C', count: 0, percent: 0, color: Colors.warning },
    { range: `0–${Math.round(totalMarks*0.39)}`, grade: 'F', count: 0, percent: 0, color: Colors.danger },
  ];
  results.forEach(r => {
    const score = r.finalScore || r.aiScore || 0;
    if (score >= totalMarks * 0.9) grades[0].count++;
    else if (score >= totalMarks * 0.75) grades[1].count++;
    else if (score >= totalMarks * 0.55) grades[2].count++;
    else if (score >= totalMarks * 0.4) grades[3].count++;
    else grades[4].count++;
  });
  grades.forEach(g => {
    g.percent = results.length > 0 ? Math.round((g.count / results.length) * 100) : 0;
  });

  const getPerformanceRemark = (avgPct) => {
    if (avgPct >= 85) return 'Excellent Performance';
    if (avgPct >= 70) return 'Good Performance ↑';
    if (avgPct >= 50) return 'Average Performance';
    return 'Needs Immediate Improvement';
  };

  const metaText = `${results.length} student${results.length !== 1 ? 's' : ''} · ${evaluation?.examTitle || 'Exam'} · ${evaluation?.subject || 'Course'}`;

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
            <Text style={styles.heroScore}>{averageScore}</Text>
            <Text style={styles.heroTotal}> / {totalMarks}</Text>
            <Badge label={getPerformanceRemark(averageMarksPercent)} variant={averageMarksPercent >= 70 ? 'success' : 'warning'} style={{ marginTop: Spacing.sm }} />
            <Text style={styles.heroMeta}>{metaText}</Text>
          </View>
        </Animated.View>

        {/* ── Quick Stats ── */}
        <View style={styles.quickStats}>
          <QuickStat label="Highest" value={`${highestScore}/${totalMarks}`} icon="🏆" color={Colors.success} />
          <QuickStat label="Lowest"  value={`${lowestScore}/${totalMarks}`}  icon="📉" color={Colors.danger} />
          <QuickStat label="Pass Rate" value={`${passRate}%`} icon="✅" color={Colors.primary} />
        </View>

        {/* ── Distribution ── */}
        <View style={styles.section}>
          <ResultSectionHeader title="Score Distribution" subtitle={`(Out of ${totalMarks} marks)`} />
          <View style={styles.distCard}>
            {grades.map(d => (
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
            <ProgressIndicator value={passRate} label="Class Pass Rate" style={{ marginBottom: Spacing.md }} />
            <ProgressIndicator value={averageMarksPercent} label="Average Marks" color={Colors.secondary} />
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
        <TouchableOpacity 
          style={styles.analysisBtn} 
          onPress={() => nav.push('QuestionAnalysis', { evaluation, results })}
        >
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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },

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
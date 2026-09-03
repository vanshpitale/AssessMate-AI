// src/screens/HomeScreen.js – Dynamic Teacher Dashboard
import React, { useRef, useEffect, useState } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity,
  StyleSheet, Animated, RefreshControl, ActivityIndicator
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '../theme';
import StatCard from '../components/ui/StatCard';
import SectionHeader from '../components/ui/SectionHeader';
import ProgressIndicator from '../components/ui/ProgressIndicator';
import Badge from '../components/ui/Badge';
import api from '../config/api';

export default function HomeScreen({ nav }) {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    totalEvaluations: 0,
    pendingEvaluations: 0,
    completedEvaluations: 0,
    averageScore: '0%',
    totalStudents: 0,
  });
  const [evaluations, setEvaluations] = useState([]);

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1, duration: 600, useNativeDriver: true,
    }).start();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [meRes, statsRes, evRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/teacher/dashboard'),
        api.get('/evaluations')
      ]);
      setProfile(meRes.data);
      setStats(statsRes.data);
      setEvaluations(evRes.data || []);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AD';
  
  const displayName = profile?.name || 'Teacher';
  const displayDept = `${profile?.department || 'Department'} · ${profile?.institute?.toUpperCase() || 'Institution'}`;

  const pendingEval = evaluations.find(e => e.status !== 'completed' && e.status !== 'failed');
  const recentEval = evaluations.find(e => e.status === 'completed');
  const completedEvals = evaluations.filter(e => e.status === 'completed').slice(0, 3);
  const avgScoreVal = parseInt(stats.averageScore) || 0;

  return (
    <View style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* ── Hero Header ── */}
        <View style={styles.heroHeader}>
          <View style={styles.bgCircle1} />
          <View style={styles.bgCircle2} />
          <Animated.View style={[styles.headerContent, { opacity: headerAnim }]}>
            <View style={styles.headerTop}>
              <View style={styles.greetWrap}>
                <Text style={styles.greetingSmall}>Good Morning 👋</Text>
                <Text style={styles.greetingName}>{displayName}</Text>
                <Text style={styles.greetingDept}>{displayDept}</Text>
              </View>
              <TouchableOpacity style={styles.avatarCircle} onPress={() => nav.push('Profile')}>
                <Text style={styles.avatarText}>{initials}</Text>
              </TouchableOpacity>
            </View>

            {/* Quick action pill */}
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => nav.push('NewEvaluation')}
              activeOpacity={0.85}
            >
              <Text style={quickStyles.quickActionText}>⚡ Start New Evaluation</Text>
              <Text style={quickStyles.quickActionArrow}>›</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* ── Stat Cards (horizontal scroll) ── */}
        <View style={styles.section}>
          <SectionHeader title="Overview" action="Refresh" onAction={fetchData} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -Spacing.md }}>
            <View style={{ paddingHorizontal: Spacing.md, flexDirection: 'row', paddingBottom: 4, paddingTop: 4 }}>
              <StatCard icon="📝" label="Pending"   value={String(stats.pendingEvaluations)}   accent={Colors.warning} trendUp={false} trend="Needs Action" />
              <StatCard icon="✅" label="Completed" value={String(stats.completedEvaluations)}  accent={Colors.success} trendUp trend="Evaluated" />
              <StatCard icon="⭐" label="Avg Score" value={stats.averageScore}  accent={Colors.primary} trendUp trend="Class score" />
              <StatCard icon="🎓" label="Students"  value={String(stats.totalStudents)}  accent={Colors.secondary} trendUp={false} trend="Enrolled" />
            </View>
          </ScrollView>
        </View>

        {/* ── Pending Banner ── */}
        <View style={styles.section}>
          <SectionHeader title="Needs Attention" />
          {pendingEval ? (
            <TouchableOpacity style={styles.pendingCard} activeOpacity={0.85} onPress={() => nav.push('NewEvaluation')}>
              <View style={styles.pendingStrip} />
              <View style={styles.pendingBody}>
                <View style={styles.pendingRow}>
                  <Text style={styles.pendingTitle} numberOfLines={1}>{pendingEval.subject}</Text>
                  <Badge label="PENDING" variant="warning" />
                </View>
                <Text style={styles.pendingMeta}>{pendingEval.semester} · {pendingEval.examTitle} · {pendingEval.totalMarks} marks</Text>
                <View style={styles.pendingDivider} />
                <View style={styles.pendingRow}>
                  <Text style={styles.pendingCount}>📄 Status: {pendingEval.status}</Text>
                  <TouchableOpacity style={styles.startBtn} onPress={() => nav.push('NewEvaluation')}>
                    <Text style={styles.startBtnText}>Evaluate →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyCardMini}>
              <Text style={styles.emptyCardTextMini}>✅ All sheets evaluated. You're caught up!</Text>
            </View>
          )}
        </View>

        {/* ── Class Performance ── */}
        <View style={styles.section}>
          <SectionHeader title="Class Performance" action="Analytics →" onAction={() => nav.push('Analytics')} />
          <View style={styles.perfCard}>
            <View style={styles.perfScoreRow}>
              <View>
                <Text style={styles.perfScoreValue}>{stats.averageScore}</Text>
                <Text style={styles.perfScoreLabel}>Average Score</Text>
              </View>
              <Badge label={avgScoreVal >= 70 ? 'On Target' : 'Below Target'} variant={avgScoreVal >= 70 ? 'success' : 'warning'} dot />
            </View>
            <ProgressIndicator value={avgScoreVal} label="Overall Progress" style={{ marginTop: Spacing.md }} />
            {completedEvals.length > 0 ? (
              <View style={styles.subjectRows}>
                {completedEvals.map(e => (
                  <SubjectRow key={e._id} title={`${e.subject} (${e.examTitle})`} score={avgScoreVal} />
                ))}
              </View>
            ) : (
              <Text style={styles.emptySubText}>No evaluated subjects available yet.</Text>
            )}
          </View>
        </View>

        {/* ── Recently Evaluated ── */}
        <View style={styles.section}>
          <SectionHeader title="Recently Evaluated" />
          {recentEval ? (
            <View style={styles.recentCard}>
              <View style={styles.recentLeft}>
                <View style={[styles.recentDot, { backgroundColor: Colors.success }]} />
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.recentTitle} numberOfLines={1}>{recentEval.subject} ({recentEval.examTitle})</Text>
                  <Text style={styles.recentMeta}>Completed · {new Date(recentEval.updatedAt).toLocaleDateString()}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => nav.push('Results', { evaluationId: recentEval._id })}>
                <Text style={styles.viewLink}>View →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyCardMini}>
              <Text style={styles.emptyCardTextMini}>No recently graded answer sheets found.</Text>
            </View>
          )}
        </View>

        {/* ── AI Insights ── */}
        <View style={[styles.section, { paddingBottom: Spacing.xxl }]}>
          <SectionHeader title="AI Insights" />
          <View style={styles.aiCard}>
            <View style={styles.aiCardHeader}>
              <Text style={styles.aiIcon}>🤖</Text>
              <Text style={styles.aiCardTitle}>AI Recommendations</Text>
            </View>
            {avgScoreVal > 0 ? (
              <>
              </>
            ) : (
              <Text style={styles.aiLine}>• AI recommendations will appear once student evaluation results are generated.</Text>
            )}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

function SubjectRow({ title, score }) {
  return (
    <View style={{ marginTop: Spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontSize: Typography.xs, color: Colors.textSecondary, fontWeight: Typography.medium, flex: 1, marginRight: 8 }} numberOfLines={1}>
          {title}
        </Text>
        <Text style={{ fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.textSecondary }}>
          {score}%
        </Text>
      </View>
      <ProgressIndicator value={score} showPercent={false} height={6} />
    </View>
  );
}

const quickStyles = StyleSheet.create({
  quickActionText: { color: '#fff', fontWeight: Typography.semiBold, fontSize: Typography.sm },
  quickActionArrow: { color: '#fff', fontSize: 20 }
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  loadingText: { marginTop: Spacing.md, fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },

  // Hero
  heroHeader: {
    backgroundColor: Colors.primary,
    paddingBottom: Spacing.xl + Spacing.lg,
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute', top: -40, right: -40,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  bgCircle2: {
    position: 'absolute', bottom: -20, left: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(124,58,237,0.2)',
  },
  headerContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  greetWrap: {},
  greetingSmall: { color: 'rgba(255,255,255,0.7)', fontSize: Typography.sm },
  greetingName:  { color: '#fff', fontSize: Typography.xl,  fontWeight: Typography.bold,    marginTop: 2 },
  greetingDept:  { color: 'rgba(255,255,255,0.65)', fontSize: Typography.xs, marginTop: 2 },
  avatarCircle: {
    width: 48, height: 48, borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: { color: '#fff', fontWeight: Typography.bold, fontSize: Typography.base },

  quickAction: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },

  // Sections
  section: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
  },

  // Pending card
  pendingCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    ...Shadow.md,
    overflow: 'hidden',
  },
  pendingStrip: { width: 4, backgroundColor: Colors.warning },
  pendingBody: { flex: 1, padding: Spacing.md },
  pendingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pendingTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary, flex: 1, marginRight: 8 },
  pendingMeta:  { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 4 },
  pendingDivider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.sm },
  pendingCount: { fontSize: Typography.xs, color: Colors.textSecondary },
  startBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  startBtnText: { color: '#fff', fontSize: Typography.xs, fontWeight: Typography.bold },

  emptyCardMini: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyCardTextMini: { fontSize: Typography.xs, color: Colors.textSecondary, fontWeight: Typography.medium },

  // Perf card
  perfCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  perfScoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  perfScoreValue: { fontSize: Typography.xxl, fontWeight: Typography.bold, color: Colors.textPrimary },
  perfScoreLabel: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  subjectRows: { marginTop: Spacing.xs },
  emptySubText: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: Spacing.md },

  // Recent card
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  recentLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  recentDot: { width: 8, height: 8, borderRadius: 4, marginRight: Spacing.sm },
  recentTitle: { fontSize: Typography.sm, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  recentMeta:  { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  viewLink: { fontSize: Typography.xs, color: Colors.primary, fontWeight: Typography.bold },

  // AI insights card
  aiCard: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  aiCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  aiIcon: { fontSize: 20, marginRight: Spacing.sm },
  aiCardTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textSecondary },
  aiLine: { fontSize: Typography.xs, color: Colors.textSecondary, lineHeight: 18, marginBottom: 4 },
});

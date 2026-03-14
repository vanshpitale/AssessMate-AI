// src/screens/HomeScreen.js – Production Dashboard upgrade
import React, { useRef, useEffect, useState } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity,
  StyleSheet, Animated, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, Shadow } from '../theme';
import StatCard from '../components/ui/StatCard';
import SectionHeader from '../components/ui/SectionHeader';
import ProgressIndicator from '../components/ui/ProgressIndicator';
import Badge from '../components/ui/Badge';

export default function HomeScreen({ nav }) {
  const [refreshing, setRefreshing] = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1, duration: 600, useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

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
                <Text style={styles.greetingSmall}>Good afternoon 👋</Text>
                <Text style={styles.greetingName}>Dr. Anjali Deshpande</Text>
                <Text style={styles.greetingDept}>MCA Department · VESIT</Text>
              </View>
              <TouchableOpacity style={styles.avatarCircle}>
                <Text style={styles.avatarText}>AD</Text>
              </TouchableOpacity>
            </View>

            {/* Quick action pill */}
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => nav.push('NewEvaluation')}
              activeOpacity={0.85}
            >
              <Text style={styles.quickActionText}>⚡ Start New Evaluation</Text>
              <Text style={styles.quickActionArrow}>›</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* ── Stat Cards (horizontal scroll) ── */}
        <View style={styles.section}>
          <SectionHeader title="Overview" action="See all" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -Spacing.md }}>
            <View style={{ paddingHorizontal: Spacing.md, flexDirection: 'row', paddingBottom: 4, paddingTop: 4 }}>
              <StatCard icon="📝" label="Pending"   value="30"   accent={Colors.warning} trendUp={false} trend="5 due" />
              <StatCard icon="✅" label="Completed" value="128"  accent={Colors.success} trendUp trend="12%" />
              <StatCard icon="⭐" label="Avg Score" value="71%"  accent={Colors.primary} trendUp trend="3%" />
              <StatCard icon="🎓" label="Students"  value="180"  accent={Colors.secondary} />
            </View>
          </ScrollView>
        </View>

        {/* ── Pending Banner ── */}
        <View style={styles.section}>
          <SectionHeader title="Needs Attention" />
          <TouchableOpacity style={styles.pendingCard} activeOpacity={0.85} onPress={() => nav.push('NewEvaluation')}>
            <View style={styles.pendingStrip} />
            <View style={styles.pendingBody}>
              <View style={styles.pendingRow}>
                <Text style={styles.pendingTitle}>Statistics for Data Science</Text>
                <Badge label="PENDING" variant="warning" />
              </View>
              <Text style={styles.pendingMeta}>NMCA11 · Mid Term Test · 20 marks</Text>
              <View style={styles.pendingDivider} />
              <View style={styles.pendingRow}>
                <Text style={styles.pendingCount}>📄 30 answer sheets pending</Text>
                <TouchableOpacity style={styles.startBtn} onPress={() => nav.push('NewEvaluation')}>
                  <Text style={styles.startBtnText}>Evaluate →</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Class Performance ── */}
        <View style={styles.section}>
          <SectionHeader title="Class Performance" action="Analytics →" onAction={() => {}} />
          <View style={styles.perfCard}>
            <View style={styles.perfScoreRow}>
              <View>
                <Text style={styles.perfScoreValue}>62%</Text>
                <Text style={styles.perfScoreLabel}>Average Score</Text>
              </View>
              <Badge label="Below Target" variant="warning" dot />
            </View>
            <ProgressIndicator value={62} label="Overall Progress" style={{ marginTop: Spacing.md }} />
            <View style={styles.subjectRows}>
              <SubjectRow title="Statistics (NMCA11)" score={62} />
              <SubjectRow title="Java Full Stack (NMCA12)" score={76} />
              <SubjectRow title="ETL Engineering (NMCA13)" score={58} />
            </View>
          </View>
        </View>

        {/* ── Recently Evaluated ── */}
        <View style={styles.section}>
          <SectionHeader title="Recently Evaluated" />
          <View style={styles.recentCard}>
            <View style={styles.recentLeft}>
              <View style={[styles.recentDot, { backgroundColor: Colors.success }]} />
              <View>
                <Text style={styles.recentTitle}>Java for Full Stack (NMCA12)</Text>
                <Text style={styles.recentMeta}>Completed · Yesterday · 42 sheets</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => nav.push('Results')}>
              <Text style={styles.viewLink}>View →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── AI Insights ── */}
        <View style={[styles.section, { paddingBottom: Spacing.xxl }]}>
          <SectionHeader title="AI Insights" />
          <View style={styles.aiCard}>
            <View style={styles.aiCardHeader}>
              <Text style={styles.aiIcon}>🤖</Text>
              <Text style={styles.aiCardTitle}>Gemini AI Recommendations</Text>
            </View>
            <Text style={styles.aiLine}>• Students are weak in hypothesis testing and data visualization.</Text>
            <Text style={styles.aiLine}>• Consider extra sessions on statistical inference for NMCA11.</Text>
            <Text style={styles.aiLine}>• 3 students at risk of failing. Early intervention recommended.</Text>
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
        <Text style={{ fontSize: Typography.xs, color: Colors.textSecondary, fontWeight: Typography.medium }}>
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

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
  quickActionText: { color: '#fff', fontWeight: Typography.semiBold, fontSize: Typography.sm },
  quickActionArrow: { color: '#fff', fontSize: 20 },

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
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  startBtnText: { color: '#fff', fontSize: Typography.xs, fontWeight: Typography.bold },

  // Perf card
  perfCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  perfScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  perfScoreValue: {
    fontSize: Typography.xxxl,
    fontWeight: Typography.extraBold,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  perfScoreLabel: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  subjectRows: { marginTop: Spacing.sm },

  // Recent card
  recentCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadow.sm,
  },
  recentLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  recentDot: { width: 10, height: 10, borderRadius: 5, marginRight: Spacing.sm },
  recentTitle: { fontSize: Typography.sm, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  recentMeta:  { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  viewLink:    { fontSize: Typography.sm, color: Colors.primary, fontWeight: Typography.bold },

  // AI card
  aiCard: {
    backgroundColor: Colors.primarySurface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  aiCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  aiIcon: { fontSize: 20, marginRight: Spacing.sm },
  aiCardTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.primary },
  aiLine: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: 4 },
});

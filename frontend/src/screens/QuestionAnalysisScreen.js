// src/screens/QuestionAnalysisScreen.js – Dynamic Question Analysis
import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, Shadow } from '../theme';
import Badge from '../components/ui/Badge';
import BackButton from '../components/ui/BackButton';

export default function QuestionAnalysisScreen({ nav }) {
  const { evaluation, results } = nav.params || {};

  // Fallback to empty defaults if not passed (e.g. accessed directly or empty)
  const evalQuestions = evaluation?.questions || [];
  const allResults = results || [];

  const getAvgPctForQuestion = (qId, maxMarks) => {
    const qResults = allResults.filter(r => r.questions && r.questions.some(rq => rq.id === qId));
    if (qResults.length === 0) return 0;
    
    const totalScore = qResults.reduce((sum, r) => {
      const rq = r.questions.find(rq => rq.id === qId);
      return sum + (rq ? rq.score : 0);
    }, 0);
    
    return maxMarks > 0 ? Math.round((totalScore / (qResults.length * maxMarks)) * 100) : 0;
  };

  const getDifficultyTag = (pct) => {
    if (pct >= 80) return { label: 'Easy', variant: 'success' };
    if (pct >= 55) return { label: 'Medium', variant: 'warning' };
    return { label: 'Hard', variant: 'danger' };
  };

  const getAIRecommendation = (pct, id) => {
    if (pct >= 80) return `Concept well understood. Most students solved ${id} correctly.`;
    if (pct >= 55) return `Moderate understanding. Minor gaps noticed in formatting/explanations for ${id}.`;
    return `Critical weak area! Average score is below 55%. Suggest reviewing this topic in the next session.`;
  };

  return (
    <View style={styles.safe}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <BackButton nav={nav} />
        <Text style={styles.headerTitle}>Question Analysis</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {evalQuestions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No questions defined for this evaluation.</Text>
          </View>
        ) : (
          evalQuestions.map(q => {
            const avgPct = getAvgPctForQuestion(q.id, q.max);
            const difficulty = getDifficultyTag(avgPct);
            const recommendation = getAIRecommendation(avgPct, q.id);
            const flagged = avgPct < 55;

            return (
              <View key={q.id} style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.idCircle}>
                    <Text style={styles.idText}>{q.id}</Text>
                  </View>
                  <View style={styles.meta}>
                    <Badge label={difficulty.label} variant={difficulty.variant} style={{ marginRight: 6 }} />
                    {flagged && <Badge label="AI Flagged" variant="danger" dot />}
                  </View>
                  <Text style={styles.maxText}>Max: {q.max}m</Text>
                </View>
                
                <Text style={styles.questionText}>
                  {q.questionText || `Question reference: ${q.id}`}
                </Text>

                <View style={styles.scoreRow}>
                  <Text style={styles.scoreLabel}>Average Score</Text>
                  <Text style={[styles.scoreVal, { color: avgPct >= 70 ? Colors.success : Colors.warning }]}>
                    {avgPct}%
                  </Text>
                </View>

                <View style={styles.barBg}>
                  <View 
                    style={[
                      styles.barFill, 
                      { 
                        width: `${avgPct}%`, 
                        backgroundColor: avgPct >= 70 ? Colors.success : (avgPct >= 55 ? Colors.warning : Colors.danger) 
                      }
                    ]} 
                  />
                </View>

                {/* AI Insight Box */}
                <View style={[styles.insightBox, { borderLeftColor: flagged ? Colors.danger : Colors.primary }]}>
                  <Text style={styles.insightTitle}>🤖 AI Recommendation</Text>
                  <Text style={styles.insightText}>{recommendation}</Text>
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  scroll: { padding: Spacing.md },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  idCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  idText: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.primary },
  meta: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  maxText: { fontSize: 10, color: Colors.textMuted, fontWeight: Typography.medium },
  questionText: {
    fontSize: Typography.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  scoreLabel: { fontSize: Typography.xs, color: Colors.textMuted, fontWeight: Typography.medium },
  scoreVal:   { fontSize: Typography.xs, fontWeight: Typography.bold },
  barBg:   { height: 8, backgroundColor: Colors.surfaceAlt, borderRadius: Radius.full, overflow: 'hidden', marginBottom: Spacing.md },
  barFill: { height: 8, borderRadius: Radius.full },
  
  // AI insight box
  insightBox: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderLeftWidth: 3.5,
    marginTop: Spacing.xs,
  },
  insightTitle: {
    fontSize: 10,
    fontWeight: Typography.bold,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  insightText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },

  emptyContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
  },
});
// src/screens/QuestionAnalysisScreen.js – Upgraded to design system
import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, Shadow } from '../theme';
import Badge from '../components/ui/Badge';
import BackButton from '../components/ui/BackButton';

export default function QuestionAnalysisScreen({ nav }) {
  const questions = [
    { id: 'Q1', text: 'Which SQL clause is used to filter data from a result set in Java JDBC?', avg: 85, tag: 'Easy', flagged: false },
    { id: 'Q3', text: 'Explain INNER JOIN vs OUTER JOIN with examples.', avg: 52, tag: 'Medium', flagged: true },
  ];

  return (
    <View style={styles.safe}>
      <View style={styles.header}>
        <BackButton nav={nav} />
        <Text style={styles.headerTitle}>Question Analysis</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {questions.map(q => (
          <View key={q.id} style={styles.card}>
            <View style={styles.row}>
              <View style={styles.idCircle}>
                <Text style={styles.idText}>{q.id}</Text>
              </View>
              <View style={styles.meta}>
                <Badge label={q.tag} variant={q.tag === 'Easy' ? 'success' : 'warning'} style={{ marginRight: 6 }} />
                {q.flagged && <Badge label="AI Flagged" variant="danger" dot />}
              </View>
            </View>
            <Text style={styles.questionText}>{q.text}</Text>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Average Score</Text>
              <Text style={[styles.scoreVal, { color: q.avg >= 70 ? Colors.success : Colors.warning }]}>
                {q.avg}%
              </Text>
            </View>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${q.avg}%`, backgroundColor: q.avg >= 70 ? Colors.success : Colors.warning }]} />
            </View>
          </View>
        ))}
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
  questionText: {
    fontSize: Typography.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  scoreLabel: { fontSize: Typography.xs, color: Colors.textMuted, fontWeight: Typography.medium },
  scoreVal:   { fontSize: Typography.xs, fontWeight: Typography.bold },
  barBg:   { height: 8, backgroundColor: Colors.surfaceAlt, borderRadius: Radius.full, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: Radius.full },
});
// src/screens/EvaluationsScreen.js – Production upgrade with expandable cards
import React, { useState } from 'react';
import {
  ScrollView, Text, View, TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EvaluationCard from '../components/ui/EvaluationCard';
import SectionHeader from '../components/ui/SectionHeader';
import EmptyState from '../components/ui/EmptyState';
import { Colors, Typography, Spacing, Radius, Shadow } from '../theme';

const ALL_QUESTIONS = [
  {
    id: '1',
    title: 'Which SQL clause is used to filter data from a result set in Java JDBC?',
    avg: 85, type: 'MCQ', confidence: 92, difficulty: 'Easy',
    aiNote: 'Well answered by most students. Concept is clearly understood.',
  },
  {
    id: '2',
    title: 'What is the correct syntax for establishing a database connection in Java?',
    avg: 78, type: 'MCQ', confidence: 88, difficulty: 'Medium',
    aiNote: 'Minor syntax errors observed in 20% of submissions.',
  },
  {
    id: '3',
    title: 'Explain the difference between INNER JOIN and OUTER JOIN with examples in Java.',
    avg: 52, type: 'Descriptive', confidence: 74, difficulty: 'Hard',
    flag: true,
    aiNote: 'Common weak area – students confuse LEFT vs. RIGHT OUTER JOIN. Recommend additional examples.',
  },
  {
    id: '4',
    title: 'Write a Java program to execute a PreparedStatement with parameters.',
    avg: 64, type: 'Descriptive', confidence: 81, difficulty: 'Medium',
  },
];

const FILTERS = ['All', 'MCQ', 'Descriptive', 'AI Flagged'];

export default function EvaluationsScreen({ nav }) {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = ALL_QUESTIONS.filter(q => {
    if (activeFilter === 'All')         return true;
    if (activeFilter === 'AI Flagged')  return q.flag;
    return q.type === activeFilter;
  });

  return (
    <View style={styles.safe}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Question Analysis</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{ALL_QUESTIONS.length} questions</Text>
        </View>
      </View>

      {/* ── Summary strip ── */}
      <View style={styles.summaryStrip}>
        <SummaryChip icon="📊" value="71%" label="Avg" color={Colors.primary} />
        <SummaryChip icon="⚠️" value="1" label="Flagged" color={Colors.danger} />
        <SummaryChip icon="✅" value="2" label="Easy" color={Colors.success} />
        <SummaryChip icon="🔥" value="1" label="Hard" color={Colors.warning} />
      </View>

      {/* ── Filter chips ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContent}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => setActiveFilter(f)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader
          title={`${filtered.length} Question${filtered.length !== 1 ? 's' : ''}`}
          action="Export →"
          style={{ marginBottom: Spacing.md }}
        />

        {filtered.length === 0
          ? <EmptyState icon="🔍" title="No questions match" description="Try changing the active filter." />
          : filtered.map(q => (
              <EvaluationCard key={q.id} question={q} />
            ))
        }

        {/* CTA */}
        <TouchableOpacity style={styles.ctaBtn} onPress={() => nav.push('Results')}>
          <Text style={styles.ctaBtnText}>📈 View Evaluation Results</Text>
        </TouchableOpacity>
        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </View>
  );
}

function SummaryChip({ icon, value, label, color }) {
  return (
    <View style={[styles.summaryChip, { borderColor: color + '30', backgroundColor: color + '12' }]}>
      <Text style={styles.summaryIcon}>{icon}</Text>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
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
  headerBadge: {
    backgroundColor: Colors.primarySurface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  headerBadgeText: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.primary },

  summaryStrip: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  summaryChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  summaryIcon:  { fontSize: 14, marginBottom: 2 },
  summaryValue: { fontSize: Typography.md, fontWeight: Typography.bold },
  summaryLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: Typography.medium, textTransform: 'uppercase' },

  filtersScroll: { maxHeight: 56 },
  filtersContent: {
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  filterChipActive:     { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText:       { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
  filterChipTextActive: { color: '#fff', fontWeight: Typography.bold },

  scroll: { padding: Spacing.md },

  ctaBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: 16,
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadow.colored,
  },
  ctaBtnText: { color: '#fff', fontWeight: Typography.bold, fontSize: Typography.base },
});

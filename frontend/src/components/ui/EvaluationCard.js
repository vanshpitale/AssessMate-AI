// src/components/ui/EvaluationCard.js
import React, { useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme';
import Badge from './Badge';
import ProgressIndicator from './ProgressIndicator';

export default function EvaluationCard({ question, style }) {
  const [expanded, setExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const heightAnim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    const toVal = expanded ? 0 : 1;
    setExpanded(!expanded);
    Animated.parallel([
      Animated.spring(rotateAnim, { toValue: toVal, useNativeDriver: true, friction: 8 }),
      Animated.timing(heightAnim, { toValue: toVal, duration: 250, useNativeDriver: false }),
    ]).start();
  };

  const rotateStyle = {
    transform: [{
      rotate: rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }),
    }],
  };

  const expandHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120],
  });

  const confidenceVariant =
    question.confidence >= 80 ? 'success' :
    question.confidence >= 60 ? 'warning' : 'danger';

  const typeVariant = question.type === 'MCQ' ? 'info' : 'secondary';

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={toggle}
      activeOpacity={0.9}
    >
      {/* Header row */}
      <View style={styles.header}>
        <View style={styles.qNum}>
          <Text style={styles.qNumText}>Q{question.id}</Text>
        </View>
        <View style={styles.headerMeta}>
          <Badge label={question.type} variant={typeVariant} style={{ marginRight: 6 }} />
          {question.flag && <Badge label="AI Flagged" variant="danger" dot />}
        </View>
        <Animated.Text style={[styles.chevron, rotateStyle]}>⌄</Animated.Text>
      </View>

      {/* Question text */}
      <Text style={styles.questionText} numberOfLines={expanded ? undefined : 2}>
        {question.title}
      </Text>

      {/* Average score progress */}
      <View style={styles.scoreRow}>
        <Text style={styles.scoreLabel}>Avg Score</Text>
        <View style={styles.scoreBarWrap}>
          <ProgressIndicator value={question.avg} showPercent height={6} animate={expanded} />
        </View>
      </View>

      {/* Expanded content */}
      <Animated.View style={{ overflow: 'hidden', maxHeight: expandHeight }}>
        <View style={styles.expandedSection}>
          <View style={styles.divider} />
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaKey}>AI Confidence</Text>
              <Badge
                label={`${question.confidence || '--'}%`}
                variant={confidenceVariant}
              />
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaKey}>Difficulty</Text>
              <Badge label={question.difficulty || 'Medium'} variant="neutral" />
            </View>
          </View>
          {question.aiNote && (
            <View style={styles.aiNote}>
              <Text style={styles.aiNoteIcon}>🤖</Text>
              <Text style={styles.aiNoteText}>{question.aiNote}</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  qNum: {
    width: 28, height: 28,
    borderRadius: Radius.full,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  qNumText: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.primary,
  },
  headerMeta: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  chevron: {
    fontSize: 18,
    color: Colors.textMuted,
    fontWeight: Typography.bold,
  },
  questionText: {
    fontSize: Typography.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginBottom: Spacing.md,
    fontWeight: Typography.regular,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    fontWeight: Typography.medium,
    width: 64,
    marginRight: Spacing.sm,
  },
  scoreBarWrap: { flex: 1 },
  expandedSection: { paddingTop: Spacing.sm },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginBottom: Spacing.md,
  },
  metaRow: { flexDirection: 'row', gap: Spacing.md },
  metaItem: { flex: 1 },
  metaKey: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
    fontWeight: Typography.medium,
  },
  aiNote: {
    flexDirection: 'row',
    backgroundColor: Colors.primarySurface,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
    alignItems: 'flex-start',
  },
  aiNoteIcon: { marginRight: Spacing.sm, fontSize: 14 },
  aiNoteText: {
    flex: 1,
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});

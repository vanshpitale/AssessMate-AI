import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getResultById } from '../utils/StudentDataStore';

export default function StudentResultDetailScreen({ nav }) {
  const resultId = nav.params?.resultId;
  const result = getResultById(resultId);

  if (!result) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Result not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const percentage = Math.round((result.obtainedMarks / result.totalMarks) * 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{result.name}</Text>
          <Text style={styles.subject}>{result.subject}</Text>
          <Text style={styles.date}>
            {new Date(result.date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>

        {/* Score Card */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreLabel}>Your Score</Text>
            <Text style={styles.scoreValue}>
              {result.obtainedMarks}/{result.totalMarks}
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${percentage}%` }]} />
            </View>
            <Text style={styles.percentageText}>{percentage}%</Text>
          </View>
        </View>

        {/* Feedback */}
        {result.feedback && (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>Teacher's Feedback</Text>
            <Text style={styles.feedbackText}>{result.feedback}</Text>
          </View>
        )}

        {/* Question-wise Analysis */}
        {result.questions && result.questions.length > 0 && (
          <View style={styles.questionsSection}>
            <Text style={styles.sectionTitle}>Question-wise Analysis</Text>
            {result.questions.map((question, index) => (
              <View key={question.id} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <Text style={styles.questionNumber}>Q{index + 1}</Text>
                  <Text style={styles.questionScore}>
                    {question.obtainedMarks}/{question.maxMarks}
                  </Text>
                </View>
                <Text style={styles.questionText}>{question.question}</Text>
                {question.feedback && (
                  <View style={styles.questionFeedback}>
                    <Text style={styles.feedbackLabel}>Feedback: </Text>
                    <Text style={styles.questionFeedbackText}>{question.feedback}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subject: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  date: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  scoreCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3b82f6',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 5,
  },
  percentageText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3b82f6',
    minWidth: 50,
  },
  feedbackCard: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 16,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  questionsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  questionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3b82f6',
  },
  questionScore: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  questionText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  questionFeedback: {
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
  },
  feedbackLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  questionFeedbackText: {
    fontSize: 13,
    color: '#6b7280',
    flex: 1,
  },
});

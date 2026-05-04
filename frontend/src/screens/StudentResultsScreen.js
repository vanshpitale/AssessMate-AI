import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStudentResults } from '../utils/StudentDataStore';

export default function StudentResultsScreen({ nav }) {
  const results = getStudentResults();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>My Results</Text>
        <Text style={styles.subtitle}>View all your evaluation results</Text>

        <View style={styles.resultsList}>
          {results.map((result) => (
            <View key={result.id} style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName}>{result.name}</Text>
                  <Text style={styles.resultSubject}>{result.subject}</Text>
                  <Text style={styles.resultDate}>
                    {new Date(result.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={styles.badgeContainer}>
                  {result.status === 'graded' ? (
                    <View style={styles.scoreBadge}>
                      <Text style={styles.scoreBadgeText}>
                        {result.obtainedMarks}/{result.totalMarks}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingBadgeText}>Pending</Text>
                    </View>
                  )}
                </View>
              </View>

              {result.status === 'graded' && (
                <>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${(result.obtainedMarks / result.totalMarks) * 100}%` },
                      ]}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => nav.push('StudentResultDetail', { resultId: result.id })}
                  >
                    <Text style={styles.viewButtonText}>View Details</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          ))}
        </View>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 24,
  },
  resultsList: {
    gap: 16,
  },
  resultCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  resultSubject: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  resultDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  badgeContainer: {
    justifyContent: 'flex-start',
  },
  scoreBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  scoreBadgeText: {
    color: '#1e40af',
    fontWeight: '700',
    fontSize: 14,
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pendingBadgeText: {
    color: '#92400e',
    fontWeight: '600',
    fontSize: 14,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  viewButton: {
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 14,
  },
});

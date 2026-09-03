// src/screens/StudentResultsScreen.js – Dynamic Student Results list
import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../config/api';

export default function StudentResultsScreen({ nav }) {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/reports');
      setResults(res.data.reports || []);
    } catch (err) {
      console.error('Error fetching student results:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading your results...</Text>
      </View>
    );
  }

  if (results.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>No results graded yet</Text>
          <Text style={styles.emptyDesc}>Your evaluations will show up here once graded by your teacher.</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchResults}>
            <Text style={styles.refreshBtnText}>Tap to Refresh</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>My Results</Text>
        <Text style={styles.subtitle}>View all your evaluation results</Text>

        <View style={styles.resultsList}>
          {results.map((result) => {
            const pct = Math.round((result.obtainedMarks / result.totalMarks) * 100);
            return (
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
                    <View style={styles.scoreBadge}>
                      <Text style={styles.scoreBadgeText}>
                        {result.obtainedMarks}/{result.totalMarks}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${pct}%` },
                    ]}
                  />
                </View>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => nav.push('StudentResultDetail', { resultId: result.id })}
                  activeOpacity={0.8}
                >
                  <Text style={styles.viewButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            );
          })}
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6b7280', fontWeight: '500' },
  
  // Empty state
  emptyContainer: { flex: 1, padding: 40, alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  refreshBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, backgroundColor: '#3b82f6' },
  refreshBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

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

import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStudentResults } from '../utils/StudentDataStore';

export default function StudentSheetsScreen({ nav }) {
  const results = getStudentResults();

  const handleViewPDF = (sheetName) => {
    // Placeholder for PDF viewer - will need backend integration
    Alert.alert('View Sheet', `PDF viewer for "${sheetName}" will be implemented with backend integration.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>My Answer Sheets</Text>
        <Text style={styles.subtitle}>View all your submitted answer sheets</Text>

        <View style={styles.sheetsList}>
          {results.map((sheet) => (
            <View key={sheet.id} style={styles.sheetCard}>
              <View style={styles.sheetInfo}>
                <Text style={styles.sheetName}>{sheet.name}</Text>
                <Text style={styles.sheetSubject}>{sheet.subject}</Text>
                <Text style={styles.sheetDate}>
                  Submitted: {new Date(sheet.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
                <View style={styles.statusContainer}>
                  {sheet.status === 'graded' ? (
                    <View style={styles.gradedBadge}>
                      <Text style={styles.gradedBadgeText}>✓ Graded</Text>
                    </View>
                  ) : (
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingBadgeText}>⏳ Pending</Text>
                    </View>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => handleViewPDF(sheet.name)}
              >
                <Text style={styles.viewButtonText}>View PDF</Text>
              </TouchableOpacity>
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
  sheetsList: {
    gap: 16,
  },
  sheetCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sheetInfo: {
    marginBottom: 12,
  },
  sheetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sheetSubject: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  sheetDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
  },
  gradedBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  gradedBadgeText: {
    color: '#065f46',
    fontSize: 12,
    fontWeight: '600',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pendingBadgeText: {
    color: '#92400e',
    fontSize: 12,
    fontWeight: '600',
  },
  viewButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

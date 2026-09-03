// src/screens/StudentSheetsScreen.js – Dynamic Student Sheets Screen
import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../config/api';

export default function StudentSheetsScreen({ nav }) {
  const [loading, setLoading] = useState(true);
  const [sheets, setSheets] = useState([]);

  useEffect(() => {
    fetchSheets();
  }, []);

  const fetchSheets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/reports');
      setSheets(res.data.reports || []);
    } catch (err) {
      console.error('Error fetching student sheets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPDF = (sheet) => {
    if (!sheet.fileUrl) {
      Alert.alert('Unavailable', 'No PDF file path is available for this sheet.');
      return;
    }
    Alert.alert('View Sheet', `Answer sheet file path on server:\n\n${sheet.fileUrl}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading your sheets...</Text>
      </View>
    );
  }

  if (sheets.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📄</Text>
          <Text style={styles.emptyTitle}>No answer sheets submitted</Text>
          <Text style={styles.emptyDesc}>Your submitted answer sheets will appear here once uploaded by your teacher.</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchSheets}>
            <Text style={styles.refreshBtnText}>Tap to Refresh</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>My Answer Sheets</Text>
        <Text style={styles.subtitle}>View all your submitted answer sheets</Text>

        <View style={styles.sheetsList}>
          {sheets.map((sheet) => (
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
                  <View style={styles.gradedBadge}>
                    <Text style={styles.gradedBadgeText}>✓ Graded</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => handleViewPDF(sheet)}
                activeOpacity={0.8}
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

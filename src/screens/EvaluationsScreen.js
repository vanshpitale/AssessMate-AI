import React from 'react';
import { ScrollView, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/Card';
import SmallPill from '../components/SmallPill';

export default function EvaluationsScreen({ nav }) {
  const questions = [
    { id: '1', title: 'Which SQL clause is used to filter data from a result set in Java JDBC?', avg: 85, type: 'MCQ' },
    { id: '2', title: 'What is the correct syntax for establishing a database connection in Java?', avg: 78, type: 'MCQ' },
    { id: '3', title: 'Explain the difference between INNER JOIN and OUTER JOIN with examples in Java-', avg: 52, type: 'Descriptive', flag: true },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '700' }}>Question Analysis</Text>

        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <View style={styles.filterActive}><Text style={{ color: '#fff' }}>All</Text></View>
          <View style={styles.filterBtn}><Text>MCQ / Objective</Text></View>
          <View style={styles.filterBtn}><Text>Descriptive</Text></View>
        </View>

        {questions.map(q => (
          <Card key={q.id} style={{ marginTop: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700' }}>Q{q.id} <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151' }}>{q.type}</Text></Text>
                <Text style={{ marginTop: 8, color: '#111827' }}>{q.title}</Text>
                <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
                  <Text>Avg Score: </Text>
                  <SmallPill>{q.avg}%</SmallPill>
                  <SmallPill color="#d1fae5">Easy</SmallPill>
                  {q.flag ? <SmallPill color="#fee2e2">AI Flagged</SmallPill> : null}
                </View>
              </View>
            </View>
          </Card>
        ))}

        <TouchableOpacity style={styles.primaryButton} onPress={() => nav.push('Results')}>
          <Text style={styles.primaryButtonText}>View Evaluation Results</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  filterBtn: { padding: 8, marginRight: 8, borderRadius: 10, borderWidth: 1, borderColor: '#e6edf2' },
  filterActive: { padding: 8, marginRight: 8, borderRadius: 10, backgroundColor: '#3b82f6' },
  primaryButton: { backgroundColor: '#3b82f6', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 18 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
});

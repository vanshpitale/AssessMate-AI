import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/Card';

export default function HomeScreen({ nav }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>

        <View style={{ backgroundColor:'#000000', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', padding: 6 }}>
          <View>
            <Text style={{ color: '#fff', fontSize: 18 }}>AssessMate AI</Text>
          </View>
        </View>

        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 6 }}>
          <View>
            <Text style={styles.hi}>Welcome back,</Text>
            <Text style={styles.hiName}>Dr. Anjali Deshpande</Text>
            <Text style={styles.hiDept}>MCA Department · VESIT</Text>
          </View>
          <View style={styles.avatar}><Text style={{ color: '#2b6cb0' }}>AD</Text></View>
        </View>

        {/* Cards */}
        <Card style={{ marginTop: 18 }}>
          <Text style={{ fontWeight: '700' }}>Papers to Review</Text>
          <Text style={{ marginTop: 6, color: '#4b5563' }}>Statistics for Data Science (NMCA11)</Text>
          <View style={{ flexDirection: 'column', justifyContent: 'space-between', marginTop: 12 }}>
            <Text style={{ color: '#6b7280' }}>30 answer sheets pending</Text>
            <Text style={{ color: '#6b7280' }}>Mid Term Test · 20 marks</Text>
          </View>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: '700' }}>Recently Evaluated</Text>
          <Text style={{ marginTop: 6, color: '#4b5563' }}>Java for Full Stack Development (NMCA12)</Text>
          <Text style={{ marginTop: 8, color: '#16a34a' }}>Completed · Yesterday</Text>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: '700' }}>Average Class Score</Text>
          <View style={{ marginTop: 12 }}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '62%' }]} />
            </View>
            <Text style={{ alignSelf: 'flex-end', marginTop: 8 }}>62%</Text>
          </View>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: '700' }}>AI Suggestions</Text>
          <Text style={{ marginTop: 8, color: '#374151' }}>
            Students are weak in hypothesis testing and data visualization.
            Consider extra sessions on statistical inference.
          </Text>
        </Card>

        <View style={{ height: 16 }} />

        {/* Start new evaluation */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => nav.push('NewEvaluation')}
        >
          <Text style={styles.primaryButtonText}>Start New Evaluation</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  hi: { color: '#6b7280' },
  hiName: { fontSize: 18, fontWeight: '700' },
  hiDept: { color: '#6b7280' },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#eef2ff'
  },
  progressBarBg: {
    height: 10, backgroundColor: '#eef2f7',
    borderRadius: 6, overflow: 'hidden'
  },
  progressBarFill: { height: 10, backgroundColor: '#111827' },
  primaryButton: {
    backgroundColor: '#3b82f6', padding: 14, borderRadius: 12,
    alignItems: 'center', marginTop: 12
  },
  primaryButtonText: { color: '#fff', fontWeight: '700' }
});

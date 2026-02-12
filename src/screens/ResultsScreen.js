import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/Card';


export default function ResultsScreen({ nav }) {
return (
<SafeAreaView style={styles.safe}>
<ScrollView contentContainerStyle={{ padding: 16 }}>
<TouchableOpacity onPress={() => nav.pop()} style={{ marginBottom: 8 }}><Text style={{ color: '#2563eb' }}>← Back</Text></TouchableOpacity>
<Text style={{ fontSize: 18, fontWeight: '700' }}>Evaluation Results</Text>


<Card style={{ marginTop: 12 }}>
<Text style={{ fontWeight: '700' }}>Average Score</Text>
<Text style={{ fontSize: 22, fontWeight: '700', marginTop: 8 }}>14.2 / 20</Text>
<Text style={{ color: '#10b981', marginTop: 6 }}>Good performance</Text>
</Card>


<Card style={{ marginTop: 12 }}>
<Text style={{ fontWeight: '700' }}>Score Distribution (out of 20)</Text>
<View style={{ marginTop: 10 }}>
<View style={styles.distRow}><Text>16-20</Text><View style={styles.distBarBg}><View style={[styles.distBarFill,{ width: '40%' }]} /></View><Text>10</Text></View>
<View style={styles.distRow}><Text>11-15</Text><View style={styles.distBarBg}><View style={[styles.distBarFill,{ width: '56%' }]} /></View><Text>14</Text></View>
<View style={styles.distRow}><Text>6-10</Text><View style={styles.distBarBg}><View style={[styles.distBarFill,{ width: '30%' }]} /></View><Text>12</Text></View>
</View>
</Card>


<TouchableOpacity style={styles.secondaryButton} onPress={() => nav.push('QuestionAnalysis')}>
<Text>View Question-wise Analysis</Text>
</TouchableOpacity>
</ScrollView>
</SafeAreaView>
);
}


const styles = StyleSheet.create({
safe: { flex: 1, backgroundColor: '#fff' },
distRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
distBarBg: { flex: 1, height: 10, backgroundColor: '#f3f4f6', marginHorizontal: 8, borderRadius: 6, overflow: 'hidden' },
distBarFill: { height: 10, backgroundColor: '#60a5fa' },
secondaryButton: { borderWidth: 1, borderColor: '#e6edf2', padding: 12, borderRadius: 10, alignItems: 'center', backgroundColor: '#fff', marginTop: 18 },
});
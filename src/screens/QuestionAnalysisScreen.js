import React from 'react';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/Card';
import SmallPill from '../components/SmallPill';


export default function QuestionAnalysisScreen() {
const questions = [
{ id: 'Q1', text: 'Which SQL clause is used to filter data from a result set in Java JDBC?', avg: 85, tag: 'Easy' },
{ id: 'Q3', text: 'Explain INNER JOIN vs OUTER JOIN', avg: 52, tag: 'Medium', flagged: true }
];


return (
<SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
<ScrollView contentContainerStyle={{ padding: 16 }}>
<Text style={{ fontSize: 18, fontWeight: '700' }}>Question Analysis</Text>
{questions.map(q => (
<Card key={q.id} style={{ marginTop: 12 }}>
<Text style={{ fontWeight: '700' }}>{q.id}</Text>
<Text style={{ marginTop: 6 }}>{q.text}</Text>
<View style={{ flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
<SmallPill>{q.avg}%</SmallPill>
<SmallPill color="#f3f4f6">{q.tag}</SmallPill>
{q.flagged ? <SmallPill color="#fee2e2">AI Flagged</SmallPill> : null}
</View>
</Card>
))}
</ScrollView>
</SafeAreaView>
);
}
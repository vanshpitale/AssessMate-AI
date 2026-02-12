import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/Card';


export default function AnalyticsScreen() {
    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: '700' }}>Analytics</Text>


                <Card style={{ marginTop: 12 }}>
                    <Text style={{ fontWeight: '700' }}>Class Performance Trend</Text>
                    <View style={{ height: 120, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: '#6b7280' }}>[Chart Placeholder]</Text>
                    </View>
                    <Text style={{ marginTop: 8 }}>Current Average</Text>
                    <Text style={{ fontSize: 18, fontWeight: '700' }}>76.5%</Text>
                </Card>


                <Card style={{ marginTop: 12 }}>
                    <Text style={{ fontWeight: '700' }}>Weak Areas</Text>
                    <View style={{ marginTop: 8 }}>
                        <Text>Hypothesis Testing (NMCA11) 52%</Text>
                        <View style={styles.weakBarBg}><View style={[styles.weakBarFill, { width: '52%' }]} /></View>
                        <Text style={{ marginTop: 8 }}>ETL Process Design (NMCA13) 58%</Text>
                        <View style={styles.weakBarBg}><View style={[styles.weakBarFill, { width: '58%' }]} /></View>
                    </View>
                </Card>
                
                
                <Card style={{ marginTop: 12 }}>
                    <Text style={{ fontWeight: '700' }}>Weak Areas</Text>
                    <View style={{ marginTop: 8 }}>
                        <Text>Hypothesis Testing (NMCA11) 52%</Text>
                        <View style={styles.weakBarBg}><View style={[styles.weakBarFill, { width: '52%' }]} /></View>
                        <Text style={{ marginTop: 8 }}>ETL Process Design (NMCA13) 58%</Text>
                        <View style={styles.weakBarBg}><View style={[styles.weakBarFill, { width: '58%' }]} /></View>
                    </View>
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#fff' },
    weakBarBg: { height: 8, backgroundColor: '#f8fafc', borderRadius: 6, overflow: 'hidden', marginTop: 6 },
    weakBarFill: { height: 8, backgroundColor: '#f97316' },
});
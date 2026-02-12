import React, { useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/Card';


export default function ProfileScreen() {
const [allowAuto, setAllowAuto] = useState(true);
const [manualApproval, setManualApproval] = useState(false);


return (
<SafeAreaView style={styles.safe}>
<ScrollView contentContainerStyle={{ padding: 16 }}>
<Text style={{ fontSize: 18, fontWeight: '700' }}>Profile & Settings</Text>


<Card style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
<View>
<Text style={{ fontWeight: '700' }}>Dr. Anjali Deshpande</Text>
<Text style={{ color: '#6b7280', marginTop: 6 }}>MCA Department</Text>
<Text style={{ color: '#6b7280', marginTop: 4 }}>anjali.deshpande@ves.ac.in</Text>
</View>
<View style={styles.avatar}><Text style={{ color: '#2b6cb0' }}>AD</Text></View>
</Card>


<Card style={{ marginTop: 12 }}>
<Text style={{ fontWeight: '700' }}>AI Settings</Text>
<View style={{ marginTop: 8 }}>
<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
<Text>Allow AI auto-feedback draft</Text>
<TouchableOpacity onPress={() => setAllowAuto(!allowAuto)} style={[styles.toggle, allowAuto && { backgroundColor: '#3b82f6' }]}><Text style={{ color: allowAuto ? '#fff' : '#6b7280' }}>{allowAuto ? 'On' : 'Off'}</Text></TouchableOpacity>
</View>
<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
<Text>Require manual approval</Text>
<TouchableOpacity onPress={() => setManualApproval(!manualApproval)} style={[styles.toggle, manualApproval && { backgroundColor: '#3b82f6' }]}><Text style={{ color: manualApproval ? '#fff' : '#6b7280' }}>{manualApproval ? 'On' : 'Off'}</Text></TouchableOpacity>
</View>
</View>
</Card>


<TouchableOpacity style={styles.secondaryButton}>
<Text>Manage Answer Keys & Rubrics</Text>
</TouchableOpacity>


<TouchableOpacity style={styles.logoutButton}>
<Text style={{ color: '#ef4444' }}>Log out</Text>
</TouchableOpacity>
</ScrollView>
</SafeAreaView>
);
}


const styles = StyleSheet.create({
safe: { flex: 1, backgroundColor: '#fff' },
avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eef2ff' },
toggle: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#eef2f7' },
secondaryButton: { borderWidth: 1, borderColor: '#e6edf2', padding: 12, borderRadius: 10, alignItems: 'center', backgroundColor: '#fff', marginTop: 18 },
logoutButton: { borderWidth: 1, borderColor: '#fee2e2', padding: 12, borderRadius: 10, alignItems: 'center', backgroundColor: '#fff', marginTop: 12 },
});
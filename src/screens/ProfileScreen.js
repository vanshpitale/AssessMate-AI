import React, { useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/Card';
import { getStudentInfo } from '../utils/StudentDataStore';

export default function ProfileScreen({ nav, userType }) {
  const [allowAuto, setAllowAuto] = useState(true);
  const [manualApproval, setManualApproval] = useState(false);
  
  const isStudent = userType === 'student';
  const studentInfo = isStudent ? getStudentInfo() : null;

  const handleLogout = () => {
    nav.resetTo('RoleSelection');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '700' }}>Profile & Settings</Text>

        {/* Profile Information Card */}
        <Card style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            {isStudent ? (
              <>
                <Text style={{ fontWeight: '700' }}>{studentInfo.name}</Text>
                <Text style={{ color: '#6b7280', marginTop: 6 }}>{studentInfo.course} • {studentInfo.semester}</Text>
                <Text style={{ color: '#6b7280', marginTop: 4 }}>{studentInfo.email}</Text>
                <Text style={{ color: '#6b7280', marginTop: 4 }}>Roll No: {studentInfo.rollNumber}</Text>
              </>
            ) : (
              <>
                <Text style={{ fontWeight: '700' }}>Dr. Anjali Deshpande</Text>
                <Text style={{ color: '#6b7280', marginTop: 6 }}>MCA Department</Text>
                <Text style={{ color: '#6b7280', marginTop: 4 }}>anjali.deshpande@ves.ac.in</Text>
              </>
            )}
          </View>
          <View style={styles.avatar}>
            <Text style={{ color: '#2b6cb0' }}>
              {isStudent ? studentInfo.name.split(' ').map(n => n[0]).join('') : 'AD'}
            </Text>
          </View>
        </Card>

        {/* AI Settings - Only for Teachers */}
        {!isStudent && (
          <Card style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: '700' }}>AI Settings</Text>
            <View style={{ marginTop: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Allow AI auto-feedback draft</Text>
                <TouchableOpacity 
                  onPress={() => setAllowAuto(!allowAuto)} 
                  style={[styles.toggle, allowAuto && { backgroundColor: '#3b82f6' }]}
                >
                  <Text style={{ color: allowAuto ? '#fff' : '#6b7280' }}>{allowAuto ? 'On' : 'Off'}</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <Text>Require manual approval</Text>
                <TouchableOpacity 
                  onPress={() => setManualApproval(!manualApproval)} 
                  style={[styles.toggle, manualApproval && { backgroundColor: '#3b82f6' }]}
                >
                  <Text style={{ color: manualApproval ? '#fff' : '#6b7280' }}>{manualApproval ? 'On' : 'Off'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}

        {/* Teacher-only Actions */}
        {!isStudent && (
          <TouchableOpacity style={styles.secondaryButton}>
            <Text>Manage Answer Keys & Rubrics</Text>
          </TouchableOpacity>
        )}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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
import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Dropdown from '../components/Dropdown';

export default function LoginScreen({ nav }) {
  const userType = nav.params?.userType || 'teacher';
  const [email, setEmail] = useState(userType === 'teacher' ? 'teacher@ves.ac.in' : 'student@ves.ac.in');
  const [password, setPassword] = useState('password');
  const [institute, setInstitute] = useState('vesit');

  const instituteOptions = [
    { label: 'VESIT, MCA', value: 'vesit' },
    { label: 'SPPU, BSc', value: 'sppu' },
    { label: 'IIT Bombay', value: 'iitb' },
  ];

  const handleLogin = () => {
    if (userType === 'student') {
      nav.replace('StudentMain', { userType: 'student' });
    } else {
      nav.replace('Main', { userType: 'teacher' });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <View style={styles.logoCircle}><Text style={{ color: '#1e3a8a', fontWeight: '700' }}>🎓</Text></View>
          <Text style={styles.title}>AssessMate AI</Text>
          <Text style={styles.subtitle}>
            {userType === 'teacher' ? 'Teacher Portal - Sign in to continue' : 'Student Portal - Sign in to continue'}
          </Text>
        </View>

        <View style={{ marginTop: 36 }}>
          <Dropdown label="Institute" options={instituteOptions} selectedValue={institute} onValueChange={setInstitute} />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.primaryButtonText}>Log in</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <TouchableOpacity><Text style={styles.link}>Forgot password?</Text></TouchableOpacity>
            <TouchableOpacity><Text style={styles.link}>Create account</Text></TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  logoCircle: { width: 78, height: 78, borderRadius: 40, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginTop: 12 },
  subtitle: { color: '#6b7280', marginTop: 6 },
  input: { borderWidth: 1, borderColor: '#e6edf2', borderRadius: 10, padding: 12, marginTop: 8, backgroundColor: '#fff' },
  label: { marginTop: 12, color: '#374151', fontWeight: '600' },
  primaryButton: { backgroundColor: '#3b82f6', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  link: { color: '#3b82f6' },
});

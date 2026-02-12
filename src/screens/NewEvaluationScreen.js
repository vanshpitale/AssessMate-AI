import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { shareAsync } from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import { Platform } from 'react-native';
import Card from '../components/Card';
import Dropdown from '../components/Dropdown';
import { getCapturedImage, clearCapturedImage, getCapturedPdf, clearCapturedPdf } from '../utils/ImageStore';

export default function NewEvaluationScreen({ nav }) {
  const [assessmentType, setAssessmentType] = useState('Objective + Descriptive');
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedPdf, setCapturedPdf] = useState(null);

  // Dropdown states
  const [course, setCourse] = useState('nmca11');
  const [semester, setSemester] = useState('sem1');
  const [assessmentTitle, setAssessmentTitle] = useState('midterm');

  const courseOptions = [
    { label: 'Statistics for Data Science (NMCA11)', value: 'nmca11' },
    { label: 'Java for Full Stack (NMCA12)', value: 'nmca12' },
    { label: 'ETL & Data Engineering (NMCA13)', value: 'nmca13' },
  ];

  const semesterOptions = [
    { label: 'Semester I', value: 'sem1' },
    { label: 'Semester II', value: 'sem2' },
    { label: 'Semester III', value: 'sem3' },
  ];

  const assessmentOptions = [
    { label: 'Mid Term Test – Internal Assessment (20)', value: 'midterm' },
    { label: 'End Term Test (100)', value: 'endterm' },
    { label: 'Quiz 1 (10)', value: 'quiz1' },
  ];

  useEffect(() => {
    refreshCapturedMedia();
  }, []);

  function refreshCapturedMedia() {
    const img = getCapturedImage();
    const pdf = getCapturedPdf();
    if (img) setCapturedImage(img);
    if (pdf) setCapturedPdf(pdf);
  }

  async function viewPdf() {
    if (!capturedPdf) return;

    try {
      // Explicitly check if file exists
      const info = await FileSystem.getInfoAsync(capturedPdf);
      if (!info.exists) {
        alert('File does not exist at path: ' + capturedPdf);
        return;
      }

      const cUri = await FileSystem.getContentUriAsync(capturedPdf);
      
      if (Platform.OS === 'android') {
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: cUri,
          flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
          type: 'application/pdf'
        });
      } else {
        // iOS
        await shareAsync(capturedPdf);
      }
    } catch (e) {
      console.log(e);
      alert('Error viewing PDF: ' + e.message);
      // Fallback
      try {
          await shareAsync(capturedPdf);
      } catch (err) {
          alert('Could not view PDF via share either.');
      }
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '700' }}>New Evaluation</Text>

        <Dropdown label="Course" options={courseOptions} selectedValue={course} onValueChange={setCourse} />
        <Dropdown label="Semester" options={semesterOptions} selectedValue={semester} onValueChange={setSemester} />
        <Dropdown label="Assessment Title" options={assessmentOptions} selectedValue={assessmentTitle} onValueChange={setAssessmentTitle} />

        <Text style={styles.label}>Assessment Type</Text>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <TouchableOpacity style={[styles.typeBox, assessmentType === 'MCQ / Objective' && styles.typeBoxActive]} onPress={() => setAssessmentType('MCQ / Objective')}><Text>MCQ / Objective</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.typeBox, assessmentType === 'Objective + Descriptive' && styles.typeBoxActive]} onPress={() => setAssessmentType('Objective + Descriptive')}><Text>Objective + Descriptive</Text></TouchableOpacity>
        </View>

        <Text style={styles.label}>Upload / Scan Answer Sheets</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' }}>
          <TouchableOpacity style={styles.scanBox} onPress={() => { nav.push('CameraScan'); setTimeout(refreshCapturedMedia, 1000); }}>
            <Text style={{ fontWeight: '700' }}>Scan Sheets</Text>
            <Text style={{ marginTop: 6, color: '#6b7280' }}>Use camera to capture</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadBox}><Text>Upload PDF</Text></TouchableOpacity>
        </View>

        {capturedImage && !capturedPdf ? (
          <Card style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: '700' }}>Last Scanned Sheet</Text>
            <Image source={{ uri: capturedImage }} style={{ width: '100%', height: 220, marginTop: 8, borderRadius: 8 }} resizeMode="contain" />
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => { setCapturedImage(null); clearCapturedImage(); }}>
                <Text>Remove</Text>
              </TouchableOpacity>
              <View style={{ width: 12 }} />
              <TouchableOpacity style={styles.primaryButton} onPress={() => {/* would upload or include in evaluation */}}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Attach</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ) : null}

        {capturedPdf ? (
          <Card style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: '700' }}>Scanned PDF Ready</Text>
            <View style={{ height: 100, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', borderRadius: 8, marginTop: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#4b5563' }}>PDF Generated Successfully</Text>
                <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{capturedPdf.split('/').pop()}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => { setCapturedPdf(null); clearCapturedPdf(); }}>
                <Text>Remove</Text>
              </TouchableOpacity>
              <View style={{ width: 8 }} />
              <TouchableOpacity style={styles.secondaryButton} onPress={viewPdf}>
                <Text>View PDF</Text>
              </TouchableOpacity>
              <View style={{ width: 8 }} />
              <TouchableOpacity style={styles.primaryButton} onPress={() => {/* would upload */}}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Attach PDF</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ) : null}

        <Text style={styles.label}>Answer Key / Rubric (Optional)</Text>
        <TouchableOpacity style={[styles.uploadBox, { marginTop: 8 }]}><Text>Attach Answer Key / Rubric</Text></TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={() => nav.push('Results')}>
          <Text style={styles.primaryButtonText}>Run AI Evaluation</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  input: { borderWidth: 1, borderColor: '#e6edf2', borderRadius: 10, padding: 12, marginTop: 8, backgroundColor: '#fff' },
  label: { marginTop: 12, color: '#374151', fontWeight: '600' },
  typeBox: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e6edf2', marginRight: 8, marginTop: 8 },
  typeBoxActive: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
  uploadBox: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e6edf2', alignItems: 'center', marginRight: 8 },
  scanBox: { flex: 1, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#e6edf2', alignItems: 'center', marginRight: 8, backgroundColor: '#fff' },
  primaryButton: { backgroundColor: '#3b82f6', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { borderWidth: 1, borderColor: '#e6edf2', padding: 10, borderRadius: 8, alignItems: 'center', backgroundColor: '#fff' }
});

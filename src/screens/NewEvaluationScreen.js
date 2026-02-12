import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/Card';
import Dropdown from '../components/Dropdown';
import { getCapturedImage, clearCapturedImage } from '../utils/ImageStore';

export default function NewEvaluationScreen({ nav }) {
  const [assessmentType, setAssessmentType] = useState('Objective + Descriptive');
  const [capturedImage, setCapturedImage] = useState(null);

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
    const img = getCapturedImage();
    if (img) setCapturedImage(img);
  }, []);

  function refreshCapturedImage() {
    const img = getCapturedImage();
    setCapturedImage(img);
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
          <TouchableOpacity style={styles.scanBox} onPress={() => { nav.push('CameraScan'); setTimeout(refreshCapturedImage, 600); }}>
            <Text style={{ fontWeight: '700' }}>Scan Sheets</Text>
            <Text style={{ marginTop: 6, color: '#6b7280' }}>Use camera to capture</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadBox}><Text>Upload PDF</Text></TouchableOpacity>
        </View>

        {capturedImage ? (
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

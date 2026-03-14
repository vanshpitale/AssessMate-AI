// src/screens/NewEvaluationScreen.js – Step-wizard UX upgrade
import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView, Text, View, TouchableOpacity, Image,
  StyleSheet, Animated, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { shareAsync } from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import Dropdown from '../components/Dropdown';
import { getCapturedImage, clearCapturedImage, getCapturedPdf, clearCapturedPdf } from '../utils/ImageStore';
import { Colors, Typography, Spacing, Radius, Shadow } from '../theme';
import PrimaryButton from '../components/ui/PrimaryButton';
import Badge from '../components/ui/Badge';
import BackButton from '../components/ui/BackButton';
import CameraScanScreen from './CameraScanScreen';

const STEPS = ['Setup', 'Upload', 'Review'];

export default function NewEvaluationScreen({ nav }) {
  const [step, setStep] = useState(0);
  const [showScanner, setShowScanner] = useState(false);
  const [assessmentType, setAssessmentType] = useState('Objective + Descriptive');
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedPdf,   setCapturedPdf]   = useState(null);
  const [pickedPdfs,    setPickedPdfs]    = useState([]);
  const [course,        setCourse]        = useState('nmca11');
  const [semester,      setSemester]      = useState('sem1');
  const [assessmentTitle, setAssessmentTitle] = useState('midterm');

  const slideAnim = useRef(new Animated.Value(0)).current;

  const courseOptions = [
    { label: 'Statistics for Data Science (NMCA11)', value: 'nmca11' },
    { label: 'Java for Full Stack (NMCA12)',          value: 'nmca12' },
    { label: 'ETL & Data Engineering (NMCA13)',       value: 'nmca13' },
  ];
  const semesterOptions = [
    { label: 'Semester I',   value: 'sem1' },
    { label: 'Semester II',  value: 'sem2' },
    { label: 'Semester III', value: 'sem3' },
  ];
  const assessmentOptions = [
    { label: 'Mid Term Test – Internal Assessment (20)', value: 'midterm' },
    { label: 'End Term Test (100)',                       value: 'endterm' },
    { label: 'Quiz 1 (10)',                               value: 'quiz1' },
  ];

  useEffect(() => { refreshCapturedMedia(); }, []);

  function refreshCapturedMedia() {
    const img = getCapturedImage();
    const pdf = getCapturedPdf();
    if (img) setCapturedImage(img);
    if (pdf) setCapturedPdf(pdf);
  }

  const goToStep = (i) => {
    Animated.spring(slideAnim, { toValue: i, useNativeDriver: false, friction: 8 }).start();
    setStep(i);
  };

  // ── Task 3: PDF Document Picker ──
  async function pickPdfFromDevice() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return; // User dismissed picker – no action needed

      const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
      const validFiles = [];
      const oversizedFiles = [];

      for (const asset of result.assets) {
        // Validate file type
        if (asset.mimeType && asset.mimeType !== 'application/pdf') {
          Alert.alert('Invalid File', `"${asset.name}" is not a PDF file.`);
          continue;
        }
        // Validate file size
        if (asset.size && asset.size > MAX_SIZE_BYTES) {
          oversizedFiles.push(asset.name);
          continue;
        }
        validFiles.push({
          uri:  asset.uri,
          name: asset.name || 'document.pdf',
          size: asset.size || 0,
        });
      }

      if (oversizedFiles.length > 0) {
        Alert.alert(
          'File Too Large',
          `The following files exceed the 20 MB limit:\n${oversizedFiles.join('\n')}`,
        );
      }

      if (validFiles.length > 0) {
        setPickedPdfs(prev => [...prev, ...validFiles]);
      }
    } catch (e) {
      console.error('Document picker error:', e);
      Alert.alert('Error', 'Could not open file picker. Please try again.');
    }
  }

  function removePickedPdf(uri) {
    setPickedPdfs(prev => prev.filter(f => f.uri !== uri));
  }

  async function viewPdf() {
    if (!capturedPdf) return;
    try {
      const info = await FileSystem.getInfoAsync(capturedPdf);
      if (!info.exists) { alert('File not found: ' + capturedPdf); return; }
      const cUri = await FileSystem.getContentUriAsync(capturedPdf);
      if (Platform.OS === 'android') {
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: cUri, flags: 1, type: 'application/pdf'
        });
      } else {
        await shareAsync(capturedPdf);
      }
    } catch (e) {
      try { await shareAsync(capturedPdf); } catch { alert('Could not open PDF.'); }
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <BackButton nav={nav} />
        <Text style={styles.headerTitle}>New Evaluation</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* ── Step Indicator ── */}
      <View style={styles.stepRow}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <TouchableOpacity onPress={() => i < step + 1 && goToStep(i)} style={styles.stepItem}>
              <View style={[
                styles.stepCircle,
                i < step  && styles.stepDone,
                i === step && styles.stepActive,
              ]}>
                {i < step
                  ? <Text style={styles.stepCheck}>✓</Text>
                  : <Text style={[styles.stepNum, i === step && styles.stepNumActive]}>{i + 1}</Text>
                }
              </View>
              <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{s}</Text>
            </TouchableOpacity>
            {i < STEPS.length - 1 && (
              <View style={[styles.stepLine, i < step && styles.stepLineDone]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── STEP 0: Setup ── */}
        {step === 0 && (
          <View>
            <SectionTitle icon="📌" title="Course Setup" subtitle="Select the course and assessment details" />
            <Dropdown label="Course" options={courseOptions} selectedValue={course} onValueChange={setCourse} />
            <Dropdown label="Semester" options={semesterOptions} selectedValue={semester} onValueChange={setSemester} />
            <Dropdown label="Assessment" options={assessmentOptions} selectedValue={assessmentTitle} onValueChange={setAssessmentTitle} />

            <SectionTitle icon="📂" title="Assessment Type" subtitle="Choose the type of questions" style={{ marginTop: Spacing.md }} />
            <View style={styles.typeRow}>
              <TypeChip
                label="MCQ / Objective"
                icon="☑️"
                active={assessmentType === 'MCQ / Objective'}
                onPress={() => setAssessmentType('MCQ / Objective')}
              />
              <TypeChip
                label="Objective + Descriptive"
                icon="📝"
                active={assessmentType === 'Objective + Descriptive'}
                onPress={() => setAssessmentType('Objective + Descriptive')}
              />
            </View>

            <PrimaryButton title="Next: Upload Sheets →" onPress={() => goToStep(1)} style={{ marginTop: Spacing.xl }} />
          </View>
        )}

        {/* ── STEP 1: Upload ── */}
        {step === 1 && (
          <View>
            <SectionTitle icon="📤" title="Upload Answer Sheets" subtitle="Scan or upload the answer sheets for evaluation" />

            <View style={styles.uploadRow}>
              <UploadBox
                icon="📷"
                title="Scan Sheets"
                subtitle="Use camera to capture"
                onPress={() => setShowScanner(true)}
                accent={Colors.primary}
              />
              <UploadBox
                icon="📄"
                title="Upload PDF"
                subtitle="From device storage"
                onPress={pickPdfFromDevice}
                accent={Colors.secondary}
              />
            </View>

            {/* ── Picked PDF cards from device picker ── */}
            {pickedPdfs.map(file => (
              <PickedPdfCard
                key={file.uri}
                file={file}
                onRemove={() => removePickedPdf(file.uri)}
              />
            ))}

            {/* Image preview */}
            {capturedImage && !capturedPdf && (
              <View style={styles.previewCard}>
                <View style={styles.previewHeader}>
                  <Text style={styles.previewTitle}>📸 Scanned Sheet</Text>
                  <Badge label="Ready" variant="success" />
                </View>
                <Image
                  source={{ uri: capturedImage }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
                <View style={styles.previewActions}>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => { setCapturedImage(null); clearCapturedImage(); }}
                  >
                    <Text style={styles.removeBtnText}>🗑 Remove</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.attachBtn}>
                    <Text style={styles.attachBtnText}>✓ Attach</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* PDF preview */}
            {capturedPdf && (
              <View style={styles.previewCard}>
                <View style={styles.previewHeader}>
                  <Text style={styles.previewTitle}>📋 PDF Ready</Text>
                  <Badge label="Generated" variant="success" />
                </View>
                <View style={styles.pdfPlaceholder}>
                  <Text style={styles.pdfIcon}>📄</Text>
                  <Text style={styles.pdfName}>{capturedPdf.split('/').pop()}</Text>
                </View>
                <View style={styles.previewActions}>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => { setCapturedPdf(null); clearCapturedPdf(); }}
                  >
                    <Text style={styles.removeBtnText}>🗑 Remove</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.viewPdfBtn} onPress={viewPdf}>
                    <Text style={styles.viewPdfBtnText}>👁 View PDF</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.attachBtn}>
                    <Text style={styles.attachBtnText}>✓ Attach</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <SectionTitle icon="🔑" title="Answer Key / Rubric" subtitle="Optional – attach if available" style={{ marginTop: Spacing.md }} />
            <TouchableOpacity style={styles.attachKeyBtn}>
              <Text style={styles.attachKeyText}>＋ Attach Answer Key or Rubric</Text>
            </TouchableOpacity>

            <View style={styles.navRow}>
              <TouchableOpacity style={styles.prevBtn} onPress={() => goToStep(0)}>
                <Text style={styles.prevBtnText}>← Back</Text>
              </TouchableOpacity>
              <PrimaryButton
                title="Next: Review →"
                onPress={() => goToStep(2)}
                fullWidth={false}
                style={{ flex: 1, marginLeft: Spacing.sm }}
              />
            </View>
          </View>
        )}

        {/* ── STEP 2: Review ── */}
        {step === 2 && (
          <View>
            <SectionTitle icon="✅" title="Review & Run" subtitle="Confirm your evaluation details and start AI processing" />

            <View style={styles.reviewCard}>
              <ReviewRow label="Course"     value={courseOptions.find(o => o.value === course)?.label} />
              <ReviewRow label="Semester"   value={semesterOptions.find(o => o.value === semester)?.label} />
              <ReviewRow label="Assessment" value={assessmentOptions.find(o => o.value === assessmentTitle)?.label} />
              <ReviewRow label="Type"       value={assessmentType} />
              <ReviewRow label="Sheets"     value={capturedPdf ? 'PDF Attached' : capturedImage ? 'Image Attached' : 'None'} />
            </View>

            <View style={styles.aiReadyBanner}>
              <Text style={styles.aiReadyIcon}>🤖</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiReadyTitle}>Gemini AI Ready</Text>
                <Text style={styles.aiReadyDesc}>Your sheets will be processed using Gemini Vision AI for accurate evaluation.</Text>
              </View>
            </View>

            <View style={styles.navRow}>
              <TouchableOpacity style={styles.prevBtn} onPress={() => goToStep(1)}>
                <Text style={styles.prevBtnText}>← Back</Text>
              </TouchableOpacity>
              <PrimaryButton
                title="🚀 Run AI Evaluation"
                onPress={() => nav.push('Results')}
                fullWidth={false}
                style={{ flex: 1, marginLeft: Spacing.sm }}
              />
            </View>
          </View>
        )}

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>

      {/* ── Modal Scanner to preserve form state ── */}
      <Modal visible={showScanner} animationType="slide" onRequestClose={() => setShowScanner(false)}>
        <CameraScanScreen 
          nav={{
            pop: () => {
              setShowScanner(false);
              // Small delay to ensure Modal close finishes before attempting to read local URIs sometimes
              setTimeout(refreshCapturedMedia, 300);
            }
          }} 
        />
      </Modal>
    </SafeAreaView>
  );
}

// ── Helper sub-components ──

function SectionTitle({ icon, title, subtitle, style }) {
  return (
    <View style={[{ marginBottom: Spacing.md }, style]}>
      <Text style={sstyles.title}>{icon}  {title}</Text>
      {subtitle && <Text style={sstyles.subtitle}>{subtitle}</Text>}
    </View>
  );
}
const sstyles = StyleSheet.create({
  title:    { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary },
  subtitle: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
});

function TypeChip({ label, icon, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.typeChip, active && styles.typeChipActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.typeChipIcon}>{icon}</Text>
      <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function UploadBox({ icon, title, subtitle, onPress, accent }) {
  return (
    <TouchableOpacity
      style={[styles.uploadBox, { borderColor: accent + '40' }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.uploadIconCircle, { backgroundColor: accent + '18' }]}>
        <Text style={styles.uploadIcon}>{icon}</Text>
      </View>
      <Text style={styles.uploadTitle}>{title}</Text>
      <Text style={styles.uploadSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

function ReviewRow({ label, value }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue}>{value || '—'}</Text>
    </View>
  );
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '';
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function PickedPdfCard({ file, onRemove }) {
  return (
    <View style={pcStyles.card}>
      <View style={pcStyles.iconWrap}>
        <Text style={pcStyles.icon}>📄</Text>
      </View>
      <View style={pcStyles.info}>
        <Text style={pcStyles.name} numberOfLines={1}>{file.name}</Text>
        {file.size > 0 && (
          <Text style={pcStyles.meta}>{formatBytes(file.size)}</Text>
        )}
      </View>
      <TouchableOpacity onPress={onRemove} style={pcStyles.removeBtn} activeOpacity={0.7}>
        <Text style={pcStyles.removeText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}
const pcStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.secondary + '40',
    ...Shadow.sm,
  },
  iconWrap: {
    width: 40, height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.secondarySurface,
    alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  icon: { fontSize: 20 },
  info: { flex: 1 },
  name: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
  },
  meta: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  removeBtn: {
    width: 28, height: 28,
    borderRadius: Radius.full,
    backgroundColor: Colors.dangerSurface,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  removeText: {
    fontSize: 12,
    color: Colors.danger,
    fontWeight: Typography.bold,
  },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.textPrimary },

  // Steps
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  stepItem: { alignItems: 'center' },
  stepCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.border,
  },
  stepDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  stepActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  stepCheck:    { color: '#fff', fontWeight: Typography.bold, fontSize: 14 },
  stepNum:      { color: Colors.textMuted, fontSize: Typography.xs, fontWeight: Typography.bold },
  stepNumActive:{ color: '#fff' },
  stepLabel:     { fontSize: 10, color: Colors.textMuted, marginTop: 4, fontWeight: Typography.medium },
  stepLabelActive: { color: Colors.primary, fontWeight: Typography.bold },
  stepLine:      { flex: 1, height: 2, backgroundColor: Colors.border, marginHorizontal: Spacing.xs, marginBottom: 14 },
  stepLineDone:  { backgroundColor: Colors.success },

  scroll: { padding: Spacing.md },

  // Type chips
  typeRow: { flexDirection: 'row', gap: Spacing.sm },
  typeChip: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  typeChipActive:    { borderColor: Colors.primary, backgroundColor: Colors.primarySurface },
  typeChipIcon:      { fontSize: 22, marginBottom: 6 },
  typeChipText:      { fontSize: Typography.xs, fontWeight: Typography.semiBold, color: Colors.textSecondary, textAlign: 'center' },
  typeChipTextActive:{ color: Colors.primary },

  // Upload boxes
  uploadRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  uploadBox: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    padding: Spacing.lg,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  uploadIconCircle: {
    width: 52, height: 52, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  uploadIcon: { fontSize: 26 },
  uploadTitle:    { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary },
  uploadSubtitle: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },

  // Preview card
  previewCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  previewTitle:  { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary },
  previewImage:  { width: '100%', height: 200, borderRadius: Radius.md, backgroundColor: Colors.surfaceAlt },
  previewActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: Spacing.sm, gap: Spacing.sm },
  removeBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.danger + '60',
    backgroundColor: Colors.dangerSurface,
  },
  removeBtnText: { fontSize: Typography.xs, color: Colors.danger, fontWeight: Typography.semiBold },
  attachBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: Radius.full, backgroundColor: Colors.primary,
  },
  attachBtnText: { fontSize: Typography.xs, color: '#fff', fontWeight: Typography.semiBold },
  viewPdfBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.primary,
  },
  viewPdfBtnText: { fontSize: Typography.xs, color: Colors.primary, fontWeight: Typography.semiBold },

  pdfPlaceholder: {
    height: 80, backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center',
  },
  pdfIcon: { fontSize: 28 },
  pdfName: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 4 },

  // Answer key
  attachKeyBtn: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  attachKeyText: { fontSize: Typography.sm, color: Colors.textMuted, fontWeight: Typography.medium },

  // Review card
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
    marginBottom: Spacing.md,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  reviewLabel:  { fontSize: Typography.sm, color: Colors.textMuted, fontWeight: Typography.medium },
  reviewValue:  { fontSize: Typography.sm, color: Colors.textPrimary, fontWeight: Typography.semiBold, flex: 1, textAlign: 'right' },

  aiReadyBanner: {
    backgroundColor: Colors.primarySurface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    marginBottom: Spacing.md,
  },
  aiReadyIcon:  { fontSize: 24, marginRight: Spacing.sm },
  aiReadyTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.primary },
  aiReadyDesc:  { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2, lineHeight: 16 },

  // Nav buttons
  navRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md },
  prevBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    height: 52,
    justifyContent: 'center',
  },
  prevBtnText: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.semiBold },
});

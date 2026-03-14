import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { printToFileAsync } from 'expo-print';
import { setCapturedPdf } from '../utils/ImageStore';

export default function CameraScanScreen({ nav }) {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photos, setPhotos] = useState([]);
  const [processing, setProcessing] = useState(false);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionBtn}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  async function capture() {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.7,
      base64: true, // Need base64 for HTML embedding safely or just URI
    });
    // Store both uri and base64. 
    // We use URI for thumbnails (better perf) and base64 for PDF generation (better reliability)
    setPhotos(prev => [...prev, { uri: photo.uri, base64: photo.base64 }]);
  }

  async function handleDone() {
    if (photos.length === 0) return;
    setProcessing(true);
    try {
      // Generate HTML for PDF
      // Use base64 for images to avoid file access issues in webview/print
      const htmlContent = `
        <html>
          <style>
            body { margin: 0; padding: 0; }
            img { width: 100%; height: 100vh; object-fit: contain; }
          </style>
          <body>
            ${photos.map(p => `<img src="data:image/jpeg;base64,${p.base64}" />`).join('')}
          </body>
        </html>
      `;

      const { uri } = await printToFileAsync({ html: htmlContent });
      setCapturedPdf(uri);
      nav.pop();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="back"
      />
      
      {/* Thumbnails */}
      {photos.length > 0 && (
        <View style={styles.thumbnailContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10 }}>
            {photos.map((photo, index) => (
              <Image key={index} source={{ uri: photo.uri }} style={styles.thumbnail} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.controlRow}>
            <View style={{ flex: 1, alignItems: 'flex-start', paddingLeft: 20 }}>
                <TouchableOpacity onPress={() => nav.pop()}>
                    <Text style={{ color: '#fff', fontSize: 16 }}>Cancel</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.captureBtn} onPress={capture}>
                <View style={styles.captureInner} />
            </TouchableOpacity>

            <View style={{ flex: 1, alignItems: 'flex-end', paddingRight: 20 }}>
                {photos.length > 0 && (
                    <TouchableOpacity onPress={handleDone} disabled={processing}>
                        {processing ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Done ({photos.length})</Text>}
                    </TouchableOpacity>
                )}
            </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  message: { textAlign: 'center', marginBottom: 10 },
  permissionBtn: { backgroundColor: '#2563eb', padding: 10, borderRadius: 5 },
  permissionBtnText: { color: 'white' },
  controls: { position: 'absolute', bottom: 0, width: '100%', paddingBottom: 30, backgroundColor: 'rgba(0,0,0,0.5)', paddingTop: 20 },
  controlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  captureBtn: { width: 70, height: 70, borderRadius: 35, borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  captureInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff' },
  thumbnailContainer: { position: 'absolute', bottom: 120, width: '100%', height: 80 },
  thumbnail: { width: 60, height: 80, borderRadius: 6, marginRight: 8, borderWidth: 1, borderColor: '#fff' },
});

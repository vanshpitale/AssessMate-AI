import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setCapturedImage } from '../utils/ImageStore';

export default function CameraScanScreen({ nav }) {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // Camera permissions are still loading.
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
    });
    setCapturedImage(photo.uri);
    nav.pop();
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="back"
      />
      <View style={styles.controls}>
        <TouchableOpacity style={styles.captureBtn} onPress={capture}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Capture</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  message: { textAlign: 'center', marginBottom: 10 },
  permissionBtn: { backgroundColor: '#2563eb', padding: 10, borderRadius: 5 },
  permissionBtnText: { color: 'white' },
  controls: { position: 'absolute', bottom: 30, width: '100%', alignItems: 'center' },
  captureBtn: { backgroundColor: '#2563eb', padding: 16, borderRadius: 30 },
});

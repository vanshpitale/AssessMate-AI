import React from 'react';
import { View, Text, StyleSheet } from 'react-native';


export default function SmallPill({ children, color }) {
return (
<View style={[styles.pill, color ? { backgroundColor: color } : null]}>
<Text style={styles.pillText}>{children}</Text>
</View>
);
}


const styles = StyleSheet.create({
pill: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 16, backgroundColor: '#e6f5ea', marginRight: 8 },
pillText: { fontSize: 12, fontWeight: '700' },
});
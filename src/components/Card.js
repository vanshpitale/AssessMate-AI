import React from 'react';
import { View, StyleSheet } from 'react-native';


export default function Card({ children, style }) {
return <View style={[styles.card, style]}>{children}</View>;
}


const styles = StyleSheet.create({
card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: '#eef2f7', marginBottom: 6 },
});
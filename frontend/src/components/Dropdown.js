import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';

export default function Dropdown({ label, options = [], selectedValue, onValueChange, placeholder = 'Select' }) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find(o => o.value === selectedValue)?.label;

  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TouchableOpacity style={styles.selector} onPress={() => setOpen(true)}>
        <Text style={selectedLabel ? styles.selectedText : styles.placeholderText}>{selectedLabel || placeholder}</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.modalContent}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.option} onPress={() => { onValueChange(item.value); setOpen(false); }}>
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { marginTop: 12, color: '#374151', fontWeight: '600' },
  selector: { borderWidth: 1, borderColor: '#e6edf2', borderRadius: 10, padding: 12, marginTop: 8, backgroundColor: '#fff' },
  placeholderText: { color: '#9ca3af' },
  selectedText: { color: '#111827' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', maxHeight: '50%', borderTopLeftRadius: 12, borderTopRightRadius: 12, padding: 8 },
  option: { paddingVertical: 12, paddingHorizontal: 8 },
  optionText: { fontSize: 16 },
});

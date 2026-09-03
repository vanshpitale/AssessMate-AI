import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Pressable, Modal, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '../theme';

export default function Dropdown({ label, options = [], selectedValue, onValueChange, placeholder = 'Select' }) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find(o => o.value === selectedValue)?.label;

  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={selectedLabel ? styles.selectedText : styles.placeholderText}>{selectedLabel || placeholder}</Text>
        <Ionicons name="chevron-down" size={18} color={Colors.textMuted} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.modalContent}>
            <View style={styles.dragHandle} />
            <FlatList
              data={options}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => {
                const isSelected = item.value === selectedValue;
                return (
                  <Pressable
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && styles.optionSelected,
                      pressed && styles.optionPressed
                    ]}
                    onPress={() => { onValueChange(item.value); setOpen(false); }}
                  >
                    <Text style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected
                    ]}>
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-sharp" size={18} color={Colors.primary} />
                    )}
                  </Pressable>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { marginTop: 12, color: Colors.textSecondary, fontWeight: Typography.semiBold, fontSize: Typography.sm },
  selector: { 
    borderWidth: 1, 
    borderColor: Colors.border, 
    borderRadius: Radius.md, 
    padding: 12, 
    marginTop: 8, 
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeholderText: { color: Colors.textMuted, fontSize: Typography.base },
  selectedText: { color: Colors.textPrimary, fontWeight: Typography.medium, fontSize: Typography.base },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.00)', justifyContent: 'flex-end' },
  modalContent: { 
    backgroundColor: '#fff', 
    maxHeight: '50%', 
    borderTopLeftRadius: Radius.xl, 
    borderTopRightRadius: Radius.xl, 
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  option: { 
    paddingVertical: 14, 
    paddingHorizontal: Spacing.md, 
    borderRadius: Radius.md,
    marginVertical: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: Colors.primarySurface,
  },
  optionPressed: {
    backgroundColor: Colors.primarySurface + '80', // Subtle light-blue pressed color
  },
  optionText: { 
    fontSize: Typography.base,
    color: Colors.textSecondary,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: Typography.semiBold,
  },
});


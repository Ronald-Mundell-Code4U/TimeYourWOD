import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';

export interface SelectOption<T> {
  label: string;
  value: T;
}

interface Props<T> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  title?: string;
}

export function Select<T extends string | number>({
  value,
  options,
  onChange,
  placeholder = 'Select…',
  title = 'Select',
}: Props<T>) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  const current = options.find((o) => o.value === value);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.field,
          {
            borderColor: colors.fg,
            backgroundColor: pressed ? colors.bgElev : 'transparent',
          },
        ]}
        accessibilityRole="combobox"
        accessibilityLabel={title}
      >
        <Text
          style={[styles.value, { color: current ? colors.fg : colors.fgDim }]}
          numberOfLines={1}
        >
          {current?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.fg} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        // without this iOS forces the modal back to portrait, which is what
        // was preventing the beep-pack dropdown from working in landscape.
        supportedOrientations={['portrait', 'landscape']}
      >
        <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: colors.bg, borderColor: colors.fg }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.sheetHeader, { borderBottomColor: colors.line }]}>
              <Text style={[styles.sheetTitle, { color: colors.fg }]}>{title.toUpperCase()}</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={12} accessibilityLabel="close">
                <Ionicons name="close" size={22} color={colors.fg} />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 360 }}>
              {options.map((opt) => {
                const selected = opt.value === value;
                return (
                  <Pressable
                    key={String(opt.value)}
                    onPress={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      {
                        borderBottomColor: colors.line,
                        backgroundColor: pressed ? colors.bgElev : 'transparent',
                      },
                    ]}
                  >
                    <Text style={[styles.optionLabel, { color: colors.fg }]}>{opt.label}</Text>
                    {selected && <Ionicons name="checkmark" size={20} color={colors.fg} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 2,
    borderRadius: 2,
    width: '100%',
    maxWidth: 280,
  },
  value: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  sheet: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 2,
    borderRadius: 2,
    overflow: 'hidden',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  sheetTitle: { fontSize: 13, fontWeight: '800', letterSpacing: 3 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  optionLabel: { fontSize: 14, fontWeight: '700', letterSpacing: 2.5, textTransform: 'uppercase' },
});

export default Select;

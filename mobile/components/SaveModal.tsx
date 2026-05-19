import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useSavedTimers } from '../contexts/SavedTimersContext';
import type { SavedTimer } from '../shared/types';

interface Props {
  visible: boolean;
  mode: SavedTimer['mode'];
  config: SavedTimer['config'];
  defaultName?: string;
  /** if set, the save flow will overwrite this record (in-place rename + config update) */
  existingId?: string | null;
  onClose: () => void;
  onSaved: (rec: SavedTimer) => void;
}

export const SaveModal: React.FC<Props> = ({
  visible,
  mode,
  config,
  defaultName = '',
  existingId,
  onClose,
  onSaved,
}) => {
  const { colors } = useTheme();
  const { timers, save } = useSavedTimers();
  const [name, setName] = useState(defaultName);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setName(defaultName);
      setError('');
    }
  }, [visible, defaultName]);

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Name required.');
      return;
    }
    const collision = timers.find((t) => t.name === trimmed && t.id !== existingId);
    if (collision) {
      Alert.alert(
        'Replace timer?',
        `A saved timer named "${trimmed}" already exists. Replace it?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Replace',
            style: 'destructive',
            onPress: () => {
              const rec = save({ id: collision.id, name: trimmed, mode, config });
              onSaved(rec);
            },
          },
        ]
      );
      return;
    }
    const rec = save({ id: existingId ?? undefined, name: trimmed, mode, config });
    onSaved(rec);
  };

  return (
    <Modal
      visible={visible}
      transparent
      // 'fade' is orientation-agnostic; 'slide' on iOS in landscape can clip the sheet
      animationType="fade"
      onRequestClose={onClose}
      // critical: keep the OS from rotating the modal back to portrait
      supportedOrientations={['portrait', 'landscape']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.backdrop, { backgroundColor: colors.overlay }]}
        keyboardVerticalOffset={0}
      >
        {/* tap outside the card to dismiss */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            style={[styles.card, { backgroundColor: colors.bg, borderColor: colors.fg }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.title, { color: colors.fg }]}>Save {labelFor(mode)}</Text>
            <Text style={[styles.body, { color: colors.fgDim }]}>
              Give this timer a name. You'll find it in the Saved tab.
            </Text>
            <TextInput
              value={name}
              onChangeText={(t) => {
                setName(t);
                if (error) setError('');
              }}
              placeholder="e.g. Wednesday strength"
              placeholderTextColor={colors.fgDim}
              autoFocus
              maxLength={64}
              style={[
                styles.input,
                { color: colors.fg, borderColor: colors.fg, backgroundColor: 'transparent' },
              ]}
              onSubmitEditing={submit}
              returnKeyType="done"
              autoCapitalize="words"
            />
            {!!error && <Text style={[styles.error, { color: colors.alert }]}>{error}</Text>}
            <View style={styles.actions}>
              <Pressable
                onPress={onClose}
                style={[styles.btn, styles.ghost, { borderColor: colors.line }]}
              >
                <Text style={[styles.btnText, { color: colors.fg }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={submit}
                disabled={!name.trim()}
                style={[
                  styles.btn,
                  styles.cmd,
                  { borderColor: colors.fg, opacity: name.trim() ? 1 : 0.4 },
                ]}
              >
                <Text style={[styles.btnText, { color: colors.fg }]}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const labelFor = (mode: SavedTimer['mode']): string => {
  switch (mode) {
    case 'tabata':
      return 'Tabata';
    case 'emom':
      return 'EMOM';
    case 'amrap':
      return 'AMRAP';
    case 'fortime':
      return 'For Time';
    case 'complex':
      return 'workout';
  }
};

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    padding: 22,
    borderWidth: 2,
    borderRadius: 2,
    gap: 14,
  },
  title: { fontSize: 16, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '800' },
  body: { fontSize: 13, lineHeight: 20 },
  input: {
    height: 48,
    borderWidth: 2,
    borderRadius: 2,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  error: { fontSize: 12, letterSpacing: 1 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 4 },
  btn: {
    minWidth: 96,
    height: 44,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
  },
  ghost: { borderWidth: 2 },
  cmd: { borderWidth: 2 },
  btnText: { fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', fontSize: 13 },
});

export default SaveModal;

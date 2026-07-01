import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import { monoFont } from '../theme';
import { FieldRow } from './FieldRow';
import type { Interval, Loop } from '../shared/types';

interface Props {
  loop: Loop;
  loopIdx: number;
  isFirst: boolean;
  isLast: boolean;
  loopCount: number;
  onUpdate: (patch: Partial<Loop>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onUpdateInterval: (ivIdx: number, patch: Partial<Interval>) => void;
  onAddInterval: () => void;
  onRemoveInterval: (ivIdx: number) => void;
  onMoveInterval: (ivIdx: number, dir: -1 | 1) => void;
}

export const LoopCard: React.FC<Props> = ({
  loop,
  loopIdx,
  isFirst,
  isLast,
  loopCount,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onUpdateInterval,
  onAddInterval,
  onRemoveInterval,
  onMoveInterval,
}) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { borderColor: colors.line, backgroundColor: colors.bgSoft }]}>
      <View style={[styles.header, { borderBottomColor: colors.line }]}>
        <Text style={[styles.title, { color: colors.fg }]}>
          LOOP {String(loopIdx + 1).padStart(2, '0')}
        </Text>
        <View style={styles.controls}>
          <IconBtn icon="arrow-up" onPress={onMoveUp} disabled={isFirst} colors={colors} />
          <IconBtn icon="arrow-down" onPress={onMoveDown} disabled={isLast} colors={colors} />
          <IconBtn icon="copy-outline" onPress={onDuplicate} colors={colors} />
          <IconBtn icon="close" onPress={onDelete} disabled={loopCount === 1} colors={colors} />
        </View>
      </View>

      <View style={{ alignItems: 'center', paddingVertical: 4 }}>
        <FieldRow
          prefix="FOR"
          suffix="ROUNDS"
          value={loop.rounds}
          onChange={(v) => onUpdate({ rounds: v })}
          min={1}
        />
      </View>

      <Text style={[styles.heading, { color: colors.fgDim }]}>INTERVALS</Text>
      <View style={{ gap: 8 }}>
        {loop.intervals.map((iv, ivIdx) => (
          <View
            key={iv.id}
            style={[
              styles.intervalRow,
              { borderColor: colors.line, backgroundColor: colors.bgElev },
            ]}
          >
            <View style={styles.intervalLeft}>
              <Text style={[styles.intervalIndex, { color: colors.fgDim }]}>
                {String(ivIdx + 1).padStart(2, '0')}
              </Text>
              <IconBtn
                icon="close"
                small
                onPress={() => onRemoveInterval(ivIdx)}
                disabled={loop.intervals.length === 1}
                colors={colors}
              />
            </View>
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.fgDim }]}>WORK · SEC</Text>
              <TextInput
                style={[styles.input, { color: colors.fg, borderColor: colors.fg }]}
                keyboardType="number-pad"
                value={String(iv.work)}
                selectTextOnFocus
                maxLength={4}
                onChangeText={(t) => onUpdateInterval(ivIdx, { work: Math.max(0, Number(t.replace(/[^0-9]/g, '') || 0)) })}
              />
            </View>
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.fgDim }]}>REST · SEC</Text>
              <TextInput
                style={[styles.input, { color: colors.fg, borderColor: colors.fg }]}
                keyboardType="number-pad"
                value={String(iv.rest)}
                selectTextOnFocus
                maxLength={4}
                onChangeText={(t) => onUpdateInterval(ivIdx, { rest: Math.max(0, Number(t.replace(/[^0-9]/g, '') || 0)) })}
              />
            </View>
            <View style={styles.intervalControls}>
              <IconBtn
                icon="arrow-up"
                small
                onPress={() => onMoveInterval(ivIdx, -1)}
                disabled={ivIdx === 0}
                colors={colors}
              />
              <IconBtn
                icon="arrow-down"
                small
                onPress={() => onMoveInterval(ivIdx, 1)}
                disabled={ivIdx === loop.intervals.length - 1}
                colors={colors}
              />
            </View>
          </View>
        ))}
      </View>

      <Pressable
        onPress={onAddInterval}
        style={({ pressed }) => [
          styles.addBtn,
          {
            borderColor: pressed ? colors.fg : colors.line,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text style={[styles.addText, { color: colors.fg }]}>+ ADD INTERVAL</Text>
      </Pressable>

      {!isLast && (
        <View style={[styles.transition, { borderTopColor: colors.line }]}>
          <FieldRow
            prefix="THEN REST"
            suffix="SECONDS"
            value={loop.transitionRest}
            onChange={(v) => onUpdate({ transitionRest: v })}
            min={0}
          />
        </View>
      )}
    </View>
  );
};

const IconBtn: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  small?: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}> = ({ icon, onPress, disabled, small, colors }) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={[
      styles.iconBtn,
      {
        width: small ? 28 : 34,
        height: small ? 28 : 34,
        borderColor: colors.line,
        opacity: disabled ? 0.3 : 1,
      },
    ]}
    accessibilityLabel={icon}
  >
    <Ionicons name={icon} size={small ? 14 : 16} color={colors.fg} />
  </Pressable>
);


const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 3,
    padding: 12,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 4,
  },
  controls: { flexDirection: 'row', gap: 6 },
  heading: {
    textAlign: 'center',
    fontSize: 11,
    letterSpacing: 4,
    fontWeight: '700',
  },
  intervalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 2,
  },
  intervalLeft: {
    alignItems: 'center',
    gap: 4,
  },
  intervalIndex: {
    fontSize: 12,
    letterSpacing: 1.5,
    fontWeight: '700',
    width: 22,
    textAlign: 'center',
    paddingTop: 4,
  },
  field: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  fieldLabel: {
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    maxWidth: 90,
    height: 42,
    borderWidth: 2,
    borderRadius: 2,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: monoFont,
    paddingHorizontal: 8,
  },
  intervalControls: {
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    borderWidth: 1,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    borderWidth: 2,
    borderRadius: 2,
    padding: 10,
    alignItems: 'center',
  },
  addText: {
    fontSize: 12,
    letterSpacing: 2.5,
    fontWeight: '700',
  },
  transition: {
    paddingTop: 10,
    borderTopWidth: 1,
    alignItems: 'center',
  },
});

export default LoopCard;

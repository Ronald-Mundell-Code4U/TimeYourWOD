import React, { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/useTheme';

interface Props {
  progress: number;
  paused: boolean;
  running: boolean;
  heat1: ReactNode;
  heat2?: ReactNode | null;
  belowTimer?: ReactNode;
  onTogglePause: () => void;
  onReset: () => void;
}

export const TimerScreen: React.FC<Props> = ({
  progress,
  paused,
  running,
  heat1,
  heat2,
  belowTimer,
  onTogglePause,
  onReset,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const hasTwoHeats = !!heat2;
  // portrait → always column; landscape with two heats → row; landscape single → column
  const heatsRow = isLandscape && hasTwoHeats;

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={[styles.rail, { top: insets.top }]}>
        <View
          style={{
            height: '100%',
            backgroundColor: colors.fg,
            width: `${Math.max(0, Math.min(1, progress)) * 100}%` as `${number}%`,
          }}
        />
      </View>

      {/* invisible reset hot-corner — top-left */}
      <Pressable
        onPress={onReset}
        accessibilityLabel="reset timer"
        accessibilityRole="button"
        style={[styles.hotCorner, { top: insets.top }]}
      />

      {/* clickable timer body — flex: 1 so it fills remaining space.
          NB: the Stack header already accounts for insets.top, so we use a
          small symmetric padding here to keep the digits visually centered. */}
      <Pressable
        onPress={onTogglePause}
        style={[
          styles.body,
          {
            paddingTop: 4,
            paddingBottom: 4,
            paddingLeft: insets.left + 12,
            paddingRight: insets.right + 12,
          },
        ]}
        accessibilityLabel="tap to pause or resume"
      >
        <View
          style={[
            styles.heatsGrid,
            heatsRow
              ? { flexDirection: 'row', gap: 24 }
              : { flexDirection: 'column', gap: hasTwoHeats ? 24 : 0 },
          ]}
        >
          <View style={heatsRow ? styles.heatSlot : styles.heatStack}>{heat1}</View>
          {heat2 && (
            <View style={heatsRow ? styles.heatSlot : styles.heatStack}>{heat2}</View>
          )}
        </View>

        {paused && (
          <View
            pointerEvents="none"
            style={[styles.pausedOverlay, { backgroundColor: colors.overlay }]}
          >
            <View
              style={[
                styles.pausedCard,
                { backgroundColor: colors.bg, borderColor: colors.fg },
              ]}
            >
              <View style={styles.pausedGlyph}>
                <View style={[styles.pausedBar, { backgroundColor: colors.fg }]} />
                <View style={[styles.pausedBar, { backgroundColor: colors.fg }]} />
              </View>
              <Text style={[styles.pausedText, { color: colors.fg }]}>PAUSED</Text>
              <Text style={[styles.pausedHint, { color: colors.fgDim }]}>TAP TO RESUME</Text>
            </View>
          </View>
        )}
      </Pressable>

      {belowTimer && (
        <View style={[styles.below, { paddingBottom: 8 + insets.bottom }]}>{belowTimer}</View>
      )}
    </View>
  );
};

/**
 * Helper for mode screens to pick a heat font size that fits both axes.
 *
 * @param charCount         number of characters in the displayed time string.
 *                          5 for "00:00" (default), 8 for "00:00:00" (Clock).
 * @param reservedBottomPx  extra vertical room to leave free at the bottom for
 *                          end-state controls (RESTART / EXIT) or status text.
 */
export const heatFontSize = (
  width: number,
  height: number,
  twoHeats: boolean,
  charCount: number = 5,
  reservedBottomPx: number = 0
): number => {
  const isLandscape = width > height;
  // reserve for label/round/phase rows + header + paddings + caller's extra
  const vReserve = 150 + reservedBottomPx;
  const usableH = Math.max(80, height - vReserve);
  // when heats are side-by-side, each slot is roughly half the screen width
  // (minus the 24px gap and ~48px of horizontal paddings)
  const usableW = isLandscape && twoHeats ? (width - 24 - 48) / 2 : width - 40;
  // mono digit ratio: ~0.72 fontSize per character — over-counts a bit on purpose
  // so digits sit inside their slot with visible padding instead of touching the edge.
  const fromW = usableW / (charCount * 0.72);
  // two stacked heats in portrait have to share the vertical budget,
  // single heat leaves room top + bottom around the digits.
  const fromH = usableH / (twoHeats && !isLandscape ? 2.8 : 1.5);
  // final cap a touch lower so even on tablets the digits aren't gigantic.
  return Math.max(48, Math.min(fromW, fromH, 200));
};

const styles = StyleSheet.create({
  root: { flex: 1, position: 'relative' },
  rail: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    zIndex: 50,
  },
  hotCorner: {
    position: 'absolute',
    left: 0,
    width: '20%',
    height: '20%',
    zIndex: 70,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heatsGrid: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  heatSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  heatStack: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pausedOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    zIndex: 60,
  },
  pausedCard: {
    paddingHorizontal: 44,
    paddingVertical: 28,
    borderWidth: 2,
    borderRadius: 2,
    alignItems: 'center',
    gap: 16,
  },
  pausedGlyph: { flexDirection: 'row', gap: 12 },
  pausedBar: { width: 16, height: 52 },
  pausedText: { fontSize: 30, fontWeight: '800', letterSpacing: 7 },
  pausedHint: { fontSize: 11, letterSpacing: 3 },
  below: {
    paddingHorizontal: 16,
    paddingTop: 8,
    alignItems: 'center',
    gap: 10,
  },
});

export default TimerScreen;

import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { useSavedTimers } from '../../contexts/SavedTimersContext';
import { formatMMSS } from '../../shared/timer-utils';
import { buildTimeline, timelineTotal } from '../../shared/complex-timeline';
import type {
  AmrapConfig,
  EmomConfig,
  ForTimeConfig,
  SavedTimer,
  TabataConfig,
  Workout,
} from '../../shared/types';

const summarize = (t: SavedTimer): string => {
  switch (t.mode) {
    case 'tabata': {
      const c = t.config as TabataConfig;
      return `${c.rounds} rounds · ${c.work}/${c.rest}s`;
    }
    case 'emom': {
      const c = t.config as EmomConfig;
      return `${c.rounds} rounds · every ${c.workTotal}s${c.rest ? ` · ${c.rest}s rest` : ''}`;
    }
    case 'amrap': {
      const c = t.config as AmrapConfig;
      return `${c.duration} min`;
    }
    case 'fortime': {
      const c = t.config as ForTimeConfig;
      return `${c.duration} min`;
    }
    case 'complex': {
      const c = t.config as Workout;
      const total = timelineTotal(buildTimeline(c));
      return `${c.length} loop${c.length === 1 ? '' : 's'} · ${formatMMSS(total)}`;
    }
  }
};

const modeBadge = (mode: SavedTimer['mode']): string => mode.toUpperCase();

const relativeTime = (ts?: number): string => {
  if (!ts) return 'never run';
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return `${Math.floor(day / 30)}mo ago`;
};

const Saved: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { ready, timers, remove } = useSavedTimers();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? timers.filter((t) => t.name.toLowerCase().includes(q) || t.mode.includes(q))
      : timers;
    // recent-first: lastRunAt desc, then updatedAt desc
    return [...list].sort((a, b) => (b.lastRunAt ?? b.updatedAt) - (a.lastRunAt ?? a.updatedAt));
  }, [timers, search]);

  const openTimer = (t: SavedTimer) => {
    router.push({ pathname: `/${t.mode === 'fortime' ? 'for-time' : t.mode}` as any, params: { savedId: t.id } });
  };

  const confirmDelete = (t: SavedTimer) => {
    Alert.alert('Delete saved timer?', `"${t.name}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove(t.id) },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg, paddingTop: insets.top + 8 }]}>
      <View style={styles.searchRow}>
        <TextInput
          style={[
            styles.search,
            { color: colors.fg, borderColor: colors.line, backgroundColor: colors.bgSoft },
          ]}
          placeholder="Search saved timers…"
          placeholderTextColor={colors.fgDim}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      {!ready ? null : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.fgDim }]}>
            No saved timers yet. Open any mode, configure it, and tap SAVE.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(t) => t.id}
          contentContainerStyle={{ paddingBottom: 40 + insets.bottom, paddingHorizontal: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => openTimer(item)}
              onLongPress={() => confirmDelete(item)}
              style={({ pressed }) => [
                styles.card,
                {
                  borderColor: colors.line,
                  backgroundColor: pressed ? colors.bgElev : colors.bgSoft,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardMeta, { color: colors.fgDim }]}>
                  {modeBadge(item.mode)} · {summarize(item)}
                </Text>
                <Text style={[styles.cardName, { color: colors.fg }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.cardSub, { color: colors.fgDim }]}>
                  Last run · {relativeTime(item.lastRunAt)}
                </Text>
              </View>
              <Pressable
                onPress={() => confirmDelete(item)}
                hitSlop={12}
                style={styles.iconBtn}
                accessibilityLabel="delete"
              >
                <Ionicons name="trash-outline" size={20} color={colors.fgDim} />
              </Pressable>
            </Pressable>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  searchRow: { paddingHorizontal: 16, paddingVertical: 12 },
  search: {
    height: 44,
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 12,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderRadius: 2,
  },
  cardMeta: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardSub: {
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Saved;

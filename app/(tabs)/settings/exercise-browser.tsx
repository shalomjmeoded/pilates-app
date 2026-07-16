import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Redirect } from 'expo-router';

import { SettingsScreenShell } from '@/components/settings';
import { ExerciseMediaView, ExerciseYouTubeEmbed } from '@/components/workout';
import { Text } from '@/components/ui/Text';
import { getAllExercises } from '@/db/repositories/exerciseRepository';
import type { Exercise } from '@/types/exercise';
import { colors, radius, spacing } from '@/theme';

export default function DevExerciseBrowserScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!__DEV__) {
      return;
    }
    void getAllExercises().then(setExercises);
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return exercises;
    }
    return exercises.filter(
      (exercise) =>
        exercise.name.toLowerCase().includes(normalized) ||
        exercise.id.toLowerCase().includes(normalized) ||
        exercise.equipment.toLowerCase().includes(normalized) ||
        exercise.muscleGroup.toLowerCase().includes(normalized),
    );
  }, [exercises, query]);

  const selected = filtered.find((exercise) => exercise.id === selectedId) ?? filtered[0] ?? null;

  if (!__DEV__) {
    return <Redirect href="/(tabs)/settings" />;
  }

  return (
    <SettingsScreenShell
      title="Exercise browser (dev)"
      subtitle="Search the library and preview thumbnails, GIFs, and YouTube embeds."
    >
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search name, id, equipment…"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.search}
      />

      <Text variant="caption" style={styles.count}>
        {filtered.length} of {exercises.length} exercises
      </Text>

      <View style={styles.split}>
        <FlatList
          style={styles.list}
          data={filtered}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const active = selected?.id === item.id;
            return (
              <Pressable
                onPress={() => setSelectedId(item.id)}
                style={[styles.row, active && styles.rowActive]}
              >
                <Text variant="body" numberOfLines={1} style={active ? styles.rowLabelActive : undefined}>
                  {item.name}
                </Text>
                <Text variant="caption" numberOfLines={1} style={styles.rowMeta}>
                  {item.equipment} · {item.youtubeVideoId ? 'YT' : 'no YT'}
                </Text>
              </Pressable>
            );
          }}
        />

        <ScrollView style={styles.preview} contentContainerStyle={styles.previewContent}>
          {selected ? (
            <>
              <Text variant="h2">{selected.name}</Text>
              <Text variant="caption" style={styles.meta}>
                {selected.id}
              </Text>
              <Text variant="caption" style={styles.meta}>
                {selected.muscleGroup} · {selected.equipment} · {selected.sessionRole}
              </Text>

              <Text variant="label" style={styles.section}>
                Thumbnail
              </Text>
              <ExerciseMediaView exercise={selected} variant="thumbnail" fillWidth fillHeight={160} />

              <Text variant="label" style={styles.section}>
                YouTube
              </Text>
              {selected.youtubeVideoId ? (
                <ExerciseYouTubeEmbed exercise={selected} allowStreaming />
              ) : (
                <Text variant="bodyMuted">No curated YouTube video for this exercise.</Text>
              )}
            </>
          ) : (
            <Text variant="bodyMuted">No exercises match.</Text>
          )}
        </ScrollView>
      </View>
    </SettingsScreenShell>
  );
}

const styles = StyleSheet.create({
  search: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    color: colors.textDark,
    backgroundColor: colors.surfaceCanvas,
  },
  count: {
    marginTop: spacing.xs,
    color: colors.textMuted,
  },
  split: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 480,
  },
  list: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.card,
    backgroundColor: colors.surfaceCanvas,
  },
  row: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  rowActive: {
    backgroundColor: colors.surfaceRose,
  },
  rowLabelActive: {
    color: colors.brandPrimary,
  },
  rowMeta: {
    color: colors.textMuted,
  },
  preview: {
    flex: 1.2,
  },
  previewContent: {
    gap: spacing.xs,
    paddingBottom: spacing.lg,
  },
  meta: {
    color: colors.textMuted,
  },
  section: {
    marginTop: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, parseISO } from 'date-fns';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import {
  deleteWeightLog,
  getAllWeightLogs,
  searchWeightLogs,
} from '@/db/repositories/weightLogRepository';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { colors, radius, spacing } from '@/theme';
import { displayWeight } from '@/utils/units';
import type { WeightLog } from '@/types/progress';

export default function WeightHistoryScreen() {
  const router = useRouter();
  const weightUnit = usePreferencesStore((state) => state.preferences.units.weight);
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [query, setQuery] = useState('');

  const reload = useCallback(async () => {
    const rows = query.trim() ? await searchWeightLogs(query) : await getAllWeightLogs();
    setLogs([...rows].reverse());
  }, [query]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handleDelete = (log: WeightLog) => {
    Alert.alert('Delete weight entry?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await deleteWeightLog(log.id);
            await reload();
          })();
        },
      },
    ]);
  };

  const listData = useMemo(() => logs, [logs]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Pressable accessibilityRole="button" onPress={() => router.back()}>
          <Text variant="bodyMuted">← Progress</Text>
        </Pressable>
        <Text variant="h1">Weight History</Text>
        <TextInput
          accessibilityLabel="Search weight entries"
          placeholder="Search notes or weight"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          style={styles.search}
        />
        <FlatList
          data={listData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Text variant="h2">{displayWeight(item.weightKg, weightUnit)}</Text>
              <Text variant="bodyMuted">{format(parseISO(item.loggedAt), 'MMM d, yyyy · h:mm a')}</Text>
              {item.note ? <Text variant="body">{item.note}</Text> : null}
              <View style={styles.row}>
                <Button
                  label="Edit"
                  variant="secondary"
                  onPress={() => router.push({ pathname: '/modals/log-weight', params: { editId: item.id } })}
                />
                <Pressable accessibilityRole="button" onPress={() => handleDelete(item)} style={styles.deleteButton}>
                  <Text variant="label" style={styles.delete}>Delete</Text>
                </Pressable>
              </View>
            </Card>
          )}
          ListEmptyComponent={<Text variant="bodyMuted">No weight entries found.</Text>}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.backgroundPrimary },
  container: { flex: 1, padding: spacing.sm, gap: spacing.sm },
  search: {
    backgroundColor: colors.surfaceCanvas,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.sm,
    minHeight: 44,
    color: colors.textDark,
  },
  list: { gap: spacing.sm, paddingBottom: spacing.lg },
  card: { gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  deleteButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.sm },
  delete: { color: colors.brandPrimary },
});

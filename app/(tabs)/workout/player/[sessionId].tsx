import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AppState, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExerciseMediaView, WorkoutExitSheet } from '@/components/workout';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { TuneBootLoader } from '@/components/ui/TuneBootLoader';
import { discardWorkoutSession, updateSessionProgress } from '@/db/repositories/workoutRepository';
import { useWorkoutSession } from '@/hooks/useWorkoutSession';
import { colors, spacing } from '@/theme';

export default function WorkoutPlayerScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { session, exercises, isLoading, error } = useWorkoutSession(sessionId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [exitVisible, setExitVisible] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!session || initialized.current) {
      return;
    }
    setCurrentIndex(session.currentExerciseIndex ?? 0);
    setElapsedSeconds(session.elapsedSeconds ?? 0);
    initialized.current = true;
  }, [session]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }

    const persist = () => {
      void updateSessionProgress(session.id, currentIndex, elapsedSeconds);
    };

    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        persist();
      }
    });

    return () => {
      persist();
      subscription.remove();
    };
  }, [session, currentIndex, elapsedSeconds]);

  if (isLoading) {
    return <TuneBootLoader message="Opening your session..." />;
  }

  if (error || !session || exercises.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text variant="h2">Session unavailable</Text>
          <Text variant="bodyMuted" style={styles.copy}>
            {error ?? 'This workout could not be loaded.'}
          </Text>
          <Button label="Back to Workout" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const current = exercises[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex >= exercises.length - 1;
  const prescription = current.holdSeconds
    ? `${current.sets} sets · ${current.holdSeconds}s hold`
    : `${current.sets} sets · ${current.reps ?? '—'} reps`;

  const persistIndex = async (nextIndex: number) => {
    setCurrentIndex(nextIndex);
    await updateSessionProgress(session.id, nextIndex, elapsedSeconds);
  };

  const handlePrevious = () => {
    if (isFirst) {
      return;
    }
    void persistIndex(currentIndex - 1);
  };

  const handleNext = async () => {
    if (isLast) {
      await updateSessionProgress(session.id, currentIndex, elapsedSeconds);
      router.replace(`/(tabs)/workout/feedback/${session.id}`);
      return;
    }
    await persistIndex(currentIndex + 1);
  };

  const handleResumeLater = async () => {
    await updateSessionProgress(session.id, currentIndex, elapsedSeconds);
    setExitVisible(false);
    router.replace('/(tabs)/workout');
  };

  const handleDiscard = async () => {
    await discardWorkoutSession(session.id);
    setExitVisible(false);
    router.replace('/(tabs)/workout');
  };

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Exit workout"
          onPress={() => setExitVisible(true)}
          style={styles.closeButton}
        >
          <Feather name="x" size={22} color={colors.textDark} />
        </Pressable>
        <Text variant="label">
          {currentIndex + 1} / {exercises.length} · {minutes}:{seconds.toString().padStart(2, '0')}
        </Text>
        <View style={styles.closeSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ExerciseMediaView exercise={current.exercise} variant="gif" fillWidth />

        <Text variant="h1" style={styles.title}>
          {current.exercise.name}
        </Text>
        <Text variant="bodyMuted">{titleCase(current.exercise.muscleGroup)}</Text>

        <Text variant="h2" style={styles.prescription}>
          {prescription}
        </Text>

        <View style={styles.instructions}>
          <Text variant="label">Instructions</Text>
          {current.exercise.instructions.map((step, index) => (
            <Text key={`${current.exercise.id}-step-${index}`} variant="body">
              {index + 1}. {step}
            </Text>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Button
            label="Previous"
            variant="secondary"
            onPress={handlePrevious}
            disabled={isFirst}
            style={styles.footerButton}
            accessibilityLabel="Go to previous exercise"
          />
          <Button
            label={isLast ? 'Complete' : 'Next'}
            onPress={() => void handleNext()}
            style={styles.footerButton}
            accessibilityLabel={isLast ? 'Complete workout' : 'Go to next exercise'}
          />
        </View>
      </View>

      <WorkoutExitSheet
        visible={exitVisible}
        onResumeLater={() => void handleResumeLater()}
        onDiscard={() => void handleDiscard()}
        onContinue={() => setExitVisible(false)}
      />
    </SafeAreaView>
  );
}

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceCanvas,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeSpacer: {
    width: 44,
  },
  scrollContent: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  copy: {
    textAlign: 'center',
  },
  title: {
    marginTop: spacing.xs,
  },
  prescription: {
    color: colors.brandPrimary,
  },
  instructions: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  footer: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  footerButton: {
    flex: 1,
  },
});

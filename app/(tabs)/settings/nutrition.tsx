import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { MealFormField } from '@/components/nutrition/MealFormField';
import { OptionCard } from '@/components/onboarding';
import { CalorieSafetyBanner, SettingsScreenShell } from '@/components/settings';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { getActiveNutritionTargets } from '@/db/repositories/nutritionRepository';
import { validateManualTargets } from '@/engines/settings';
import { useSettingsProfile } from '@/hooks/useSettingsProfile';
import {
  restoreAutoNutritionTargets,
  saveManualNutritionTargets,
} from '@/services/recalibration/recalibrateProfile';
import { useRecalibrationStore } from '@/stores/recalibrationStore';
import { colors, spacing } from '@/theme';
import { useRouter } from 'expo-router';

export default function NutritionSettingsScreen() {
  const router = useRouter();
  const { profile, isLoading, isSaving, error, saveAndRecalibrate } = useSettingsProfile();
  const setComparison = useRecalibrationStore((state) => state.setComparison);
  const [manualMode, setManualMode] = useState(false);
  const [calories, setCalories] = useState('');
  const [proteinG, setProteinG] = useState('');
  const [carbsG, setCarbsG] = useState('');
  const [fatG, setFatG] = useState('');
  const [fiberG, setFiberG] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [safetyThreshold, setSafetyThreshold] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      if (!profile) return;
      const today = format(new Date(), 'yyyy-MM-dd');
      const targets = await getActiveNutritionTargets(today);
      if (targets) {
        setManualMode(targets.isManualOverride);
        setCalories(String(targets.calories));
        setProteinG(String(targets.proteinG));
        setCarbsG(String(targets.carbsG));
        setFatG(String(targets.fatG));
        setFiberG(String(targets.fiberG));
      }
    }
    void load();
  }, [profile]);

  if (isLoading || !profile) {
    return (
      <SettingsScreenShell title="Nutrition" subtitle="Loading...">
        <Text variant="bodyMuted">Loading nutrition settings...</Text>
      </SettingsScreenShell>
    );
  }

  const handleManualSave = async () => {
    const targets = {
      calories: Number(calories),
      proteinG: Number(proteinG),
      carbsG: Number(carbsG),
      fatG: Number(fatG),
      fiberG: Number(fiberG),
    };

    const validation = validateManualTargets(targets, profile.genderIdentity);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      setSafetyThreshold(null);
      return;
    }

    setValidationErrors([]);
    setSafetyThreshold(validation.safetyWarning?.threshold ?? null);

    const comparison = await saveManualNutritionTargets(targets, profile);
    setComparison(comparison);
    router.push('/(tabs)/settings/plan-updated');
  };

  const handleRestoreAuto = async () => {
    const comparison = await restoreAutoNutritionTargets(profile);
    setManualMode(false);
    setComparison(comparison);
    router.push('/(tabs)/settings/plan-updated');
  };

  return (
    <SettingsScreenShell
      title="Nutrition"
      subtitle="Targets that match your rhythm."
    >
      <Text variant="label">Target source</Text>
      <OptionCard
        label="Auto-calculated"
        description="Based on your profile and goals."
        selected={!manualMode}
        onPress={() => setManualMode(false)}
      />
      <OptionCard
        label="Manual override"
        description="Set your own calorie and macro targets."
        selected={manualMode}
        onPress={() => setManualMode(true)}
      />

      {manualMode ? (
        <>
          <MealFormField label="Calories" value={calories} onChangeText={setCalories} keyboardType="decimal-pad" />
          <MealFormField label="Protein (g)" value={proteinG} onChangeText={setProteinG} keyboardType="decimal-pad" />
          <MealFormField label="Carbs (g)" value={carbsG} onChangeText={setCarbsG} keyboardType="decimal-pad" />
          <MealFormField label="Fat (g)" value={fatG} onChangeText={setFatG} keyboardType="decimal-pad" />
          <MealFormField label="Fiber (g)" value={fiberG} onChangeText={setFiberG} keyboardType="decimal-pad" />

          {safetyThreshold ? <CalorieSafetyBanner threshold={safetyThreshold} /> : null}
          {validationErrors.map((item) => (
            <Text key={item} variant="body" style={styles.error}>{item}</Text>
          ))}

          <Button label="Save manual targets" onPress={() => void handleManualSave()} />
          <Button label="Restore auto targets" variant="secondary" onPress={() => void handleRestoreAuto()} />
        </>
      ) : (
        <Button label="Recalculate from profile" variant="secondary" onPress={() => void saveAndRecalibrate(profile)} />
      )}

      {error ? <Text variant="body" style={styles.error}>{error}</Text> : null}
    </SettingsScreenShell>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.xs,
  },
  error: {
    color: colors.brandPrimary,
  },
});

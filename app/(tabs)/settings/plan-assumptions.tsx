import { format } from 'date-fns';
import { useEffect, useState } from 'react';

import { SettingsScreenShell } from '@/components/settings';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { getActiveNutritionTargets } from '@/db/repositories/nutritionRepository';
import { getProfile } from '@/db/repositories/profileRepository';
import { getLatestPhysiqueAssessment } from '@/db/repositories/physiqueAssessmentRepository';
import { calculateBmr, calculateTdee } from '@/engines/calculations';
import {
  formatBodyFatRange,
  formatPhysiqueCategory,
  formatPhysiqueConfidence,
} from '@/engines/physique/physiqueAssessmentFlow';
import { midpointBodyFatPercent } from '@/engines/physique/bodyFatAssumptions';
import type { NutritionTargets } from '@/types/nutrition';
import type { Profile } from '@/types/profile';
import type { StoredPhysiqueAssessment } from '@/types/physiqueAssessment';
import { spacing } from '@/theme';
import { formatPaceIntensity } from '@/utils/pace';

export default function PlanAssumptionsScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [targets, setTargets] = useState<NutritionTargets | null>(null);
  const [physique, setPhysique] = useState<StoredPhysiqueAssessment | null>(null);

  useEffect(() => {
    void (async () => {
      const loadedProfile = await getProfile();
      setProfile(loadedProfile);
      if (loadedProfile) {
        setTargets(await getActiveNutritionTargets(format(new Date(), 'yyyy-MM-dd')));
      }
      setPhysique(await getLatestPhysiqueAssessment());
    })();
  }, []);

  if (!profile || !targets) {
    return (
      <SettingsScreenShell title="Plan assumptions">
        <Text variant="bodyMuted">Loading...</Text>
      </SettingsScreenShell>
    );
  }

  const bodyFatPercent = physique
    ? midpointBodyFatPercent(physique.estimatedBodyFatRange)
    : undefined;
  const { bmr, formula } = calculateBmr({
    genderIdentity: profile.genderIdentity,
    weightKg: profile.currentWeightKg,
    heightCm: profile.heightCm,
    birthYear: profile.birthYear,
    bodyFatPercent,
  });
  const { tdee, multiplier } = calculateTdee(bmr, profile.trainingFrequency);

  return (
    <SettingsScreenShell title="Plan assumptions" subtitle="What Tune is using for your plan today.">
      <Card style={{ gap: spacing.xs }}>
        <Text variant="label">Goal</Text>
        <Text variant="body">{profile.fitnessGoal.replaceAll('_', ' ')}</Text>
        <Text variant="label">Pace</Text>
        <Text variant="body">{formatPaceIntensity(profile.paceKgPerWeek)}</Text>
        <Text variant="label">Activity level</Text>
        <Text variant="body">{profile.trainingFrequency.replaceAll('_', ' ')}</Text>
        <Text variant="label">Calorie target</Text>
        <Text variant="body">{Math.round(targets.calories)} kcal</Text>
        <Text variant="label">Macro targets</Text>
        <Text variant="bodyMuted">
          P {Math.round(targets.proteinG)}g · C {Math.round(targets.carbsG)}g · F {Math.round(targets.fatG)}g · Fi {Math.round(targets.fiberG)}g
        </Text>
        <Text variant="bodyMuted">
          Source: {targets.isManualOverride ? 'Manual override' : 'Auto-calculated'}
        </Text>
      </Card>

      <Card style={{ gap: spacing.xs }}>
        <Text variant="label">Energy model</Text>
        <Text variant="body">BMR {Math.round(bmr)} kcal</Text>
        <Text variant="bodyMuted">
          Formula: {formula === 'katch_mcardle' ? 'Katch-McArdle (lean mass)' : 'Mifflin-St Jeor'}
        </Text>
        <Text variant="body">TDEE {Math.round(tdee)} kcal</Text>
        <Text variant="bodyMuted">Activity multiplier ×{multiplier}</Text>
        {physique ? (
          <>
            <Text variant="label">Visual body fat assumption</Text>
            <Text variant="body">{formatBodyFatRange(physique.estimatedBodyFatRange)}</Text>
            <Text variant="bodyMuted">
              Midpoint {bodyFatPercent}% · {formatPhysiqueCategory(physique.physiqueCategory)} ·{' '}
              {formatPhysiqueConfidence(physique.confidence)}
            </Text>
            <Text variant="bodyMuted">
              Protein targets use lean mass when a saved visual assessment exists.
            </Text>
          </>
        ) : (
          <Text variant="bodyMuted">
            No saved visual physique assessment — using weight-based estimates only.
          </Text>
        )}
      </Card>
    </SettingsScreenShell>
  );
}

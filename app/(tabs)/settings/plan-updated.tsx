import { useRouter } from 'expo-router';

import { PlanUpdatedCard, SettingsScreenShell } from '@/components/settings';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useRecalibrationStore } from '@/stores/recalibrationStore';

export default function PlanUpdatedScreen() {
  const router = useRouter();
  const comparison = useRecalibrationStore((state) => state.comparison);
  const clearComparison = useRecalibrationStore((state) => state.clearComparison);

  const handleDone = () => {
    clearComparison();
    router.replace('/(tabs)/settings');
  };

  if (!comparison) {
    return (
      <SettingsScreenShell title="Plan updated">
        <Text variant="bodyMuted">No update details available.</Text>
        <Button label="Back to settings" onPress={handleDone} />
      </SettingsScreenShell>
    );
  }

  return (
    <SettingsScreenShell title="Plan updated" subtitle="Your targets have been recalculated.">
      <PlanUpdatedCard comparison={comparison} />
      <Button label="Done" onPress={handleDone} />
    </SettingsScreenShell>
  );
}

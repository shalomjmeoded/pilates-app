import { useEffect, useState } from 'react';

import { OptionCard } from '@/components/onboarding';
import { SettingsScreenShell } from '@/components/settings';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { getProfile, saveProfile } from '@/db/repositories/profileRepository';
import { MEDIA_OPTIONS, PREFERENCE_OPTIONS } from '@/onboarding/constants';
import type { ExercisePreference, Profile } from '@/types/profile';
import { spacing } from '@/theme';

export default function PreferencesSettingsScreen() {
  const [savedProfile, setSavedProfile] = useState<Profile | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void getProfile().then((loaded) => {
      setSavedProfile(loaded);
      setProfile(loaded);
    });
  }, []);

  if (!profile) {
    return (
      <SettingsScreenShell title="Preferences">
        <Text variant="bodyMuted">Loading...</Text>
      </SettingsScreenShell>
    );
  }

  const togglePreference = (value: ExercisePreference) => {
    const next = profile.exercisePreferences.includes(value)
      ? profile.exercisePreferences.filter((item) => item !== value)
      : [...profile.exercisePreferences, value];
    setProfile({ ...profile, exercisePreferences: next });
  };

  const handleSave = async () => {
    setIsSaving(true);
    await saveProfile(profile);
    setSavedProfile(profile);
    setIsSaving(false);
  };

  const hasUnsavedChanges =
    savedProfile !== null && JSON.stringify(profile) !== JSON.stringify(savedProfile);

  return (
    <SettingsScreenShell
      title="Preferences"
      subtitle="Media and exercise style preferences."
      hasUnsavedChanges={hasUnsavedChanges}
    >
      <Text variant="label" style={{ marginTop: spacing.xs }}>Media preference</Text>
      {MEDIA_OPTIONS.map((option) => (
        <OptionCard
          key={option.value}
          label={option.label}
          description={option.description}
          selected={profile.mediaPreference === option.value}
          onPress={() => setProfile({ ...profile, mediaPreference: option.value })}
        />
      ))}

      <Text variant="label" style={{ marginTop: spacing.xs }}>Exercise preferences</Text>
      {PREFERENCE_OPTIONS.map((option) => (
        <OptionCard
          key={option.value}
          label={option.label}
          selected={profile.exercisePreferences.includes(option.value)}
          onPress={() => togglePreference(option.value)}
        />
      ))}

      <Button label={isSaving ? 'Saving...' : 'Save preferences'} onPress={() => void handleSave()} disabled={isSaving || profile.exercisePreferences.length === 0} />
    </SettingsScreenShell>
  );
}

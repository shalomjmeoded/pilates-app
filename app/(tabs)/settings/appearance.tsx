import { Pressable, View } from 'react-native';

import { SettingsScreenShell } from '@/components/settings';
import { Text } from '@/components/ui/Text';
import { logSettingChange } from '@/db/repositories/settingsAuditRepository';
import { usePremium } from '@/hooks/usePremium';
import type { ThemePreference } from '@/types/preferences';
import {
  colors,
  createDynamicStyles,
  metrics,
  radius,
  spacing,
  useAppTheme,
} from '@/theme';

interface ThemeOption {
  value: ThemePreference;
  label: string;
  description: string;
  premium?: boolean;
}

const OPTIONS: ThemeOption[] = [
  {
    value: 'light',
    label: 'Wellness',
    description: 'Soft plum and rose — the BetterMe Pilates look',
  },
  {
    value: 'luxe',
    label: 'Golden Mode',
    description: 'Luxe white with elegant serif type',
    premium: true,
  },
  {
    value: 'pride',
    label: 'Pride',
    description: 'Deep violet with magenta, teal, and gold accents',
    premium: true,
  },
];

export default function AppearanceSettingsScreen() {
  const { preference, setPreference } = useAppTheme();
  const { hasAccess, requirePremium } = usePremium();

  const selectTheme = async (next: ThemePreference) => {
    if (next === preference) {
      return;
    }
    await logSettingChange('appearance.theme', preference, next);
    setPreference(next);
  };

  const onSelect = (option: ThemeOption) => {
    if (option.premium && !hasAccess) {
      requirePremium('premium_theme', () => void selectTheme(option.value));
      return;
    }
    void selectTheme(option.value);
  };

  return (
    <SettingsScreenShell
      title="Appearance"
      subtitle="Switch themes across the whole app."
    >
      <View style={styles.list}>
        {OPTIONS.map((option) => {
          const selected = preference === option.value;
          const locked = Boolean(option.premium) && !hasAccess;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={locked ? `${option.label} (Premium)` : option.label}
              onPress={() => onSelect(option)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <View style={styles.optionHeader}>
                <Text variant="body" style={selected ? styles.optionLabelSelected : undefined}>
                  {option.label}
                </Text>
                {option.premium ? (
                  <View style={styles.premiumPill}>
                    <Text variant="caption" style={styles.premiumPillText}>
                      {locked ? 'PREMIUM' : 'PREMIUM · ON'}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text variant="caption" style={styles.optionDescription}>
                {option.description}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SettingsScreenShell>
  );
}

const styles = createDynamicStyles(() => ({
  list: {
    gap: spacing.xs,
  },
  option: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceCanvas,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: metrics.touchTargetMin,
    gap: 4,
  },
  optionSelected: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.surfaceSelected,
  },
  optionLabelSelected: {
    color: colors.brandPrimary,
  },
  optionDescription: {
    color: colors.textMuted,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  premiumPill: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.brandPrimary,
    backgroundColor: colors.surfaceSelected,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  premiumPillText: {
    color: colors.brandPrimary,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    letterSpacing: 0.4,
  },
}));

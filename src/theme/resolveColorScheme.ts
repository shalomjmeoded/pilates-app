import type { ThemePreference } from '@/types/preferences';
import type { ResolvedColorScheme } from '@/theme/tokens';

/** Map a stored preference to the React Native system chrome scheme. */
export function nativeAppearanceForPreference(
  preference: ThemePreference,
): 'light' | 'dark' | 'unspecified' {
  return 'light';
}

export function resolveColorScheme(preference: ThemePreference): ResolvedColorScheme {
  if (preference === 'luxe') {
    return 'luxe';
  }
  return 'light';
}

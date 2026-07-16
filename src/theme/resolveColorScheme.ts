import type { ThemePreference } from '@/types/preferences';
import type { ResolvedColorScheme } from '@/theme/tokens';

/** Map a stored preference to the React Native system chrome scheme. */
export function nativeAppearanceForPreference(
  preference: ThemePreference,
): 'light' | 'dark' | 'unspecified' {
  if (preference === 'luxe' || preference === 'light') {
    return 'light';
  }
  // Pride uses dark native chrome
  return 'dark';
}

export function resolveColorScheme(preference: ThemePreference): ResolvedColorScheme {
  if (preference === 'light' || preference === 'luxe' || preference === 'pride') {
    return preference;
  }
  return 'light';
}

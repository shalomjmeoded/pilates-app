import { preferencesStorage } from '@/storage/mmkv';
import { applyColorScheme } from '@/theme/tokens';
import {
  nativeAppearanceForPreference,
  resolveColorScheme,
} from '@/theme/resolveColorScheme';

/** Apply stored appearance before StyleSheets evaluate theme tokens. */
export function bootstrapThemeFromPreferences() {
  const preference = preferencesStorage.getTheme();
  const scheme = resolveColorScheme(preference);
  applyColorScheme(scheme);
  try {
    const { Appearance } = require('react-native') as typeof import('react-native');
    Appearance.setColorScheme(nativeAppearanceForPreference(preference));
  } catch {
    // ignore
  }
  return scheme;
}

bootstrapThemeFromPreferences();

export { resolveColorScheme } from '@/theme/resolveColorScheme';

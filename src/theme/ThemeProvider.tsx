import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { Appearance, View } from 'react-native';

import { usePreferencesStore } from '@/stores/preferencesStore';
import type { ThemePreference } from '@/types/preferences';
import {
  applyColorScheme,
  colors,
  getActiveColorScheme,
  type ColorPalette,
  type ResolvedColorScheme,
} from '@/theme/tokens';
import {
  nativeAppearanceForPreference,
  resolveColorScheme,
} from '@/theme/resolveColorScheme';

interface ThemeContextValue {
  preference: ThemePreference;
  scheme: ResolvedColorScheme;
  colors: ColorPalette;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function syncNativeAppearance(preference: ThemePreference): void {
  try {
    Appearance.setColorScheme(nativeAppearanceForPreference(preference));
  } catch {
    // Web / older runtimes may not support setColorScheme.
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const preference = usePreferencesStore((state) => state.preferences.theme);
  const setTheme = usePreferencesStore((state) => state.setTheme);
  const scheme = useMemo(() => resolveColorScheme(preference), [preference]);

  useEffect(() => {
    applyColorScheme(scheme);
    syncNativeAppearance(preference);
  }, [preference, scheme]);

  const value = useMemo(
    () => ({
      preference,
      scheme,
      colors,
      setPreference: setTheme,
    }),
    [preference, scheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {/* Remount so dynamic styles and typography rebuild for the new scheme. */}
      <View key={scheme} style={{ flex: 1, backgroundColor: colors.backgroundPrimary }}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  const setTheme = usePreferencesStore((state) => state.setTheme);
  if (!value) {
    return {
      preference: usePreferencesStore.getState().preferences.theme,
      scheme: getActiveColorScheme(),
      colors,
      setPreference: setTheme,
    };
  }
  return value;
}

import { useEffect } from 'react';

import { usePreferencesStore } from '@/stores/preferencesStore';
import { selectHasPremiumAccess, usePremiumStore } from '@/stores/premiumStore';
import type { ThemePreference } from '@/types/preferences';

const PREMIUM_THEME_FALLBACKS: Partial<Record<ThemePreference, ThemePreference>> = {
  luxe: 'light',
  pride: 'light',
};

/**
 * Premium themes require access. If a user selected one and premium later
 * lapses, quietly revert to a free fallback once premium status is known.
 * Renders nothing.
 */
export function PremiumThemeGuard(): null {
  const theme = usePreferencesStore((state) => state.preferences.theme);
  const setTheme = usePreferencesStore((state) => state.setTheme);
  const status = usePremiumStore((state) => state.status);
  const isLoading = usePremiumStore((state) => state.isLoading);
  const hasAccess = usePremiumStore(selectHasPremiumAccess);

  useEffect(() => {
    // Only act once premium status is actually known (avoids reverting during boot).
    if (status === null || isLoading || hasAccess) {
      return;
    }
    const fallback = PREMIUM_THEME_FALLBACKS[theme];
    if (fallback) {
      setTheme(fallback);
    }
  }, [theme, status, isLoading, hasAccess, setTheme]);

  return null;
}

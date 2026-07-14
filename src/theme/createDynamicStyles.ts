import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';

import { getActiveColorScheme, type ResolvedColorScheme } from '@/theme/tokens';

type Style = ViewStyle | TextStyle | ImageStyle;
type NamedStyles<T> = { [P in keyof T]: Style };

/**
 * StyleSheet that rebuilds when the active color scheme changes.
 * Accessing any style key re-reads `colors` via the factory.
 */
export function createDynamicStyles<T extends NamedStyles<T> | NamedStyles<any>>(
  factory: () => T | NamedStyles<T>,
): T {
  let cachedScheme: ResolvedColorScheme | null = null;
  let cachedSheet: T | null = null;

  const ensure = (): T => {
    const scheme = getActiveColorScheme();
    if (cachedSheet && cachedScheme === scheme) {
      return cachedSheet;
    }
    cachedScheme = scheme;
    cachedSheet = StyleSheet.create(factory()) as T;
    return cachedSheet;
  };

  return new Proxy({} as T, {
    get(_target, prop) {
      if (typeof prop === 'symbol') {
        return Reflect.get(ensure() as object, prop);
      }
      // Avoid thenable detection treating the proxy as a Promise.
      if (prop === 'then') {
        return undefined;
      }
      return ensure()[prop as keyof T];
    },
    ownKeys() {
      return Reflect.ownKeys(ensure() as object);
    },
    getOwnPropertyDescriptor(_target, prop) {
      return Object.getOwnPropertyDescriptor(ensure() as object, prop);
    },
    has(_target, prop) {
      return prop in (ensure() as object);
    },
  });
}

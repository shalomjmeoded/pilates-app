import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors, spacing, createDynamicStyles } from '@/theme';

interface BetterMeBootErrorProps {
  message: string;
  onRetry: () => void;
}

export function BetterMeBootError({ message, onRetry }: BetterMeBootErrorProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text
          variant="h2"
          style={styles.title}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          Couldn&apos;t start Pilates at Home
        </Text>
        <Text variant="bodyMuted" style={styles.message}>
          {message}
        </Text>
        <Button label="Try again" onPress={onRetry} />
      </View>
    </SafeAreaView>
  );
}

const styles = createDynamicStyles(() => ({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
  },
}));

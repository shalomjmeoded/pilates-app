import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { PREMIUM_UPSELLS } from '@/constants/premiumUpsells';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { usePremium } from '@/hooks/usePremium';
import type { PremiumFeatureKey } from '@/types/premium';
import { colors, radius, spacing } from '@/theme';

interface UpsellModalProps {
  visible: boolean;
  feature: PremiumFeatureKey | null;
  onClose: () => void;
}

export function UpsellModal({ visible, feature, onClose }: UpsellModalProps) {
  const { openPaywall } = usePremium();

  if (!feature) {
    return null;
  }

  const content = PREMIUM_UPSELLS[feature];

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <Card style={styles.card}>
            <Text variant="label">{content.title}</Text>
            <Text variant="h2">{content.description}</Text>
            <View style={styles.bullets}>
              {content.benefits.map((benefit) => (
                <Text key={benefit} variant="body">
                  ✓ {benefit}
                </Text>
              ))}
            </View>
            <Button
              label="Start Free Trial"
              onPress={() => {
                onClose();
                openPaywall();
              }}
            />
            <Button label="Not now" variant="secondary" onPress={onClose} />
          </Card>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function GlobalUpsellModal() {
  const { upsellFeature, upsellVisible, closeUpsell } = usePremium();

  return (
    <UpsellModal visible={upsellVisible} feature={upsellFeature} onClose={closeUpsell} />
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26, 20, 20, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    padding: spacing.sm,
    paddingBottom: spacing.lg,
  },
  card: {
    gap: spacing.sm,
    borderRadius: radius.card,
  },
  bullets: {
    gap: 4,
  },
});

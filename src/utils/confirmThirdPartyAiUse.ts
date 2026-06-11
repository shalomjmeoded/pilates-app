import { Alert } from 'react-native';

type ConfirmThirdPartyAiUseInput = {
  title: string;
  message: string;
};

export function confirmThirdPartyAiUse({
  title,
  message,
}: ConfirmThirdPartyAiUseInput): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const settle = (value: boolean) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    Alert.alert(
      title,
      message,
      [
        {
          text: 'Not Now',
          style: 'cancel',
          onPress: () => settle(false),
        },
        {
          text: 'Continue',
          onPress: () => settle(true),
        },
      ],
      {
        cancelable: true,
        onDismiss: () => settle(false),
      },
    );
  });
}

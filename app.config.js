const allowDirectGemini = process.env.EXPO_PUBLIC_ENABLE_DIRECT_GEMINI === 'true';

module.exports = {
  expo: {
    name: 'BetterMe',
    slug: 'tune',
    version: '1.1',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: 'betterme',
    userInterfaceStyle: 'light',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.renatovanerven.betterme',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#F7F3ED',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      package: 'com.renatovanerven.betterme',
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      [
        'expo-router',
        {
          headers: {
            'Cross-Origin-Embedder-Policy': 'credentialless',
            'Cross-Origin-Opener-Policy': 'same-origin',
          },
        },
      ],
      'expo-sqlite',
      'expo-font',
      'expo-localization',
      [
        'expo-notifications',
        {
          icon: './assets/icon.png',
          color: '#4A3048',
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission:
            'BetterMe uses selected photos for meal nutrition estimates and optional physique wellness assessments.',
          cameraPermission:
            'BetterMe uses your camera for meal nutrition estimates and optional physique wellness assessments.',
        },
      ],
    ],
    extra: {
      geminiApiKey: allowDirectGemini ? process.env.GEMINI_API_KEY : undefined,
      geminiModel: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
      revenueCatAppleApiKey:
        process.env.REVENUECAT_APPLE_API_KEY ?? 'appl_KROjCpNxXXTwqfAyQhfebGiVhUy',
      revenueCatEntitlementId: process.env.REVENUECAT_ENTITLEMENT_ID ?? 'BetterMe Premium',
      eas: {
        projectId: '732467e3-e0b0-4449-b599-8889e65d0a3a',
      },
    },
  },
};

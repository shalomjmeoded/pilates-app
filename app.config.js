const { expo } = require('./app.json');

module.exports = {
  expo: {
    ...expo,
    extra: {
      geminiApiKey: process.env.GEMINI_API_KEY,
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

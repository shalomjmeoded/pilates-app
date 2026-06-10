const { expo } = require('./app.json');

module.exports = {
  expo: {
    ...expo,
    extra: {
      geminiApiKey: process.env.GEMINI_API_KEY,
      geminiModel: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
    },
  },
};

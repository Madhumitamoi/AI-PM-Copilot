const { generateThemes } = require('./openai_client');

async function detectThemes(texts = []) {
  if (!Array.isArray(texts) || texts.length === 0) {
    return { counts: {}, themes: [] };
  }
  try {
    return await generateThemes(texts);
  } catch (error) {
    console.warn('LLM theme detection failed, falling back to heuristic', error.message || error);
    const PAYMENT_KEYWORDS = [/payment/i, /card/i, /charge/i, /billing/i, /checkout/i];
    const ONBOARDING_KEYWORDS = [/onboard/i, /signup/i, /register/i, /getting started/i];
    const NOTIFICATION_KEYWORDS = [/notification/i, /email/i, /message/i, /push/i];
    const counts = {};
    for (const t of texts) {
      const s = (t || '').toString();
      if (PAYMENT_KEYWORDS.some(r => r.test(s))) counts['Payment'] = (counts['Payment'] || 0) + 1;
      if (ONBOARDING_KEYWORDS.some(r => r.test(s))) counts['Onboarding'] = (counts['Onboarding'] || 0) + 1;
      if (NOTIFICATION_KEYWORDS.some(r => r.test(s))) counts['Notifications'] = (counts['Notifications'] || 0) + 1;
    }
    const themes = [];
    if ((counts['Payment'] || 0) > 0) themes.push('PaymentDiscoveryOnboardingNotifications');
    if ((counts['Onboarding'] || 0) > 0 && themes.length === 0) themes.push('Onboarding');
    if ((counts['Notifications'] || 0) > 0 && themes.length === 0) themes.push('Notifications');
    return { counts, themes };
  }
}

module.exports = { detectThemes };

// Minimal LLM shim — replace with provider integration (OpenAI, Anthropic, etc.)
const PAYMENT_KEYWORDS = [/payment/i, /card/i, /charge/i, /billing/i, /checkout/i];
const ONBOARDING_KEYWORDS = [/onboard/i, /signup/i, /register/i, /getting started/i];
const NOTIFICATION_KEYWORDS = [/notification/i, /email/i, /message/i, /push/i];

async function detectThemes(texts = []) {
  // naive, fast heuristic detection — replace with LLM calls
  const counts = {};
  for (const t of texts) {
    const s = (t || '').toString();
    if (PAYMENT_KEYWORDS.some(r => r.test(s))) counts['Payment'] = (counts['Payment'] || 0) + 1;
    if (ONBOARDING_KEYWORDS.some(r => r.test(s))) counts['Onboarding'] = (counts['Onboarding'] || 0) + 1;
    if (NOTIFICATION_KEYWORDS.some(r => r.test(s))) counts['Notifications'] = (counts['Notifications'] || 0) + 1;
  }
  // map to theme names used by product
  const themes = [];
  if ((counts['Payment'] || 0) > 0) themes.push('PaymentDiscoveryOnboardingNotifications');
  if ((counts['Onboarding'] || 0) > 0 && themes.length === 0) themes.push('Onboarding');
  if ((counts['Notifications'] || 0) > 0 && themes.length === 0) themes.push('Notifications');
  return { counts, themes };
}

module.exports = { detectThemes };

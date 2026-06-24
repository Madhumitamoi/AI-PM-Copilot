const OpenAI = require('openai');
const dotenv = require('dotenv');
dotenv.config();

let client = null;
function getClient() {
  if (!client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required for OpenAI calls.');
    }
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

const THEME_PROMPT = `You are an AI product manager. Analyze the following customer feedback items and extract up to 5 product themes in PascalCase. For each theme, include a short label and a count of how many comments map to it.

Return JSON with the shape {
  "themes": [
    { "name": "PaymentDiscoveryOnboardingNotifications", "count": 3 },
    { "name": "OnboardingExperience", "count": 2 }
  ]
}

Feedback:
`;

async function generateThemes(feedbackItems) {
  const input = `${THEME_PROMPT}${feedbackItems.map((t, idx) => `${idx + 1}. ${t}`).join('\n')}`;
  const response = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a helpful product insights assistant.' },
      { role: 'user', content: input }
    ],
    temperature: 0.2,
    max_tokens: 400
  });
  const raw = response.choices?.[0]?.message?.content || response.data?.choices?.[0]?.message?.content;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    const jsonMatch = raw?.match(/\{[\s\S]*\}$/);
    if (!jsonMatch) {
      throw new Error(`OpenAI parse error: ${error.message} --> ${raw}`);
    }
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (nestedError) {
      throw new Error(`OpenAI parse error: ${nestedError.message} --> ${raw}`);
    }
  }
  const counts = {};
  const themes = (parsed.themes || []).map(theme => {
    counts[theme.name] = theme.count;
    return theme.name;
  });
  return { counts, themes };
}

module.exports = { generateThemes };

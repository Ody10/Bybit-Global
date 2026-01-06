// scripts/generate-translations.js
// Run with: node scripts/generate-translations.js

const fs = require('fs');
const path = require('path');

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const DEEPL_API = 'https://api-free.deepl.com/v2/translate';

const LANGUAGES = {
  fr: 'FR',
  de: 'DE',
  it: 'IT',
  bg: 'BG',
  pt: 'PT-PT',
  ru: 'RU',
  ja: 'JA',
  ko: 'KO',
  zh: 'ZH',
  nl: 'NL',
  pl: 'PL',
  sv: 'SV',
  id: 'ID',
  tr: 'TR',
  lt: 'LT',
  ar: 'AR',
  th: 'TH',
  vi: 'VI'
};

async function translateText(text, targetLang) {
  const response = await fetch(DEEPL_API, {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: [text],
      target_lang: targetLang,
      source_lang: 'EN',
    }),
  });

  const data = await response.json();
  return data.translations[0].text;
}

async function translateObject(obj, targetLang) {
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object') {
      result[key] = await translateObject(value, targetLang);
    } else {
      console.log(`Translating "${value}" to ${targetLang}...`);
      result[key] = await translateText(value, targetLang);
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return result;
}

async function generateTranslations() {
  if (!DEEPL_API_KEY) {
    console.error('❌ DEEPL_API_KEY not found in environment variables');
    process.exit(1);
  }

  // Read English translations
  const enPath = path.join(__dirname, '../messages/en.json');
  const enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));

  console.log('📚 Starting translation generation...\n');

  // Translate to each language
  for (const [langCode, deeplCode] of Object.entries(LANGUAGES)) {
    console.log(`\n🌍 Translating to ${langCode}...`);
    
    try {
      const translated = await translateObject(enTranslations, deeplCode);
      
      // Save to file
      const outputPath = path.join(__dirname, `../messages/${langCode}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(translated, null, 2), 'utf8');
      
      console.log(`✅ Saved ${langCode}.json`);
    } catch (error) {
      console.error(`❌ Error translating ${langCode}:`, error.message);
    }
  }

  console.log('\n✅ Translation generation complete!');
}

generateTranslations().catch(console.error);
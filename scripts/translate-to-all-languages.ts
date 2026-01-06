// scripts/translate-to-all-languages.ts
// Run: DEEPL_API_KEY=your_key npx ts-node scripts/translate-to-all-languages.ts
// This will create ALL 17 language files automatically

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

// All 17 languages
const languages = [
  { code: 'ar', name: 'Arabic', deepl: 'AR', supported: true },
  { code: 'id', name: 'Indonesian', deepl: 'ID', supported: true },
  { code: 'es', name: 'Spanish', deepl: 'ES', supported: true },
  { code: 'fil', name: 'Filipino', deepl: null, supported: false },
  { code: 'pt', name: 'Portuguese', deepl: 'PT-PT', supported: true },
  { code: 'vi', name: 'Vietnamese', deepl: null, supported: false },
  { code: 'ru', name: 'Russian', deepl: 'RU', supported: true },
  { code: 'uk', name: 'Ukrainian', deepl: 'UK', supported: true },
  { code: 'kk', name: 'Kazakh', deepl: null, supported: false },
  { code: 'zh', name: 'Chinese (Simplified)', deepl: 'ZH', supported: true },
  { code: 'zh-TW', name: 'Chinese (Traditional)', deepl: 'ZH-HANT', supported: true },
  { code: 'ja', name: 'Japanese', deepl: 'JA', supported: true },
  { code: 'ko', name: 'Korean', deepl: 'KO', supported: true },
  { code: 'pl', name: 'Polish', deepl: 'PL', supported: true },
  { code: 'bg', name: 'Bulgarian', deepl: 'BG', supported: true },
  { code: 'lt', name: 'Lithuanian', deepl: null, supported: false }
];

interface TranslationObject {
  [key: string]: string | TranslationObject;
}

async function translateWithDeepL(text: string, targetLang: string): Promise<string> {
  if (!DEEPL_API_KEY) {
    throw new Error('DEEPL_API_KEY environment variable is required');
  }

  const response = await fetch(DEEPL_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      auth_key: DEEPL_API_KEY,
      text: text,
      target_lang: targetLang,
      source_lang: 'EN'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepL API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.translations[0].text;
}

async function translateWithGoogle(text: string, targetLang: string): Promise<string> {
  // Free Google Translate API (no key needed)
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data[0][0][0];
  } catch (error) {
    console.error('Google Translate error:', error);
    return text; // Return original on error
  }
}

async function translateObject(
  obj: TranslationObject, 
  targetLang: string,
  useDeepL: boolean = true,
  prefix: string = ''
): Promise<TranslationObject> {
  const result: TranslationObject = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'string') {
      console.log(`  Translating: ${fullKey}`);
      try {
        if (useDeepL) {
          result[key] = await translateWithDeepL(value, targetLang);
        } else {
          result[key] = await translateWithGoogle(value, targetLang);
        }
        // Rate limiting - wait between requests
        await new Promise(resolve => setTimeout(resolve, useDeepL ? 500 : 200));
      } catch (error) {
        console.error(`    ❌ Error translating "${value}":`, error);
        result[key] = value; // Keep original on error
      }
    } else if (typeof value === 'object' && value !== null) {
      result[key] = await translateObject(value, targetLang, useDeepL, fullKey);
    }
  }

  return result;
}

async function main() {
  // Check if en.json exists
  const localesDir = path.join(process.cwd(), 'public', 'locales');
  const enFilePath = path.join(localesDir, 'en.json');

  if (!fs.existsSync(enFilePath)) {
    console.error('❌ en.json not found in public/locales/');
    console.error('📝 Run extract-all-text.ts first!');
    process.exit(1);
  }

  const englishContent = JSON.parse(fs.readFileSync(enFilePath, 'utf-8'));

  console.log('🌍 Starting translation to 17 languages...\n');
  console.log(`📄 Source: ${enFilePath}\n`);

  // Create locales directory if needed
  if (!fs.existsSync(localesDir)) {
    fs.mkdirSync(localesDir, { recursive: true });
  }

  let successCount = 0;
  let failCount = 0;

  for (const lang of languages) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔄 Translating to: ${lang.name} (${lang.code})`);
    console.log('='.repeat(60));
    
    try {
      let translated: TranslationObject;

      if (lang.supported && lang.deepl) {
        // Use DeepL (high quality)
        console.log('  📡 Using: DeepL API\n');
        translated = await translateObject(englishContent, lang.deepl, true);
      } else {
        // Use Google Translate (free, no key needed)
        console.log('  📡 Using: Google Translate (Free)\n');
        const googleLangCode = lang.code === 'fil' ? 'tl' : 
                               lang.code === 'vi' ? 'vi' :
                               lang.code === 'kk' ? 'kk' :
                               lang.code === 'lt' ? 'lt' : lang.code;
        translated = await translateObject(englishContent, googleLangCode, false);
      }

      const outputPath = path.join(localesDir, `${lang.code}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(translated, null, 2), 'utf-8');
      
      console.log(`\n  ✅ Success! Saved: ${outputPath}`);
      successCount++;
    } catch (error) {
      console.error(`\n  ❌ Failed to translate ${lang.name}:`, error);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ Translation complete!');
  console.log('='.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`   • Source file: en.json`);
  console.log(`   • Total languages: 17`);
  console.log(`   • Successful: ${successCount}`);
  console.log(`   • Failed: ${failCount}`);
  console.log(`   • Location: public/locales/`);
  console.log('\n📁 Generated files:');
  
  const generatedFiles = fs.readdirSync(localesDir)
    .filter(f => f.endsWith('.json'))
    .sort();
  
  generatedFiles.forEach(file => {
    console.log(`   ✅ ${file}`);
  });

  console.log('\n⚠️  Next steps:');
  console.log('   1. Review translations for accuracy');
  console.log('   2. Update your TranslationContext.tsx if needed');
  console.log('   3. Test language switching in your app');
  console.log('   4. Fix any issues manually in the JSON files');
  
  if (failCount > 0) {
    console.log('\n⚠️  Some translations failed. You can:');
    console.log('   • Re-run the script');
    console.log('   • Translate failed languages manually');
    console.log('   • Use a different translation service');
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
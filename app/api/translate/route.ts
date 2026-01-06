// app/api/translate/route.ts
import { NextRequest, NextResponse } from 'next/server';

const DEEPL_API = 'https://api-free.deepl.com/v2/translate';
const DEEPL_API_KEY = process.env.DEEPL_API_KEY;

const SUPPORTED_LANGUAGES = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  bg: 'Bulgarian',
  pt: 'Portuguese',
  ru: 'Russian',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese (Simplified)',
  nl: 'Dutch',
  pl: 'Polish',
  sv: 'Swedish',
  id: 'Indonesian',
  tr: 'Turkish',
  lt: 'Lithuanian',
};

// DeepL language code mapping (exact codes DeepL expects)
const DEEPL_LANG_MAP: { [key: string]: string } = {
  en: 'EN',
  es: 'ES',
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
};

// POST /api/translate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, targetLang, sourceLang = 'en' } = body;

    console.log('Translation request:', { 
      textLength: text?.length, 
      targetLang, 
      sourceLang,
      hasApiKey: !!DEEPL_API_KEY 
    });

    // Validation
    if (!text || !targetLang) {
      return NextResponse.json(
        { success: false, error: 'Missing text or targetLang' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!DEEPL_API_KEY) {
      console.error('DEEPL_API_KEY not found in environment');
      return NextResponse.json(
        { 
          success: false, 
          error: 'DeepL API key not configured' 
        },
        { status: 503 }
      );
    }

    // Return original if target is same as source
    if (targetLang === sourceLang) {
      return NextResponse.json({
        success: true,
        translatedText: text,
        detectedSourceLanguage: sourceLang,
        targetLanguage: targetLang,
      });
    }

    // Convert to DeepL language codes
    const deeplTarget = DEEPL_LANG_MAP[targetLang.toLowerCase()] || targetLang.toUpperCase();
    
    // For source language, use auto-detect if it's 'en' or not in map
    const deeplSource = sourceLang && sourceLang !== 'auto' 
      ? (DEEPL_LANG_MAP[sourceLang.toLowerCase()] || sourceLang.toUpperCase())
      : undefined;

    console.log('DeepL translation:', { 
      from: deeplSource || 'auto', 
      to: deeplTarget,
      textPreview: text.substring(0, 50) + '...'
    });

    // Prepare request body
    const requestBody: any = {
      text: [text],
      target_lang: deeplTarget,
    };

    // Only add source_lang if specified (let DeepL auto-detect otherwise)
    if (deeplSource) {
      requestBody.source_lang = deeplSource;
    }

    // Call DeepL API with better error handling
    const response = await fetch(DEEPL_API, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log('DeepL response status:', response.status);
    console.log('DeepL response preview:', responseText.substring(0, 200));

    if (!response.ok) {
      console.error('DeepL API error:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });
      
      // Parse error message if possible
      let errorMessage = `DeepL API error: ${response.status}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Response wasn't JSON, use default message
      }
      
      throw new Error(errorMessage);
    }

    const data = JSON.parse(responseText);

    if (!data.translations || data.translations.length === 0) {
      throw new Error('No translation returned from DeepL');
    }

    const translatedText = data.translations[0].text;
    console.log('Translation successful:', {
      originalLength: text.length,
      translatedLength: translatedText.length
    });

    return NextResponse.json({
      success: true,
      translatedText,
      detectedSourceLanguage: data.translations[0].detected_source_language || sourceLang,
      targetLanguage: targetLang,
      service: 'deepl',
    });

  } catch (error) {
    console.error('Translation error:', error);
    
    // Return detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Translation failed', 
        details: errorMessage,
        apiKeyConfigured: !!DEEPL_API_KEY,
      },
      { status: 500 }
    );
  }
}

// GET /api/translate/languages
export async function GET() {
  return NextResponse.json({
    success: true,
    languages: SUPPORTED_LANGUAGES,
    apiKeyConfigured: !!DEEPL_API_KEY,
  });
}
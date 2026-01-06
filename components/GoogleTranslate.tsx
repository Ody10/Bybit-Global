// ===== 1. components/GoogleTranslate.tsx =====
// Client-side only component to avoid hydration errors

'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

export default function GoogleTranslate() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Add Google Translate script
    const addScript = () => {
      // Check if script already exists
      if (document.getElementById('google-translate-script')) return;

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    };

    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'ar,id,es,fil,pt,vi,ru,uk,kk,zh-CN,zh-TW,ja,ko,pl,bg,lt',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        'google_translate_element'
      );

      // Auto-detect and translate based on browser language
      setTimeout(() => {
        const userLang = navigator.language || (navigator as any).userLanguage;
        const langCode = userLang.split('-')[0].toLowerCase();

        // Map of supported languages
        const langMap: { [key: string]: string } = {
          ar: 'ar',
          id: 'id',
          es: 'es',
          fil: 'fil',
          pt: 'pt',
          vi: 'vi',
          ru: 'ru',
          uk: 'uk',
          kk: 'kk',
          zh: 'zh-CN',
          ja: 'ja',
          ko: 'ko',
          pl: 'pl',
          bg: 'bg',
          lt: 'lt',
        };

        // Get translated language code
        const targetLang = langMap[langCode];

        // Only translate if not English
        if (targetLang && langCode !== 'en') {
          const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
          if (select) {
            select.value = targetLang;
            select.dispatchEvent(new Event('change'));
          }
        }
      }, 1000);
    };

    // Add script after component mounts
    addScript();

    // Cleanup
    return () => {
      const script = document.getElementById('google-translate-script');
      if (script) {
        script.remove();
      }
    };
  }, []);

  return (
    <div
      id="google_translate_element"
      style={{ display: 'none' }}
      suppressHydrationWarning
    />
  );
}

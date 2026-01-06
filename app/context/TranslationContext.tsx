// app/context/TranslationContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TranslationContextType {
  language: string;
  changeLanguage: (lang: string) => void;
  t: (key: string, fallback?: string) => string;
  translations: Record<string, any>;
  isLoading: boolean;
}

// Language list - keep this from your original file
export const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fil', name: 'Filipino', nativeName: 'Filipino' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақша' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '中文(简体)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '中文繁体' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių' }
];

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<string>('en');
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load translations from JSON file
  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/locales/${language}.json`);
        if (response.ok) {
          const data = await response.json();
          setTranslations(data);
        } else {
          console.warn(`Translations not found for ${language}, falling back to English`);
          const fallbackResponse = await fetch('/locales/en.json');
          const fallbackData = await fallbackResponse.json();
          setTranslations(fallbackData);
        }
      } catch (error) {
        console.error('Error loading translations:', error);
        setTranslations({});
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [language]);

  // Initialize language on mount (only once)
  useEffect(() => {
    if (!isInitialized) {
      // Check for saved language
      const savedLanguage = localStorage.getItem('appLanguage');
      
      if (savedLanguage && languages.find(l => l.code === savedLanguage)) {
        setLanguage(savedLanguage);
      } else {
        // Auto-detect browser language
        const browserLang = navigator.language || (navigator as any).userLanguage;
        const langCode = browserLang.split('-')[0];
        
        // Check if we support this language
        const supportedLang = languages.find(l => l.code === langCode);
        if (supportedLang) {
          setLanguage(langCode);
          localStorage.setItem('appLanguage', langCode);
        } else if (browserLang === 'zh-TW') {
          setLanguage('zh-TW');
          localStorage.setItem('appLanguage', 'zh-TW');
        } else {
          // Default to English
          setLanguage('en');
          localStorage.setItem('appLanguage', 'en');
        }
      }
      
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('appLanguage', newLanguage);
  };

  // Translation function with nested key support (e.g., "common.save" or "assetsDashboard.title")
  const t = (key: string, fallback?: string): string => {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback || key;
      }
    }

    return typeof value === 'string' ? value : fallback || key;
  };

  // Don't render children until language is initialized
  if (!isInitialized) {
    return null;
  }

  return (
    <TranslationContext.Provider value={{ language, changeLanguage, t, translations, isLoading }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
}
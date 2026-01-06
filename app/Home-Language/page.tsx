'use client';

import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/app/context/TranslationContext';
import { languages } from '@/app/context/TranslationContext';

export default function HomeLanguagePage() {
  const router = useRouter();
  const { language, changeLanguage, t } = useTranslation();

  const handleLanguageSelect = (langCode: string) => {
    changeLanguage(langCode);
    // Wait a bit for the language to update before going back
    setTimeout(() => {
      router.back();
    }, 300);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 bg-black z-50 border-b border-gray-900">
        <div className="flex items-center px-4 py-4">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-900 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold ml-4">{t('languageSelection')}</h1>
        </div>
      </div>

      {/* Language List */}
      <div className="px-4 py-2">
        {languages.map((lang, index) => (
          <button
            key={`${lang.code}-${index}`}
            onClick={() => handleLanguageSelect(lang.code)}
            className="w-full flex items-center justify-between py-4 border-b border-gray-900 hover:bg-gray-900 hover:bg-opacity-50 transition px-2"
          >
            <span className="text-base">{lang.nativeName}</span>
            {language === lang.code && index === languages.findIndex(l => l.code === lang.code && l.nativeName === lang.nativeName) && (
              <Check className="w-5 h-5 text-white" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
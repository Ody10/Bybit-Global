//components/LanguageSelector.tsx 

'use client';

import { useState } from 'react';
import { useTranslation, languages } from '../app/context/TranslationContext';

export default function LanguageSelector() {
  const { language, changeLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] hover:bg-[#1a1a1a] rounded-lg transition-colors border border-gray-800"
      >
        <span className="text-sm font-medium text-white">{currentLanguage.code.toUpperCase()}</span>
        <span className="text-xs text-gray-400">{currentLanguage.nativeName}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown - Black background matching Bybit style */}
          <div className="absolute right-0 mt-2 w-64 bg-[#0a0a0a] rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto border border-gray-800">
            {languages.map((lang) => (
              <button
                key={`${lang.code}-${lang.name}`}
                onClick={() => {
                  changeLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1a1a1a] transition-colors text-left ${
                  language === lang.code ? 'bg-[#1a1a1a]' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="text-white font-medium">{lang.nativeName}</div>
                  <div className="text-gray-400 text-xs">{lang.name}</div>
                </div>
                {language === lang.code && (
                  <div className="text-yellow-500">✓</div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
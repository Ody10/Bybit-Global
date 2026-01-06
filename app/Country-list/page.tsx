//app/Country-list/page.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Search } from 'lucide-react';

// ✅ Add type definition for Country
interface Country {
  name: string;
  code: string;
  flag: string;
}

// TODO: Add your countries array here
const countries: Country[] = [
  { name: 'Afghanistan', code: '+93', flag: '/flags/afghanistan.png' },
  { name: 'Albania', code: '+355', flag: '/flags/albania.png' },
  { name: 'Algeria', code: '+213', flag: '/flags/algeria.png' },
  { name: 'Andorra', code: '+376', flag: '/flags/andorra.png' },
  { name: 'Angola', code: '+244', flag: '/flags/angola.png' },
  { name: 'Antigua and Barbuda', code: '+1268', flag: '/flags/antiguabarbuda.png' },
  { name: 'Argentina', code: '+54', flag: '/flags/argentina.png' },
  { name: 'Armenia', code: '+374', flag: '/flags/armenia.png' },
  { name: 'Australia', code: '+61', flag: '/flags/australia.png' },
  { name: 'Austria', code: '+43', flag: '/flags/austria.png' },
  { name: 'Azerbaijan', code: '+994', flag: '/flags/azerbaijan.png' },
  { name: 'Bahamas', code: '+1242', flag: '/flags/bahamas.png' },
  { name: 'Bahrain', code: '+973', flag: '/flags/bahrain.png' },
  { name: 'Bangladesh', code: '+880', flag: '/flags/bangladesh.png' },
  { name: 'Barbados', code: '+1246', flag: '/flags/barbados.png' },
  { name: 'Belgium', code: '+32', flag: '/flags/belgium.png' },
  { name: 'Belize', code: '+501', flag: '/flags/belize.png' },
  { name: 'Benin', code: '+229', flag: '/flags/benin.png' },
  { name: 'Bhutan', code: '+975', flag: '/flags/bhutan.png' },
  { name: 'Bolivia', code: '+591', flag: '/flags/bolivia.png' },
  { name: 'Bosnia', code: '+387', flag: '/flags/bosnia.png' },
  { name: 'Botswana', code: '+267', flag: '/flags/botswana.png' },
  { name: 'Brazil', code: '+55', flag: '/flags/brazil.png' },
  { name: 'Brunei', code: '+673', flag: '/flags/brunei.png' },
  { name: 'Bulgaria', code: '+359', flag: '/flags/bulgaria.png' },
  { name: 'Burkina Faso', code: '+226', flag: '/flags/burkinafaso.png' },
  { name: 'Burundi', code: '+257', flag: '/flags/burundi.png' },
  { name: 'Cambodia', code: '+855', flag: '/flags/cambodia.png' },
  { name: 'Cameroon', code: '+237', flag: '/flags/cameroon.png' },
  { name: 'Canada', code: '+1', flag: '/flags/canada.png' },
  { name: 'Chile', code: '+56', flag: '/flags/chile.png' },
  { name: 'China', code: '+86', flag: '/flags/china.png' },
  { name: 'Colombia', code: '+57', flag: '/flags/colombia.png' },
  { name: 'Congo', code: '+242', flag: '/flags/congo.png' },
  { name: 'Croatia', code: '+385', flag: '/flags/croatia.png' },
  { name: 'Czech Republic', code: '+420', flag: '/flags/czechrepublic.png' },
  { name: 'Denmark', code: '+45', flag: '/flags/denmark.png' },
  { name: 'Dominican Republic', code: '+1809', flag: '/flags/dominicanrepublic.png' },
  { name: 'Ecuador', code: '+593', flag: '/flags/ecuador.png' },
  { name: 'Egypt', code: '+20', flag: '/flags/egypt.png' },
  { name: 'Estonia', code: '+372', flag: '/flags/estonia.png' },
  { name: 'Finland', code: '+358', flag: '/flags/finland.png' },
  { name: 'France', code: '+33', flag: '/flags/france.png' },
  { name: 'Germany', code: '+49', flag: '/flags/germany.png' },
  { name: 'Ghana', code: '+233', flag: '/flags/ghana.png' },
  { name: 'Greece', code: '+30', flag: '/flags/greece.png' },
  { name: 'Hong Kong', code: '+852', flag: '/flags/hongkong.png' },
  { name: 'Hungary', code: '+36', flag: '/flags/hungary.png' },
  { name: 'Iceland', code: '+354', flag: '/flags/iceland.png' },
  { name: 'India', code: '+91', flag: '/flags/india.png' },
  { name: 'Indonesia', code: '+62', flag: '/flags/indonesia.png' },
  { name: 'Iran', code: '+98', flag: '/flags/iran.png' },
  { name: 'Iraq', code: '+964', flag: '/flags/iraq.png' },
  { name: 'Ireland', code: '+353', flag: '/flags/ireland.png' },
  { name: 'Israel', code: '+972', flag: '/flags/israel.png' },
  { name: 'Italy', code: '+39', flag: '/flags/italy.png' },
  { name: 'Jamaica', code: '+1876', flag: '/flags/jamaica.png' },
  { name: 'Japan', code: '+81', flag: '/flags/japan.png' },
  { name: 'Kenya', code: '+254', flag: '/flags/kenya.png' },
  { name: 'Malaysia', code: '+60', flag: '/flags/malaysia.png' },
  { name: 'Mexico', code: '+52', flag: '/flags/mexico.png' },
  { name: 'Morocco', code: '+212', flag: '/flags/morocco.png' },
  { name: 'Netherlands', code: '+31', flag: '/flags/netherlands.png' },
  { name: 'New Zealand', code: '+64', flag: '/flags/newzealand.png' },
  { name: 'Nigeria', code: '+234', flag: '/flags/nigeria.png' },
  { name: 'Norway', code: '+47', flag: '/flags/norway.png' },
  { name: 'Pakistan', code: '+92', flag: '/flags/pakistan.png' },
  { name: 'Philippines', code: '+63', flag: '/flags/philippines.png' },
  { name: 'Poland', code: '+48', flag: '/flags/poland.png' },
  { name: 'Portugal', code: '+351', flag: '/flags/portugal.png' },
  { name: 'Qatar', code: '+974', flag: '/flags/qatar.png' },
  { name: 'Russia', code: '+7', flag: '/flags/russia.png' },
  { name: 'Saudi Arabia', code: '+966', flag: '/flags/saudiarabia.png' },
  { name: 'Singapore', code: '+65', flag: '/flags/singapore.png' },
  { name: 'South Africa', code: '+27', flag: '/flags/southafrica.png' },
  { name: 'South Korea', code: '+82', flag: '/flags/southkorea.png' },
  { name: 'Spain', code: '+34', flag: '/flags/spain.png' },
  { name: 'Sweden', code: '+46', flag: '/flags/sweden.png' },
  { name: 'Switzerland', code: '+41', flag: '/flags/switzerland.png' },
  { name: 'Thailand', code: '+66', flag: '/flags/thailand.png' },
  { name: 'Turkey', code: '+90', flag: '/flags/turkey.png' },
  { name: 'UAE', code: '+971', flag: '/flags/uae.png' },
  { name: 'Uganda', code: '+256', flag: '/flags/uganda.png' },
  { name: 'UK', code: '+44', flag: '/flags/uk.png' },
  { name: 'Ukraine', code: '+380', flag: '/flags/ukraine.png' },
  { name: 'USA', code: '+1', flag: '/flags/usa.png' },
  { name: 'Vietnam', code: '+84', flag: '/flags/vietnam.png' },
  { name: 'Zambia', code: '+260', flag: '/flags/zambia.png' },
  // Your country list goes here
];

export default function CountryList() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.includes(searchTerm)
  );

  // ✅ FIXED: Added type annotation for country parameter
  const handleSelectCountry = (country: Country) => {
    // Store selected country in localStorage or pass via query params
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCountry', JSON.stringify(country));
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Header */}
      <div className="sticky top-0 bg-[#1a1a1a] z-10 border-b border-gray-800">
        <div className="flex items-center px-4 py-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-[#2a2a2a] rounded-lg transition"
          >
            <ChevronLeft className="w-6 h-6 text-gray-400" />
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold pr-12">
            Select Country/Region
          </h1>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search"
              className="w-full bg-[#0a0a0a] text-white pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-500 placeholder-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Country List */}
      <div className="pb-20">
        {filteredCountries.map((country, index) => (
          <button
            key={index}
            onClick={() => handleSelectCountry(country)}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#2a2a2a] transition border-b border-gray-900"
          >
            <div className="flex items-center gap-3">
              <img
                src={country.flag}
                alt={country.name}
                className="w-7 h-7 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"><rect fill="%23333" width="28" height="28"/></svg>';
                }}
              />
              <span className="text-white font-medium">{country.name}</span>
            </div>
            <span className="text-gray-400">{country.code}</span>
          </button>
        ))}

        {filteredCountries.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            No countries found
          </div>
        )}
      </div>
    </div>
  );
}
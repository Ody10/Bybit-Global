"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CountryListAccount() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const countries = [
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
    { name: 'Zambia', code: '+260', flag: '/flags/zambia.png' }
  ];

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.includes(searchQuery)
  );

  const handleCountrySelect = (country: typeof countries[0]) => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 bg-black border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 flex items-center gap-3 bg-gray-900 rounded-lg px-4 py-2.5">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm"
          />
        </div>
        {/* Cancel Button */}
        <button
          onClick={() => router.back()}
          className="ml-3 text-gray-400 hover:text-white text-sm transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Countries List */}
      <div className="divide-y divide-gray-800">
        {filteredCountries.map((country) => (
          <button
            key={country.name}
            onClick={() => handleCountrySelect(country)}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-900 transition-colors"
          >
            <div className="flex items-center gap-3">
              <img
                src={country.flag}
                alt={country.name}
                className="w-7 h-7 rounded object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect fill="%23666" width="24" height="24"/%3E%3C/svg%3E';
                }}
              />
              <span className="text-white font-normal">{country.name}</span>
            </div>
            <span className="text-gray-400 text-sm">{country.code}</span>
          </button>
        ))}
      </div>

      {/* No Results */}
      {filteredCountries.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No countries found
        </div>
      )}
    </div>
  );
}
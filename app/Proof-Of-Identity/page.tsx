//app/Proof-Of-Identity/page.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, X } from 'lucide-react';

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

const countries: Country[] = [
  // ADD YOUR COUNTRIES LIST HERE
  { code: 'ad', name: 'Andorra', dialCode: '+376', flag: '/flags/andorra.png' },
{ code: 'ae', name: 'United Arab Emirates', dialCode: '+971', flag: '/flags/united-arab-emirates.png' },
{ code: 'af', name: 'Afghanistan', dialCode: '+93', flag: '/flags/afghanistan.png' },
{ code: 'ag', name: 'Antigua and Barbuda', dialCode: '+1268', flag: '/flags/antigua-and-barbuda.png' },
{ code: 'ai', name: 'Anguilla', dialCode: '+1264', flag: '/flags/anguilla.png' },
{ code: 'al', name: 'Albania', dialCode: '+355', flag: '/flags/albania.png' },
{ code: 'am', name: 'Armenia', dialCode: '+374', flag: '/flags/armenia.png' },
{ code: 'ao', name: 'Angola', dialCode: '+244', flag: '/flags/angola.png' },
{ code: 'ar', name: 'Argentina', dialCode: '+54', flag: '/flags/argentina.png' },
{ code: 'as', name: 'American Samoa', dialCode: '+1684', flag: '/flags/american-samoa.png' },
{ code: 'at', name: 'Austria', dialCode: '+43', flag: '/flags/austria.png' },
{ code: 'au', name: 'Australia', dialCode: '+61', flag: '/flags/australia.png' },
{ code: 'aw', name: 'Aruba', dialCode: '+297', flag: '/flags/aruba.png' },
{ code: 'az', name: 'Azerbaijan', dialCode: '+994', flag: '/flags/azerbaijan.png' },
{ code: 'ba', name: 'Bosnia and Herzegovina', dialCode: '+387', flag: '/flags/bosnia-and-herzegovina.png' },
{ code: 'bb', name: 'Barbados', dialCode: '+1246', flag: '/flags/barbados.png' },
{ code: 'bd', name: 'Bangladesh', dialCode: '+880', flag: '/flags/bangladesh.png' },
{ code: 'be', name: 'Belgium', dialCode: '+32', flag: '/flags/belgium.png' },
{ code: 'bf', name: 'Burkina Faso', dialCode: '+226', flag: '/flags/burkina-faso.png' },
{ code: 'bg', name: 'Bulgaria', dialCode: '+359', flag: '/flags/bulgaria.png' },
{ code: 'bh', name: 'Bahrain', dialCode: '+973', flag: '/flags/bahrain.png' },
{ code: 'bi', name: 'Burundi', dialCode: '+257', flag: '/flags/burundi.png' },
{ code: 'bj', name: 'Benin', dialCode: '+229', flag: '/flags/benin.png' },
{ code: 'bn', name: 'Brunei', dialCode: '+673', flag: '/flags/brunei.png' },
{ code: 'bo', name: 'Bolivia', dialCode: '+591', flag: '/flags/bolivia.png' },
{ code: 'br', name: 'Brazil', dialCode: '+55', flag: '/flags/brazil.png' },
{ code: 'bs', name: 'Bahamas', dialCode: '+1242', flag: '/flags/bahamas.png' },
{ code: 'bt', name: 'Bhutan', dialCode: '+975', flag: '/flags/bhutan.png' },
{ code: 'bw', name: 'Botswana', dialCode: '+267', flag: '/flags/botswana.png' },
{ code: 'by', name: 'Belarus', dialCode: '+375', flag: '/flags/belarus.png' },
{ code: 'bz', name: 'Belize', dialCode: '+501', flag: '/flags/belize.png' },
{ code: 'ca', name: 'Canada', dialCode: '+1', flag: '/flags/canada.png' },
{ code: 'cd', name: 'Congo (DRC)', dialCode: '+243', flag: '/flags/congo-drc.png' },
{ code: 'cf', name: 'Central African Republic', dialCode: '+236', flag: '/flags/central-african-republic.png' },
{ code: 'cg', name: 'Congo', dialCode: '+242', flag: '/flags/congo.png' },
{ code: 'ch', name: 'Switzerland', dialCode: '+41', flag: '/flags/switzerland.png' },
{ code: 'ci', name: 'Ivory Coast', dialCode: '+225', flag: '/flags/ivory-coast.png' },
{ code: 'ck', name: 'Cook Islands', dialCode: '+682', flag: '/flags/cook-islands.png' },
{ code: 'cl', name: 'Chile', dialCode: '+56', flag: '/flags/chile.png' },
{ code: 'cm', name: 'Cameroon', dialCode: '+237', flag: '/flags/cameroon.png' },
{ code: 'cn', name: 'China', dialCode: '+86', flag: '/flags/china.png' },
{ code: 'co', name: 'Colombia', dialCode: '+57', flag: '/flags/colombia.png' },
{ code: 'cr', name: 'Costa Rica', dialCode: '+506', flag: '/flags/costa-rica.png' },
{ code: 'cu', name: 'Cuba', dialCode: '+53', flag: '/flags/cuba.png' },
{ code: 'cv', name: 'Cape Verde', dialCode: '+238', flag: '/flags/cape-verde.png' },
{ code: 'cy', name: 'Cyprus', dialCode: '+357', flag: '/flags/cyprus.png' },
{ code: 'cz', name: 'Czech Republic', dialCode: '+420', flag: '/flags/czech-republic.png' },
{ code: 'de', name: 'Germany', dialCode: '+49', flag: '/flags/germany.png' },
{ code: 'dj', name: 'Djibouti', dialCode: '+253', flag: '/flags/djibouti.png' },
{ code: 'dk', name: 'Denmark', dialCode: '+45', flag: '/flags/denmark.png' },
{ code: 'dm', name: 'Dominica', dialCode: '+1767', flag: '/flags/dominica.png' },
{ code: 'do', name: 'Dominican Republic', dialCode: '+1849', flag: '/flags/dominican-republic.png' },
{ code: 'dz', name: 'Algeria', dialCode: '+213', flag: '/flags/algeria.png' },
{ code: 'ec', name: 'Ecuador', dialCode: '+593', flag: '/flags/ecuador.png' },
{ code: 'ee', name: 'Estonia', dialCode: '+372', flag: '/flags/estonia.png' },
{ code: 'eg', name: 'Egypt', dialCode: '+20', flag: '/flags/egypt.png' },
{ code: 'er', name: 'Eritrea', dialCode: '+291', flag: '/flags/eritrea.png' },
{ code: 'es', name: 'Spain', dialCode: '+34', flag: '/flags/spain.png' },
{ code: 'et', name: 'Ethiopia', dialCode: '+251', flag: '/flags/ethiopia.png' },
{ code: 'fi', name: 'Finland', dialCode: '+358', flag: '/flags/finland.png' },
{ code: 'fj', name: 'Fiji', dialCode: '+679', flag: '/flags/fiji.png' },
{ code: 'fm', name: 'Micronesia', dialCode: '+691', flag: '/flags/micronesia.png' },
{ code: 'fo', name: 'Faroe Islands', dialCode: '+298', flag: '/flags/faroe-islands.png' },
{ code: 'fr', name: 'France', dialCode: '+33', flag: '/flags/france.png' },
{ code: 'ga', name: 'Gabon', dialCode: '+241', flag: '/flags/gabon.png' },
{ code: 'gb', name: 'United Kingdom', dialCode: '+44', flag: '/flags/united-kingdom.png' },
{ code: 'gd', name: 'Grenada', dialCode: '+1473', flag: '/flags/grenada.png' },
{ code: 'ge', name: 'Georgia', dialCode: '+995', flag: '/flags/georgia.png' },
{ code: 'gh', name: 'Ghana', dialCode: '+233', flag: '/flags/ghana.png' },
{ code: 'gi', name: 'Gibraltar', dialCode: '+350', flag: '/flags/gibraltar.png' },
{ code: 'gl', name: 'Greenland', dialCode: '+299', flag: '/flags/greenland.png' },
{ code: 'gm', name: 'Gambia', dialCode: '+220', flag: '/flags/gambia.png' },
{ code: 'gn', name: 'Guinea', dialCode: '+224', flag: '/flags/guinea.png' },
{ code: 'gq', name: 'Equatorial Guinea', dialCode: '+240', flag: '/flags/equatorial-guinea.png' },
{ code: 'gr', name: 'Greece', dialCode: '+30', flag: '/flags/greece.png' },
{ code: 'gt', name: 'Guatemala', dialCode: '+502', flag: '/flags/guatemala.png' },
{ code: 'gu', name: 'Guam', dialCode: '+1671', flag: '/flags/guam.png' },
{ code: 'gw', name: 'Guinea-Bissau', dialCode: '+245', flag: '/flags/guinea-bissau.png' },
{ code: 'gy', name: 'Guyana', dialCode: '+592', flag: '/flags/guyana.png' },
{ code: 'hk', name: 'Hong Kong', dialCode: '+852', flag: '/flags/hong-kong.png' },
{ code: 'hn', name: 'Honduras', dialCode: '+504', flag: '/flags/honduras.png' },
{ code: 'hr', name: 'Croatia', dialCode: '+385', flag: '/flags/croatia.png' },
{ code: 'ht', name: 'Haiti', dialCode: '+509', flag: '/flags/haiti.png' },
{ code: 'hu', name: 'Hungary', dialCode: '+36', flag: '/flags/hungary.png' },
{ code: 'id', name: 'Indonesia', dialCode: '+62', flag: '/flags/indonesia.png' },
{ code: 'ie', name: 'Ireland', dialCode: '+353', flag: '/flags/ireland.png' },
{ code: 'il', name: 'Israel', dialCode: '+972', flag: '/flags/israel.png' },
{ code: 'in', name: 'India', dialCode: '+91', flag: '/flags/india.png' },
{ code: 'iq', name: 'Iraq', dialCode: '+964', flag: '/flags/iraq.png' },
{ code: 'ir', name: 'Iran', dialCode: '+98', flag: '/flags/iran.png' },
{ code: 'is', name: 'Iceland', dialCode: '+354', flag: '/flags/iceland.png' },
{ code: 'it', name: 'Italy', dialCode: '+39', flag: '/flags/italy.png' },
{ code: 'jm', name: 'Jamaica', dialCode: '+1876', flag: '/flags/jamaica.png' },
{ code: 'jo', name: 'Jordan', dialCode: '+962', flag: '/flags/jordan.png' },
{ code: 'jp', name: 'Japan', dialCode: '+81', flag: '/flags/japan.png' },
{ code: 'ke', name: 'Kenya', dialCode: '+254', flag: '/flags/kenya.png' },
{ code: 'kg', name: 'Kyrgyzstan', dialCode: '+996', flag: '/flags/kyrgyzstan.png' },
{ code: 'kh', name: 'Cambodia', dialCode: '+855', flag: '/flags/cambodia.png' },
{ code: 'ki', name: 'Kiribati', dialCode: '+686', flag: '/flags/kiribati.png' },
{ code: 'km', name: 'Comoros', dialCode: '+269', flag: '/flags/comoros.png' },
{ code: 'kn', name: 'Saint Kitts and Nevis', dialCode: '+1869', flag: '/flags/saint-kitts-and-nevis.png' },
{ code: 'kp', name: 'North Korea', dialCode: '+850', flag: '/flags/north-korea.png' },
{ code: 'kr', name: 'South Korea', dialCode: '+82', flag: '/flags/south-korea.png' },
{ code: 'kw', name: 'Kuwait', dialCode: '+965', flag: '/flags/kuwait.png' },
{ code: 'ky', name: 'Cayman Islands', dialCode: '+1345', flag: '/flags/cayman-islands.png' },
{ code: 'kz', name: 'Kazakhstan', dialCode: '+7', flag: '/flags/kazakhstan.png' },
{ code: 'la', name: 'Laos', dialCode: '+856', flag: '/flags/laos.png' },
{ code: 'lb', name: 'Lebanon', dialCode: '+961', flag: '/flags/lebanon.png' },
{ code: 'lc', name: 'Saint Lucia', dialCode: '+1758', flag: '/flags/saint-lucia.png' },
{ code: 'li', name: 'Liechtenstein', dialCode: '+423', flag: '/flags/liechtenstein.png' },
{ code: 'lk', name: 'Sri Lanka', dialCode: '+94', flag: '/flags/sri-lanka.png' },
{ code: 'lr', name: 'Liberia', dialCode: '+231', flag: '/flags/liberia.png' },
{ code: 'ls', name: 'Lesotho', dialCode: '+266', flag: '/flags/lesotho.png' },
{ code: 'lt', name: 'Lithuania', dialCode: '+370', flag: '/flags/lithuania.png' },
{ code: 'lu', name: 'Luxembourg', dialCode: '+352', flag: '/flags/luxembourg.png' },
{ code: 'lv', name: 'Latvia', dialCode: '+371', flag: '/flags/latvia.png' },
{ code: 'ly', name: 'Libya', dialCode: '+218', flag: '/flags/libya.png' },
{ code: 'ma', name: 'Morocco', dialCode: '+212', flag: '/flags/morocco.png' },
{ code: 'mc', name: 'Monaco', dialCode: '+377', flag: '/flags/monaco.png' },
{ code: 'md', name: 'Moldova', dialCode: '+373', flag: '/flags/moldova.png' },
{ code: 'me', name: 'Montenegro', dialCode: '+382', flag: '/flags/montenegro.png' },
{ code: 'mg', name: 'Madagascar', dialCode: '+261', flag: '/flags/madagascar.png' },
{ code: 'mh', name: 'Marshall Islands', dialCode: '+692', flag: '/flags/marshall-islands.png' },
{ code: 'mk', name: 'North Macedonia', dialCode: '+389', flag: '/flags/north-macedonia.png' },
{ code: 'ml', name: 'Mali', dialCode: '+223', flag: '/flags/mali.png' },
{ code: 'mm', name: 'Myanmar', dialCode: '+95', flag: '/flags/myanmar.png' },
{ code: 'mn', name: 'Mongolia', dialCode: '+976', flag: '/flags/mongolia.png' },
{ code: 'mo', name: 'Macau', dialCode: '+853', flag: '/flags/macau.png' },
{ code: 'mr', name: 'Mauritania', dialCode: '+222', flag: '/flags/mauritania.png' },
{ code: 'ms', name: 'Montserrat', dialCode: '+1664', flag: '/flags/montserrat.png' },
{ code: 'mt', name: 'Malta', dialCode: '+356', flag: '/flags/malta.png' },
{ code: 'mu', name: 'Mauritius', dialCode: '+230', flag: '/flags/mauritius.png' },
{ code: 'mv', name: 'Maldives', dialCode: '+960', flag: '/flags/maldives.png' },
{ code: 'mw', name: 'Malawi', dialCode: '+265', flag: '/flags/malawi.png' },
{ code: 'mx', name: 'Mexico', dialCode: '+52', flag: '/flags/mexico.png' },
{ code: 'my', name: 'Malaysia', dialCode: '+60', flag: '/flags/malaysia.png' },
{ code: 'mz', name: 'Mozambique', dialCode: '+258', flag: '/flags/mozambique.png' },
{ code: 'na', name: 'Namibia', dialCode: '+264', flag: '/flags/namibia.png' },
{ code: 'ne', name: 'Niger', dialCode: '+227', flag: '/flags/niger.png' },
{ code: 'ng', name: 'Nigeria', dialCode: '+234', flag: '/flags/nigeria.png' },
{ code: 'ni', name: 'Nicaragua', dialCode: '+505', flag: '/flags/nicaragua.png' },
{ code: 'nl', name: 'Netherlands', dialCode: '+31', flag: '/flags/netherlands.png' },
{ code: 'no', name: 'Norway', dialCode: '+47', flag: '/flags/norway.png' },
{ code: 'np', name: 'Nepal', dialCode: '+977', flag: '/flags/nepal.png' },
{ code: 'nr', name: 'Nauru', dialCode: '+674', flag: '/flags/nauru.png' },
{ code: 'nz', name: 'New Zealand', dialCode: '+64', flag: '/flags/new-zealand.png' },
{ code: 'om', name: 'Oman', dialCode: '+968', flag: '/flags/oman.png' },
{ code: 'pa', name: 'Panama', dialCode: '+507', flag: '/flags/panama.png' },
{ code: 'pe', name: 'Peru', dialCode: '+51', flag: '/flags/peru.png' },
{ code: 'pf', name: 'French Polynesia', dialCode: '+689', flag: '/flags/french-polynesia.png' },
{ code: 'pg', name: 'Papua New Guinea', dialCode: '+675', flag: '/flags/papua-new-guinea.png' },
{ code: 'ph', name: 'Philippines', dialCode: '+63', flag: '/flags/philippines.png' },
{ code: 'pk', name: 'Pakistan', dialCode: '+92', flag: '/flags/pakistan.png' },
{ code: 'pl', name: 'Poland', dialCode: '+48', flag: '/flags/poland.png' },
{ code: 'pt', name: 'Portugal', dialCode: '+351', flag: '/flags/portugal.png' },
{ code: 'pw', name: 'Palau', dialCode: '+680', flag: '/flags/palau.png' },
{ code: 'py', name: 'Paraguay', dialCode: '+595', flag: '/flags/paraguay.png' },
{ code: 'qa', name: 'Qatar', dialCode: '+974', flag: '/flags/qatar.png' },
{ code: 'ro', name: 'Romania', dialCode: '+40', flag: '/flags/romania.png' },
{ code: 'rs', name: 'Serbia', dialCode: '+381', flag: '/flags/serbia.png' },
{ code: 'ru', name: 'Russia', dialCode: '+7', flag: '/flags/russia.png' },
{ code: 'rw', name: 'Rwanda', dialCode: '+250', flag: '/flags/rwanda.png' },
{ code: 'sa', name: 'Saudi Arabia', dialCode: '+966', flag: '/flags/saudi-arabia.png' },
{ code: 'sb', name: 'Solomon Islands', dialCode: '+677', flag: '/flags/solomon-islands.png' },
{ code: 'sc', name: 'Seychelles', dialCode: '+248', flag: '/flags/seychelles.png' },
{ code: 'sd', name: 'Sudan', dialCode: '+249', flag: '/flags/sudan.png' },
{ code: 'se', name: 'Sweden', dialCode: '+46', flag: '/flags/sweden.png' },
{ code: 'sg', name: 'Singapore', dialCode: '+65', flag: '/flags/singapore.png' },
{ code: 'si', name: 'Slovenia', dialCode: '+386', flag: '/flags/slovenia.png' },
{ code: 'sk', name: 'Slovakia', dialCode: '+421', flag: '/flags/slovakia.png' },
{ code: 'sl', name: 'Sierra Leone', dialCode: '+232', flag: '/flags/sierra-leone.png' },
{ code: 'sm', name: 'San Marino', dialCode: '+378', flag: '/flags/san-marino.png' },
{ code: 'sn', name: 'Senegal', dialCode: '+221', flag: '/flags/senegal.png' },
{ code: 'so', name: 'Somalia', dialCode: '+252', flag: '/flags/somalia.png' },
{ code: 'sr', name: 'Suriname', dialCode: '+597', flag: '/flags/suriname.png' },
{ code: 'st', name: 'Sao Tome and Principe', dialCode: '+239', flag: '/flags/sao-tome-and-principe.png' },
{ code: 'sv', name: 'El Salvador', dialCode: '+503', flag: '/flags/el-salvador.png' },
{ code: 'sy', name: 'Syria', dialCode: '+963', flag: '/flags/syria.png' },
{ code: 'sz', name: 'Eswatini', dialCode: '+268', flag: '/flags/eswatini.png' },
{ code: 'td', name: 'Chad', dialCode: '+235', flag: '/flags/chad.png' },
{ code: 'tg', name: 'Togo', dialCode: '+228', flag: '/flags/togo.png' },
{ code: 'th', name: 'Thailand', dialCode: '+66', flag: '/flags/thailand.png' },
{ code: 'tj', name: 'Tajikistan', dialCode: '+992', flag: '/flags/tajikistan.png' },
{ code: 'tl', name: 'Timor-Leste', dialCode: '+670', flag: '/flags/timor-leste.png' },
{ code: 'tm', name: 'Turkmenistan', dialCode: '+993', flag: '/flags/turkmenistan.png' },
{ code: 'tn', name: 'Tunisia', dialCode: '+216', flag: '/flags/tunisia.png' },
{ code: 'to', name: 'Tonga', dialCode: '+676', flag: '/flags/tonga.png' },
{ code: 'tr', name: 'Turkey', dialCode: '+90', flag: '/flags/turkey.png' },
{ code: 'tt', name: 'Trinidad and Tobago', dialCode: '+1868', flag: '/flags/trinidad-and-tobago.png' },
{ code: 'tv', name: 'Tuvalu', dialCode: '+688', flag: '/flags/tuvalu.png' },
{ code: 'tw', name: 'Taiwan', dialCode: '+886', flag: '/flags/taiwan.png' },
{ code: 'tz', name: 'Tanzania', dialCode: '+255', flag: '/flags/tanzania.png' },
{ code: 'ua', name: 'Ukraine', dialCode: '+380', flag: '/flags/ukraine.png' },
{ code: 'ug', name: 'Uganda', dialCode: '+256', flag: '/flags/uganda.png' },
{ code: 'us', name: 'United States', dialCode: '+1', flag: '/flags/united-states.png' },
{ code: 'uy', name: 'Uruguay', dialCode: '+598', flag: '/flags/uruguay.png' },
{ code: 'uz', name: 'Uzbekistan', dialCode: '+998', flag: '/flags/uzbekistan.png' },
{ code: 'va', name: 'Vatican City', dialCode: '+379', flag: '/flags/vatican-city.png' },
{ code: 'vc', name: 'Saint Vincent and the Grenadines', dialCode: '+1784', flag: '/flags/saint-vincent-and-the-grenadines.png' },
{ code: 've', name: 'Venezuela', dialCode: '+58', flag: '/flags/venezuela.png' },
{ code: 'vn', name: 'Vietnam', dialCode: '+84', flag: '/flags/vietnam.png' },
{ code: 'vu', name: 'Vanuatu', dialCode: '+678', flag: '/flags/vanuatu.png' },
{ code: 'ws', name: 'Samoa', dialCode: '+685', flag: '/flags/samoa.png' },
{ code: 'ye', name: 'Yemen', dialCode: '+967', flag: '/flags/yemen.png' },
{ code: 'za', name: 'South Africa', dialCode: '+27', flag: '/flags/south-africa.png' },
{ code: 'zm', name: 'Zambia', dialCode: '+260', flag: '/flags/zambia.png' },
{ code: 'zw', name: 'Zimbabwe', dialCode: '+263', flag: '/flags/zimbabwe.png' }
  // ... rest of your countries
];

export default function ProofOfIdentity() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [selectedDocType, setSelectedDocType] = useState<'passport' | 'id' | 'driver' | 'residence'>('passport');
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVerify = () => {
    console.log('Starting verification...');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-[#0a0a0a] rounded-lg">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setShowKycModal(true)}
            className="flex items-center gap-2 text-sm text-[#9ca3af] hover:text-white transition-colors"
          >
            <span>Business Verification</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </header>

      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Proof of Identity</h1>

        {/* Warning Message */}
        <div className="bg-gradient-to-r from-[#2a1f0a] to-[#1a1a1a] border-l-4 border-[#f7a600] rounded-lg p-4 mb-6 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-[#f7a600] flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-black font-bold text-sm">!</span>
          </div>
          <p className="text-[#9ca3af] text-sm leading-relaxed">
            Due to insufficient phone memory, you may not be able to complete this verification process. If you encounter any problems, click here to copy the link and use a computer to access Bybit Web to continue the verification process.
            <button className="text-[#f7a600] ml-1">›</button>
          </p>
        </div>

        {/* Document Issuing Country */}
        <div className="mb-6">
          <label className="text-[#9ca3af] text-sm mb-3 block">Document issuing country</label>
          <button
            onClick={() => setShowCountryModal(true)}
            className="w-full bg-[#1a1a1a] hover:bg-[#252525] rounded-xl p-4 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <img
                src={selectedCountry.flag}
                alt={selectedCountry.name}
                className="w-8 h-6 rounded object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 24"%3E%3Crect width="32" height="24" fill="%23333"/%3E%3C/svg%3E';
                }}
              />
              <span className="text-white font-medium">{selectedCountry.name}</span>
            </div>
            <ChevronDown className="w-5 h-5 text-[#71757f]" />
          </button>
        </div>

        {/* Document Type */}
        <div className="mb-6">
          <label className="text-[#9ca3af] text-sm mb-3 block">Document Type</label>
          
          <div className="space-y-3">
            {/* Passport - Recommended */}
            <button
              onClick={() => setSelectedDocType('passport')}
              className={`w-full rounded-xl p-4 flex items-center justify-between transition-all ${
                selectedDocType === 'passport'
                  ? 'bg-[#1a1a1a] border-2 border-white'
                  : 'bg-[#0a0a0a] border-2 border-[#0a0a0a] hover:border-[#1a1a1a]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#2a2a2e] flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-white font-medium">Passport</span>
              </div>
              {selectedDocType === 'passport' && (
                <span className="bg-[#f7a600] text-black text-xs font-semibold px-3 py-1 rounded-full">
                  Recommended
                </span>
              )}
            </button>

            {/* ID Card */}
            <button
              onClick={() => setSelectedDocType('id')}
              className={`w-full rounded-xl p-4 flex items-center gap-3 transition-all ${
                selectedDocType === 'id'
                  ? 'bg-[#1a1a1a] border-2 border-white'
                  : 'bg-[#0a0a0a] border-2 border-[#0a0a0a] hover:border-[#1a1a1a]'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-[#2a2a2e] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <span className="text-white font-medium">ID card</span>
            </button>

            {/* Driver License */}
            <button
              onClick={() => setSelectedDocType('driver')}
              className={`w-full rounded-xl p-4 flex items-center gap-3 transition-all ${
                selectedDocType === 'driver'
                  ? 'bg-[#1a1a1a] border-2 border-white'
                  : 'bg-[#0a0a0a] border-2 border-[#0a0a0a] hover:border-[#1a1a1a]'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-[#2a2a2e] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <span className="text-white font-medium">Driver license</span>
            </button>

            {/* Residence Permit */}
            <button
              onClick={() => setSelectedDocType('residence')}
              className={`w-full rounded-xl p-4 flex items-center gap-3 transition-all ${
                selectedDocType === 'residence'
                  ? 'bg-[#1a1a1a] border-2 border-white'
                  : 'bg-[#0a0a0a] border-2 border-[#0a0a0a] hover:border-[#1a1a1a]'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-[#2a2a2e] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-white font-medium">Residence permit</span>
            </button>
          </div>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          className="w-full bg-[#f7a600] hover:bg-[#e09500] text-black font-semibold py-4 rounded-xl transition-colors mt-8"
        >
          Verify
        </button>
      </div>

      {/* Country Selection Modal */}
      {showCountryModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
          <div className="flex-1 flex flex-col bg-black">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#1a1a1a]">
              <h2 className="text-lg font-semibold">Please select a country or region</h2>
              <button
                onClick={() => setShowCountryModal(false)}
                className="p-2 hover:bg-[#0a0a0a] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="px-4 py-4 border-b border-[#1a1a1a]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type your input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-2 border-[#2a2a2e] rounded-xl px-4 py-3 pr-10 text-white placeholder-[#71757f] focus:outline-none focus:border-[#3a3a3e]"
                />
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71757f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" strokeWidth="2" />
                  <path strokeLinecap="round" strokeWidth="2" d="m21 21-4.35-4.35" />
                </svg>
              </div>
            </div>

            {/* Country List Header */}
            <div className="px-4 py-3 bg-[#0a0a0a]">
              <h3 className="text-sm text-[#71757f]">Country/Region of Issue</h3>
            </div>

            {/* Country List */}
            <div className="flex-1 overflow-y-auto">
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => {
                    setSelectedCountry(country);
                    setShowCountryModal(false);
                    setSearchQuery('');
                  }}
                  className="w-full px-4 py-4 flex items-center justify-between hover:bg-[#0a0a0a] transition-colors border-b border-[#1a1a1a]"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={country.flag}
                      alt={country.name}
                      className="w-8 h-6 rounded object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 24"%3E%3Crect width="32" height="24" fill="%23333"/%3E%3C/svg%3E';
                      }}
                    />
                    <span className="text-white">{country.name}</span>
                  </div>
                  <span className="text-[#71757f] text-sm">{country.dialCode}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KYC Business Verification Modal */}
      {showKycModal && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-end">
          <div className="w-full bg-[#0a0a0a] rounded-t-3xl max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#1a1a1a]">
              <h2 className="text-xl font-semibold">khome.kyb</h2>
              <button
                onClick={() => setShowKycModal(false)}
                className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <p className="text-[#9ca3af] text-base mb-6">
                To verify your business, you'll need to provide:
              </p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white mt-2 flex-shrink-0"></div>
                  <span className="text-white text-base">Company details</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white mt-2 flex-shrink-0"></div>
                  <span className="text-white text-base">
                    Information about related parties (including UBOs, directors and account operators)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white mt-2 flex-shrink-0"></div>
                  <span className="text-white text-base">Company incorporation documents</span>
                </li>
              </ul>

              {/* Info Box */}
              <div className="bg-[#1a1a1a] border border-[#2a2a2e] rounded-2xl p-4 flex items-start gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#2a2a2e] flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-white text-base leading-relaxed">
                  Please submit your business verification on the Bybit website.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-6 border-t border-[#1a1a1a]">
              <button
                onClick={() => setShowKycModal(false)}
                className="w-full bg-[#f7a600] hover:bg-[#e09500] text-black font-semibold py-4 rounded-xl transition-colors text-lg"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, X, Search, Check } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  fee: string;
  feeAmount?: string;
  realTime: boolean;
  icon: string;
  iconBg: string;
  selected?: boolean;
  zeroFees?: boolean;
  hasInstructions?: boolean;
}

interface FiatCurrency {
  code: string;
  name: string;
  color: string;
  supported: boolean;
}

const FIAT_CURRENCIES: FiatCurrency[] = [
  { code: 'EUR', name: 'EUR', color: '#22c55e', supported: true },
  { code: 'PLN', name: 'Polish Zloty', color: '#ef4444', supported: true },
  { code: 'ARS', name: 'Argentine Peso', color: '#22c55e', supported: false },
  { code: 'BOB', name: 'Bolivian Boliviano', color: '#22c55e', supported: false },
  { code: 'BRL', name: 'Brazilian Real', color: '#22c55e', supported: false },
  { code: 'CHF', name: 'Swiss Franc', color: '#22c55e', supported: false },
  { code: 'CLP', name: 'Chilean Peso', color: '#22c55e', supported: false },
  { code: 'COP', name: 'Colombian Peso', color: '#22c55e', supported: false },
  { code: 'CRC', name: 'Costa Rican Colón', color: '#ef4444', supported: false },
  { code: 'CZK', name: 'Czech Koruna', color: '#22c55e', supported: false },
  { code: 'GBP', name: 'GBP', color: '#8b5cf6', supported: false },
  { code: 'HKD', name: 'Hong Kong Dollar', color: '#22c55e', supported: false },
  { code: 'HUF', name: 'Hungarian Forint', color: '#f97316', supported: false },
  { code: 'IDR', name: 'Indonesian Rupiah', color: '#ef4444', supported: false },
  { code: 'KZT', name: 'Kazakhstani Tenge', color: '#22c55e', supported: false },
  { code: 'USD', name: 'US Dollar', color: '#22c55e', supported: false },
  { code: 'GEL', name: 'Georgian Lari', color: '#ef4444', supported: false },
  { code: 'INR', name: 'Indian Rupee', color: '#f97316', supported: false },
  { code: 'JPY', name: 'Japanese Yen', color: '#ef4444', supported: false },
  { code: 'KRW', name: 'South Korean Won', color: '#3b82f6', supported: false },
  { code: 'MXN', name: 'Mexican Peso', color: '#22c55e', supported: false },
  { code: 'NGN', name: 'Nigerian Naira', color: '#22c55e', supported: false },
  { code: 'PHP', name: 'Philippine Peso', color: '#3b82f6', supported: false },
  { code: 'RUB', name: 'Russian Ruble', color: '#3b82f6', supported: false },
  { code: 'THB', name: 'Thai Baht', color: '#3b82f6', supported: false },
  { code: 'TRY', name: 'Turkish Lira', color: '#ef4444', supported: false },
  { code: 'UAH', name: 'Ukrainian Hryvnia', color: '#facc15', supported: false },
  { code: 'VND', name: 'Vietnamese Dong', color: '#ef4444', supported: false },
  { code: 'ZAR', name: 'South African Rand', color: '#22c55e', supported: false },
];

const EUR_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'sepa', name: 'SEPA', fee: '', realTime: true, icon: 'SEPA', iconBg: '#f7a600', zeroFees: true, hasInstructions: true },
  { id: 'easy_bank', name: 'Easy Bank Payment', fee: '0.08%', feeAmount: '0.30EUR', realTime: true, icon: '€', iconBg: '#f7a600' },
  { id: 'zen', name: 'ZEN', fee: '0.92%', realTime: true, icon: '↻', iconBg: '#333' },
];

const PLN_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'blik', name: 'BLIK', fee: '0.90%', feeAmount: '0.50PLN', realTime: true, icon: 'blik', iconBg: '#000' },
  { id: 'zen', name: 'ZEN', fee: '1.00%', realTime: true, icon: '↻', iconBg: '#333' },
];

const MENU_ITEMS = [
  { icon: '🔄', label: 'Recurring Buy' },
  { icon: '🎫', label: 'Coupon' },
  { icon: '💎', label: 'VIP Benefit' },
  { icon: '❓', label: 'Help Center' },
  { icon: '⚠️', label: 'Appeal' },
  { icon: '📝', label: 'Submit trading materials' },
];

export default function FiatCurrencyDashboard() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<FiatCurrency>(FIAT_CURRENCIES[0]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('sepa');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showNotSupportedModal, setShowNotSupportedModal] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');

  const getPaymentMethods = (): PaymentMethod[] => {
    if (selectedCurrency.code === 'EUR') return EUR_PAYMENT_METHODS;
    if (selectedCurrency.code === 'PLN') return PLN_PAYMENT_METHODS;
    return [];
  };

  const handleCurrencySelect = (currency: FiatCurrency) => {
    if (!currency.supported) {
      setSelectedCurrency(currency);
      setShowCurrencyModal(false);
      setShowNotSupportedModal(true);
    } else {
      setSelectedCurrency(currency);
      setShowCurrencyModal(false);
      if (currency.code === 'EUR') {
        setSelectedPaymentMethod('sepa');
      } else if (currency.code === 'PLN') {
        setSelectedPaymentMethod('blik');
      }
    }
  };

  const filteredCurrencies = FIAT_CURRENCIES.filter(c =>
    c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
    c.name.toLowerCase().includes(currencySearch.toLowerCase())
  );

  const alphabet = '#ABCEGGHIKMPRSTUV'.split('');

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <button onClick={() => router.back()} className="text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <button onClick={() => setShowCurrencyModal(true)} className="flex items-center gap-1">
          <span className="text-white font-semibold text-lg">Fiat Deposit</span>
          <ChevronDown className="w-4 h-4 text-white" />
        </button>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowOrdersModal(true)} className="text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </button>
          <button onClick={() => setShowMenuModal(true)} className="text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Amount Section */}
      <div className="px-4 mb-6">
        <p className="text-white text-sm mb-2">Amount</p>
        <div className="bg-[#1a1a1a] rounded-xl p-4 flex items-center justify-between">
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0 - 0.0"
            className="bg-transparent text-white text-lg outline-none flex-1"
          />
          <div className="flex items-center gap-2">
            {amount && (
              <button onClick={() => setAmount('')} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            )}
            <button onClick={() => setShowCurrencyModal(true)} className="flex items-center gap-1 text-white">
              <span>{selectedCurrency.code}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Payment Method Section */}
      {selectedCurrency.supported && (
        <div className="px-4 mb-6">
          <p className="text-gray-400 text-sm mb-3">Payment Method</p>
          <div className="space-y-3">
            {getPaymentMethods().map((method) => (
              <div
                key={method.id}
                onClick={() => setSelectedPaymentMethod(method.id)}
                className={`w-full bg-[#1a1a1a] rounded-xl p-4 flex items-center justify-between border cursor-pointer ${
                  selectedPaymentMethod === method.id ? 'border-[#f7a600]' : 'border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: method.iconBg }}
                  >
                    {method.icon === 'blik' ? (
                      <span className="text-[10px]">blik</span>
                    ) : method.icon === 'SEPA' ? (
                      <span className="text-[8px]">SEPA</span>
                    ) : (
                      method.icon
                    )}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{method.name}</span>
                      {method.zeroFees && (
                        <span className="bg-[#22c55e] text-black text-xs px-2 py-0.5 rounded">Zero Fees</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      {method.fee && <span>{method.fee}</span>}
                      {method.feeAmount && <span>+ {method.feeAmount} Fee</span>}
                      {method.realTime && (
                        <>
                          <span className="text-gray-600">|</span>
                          <span>Real Time</span>
                        </>
                      )}
                    </div>
                    {method.hasInstructions && (
                      <span 
                        onClick={(e) => e.stopPropagation()}
                        className="text-white text-sm flex items-center gap-1 mt-1 cursor-pointer hover:text-[#f7a600]"
                      >
                        Deposit Instructions
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedPaymentMethod === method.id
                      ? 'border-[#f7a600] bg-[#f7a600]'
                      : 'border-gray-500'
                  }`}
                >
                  {selectedPaymentMethod === method.id && (
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Terms and Continue Button - Fixed at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0d0d0d] p-4">
        <div className="flex items-start gap-3 mb-4">
          <button
            onClick={() => setAgreedToTerms(!agreedToTerms)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
              agreedToTerms ? 'bg-[#f7a600] border-[#f7a600]' : 'border-gray-500'
            }`}
          >
            {agreedToTerms && <Check className="w-3 h-3 text-black" />}
          </button>
          <p className="text-gray-400 text-xs leading-relaxed">
            I&apos;ve read and agreed to <span className="text-[#f7a600]">Terms of Service</span>, Bybit&apos;s{' '}
            <span className="text-[#f7a600]">Privacy Policy</span>, <span className="text-[#f7a600]">Fee Rates</span>, and{' '}
            <span className="text-[#f7a600]">Risk Disclosure</span>.
          </p>
        </div>

        <button
          className={`w-full py-4 rounded-xl font-semibold ${
            agreedToTerms && amount ? 'bg-[#f7a600] text-black' : 'bg-[#3d3a30] text-[#8b8579]'
          }`}
        >
          Continue
        </button>

        <div className="text-center mt-3">
          <p className="text-gray-500 text-xs">The service is provided by UAB Onlychain Fintech Limited.</p>
          <p className="text-gray-500 text-xs">
            Please read the <span className="text-[#f7a600]">UAB Onlychain Fintech Limited Privacy Policy</span>.
          </p>
        </div>
      </div>

      {/* Currency Select Modal */}
      {showCurrencyModal && (
        <div className="fixed inset-0 bg-[#0d0d0d] z-50 flex flex-col">
          <div className="px-4 py-3">
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Please enter preferred fiat currency"
                value={currencySearch}
                onChange={(e) => setCurrencySearch(e.target.value)}
                className="w-full bg-[#1a1a1a] rounded-lg py-3 pl-10 pr-20 text-white placeholder-gray-500 outline-none"
                autoFocus
              />
              <button onClick={() => setShowCurrencyModal(false)} className="absolute right-3 text-gray-400 text-sm">
                Cancel
              </button>
            </div>
          </div>

          {/* Recommend */}
          <div className="px-4 mb-4">
            <p className="text-gray-500 text-sm mb-2">Recommend</p>
            <button
              onClick={() => handleCurrencySelect(FIAT_CURRENCIES[0])}
              className="bg-[#1a1a1a] px-4 py-2 rounded-lg text-white text-sm"
            >
              EUR
            </button>
          </div>

          <div className="flex flex-1">
            <div className="flex-1 overflow-y-auto px-4">
              <p className="text-gray-500 text-sm mb-2">Fiat</p>
              {filteredCurrencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencySelect(currency)}
                  className="w-full flex items-center gap-3 py-3"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: currency.color }}
                  >
                    {currency.code.slice(0, 2)}
                  </div>
                  <div className="text-left">
                    <span className="text-white font-medium">{currency.code}</span>
                    <span className="text-gray-500 ml-2 text-sm">{currency.name}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="w-6 flex flex-col items-center justify-center text-[10px] text-gray-500">
              {alphabet.map((letter) => (
                <span key={letter} className="py-[1px]">
                  {letter}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Menu Modal */}
      {showMenuModal && (
        <div className="fixed inset-0 bg-black/60 z-50" onClick={() => setShowMenuModal(false)}>
          <div
            className="absolute top-12 right-4 bg-[#1a1a1a] rounded-xl p-2 min-w-[220px]"
            onClick={(e) => e.stopPropagation()}
          >
            {MENU_ITEMS.map((item, i) => (
              <button
                key={i}
                className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#252525] rounded-lg"
              >
                <span className="text-[#f7a600]">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Orders Modal */}
      {showOrdersModal && (
        <div className="fixed inset-0 bg-[#0d0d0d] z-50 flex flex-col">
          <div className="flex items-center px-4 py-4">
            <button onClick={() => setShowOrdersModal(false)} className="text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-white flex-1 text-center mr-8">Orders</h1>
          </div>

          {/* Tabs */}
          <div className="px-4 overflow-x-auto">
            <div className="flex gap-4 border-b border-gray-800 whitespace-nowrap">
              {['One-Click Buy', 'P2P Trading', 'Fiat Deposit', 'Fiat Withdrawal', 'Convert'].map((tab, i) => (
                <button
                  key={tab}
                  className={`pb-3 text-sm ${
                    i === 2 ? 'text-white border-b-2 border-white' : 'text-gray-500'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Filter */}
          <div className="px-4 py-3">
            <button className="text-gray-400 text-sm flex items-center gap-1">
              All Statuses
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Empty state */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-24 h-24 mb-4">
              <div className="w-full h-full bg-gradient-to-br from-[#4a3d1a] to-[#2a2a2a] rounded-lg transform rotate-12 flex items-center justify-center">
                <div className="w-16 h-12 bg-[#1a1a1a] rounded-md flex flex-col items-center justify-center">
                  <div className="w-10 h-1 bg-[#f7a600] rounded mb-1"></div>
                  <div className="w-8 h-1 bg-[#f7a600] rounded mb-1"></div>
                  <div className="w-6 h-1 bg-[#f7a600] rounded"></div>
                </div>
              </div>
            </div>
            <p className="text-gray-500">No orders found</p>
          </div>
        </div>
      )}

      {/* Not Supported Modal */}
      {showNotSupportedModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-8">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-white text-lg font-semibold text-center mb-3">Fiat Currency Not Support</h3>
            <p className="text-gray-400 text-sm text-center mb-6">
              We do not currently support deposits of this fiat at the moment.
            </p>
            <button
              onClick={() => {
                setShowNotSupportedModal(false);
                router.push('/FiatDashboard');
              }}
              className="w-full bg-[#f7a600] text-black font-semibold py-4 rounded-xl mb-3"
            >
              Buy Crypto
            </button>
            <button
              onClick={() => {
                setShowNotSupportedModal(false);
                setSelectedCurrency(FIAT_CURRENCIES[0]);
              }}
              className="w-full text-white font-semibold py-3"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

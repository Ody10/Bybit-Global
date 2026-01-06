'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

const faqItems = [
  {
    title: 'How to Make a Deposit',
    href: '#'
  },
  {
    title: 'Deposits yet to be credited?',
    href: '#'
  },
  {
    title: 'Unsupported Deposit Recovery Procedure Rules',
    href: '#'
  },
  {
    title: 'FAQ — Crypto Deposit',
    href: '#'
  },
  {
    title: 'How to Recover a Deposit with Wrong or Missing Tag/Memo',
    href: '#'
  },
  {
    title: 'View the Deposit/Withdrawal Status of All Coins',
    href: '#'
  }
];

export default function FAQ() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-[#1a1a1a]">
        <div className="flex items-center justify-center p-4 relative">
          <button 
            onClick={() => router.back()}
            className="absolute left-4 p-2 hover:bg-[#1a1a1a] rounded-lg transition-all"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h1 className="text-[17px] font-semibold">FAQ</h1>
        </div>
      </div>

      {/* FAQ List */}
      <div>
        {faqItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="block bg-[#0a0a0a] hover:bg-[#1a1a1a] transition-colors border-b border-[#1a1a1a]"
          >
            <div className="flex items-center justify-between py-5 px-4">
              <span className="text-white text-[15px] leading-snug pr-4">{item.title}</span>
              <svg 
                className="w-5 h-5 text-gray-500 flex-shrink-0" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
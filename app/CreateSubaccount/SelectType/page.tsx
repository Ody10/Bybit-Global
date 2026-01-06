'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight } from 'lucide-react';

interface SubaccountType {
  id: string;
  title: string;
  description: string;
}

const subaccountTypes: SubaccountType[] = [
  {
    id: 'standard',
    title: 'Standard Subaccount',
    description: 'You can log in to a Standard Subaccount via Account Switch without entering a password.',
  },
  {
    id: 'custodial',
    title: 'Custodial Trading Subaccount',
    description: 'With a Custodial Trading Subaccount you can entrust your funds to professional trading teams for asset management. This fund access cannot be granted to trading teams on a Standard Subaccount.',
  },
  {
    id: 'islamic',
    title: 'Islamic Account',
    description: 'Create an interest-free Islamic trading account. Trade only Shariah compliant products.',
  },
];

export default function SelectSubaccountType() {
  const router = useRouter();

  const handleTypeSelect = (typeId: string) => {
    router.push(`/CreateSubaccount?type=${typeId}`);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0d0d0d] border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={() => router.back()} className="p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Create Subaccount</h1>
          <div className="w-6"></div>
        </div>
      </div>

      {/* Subaccount Types */}
      <div className="p-4 space-y-3">
        {subaccountTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleTypeSelect(type.id)}
            className="w-full bg-[#1a1a1a] rounded-xl p-4 text-left hover:bg-[#252525] transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <h3 className="text-white font-semibold mb-2">{type.title}</h3>
                <p className="text-[#71757f] text-sm leading-relaxed">{type.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#71757f] flex-shrink-0 mt-1" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
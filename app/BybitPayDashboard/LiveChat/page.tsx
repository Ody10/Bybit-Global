'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-[#f7a600] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-white text-sm">Loading...</span>
      </div>
    </div>
  );
}

// Language Modal
function LanguageModal({ isOpen, onClose, selectedLanguage, onSelect }: { isOpen: boolean; onClose: () => void; selectedLanguage: string; onSelect: (lang: string) => void }) {
  if (!isOpen) return null;

  const languages = [
    'English', '中文(马来西亚)', '中文繁體', '日本語', '한국어', 'Русский', 
    'Español (Internacional)', 'Español (México)', 'Español (Argentina)', 
    'Português (Brasil)', 'Português (Internacional)', 'Tiếng Việt', 'Dutch', 
    'Українська', 'Bahasa Indonesia', 'Қазақша', 'العربية'
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
      <div className="w-full bg-[#1a1a1a] rounded-t-2xl max-h-[70vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-[#1a1a1a] px-4 py-4 border-b border-gray-800">
          <span className="text-white font-medium">Select language</span>
        </div>
        <div className="p-4">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => { onSelect(lang); onClose(); }}
              className="w-full flex items-center justify-between py-4 border-b border-gray-800/30"
            >
              <span className="text-white">{lang}</span>
              {selectedLanguage === lang && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f7a600" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
      <style jsx>{`@keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } } .animate-slide-up { animation: slide-up 0.3s ease-out; }`}</style>
    </div>
  );
}

// End Chat Modal
function EndChatModal({ isOpen, onClose, onEndChat }: { isOpen: boolean; onClose: () => void; onEndChat: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
      <div className="w-full bg-[#1a1a1a] rounded-t-2xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white font-medium text-lg">Would you like to end this chat?</span>
          <button onClick={onClose} className="text-gray-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-gray-400 text-sm mb-6">Your chat history will be saved for future reference. Even after closing the chat window, you can return to this thread to address any additional concerns.</p>
        <button onClick={onEndChat} className="w-full bg-[#f7a600] text-black font-semibold py-4 rounded-xl mb-3">End Chat</button>
        <button onClick={onClose} className="w-full bg-[#252525] text-white font-semibold py-4 rounded-xl">Go Back</button>
      </div>
      <style jsx>{`@keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } } .animate-slide-up { animation: slide-up 0.3s ease-out; }`}</style>
    </div>
  );
}

// Rate Service Modal
function RateServiceModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
      <div className="w-full bg-[#1a1a1a] rounded-t-2xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white font-medium text-lg">Rate Our Service</span>
          <button onClick={onClose} className="text-gray-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-gray-400 text-sm mb-4">Your feedback matters! Help us excel by sharing your thoughts.</p>
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onClick={() => setRating(star)}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill={rating >= star ? '#f7a600' : 'none'} stroke="#f7a600" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          ))}
        </div>
        <div className="bg-[#252525] rounded-xl p-4 mb-4">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Please tell us how we did!"
            className="w-full bg-transparent text-white placeholder-gray-500 outline-none resize-none h-24"
            maxLength={99}
          />
          <p className="text-gray-500 text-xs text-right">{feedback.length}/99</p>
        </div>
        <button className="w-full bg-[#f7a600] text-black font-semibold py-4 rounded-xl">Submit</button>
      </div>
      <style jsx>{`@keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } } .animate-slide-up { animation: slide-up 0.3s ease-out; }`}</style>
    </div>
  );
}

const faqCategories = ['You might be looking for', 'Event & Bonus', 'Account & Identity Verification', 'P2P Trading', 'Trading', 'Deposit & Withdrawal'];
const faqQuestions = [
  "Why Can't I Join Token Splash?",
  "My assets under UTA cannot be used, traded, or transferred",
  "Can Chinese Identification be Used for KYC on Bybit?",
  "Check my Case Status",
  "My Bank Account is Deducted, but Where is my Fiat Deposit (BRL, RUB, etc.)?",
  "How can I Check my P2P Appeal Status",
  "I Want to Report the Seller for Using a Third-Party Payment"
];

export default function LiveChat() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(faqCategories[0]);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showEndChatModal, setShowEndChatModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [language, setLanguage] = useState('English');
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState([{ role: 'bot', text: "Hello there! I'm Bybot, how can I assist you today?", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    setMessages([...messages, { role: 'user', text: message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setMessage('');
    setChatStarted(true);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col">
      {loading && <LoadingSpinner />}
      <div className="sticky top-0 z-10 bg-[#0d0d0d] px-4 py-4">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="text-white p-2 -ml-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">24/7 Dedicated Support</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowLanguageModal(true)} className="text-gray-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
              </svg>
            </button>
            <button onClick={() => setShowEndChatModal(true)} className="text-gray-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18.36 6.64a9 9 0 11-12.73 0M12 2v10" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {!chatStarted ? (
        <div className="flex-1 px-4 pb-4 overflow-y-auto">
          {/* Bot Avatar & Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#f7a600] rounded-full flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h2 className="text-white font-semibold">24/7 Dedicated Support</h2>
              <p className="text-gray-500 text-sm">Hello there! I&apos;m Bybot, how can I assist you today?</p>
            </div>
          </div>

          {/* FAQs */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">FAQs</h3>
              <button className="text-[#f7a600] text-sm flex items-center gap-1">
                View All <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </div>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {faqCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap ${selectedCategory === cat ? 'bg-[#252525] text-white' : 'text-gray-500'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {faqQuestions.map((q, i) => (
                <button key={i} className="w-full text-left py-2 text-gray-400 text-sm hover:text-white">{q}</button>
              ))}
            </div>
          </div>

          {/* Self-Service */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Self-Service</h3>
              <button className="text-[#f7a600] text-sm flex items-center gap-1">
                View All <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '📋', title: 'P2P Order Dispute', subtitle: 'Dispute a P2P Order here' },
                { icon: '🔐', title: 'Update KYC', subtitle: 'Update your account KYC information' },
                { icon: '🛡️', title: 'Report Stolen Funds', subtitle: '' },
                { icon: '💬', title: 'Support Hub', subtitle: '' },
              ].map((item) => (
                <button key={item.title} className="bg-[#1a1a1a] rounded-xl p-4 text-left">
                  <span className="text-2xl mb-2 block">{item.icon}</span>
                  <p className="text-white font-medium text-sm">{item.title}</p>
                  {item.subtitle && <p className="text-gray-500 text-xs">{item.subtitle}</p>}
                </button>
              ))}
            </div>
          </div>

          {/* Start Asking Button */}
          <button onClick={() => setChatStarted(true)} className="w-full bg-[#252525] text-white font-medium py-4 rounded-xl mt-6 flex items-center justify-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
            </svg>
            Start Asking
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* View Chat History */}
          <button className="text-gray-500 text-sm flex items-center justify-center gap-1 py-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            View Chat History
          </button>

          {/* Messages */}
          <div className="flex-1 px-4 pb-4 overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`mb-4 ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block max-w-[80%] p-3 rounded-xl ${msg.role === 'user' ? 'bg-[#f7a600] text-black' : 'bg-[#252525] text-white'}`}>
                  {msg.text}
                </div>
                <p className="text-gray-500 text-xs mt-1">{msg.time}</p>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 py-3 bg-[#0d0d0d] border-t border-gray-800">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Drop your question(s) here"
                className="flex-1 bg-[#1a1a1a] rounded-xl py-3 px-4 text-white placeholder-gray-500 outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={handleSendMessage} className="w-10 h-10 bg-[#f7a600] rounded-full flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <LanguageModal isOpen={showLanguageModal} onClose={() => setShowLanguageModal(false)} selectedLanguage={language} onSelect={setLanguage} />
      <EndChatModal isOpen={showEndChatModal} onClose={() => setShowEndChatModal(false)} onEndChat={() => { setShowEndChatModal(false); setShowRateModal(true); }} />
      <RateServiceModal isOpen={showRateModal} onClose={() => setShowRateModal(false)} />
    </div>
  );
}
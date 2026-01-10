//app/selectCoinDashboard/page.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Ticker {
  symbol: string;
  lastPrice: string;
  volume24h: string;
}

interface CoinData {
  symbol: string;
  name: string;
  balance: number;
  usdValue: string;
}

// Map of coin symbols to their full names
const coinNames: Record<string, string> = {
  A: 'Vaulta',
  A8: 'Ancient8',
  AAPLX: 'AAPLX',
  AARK: 'Aark',
  AAVE: 'Aave',
  ACA: 'Acala Token',
  ACH: 'Alchemy Pay',
  ACM: 'AC Milan Fan Token',
  ACS: 'Access Protocol',
  ADA: 'Cardano',
  AEVO: 'Aevo',
  AERGO: 'Aergo',
  AERO: 'Aerodrome',
  AFG: 'AFG',
  AGIX: 'SingularityNET',
  AGLD: 'Adventure Gold',
  AI: 'AI',
  AIOZ: 'AIOZ Network',
  AIUS: 'Arbius',
  AKRO: 'Akropolis',
  ALCX: 'Alchemix',
  ALGO: 'Algorand',
  ALICE: 'MyNeighborAlice',
  ALPHA: 'Alpha Venture',
  ALT: 'AltLayer',
  AMP: 'Amp',
  ANKR: 'Ankr',
  ANT: 'Aragon',
  APE: 'ApeCoin',
  API3: 'API3',
  APT: 'Aptos',
  ARB: 'Arbitrum',
  ARKM: 'Arkham',
  ARK: 'Ark',
  ARPA: 'ARPA',
  AR: 'Arweave',
  ASTR: 'Astar',
  ATA: 'Automata',
  ATOM: 'Cosmos',
  AUCTION: 'Bounce',
  AUDIO: 'Audius',
  AVA: 'Travala',
  AVAX: 'Avalanche',
  AXL: 'Axelar',
  AXS: 'Axie Infinity',
  BABYDOGE: 'Baby Doge',
  BADGER: 'Badger',
  BAKE: 'BakeryToken',
  BAL: 'Balancer',
  BAND: 'Band Protocol',
  BAT: 'Basic Attention',
  BCH: 'Bitcoin Cash',
  BEL: 'Bella Protocol',
  BICO: 'Biconomy',
  BLUR: 'Blur',
  BLZ: 'Bluzelle',
  BNB: 'BNB',
  BNT: 'Bancor',
  BOME: 'Book of Meme',
  BOND: 'BarnBridge',
  BONK: 'Bonk',
  BSV: 'Bitcoin SV',
  BSW: 'Biswap',
  BTC: 'Bitcoin',
  BTT: 'BitTorrent',
  C98: 'Coin98',
  CAKE: 'PancakeSwap',
  CELO: 'Celo',
  CELR: 'Celer Network',
  CFX: 'Conflux',
  CHR: 'Chromia',
  CHZ: 'Chiliz',
  CKB: 'Nervos Network',
  CLV: 'Clover Finance',
  COMP: 'Compound',
  CORE: 'Core',
  COTI: 'COTI',
  CRO: 'Cronos',
  CRV: 'Curve DAO',
  CSPR: 'Casper',
  CTSI: 'Cartesi',
  CTX: 'Cryptex',
  CVX: 'Convex Finance',
  CVC: 'Civic',
  DAI: 'Dai',
  DAO: 'DAO Maker',
  DASH: 'Dash',
  DATA: 'Streamr',
  DCR: 'Decred',
  DENT: 'Dent',
  DEXE: 'DeXe',
  DGB: 'DigiByte',
  DIA: 'DIA',
  DODO: 'DODO',
  DOGE: 'Dogecoin',
  DOT: 'Polkadot',
  DUSK: 'Dusk Network',
  DYDX: 'dYdX',
  DYM: 'Dymension',
  EDU: 'Open Campus',
  EGLD: 'MultiversX',
  ELF: 'aelf',
  ENJ: 'Enjin Coin',
  ENS: 'ENS',
  EOS: 'EOS',
  ETC: 'Ethereum Classic',
  ETH: 'Ethereum',
  ETHFI: 'Ether.fi',
  ETHW: 'EthereumPoW',
  FET: 'Fetch.ai',
  FIL: 'Filecoin',
  FLOKI: 'Floki',
  FLOW: 'Flow',
  FLR: 'Flare',
  FORTH: 'Ampleforth',
  FTM: 'Fantom',
  FXS: 'Frax Share',
  GAL: 'Galxe',
  GALA: 'Gala',
  GAS: 'Gas',
  GLMR: 'Moonbeam',
  GLM: 'Golem',
  GMT: 'STEPN',
  GMX: 'GMX',
  GNO: 'Gnosis',
  GRT: 'The Graph',
  GTC: 'Gitcoin',
  HBAR: 'Hedera',
  HFT: 'Hashflow',
  HIGH: 'Highstreet',
  HNT: 'Helium',
  HOOK: 'Hooked Protocol',
  HOT: 'Holo',
  ICP: 'Internet Computer',
  ICX: 'ICON',
  ID: 'SPACE ID',
  IDEX: 'IDEX',
  ILV: 'Illuvium',
  IMX: 'Immutable X',
  INJ: 'Injective',
  IOST: 'IOST',
  IOTA: 'IOTA',
  IOTX: 'IoTeX',
  JASMY: 'JasmyCoin',
  JOE: 'Trader Joe',
  JST: 'JUST',
  JTO: 'Jito',
  JUP: 'Jupiter',
  KAIA: 'Kaia',
  KAS: 'Kaspa',
  KAVA: 'Kava',
  KCS: 'KuCoin Token',
  KDA: 'Kadena',
  KEEP: 'Keep Network',
  KEY: 'SelfKey',
  KLAY: 'Klaytn',
  KNC: 'Kyber Network',
  KSM: 'Kusama',
  LDO: 'Lido DAO',
  LEVER: 'LeverFi',
  LINA: 'Linear Finance',
  LINK: 'Chainlink',
  LIT: 'Litentry',
  LOOKS: 'LooksRare',
  LOOM: 'Loom Network',
  LPT: 'Livepeer',
  LQTY: 'Liquity',
  LRC: 'Loopring',
  LSK: 'Lisk',
  LTC: 'Litecoin',
  LUNA: 'Terra',
  LUNC: 'Terra Classic',
  MAGIC: 'Magic',
  MANA: 'Decentraland',
  MANTA: 'Manta Network',
  MASK: 'Mask Network',
  MATIC: 'Polygon',
  MAV: 'Maverick',
  MBL: 'MovieBloc',
  MBOX: 'MOBOX',
  MC: 'Merit Circle',
  MDT: 'Measurable Data',
  MEME: 'Memecoin',
  METIS: 'Metis',
  MINA: 'Mina Protocol',
  MKR: 'Maker',
  MLN: 'Enzyme',
  MOVR: 'Moonriver',
  MTL: 'Metal',
  MULTI: 'Multichain',
  NEAR: 'NEAR Protocol',
  NEO: 'Neo',
  NEXO: 'Nexo',
  NFP: 'NFPrompt',
  NKN: 'NKN',
  NMR: 'Numeraire',
  NOT: 'Notcoin',
  NTRN: 'Neutron',
  OCEAN: 'Ocean Protocol',
  OGN: 'Origin Protocol',
  OKB: 'OKB',
  OMG: 'OMG Network',
  OMNI: 'Omni Network',
  ONE: 'Harmony',
  ONG: 'Ontology Gas',
  ONT: 'Ontology',
  OP: 'Optimism',
  ORBS: 'Orbs',
  ORDI: 'ORDI',
  ORN: 'Orion Protocol',
  OSMO: 'Osmosis',
  OXT: 'Orchid',
  PAXG: 'PAX Gold',
  PENDLE: 'Pendle',
  PEOPLE: 'ConstitutionDAO',
  PEPE: 'Pepe',
  PERP: 'Perpetual Protocol',
  PHA: 'Phala Network',
  PIXEL: 'Pixels',
  POLYX: 'Polymesh',
  POND: 'Marlin',
  PORTAL: 'Portal',
  POL: 'Polygon',
  POWR: 'Power Ledger',
  PRIME: 'Echelon Prime',
  PROM: 'Prom',
  PUNDIX: 'Pundi X',
  PYTH: 'Pyth Network',
  QI: 'BENQI',
  QNT: 'Quant',
  QTUM: 'Qtum',
  QUICK: 'QuickSwap',
  RAD: 'Radicle',
  RARE: 'SuperRare',
  RAY: 'Raydium',
  RDNT: 'Radiant Capital',
  REEF: 'Reef',
  REN: 'Ren',
  REQ: 'Request',
  RIF: 'RSK Infrastructure',
  RLC: 'iExec RLC',
  RNDR: 'Render',
  RONIN: 'Ronin',
  ROSE: 'Oasis Network',
  RPL: 'Rocket Pool',
  RSR: 'Reserve Rights',
  RSS3: 'RSS3',
  RUNE: 'THORChain',
  RVN: 'Ravencoin',
  SAFE: 'Safe',
  SAND: 'The Sandbox',
  SATS: 'SATS',
  SC: 'Siacoin',
  SCRT: 'Secret',
  SEI: 'Sei',
  SFP: 'SafePal',
  SHIB: 'Shiba Inu',
  SKL: 'SKALE',
  SLP: 'Smooth Love',
  SNT: 'Status',
  SNX: 'Synthetix',
  SOL: 'Solana',
  SPELL: 'Spell Token',
  SRM: 'Serum',
  SSV: 'SSV Network',
  STG: 'Stargate Finance',
  STORJ: 'Storj',
  STPT: 'STP',
  STRAX: 'Stratis',
  STRK: 'Starknet',
  STX: 'Stacks',
  SUI: 'Sui',
  SUN: 'Sun',
  SUPER: 'SuperVerse',
  SUSHI: 'SushiSwap',
  SWEAT: 'Sweat Economy',
  SXP: 'Solar',
  SYN: 'Synapse',
  SYS: 'Syscoin',
  TAO: 'Bittensor',
  THETA: 'Theta Network',
  TIA: 'Celestia',
  TLM: 'Alien Worlds',
  TNSR: 'Tensor',
  TON: 'Toncoin',
  TRB: 'Tellor',
  TRU: 'TrueFi',
  TRX: 'TRON',
  T: 'Threshold',
  TUSD: 'TrueUSD',
  TWT: 'Trust Wallet',
  UMA: 'UMA',
  UNFI: 'Unifi Protocol',
  UNI: 'Uniswap',
  USDC: 'USD Coin',
  USDD: 'USDD',
  USDT: 'Tether',
  USTC: 'TerraClassicUSD',
  UTK: 'Utrust',
  VANRY: 'Vanar Chain',
  VET: 'VeChain',
  VGX: 'Voyager Token',
  VIDT: 'VIDT DAO',
  VOXEL: 'Voxies',
  WAVES: 'Waves',
  WAXP: 'WAX',
  WIF: 'dogwifhat',
  WIN: 'WINkLink',
  WLD: 'Worldcoin',
  WOO: 'WOO Network',
  W: 'Wormhole',
  XAI: 'Xai',
  XCH: 'Chia',
  XDC: 'XDC Network',
  XEC: 'eCash',
  XEM: 'NEM',
  XLM: 'Stellar',
  XMR: 'Monero',
  XNO: 'Nano',
  XRP: 'XRP',
  XTZ: 'Tezos',
  XVG: 'Verge',
  XVS: 'Venus',
  YFI: 'yearn.finance',
  YGG: 'YGG',
  ZEC: 'Zcash',
  ZEN: 'Horizen',
  ZETA: 'ZetaChain',
  ZIL: 'Zilliqa',
  ZK: 'ZKsync',
  ZRO: 'LayerZero',
  ZRX: '0x Protocol',
};

// Coin Icon Component with fallback
function CoinIcon({ symbol }: { symbol: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
        <span className="text-xs font-medium text-white">{symbol.slice(0, 2)}</span>
      </div>
    );
  }

  return (
    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
      <Image
        src={`/coins/${symbol}.png`}
        alt={symbol}
        width={32}
        height={32}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
        unoptimized
      />
    </div>
  );
}

export default function SelectCoinDashboard() {
  const router = useRouter();
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [hideZeroBalances, setHideZeroBalances] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);

  // Alphabet index
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');

  useEffect(() => {
    fetchCoins();
  }, []);

  const fetchCoins = async () => {
    try {
      const response = await fetch('https://api.bybit.com/v5/market/tickers?category=spot', {
  cache: 'no-store'
});
      const data = await response.json();

      if (data.result?.list) {
        // Extract unique base coins from trading pairs
        const coinMap = new Map<string, CoinData>();

        data.result.list.forEach((ticker: Ticker) => {
          // Remove common quote currencies to get base coin
          const symbol = ticker.symbol
            .replace(/USDT$/, '')
            .replace(/USDC$/, '')
            .replace(/BTC$/, '')
            .replace(/ETH$/, '');

          if (symbol && !coinMap.has(symbol)) {
            coinMap.set(symbol, {
              symbol,
              name: coinNames[symbol] || symbol,
              balance: 0,
              usdValue: '≈$ 0',
            });
          }
        });

        // Sort coins alphabetically
        const sortedCoins = Array.from(coinMap.values()).sort((a, b) =>
          a.symbol.localeCompare(b.symbol)
        );

        setCoins(sortedCoins);
      }
    } catch (error) {
      console.error('Failed to fetch coins:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCoins = useMemo(() => {
    let filtered = coins;

    if (searchQuery) {
      filtered = filtered.filter(
        (coin) =>
          coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          coin.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (hideZeroBalances) {
      filtered = filtered.filter((coin) => coin.balance > 0);
    }

    return filtered;
  }, [coins, searchQuery, hideZeroBalances]);

  // Group coins by first letter
  const groupedCoins = useMemo(() => {
    const groups: Record<string, CoinData[]> = {};
    filteredCoins.forEach((coin) => {
      const firstLetter = coin.symbol[0].toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(coin);
    });
    return groups;
  }, [filteredCoins]);

  const handleCoinClick = (coin: CoinData) => {
    setSelectedCoin(coin);
    setShowWithdrawModal(true);
  };

  const handleOnChainClick = () => {
    if (selectedCoin) {
      setShowWithdrawModal(false);
      router.push(`/On-Chain-Dashboard?coin=${selectedCoin.symbol}&name=${encodeURIComponent(selectedCoin.name)}`);
    }
  };

  const handleInternalTransferClick = () => {
    if (selectedCoin) {
      setShowWithdrawModal(false);
      router.push(`/Internal-Transfer-Dashboard?coin=${selectedCoin.symbol}&name=${encodeURIComponent(selectedCoin.name)}`);
    }
  };

  const scrollToLetter = (letter: string) => {
    const element = document.getElementById(`section-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0d0d0d] px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.back()}
            className="text-white p-2"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">Select Coin</h1>
          <div className="flex items-center gap-3">
            <button className="text-gray-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <button className="text-gray-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M3 10h18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1a1a1a] rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-gray-600"
          />
        </div>

        {/* Hide Zero Balances Checkbox */}
        <label className="flex items-center gap-2 text-gray-400 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={hideZeroBalances}
            onChange={(e) => setHideZeroBalances(e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 bg-transparent checked:bg-yellow-500 checked:border-yellow-500"
          />
          Hide zero balances
        </label>
      </div>

      {/* Coin List */}
      <div className="relative flex">
        <div className="flex-1 px-4 pb-20">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-500 border-t-transparent"></div>
            </div>
          ) : (
            Object.entries(groupedCoins).map(([letter, letterCoins]) => (
              <div key={letter} id={`section-${letter}`}>
                <div className="text-gray-500 text-sm py-2 sticky top-[180px] bg-[#0d0d0d]">
                  {letter}
                </div>
                {letterCoins.map((coin) => (
                  <div
                    key={coin.symbol}
                    onClick={() => handleCoinClick(coin)}
                    className="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-800/20 rounded-lg px-2 -mx-2 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <CoinIcon symbol={coin.symbol} />
                      <div>
                        <div className="text-[15px] font-medium text-white">{coin.symbol}</div>
                        <div className="text-xs text-gray-500">{coin.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[15px] font-medium text-white">{coin.balance}</div>
                      <div className="text-xs text-gray-500">{coin.usdValue}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Alphabet Index */}
        <div className="fixed right-1 top-1/2 transform -translate-y-1/2 flex flex-col items-center text-[10px] text-gray-500">
          {alphabet.map((letter) => (
            <button
              key={letter}
              onClick={() => scrollToLetter(letter)}
              className="py-0.5 px-1 hover:text-yellow-500 transition-colors"
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && selectedCoin && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-end"
          onClick={() => setShowWithdrawModal(false)}
        >
          <div
            className="w-full bg-[#1a1a1a] rounded-t-2xl p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Withdraw</h2>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {/* On-Chain Option */}
              <button
                onClick={handleOnChainClick}
                className="w-full bg-[#252525] rounded-xl p-4 flex items-center justify-between hover:bg-[#2a2a2a] transition-colors"
              >
                <div className="text-left">
                  <div className="font-medium text-white">On-Chain</div>
                  <div className="text-sm text-gray-500">Withdrawal to an on-chain address</div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              {/* Internal Transfer Option */}
              <button
                onClick={handleInternalTransferClick}
                className="w-full bg-[#252525] rounded-xl p-4 flex items-center justify-between hover:bg-[#2a2a2a] transition-colors"
              >
                <div className="text-left">
                  <div className="font-medium text-white">Internal Transfer</div>
                  <div className="text-sm text-gray-500">Withdraw via Bybit UID/email/mobile — 0 fee</div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

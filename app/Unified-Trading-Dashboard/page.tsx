"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Types
interface CryptoAsset {
  symbol: string;
  name: string;
  balance: string;
  arsValue: string;
  logo?: string;
  isPopular?: boolean;
}

// Skeleton Loader Component
const SkeletonLoader = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-800 rounded ${className}`} />
);

// Asset Row Skeleton
const AssetRowSkeleton = () => (
  <div className="flex items-center justify-between py-4 px-4">
    <div className="flex items-center gap-3">
      <SkeletonLoader className="w-8 h-8 rounded-full" />
      <div className="flex flex-col gap-1">
        <SkeletonLoader className="w-16 h-4" />
        <SkeletonLoader className="w-24 h-3" />
      </div>
    </div>
    <div className="flex flex-col items-end gap-1">
      <SkeletonLoader className="w-20 h-4" />
      <SkeletonLoader className="w-16 h-3" />
    </div>
  </div>
);

// Help Modal Component for Unified Trading
const UnifiedHelpModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-[#1a1a1a] rounded-t-3xl max-h-[80vh] overflow-hidden animate-slide-up">
        <div className="sticky top-0 bg-[#1a1a1a] px-4 py-4 flex items-center justify-between border-b border-gray-800">
          <h3 className="text-white text-lg font-semibold">Help</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(80vh-60px)] p-4 space-y-6">
          {/* Total Equity */}
          <div>
            <h4 className="text-white font-semibold mb-2">Total Equity</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Total Equity is calculated by adding the fiat currency valuation
              of the equity of each coin in your account.
            </p>
          </div>

          {/* IM */}
          <div>
            <h4 className="text-white font-semibold mb-2">IM</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Refers to the total amount of margin required by all active orders
              and open positions under both Derivatives (excl. Inverse) and
              Margin Trading on Spot, in USD. If the Initial Margin Rate is
              equal to or greater than 100%, it means that all margin balance
              has been deployed for your active orders and open positions and
              you would no longer be able to place active orders that may
              increase your position size.
            </p>
          </div>

          {/* MM */}
          <div>
            <h4 className="text-white font-semibold mb-2">MM</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Refers to the minimum amount of margin required for holding
              positions in Derivatives (excl. Inverse) and Margin Trading on
              Spot, in USD. Liquidation may be triggered if your margin balance
              is equal to or less than your maintenance margin (i.e.
              maintenance margin rate is equal to or greater than 100%).
            </p>
          </div>

          {/* Margin Balance */}
          <div>
            <h4 className="text-white font-semibold mb-2">Margin Balance</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Margin balance is the total amount that can be used as margin in
              your account, including Wallet Balance, Unrealized PnL of
              Perpetual and Options value.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed mt-2">
              If the margin balance falls below the maintenance margin,
              liquidation will be triggered. Do note that the value shown here
              is a converted value and not the actual USD amount held in your
              account.
            </p>
          </div>

          {/* Wallet Balance */}
          <div>
            <h4 className="text-white font-semibold mb-2">Wallet Balance</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Refers to the estimated total USD value of the assets you hold in
              your Unified Trading Account. You may check the detailed balance
              for any coin in the transaction history. Please note that this
              estimate is a conversion, and does not refer to the actual amount
              of USD in your account.
            </p>
          </div>

          {/* Available Balance */}
          <div>
            <h4 className="text-white font-semibold mb-2">Available Balance</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Refers to the estimated USD amount available for Spot and
              Derivatives (excl. Inverse) trading. Please note that this
              estimate is a conversion, and does not refer to the actual amount
              of USD in your account.
            </p>
          </div>

          {/* Margin Trading on Spot */}
          <div>
            <h4 className="text-white font-semibold mb-2">
              Margin Trading on Spot
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Once enabled, you may use collateral assets to do Margin Trading
              on Spot. Please note that while it enables you to make higher
              returns with lower capital, borrowing assets to trade may expose
              your collateral to risk of liquidation. Once disabled, you will no
              longer be able to continue Margin Trading on Spot.
            </p>
          </div>

          {/* Equity */}
          <div>
            <h4 className="text-white font-semibold mb-2">Equity</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Equity comprises the Wallet Balance, as well as the Unrealized PnL
              of the Derivatives contract(s) and the option value.
            </p>
          </div>

          {/* Bonus */}
          <div>
            <h4 className="text-white font-semibold mb-2">Bonus</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Bonus can only be used for Derivatives Trades (as margin, or to
              offset trading / delivery / liquidation fees, funding payments and
              losses). It cannot be used for Spot Trades, buying Options or be
              transferred out under any circumstances.
              <span className="text-[#f7a600] ml-1 cursor-pointer">
                View More
              </span>
            </p>
          </div>

          {/* Transferable Amount */}
          <div>
            <h4 className="text-white font-semibold mb-2">
              Transferable Amount
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              This value is an estimated amount of the coin that can be
              transferred. The actual amount that can be transferred is subject
              to the real-time display in the Transfer window.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Popular coins that should appear at the top
const POPULAR_COINS = [
  "USDT",
  "USDC",
  "BTC",
  "ETH",
  "DOGS",
  "XRP",
  "SWEAT",
  "TRX",
  "MNT",
  "SOL",
];

export default function UnifiedTradingDashboard() {
  const router = useRouter();
  const [hideZeroBalances, setHideZeroBalances] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>([]);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Fetch coins from Bybit API
  useEffect(() => {
    const fetchCoins = async () => {
      setIsLoading(true);
      try {
        // Mock data based on Bybit's coin list (A-Z sorted)
        const allCoins = [
          "0G",
          "1INCH",
          "1SOL",
          "2Z",
          "3P",
          "5IRE",
          "A",
          "AAVE",
          "ACA",
          "ACE",
          "ACH",
          "ADA",
          "AEVO",
          "AGIX",
          "AGLD",
          "AI",
          "AIOZ",
          "AKRO",
          "ALGO",
          "ALICE",
          "ALPHA",
          "ALT",
          "AMB",
          "AMP",
          "ANKR",
          "ANT",
          "APE",
          "API3",
          "APT",
          "AR",
          "ARB",
          "ARKM",
          "ARPA",
          "ASTR",
          "ATA",
          "ATOM",
          "AUCTION",
          "AUDIO",
          "AVA",
          "AVAX",
          "AXL",
          "AXS",
          "BABYDOGE",
          "BADGER",
          "BAKE",
          "BAL",
          "BAND",
          "BAT",
          "BCH",
          "BEAM",
          "BEL",
          "BICO",
          "BIGTIME",
          "BLUR",
          "BLZ",
          "BNB",
          "BNT",
          "BOME",
          "BOND",
          "BONK",
          "BTC",
          "BTT",
          "C98",
          "CAKE",
          "CATI",
          "CELO",
          "CELR",
          "CFX",
          "CHR",
          "CHZ",
          "CKB",
          "CLV",
          "COMBO",
          "COMP",
          "CORE",
          "COTI",
          "CRO",
          "CRV",
          "CSPR",
          "CTC",
          "CTK",
          "CTSI",
          "CVC",
          "CVX",
          "CYBER",
          "DAI",
          "DAO",
          "DAR",
          "DASH",
          "DATA",
          "DCR",
          "DEGO",
          "DENT",
          "DEXE",
          "DGB",
          "DIA",
          "DODO",
          "DOGE",
          "DOGS",
          "DOT",
          "DUSK",
          "DYDX",
          "DYM",
          "EDU",
          "EGLD",
          "ELF",
          "ENA",
          "ENJ",
          "ENS",
          "EOS",
          "ETC",
          "ETH",
          "ETHFI",
          "ETHW",
          "FET",
          "FIL",
          "FITFI",
          "FLM",
          "FLOKI",
          "FLOW",
          "FLUX",
          "FLR",
          "FOR",
          "FORTH",
          "FRONT",
          "FTM",
          "FTT",
          "FXS",
          "GAL",
          "GALA",
          "GAS",
          "GFT",
          "GLMR",
          "GLM",
          "GMT",
          "GMX",
          "GNS",
          "GO",
          "GODS",
          "GPT",
          "GRT",
          "GTC",
          "HBAR",
          "HFT",
          "HIFI",
          "HIGH",
          "HMSTR",
          "HNT",
          "HOOK",
          "HOT",
          "ICP",
          "ICX",
          "ID",
          "IDEX",
          "ILV",
          "IMX",
          "INJ",
          "IOST",
          "IOTA",
          "IOTX",
          "JASMY",
          "JOE",
          "JST",
          "JTO",
          "JUP",
          "KAIA",
          "KAVA",
          "KCS",
          "KDA",
          "KEY",
          "KISHU",
          "KLAY",
          "KNC",
          "KSM",
          "L3",
          "LADYS",
          "LBR",
          "LDO",
          "LEVER",
          "LINA",
          "LINK",
          "LISTA",
          "LIT",
          "LOOKS",
          "LOOM",
          "LPT",
          "LQTY",
          "LRC",
          "LSK",
          "LTC",
          "LUNC",
          "MAGIC",
          "MANA",
          "MANTA",
          "MASK",
          "MATIC",
          "MAV",
          "MAVIA",
          "MBL",
          "MBOX",
          "MC",
          "MDT",
          "MEME",
          "MERL",
          "METIS",
          "MINA",
          "MKR",
          "MNT",
          "MOG",
          "MOVR",
          "MPLX",
          "MTA",
          "MTL",
          "MULTI",
          "MYRO",
          "NEAR",
          "NEIRO",
          "NEO",
          "NFP",
          "NKN",
          "NMR",
          "NOT",
          "NTRN",
          "NULS",
          "NYM",
          "OCEAN",
          "OGN",
          "OKB",
          "OM",
          "OMG",
          "OMNI",
          "ONE",
          "ONG",
          "ONT",
          "OP",
          "ORAI",
          "ORBS",
          "ORDI",
          "ORN",
          "OSMO",
          "OXT",
          "PAXG",
          "PENDLE",
          "PEOPLE",
          "PEPE",
          "PERP",
          "PHA",
          "PIXEL",
          "PNUT",
          "POL",
          "POLYX",
          "POND",
          "PORTAL",
          "POWR",
          "PRIME",
          "PRQ",
          "PROM",
          "PROS",
          "PSTAKE",
          "PYTH",
          "QI",
          "QKC",
          "QNT",
          "QTUM",
          "QUICK",
          "RACA",
          "RAD",
          "RARE",
          "RDNT",
          "REEF",
          "REI",
          "REN",
          "REQ",
          "REZ",
          "RIF",
          "RLC",
          "RLY",
          "RNDR",
          "RON",
          "ROSE",
          "RPL",
          "RSR",
          "RSS3",
          "RUNE",
          "RVN",
          "SAFE",
          "SAGA",
          "SAND",
          "SATS",
          "SC",
          "SCRT",
          "SEI",
          "SFP",
          "SHIB",
          "SKL",
          "SLN",
          "SLP",
          "SNT",
          "SNX",
          "SOL",
          "SPELL",
          "SSV",
          "STEEM",
          "STG",
          "STMX",
          "STORJ",
          "STRAX",
          "STRK",
          "STX",
          "SUI",
          "SUN",
          "SUPER",
          "SUSHI",
          "SWEAT",
          "SWELL",
          "SXP",
          "SYN",
          "T",
          "TAO",
          "THETA",
          "TIA",
          "TLM",
          "TOKEN",
          "TON",
          "TRAC",
          "TRB",
          "TRIBE",
          "TRU",
          "TRX",
          "TUSD",
          "TVK",
          "TWT",
          "UMA",
          "UNFI",
          "UNI",
          "USDC",
          "USDD",
          "USDT",
          "USTC",
          "UTK",
          "VANRY",
          "VELO",
          "VET",
          "VGX",
          "VIC",
          "VIDT",
          "VOXEL",
          "VRA",
          "WAVES",
          "WAXP",
          "WIF",
          "WIN",
          "WLD",
          "WNXM",
          "WOO",
          "X",
          "XAI",
          "XCH",
          "XEC",
          "XEM",
          "XLM",
          "XMR",
          "XNO",
          "XRP",
          "XTZ",
          "XVG",
          "XVS",
          "YFI",
          "YGG",
          "ZEC",
          "ZEN",
          "ZETA",
          "ZIL",
          "ZK",
          "ZRO",
          "ZRX",
        ];

        const assets: CryptoAsset[] = allCoins.map((symbol) => ({
          symbol,
          name: getCoinName(symbol),
          balance: getRandomBalance(symbol),
          arsValue: "≈ 0.00 ARS",
          isPopular: POPULAR_COINS.includes(symbol),
        }));

        // Sort: popular coins first, then alphabetically
        const sortedAssets = assets.sort((a, b) => {
          if (a.isPopular && !b.isPopular) return -1;
          if (!a.isPopular && b.isPopular) return 1;
          if (a.isPopular && b.isPopular) {
            return (
              POPULAR_COINS.indexOf(a.symbol) - POPULAR_COINS.indexOf(b.symbol)
            );
          }
          return a.symbol.localeCompare(b.symbol);
        });

        setCryptoAssets(sortedAssets);
      } catch (error) {
        console.error("Error fetching coins:", error);
      } finally {
        setTimeout(() => setIsLoading(false), 1500);
      }
    };

    fetchCoins();
  }, []);

  // Get random balance for display (simulated)
  const getRandomBalance = (symbol: string): string => {
    const specialBalances: { [key: string]: string } = {
      USDT: "0.0000",
      USDC: "0.000000",
      BTC: "0.00000000",
      ETH: "0.0000000000",
    };
    return specialBalances[symbol] || "0.00";
  };

  // Get coin name helper
  const getCoinName = (symbol: string): string => {
    const names: { [key: string]: string } = {
      BTC: "Bitcoin",
      ETH: "Ethereum",
      USDT: "Tether USDT",
      USDC: "USD Coin",
      HMSTR: "Hamster Kombat",
      XRP: "XRP",
      TRX: "TRON",
      SOL: "Solana",
      MNT: "Mantle",
      "0G": "0G",
      "1INCH": "1inch Network",
      "1SOL": "1Sol Protocol",
      "2Z": "DoubleZero",
      "3P": "3P",
      X: "X Empire",
      DOGS: "Dogs",
      DOGE: "Dogecoin",
      ADA: "Cardano",
      AVAX: "Avalanche",
      DOT: "Polkadot",
      LINK: "Chainlink",
      MATIC: "Polygon",
      SHIB: "Shiba Inu",
      LTC: "Litecoin",
      BCH: "Bitcoin Cash",
      UNI: "Uniswap",
      ATOM: "Cosmos",
      FIL: "Filecoin",
      APT: "Aptos",
      ARB: "Arbitrum",
      OP: "Optimism",
      SUI: "Sui",
      NEAR: "NEAR Protocol",
      INJ: "Injective",
      PEPE: "Pepe",
      BONK: "Bonk",
      SWEAT: "SWEAT",
      "5IRE": "5ire Token",
    };
    return names[symbol] || symbol;
  };

  // Filter assets based on search
  const filteredCrypto = cryptoAssets.filter((asset) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        asset.symbol.toLowerCase().includes(query) ||
        asset.name.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0d0d0d] px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-gray-800 rounded-lg transition-colors"
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
        <h1 className="text-lg font-semibold">Unified Trading</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHelpModal(true)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
          </button>
          <button
            onClick={() => router.push("/TransactionHistory")}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </button>
        </div>
      </header>

      {/* Total Equity Section */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <span>Total Equity</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="opacity-50"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div className="flex items-center gap-1 bg-[#1a1a1a] px-2 py-1 rounded text-xs">
            <span className="text-[#f7a600]">MM</span>
            <span className="text-green-500">0.00%</span>
          </div>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          {isLoading ? (
            <SkeletonLoader className="w-32 h-10" />
          ) : (
            <>
              <span className="text-4xl font-bold">0.00</span>
              <span className="text-gray-400 flex items-center">
                ARS
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="ml-1"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </>
          )}
        </div>
        <div className="text-gray-500 text-sm mt-1">0.00000000 BTC</div>
        <div className="flex items-center gap-1 text-sm mt-2">
          <span className="text-gray-400">Today's P&L</span>
          <span className="text-green-500">+0.00 ARS</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-500"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>

        {/* Available Balance / In Use */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <div className="text-gray-400 text-sm">Available Balance</div>
            <div className="text-white font-semibold">0.00 ARS</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">In Use</div>
            <div className="text-white font-semibold">0.00 ARS</div>
          </div>
        </div>

        {/* Expand Arrow */}
        <div className="flex justify-center mt-4">
          <button className="p-1 hover:bg-gray-800 rounded transition-colors">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-500"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 flex justify-between gap-3 mb-6">
        <button className="flex flex-col items-center gap-2 flex-1">
          <div className="w-12 h-12 rounded-full bg-[#f7a600] flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0d0d0d"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </div>
          <span className="text-sm text-white">Deposit</span>
        </button>
        <button className="flex flex-col items-center gap-2 flex-1">
          <div className="w-12 h-12 rounded-full bg-[#1a1a1a] border border-gray-700 flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
          <span className="text-sm text-white">Transfer</span>
        </button>
        <button className="flex flex-col items-center gap-2 flex-1">
          <div className="w-12 h-12 rounded-full bg-[#1a1a1a] border border-gray-700 flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              <path d="M9 12h6" />
              <path d="M12 9v6" />
            </svg>
          </div>
          <span className="text-sm text-white">Convert</span>
        </button>
        <button className="flex flex-col items-center gap-2 flex-1">
          <div className="w-12 h-12 rounded-full bg-[#1a1a1a] border border-gray-700 flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <span className="text-sm text-white">Borrow</span>
        </button>
      </div>

      {/* Crypto Section Header */}
      <div className="px-4 flex items-center justify-between mb-2">
        <span className="text-white font-semibold">Crypto</span>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg
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
          </button>
        </div>
      </div>

      {/* Search Input */}
      {showSearch && (
        <div className="px-4 mb-3">
          <input
            type="text"
            placeholder="Search coins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#f7a600]"
          />
        </div>
      )}

      {/* Hide Zero Balances */}
      <div className="px-4 flex items-center gap-2 mb-4">
        <button
          onClick={() => setHideZeroBalances(!hideZeroBalances)}
          className={`w-5 h-5 rounded border ${hideZeroBalances ? "bg-[#f7a600] border-[#f7a600]" : "border-gray-600"} flex items-center justify-center transition-colors`}
        >
          {hideZeroBalances && (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0d0d0d"
              strokeWidth="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
        <span className="text-gray-400 text-sm">Hide zero balances</span>
      </div>

      {/* Asset List */}
      <div className="flex-1 overflow-y-auto pb-20">
        {isLoading ? (
          <div>
            {[...Array(10)].map((_, i) => (
              <AssetRowSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div>
            {filteredCrypto.map((asset) => (
              <div
                key={asset.symbol}
                className="flex items-center justify-between py-4 px-4 hover:bg-[#1a1a1a] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center overflow-hidden">
                    <img
                      src={`/coins/${asset.symbol.toLowerCase()}.png`}
                      alt={asset.symbol}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        (
                          e.target as HTMLImageElement
                        ).parentElement!.innerHTML = `<span class="text-white text-xs font-bold">${asset.symbol.slice(0, 2)}</span>`;
                      }}
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-white">
                      {asset.symbol}
                    </div>
                    <div className="text-gray-500 text-sm">{asset.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{asset.balance}</div>
                  <div className="text-gray-500 text-sm">{asset.arsValue}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help Modal */}
      <UnifiedHelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      <style jsx global>{`
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
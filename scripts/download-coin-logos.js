// Run this script with: node scripts/download-coin-logos.js

const https = require('https');
const fs = require('fs');
const path = require('path');

// Create coins directory if it doesn't exist
const coinsDir = path.join(__dirname, '../public/coins');
if (!fs.existsSync(coinsDir)) {
  fs.mkdirSync(coinsDir, { recursive: true });
  console.log('✅ Created /public/coins directory');
}

// Coin symbol to CoinGecko ID mapping
const coinMapping = {
  'btc': 'bitcoin',
  'eth': 'ethereum',
  'sol': 'solana',
  'bnb': 'binancecoin',
  'xrp': 'ripple',
  'usdc': 'usd-coin',
  'ada': 'cardano',
  'avax': 'avalanche-2',
  'doge': 'dogecoin',
  'dot': 'polkadot',
  'matic': 'matic-network',
  'link': 'chainlink',
  'uni': 'uniswap',
  'ltc': 'litecoin',
  'atom': 'cosmos',
  'mnt': 'mantle',
  'pepe': 'pepe',
  'shib': 'shiba-inu',
  'arb': 'arbitrum',
  'op': 'optimism'
};

// Alternative: Direct URLs for popular coins (more reliable)
const directUrls = {
  'btc': 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  'eth': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  'sol': 'https://cryptologos.cc/logos/solana-sol-logo.png',
  'bnb': 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
  'xrp': 'https://cryptologos.cc/logos/xrp-xrp-logo.png',
  'usdc': 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
  'ada': 'https://cryptologos.cc/logos/cardano-ada-logo.png',
  'avax': 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
  'doge': 'https://cryptologos.cc/logos/dogecoin-doge-logo.png',
  'dot': 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png',
  'matic': 'https://cryptologos.cc/logos/polygon-matic-logo.png',
  'link': 'https://cryptologos.cc/logos/chainlink-link-logo.png',
  'uni': 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
  'ltc': 'https://cryptologos.cc/logos/litecoin-ltc-logo.png',
  'atom': 'https://cryptologos.cc/logos/cosmos-atom-logo.png'
};

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        fs.unlink(filepath, () => {}); // Delete empty file
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete empty file
      reject(err);
    });
  });
}

async function downloadAllLogos() {
  console.log('🚀 Starting to download coin logos...\n');
  
  for (const [symbol, geckoId] of Object.entries(coinMapping)) {
    const filepath = path.join(coinsDir, `${symbol}.png`);
    
    // Skip if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  ${symbol.toUpperCase()} - Already exists`);
      continue;
    }
    
    try {
      // Try direct URL first if available
      if (directUrls[symbol]) {
        await downloadImage(directUrls[symbol], filepath);
        console.log(`✅ ${symbol.toUpperCase()} - Downloaded from direct URL`);
      } else {
        // Try CoinGecko API
        const url = `https://api.coingecko.com/api/v3/coins/${geckoId}`;
        
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
          let data = '';
          
          response.on('data', (chunk) => {
            data += chunk;
          });
          
          response.on('end', async () => {
            try {
              const json = JSON.parse(data);
              const imageUrl = json.image?.large || json.image?.small;
              
              if (imageUrl) {
                await downloadImage(imageUrl, filepath);
                console.log(`✅ ${symbol.toUpperCase()} - Downloaded from CoinGecko`);
              } else {
                console.log(`❌ ${symbol.toUpperCase()} - No image URL found`);
              }
            } catch (err) {
              console.log(`❌ ${symbol.toUpperCase()} - Error: ${err.message}`);
            }
          });
        });
      }
      
      // Rate limiting - wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`❌ ${symbol.toUpperCase()} - Error: ${error.message}`);
    }
  }
  
  console.log('\n✨ Download process completed!');
  console.log('📁 Logos saved to: public/coins/');
  console.log('\n💡 Tip: If some logos failed, you can manually download them from:');
  console.log('   - https://cryptologos.cc/');
  console.log('   - https://www.coingecko.com/');
}

// Run the download
downloadAllLogos().catch(console.error);

// Create a placeholder SVG for missing coins
const createPlaceholderSVG = (symbol) => {
  const svg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="50" fill="#1a1a1a"/>
  <text x="50" y="65" font-family="Arial" font-size="40" font-weight="bold" text-anchor="middle" fill="white">${symbol.charAt(0)}</text>
</svg>`;
  return svg;
};

// Export function to create placeholder
module.exports = { createPlaceholderSVG };
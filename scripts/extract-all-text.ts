// scripts/extract-all-text.ts
// Run: npx ts-node scripts/extract-all-text.ts
// This will scan ALL your pages and extract text automatically

import * as fs from 'fs';
import * as path from 'path';

interface TranslationKeys {
  [key: string]: any;
}

const translations: TranslationKeys = {
  common: {},
  navigation: {
    home: "Home",
    markets: "Markets", 
    trade: "Trade",
    earn: "Earn",
    assets: "Assets"
  }
};

// Regex patterns to find text in your TSX files
const patterns = [
  // Button text: <button>Text</button>
  /<button[^>]*>([^<{]+)</g,
  // Span text: <span>Text</span>
  /<span[^>]*>([^<{]+)</g,
  // Div text: <div>Text</div>
  /<div[^>]*>([^<{]+)</g,
  // H1-H6: <h1>Text</h1>
  /<h[1-6][^>]*>([^<{]+)</g,
  // Paragraph: <p>Text</p>
  /<p[^>]*>([^<{]+)</g,
  // Label: <label>Text</label>
  /<label[^>]*>([^<{]+)</g,
  // Placeholder: placeholder="Text"
  /placeholder="([^"]+)"/g,
  // Title: title="Text"
  /title="([^"]+)"/g,
  // Alt: alt="Text"
  /alt="([^"]+)"/g,
];

function extractTextFromFile(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const foundText: string[] = [];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const text = match[1].trim();
      
      // Skip if:
      // - Empty
      // - Already has {t(
      // - Is a variable name (camelCase, UPPER_CASE)
      // - Is JSX component name
      // - Is a number
      // - Is very short (< 2 chars)
      if (
        text && 
        !text.includes('{') &&
        !text.includes('t(') &&
        !/^[a-z][a-zA-Z0-9_]*$/.test(text) && // camelCase
        !/^[A-Z_]+$/.test(text) && // UPPER_CASE
        !/^[A-Z][a-zA-Z0-9]*$/.test(text) && // PascalCase (component names)
        !/^\d+$/.test(text) && // pure numbers
        text.length > 2 &&
        !text.includes('className') &&
        !text.includes('onClick')
      ) {
        foundText.push(text);
      }
    }
  });

  return [...new Set(foundText)]; // Remove duplicates
}

function createKeyFromText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 40); // Max 40 chars
}

function scanDirectory(dirPath: string): void {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules, .next, etc.
      if (!['node_modules', '.next', '.git', 'public'].includes(file)) {
        scanDirectory(fullPath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      console.log(`Scanning: ${fullPath}`);
      
      // Get page name from filename
      const pageName = file.replace(/\.(tsx|jsx)$/, '').replace(/[^a-zA-Z0-9]/g, '');
      
      const texts = extractTextFromFile(fullPath);
      
      if (texts.length > 0) {
        // Create section for this page
        if (!translations[pageName]) {
          translations[pageName] = {};
        }

        texts.forEach(text => {
          const key = createKeyFromText(text);
          translations[pageName][key] = text;
        });

        console.log(`  Found ${texts.length} text strings`);
      }
    }
  });
}

function main() {
  console.log('🔍 Starting text extraction...\n');

  // Scan your app directory
  const appDir = path.join(process.cwd(), 'app');
  const componentsDir = path.join(process.cwd(), 'components');

  if (fs.existsSync(appDir)) {
    console.log('Scanning app/ directory...');
    scanDirectory(appDir);
  }

  if (fs.existsSync(componentsDir)) {
    console.log('\nScanning components/ directory...');
    scanDirectory(componentsDir);
  }

  // Save to file
  const outputPath = path.join(process.cwd(), 'public', 'locales', 'en.json');
  
  // Create directory if it doesn't exist
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  
  fs.writeFileSync(outputPath, JSON.stringify(translations, null, 2), 'utf-8');

  console.log('\n✅ Extraction complete!');
  console.log(`📄 Output: ${outputPath}`);
  console.log(`📊 Total sections: ${Object.keys(translations).length}`);
  
  let totalKeys = 0;
  Object.values(translations).forEach(section => {
    if (typeof section === 'object') {
      totalKeys += Object.keys(section).length;
    }
  });
  console.log(`🔑 Total translation keys: ${totalKeys}`);
  console.log('\n⚠️  IMPORTANT: Review the generated file and:');
  console.log('   1. Remove any false positives (variable names, etc.)');
  console.log('   2. Organize keys better if needed');
  console.log('   3. Add any missed text manually');
}

main();
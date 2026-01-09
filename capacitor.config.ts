import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'online.bybitglobal.app',
  appName: 'Bybit',
  webDir: 'public',
  server: {
    url: 'https://bybit-global.vercel.app',
    cleartext: true,
    androidScheme: 'https',
    iosScheme: 'https',
  }
};

export default config;
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'online.bybitglobal.app',
  appName: 'Bybit Global',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    url: 'https://b-ybit-global-h4vy-git-main-bybits-projects-94913575.vercel.app',
    cleartext: true
  }
};

export default config;
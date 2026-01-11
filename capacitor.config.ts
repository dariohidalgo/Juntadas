import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.juntadas.app',
  appName: 'Juntadas',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    hostname: 'localhost',
    iosScheme: 'ionic',
  },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"],
    },
  },
};

export default config;

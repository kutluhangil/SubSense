import type { CapacitorConfig } from '@capacitor/cli'

// Android shell around the same UI as the web and Mac apps (apps/web).
const config: CapacitorConfig = {
  appId: 'com.subsense.apps',
  appName: 'SubSense',
  webDir: 'dist',
  android: { path: '../android', backgroundColor: '#0d0e12' },
  backgroundColor: '#0d0e12',
  plugins: {
    SplashScreen: { launchShowDuration: 500, backgroundColor: '#0d0e12', showSpinner: false },
    // Native Google sign-in; web client id comes from google-services.json at build time.
    FirebaseAuthentication: { skipNativeAuth: false, providers: ['google.com'] },
  },
}

export default config

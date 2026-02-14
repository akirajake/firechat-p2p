import { FirebaseConfig } from './types';

// ============================================================================
// CONFIGURATION REQUIRED
// Please replace the values below with your Firebase Project configuration.
// You can find these in the Firebase Console -> Project Settings.
// ============================================================================

export const firebaseConfig: FirebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

/**
 * HELPER: Checks if the user has actually configured the app.
 */
export const isConfigured = (): boolean => {
  return firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";
};
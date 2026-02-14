import { FirebaseConfig } from './types';

// ============================================================================
// CONFIGURATION REQUIRED
// Please replace the values below with your Firebase Project configuration.
// You can find these in the Firebase Console -> Project Settings.
// ============================================================================

export const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyDB9juJs4Va01se4M0k3EWmIEHZMHmA6xs",
  authDomain: "firechat-db6ac.firebaseapp.com",
  projectId: "firechat-db6ac",
  storageBucket: "firechat-db6ac.firebasestorage.app",
  messagingSenderId: "417423419096",
  appId: "1:417423419096:web:02efa2a04e958378f799ad"
};
/*
{
  apiKey: "AIzaSyDB9juJs4Va01se4M0k3EWmIEHZMHmA6xs",
  authDomain: "firechat-db6ac.firebaseapp.com",
  projectId: "firechat-db6ac",
  storageBucket: "firechat-db6ac.firebasestorage.app",
  messagingSenderId: "417423419096",
  appId: "1:417423419096:web:02efa2a04e958378f799ad"
}
*/


/**
 * HELPER: Checks if the user has actually configured the app.
 */
export const isConfigured = (): boolean => {
  return firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";
};

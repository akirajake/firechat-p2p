export interface User {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: number;
}

export interface RoomData {
  roomId: string;
  hostId: string;
  createdAt: number;
  // Signaling data is stored here in Firestore
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'failed';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
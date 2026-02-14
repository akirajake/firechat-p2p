import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  addDoc,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { User, ChatMessage, ConnectionStatus } from '../types';

const ICE_SERVERS = {
  iceServers: [
    { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
  ],
};

export const useP2PChat = (roomId: string | null, user: User | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [isHost, setIsHost] = useState(false);
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const unsubscribers = useRef<(() => void)[]>([]);

  // Helper to cleanup listeners and connections
  const cleanup = useCallback(() => {
    unsubscribers.current.forEach(unsub => unsub());
    unsubscribers.current = [];
    
    if (dataChannel.current) {
      dataChannel.current.close();
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    
    peerConnection.current = null;
    dataChannel.current = null;
    setStatus('disconnected');
    setMessages([]);
  }, []);

  // Send message via DataChannel
  const sendMessage = useCallback((text: string) => {
    if (!dataChannel.current || dataChannel.current.readyState !== 'open' || !user) return;

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      text,
      senderId: user.uid,
      senderName: user.displayName || 'Anonymous',
      timestamp: Date.now(),
    };

    // Send over P2P
    dataChannel.current.send(JSON.stringify(message));
    
    // Update local UI immediately
    setMessages(prev => [...prev, message]);
  }, [user]);

  // Initialize WebRTC
  const joinRoom = useCallback(async (selectedRoomId: string) => {
    if (!user) return;
    cleanup();
    
    setStatus('connecting');
    const roomRef = doc(db, 'rooms', selectedRoomId);
    const roomSnapshot = await getDoc(roomRef);
    
    // Determine if host (room doesn't exist or we created it)
    // Note: For this simplified example, if the document exists but has no answer, we act as guest.
    // If it doesn't exist, we create it and act as host.
    const amIHost = !roomSnapshot.exists();
    setIsHost(amIHost);

    // Create PeerConnection
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnection.current = pc;

    // Handle Connection State
    pc.onconnectionstatechange = () => {
      console.log('Connection State:', pc.connectionState);
      if (pc.connectionState === 'connected') setStatus('connected');
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') setStatus('disconnected');
    };

    // 1. Setup Data Channel
    if (amIHost) {
      // Host creates the channel
      const dc = pc.createDataChannel('chat');
      setupDataChannel(dc);
      
      // Host creates Offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      // Save Offer to Firestore
      await setDoc(roomRef, { 
        offer: { type: offer.type, sdp: offer.sdp },
        hostId: user.uid,
        createdAt: Date.now()
      });
    } else {
      // Guest waits for data channel
      pc.ondatachannel = (event) => {
        setupDataChannel(event.channel);
      };
    }

    // 2. Handle ICE Candidates (Local)
    // We store candidates in subcollections
    const candidatesCollection = amIHost ? 'offerCandidates' : 'answerCandidates';
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(collection(roomRef, candidatesCollection), event.candidate.toJSON());
      }
    };

    // 3. Signaling Listeners (Remote)
    
    // Listen for Remote Session Description (Answer for Host, Offer for Guest)
    const unsubRoom = onSnapshot(roomRef, async (snapshot) => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data?.answer && amIHost) {
        const answer = new RTCSessionDescription(data.answer);
        await pc.setRemoteDescription(answer);
      } else if (!pc.currentRemoteDescription && data?.offer && !amIHost) {
        const offer = new RTCSessionDescription(data.offer);
        await pc.setRemoteDescription(offer);
        
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        await updateDoc(roomRef, {
          answer: { type: answer.type, sdp: answer.sdp }
        });
      }
    });
    unsubscribers.current.push(unsubRoom);

    // Listen for Remote ICE Candidates
    const remoteCandidatesCollection = amIHost ? 'answerCandidates' : 'offerCandidates';
    const unsubCandidates = onSnapshot(collection(roomRef, remoteCandidatesCollection), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.addIceCandidate(candidate);
        }
      });
    });
    unsubscribers.current.push(unsubCandidates);

  }, [user, cleanup]);

  const setupDataChannel = (dc: RTCDataChannel) => {
    dataChannel.current = dc;
    dc.onopen = () => setStatus('connected');
    dc.onclose = () => setStatus('disconnected');
    dc.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages(prev => [...prev, msg]);
    };
  };

  useEffect(() => {
    if (roomId) {
      joinRoom(roomId);
    }
    return () => cleanup();
  }, [roomId, joinRoom, cleanup]);

  return {
    messages,
    sendMessage,
    status,
    isHost
  };
};
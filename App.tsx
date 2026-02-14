import React, { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from './services/firebase';
import { isConfigured } from './firebaseConfig';
import { useP2PChat } from './hooks/useP2PChat';
import { User } from './types';
import { 
  Hash, 
  LogOut, 
  Send, 
  MessageSquare, 
  Wifi, 
  WifiOff, 
  Loader2,
  Users
} from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [inputRoomId, setInputRoomId] = useState('');
  const [msgText, setMsgText] = useState('');
  const [loading, setLoading] = useState(true);

  // Connection Hook
  const { messages, sendMessage, status, isHost } = useP2PChat(roomId, user);

  // Auth Listener
  useEffect(() => {
    if (!isConfigured()) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        });
      } else {
        setUser(null);
        setRoomId(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
      alert("Login failed. Check console and Firebase config.");
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRoomId.trim()) {
      setRoomId(inputRoomId.trim());
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (msgText.trim()) {
      sendMessage(msgText);
      setMsgText('');
    }
  };

  // --------------------------------------------------------------------------
  // RENDER: Configuration Error
  // --------------------------------------------------------------------------
  if (!isConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full border border-red-500">
          <h1 className="text-2xl font-bold mb-4 text-red-400">Configuration Required</h1>
          <p className="mb-4 text-gray-300">
            This app requires Firebase configuration to run.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400 mb-6">
            <li>Open <code className="bg-gray-900 p-1 rounded">firebaseConfig.ts</code></li>
            <li>Replace the placeholder values with your Firebase Project keys.</li>
            <li>Save the file and refresh this page.</li>
          </ol>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: Loading
  // --------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-discord-dark">
        <Loader2 className="w-10 h-10 animate-spin text-discord-accent" />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: Login Screen
  // --------------------------------------------------------------------------
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[url('https://picsum.photos/1920/1080?blur=10')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div className="relative z-10 p-8 bg-discord-element/90 rounded-2xl shadow-2xl border border-white/10 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-discord-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-discord-accent/50">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back!</h1>
          <p className="text-discord-muted mb-8">We're so excited to see you again!</p>
          
          <button
            onClick={handleLogin}
            className="w-full bg-discord-accent hover:bg-discord-accent/80 text-white font-medium py-3 px-4 rounded transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-[1.02]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: Room Selection
  // --------------------------------------------------------------------------
  if (!roomId) {
    return (
      <div className="min-h-screen bg-discord-dark flex">
        {/* Sidebar placeholder */}
        <div className="w-[72px] bg-discord-sidebar flex flex-col items-center py-3 gap-2">
          <div className="w-12 h-12 bg-discord-element rounded-[24px] hover:rounded-[16px] transition-all duration-300 flex items-center justify-center cursor-pointer group hover:bg-discord-accent">
            <MessageSquare className="text-discord-green group-hover:text-white transition-colors" size={28} />
          </div>
          <div className="h-[2px] w-8 bg-discord-element rounded-lg"></div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-discord-element rounded-tl-xl p-8 flex flex-col items-center justify-center">
          <div className="max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6 text-white text-center">Join or Create a Room</h2>
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-discord-muted uppercase mb-2">Room ID</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 text-discord-muted" size={20} />
                  <input
                    type="text"
                    value={inputRoomId}
                    onChange={(e) => setInputRoomId(e.target.value)}
                    className="w-full bg-discord-sidebar text-white p-2.5 pl-10 rounded border-none focus:ring-2 focus:ring-discord-accent outline-none"
                    placeholder="cool-room-123"
                    autoFocus
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-discord-accent hover:bg-indigo-600 text-white font-medium py-2.5 rounded transition-colors"
              >
                Enter Room
              </button>
            </form>
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
              <div className="flex items-center gap-2">
                <img 
                  src={user.photoURL || 'https://picsum.photos/32'} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full"
                />
                <div className="text-sm">
                  <div className="text-white font-medium">{user.displayName}</div>
                  <div className="text-discord-muted text-xs">#{user.uid.slice(0,4)}</div>
                </div>
              </div>
              <button 
                onClick={() => signOut(auth)}
                className="text-discord-muted hover:text-red-400 text-sm flex items-center gap-1 transition-colors"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: Chat Interface
  // --------------------------------------------------------------------------
  return (
    <div className="flex h-screen bg-discord-dark overflow-hidden font-sans">
      
      {/* Sidebar (Room List - Simplified) */}
      <div className="w-64 bg-discord-element flex flex-col hidden md:flex">
        <div className="h-12 shadow-sm flex items-center px-4 font-bold text-white border-b border-black/20">
          P2P Chat App
        </div>
        <div className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          <div className="px-2 py-1 text-xs font-bold text-discord-muted uppercase hover:text-white cursor-pointer">
            Text Channels
          </div>
          <div className="flex items-center px-2 py-1.5 bg-discord-element hover:bg-discord-dark/50 rounded cursor-pointer text-gray-400 hover:text-gray-200">
             <Hash size={20} className="mr-1.5 text-gray-500" />
             <span>general</span>
          </div>
          <div className="flex items-center px-2 py-1.5 bg-discord-element/50 bg-discord-accent/10 rounded cursor-pointer text-white">
             <Hash size={20} className="mr-1.5 text-white" />
             <span className="font-medium">{roomId}</span>
          </div>
        </div>
        
        {/* User User Bar */}
        <div className="bg-discord-sidebar/90 p-2 flex items-center gap-2">
          <div className="relative">
             <img src={user.photoURL || ''} alt="me" className="w-8 h-8 rounded-full hover:opacity-80 cursor-pointer" />
             <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-discord-sidebar rounded-full"></div>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-sm font-bold text-white truncate">{user.displayName}</div>
            <div className="text-xs text-gray-400 truncate">#{user.uid.slice(0, 4)}</div>
          </div>
          <button onClick={() => setRoomId(null)} className="p-1.5 hover:bg-discord-element rounded text-gray-400 hover:text-white">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-discord-dark relative">
        
        {/* Header */}
        <div className="h-12 border-b border-black/20 flex items-center px-4 justify-between bg-discord-dark shadow-sm z-10">
          <div className="flex items-center gap-2 overflow-hidden">
            <Hash className="text-gray-400 shrink-0" />
            <span className="font-bold text-white truncate">{roomId}</span>
            {isHost && <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30 uppercase tracking-wide">HOST</span>}
          </div>
          
          <div className="flex items-center gap-4">
             {/* Connection Status Indicator */}
            <div className={`flex items-center gap-1.5 text-sm font-medium transition-colors duration-300 ${
              status === 'connected' ? 'text-green-500' : 
              status === 'connecting' ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {status === 'connected' ? <Wifi size={16} /> : <WifiOff size={16} />}
              <span className="hidden sm:inline capitalize">{status}</span>
            </div>
            <Users className="text-discord-muted hover:text-white cursor-pointer transition-colors" size={24} />
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
          {messages.length === 0 && (
            <div className="mt-10 text-center">
               <div className="w-16 h-16 bg-discord-element rounded-full flex items-center justify-center mx-auto mb-4">
                 <Hash className="text-discord-accent w-10 h-10" />
               </div>
               <h3 className="text-2xl font-bold text-white mb-2">Welcome to #{roomId}!</h3>
               <p className="text-discord-muted">This is the start of the <span className="font-bold">{roomId}</span> channel.</p>
               {status !== 'connected' && (
                 <div className="mt-4 p-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-sm rounded inline-block">
                   Waiting for peer connection...
                 </div>
               )}
            </div>
          )}
          
          {messages.map((msg) => (
            <div key={msg.id} className="group flex gap-4 hover:bg-black/5 p-2 rounded -mx-2 transition-colors">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-lg select-none">
                {msg.senderName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-white hover:underline cursor-pointer">
                    {msg.senderName}
                  </span>
                  <span className="text-xs text-discord-muted">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-discord-text whitespace-pre-wrap break-words leading-relaxed">
                  {msg.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="px-4 pb-6 pt-2">
          <div className="bg-discord-element rounded-lg p-2.5 relative">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <button type="button" className="p-1 text-gray-400 hover:text-gray-200 transition-colors">
                <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-discord-element text-xs font-bold">+</div>
              </button>
              <input
                type="text"
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                placeholder={`Message #${roomId}`}
                className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none"
                disabled={status !== 'connected'}
              />
              <button 
                type="submit" 
                disabled={status !== 'connected' || !msgText.trim()}
                className={`p-2 rounded transition-colors ${
                  status === 'connected' && msgText.trim() 
                    ? 'text-discord-accent hover:text-white' 
                    : 'text-gray-600 cursor-not-allowed'
                }`}
              >
                <Send size={20} />
              </button>
            </form>
          </div>
          {status !== 'connected' && (
             <div className="text-center text-xs text-red-400 mt-2">
               You must be connected to a peer to send messages.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
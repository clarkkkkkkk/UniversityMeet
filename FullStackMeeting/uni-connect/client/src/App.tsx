import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalStream } from './hooks/useLocalStream';
import { useSignaling } from './hooks/useSignaling';
import VideoGrid from './components/VideoGrid';
import ChatBox from './components/ChatBox';
import { io } from 'socket.io-client';

export default function App() {
  const [roomId, setRoomId] = useState('class-101');
  const [displayName, setDisplayName] = useState('Student');
  const [joined, setJoined] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [messages, setMessages] = useState<Array<{ from: string, message: string }>>([]);


  const { streamRef, startLocalStream, stopLocalStream } = useLocalStream();
  const socketRef = useRef<any>(null);


  // callback when signaling hook receives remote stream
  const onRemoteStream = useCallback((peerId: string, stream: MediaStream) => {
    setRemoteStreams(s => ({ ...s, [peerId]: stream }));
  }, []);


  useSignaling(roomId, onRemoteStream);


  useEffect(() => {
    // small inline socket for chat (could reuse signaling socket)
    socketRef.current = io(import.meta.env.VITE_SIGNALING ?? 'http://localhost:4000');


    socketRef.current.on('chat-message', (m: any) => setMessages(msgs => [...msgs, { from: m.from, message: m.message }]));


    return () => { socketRef.current.disconnect(); };
  }, []);

  async function joinRoom() {
    await startLocalStream();
    (window as any).__UNI_LOCAL_STREAM = streamRef.current as MediaStream;
    socketRef.current.emit('join-room', { roomId, displayName });
    setJoined(true);
  }


  function leaveRoom() {
    socketRef.current.emit('leave-room', { roomId });
    stopLocalStream();
    (window as any).__UNI_LOCAL_STREAM = undefined;
    setRemoteStreams({});
    setJoined(false);
  }


  async function toggleScreenShare() {
    if (!streamRef.current) return;
    const screenStream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true });
    const screenTrack = screenStream.getVideoTracks()[0];


    // replace local track in all RTCPeerConnections
    // this project stores PCs in the signaling hook's internal map; for MVP we iterate global RTCPeerConnections
    // NOTE: In production, expose a better API to swap tracks per-peer.
    // simple approach: replace in all senders
    const pcs = (window as any).RTCPeerConnections || [];
    for (const pc of pcs) {
      const sender = pc.getSenders().find((s: RTCRtpSender) => s.track && s.track.kind === 'video');
      if (sender) await sender.replaceTrack(screenTrack);
    }


    // show screen locally
    const localVideoEl = document.getElementById('local') as HTMLVideoElement | null;
    if (localVideoEl) localVideoEl.srcObject = screenStream;


    screenTrack.onended = async () => {
      // revert to camera
      const camTrack = streamRef.current!.getVideoTracks()[0];
      for (const pc of pcs) {
        const sender = pc.getSenders().find((s: RTCRtpSender) => s.track && s.track.kind === 'video');
        if (sender) await sender.replaceTrack(camTrack);
      }
      if (localVideoEl) localVideoEl.srcObject = streamRef.current as MediaStream;
    };
  }

  function sendChat(message: string) {
    if (!message) return;
    socketRef.current.emit('chat-message', { roomId, message, from: displayName });
    setMessages(m => [...m, { from: displayName, message }]);
  }

  return (
    <div style={{ padding: 12, fontFamily: 'sans-serif' }}>
      <h2>UniConnect — MVP</h2>
      <div style={{ marginBottom: 8 }}>
        <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />
        <input value={roomId} onChange={e => setRoomId(e.target.value)} placeholder="Room ID" />
        {!joined ? <button onClick={joinRoom}>Join</button> : <button onClick={leaveRoom}>Leave</button>}
        <button onClick={toggleScreenShare} style={{ marginLeft: 6 }}>Share Screen</button>
      </div>


      <VideoGrid localStream={streamRef.current} remoteStreams={remoteStreams} />


      <div style={{ marginTop: 12 }}>
        <ChatBox onSend={sendChat} messages={messages} />
      </div>
    </div>
  );
}
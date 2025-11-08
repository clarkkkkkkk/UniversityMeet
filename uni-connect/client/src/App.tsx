// client/src/App.tsx
import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_SERVER = "http://localhost:4000";

interface SignalData {
  from: string;
  data: any;
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId, setRoomId] = useState<string>('class-101');
  const [joined, setJoined] = useState<boolean>(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const s: Socket = io(SOCKET_SERVER);
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);


  const startLocalStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
  };

  const joinRoom = async () => {
    if (!socket) return;
    await startLocalStream();
    socket.emit('join-room', { roomId, displayName: 'Student' });
    setJoined(true);
  };

  return (
    <div style={{ padding: '20px', margin: '0 auto', maxWidth: '800px' }}>
      <h1>UniConnect Demo (TypeScript)</h1>
      <input
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Room ID"
        style={{ padding: 5, marginRight: 10 }}
      />
      {!joined ? <button onClick={joinRoom}>Join Room</button> : <p>Joined Room!</p>}
      <div style={{ marginTop: 10 }}>
        <video ref={localVideoRef} autoPlay muted playsInline style={{ width: 300 }} />
      </div>
    </div>
  );
}

export default App;
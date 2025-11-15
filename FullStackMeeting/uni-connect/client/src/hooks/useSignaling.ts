import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';


const SIGNALING_SERVER = import.meta.env.VITE_SIGNALING ?? 'http://localhost:4000';


export function useSignaling(roomId: string, onRemoteStream: (peerId: string, stream: MediaStream) => void) {
    const socketRef = useRef<Socket | null>(null);
    const pcsRef = useRef<Record<string, RTCPeerConnection>>({});


    useEffect(() => {
        const s = io(SIGNALING_SERVER);
        socketRef.current = s;


        s.on('joined', async ({ you, others }: { you: string; others: string[] }) => {
            for (const peerId of others) {
                await createPeerConnection(peerId, true);
            }
        });


        s.on('new-peer', async ({ peerId }: { peerId: string }) => {
            await createPeerConnection(peerId, false);
        });


        s.on('signal', async ({ from, data }: {
            from: string;
            data: RTCSessionDescriptionInit | { candidate: RTCIceCandidateInit }
        }) => {
            const pc = pcsRef.current[from];
            if (!pc) return;

            if ('type' in data && (data.type === 'offer' || data.type === 'answer')) {
                await pc.setRemoteDescription(new RTCSessionDescription(data));
                if (data.type === 'offer') {
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    s.emit('signal', { to: from, from: s.id, data: pc.localDescription });
                }
            } else if ('candidate' in data) {
                try { await pc.addIceCandidate(new RTCIceCandidate(data.candidate)); } catch (e) { console.warn(e); }
            }
        });



        s.on('peer-left', ({ peerId }: { peerId: string }) => {
            const pc = pcsRef.current[peerId];
            if (pc) {
                try { pc.close(); } catch (e) { }
                delete pcsRef.current[peerId];
            }
        });


        return () => {
            s.disconnect();
            for (const id of Object.keys(pcsRef.current)) {
                try { pcsRef.current[id].close(); } catch (e) { }
            }
        };


        // Helper: createPeerConnection
        async function createPeerConnection(peerId: string, initiator: boolean) {
            if (!socketRef.current) return;
            if (pcsRef.current[peerId]) return pcsRef.current[peerId];



            const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
            pcsRef.current[peerId] = pc;


            pc.onicecandidate = (e) => {
                if (e.candidate) socketRef.current!.emit('signal', { to: peerId, from: socketRef.current!.id, data: { candidate: e.candidate } });
            };


            pc.ontrack = (e) => {
                const stream = e.streams[0];
                onRemoteStream(peerId, stream);
            };


            // attach local tracks if available
            const localStream = (window as any).__UNI_LOCAL_STREAM as MediaStream | undefined;
            if (localStream) for (const t of localStream.getTracks()) pc.addTrack(t, localStream);


            if (initiator) {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socketRef.current!.emit('signal', { to: peerId, from: socketRef.current!.id, data: pc.localDescription });
            }


            return pc;
        }
    }, [roomId, onRemoteStream]);
}
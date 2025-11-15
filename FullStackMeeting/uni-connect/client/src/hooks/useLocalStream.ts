import { useRef } from 'react';


export function useLocalStream() {
    const streamRef = useRef<MediaStream | null>(null);


    async function startLocalStream() {
        if (streamRef.current) return streamRef.current;
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        return stream;
    }


    function stopLocalStream() {
        if (!streamRef.current) return;
        for (const t of streamRef.current.getTracks()) t.stop();
        streamRef.current = null;
    }


    return { streamRef, startLocalStream, stopLocalStream };
}
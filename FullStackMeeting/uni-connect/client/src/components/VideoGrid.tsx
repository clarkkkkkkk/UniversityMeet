import React from 'react';


interface VideoGridProps {
    localStream?: MediaStream | null;
    remoteStreams: Record<string, MediaStream>;
}


export default function VideoGrid({ localStream, remoteStreams }: VideoGridProps) {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            <div style={{ margin: 6 }}>
                <video id="local" autoPlay muted playsInline style={{ width: 300 }} ref={(el) => { if (el && localStream) el.srcObject = localStream; }} />
            </div>
            {Object.entries(remoteStreams).map(([id, stream]) => (
                <div key={id} style={{ margin: 6 }}>
                    <video autoPlay playsInline ref={(el) => { if (el) el.srcObject = stream; }} style={{ width: 300 }} />
                </div>
            ))}
        </div>
    );
}
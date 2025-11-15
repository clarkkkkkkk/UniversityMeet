import React, { useState } from 'react';


interface ChatBoxProps { onSend: (msg: string) => void; messages: Array<{ from: string, message: string }> }


export default function ChatBox({ onSend, messages }: ChatBoxProps) {
    const [text, setText] = useState('');
    return (
        <div style={{ width: 350 }}>
            <div style={{ height: 200, overflowY: 'auto', border: '1px solid #ddd', padding: 8 }}>
                {messages.map((m, i) => <div key={i}><b>{m.from}</b>: {m.message}</div>)}
            </div>
            <div style={{ marginTop: 8 }}>
                <input value={text} onChange={e => setText(e.target.value)} style={{ width: '70%' }} />
                <button onClick={() => { onSend(text); setText(''); }}>Send</button>
            </div>
        </div>
    );
}
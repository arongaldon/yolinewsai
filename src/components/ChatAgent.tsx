'use client';
import { useState, useRef, useEffect } from 'react';

export default function ChatAgent() {
    const [messages, setMessages] = useState<{ role: string, content: string }[]>([
        { role: 'assistant', content: "Hi! I'm Yoli. Ask me anything about today's news headlines." }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const [newsContext, setNewsContext] = useState<any>(null);

    // Load news context
    useEffect(() => {
        fetch('/api/news')
            .then(res => res.json())
            .then(data => setNewsContext(data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].filter(m => m.role !== 'system'),
                    context: newsContext
                })
            });

            const data = await response.json();

            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I had trouble reaching my brain. Try again later." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel flex-col" style={{ height: 'calc(100vh - 4rem)', position: 'sticky', top: '2rem' }}>
            <h2 className="mb-4" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                Agent <span className="text-gradient">Yoli</span>
            </h2>

            <div
                ref={scrollRef}
                className="chat-container mb-4"
                style={{ flex: 1, overflowY: 'auto' }}
            >
                {messages.map((msg, i) => (
                    <div key={i} className={`message ${msg.role === 'user' ? 'message-user' : 'message-assistant'}`}>
                        {/* Simple markdown parsing for links in the chat */}
                        <div dangerouslySetInnerHTML={{
                            __html: msg.content.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
                        }} />
                    </div>
                ))}
                {loading && (
                    <div className="message message-assistant flex items-center gap-3">
                        <span className="spinner spinner-sm"></span>
                        <span className="text-sm">Analyzing intel...</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-3" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask me anything about today's news..."
                    className="input-premium"
                    disabled={loading}
                />
                <button type="submit" className="btn btn-primary btn-icon flex items-center justify-center flex-shrink-0" disabled={loading}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </form>
        </div>
    );
}

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
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4rem)', position: 'sticky', top: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                Agent Yoli
            </h2>

            <div
                ref={scrollRef}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    paddingRight: '0.5rem',
                    marginBottom: '1rem'
                }}
            >
                {messages.map((msg, i) => (
                    <div key={i} style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        background: msg.role === 'user' ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-purple))' : 'rgba(255, 255, 255, 0.05)',
                        border: msg.role !== 'user' ? '1px solid var(--border-color)' : 'none',
                        padding: '1rem',
                        borderRadius: msg.role === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                        maxWidth: '85%',
                        lineHeight: '1.5',
                        fontSize: '0.95rem'
                    }}>
                        {/* Simple markdown parsing for links in the chat */}
                        <div dangerouslySetInnerHTML={{
                            __html: msg.content.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: var(--accent-primary); text-decoration: underline;">$1</a>')
                        }} />
                    </div>
                ))}
                {loading && (
                    <div style={{ alignSelf: 'flex-start', background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '16px 16px 16px 0', fontSize: '0.9rem' }}>
                        <span className="spinner" style={{ width: '20px', height: '20px', display: 'inline-block', borderWidth: '2px', marginRight: '8px', verticalAlign: 'middle' }}></span>
                        Analyzing...
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    style={{
                        flex: 1,
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        padding: '1rem',
                        borderRadius: '99px',
                        fontFamily: 'inherit',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                />
                <button type="submit" className="btn btn-primary" style={{ width: '50px', height: '50px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} disabled={loading}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </form>
        </div>
    );
}

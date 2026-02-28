'use client';
import { useState, useEffect } from 'react';

export default function Dashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadNews() {
            try {
                const response = await fetch('/api/news');
                const json = await response.json();
                setData(json);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadNews();
    }, []);

    if (loading) {
        return (
            <div className="loader-container glass-panel">
                <div className="spinner"></div>
                <p>Aggregating reliable sources...</p>
            </div>
        );
    }

    if (!data || !data.articles) {
        return (
            <div className="glass-panel">
                <h2>Failed to load news.</h2>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="glass-panel" style={{ marginBottom: '2rem' }}>
                <h1>YoliNews Daily</h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                    {data.summary?.overview}
                </p>

                <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>Key Priorities</h3>
                <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                    {data.summary?.keyPoints?.map((point: string, i: number) => (
                        <li key={i} style={{ marginBottom: '0.5rem' }}>{point}</li>
                    ))}
                </ul>
            </div>

            <h2 style={{ marginBottom: '1.5rem' }}>Top Verified Headlines</h2>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {data.articles.map((article: any) => (
                    <div key={article.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.25rem', lineHeight: '1.4', flex: 1, marginRight: '1rem' }}>
                                <a href={article.link} target="_blank" rel="noopener noreferrer" style={{ cursor: 'pointer' }}>
                                    {article.title}
                                </a>
                            </h3>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    background: 'rgba(255,255,255,0.1)',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {article.source}
                                </span>
                                {article.isPaywalled && (
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        background: 'rgba(245, 158, 11, 0.2)',
                                        color: 'var(--warning)',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        $ Paywall
                                    </span>
                                )}
                            </div>
                        </div>

                        <p style={{ fontSize: '0.9rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {article.contentSnippet}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Bias Alignment:</span>
                                <span style={{
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.85rem',
                                    background: article.biasScore < -2 ? 'rgba(59, 130, 246, 0.2)' : article.biasScore > 2 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                    color: article.biasScore < -2 ? 'var(--accent-primary)' : article.biasScore > 2 ? 'var(--danger)' : 'var(--success)',
                                }}>
                                    {article.biasScore === 0 ? 'Center' : article.biasScore > 0 ? `Right (+${article.biasScore})` : `Left (${article.biasScore})`}
                                </span>
                            </div>
                            <a href={article.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                                Read Full Story
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

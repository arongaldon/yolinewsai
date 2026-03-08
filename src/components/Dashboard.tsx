'use client';
import { useState, useEffect } from 'react';

export default function Dashboard({ dict, lang }: { dict: any, lang: string }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadNews() {
            try {
                const response = await fetch(`/api/news?lang=${lang}`);
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
            <div className="loader-container">
                <div className="spinner"></div>
                <p className="loader-text">{dict.loading}</p>
            </div>
        );
    }

    if (!data || !data.articles) {
        return (
            <div className="glass-panel animate-fly-in">
                <h2>{dict.failedLoad}</h2>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="glass-panel mb-4 animate-fly-in" style={{ animationDelay: '0ms' }}>
                <h1>{dict.title.split(' ')[0]} <span className="text-gradient">{dict.title.split(' ')[1] || ''}</span></h1>
                <p className="mb-3" style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                    {data.summary?.overview}
                </p>

                <h3 className="mb-2 text-gradient">{dict.priorities}</h3>
                <ul className="bullet-list">
                    {data.summary?.keyPoints?.map((point: string, i: number) => (
                        <li key={i}>{point}</li>
                    ))}
                </ul>
            </div>

            <h2 className="animate-fly-in" style={{ animationDelay: '100ms' }}>{dict.topHeadlines}</h2>
            <div className="flex flex-col gap-6">
                {data.articles.map((article: any, index: number) => (
                    <div
                        key={article.id}
                        className="article-card animate-fly-in"
                        style={{ animationDelay: `${150 + index * 50}ms` }}
                    >
                        <div className="flex justify-between items-start mb-3 gap-4">
                            <div className="flex-1 min-w-0">
                                <h3 className="mb-2" style={{ lineHeight: '1.4' }}>
                                    <a href={article.link} target="_blank" rel="noopener noreferrer" className="article-title-link">
                                        {article.title}
                                    </a>
                                </h3>
                                <div className="flex gap-2 items-center flex-wrap">
                                    <span className="badge badge-source">{article.source}</span>
                                    <span className="text-xs" style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                        {new Date(article.pubDate).toLocaleString(lang, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {article.isPaywalled && (
                                        <span className="badge badge-warning">
                                            {dict.paywall}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {article.image && (
                                <img 
                                    src={article.image} 
                                    alt="" 
                                    loading="lazy"
                                    style={{ width: '120px', height: '84px', objectFit: 'cover', borderRadius: '12px', flexShrink: 0, border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                            )}
                        </div>

                        <p className="mb-3 text-sm" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {article.contentSnippet}
                        </p>

                        <div className="flex items-center justify-between" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                            <div className="flex items-center gap-2">
                                <span className="text-sm fw-500" style={{ color: 'var(--text-secondary)' }}>{dict.biasAlignment}</span>
                                <span className={`badge ${article.biasScore < -2 ? 'badge-left' : article.biasScore > 2 ? 'badge-right' : 'badge-center'}`}>
                                    {article.biasScore === 0 ? dict.biasCenter : article.biasScore > 0 ? `${dict.biasRight} (+${article.biasScore})` : `${dict.biasLeft} (${article.biasScore})`}
                                </span>
                            </div>
                            <a href={article.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary text-sm">
                                {dict.readFullStory}
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

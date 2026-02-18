import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import type { Post } from '../../../types';

interface ContentCalendarProps {
    posts: Post[];
    clientName: string;
}

const ContentCalendar: React.FC<ContentCalendarProps> = ({ posts, clientName }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const adjustedFirst = firstDay === 0 ? 6 : firstDay - 1; // Monday first

    const getPostsForDay = (day: number) => {
        return posts.filter(p => {
            const d = new Date(p.scheduledTime || p.createdAt);
            return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
        });
    };

    const statusColor: Record<string, string> = {
        posted: '#10b981',
        scheduled: '#6366f1',
        draft: '#f59e0b',
        failed: '#ef4444',
    };

    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

    return (
        <>
            <div className="section-header">
                <h2 className="section-title">
                    <Calendar size={20} style={{ marginRight: '8px' }} />
                    İçerik Takvimi — {clientName}
                </h2>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                {/* Month Navigator */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: 'var(--spacing-md) var(--spacing-lg)',
                    borderBottom: '1px solid var(--border-color)',
                }}>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setCurrentMonth(new Date(year, month - 1))}
                    >
                        ← Önceki
                    </button>
                    <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                        {monthNames[month]} {year}
                    </h3>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setCurrentMonth(new Date(year, month + 1))}
                    >
                        Sonraki →
                    </button>
                </div>

                {/* Day Headers */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                    borderBottom: '1px solid var(--border-color)',
                }}>
                    {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map(d => (
                        <div key={d} style={{
                            textAlign: 'center', padding: 'var(--spacing-sm)',
                            fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)',
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>
                            {d}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                    minHeight: '400px',
                }}>
                    {/* Empty cells before month start */}
                    {Array.from({ length: adjustedFirst }).map((_, i) => (
                        <div key={`empty-${i}`} style={{
                            borderRight: '1px solid var(--border-color)',
                            borderBottom: '1px solid var(--border-color)',
                            background: 'var(--bg-tertiary)',
                            opacity: 0.4,
                        }} />
                    ))}

                    {/* Day cells */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dayPosts = getPostsForDay(day);
                        const isToday = new Date().getDate() === day &&
                            new Date().getMonth() === month &&
                            new Date().getFullYear() === year;

                        return (
                            <div
                                key={day}
                                style={{
                                    padding: '4px',
                                    minHeight: '72px',
                                    borderRight: '1px solid var(--border-color)',
                                    borderBottom: '1px solid var(--border-color)',
                                    background: isToday ? 'rgba(124, 58, 237, 0.05)' : 'transparent',
                                    position: 'relative',
                                }}
                            >
                                <div style={{
                                    fontSize: '0.75rem',
                                    fontWeight: isToday ? 700 : 500,
                                    color: isToday ? '#7C3AED' : 'var(--text-secondary)',
                                    marginBottom: '2px',
                                    padding: '2px 4px',
                                }}>
                                    {day}
                                </div>
                                {dayPosts.slice(0, 3).map(post => (
                                    <div
                                        key={post.id}
                                        style={{
                                            fontSize: '0.6rem',
                                            padding: '2px 4px',
                                            borderRadius: '3px',
                                            marginBottom: '1px',
                                            background: `${statusColor[post.status] || '#6366f1'}15`,
                                            borderLeft: `2px solid ${statusColor[post.status] || '#6366f1'}`,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            color: 'var(--text-primary)',
                                        }}
                                        title={post.title}
                                    >
                                        {post.title}
                                    </div>
                                ))}
                                {dayPosts.length > 3 && (
                                    <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', padding: '0 4px' }}>
                                        +{dayPosts.length - 3} daha
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div style={{
                    display: 'flex', gap: 'var(--spacing-lg)', padding: 'var(--spacing-sm) var(--spacing-lg)',
                    borderTop: '1px solid var(--border-color)', flexWrap: 'wrap',
                }}>
                    {Object.entries({ 'Gönderildi': '#10b981', 'Planlandı': '#6366f1', 'Taslak': '#f59e0b', 'Başarısız': '#ef4444' })
                        .map(([label, color]) => (
                            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color }} />
                                <span className="text-muted">{label}</span>
                            </div>
                        ))}
                </div>
            </div>
        </>
    );
};

export default ContentCalendar;

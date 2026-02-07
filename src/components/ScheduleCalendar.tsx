import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import type { Post } from '../types';

const ScheduleCalendar: React.FC = () => {
    const { posts } = useDashboard();
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday = 0

        return { daysInMonth, startingDay };
    };

    const { daysInMonth, startingDay } = getDaysInMonth(currentDate);

    const getPostsForDay = (day: number): Post[] => {
        return posts.filter((post) => {
            const postDate = new Date(post.scheduledTime);
            return (
                postDate.getDate() === day &&
                postDate.getMonth() === currentDate.getMonth() &&
                postDate.getFullYear() === currentDate.getFullYear()
            );
        });
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const isToday = (day: number) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear()
        );
    };

    const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    const monthNames = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];

    // Create calendar grid
    const calendarDays = [];

    // Previous month days
    const prevMonthDays = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
        calendarDays.push({ day: prevMonthDays - i, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push({ day: i, isCurrentMonth: true });
    }

    // Next month days
    const remainingDays = 42 - calendarDays.length; // 6 rows x 7 days
    for (let i = 1; i <= remainingDays; i++) {
        calendarDays.push({ day: i, isCurrentMonth: false });
    }

    return (
        <div className="calendar">
            <div className="calendar-header">
                <button className="btn btn-ghost btn-icon" onClick={prevMonth}>
                    <ChevronLeft size={18} />
                </button>
                <h3 style={{ fontWeight: 600 }}>
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <button className="btn btn-ghost btn-icon" onClick={nextMonth}>
                    <ChevronRight size={18} />
                </button>
            </div>

            <div className="calendar-grid">
                {dayNames.map((day) => (
                    <div key={day} className="calendar-day-header">
                        {day}
                    </div>
                ))}

                {calendarDays.map((item, index) => {
                    const dayPosts = item.isCurrentMonth ? getPostsForDay(item.day) : [];
                    const scheduledPosts = dayPosts.filter((p) => p.status === 'scheduled');
                    const postedPosts = dayPosts.filter((p) => p.status === 'posted');

                    return (
                        <div
                            key={index}
                            className={`calendar-day ${!item.isCurrentMonth ? 'other-month' : ''} ${item.isCurrentMonth && isToday(item.day) ? 'today' : ''
                                } ${dayPosts.length > 0 ? 'has-posts' : ''}`}
                        >
                            <span>{item.day}</span>
                            {item.isCurrentMonth && dayPosts.length > 0 && (
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '2px',
                                        marginTop: '2px',
                                    }}
                                >
                                    {scheduledPosts.length > 0 && (
                                        <span
                                            style={{
                                                width: '4px',
                                                height: '4px',
                                                borderRadius: '50%',
                                                background: 'var(--info)',
                                            }}
                                        />
                                    )}
                                    {postedPosts.length > 0 && (
                                        <span
                                            style={{
                                                width: '4px',
                                                height: '4px',
                                                borderRadius: '50%',
                                                background: 'var(--success)',
                                            }}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 'var(--spacing-md)',
                    paddingTop: 'var(--spacing-md)',
                    borderTop: '1px solid var(--border-color)',
                }}
            >
                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                    <div className="legend-item">
                        <span className="legend-dot" style={{ background: 'var(--info)' }} />
                        <span style={{ fontSize: '0.75rem' }}>Planlandı</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-dot" style={{ background: 'var(--success)' }} />
                        <span style={{ fontSize: '0.75rem' }}>Gönderildi</span>
                    </div>
                </div>
                <button className="btn btn-primary btn-sm">
                    <Plus size={14} />
                    <span>Post Planla</span>
                </button>
            </div>
        </div>
    );
};

export default ScheduleCalendar;

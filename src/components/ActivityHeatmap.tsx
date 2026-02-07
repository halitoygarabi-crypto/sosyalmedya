import React from 'react';
import { hourlyActivityData } from '../data/mockData';

const ActivityHeatmap: React.FC = () => {
    const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const getLevel = (count: number): number => {
        if (count === 0) return 0;
        if (count < 5) return 1;
        if (count < 10) return 2;
        if (count < 15) return 3;
        if (count < 20) return 4;
        return 5;
    };

    const getDataForDayAndHour = (day: string, hour: number) => {
        return hourlyActivityData.find((d) => d.day === day && d.hour === hour);
    };

    return (
        <div className="chart-container">
            <div className="chart-header">
                <h3 className="chart-title">Saatlik Aktivite Haritası</h3>
                <div className="chart-legend">
                    <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Az</span>
                    {[0, 1, 2, 3, 4, 5].map((level) => (
                        <div
                            key={level}
                            className={`heatmap-cell level-${level}`}
                            style={{ width: '10px', height: '10px' }}
                        />
                    ))}
                    <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Çok</span>
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <div className="heatmap" style={{ minWidth: '600px' }}>
                    {/* Hour labels */}
                    <div className="heatmap-row" style={{ marginBottom: '4px' }}>
                        <div className="heatmap-label" />
                        {hours.map((hour) => (
                            <div
                                key={hour}
                                style={{
                                    width: '14px',
                                    fontSize: '0.5rem',
                                    textAlign: 'center',
                                    color: 'var(--text-muted)',
                                }}
                            >
                                {hour % 4 === 0 ? `${hour}` : ''}
                            </div>
                        ))}
                    </div>

                    {/* Day rows */}
                    {days.map((day) => (
                        <div key={day} className="heatmap-row">
                            <div className="heatmap-label">{day}</div>
                            {hours.map((hour) => {
                                const data = getDataForDayAndHour(day, hour);
                                const count = data?.count || 0;
                                const level = getLevel(count);
                                return (
                                    <div
                                        key={`${day}-${hour}`}
                                        className={`heatmap-cell level-${level}`}
                                        title={`${day} ${hour}:00 - ${count} aktivite`}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: 'var(--spacing-md)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                }}
            >
                <span>En aktif saat: 19:00 - 21:00</span>
                <span>En aktif gün: Çarşamba</span>
            </div>
        </div>
    );
};

export default ActivityHeatmap;

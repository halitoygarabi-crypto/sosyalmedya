import React from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { useDashboard } from '../context/DashboardContext';
import { formatNumber, getPlatformName } from '../utils/helpers';


// Custom tooltip styles
const customTooltipStyle = {
    background: 'rgba(18, 20, 30, 0.95)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '12px',
    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
};

// Engagement Trend Line Chart
export const EngagementTrendChart: React.FC = () => {
    const { dailyEngagement } = useDashboard();
    return (
        <div className="chart-container">
            <div className="chart-header">
                <h3 className="chart-title">Engagement Trendi (Son 30 Gün)</h3>
                <div className="chart-legend">
                    <div className="legend-item">
                        <span className="legend-dot" style={{ background: '#ccff00' }} />
                        <span>Beğeni</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-dot" style={{ background: '#00ffff' }} />
                        <span>Yorum</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-dot" style={{ background: '#ffffff' }} />
                        <span>Paylaşım</span>
                    </div>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyEngagement}>
                    <defs>
                        <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ccff00" stopOpacity={0.6} />
                            <stop offset="95%" stopColor="#ccff00" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="var(--text-muted)"
                        axisLine={false}
                        tickLine={false}
                        fontSize={10}
                        tickFormatter={(value) => {
                            const date = new Date(value);
                            const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
                            return date.toLocaleDateString('tr-TR', options);
                        }}
                        dy={10}
                    />
                    <YAxis 
                        stroke="var(--text-muted)" 
                        axisLine={false}
                        tickLine={false}
                        fontSize={10} 
                        tickFormatter={(v) => formatNumber(v)} 
                    />
                    <Tooltip
                        contentStyle={customTooltipStyle}
                        labelStyle={{ color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 600 }}
                        itemStyle={{ padding: '2px 0' }}
                        cursor={{ stroke: 'rgba(204, 255, 0, 0.2)', strokeWidth: 2 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="likes"
                        stroke="#ccff00"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorEngagement)"
                        name="Beğeni"
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

// Platform Distribution Pie Chart
export const PlatformDistributionChart: React.FC = () => {
    const { platformStats } = useDashboard();
    const data = platformStats.map((stat) => ({
        name: getPlatformName(stat.platform),
        value: stat.postsCount,
        color: stat.platform === 'instagram' ? '#ccff00' : 
               stat.platform === 'twitter' ? '#00ffff' : 
               stat.platform === 'linkedin' ? '#ffffff' : '#ccff00',
    }));

    return (
        <div className="chart-container">
            <div className="chart-header">
                <h3 className="chart-title">Platform Dağılımı</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={customTooltipStyle}
                        formatter={(value) => [`${value ?? 0} post`, 'Post Sayısı']}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="chart-legend" style={{ justifyContent: 'center', marginTop: '16px' }}>
                {data.map((item) => (
                    <div key={item.name} className="legend-item">
                        <span className="legend-dot" style={{ background: item.color }} />
                        <span>{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Platform Comparison Bar Chart
export const PlatformComparisonChart: React.FC = () => {
    const { platformStats } = useDashboard();
    const data = platformStats.map((stat) => ({
        platform: getPlatformName(stat.platform),
        reach: stat.reach / 1000,
        engagement: stat.avgEngagementRate * 100,
    }));

    return (
        <div className="chart-container">
            <div className="chart-header">
                <h3 className="chart-title">Platform Karşılaştırması</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} barGap={12} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                        dataKey="platform" 
                        stroke="var(--text-muted)" 
                        fontSize={10} 
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                    />
                    <YAxis 
                        stroke="var(--text-muted)" 
                        fontSize={10} 
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={customTooltipStyle}
                        cursor={{fill: 'rgba(255,255,255,0.03)'}}
                    />
                    <Bar 
                        dataKey="reach" 
                        fill="#ccff00" 
                        radius={[6, 6, 0, 0]} 
                        barSize={40}
                        name="Erişim (K)" 
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

// Reach Trend Line Chart
export const ReachTrendChart: React.FC = () => {
    const { dailyEngagement } = useDashboard();
    return (
        <div className="chart-container">
            <div className="chart-header">
                <h3 className="chart-title">Erişim Trendi</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyEngagement}>
                    <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="var(--text-muted)"
                        axisLine={false}
                        tickLine={false}
                        fontSize={10}
                        tickFormatter={(value) => {
                            const date = new Date(value);
                            return `${date.getDate()}/${date.getMonth() + 1}`;
                        }}
                        dy={10}
                    />
                    <YAxis 
                        stroke="var(--text-muted)" 
                        axisLine={false}
                        tickLine={false}
                        fontSize={10} 
                        tickFormatter={(v) => formatNumber(v)} 
                    />
                    <Tooltip
                        contentStyle={customTooltipStyle}
                        formatter={(value) => [formatNumber((value as number) ?? 0), 'Erişim']}
                    />
                    <Line
                        type="monotone"
                        dataKey="reach"
                        stroke="#00ffff"
                        strokeWidth={4}
                        dot={false}
                        activeDot={{ r: 6, fill: '#00ffff', stroke: 'white', strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

// Follower Growth Chart
export const FollowerGrowthChart: React.FC = () => {
    const { platformStats } = useDashboard();

    // Generate follower growth data for last 30 days based on platformStats
    const data = React.useMemo(() => {
        const history = [];
        const today = new Date();

        const ig = platformStats.find(s => s.platform === 'instagram');
        const tw = platformStats.find(s => s.platform === 'twitter' || (s.platform as string) === 'x');
        const li = platformStats.find(s => s.platform === 'linkedin');

        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            history.push({
                date: dateStr,
                instagram: ig ? Math.round(Math.max(0, ig.followers - (i * (ig.followerGrowth / 30)))) : 0,
                twitter: tw ? Math.round(Math.max(0, tw.followers - (i * (tw.followerGrowth / 30)))) : 0,
                linkedin: li ? Math.round(Math.max(0, li.followers - (i * (li.followerGrowth / 30)))) : 0,
            });
        }
        return history;
    }, [platformStats]);

    return (
        <div className="chart-container">
            <div className="chart-header">
                <h3 className="chart-title">Takipçi Büyümesi</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="var(--text-muted)"
                        axisLine={false}
                        tickLine={false}
                        fontSize={10}
                        tickFormatter={(value) => {
                            const date = new Date(value);
                            return `${date.getDate()}/${date.getMonth() + 1}`;
                        }}
                        dy={10}
                    />
                    <YAxis 
                        stroke="var(--text-muted)" 
                        axisLine={false}
                        tickLine={false}
                        fontSize={10} 
                        tickFormatter={(v) => formatNumber(v)} 
                    />
                    <Tooltip
                        contentStyle={customTooltipStyle}
                        labelStyle={{ color: 'var(--text-primary)', marginBottom: '4px' }}
                    />
                    <Legend iconType="circle" />
                    <Line type="monotone" dataKey="instagram" stroke="#ccff00" strokeWidth={3} dot={false} name="Instagram" />
                    <Line type="monotone" dataKey="twitter" stroke="#00ffff" strokeWidth={3} dot={false} name="Twitter/X" />
                    <Line type="monotone" dataKey="linkedin" stroke="#ffffff" strokeWidth={3} dot={false} name="LinkedIn" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

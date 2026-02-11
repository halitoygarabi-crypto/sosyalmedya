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
import { formatNumber, getPlatformColor, getPlatformName } from '../utils/helpers';


// Custom tooltip styles
const customTooltipStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '12px',
    boxShadow: 'var(--shadow-lg)',
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
                        <span className="legend-dot" style={{ background: '#6366f1' }} />
                        <span>Beğeni</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-dot" style={{ background: '#10b981' }} />
                        <span>Yorum</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-dot" style={{ background: '#f59e0b' }} />
                        <span>Paylaşım</span>
                    </div>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyEngagement}>
                    <defs>
                        <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorShares" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis
                        dataKey="date"
                        stroke="var(--text-muted)"
                        fontSize={12}
                        tickFormatter={(value) => {
                            const date = new Date(value);
                            return `${date.getDate()}/${date.getMonth() + 1}`;
                        }}
                    />
                    <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => formatNumber(v)} />
                    <Tooltip
                        contentStyle={customTooltipStyle}
                        labelStyle={{ color: 'var(--text-primary)' }}
                        formatter={(value) => [formatNumber(value as number ?? 0), '']}
                    />
                    <Area
                        type="monotone"
                        dataKey="likes"
                        stroke="#6366f1"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorLikes)"
                        name="Beğeni"
                    />
                    <Area
                        type="monotone"
                        dataKey="comments"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorComments)"
                        name="Yorum"
                    />
                    <Area
                        type="monotone"
                        dataKey="shares"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorShares)"
                        name="Paylaşım"
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
        color: getPlatformColor(stat.platform),
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
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        labelLine={false}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
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
        engagement: stat.avgEngagementRate * 10000,
        color: getPlatformColor(stat.platform),
    }));

    return (
        <div className="chart-container">
            <div className="chart-header">
                <h3 className="chart-title">Platform Karşılaştırması</h3>
                <div className="chart-legend">
                    <div className="legend-item">
                        <span className="legend-dot" style={{ background: '#6366f1' }} />
                        <span>Erişim (K)</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-dot" style={{ background: '#10b981' }} />
                        <span>Engagement</span>
                    </div>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="platform" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip
                        contentStyle={customTooltipStyle}
                        formatter={(value, name) => {
                            const numValue = (value as number) ?? 0;
                            return [
                                name === 'reach' ? `${numValue.toFixed(0)}K` : numValue.toFixed(0),
                                name === 'reach' ? 'Erişim' : 'Engagement',
                            ];
                        }}
                    />
                    <Bar dataKey="reach" fill="#6366f1" radius={[4, 4, 0, 0]} name="reach" />
                    <Bar dataKey="engagement" fill="#10b981" radius={[4, 4, 0, 0]} name="engagement" />
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
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis
                        dataKey="date"
                        stroke="var(--text-muted)"
                        fontSize={12}
                        tickFormatter={(value) => {
                            const date = new Date(value);
                            return `${date.getDate()}/${date.getMonth() + 1}`;
                        }}
                    />
                    <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => formatNumber(v)} />
                    <Tooltip
                        contentStyle={customTooltipStyle}
                        formatter={(value) => [formatNumber((value as number) ?? 0), 'Erişim']}
                    />
                    <Line
                        type="monotone"
                        dataKey="reach"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, fill: '#8b5cf6' }}
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
        const tt = platformStats.find(s => s.platform === 'tiktok');

        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // Project backwards from current followers using growth rate (simple linear projection)
            // growth / 30 gives a rough daily average
            history.push({
                date: dateStr,
                instagram: ig ? Math.round(Math.max(0, ig.followers - (i * (ig.followerGrowth / 30)))) : 0,
                twitter: tw ? Math.round(Math.max(0, tw.followers - (i * (tw.followerGrowth / 30)))) : 0,
                linkedin: li ? Math.round(Math.max(0, li.followers - (i * (li.followerGrowth / 30)))) : 0,
                tiktok: tt ? Math.round(Math.max(0, tt.followers - (i * (tt.followerGrowth / 30)))) : 0,
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
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis
                        dataKey="date"
                        stroke="var(--text-muted)"
                        fontSize={12}
                        tickFormatter={(value) => {
                            const date = new Date(value);
                            return `${date.getDate()}/${date.getMonth() + 1}`;
                        }}
                    />
                    <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => formatNumber(v)} />
                    <Tooltip
                        contentStyle={customTooltipStyle}
                        labelStyle={{ color: 'var(--text-primary)' }}
                        formatter={(value) => [formatNumber(value as number ?? 0), '']}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="instagram" stroke="#E4405F" strokeWidth={2} dot={false} name="Instagram" />
                    <Line type="monotone" dataKey="twitter" stroke="#1DA1F2" strokeWidth={2} dot={false} name="Twitter/X" />
                    <Line type="monotone" dataKey="linkedin" stroke="#0A66C2" strokeWidth={2} dot={false} name="LinkedIn" />
                    <Line type="monotone" dataKey="tiktok" stroke="#00f2ea" strokeWidth={2} dot={false} name="TikTok" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

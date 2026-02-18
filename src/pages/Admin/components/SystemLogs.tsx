import React, { useState } from 'react';
import { 
    Terminal, 
    Download, 
    Trash2, 
    Search, 
    AlertCircle, 
    CheckCircle2, 
    Info, 
    Filter,
    FileJson,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { useLog, type LogLevel } from '../../../context/LogContext';

const SystemLogs: React.FC = () => {
    const { logs, clearLogs, exportLogs } = useLog();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLevel, setFilterLevel] = useState<LogLevel | 'all'>('all');
    const [expandedLog, setExpandedLog] = useState<string | null>(null);

    const filteredLogs = logs.filter(log => {
        const matchesSearch = 
            log.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (log.context?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesLevel = filterLevel === 'all' || log.level === filterLevel;
        return matchesSearch && matchesLevel;
    });

    const getLevelBadge = (level: LogLevel) => {
        switch (level) {
            case 'error': return { color: 'var(--error)', bg: 'var(--error-bg)', icon: <AlertCircle size={14} /> };
            case 'warn': return { color: 'var(--warning)', bg: 'var(--warning-bg)', icon: <AlertCircle size={14} /> };
            case 'success': return { color: 'var(--success)', bg: 'var(--success-bg)', icon: <CheckCircle2 size={14} /> };
            default: return { color: 'var(--info)', bg: 'var(--info-bg)', icon: <Info size={14} /> };
        }
    };

    const formatJSON = (details: any) => {
        try {
            return JSON.stringify(details, null, 2);
        } catch (e: unknown) {
            return String(details);
        }
    };

    return (
        <div className="system-logs animate-fadeIn">
            <div className="section-header">
                <div>
                    <h2 className="section-title">Sistem Kayıtları (Logs)</h2>
                    <p className="text-muted text-sm">Uygulama çalışma zamanı hatalarını ve işlemlerini takip edin.</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <button className="btn btn-secondary" onClick={exportLogs}>
                        <Download size={18} />
                        <span>Yedekle (JSON)</span>
                    </button>
                    <button className="btn btn-secondary" style={{ color: 'var(--error)' }} onClick={clearLogs}>
                        <Trash2 size={18} />
                        <span>Temizle</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-md)' }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                    <div className="input-with-icon" style={{ flex: 1, minWidth: '200px' }}>
                        <Search size={18} className="input-icon" />
                        <input
                            type="text"
                            className="input"
                            placeholder="Mesaj veya bağlam ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <Filter size={18} className="text-muted" />
                        <select 
                            className="input select" 
                            style={{ width: 'auto' }}
                            value={filterLevel}
                            onChange={(e) => setFilterLevel(e.target.value as any)}
                        >
                            <option value="all">Tüm Seviyeler</option>
                            <option value="info">Bilgi</option>
                            <option value="success">Başarılı</option>
                            <option value="warn">Uyarı</option>
                            <option value="error">Hata</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Logs List */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    {filteredLogs.length === 0 ? (
                        <div style={{ padding: 'var(--spacing-2xl)', textAlign: 'center' }}>
                            <Terminal size={48} className="text-muted" style={{ margin: '0 auto 16px' }} />
                            <p className="text-muted">Kayıt bulunamadı.</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                            <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-tertiary)', zIndex: 10 }}>
                                <tr>
                                    <th style={{ padding: '12px var(--spacing-md)', fontWeight: 600, width: '180px' }}>Zaman</th>
                                    <th style={{ padding: '12px var(--spacing-md)', fontWeight: 600, width: '100px' }}>Seviye</th>
                                    <th style={{ padding: '12px var(--spacing-md)', fontWeight: 600, width: '120px' }}>Bağlam</th>
                                    <th style={{ padding: '12px var(--spacing-md)', fontWeight: 600 }}>Mesaj</th>
                                    <th style={{ padding: '12px var(--spacing-md)', fontWeight: 600, width: '50px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map((log) => {
                                    const badge = getLevelBadge(log.level);
                                    const isExpanded = expandedLog === log.id;
                                    
                                    return (
                                        <React.Fragment key={log.id}>
                                            <tr 
                                                style={{ borderTop: '1px solid var(--border-color)', background: isExpanded ? 'var(--bg-secondary)' : 'transparent' }}
                                                className="table-row-hover"
                                                onClick={() => log.details && setExpandedLog(isExpanded ? null : log.id)}
                                            >
                                                <td style={{ padding: '12px var(--spacing-md)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                                    {new Date(log.timestamp).toLocaleString('tr-TR', { 
                                                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                                                    })}
                                                </td>
                                                <td style={{ padding: '12px var(--spacing-md)' }}>
                                                    <div className="badge" style={{ color: badge.color, background: badge.bg, padding: '2px 8px' }}>
                                                        {badge.icon}
                                                        <span style={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>{log.level}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px var(--spacing-md)', fontWeight: 500 }}>
                                                    {log.context || 'Sistem'}
                                                </td>
                                                <td style={{ padding: '12px var(--spacing-md)', wordBreak: 'break-word', color: log.level === 'error' ? 'var(--error)' : 'inherit' }}>
                                                    {log.message}
                                                </td>
                                                <td style={{ padding: '12px var(--spacing-md)' }}>
                                                    {log.details && (
                                                        <button className="btn btn-ghost btn-icon btn-sm">
                                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                            {isExpanded && log.details && (
                                                <tr>
                                                    <td colSpan={5} style={{ padding: 'var(--spacing-md)', background: 'var(--bg-secondary)', borderTop: 'none' }}>
                                                        <div style={{ 
                                                            padding: 'var(--spacing-md)', 
                                                            background: 'var(--bg-tertiary)', 
                                                            borderRadius: 'var(--radius-md)',
                                                            fontFamily: 'monospace',
                                                            whiteSpace: 'pre-wrap',
                                                            overflowX: 'auto',
                                                            fontSize: '0.75rem',
                                                            border: '1px solid var(--border-color)'
                                                        }}>
                                                            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                                                                <FileJson size={14} />
                                                                <span>Detay Verisi</span>
                                                            </div>
                                                            {formatJSON(log.details)}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SystemLogs;

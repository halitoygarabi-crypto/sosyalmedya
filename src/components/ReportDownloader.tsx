import React, { useState, useEffect } from 'react';
import {
    Download,
    FileText,
    Calendar,
    TrendingUp,
    BarChart3,
    RefreshCw,
    ChevronRight,
} from 'lucide-react';
import { reportService } from '../utils/reportService';
import type { Report } from '../types';

interface ReportDownloaderProps {
    clientId: string;
    clientName?: string;
}

const ReportDownloader: React.FC<ReportDownloaderProps> = ({ clientId, clientName }) => {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    // Fetch existing reports
    useEffect(() => {
        const fetchReports = async () => {
            setIsLoading(true);
            const data = await reportService.listReports(clientId);
            setReports(data);
            setIsLoading(false);
        };
        if (clientId) fetchReports();
    }, [clientId]);

    const handleGenerateReport = async (type: 'weekly' | 'monthly') => {
        setIsGenerating(true);
        const report = type === 'weekly'
            ? await reportService.generateWeeklyReport(clientId)
            : await reportService.generateMonthlyReport(clientId);

        if (report) {
            setReports(prev => [report, ...prev]);
            setSelectedReport(report);
        }
        setIsGenerating(false);
    };

    const handleDownloadCSV = (report: Report) => {
        const data = report.data as Record<string, unknown>;
        const summary = data.summary as Record<string, unknown> || {};

        const csvContent = [
            `Rapor Tipi,${report.reportType === 'weekly' ? 'Haftalık' : 'Aylık'}`,
            `Dönem,${report.periodStart} - ${report.periodEnd}`,
            `Oluşturulma,${new Date(report.generatedAt).toLocaleDateString('tr-TR')}`,
            '',
            'Metrik,Değer',
            `Toplam Post,${summary.totalPosts || 0}`,
            `Toplam Etkileşim,${summary.totalEngagement || 0}`,
            `Toplam Erişim,${summary.totalReach || 0}`,
            `Toplam Gösterim,${summary.totalImpressions || 0}`,
            `Ort. Etkileşim Oranı,%${summary.avgEngagementRate || 0}`,
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${clientName || 'rapor'}_${report.reportType}_${report.periodStart}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const filteredReports = reports.filter(r => r.reportType === activeTab);

    return (
        <div>
            {/* Header */}
            <div className="section-header" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h2 className="section-title">
                    <FileText size={20} style={{ marginRight: '8px' }} />
                    Raporlar {clientName && `— ${clientName}`}
                </h2>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
                <button
                    className={`btn ${activeTab === 'weekly' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('weekly')}
                >
                    <Calendar size={16} />
                    Haftalık
                </button>
                <button
                    className={`btn ${activeTab === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('monthly')}
                >
                    <BarChart3 size={16} />
                    Aylık
                </button>
                <div style={{ marginLeft: 'auto' }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => handleGenerateReport(activeTab)}
                        disabled={isGenerating}
                    >
                        {isGenerating ? (
                            <><RefreshCw size={16} className="spin" /> Oluşturuluyor...</>
                        ) : (
                            <><TrendingUp size={16} /> Yeni {activeTab === 'weekly' ? 'Haftalık' : 'Aylık'} Rapor</>
                        )}
                    </button>
                </div>
            </div>

            {/* Report List */}
            {isLoading ? (
                <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                    <div className="spinner" />
                    <p className="text-muted" style={{ marginTop: 'var(--spacing-md)' }}>Raporlar yükleniyor...</p>
                </div>
            ) : filteredReports.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                    <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-md)' }} />
                    <h3>Henüz {activeTab === 'weekly' ? 'haftalık' : 'aylık'} rapor yok</h3>
                    <p className="text-muted">Yeni bir rapor oluşturmak için yukarıdaki butona tıklayın.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
                    {/* Report List */}
                    <div style={{ flex: '0 0 320px' }}>
                        {filteredReports.map(report => (
                            <div
                                key={report.id}
                                className="card"
                                style={{
                                    marginBottom: 'var(--spacing-sm)',
                                    cursor: 'pointer',
                                    border: selectedReport?.id === report.id ? '2px solid var(--accent-primary)' : undefined,
                                    transition: 'border-color 0.2s'
                                }}
                                onClick={() => setSelectedReport(report)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                            {report.reportType === 'weekly' ? 'Haftalık' : 'Aylık'} Rapor
                                        </div>
                                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                            {report.periodStart} — {report.periodEnd}
                                        </div>
                                    </div>
                                    <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Report Detail */}
                    {selectedReport && (
                        <div className="card" style={{ flex: 1 }}>
                            <div className="card-header">
                                <h3 className="card-title">
                                    {selectedReport.reportType === 'weekly' ? 'Haftalık' : 'Aylık'} Rapor Detayı
                                </h3>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleDownloadCSV(selectedReport)}
                                >
                                    <Download size={14} />
                                    CSV İndir
                                </button>
                            </div>

                            <div style={{ marginTop: 'var(--spacing-md)' }}>
                                <div className="text-muted" style={{ fontSize: '0.75rem', marginBottom: 'var(--spacing-md)' }}>
                                    Dönem: {selectedReport.periodStart} — {selectedReport.periodEnd}
                                </div>

                                {/* Summary Cards */}
                                {(() => {
                                    const summary = (selectedReport.data as Record<string, unknown>).summary as Record<string, unknown> || {};
                                    return (
                                        <div className="grid-4" style={{ marginBottom: 'var(--spacing-lg)' }}>
                                            <div style={{
                                                padding: 'var(--spacing-md)',
                                                background: 'var(--bg-secondary)',
                                                borderRadius: 'var(--radius-md)',
                                                textAlign: 'center'
                                            }}>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                                                    {String(summary.totalPosts || 0)}
                                                </div>
                                                <div className="text-muted" style={{ fontSize: '0.7rem' }}>Toplam Post</div>
                                            </div>
                                            <div style={{
                                                padding: 'var(--spacing-md)',
                                                background: 'var(--bg-secondary)',
                                                borderRadius: 'var(--radius-md)',
                                                textAlign: 'center'
                                            }}>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>
                                                    {String(summary.totalEngagement || 0)}
                                                </div>
                                                <div className="text-muted" style={{ fontSize: '0.7rem' }}>Etkileşim</div>
                                            </div>
                                            <div style={{
                                                padding: 'var(--spacing-md)',
                                                background: 'var(--bg-secondary)',
                                                borderRadius: 'var(--radius-md)',
                                                textAlign: 'center'
                                            }}>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--info)' }}>
                                                    {String(summary.totalReach || 0)}
                                                </div>
                                                <div className="text-muted" style={{ fontSize: '0.7rem' }}>Erişim</div>
                                            </div>
                                            <div style={{
                                                padding: 'var(--spacing-md)',
                                                background: 'var(--bg-secondary)',
                                                borderRadius: 'var(--radius-md)',
                                                textAlign: 'center'
                                            }}>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning)' }}>
                                                    %{String(summary.avgEngagementRate || 0)}
                                                </div>
                                                <div className="text-muted" style={{ fontSize: '0.7rem' }}>Ort. Oran</div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReportDownloader;

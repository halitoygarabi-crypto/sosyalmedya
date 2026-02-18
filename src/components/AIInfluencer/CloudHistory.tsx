import React from 'react';
import { RefreshCw, Cloud, Video } from 'lucide-react';
import type { InfluencerGenerationResponse } from '../../utils/aiInfluencerService';
import type { SheetEntry } from '../../utils/googleSheetsService';

interface CloudHistoryProps {
    activeTab: 'local' | 'cloud';
    setActiveTab: (tab: 'local' | 'cloud') => void;
    history: InfluencerGenerationResponse[];
    cloudHistory: SheetEntry[];
    isLoadingFromSheet: boolean;
    handleFetchFromSheet: () => void;
    onSelectHistoryItem: (item: InfluencerGenerationResponse | SheetEntry) => void;
}

export const CloudHistory: React.FC<CloudHistoryProps> = ({
    activeTab,
    setActiveTab,
    history,
    cloudHistory,
    isLoadingFromSheet,
    handleFetchFromSheet,
    onSelectHistoryItem
}) => {
    return (
        <div className="card" style={{ padding: 'var(--spacing-lg)', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: 'var(--radius-lg)' }}>
                <button 
                    className={`btn btn-sm ${activeTab === 'local' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setActiveTab('local')}
                    style={{ flex: 1 }}
                >Geçmiş</button>
                <button 
                    className={`btn btn-sm ${activeTab === 'cloud' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setActiveTab('cloud')}
                    style={{ flex: 1 }}
                >Bulut</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', minHeight: '500px' }}>
                {activeTab === 'local' ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                        {history.length === 0 ? (
                            <p className="text-muted text-center text-xs" style={{ width: '100%', marginTop: 'var(--spacing-2xl)' }}>Henüz yerel geçmiş yok.</p>
                        ) : (
                            history.map((item, i) => (
                                <div 
                                    key={item.requestId || i} 
                                    className="card-glass" 
                                    style={{ width: 'calc(50% - var(--spacing-md))', padding: '4px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                                    onClick={() => onSelectHistoryItem(item)}
                                >
                                    <div style={{ position: 'relative', paddingTop: '100%' }}>
                                        <img 
                                            src={item.imageUrl} 
                                            alt={`History ${i}`} 
                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                                        />
                                        {item.type === 'video' && (
                                            <div style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', padding: '2px', borderRadius: '4px' }}>
                                                <Video size={10} color="white" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        <button 
                            className="btn btn-secondary btn-full btn-sm" 
                            onClick={handleFetchFromSheet}
                            disabled={isLoadingFromSheet}
                        >
                            <RefreshCw size={14} className={isLoadingFromSheet ? 'animate-spin' : ''} />
                            <span>Verileri Yenile</span>
                        </button>

                        {cloudHistory.length === 0 ? (
                            <div style={{ textAlign: 'center', marginTop: 'var(--spacing-2xl)' }}>
                                <Cloud size={32} style={{ opacity: 0.1, marginBottom: '8px' }} />
                                <p className="text-muted text-xs">Bulut verisi yok.</p>
                            </div>
                        ) : (
                            cloudHistory.map((entry, i) => (
                                <div 
                                    key={i} 
                                    className="card-glass" 
                                    style={{ padding: '8px', cursor: 'pointer' }}
                                    onClick={() => onSelectHistoryItem(entry)}
                                >
                                    <div style={{ position: 'relative', width: '100%', height: '120px', marginBottom: '8px' }}>
                                        <img 
                                            src={entry.imageUrl} 
                                            alt={entry.influencerName} 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                                        />
                                        {entry.type === 'video' && (
                                            <div style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', padding: '2px', borderRadius: '4px' }}>
                                                <Video size={10} color="white" />
                                            </div>
                                        )}
                                    </div>
                                    <p style={{ fontSize: '10px', fontWeight: 'bold', margin: 0 }}>{entry.influencerName}</p>
                                    <p className="text-muted" style={{ fontSize: '9px', margin: 0 }}>{entry.date}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

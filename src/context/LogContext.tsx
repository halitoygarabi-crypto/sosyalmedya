import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type LogLevel = 'info' | 'warn' | 'error' | 'success';

export interface AppLog {
    id: string;
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: string;
    details?: any;
}

interface LogContextType {
    logs: AppLog[];
    addLog: (level: LogLevel, message: string, context?: string, details?: any) => void;
    clearLogs: () => void;
    exportLogs: () => void;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export const LogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [logs, setLogs] = useState<AppLog[]>(() => {
        const saved = localStorage.getItem('app_logs');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('app_logs', JSON.stringify(logs.slice(-1000))); // En son 1000 logu tut
    }, [logs]);

    const addLog = useCallback((level: LogLevel, message: string, context?: string, details?: any) => {
        const newLog: AppLog = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            level,
            message,
            context,
            details
        };
        setLogs(prev => [newLog, ...prev]);
        
        // Console'a da yazdır
        const consoleMethod = level === 'success' ? 'log' : level;
        console[consoleMethod as 'log' | 'warn' | 'error'](`[${context || 'App'}] ${message}`, details || '');
    }, []);

    const clearLogs = useCallback(() => {
        setLogs([]);
    }, []);

    const exportLogs = useCallback(() => {
        const dataStr = JSON.stringify(logs, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `app_logs_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }, [logs]);

    return (
        <LogContext.Provider value={{ logs, addLog, clearLogs, exportLogs }}>
            {children}
        </LogContext.Provider>
    );
};

export const useLog = () => {
    const context = useContext(LogContext);
    if (!context) {
        throw new Error('useLog must be used within a LogProvider');
    }
    return context;
};

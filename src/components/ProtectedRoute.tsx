import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    console.log('ProtectedRoute state:', { user: !!user, isLoading });

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="spinner" />
                <p>Yükleniyor...</p>
            </div>
        );
    }

    if (!user) {
        const isAdminPath = location.pathname.startsWith('/admin');
        const loginPath = isAdminPath ? '/admin/login' : '/login';
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;

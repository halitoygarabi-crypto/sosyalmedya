import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, Shield } from 'lucide-react';

const AdminLoginPage: React.FC = () => {
    const { login, user, isAdmin, isLoading: authLoading, customerProfile } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // If already logged in as admin, redirect to admin panel
    React.useEffect(() => {
        if (user && !authLoading && customerProfile) {
            if (isAdmin) {
                navigate('/admin', { replace: true });
            } else {
                // If logged in but not admin, we should probably logout or show error
                setError('Bu hesaba yönetici yetkisi tanımlı değil.');
                // logout(); // Optional: logout if they are not admin
            }
        }
    }, [user, authLoading, isAdmin, customerProfile, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            console.log('Submitting admin login...');
            const result = await login(email, password);

            if (result.error) {
                setError(result.error);
                setIsLoading(false);
                return;
            }

            console.log('Login successful, checking admin status...');

            // Wait a short bit for profile state to update from AuthContext
            let checks = 0;
            const checkInterval = setInterval(() => {
                checks++;
                if (isAdmin) {
                    clearInterval(checkInterval);
                    console.log('Admin confirmed, navigating...');
                    navigate('/admin', { replace: true });
                } else if (checks > 20) { // 2 seconds timeout
                    clearInterval(checkInterval);
                    setIsLoading(false);
                    if (user && !isAdmin) {
                        setError('Bu hesabın yönetici yetkisi yok.');
                    }
                }
            }, 100);

        } catch (err) {
            console.error('Login submit error:', err);
            setError('Giriş yapılırken bir hata oluştu.');
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page" style={{ background: 'linear-gradient(135deg, #1e1e2f 0%, #0f0f1a 100%)' }}>
            <div className="auth-container" style={{ borderTop: '4px solid #8b5cf6' }}>
                <div className="auth-header">
                    <div className="auth-logo" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa' }}>
                        <Shield size={24} />
                    </div>
                    <h1 style={{ color: 'white' }}>Yönetici Girişi</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>Sadece yetkili personel erişebilir</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && (
                        <div className="auth-error" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <AlertCircle size={16} color="#ef4444" />
                            <span style={{ color: '#fca5a5' }}>{error}</span>
                        </div>
                    )}

                    <div className="input-group">
                        <label className="input-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Yönetici E-posta</label>
                        <div className="input-with-icon">
                            <Mail size={18} className="input-icon" style={{ color: 'rgba(255,255,255,0.4)' }} />
                            <input
                                type="email"
                                className="input"
                                placeholder="admin@socialhub.pro"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Şifre</label>
                        <div className="input-with-icon">
                            <Lock size={18} className="input-icon" style={{ color: 'rgba(255,255,255,0.4)' }} />
                            <input
                                type="password"
                                className="input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full btn-lg"
                        disabled={isLoading}
                        style={{ background: '#8b5cf6', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }}
                    >
                        {isLoading ? (
                            <div className="spinner-sm" />
                        ) : (
                            <>
                                <LogIn size={18} />
                                <span>Güvenli Giriş Yap</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <button
                        className="btn btn-ghost"
                        onClick={() => navigate('/login')}
                        style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)' }}
                    >
                        Müşteri Girişine Dön
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;

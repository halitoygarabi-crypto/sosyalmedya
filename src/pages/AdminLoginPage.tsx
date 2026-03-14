import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
        if (user && !authLoading) {
            if (isAdmin) {
                navigate('/admin', { replace: true });
            } else if (customerProfile) {
                // If logged in and profile loaded but not admin, show error
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

            // The AuthContext state will update since login was successful.
            // When it updates, the useEffect above will trigger and gracefully redirect the user.
            // We do not need the flawed setInterval closure check here since it captures stale state.
            
        } catch (err) {
            console.error('Login submit error:', err);
            setError('Giriş yapılırken bir hata oluştu.');
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <div className="auth-logo">
                        <div className="logo-icon">
                            <Shield size={24} />
                        </div>
                        <span className="logo-text">SocialHub</span>
                    </div>
                    <h1>Yönetici Girişi</h1>
                    <p>Yetkili personel güvenli erişim paneli</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && (
                        <div className="auth-error">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="input-group">
                        <label className="input-label">Yönetici E-posta</label>
                        <div className="input-with-icon">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                className="input"
                                placeholder="admin@socialhub.pro"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Şifre</label>
                        <div className="input-with-icon">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                className="input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full btn-lg"
                        disabled={isLoading}
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

                <div className="auth-footer" style={{ borderTop: '1px solid var(--border-color)', marginTop: '20px', paddingTop: '20px' }}>
                    <div style={{ padding: '10px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                        <p className="text-sm text-muted" style={{ marginBottom: '8px' }}>Müşteri misiniz?</p>
                        <Link to="/login" className="text-sm" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>
                            Müşteri Girişine Dön →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;

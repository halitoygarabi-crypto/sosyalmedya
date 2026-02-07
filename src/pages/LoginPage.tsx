import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

const LoginPage: React.FC = () => {
    const { login, user, isAdmin, isLoading: authLoading, customerProfile } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Oturum açıksa ve profil yüklendiyse yetkiye göre yönlendir
    React.useEffect(() => {
        if (user && !authLoading && customerProfile) {
            console.log('User logged in, customerProfile loaded, isAdmin:', isAdmin);
            console.log('Profile is_admin value:', customerProfile.is_admin);
            if (isAdmin) {
                console.log('Redirecting to /admin');
                navigate('/admin', { replace: true });
            } else {
                console.log('Redirecting to /client');
                navigate('/client', { replace: true });
            }
        }
    }, [user, authLoading, isAdmin, customerProfile, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const result = await login(email, password);

        if (result.error) {
            setError(result.error);
            setIsLoading(false);
        }
        // Başarılı girişte useEffect yukarıda yönlendirmeyi yapacak
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <div className="auth-logo">
                        <span className="logo-icon">📱</span>
                        <span className="logo-text">SocialHub</span>
                    </div>
                    <h1>Hoş Geldiniz</h1>
                    <p>Hesabınıza giriş yapın</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && (
                        <div className="auth-error">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="input-group">
                        <label className="input-label">E-posta</label>
                        <div className="input-with-icon">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                className="input"
                                placeholder="ornek@sirket.com"
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
                                <span>Giriş Yap</span>
                            </>
                        )}
                    </button>
                </form>



                <div className="auth-footer" style={{ borderTop: '1px solid var(--border-color)', marginTop: '20px', paddingTop: '20px' }}>
                    <div style={{ padding: '10px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                        <p className="text-sm text-muted" style={{ marginBottom: '8px' }}>Yönetici misiniz?</p>
                        <Link to="/admin/login" className="text-sm" style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>
                            Yönetici Paneline Giriş Yap →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

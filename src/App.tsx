import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { LoginPage, RegisterPage, ClientDashboard, AdminLoginPage, AdminPage, CreatorDashboard } from './pages';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KPICards from './components/KPICards';
import {
  EngagementTrendChart,
  PlatformDistributionChart,
  PlatformComparisonChart,
  FollowerGrowthChart,
} from './components/Charts';
import PlatformStats from './components/PlatformStats';
import PostList from './components/PostList';
import ActivityHeatmap from './components/ActivityHeatmap';
import ScheduleCalendar from './components/ScheduleCalendar';
import NewPostModal from './components/NewPostModal';
import {
  SentimentAnalysis,
  HashtagPerformance,
  TopPerformingPosts,
  AutomationControls,
} from './components/EngagementMetrics';
import ReportsSection from './components/ReportsSection';
import IntegrationsManager from './components/IntegrationsManager';
import VideoGenerator from './components/VideoGenerator';
import AIInfluencerGenerator from './components/AIInfluencerGenerator';
import ContentHistory from './components/ContentHistory';
import { Filter, CheckCircle, AlertCircle, Clock, ExternalLink, Trash2 } from 'lucide-react';
import { formatRelativeTime } from './utils/helpers';

const DashboardContent: React.FC = () => {
  const {
    posts,
    isDarkMode,
    notifications,
    clearNotifications,
    markNotificationRead,
    selectedPlatform,
    selectedStatus,
    setSelectedPlatform,
    setSelectedStatus,
  } = useDashboard();
  const { customerProfile, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showNewPostModal, setShowNewPostModal] = useState(false);

  // Apply dark/light mode
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scheduledCount = posts.filter((p) => p.status === 'scheduled').length;
  const postedCount = posts.filter((p) => p.status === 'posted').length;
  const failedCount = posts.filter((p) => p.status === 'failed').length;

  return (
    <div className="dashboard">
      <Sidebar
        isOpen={sidebarOpen}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <main className={`main-content ${!sidebarOpen ? 'main-content-expanded' : ''}`}>
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onNewPost={() => setShowNewPostModal(true)}
          companyName={customerProfile?.company_name}
          onLogout={logout}
          onSectionChange={setActiveSection}
        />

        {/* Filters */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-md)',
            marginBottom: 'var(--spacing-xl)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <Filter size={16} className="text-muted" />
            <span className="text-sm text-secondary">Filtrele:</span>
          </div>

          {/* Platform Filter */}
          <select
            className="input select"
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value as 'all' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok')}
            style={{ width: 'auto' }}
          >
            <option value="all">Tüm Platformlar</option>
            <option value="instagram">Instagram</option>
            <option value="twitter">Twitter/X</option>
            <option value="linkedin">LinkedIn</option>
            <option value="tiktok">TikTok</option>
          </select>

          {/* Status Filter */}
          <select
            className="input select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'scheduled' | 'posted' | 'failed' | 'draft')}
            style={{ width: 'auto' }}
          >
            <option value="all">Tüm Durumlar</option>
            <option value="scheduled">Planlandı</option>
            <option value="posted">Gönderildi</option>
            <option value="failed">Başarısız</option>
            <option value="draft">Taslak</option>
          </select>

          {/* Quick Stats */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--spacing-md)' }}>
            <div className="badge badge-info">
              <Clock size={12} />
              <span>{scheduledCount} Planlandı</span>
            </div>
            <div className="badge badge-success">
              <CheckCircle size={12} />
              <span>{postedCount} Gönderildi</span>
            </div>
            {failedCount > 0 && (
              <div className="badge badge-error">
                <AlertCircle size={12} />
                <span>{failedCount} Başarısız</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area based on activeSection */}
        <div className="section-content animate-fadeIn">
          {activeSection === 'dashboard' && (
            <>
              {/* KPI Cards */}
              <KPICards />

              {/* Charts Row */}
              <div className="section">
                <div className="grid-2" style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <EngagementTrendChart />
                  <PlatformDistributionChart />
                </div>
                <div className="grid-2">
                  <PlatformComparisonChart />
                  <ActivityHeatmap />
                </div>
              </div>

              {/* Platform Statistics */}
              <PlatformStats />

              {/* Content Management Section */}
              <div className="section">
                <div className="section-header">
                  <h2 className="section-title">İçerik Yönetimi</h2>
                </div>
                <div className="grid-3">
                  <div className="card" style={{ gridColumn: 'span 2' }}>
                    <div className="card-header">
                      <h3 className="card-title">Son Paylaşımlar</h3>
                      <button className="btn btn-ghost btn-sm" onClick={() => setActiveSection('content')}>Tümünü Gör</button>
                    </div>
                    <PostList filter="all" limit={5} />
                  </div>
                  <div>
                    <ScheduleCalendar />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeSection === 'analytics' && (
            <>
              <div className="section-header">
                <h2 className="section-title">Analitik Raporlar</h2>
              </div>
              <div className="grid-2" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <EngagementTrendChart />
                <FollowerGrowthChart />
              </div>
              <div className="grid-2">
                <PlatformDistributionChart />
                <ActivityHeatmap />
              </div>
              <div style={{ marginTop: 'var(--spacing-xl)' }}>
                <ReportsSection />
              </div>
            </>
          )}

          {activeSection === 'video-generator' && (
            <VideoGenerator />
          )}

          {activeSection === 'ai-influencer' && (
            <AIInfluencerGenerator />
          )}

          {activeSection === 'schedule' && (
            <>
              <div className="section-header">
                <h2 className="section-title">Yayın Takvimi</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setShowNewPostModal(true)}>Yeni Plan Ekle</button>
              </div>
              <div className="grid-3">
                <div style={{ gridColumn: 'span 2' }}>
                  <ScheduleCalendar />
                </div>
                <div className="card">
                  <h3 className="card-title mb-md">Bekleyen Planlar</h3>
                  <PostList filter="scheduled" limit={10} />
                </div>
              </div>
            </>
          )}

          {activeSection === 'content' && (
            <>
              <div className="section-header">
                <h2 className="section-title">İçerik Arşivi</h2>
                <div className="flex gap-md">
                  <select
                    className="input select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'scheduled' | 'posted' | 'failed' | 'draft')}
                    style={{ width: 'auto' }}
                  >
                    <option value="all">Tüm Durumlar</option>
                    <option value="draft">Taslak</option>
                    <option value="scheduled">Planlandı</option>
                    <option value="posted">Gönderildi</option>
                    <option value="failed">Başarısız</option>
                  </select>
                  <button className="btn btn-primary" onClick={() => setShowNewPostModal(true)}>İçerik Oluştur</button>
                </div>
              </div>
              <div className="card">
                <PostList filter={selectedStatus === 'all' ? 'all' : selectedStatus} limit={20} />
              </div>
              <div style={{ marginTop: 'var(--spacing-lg)' }}>
                <ContentHistory
                  onUseContent={(content) => {
                    setShowNewPostModal(true);
                    // Content will be loaded when modal opens
                    sessionStorage.setItem('prefill_content', JSON.stringify(content));
                  }}
                />
              </div>
            </>
          )}

          {activeSection === 'audience' && (
            <>
              <div className="section-header">
                <h2 className="section-title">Kitle Analizi</h2>
              </div>
              <div className="grid-2">
                <FollowerGrowthChart />
                <SentimentAnalysis />
              </div>
            </>
          )}

          {activeSection === 'performance' && (
            <>
              <div className="section-header">
                <h2 className="section-title">Performans Karşılaştırması</h2>
              </div>
              <div className="grid-2" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <PlatformComparisonChart />
                <TopPerformingPosts posts={posts} />
              </div>
            </>
          )}

          {activeSection === 'automation' && (
            <>
              <div className="section-header">
                <h2 className="section-title">Otomasyon Merkezi</h2>
              </div>
              <div className="card">
                <AutomationControls />
              </div>
            </>
          )}

          {['instagram', 'twitter', 'linkedin', 'tiktok', 'metricool'].includes(activeSection) && (
            <>
              <div className="section-header">
                <h2 className="section-title" style={{ textTransform: 'capitalize' }}>{activeSection} Özel Paneli</h2>
                {activeSection === 'metricool' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => window.open('https://app.metricool.com', '_blank')}
                  >
                    <ExternalLink size={14} />
                    <span>Metricool Paneline Git</span>
                  </button>
                )}
              </div>
              <KPICards />
              <div className="grid-2">
                <EngagementTrendChart />
                {activeSection === 'metricool' ? (
                  <div className="card">
                    <h3 className="card-title mb-md">Metricool Özet</h3>
                    <p className="text-secondary mb-md">Metricool takip kodunuz aktif. Detaylı analizler ve rakip takibi için Metricool panelini kullanabilirsiniz.</p>
                    <HashtagPerformance />
                  </div>
                ) : (
                  <div className="card">
                    <h3 className="card-title mb-md">Son {activeSection} Paylaşımları</h3>
                    <PostList filter="all" limit={5} />
                  </div>
                )}
              </div>
            </>
          )}

          {activeSection === 'admin' && (
            <AdminPage />
          )}

          {activeSection === 'settings' && (
            <>
              <div className="section-header">
                <h2 className="section-title">Sistem Ayarları</h2>
              </div>
              <IntegrationsManager />
            </>
          )}

          {activeSection === 'notifications' && (
            <>
              <div className="section-header">
                <h2 className="section-title">Bildirimler</h2>
                {notifications.length > 0 && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => clearNotifications()}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Trash2 size={14} />
                    <span>Tümünü Temizle</span>
                  </button>
                )}
              </div>
              <div className="card">
                {notifications.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>🔔</div>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Henüz bildirim yok.</p>
                  </div>
                ) : (
                  <div className="notification-list">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`notification-item ${notification.type} ${!notification.read ? 'unread' : ''}`}
                        onClick={() => markNotificationRead(notification.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 'var(--spacing-md)',
                          padding: 'var(--spacing-md)',
                          borderBottom: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          opacity: notification.read ? 0.7 : 1,
                          background: notification.read ? 'transparent' : 'var(--bg-hover)',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            fontSize: '1rem',
                            background:
                              notification.type === 'success' ? 'var(--success-bg)'
                              : notification.type === 'error' ? 'var(--error-bg)'
                              : notification.type === 'warning' ? 'var(--warning-bg)'
                              : 'var(--info-bg)',
                            color:
                              notification.type === 'success' ? 'var(--success)'
                              : notification.type === 'error' ? 'var(--error)'
                              : notification.type === 'warning' ? 'var(--warning)'
                              : 'var(--info)',
                          }}
                        >
                          {notification.type === 'success' ? '✓' : notification.type === 'error' ? '✕' : notification.type === 'warning' ? '⚠' : 'ℹ'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.875rem', marginBottom: '4px' }}>{notification.message}</p>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {notification.timestamp ? formatRelativeTime(notification.timestamp) : ''}
                          </span>
                        </div>
                        {!notification.read && (
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)', flexShrink: 0, marginTop: '6px' }} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeSection === 'help' && (
            <>
              <div className="section-header">
                <h2 className="section-title">Yardım & Destek</h2>
              </div>
              <div className="grid-2">
                <div className="card">
                  <h3 className="card-title mb-md">Hızlı Başlangıç</h3>
                  <p className="text-secondary mb-md">Dashboard'u nasıl kullanacağınız hakkında temel bilgiler.</p>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      window.open('https://docs.n99.polmarkai.pro', '_blank');
                    }}
                  >Kılavuzu Oku</button>
                </div>
                <div className="card">
                  <h3 className="card-title mb-md">Destek Talebi</h3>
                  <p className="text-secondary mb-md">Bir sorunla mı karşılaştınız? Ekibimize ulaşın.</p>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      window.location.href = 'mailto:destek@polmarkai.pro?subject=Destek%20Talebi';
                    }}
                  >Talep Oluştur</button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Failed Posts Alert (Only on Home/Dashboard) */}
        {activeSection === 'dashboard' && failedCount > 0 && (
          <div
            className="card"
            style={{
              marginTop: 'var(--spacing-xl)',
              background: 'var(--error-bg)',
              border: '1px solid var(--error)',
            }}
          >
            <div className="card-header">
              <h3 className="card-title" style={{ color: 'var(--error)' }}>
                ⚠️ Başarısız Gönderiler ({failedCount})
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveSection('content')}>Tümünü Gör</button>
            </div>
            <PostList filter="failed" limit={3} />
          </div>
        )}

        {/* Footer */}
        <footer
          style={{
            marginTop: 'var(--spacing-2xl)',
            paddingTop: 'var(--spacing-lg)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.75rem',
          }}
        >
          <span>© 2026 N99 SocialHub Dashboard. Tüm hakları saklıdır.</span>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveSection('help'); }} style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>Yardım</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveSection('settings'); }} style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>Gizlilik</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveSection('settings'); }} style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>Kullanım Şartları</a>
          </div>
        </footer>
      </main>

      {/* New Post Modal */}
      <NewPostModal isOpen={showNewPostModal} onClose={() => setShowNewPostModal(false)} />
    </div>
  );
};


// Role-based redirect component
const RoleBasedRedirect: React.FC = () => {
  const { userRole, isLoading, user } = useAuth();

  // Still loading auth state
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-primary)'
      }}>
        <div className="spinner" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Route based on role
  switch (userRole) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'content_creator':
      return <Navigate to="/creator" replace />;
    case 'client':
    default:
      return <Navigate to="/client" replace />;
  }
};

// Client Dashboard Wrapper


const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DashboardProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardContent />
              </ProtectedRoute>
            } />
            <Route path="/client" element={
              <ProtectedRoute allowedRoles={['client']}>
                <ClientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/creator" element={
              <ProtectedRoute allowedRoles={['content_creator', 'admin']}>
                <CreatorDashboard />
              </ProtectedRoute>
            } />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <RoleBasedRedirect />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DashboardProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;


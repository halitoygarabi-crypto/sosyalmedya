import React, { useState, useEffect, useCallback } from "react";
import type { Post, Integration } from "../hooks/usePostiz";
import { usePostiz } from "../hooks/usePostiz";
import { useDashboard } from "../context/DashboardContext";
import {
  Calendar, Globe, Send, BarChart3, Settings, Zap, Trash2,
  Clock, LayoutDashboard, Sparkles,
  Instagram, Twitter, Linkedin, Facebook, Youtube, Play, MessageSquare, Send as TelegramIcon, AtSign
} from "lucide-react";

interface AIResult {
  content: string;
  approach: string;
}

// --- Platform Configuration ---
const PLATFORMS: Record<string, { name: string; icon: React.ReactNode; color: string; accent: string }> = {
  instagram: { name: "Instagram", icon: <Instagram size={14} />, color: "#E4405F", accent: "#C13584" },
  twitter: { name: "Twitter/X", icon: <Twitter size={14} />, color: "#14171A", accent: "#1DA1F2" },
  linkedin: { name: "LinkedIn", icon: <Linkedin size={14} />, color: "#0A66C2", accent: "#0A66C2" },
  facebook: { name: "Facebook", icon: <Facebook size={14} />, color: "#1877F2", accent: "#1877F2" },
  youtube: { name: "YouTube", icon: <Youtube size={14} />, color: "#FF0000", accent: "#FF0000" },
  tiktok: { name: "TikTok", icon: <Play size={14} />, color: "#010101", accent: "#69C9D0" },
  discord: { name: "Discord", icon: <MessageSquare size={14} />, color: "#5865F2", accent: "#5865F2" },
  telegram: { name: "Telegram", icon: <TelegramIcon size={14} />, color: "#26A5E4", accent: "#26A5E4" },
  threads: { name: "Threads", icon: <AtSign size={14} />, color: "#000000", accent: "#000000" },
};

const getPlatform = (id: string) => PLATFORMS[id] || { name: id, icon: <Globe size={14} />, color: "#64748B", accent: "#64748B" };

const PostizCommandCenter: React.FC = () => {
  const { addNotification } = useDashboard();
  const { 
    loading, integrations, posts: postizPosts, 
    fetchIntegrations, fetchPosts, createPost, deletePost, generateAIContent 
  } = usePostiz();

  const [activeTab, setActiveTab] = useState("overview");
  const [content, setContent] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [aiTopic, setAiTopic] = useState("");
  const [aiResults, setAiResults] = useState<AIResult[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    fetchIntegrations();
    fetchPosts();
  }, [fetchIntegrations, fetchPosts]);

  const handlePost = async () => {
    if (!content.trim() || selectedChannels.length === 0) {
      addNotification({ type: "warning", message: "Lütfen içerik girin ve kanal seçin.", read: false });
      return;
    }
    
    try {
      await createPost(content, selectedChannels, { type: 'now' });
      addNotification({ type: "success", message: "Gönderi başarıyla paylaşıldı!", read: false });
      setContent("");
      setSelectedChannels([]);
      setActiveTab("overview");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      addNotification({ type: "error", message: `Paylaşım hatası: ${msg}`, read: false });
    }
  };

  const handleAiGenerate = useCallback(async () => {
    if (!aiTopic) return;
    setIsAiLoading(true);
    try {
      const result = await generateAIContent({
        topic: aiTopic,
        platform: 'instagram',
        tone: 'professional',
        language: 'tr',
        includeHashtags: true,
        includeEmoji: true,
        variations: 3
      });
      setAiResults((result as { posts: AIResult[] }).posts || []);
      addNotification({ type: "info", message: "AI içerik önerileri oluşturuldu.", read: false });
    } catch {
      addNotification({ type: "error", message: "AI içerik üretilemedi.", read: false });
    } finally {
      setIsAiLoading(false);
    }
  }, [addNotification, aiTopic, generateAIContent]);

  const handleDelete = async (id: string) => {
    if (!confirm('Bu gönderiyi silmek istediğinize emin misiniz?')) return;
    try {
      await deletePost(id);
      addNotification({ type: "success", message: "Gönderi silindi.", read: false });
    } catch {
      addNotification({ type: "error", message: "Silme işlemi başarısız.", read: false });
    }
  };

  return (
    <div className="postiz-container animate-fadeIn">
      <div className="section-header">
        <div>
          <h2 className="section-title">Sosyal Medya Komuta Merkezi</h2>
          <p className="text-muted text-sm">Postiz entegrasyonu ile tüm kanallar tek noktada.</p>
        </div>
        <div className="flex gap-md">
           <div className={`badge ${postizPosts.length > 0 ? 'badge-success' : 'badge-warning'}`}>
             {postizPosts.length > 0 ? 'Aktif Sistem' : 'Bağlantı Bekleniyor'}
           </div>
           <button className="btn btn-primary btn-sm" onClick={() => setActiveTab("compose")}>
             <Send size={14} />
             <span>Yeni Paylaşım</span>
           </button>
        </div>
      </div>

      <div className="grid-auto" style={{ gridTemplateColumns: "240px 1fr", gap: "var(--spacing-xl)" }}>
        {/* Sidebar Mini Nav */}
        <div className="card" style={{ padding: 'var(--spacing-md)', height: 'fit-content' }}>
          <nav className="flex flex-column gap-sm">
            {[
              { id: "overview", label: "Genel Bakış", icon: <LayoutDashboard size={18} /> },
              { id: "compose", label: "İçerik Oluştur", icon: <Sparkles size={18} /> },
              { id: "calendar", label: "Takvim", icon: <Calendar size={18} /> },
              { id: "analytics", label: "Analizler", icon: <BarChart3 size={18} /> },
              { id: "channels", label: "Kanallar", icon: <Globe size={18} /> },
              { id: "settings", label: "Ayarlar", icon: <Settings size={18} /> }
            ].map(t => (
              <button 
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`btn ${activeTab === t.id ? 'btn-primary' : 'btn-ghost'}`}
                style={{ justifyContent: 'flex-start', width: '100%', padding: '10px 16px' }}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="postiz-content">
          {activeTab === "overview" && (
            <div className="flex flex-column gap-xl">
              <div className="grid-3">
                <div className="card bg-tertiary">
                  <div className="flex justify-between items-center mb-md">
                    <span className="text-muted text-xs font-bold uppercase tracking-wider">Toplam Gönderi</span>
                    <BarChart3 size={16} className="text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{postizPosts.length}</div>
                </div>
                <div className="card bg-tertiary">
                  <div className="flex justify-between items-center mb-md">
                    <span className="text-muted text-xs font-bold uppercase tracking-wider">Planlanan</span>
                    <Clock size={16} className="text-warning" />
                  </div>
                  <div className="text-2xl font-bold">{postizPosts.filter((p: Post) => p.state === 'QUEUE').length}</div>
                </div>
                <div className="card bg-tertiary">
                  <div className="flex justify-between items-center mb-md">
                    <span className="text-muted text-xs font-bold uppercase tracking-wider">Aktif Kanallar</span>
                    <Zap size={16} className="text-success" />
                  </div>
                  <div className="text-2xl font-bold">{integrations.length}</div>
                </div>
              </div>

              <div className="card">
                <div className="card-header border-bottom mb-md pb-md">
                  <h3 className="card-title">Son Aktiviteler</h3>
                </div>
                <div className="post-list">
                  {postizPosts.slice(0, 5).map((p: Post, i: number) => (
                    <div key={i} className="post-item">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-primary overflow-hidden">
                        {p.integration?.picture ? <img src={p.integration.picture} className="post-thumbnail" /> : <Globe size={20} />}
                      </div>
                      <div className="post-content">
                        <div className="post-title">{p.content}</div>
                        <div className="post-meta">
                          <span className={`post-status ${p.state.toLowerCase()}`}>{p.state}</span>
                          <span>•</span>
                          <span>{new Date(p.publishDate).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </div>
                      <button className="btn btn-ghost btn-sm text-error" onClick={() => handleDelete(p.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {postizPosts.length === 0 && !loading && (
                    <div className="p-xl text-center text-muted">Henüz aktivite bulunamadı.</div>
                  )}
                  {loading && (
                    <div className="p-xl text-center text-muted">Yükleniyor...</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "compose" && (
            <div className="card p-xl">
               <h3 className="text-lg font-bold mb-lg">Yeni İçerik Hazırla</h3>
               
               <div className="flex flex-column gap-lg">
                 <div className="input-group">
                   <label className="input-label">Paylaşım Metni</label>
                   <textarea 
                    className="input textarea" 
                    rows={6} 
                    placeholder="Gönderiniz ne hakkında? 🚀"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                   />
                   <div className="flex justify-end mt-xs">
                     <span className={`text-xs ${content.length > 280 ? 'text-error' : 'text-muted'}`}>
                       {content.length} karakter
                     </span>
                   </div>
                 </div>

                 <div className="input-group">
                   <label className="input-label">Kanalları Seçin</label>
                   <div className="flex flex-wrap gap-sm">
                     {integrations.map((ch: Integration) => (
                       <button 
                        key={ch.id}
                        onClick={() => setSelectedChannels(prev => prev.includes(ch.id) ? prev.filter(id => id !== ch.id) : [...prev, ch.id])}
                        className={`btn btn-sm ${selectedChannels.includes(ch.id) ? 'btn-primary' : 'btn-secondary'}`}
                       >
                         {getPlatform(ch.identifier).icon}
                         <span>{ch.name}</span>
                       </button>
                     ))}
                     {integrations.length === 0 && <span className="text-muted text-xs">Henüz bağlı kanal yok. Ayarlar'dan bağlayın.</span>}
                   </div>
                 </div>

                 <div className="card bg-tertiary p-md border-dashed">
                   <div className="flex justify-between items-center mb-md">
                      <div className="flex items-center gap-sm">
                        <Sparkles size={18} className="text-primary" />
                        <span className="font-bold">AI İçerik Asistanı</span>
                      </div>
                   </div>
                   <div className="flex gap-md">
                     <input 
                      type="text" 
                      className="input" 
                      placeholder="Konu girin..." 
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                     />
                     <button className="btn btn-primary" onClick={handleAiGenerate} disabled={isAiLoading}>
                       {isAiLoading ? <Clock className="animate-spin" size={16} /> : <Zap size={16} />}
                       <span>Üret</span>
                     </button>
                   </div>

                   {aiResults.length > 0 && (
                     <div className="mt-lg flex flex-column gap-sm">
                       {aiResults.map((res, i) => (
                         <div key={i} className="bg-secondary p-md rounded-lg border border-light cursor-pointer hover:border-primary transition-all"
                              onClick={() => setContent(res.content)}>
                           <div className="text-xs font-bold text-primary mb-xs">{res.approach} Yaklaşımı</div>
                           <div className="text-sm">{res.content}</div>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>

                 <div className="flex justify-end mt-xl">
                   <button className="btn btn-primary btn-lg" onClick={handlePost} style={{ paddingLeft: '40px', paddingRight: '40px' }}>
                     <Send size={18} />
                     <span>Sıraya Al ve Paylaş</span>
                   </button>
                 </div>
               </div>
            </div>
          )}

          {activeTab === "calendar" && (
            <div className="card p-xl flex items-center justify-center flex-column py-2xl">
              <Calendar size={48} className="text-muted mb-lg" />
              <h3 className="text-lg font-bold">Yayın Takvimi</h3>
              <p className="text-muted max-w-sm text-center">Planlanan tüm içerikleri takvim üzerinde görün ve sürükleyip bırakarak zamanlarını yönetin.</p>
              <button className="btn btn-secondary mt-lg">Tam Ekran Takvimi Aç</button>
            </div>
          )}

          {activeTab === "settings" && (
             <div className="flex flex-column gap-lg">
                <div className="card p-xl">
                  <h3 className="text-lg font-bold mb-md">Postiz API Ayarları</h3>
                  <div className="flex flex-column gap-md">
                    <div className="input-group">
                       <label className="input-label">Host URL</label>
                       <input type="text" className="input" placeholder="https://postiz.domain.com" />
                    </div>
                    <div className="input-group">
                       <label className="input-label">API Key</label>
                       <input type="password" className="input" placeholder="••••••••••••••••" />
                    </div>
                    <button className="btn btn-primary" style={{ width: 'fit-content' }}>
                      Bağlantıyı Kaydet & Test Et
                    </button>
                  </div>
                </div>
             </div>
          )}
        </div>
      </div>

      <style>{`
        .postiz-container {
          padding-bottom: 2rem;
        }
        .flex { display: flex; }
        .flex-column { flex-direction: column; }
        .justify-between { justify-content: space-between; }
        .items-center { align-items: center; }
        .gap-xs { gap: 0.25rem; }
        .gap-sm { gap: 0.5rem; }
        .gap-md { gap: 1rem; }
        .gap-lg { gap: 1.5rem; }
        .gap-xl { gap: 2rem; }
        .p-md { padding: 1rem; }
        .p-xl { padding: 2rem; }
        .mb-xs { margin-bottom: 0.25rem; }
        .mb-sm { margin-bottom: 0.5rem; }
        .mb-md { margin-bottom: 1rem; }
        .mb-lg { margin-bottom: 1.5rem; }
        .mt-xs { margin-top: 0.25rem; }
        .mt-lg { margin-top: 1.5rem; }
        .mt-xl { margin-top: 2rem; }
        .font-bold { font-weight: 700; }
        .text-2xl { font-size: 1.5rem; }
        .text-lg { font-size: 1.125rem; }
        .text-xs { font-size: 0.75rem; }
        .text-sm { font-size: 0.875rem; }
        .uppercase { text-transform: uppercase; }
        .tracking-wider { letter-spacing: 0.05em; }
        .justify-center { justify-content: center; }
        .text-center { text-align: center; }
        .w-10 { width: 2.5rem; }
        .h-10 { height: 2.5rem; }
        .rounded-lg { border-radius: 0.5rem; }
        .bg-secondary { background: var(--bg-secondary); }
        .bg-tertiary { background: var(--bg-tertiary); }
        .border-dashed { border-style: dashed; }
        .border-light { border-color: var(--border-light); }
        .border-bottom { border-bottom: 1px solid var(--border-color); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default PostizCommandCenter;

# 📊 N99 SocialHub Dashboard — Uygulama Mimari Raporu

**Tarih:** 11 Şubat 2026  
**Teknoloji Yığını:** React + TypeScript + Vite  
**Veritabanı:** Supabase (PostgreSQL)  
**AI Servisleri:** fal.ai (Flux, Kling AI, SadTalker)  
**Otomasyon:** n99 Workflow  
**Sosyal Medya API:** LimeSocial

---

## 📁 1. Genel Mimari Yapı

```
src/
├── App.tsx                     # Ana uygulama bileşeni, yönlendirme (routing)
├── main.tsx                    # React uygulamasını başlatan giriş noktası
├── index.css                   # Global stiller ve tema (dark/light mode)
├── components/                 # Yeniden kullanılabilir UI bileşenleri (17 dosya)
├── pages/                      # Sayfa bazlı bileşenler (7 dosya)
├── context/                    # React Context (global state yönetimi)
│   ├── AuthContext.tsx          # Kimlik doğrulama durumu
│   └── DashboardContext.tsx     # Dashboard veri durumu
├── types/                      # TypeScript tip tanımları
│   └── index.ts                 # Tüm veri modelleri
├── utils/                      # Servis ve yardımcı fonksiyonlar (11 dosya)
└── data/                       # Mock / örnek veri
    └── mockData.ts
```

---

## 🔐 2. Kimlik Doğrulama ve Yetkilendirme Sistemi

### 2.1 Kullanıcı Rolleri

| Rol               | Açıklama       | Erişim Alanı                                      |
| ----------------- | -------------- | ------------------------------------------------- |
| `admin`           | Yönetici       | Tüm sistem, müşteri yönetimi, influencer yönetimi |
| `client`          | Müşteri        | Sadece kendi rapor ve metriklerini görür          |
| `content_creator` | İçerik Üretici | Atanan müşteriler için içerik oluşturma araçları  |

### 2.2 Yönlendirme Yapısı (Routing)

| Yol (Path)     | Bileşen             | Yetki                                      |
| -------------- | ------------------- | ------------------------------------------ |
| `/login`       | `LoginPage`         | Herkese açık                               |
| `/admin/login` | `AdminLoginPage`    | Herkese açık                               |
| `/register`    | `RegisterPage`      | Herkese açık                               |
| `/admin`       | `Dashboard` (Admin) | Sadece `admin`                             |
| `/client`      | `ClientDashboard`   | Sadece `client`                            |
| `/creator`     | `CreatorDashboard`  | `content_creator` veya `admin`             |
| `/`            | `RoleBasedRedirect` | Giriş yapan herkes (role göre yönlendirir) |

### 2.3 AuthContext — Kimlik Doğrulama Bağlamı

- **`login(email, password)`**: Supabase ile e-posta/şifre girişi yapar.
- **`register(email, password, companyName, industry)`**: Yeni kullanıcı kaydı oluşturur.
- **`logout()`**: Oturumu sonlandırır.
- **`updateProfile(updates)`**: Kullanıcı profilini günceller.
- **`userRole`**: Aktif kullanıcının rolünü döndürür.
- **`isAdmin`**: Admin yetkisi kontrolü.
- **`isContentCreator`**: İçerik üretici yetkisi kontrolü.

---

## 🧭 3. Admin Dashboard (Ana Panel) — Bölümler ve Butonlar

Admin dashboard, sol menü (Sidebar) üzerinden bölüm değiştirerek çalışır. `activeSection` state değişkeniyle kontrol edilir.

### 3.1 Sidebar (Sol Menü) Navigasyonu

#### 🔷 Genel Bölüm

| Menü Öğesi        | `activeSection` ID | İkon            | Açıklama                               |
| ----------------- | ------------------ | --------------- | -------------------------------------- |
| **Dashboard**     | `dashboard`        | LayoutDashboard | Ana genel bakış sayfası                |
| **Analytics**     | `analytics`        | BarChart3       | Analitik raporlar ve grafikler         |
| **Video Üretici** | `video-generator`  | Video           | AI ile video oluşturma                 |
| **AI Influencer** | `ai-influencer`    | Users           | AI influencer görsel ve reklam üretimi |
| **Zamanlama**     | `schedule`         | Calendar        | Yayın takvimi ve planlama              |
| **İçerikler**     | `content`          | FileText        | İçerik arşivi (badge: 3)               |
| **Kitle**         | `audience`         | Users           | Kitle analizi                          |
| **Performans**    | `performance`      | TrendingUp      | Performans karşılaştırması             |
| **Otomasyon**     | `automation`       | Zap             | Otomasyon ayarları                     |

#### 🔷 Platformlar Bölümü

| Menü Öğesi    | `activeSection` ID | İkon       | Açıklama                     |
| ------------- | ------------------ | ---------- | ---------------------------- |
| **Instagram** | `instagram`        | Instagram  | Instagram özel paneli        |
| **Twitter/X** | `twitter`          | Twitter    | Twitter/X özel paneli        |
| **LinkedIn**  | `linkedin`         | Linkedin   | LinkedIn özel paneli         |
| **TikTok**    | `tiktok`           | Play       | TikTok özel paneli           |
| **Metricool** | `metricool`        | TrendingUp | Metricool entegrasyon paneli |

#### 🔷 Alt Bölüm

| Menü Öğesi         | `activeSection` ID | İkon       | Açıklama                                      |
| ------------------ | ------------------ | ---------- | --------------------------------------------- |
| **Yönetim Paneli** | `admin`            | Shield     | Admin yönetim sayfası (sadece admin görür)    |
| **Bildirimler**    | `notifications`    | Bell       | Bildirim listesi (okunmayan sayısı badge)     |
| **Ayarlar**        | `settings`         | Settings   | Sistem ayarları, entegrasyon yönetimi         |
| **Yardım**         | `help`             | HelpCircle | Yardım & destek                               |
| **Çıkış**          | —                  | LogOut     | Oturumu sonlandırır ve `/login`'e yönlendirir |

#### Sidebar'daki Ek Bileşenler:

- **Müşteri Seçici (Admin)**: Admin ise dropdown ile müşteri seçebilir. Client ise kendi firma adı gösterilir.

---

### 3.2 Header (Üst Çubuk) Butonları

| Buton / Eleman          | İşlev                                                                             |
| ----------------------- | --------------------------------------------------------------------------------- |
| **☰ Menü İkonu**       | Sidebar'ı açıp kapatır                                                            |
| **🔍 Arama Çubuğu**     | (UI mevcut, işlevsel değil)                                                       |
| **🔔 Bildirim İkonu**   | Bildirim panelini açar/kapatır. Okunmayan bildirim sayısını badge olarak gösterir |
| **🌙/☀️ Tema Değiştir** | Dark/Light mode arasında geçiş yapar                                              |
| **🎨 Canva Bağla**      | Canva OAuth entegrasyonu başlatır (PKCE ile)                                      |
| **➕ Yeni İçerik**      | `NewPostModal`'ı açar — yeni içerik oluşturma                                     |
| **👤 Kullanıcı Menüsü** | Dropdown: Profil, Ayarlar, Çıkış seçenekleri                                      |

---

### 3.3 Dashboard Bölümü (`activeSection === 'dashboard'`)

| Bileşen                            | İçerik                                                                                                                                        |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Filtreler**                      | Platform filtresi (Tüm Platformlar / Instagram / Twitter / LinkedIn / TikTok) ve Durum filtresi (Planlandı / Gönderildi / Başarısız / Taslak) |
| **Hızlı İstatistik Badge'leri**    | Planlandı sayısı, Gönderildi sayısı, Başarısız sayısı                                                                                         |
| **KPICards (×2)**                  | — Toplam Takipçi — Etkileşim Oranı — Post Sayısı — Erişim vb.                                                                                 |
| **Engagement Trend Chart**         | Zaman serisi çizgi grafik (beğeni, yorum, paylaşım, erişim)                                                                                   |
| **Platform Distribution Chart**    | Platform dağılımı pasta grafik                                                                                                                |
| **Platform Comparison Chart**      | Platformları karşılaştıran çubuk grafik                                                                                                       |
| **Activity Heatmap**               | Saatlik/günlük aktivite ısı haritası                                                                                                          |
| **Platform Stats**                 | Her platform için detaylı istatistikler                                                                                                       |
| **Son Paylaşımlar kartı**          | Son 5 paylaşım listesi                                                                                                                        |
| **→ "Tümünü Gör" Butonu**          | `activeSection`'ı `content`'e değiştirir                                                                                                      |
| **Schedule Calendar**              | Takvim görünümünde planlanan postlar                                                                                                          |
| **⚠️ Başarısız Gönderiler Alertı** | Başarısız post varsa uyarı kartı gösterir                                                                                                     |
| **→ "Tümünü Gör" Butonu**          | İçerik arşivine yönlendirir                                                                                                                   |

---

### 3.4 Analytics Bölümü (`activeSection === 'analytics'`)

| Bileşen                         | İçerik                          |
| ------------------------------- | ------------------------------- |
| **Engagement Trend Chart**      | Etkileşim trendleri             |
| **Follower Growth Chart**       | Takipçi büyümesi grafiği        |
| **Platform Distribution Chart** | Platform dağılımı               |
| **Activity Heatmap**            | Aktivite ısı haritası           |
| **ReportsSection**              | Rapor oluşturma ve dışa aktarma |

#### ReportsSection Butonları:

| Buton                                | İşlev                              |
| ------------------------------------ | ---------------------------------- |
| **Haftalık / Aylık Rapor Sekmeleri** | Rapor tipi seçimi                  |
| **📥 PDF İndir**                     | Raporu PDF formatında indirir      |
| **📊 CSV İndir**                     | Raporu CSV formatında dışa aktarır |

---

### 3.5 Video Üretici Bölümü (`activeSection === 'video-generator'`)

| Özellik                               | Açıklama                                                |
| ------------------------------------- | ------------------------------------------------------- |
| **Metin → Video (Text-to-Video)**     | Prompt ile AI video üretimi (Kling AI via fal.ai)       |
| **Görsel → Video (Image-to-Video)**   | Resim yükleyip videoya dönüştürme (Kling AI via fal.ai) |
| **Görsel Üretici (Image Generation)** | AI ile görsel üretme (fal.ai Flux Pro / Flux Schnell)   |

#### Video Üretici Butonları:

| Buton                                | İşlev                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------- |
| **Mod Seçimi (Text/Image/Generate)** | Text-to-Video, Image-to-Video veya Image Generation modları               |
| **Provider Seçimi**                  | Kling AI veya Higgsfield seçimi                                           |
| **📤 Görsel Yükle**                  | Drag & Drop veya tıklayarak dosya yükleme                                 |
| **🎬 Video Oluştur**                 | Seçili modda AI video/görsel üretimini başlatır                           |
| **⬇️ İndir**                         | Üretilen video/görseli indirir                                            |
| **⚙️ API Anahtarı Kaydet**           | fal.ai API anahtarını localStorage'a kaydeder                             |
| **Ayar Kontrolleri**                 | Süre (3-20s), En-boy oranı (16:9, 9:16, 1:1, 4:3), Çözünürlük, FPS seçimi |

---

### 3.6 AI Influencer Bölümü (`activeSection === 'ai-influencer'`)

| Özellik                               | Açıklama                                               |
| ------------------------------------- | ------------------------------------------------------ |
| **AI Influencer Görsel Üretimi**      | fal.ai Flux Pro ile yapay influencer görseli oluşturma |
| **Konuşan Influencer (Talking Head)** | SadTalker ile görseli konuşturan video üretimi         |
| **Instagram Reklam Kampanyası**       | n99 webhook'u ile otomatik reklam kampanyası oluşturma |

#### AI Influencer Butonları:

| Buton                                 | İşlev                                                                 |
| ------------------------------------- | --------------------------------------------------------------------- |
| **🤖 Influencer Oluştur**             | Prompt ve ayarlarla AI influencer görseli üretir                      |
| **🗣️ Konuştur**                       | Üretilen görseli SadTalker ile konuşturma videosu oluşturur           |
| **📥 Görseli İndir**                  | Üretilen AI influencer görselini indirir                              |
| **📥 Videoyu İndir**                  | Konuşma videosunu indirir                                             |
| **🔄 Yeniden Üret**                   | Yeni bir influencer görseli üretir                                    |
| **📢 Reklam Kampanyası Oluştur**      | n99 webhook'una istek göndererek Instagram reklam kampanyası başlatır |
| **Model Seçimi**                      | flux-pro / flux-schnell / aura-flow modelleri                         |
| **Cinsiyet / Görünüm / Yaş Ayarları** | İnfluencer karakter özellikleri                                       |

---

### 3.7 Zamanlama Bölümü (`activeSection === 'schedule'`)

| Buton                        | İşlev                                             |
| ---------------------------- | ------------------------------------------------- |
| **➕ Yeni Plan Ekle**        | `NewPostModal`'ı açar                             |
| **Takvim Görünümü**          | Planlanan paylaşımları takvim formatında gösterir |
| **Bekleyen Planlar Listesi** | Planlanmış postların listesi (max 10)             |

---

### 3.8 İçerik Arşivi (`activeSection === 'content'`)

| Buton                 | İşlev                                             |
| --------------------- | ------------------------------------------------- |
| **Durum Filtresi**    | Tüm Durumlar / Planlandı / Gönderildi / Başarısız |
| **📝 İçerik Oluştur** | `NewPostModal`'ı açar                             |
| **Post Listesi**      | Filtrelenmiş postları gösterir (max 20)           |

---

### 3.9 Kitle Analizi (`activeSection === 'audience'`)

| Bileşen                   | İçerik                                            |
| ------------------------- | ------------------------------------------------- |
| **Follower Growth Chart** | Takipçi büyümesi grafiği                          |
| **Sentiment Analysis**    | Duygu analizi (Pozitif / Nötr / Negatif dağılımı) |

---

### 3.10 Performans (`activeSection === 'performance'`)

| Bileşen                       | İçerik                                     |
| ----------------------------- | ------------------------------------------ |
| **Platform Comparison Chart** | Platform bazlı karşılaştırma çubuk grafiği |
| **Top Performing Posts**      | En iyi performans gösteren postlar listesi |

---

### 3.11 Otomasyon (`activeSection === 'automation'`)

**AutomationControls Bileşeni:**

| Kontrol                         | İşlev                                                 |
| ------------------------------- | ----------------------------------------------------- |
| **Otomatik Paylaşım Toggle**    | Otomatik post paylaşımını açar/kapatır                |
| **AI İçerik Önerisi Toggle**    | Yapay zeka ile içerik önerisi özelliğini açar/kapatır |
| **Etkileşim Takibi Toggle**     | Otomatik etkileşim takibi açar/kapatır                |
| **Performans Raporları Toggle** | Otomatik haftalık rapor oluşturmayı açar/kapatır      |

---

### 3.12 Platform Özel Panelleri (`instagram`, `twitter`, `linkedin`, `tiktok`, `metricool`)

| Bileşen                                | İçerik                                |
| -------------------------------------- | ------------------------------------- |
| **KPICards**                           | Platform'a özel KPI göstergeleri      |
| **Engagement Trend Chart**             | Etkileşim trendi                      |
| **Son Paylaşımlar**                    | Son 5 platform paylaşımı              |
| **Metricool Paneline Git (Metricool)** | Yeni sekmede `app.metricool.com` açar |
| **Hashtag Performance (Metricool)**    | Hashtag performansı listesi           |

---

### 3.13 Yönetim Paneli (`activeSection === 'admin'`)

**AdminPage Bileşeni** — Müşteri ve influencer yönetimi:

| Buton / İşlev                   | Açıklama                                                                    |
| ------------------------------- | --------------------------------------------------------------------------- |
| **🔍 Müşteri Ara**              | İsme göre müşteri arama                                                     |
| **➕ Yeni Müşteri Ekle**        | Form ile yeni müşteri kaydı — Firma adı, e-posta, şifre, sektör, rol seçimi |
| **👁️ Müşteri Detayı**           | Müşteri detay modalını açar                                                 |
| **🛡️ Admin Yap / Admin Kaldır** | Müşterinin admin yetkisini toggle eder                                      |
| **💾 Müşteri Kaydet**           | Müşteri bilgilerini günceller                                               |
| **Müşteri Detay Modal İçi:**    |                                                                             |
| — Genel Bilgiler Sekmesi        | Firma adı, e-posta, telefon, website, adres düzenleme                       |
| — Sosyal Hesaplar Sekmesi       | Instagram, Twitter, LinkedIn, TikTok token'ları, Metricool API Key          |
| — Marka Yönergeleri Sekmesi     | AI prompt prefix ve marka yönergeleri metin alanları                        |
| — Influencer Atamaları Sekmesi  | Müşteriye influencer atama/çıkarma                                          |
| **🤖 Influencer Ekle**          | Dropdown'dan influencer seçerek müşteriye atar                              |
| **❌ Influencer Kaldır**        | Atanmış influencer'ı müşteriden çıkarır                                     |

---

### 3.14 Ayarlar / Entegrasyonlar (`activeSection === 'settings'`)

**IntegrationsManager Bileşeni:**

| Buton / İşlev                  | Açıklama                                                                 |
| ------------------------------ | ------------------------------------------------------------------------ |
| **Platform Bağlantı Kartları** | Her platform (Instagram, Twitter, LinkedIn, TikTok) için bağlantı durumu |
| **🔗 OAuth ile Bağla**         | Platform OAuth akışını başlatır                                          |
| **🔑 API Key Gir**             | Manuel API anahtarı girişi                                               |
| **🧪 Bağlantıyı Test Et**      | Platform bağlantısını test eder                                          |
| **💾 Kaydet**                  | Bağlantı ayarlarını kaydeder                                             |
| **🔄 Tümünü Senkronize Et**    | Tüm platform verilerini senkronize eder                                  |
| **LimeSocial Ayarları Kartı**  |                                                                          |
| — API Key Alanı                | LimeSocial API anahtarı girişi                                           |
| — Hesaplar JSON Alanı          | Bağlı LimeSocial hesapları (JSON formatında)                             |
| — 🧪 Bağlantıyı Test Et        | LimeSocial API bağlantısını test eder                                    |
| — 💾 Kaydet                    | LimeSocial ayarlarını kaydeder                                           |

---

### 3.15 Bildirimler (`activeSection === 'notifications'`)

| İçerik                  | Açıklama                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| Son bildirimler listesi | (Şu an placeholder metin var, gerçek bildirim listesi header'daki panel üzerinden erişilebilir) |

---

### 3.16 Yardım & Destek (`activeSection === 'help'`)

| Buton                | İşlev                                  |
| -------------------- | -------------------------------------- |
| **📖 Kılavuzu Oku**  | Hızlı başlangıç kılavuzu (placeholder) |
| **📩 Talep Oluştur** | Destek talebi oluşturma (placeholder)  |

---

### 3.17 Footer Linkleri

| Link                  | İşlev                  |
| --------------------- | ---------------------- |
| **Yardım**            | (Placeholder bağlantı) |
| **Gizlilik**          | (Placeholder bağlantı) |
| **Kullanım Şartları** | (Placeholder bağlantı) |

---

## 📝 4. Yeni Paylaşım Modalı (NewPostModal)

Modal `➕ Yeni İçerik` butonuyla açılır.

| Alan / Buton                       | İşlev                                                               |
| ---------------------------------- | ------------------------------------------------------------------- |
| **Platform Seçimi**                | Instagram, Twitter, LinkedIn, TikTok toggle butonları (çoklu seçim) |
| **İçerik Metin Alanı**             | Post içeriği yazma                                                  |
| **✨ AI ile Oluştur**              | n99 webhook üzerinden AI ile içerik üretir (caption + video URL)    |
| **Gönderi Türü**                   | Normal Post, Reel / Video, Hikaye (Story) seçimi                    |
| **� Görsel URL**                   | Görsel URL'si ekleme                                                |
| **📅 Tarih/Saat Seçimi**           | Planlama tarihi ve saati                                            |
| **🕐 Optimal Saat**                | Platform'a göre en iyi paylaşım saatini önerir                      |
| **�📤 Hemen Paylaşım / 📅 Planla** | Postu hemen yayınlar veya planlar                                   |
| — Hemen paylaşım:                  | LimeSocial API üzerinden postu yayınlar                             |
| — Planla:                          | Postu Supabase'e kaydeder                                           |
| **✕ Kapat**                        | Modalı kapatır                                                      |

---

## 👤 5. Müşteri (Client) Dashboard

Müşteri rolündeki kullanıcıların gördüğü arayüz:

### 5.1 Client Sidebar Navigasyonu

| Menü            | Açıklama                |
| --------------- | ----------------------- |
| **Dashboard**   | Genel bakış             |
| **Raporlarım**  | Haftalık/aylık raporlar |
| **Paylaşımlar** | İçerik listesi          |

### 5.2 Client Dashboard Butonları

| Buton              | İşlev                      |
| ------------------ | -------------------------- |
| **☰ Menü**        | Sidebar'ı açar/kapatır     |
| **🌙/☀️ Tema**     | Dark/Light mode değiştirir |
| **🔔 Bildirimler** | Bildirim panelini açar     |
| **🔄 Yenile**      | Verileri yeniden yükler    |
| **📥 Rapor İndir** | Haftalık rapor indirir     |
| **🚪 Çıkış**       | Oturumu sonlandırır        |

### 5.3 Client Dashboard İçeriği

| Bileşen                   | İçerik                                          |
| ------------------------- | ----------------------------------------------- |
| **KPI Kartları**          | Takipçi, Etkileşim, Erişim, Gösterim metrikleri |
| **Follower Growth Chart** | Haftalık takipçi büyümesi grafiği               |
| **Platform Distribution** | Platform dağılımı                               |
| **Top Posts**             | En iyi paylaşımlar                              |
| **Weekly Report Card**    | Haftalık özet rapor kartı                       |

---

## 🎨 6. Creator (İçerik Üretici) Dashboard

İçerik üreticilerinin gördüğü arayüz:

### 6.1 Creator Sidebar Navigasyonu

| Menü                | Açıklama                                          |
| ------------------- | ------------------------------------------------- |
| **Genel Bakış**     | Dashboard ana sayfa                               |
| **İçerik Takvimi**  | Planlanan içeriklerin takvim görünümü             |
| **Creative Studio** | Video üretici, AI Influencer, yeni post oluşturma |
| **Marka Rehberi**   | Seçili müşterinin marka yönergeleri               |
| **Müşteri Seçimi**  | Atanan müşteriler arasında geçiş                  |

### 6.2 Creator Dashboard Butonları

| Buton              | İşlev                      |
| ------------------ | -------------------------- |
| **☰ Menü**        | Sidebar'ı açar/kapatır     |
| **🌙/☀️ Tema**     | Dark/Light mode değiştirir |
| **➕ Yeni İçerik** | NewPostModal açar          |
| **🚪 Çıkış**       | Oturumu sonlandırır        |

### 6.3 Creative Studio Butonları

| Buton                      | İşlev                                  |
| -------------------------- | -------------------------------------- |
| **📝 Yeni İçerik Oluştur** | NewPostModal'ı açar                    |
| **🎬 Video Üretici**       | Video Generator bölümüne gider         |
| **🤖 AI Influencer**       | AI Influencer Generator bölümüne gider |

### 6.4 Content Calendar (İçerik Takvimi)

| İşlev             | Açıklama                                           |
| ----------------- | -------------------------------------------------- |
| Takvim görünümü   | Aylık takvimde planlanan postları gösterir         |
| ◀ / ▶ Navigasyon  | Aylar arası geçiş                                  |
| Post tooltip'leri | Her güne tıklandığında o günün postlarını gösterir |

### 6.5 Brand Guide (Marka Rehberi)

| Bilgi             | Açıklama                              |
| ----------------- | ------------------------------------- |
| AI Prompt Prefix  | Müşteriye özel AI komut ön eki        |
| Marka Yönergeleri | Marka renkleri, ton, stil yönergeleri |
| Sektör bilgisi    | Müşteri sektörü                       |

---

## 🔧 7. Servis Katmanı (Backend İletişimi)

### 7.1 Supabase Service (`supabaseService.ts`)

| Fonksiyon                       | Açıklama                          |
| ------------------------------- | --------------------------------- |
| `fetchPosts()`                  | Tüm postları getirir              |
| `createPost(post)`              | Yeni post oluşturur               |
| `updatePost(id, updates)`       | Post günceller                    |
| `deletePost(id)`                | Post siler                        |
| `fetchStats()`                  | Platform istatistiklerini getirir |
| `fetchNotifications()`          | Bildirimleri getirir              |
| `addNotification(notification)` | Bildirim ekler                    |
| `markNotificationRead(id)`      | Bildirimi okundu işaretler        |

### 7.2 n99 Service (`n99Service.ts`)

| Fonksiyon                                                  | Açıklama                               |
| ---------------------------------------------------------- | -------------------------------------- |
| `fetchPosts()`                                             | n99 API'den postları çeker             |
| `createPost(postData, limeSocialSettings)`                 | n99 webhook'una post gönderir          |
| `fetchStats()`                                             | Performans metriklerini çeker          |
| `updatePost(id, updates)`                                  | Planlanmış postu günceller             |
| `generateContent(content, customerId, limeSocialSettings)` | AI ile içerik (caption + video) üretir |
| `publishToLimeSocial(post, limeSocialSettings)`            | LimeSocial üzerinden yayınlar          |

### 7.3 LimeSocial Service (`limeSocialService.ts`)

| Fonksiyon                     | Açıklama                        |
| ----------------------------- | ------------------------------- |
| `publishPost(post, settings)` | Sosyal medyaya post yayınlar    |
| `getMe(apiKey)`               | Kullanıcı bilgilerini çeker     |
| `getAccounts(apiKey)`         | Bağlı sosyal hesapları listeler |
| `testConnection(apiKey)`      | API bağlantısını test eder      |

### 7.4 LTX Video Service (`ltxVideoService.ts`)

| Fonksiyon                        | Açıklama                             |
| -------------------------------- | ------------------------------------ |
| `generateFromText(request)`      | Prompt'tan Kling AI ile video üretir |
| `generateFromImage(request)`     | Görselden Kling AI ile video üretir  |
| `setApiKey(key)` / `getApiKey()` | API anahtarı yönetimi                |
| `isConfigured()`                 | API yapılandırma kontrolü            |

### 7.5 Higgsfield Service (`higgsfieldService.ts`)

| Fonksiyon                         | Açıklama                            |
| --------------------------------- | ----------------------------------- |
| `generateVideo(request)`          | fal.ai Kling Video ile video üretir |
| `generateImage(request)`          | fal.ai Flux Pro ile görsel üretir   |
| `pollStatus(requestId, endpoint)` | Asenkron üretim durumunu takip eder |
| `isConfigured()`                  | Yapılandırma kontrolü               |

### 7.6 AI Influencer Service (`aiInfluencerService.ts`)

| Fonksiyon                     | Açıklama                                     |
| ----------------------------- | -------------------------------------------- |
| `generateInfluencer(request)` | fal.ai Flux ile AI influencer görseli üretir |
| `isConfigured()`              | API yapılandırma kontrolü                    |

### 7.7 AI Talking Service (`aiTalkingService.ts`)

| Fonksiyon                       | Açıklama                                                  |
| ------------------------------- | --------------------------------------------------------- |
| `generateTalkingVideo(request)` | SadTalker ile konuşan video üretir (görsel + ses → video) |
| `isConfigured()`                | API yapılandırma kontrolü                                 |

### 7.8 Influencer Service (`influencerService.ts`)

| Fonksiyon                                  | Açıklama                             |
| ------------------------------------------ | ------------------------------------ |
| `list()`                                   | Tüm influencer'ları listeler         |
| `create(influencer)`                       | Yeni influencer oluşturur            |
| `delete(id)`                               | Influencer siler                     |
| `assignToClient(clientId, influencerId)`   | Müşteriye influencer atar            |
| `removeFromClient(clientId, influencerId)` | Müşteriden influencer çıkarır        |
| `getByClient(clientId)`                    | Müşterinin influencer'larını getirir |
| `getAssignments()`                         | Tüm atamaları listeler               |

### 7.9 Report Service (`reportService.ts`)

| Fonksiyon                         | Açıklama                     |
| --------------------------------- | ---------------------------- |
| `listReports(clientId)`           | Müşteri raporlarını listeler |
| `generateWeeklyReport(clientId)`  | Haftalık rapor oluşturur     |
| `generateMonthlyReport(clientId)` | Aylık rapor oluşturur        |
| `deleteReport(id)`                | Rapor siler                  |

---

## 🗄️ 8. Veri Modelleri (Types)

| Tip                  | Açıklama                                                                   |
| -------------------- | -------------------------------------------------------------------------- |
| `Post`               | Sosyal medya paylaşımı (id, clientId, content, platforms, status, metrics) |
| `PostStatus`         | `scheduled` / `posted` / `failed` / `draft`                                |
| `Platform`           | `instagram` / `twitter` / `linkedin` / `tiktok`                            |
| `PlatformStats`      | Platform istatistikleri (takipçi, etkileşim, erişim)                       |
| `Client`             | Müşteri bilgileri (firma, sektör, entegrasyonlar, marka yönergeleri)       |
| `Notification`       | Bildirim (tip, mesaj, okundu durumu)                                       |
| `User`               | Kullanıcı (id, ad, e-posta, rol)                                           |
| `Influencer`         | AI Influencer (ad, avatar, stil, kişilik, hedef kitle)                     |
| `ClientInfluencer`   | Müşteri-Influencer ataması                                                 |
| `ClientAsset`        | Müşteri dosyaları (logo, marka görseli, belge, video)                      |
| `Report`             | Rapor (haftalık/aylık, veri, PDF URL)                                      |
| `PlatformConnection` | Platform bağlantı ayarları (token, API key)                                |
| `SentimentData`      | Duygu analizi verileri                                                     |
| `HashtagPerformance` | Hashtag performansı                                                        |

---

## 🔄 9. State Yönetimi (DashboardContext)

**DashboardContext** tüm dashboard verilerini merkezi olarak yönetir:

| State                                 | Açıklama                   |
| ------------------------------------- | -------------------------- |
| `posts`                               | Tüm paylaşımlar            |
| `notifications`                       | Bildirimler                |
| `isDarkMode`                          | Tema durumu                |
| `selectedPlatform` / `selectedStatus` | Aktif filtreler            |
| `automationEnabled`                   | Otomasyon durumu           |
| `automationSettings`                  | Otomasyon ayrıntı ayarları |
| `clients`                             | Müşteri listesi            |
| `activeClient`                        | Seçili müşteri             |
| `limeSocialSettings`                  | LimeSocial ayarları        |

| Action                          | Açıklama                            |
| ------------------------------- | ----------------------------------- |
| `addPost(post)`                 | Yeni post ekler                     |
| `updatePost(id, updates)`       | Post günceller                      |
| `toggleDarkMode()`              | Tema değiştirir                     |
| `addNotification(notification)` | Bildirim ekler                      |
| `clearNotifications()`          | Tüm bildirimleri temizler           |
| `setActiveClientId(id)`         | Aktif müşteriyi değiştirir          |
| `publishPost(post)`             | LimeSocial üzerinden postu yayınlar |

---

## 🏗️ 10. Dış Bağımlılıklar ve API'ler

| Servis                | Kullanım                     | Anahtar Env Variable                                           |
| --------------------- | ---------------------------- | -------------------------------------------------------------- |
| **Supabase**          | Veritabanı, Kimlik Doğrulama | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`                  |
| **n99**               | Otomasyon iş akışları        | `VITE_N8N_API_URL`, `VITE_N8N_API_KEY`, `VITE_N8N_WEBHOOK_URL` |
| **fal.ai**            | AI video/görsel üretimi      | `VITE_FAL_API_KEY`                                             |
| **LimeSocial**        | Sosyal medya yayınlama       | `VITE_LIMESOCIAL_API_KEY`                                      |
| **n99 AI Influencer** | Reklam kampanyası            | `VITE_N8N_AI_INFLUENCER_TEST_WEBHOOK_URL`                      |
| **Canva**             | Tasarım entegrasyonu         | OAuth (PKCE)                                                   |

---

## 📊 11. Bileşen Hiyerarşisi

```
App
├── AuthProvider
│   └── BrowserRouter → Routes
│       ├── /login → LoginPage
│       ├── /admin/login → AdminLoginPage
│       ├── /register → RegisterPage
│       ├── /admin → ProtectedRoute → Dashboard
│       │   └── DashboardProvider → DashboardContent
│       │       ├── Sidebar
│       │       ├── Header
│       │       ├── KPICards
│       │       ├── Charts (Engagement, Platform, Follower, Comparison)
│       │       ├── PlatformStats
│       │       ├── PostList
│       │       ├── ActivityHeatmap
│       │       ├── ScheduleCalendar
│       │       ├── EngagementMetrics (Sentiment, Hashtag, TopPosts, Automation)
│       │       ├── ReportsSection
│       │       ├── VideoGenerator
│       │       ├── AIInfluencerGenerator
│       │       ├── IntegrationsManager
│       │       ├── AdminPage
│       │       │   └── CustomerDetailModal
│       │       └── NewPostModal
│       ├── /client → ProtectedRoute → ClientDashboardWrapper
│       │   └── DashboardProvider → ClientDashboard
│       │       ├── ClientSidebar
│       │       ├── KPICard (×4)
│       │       ├── WeeklyReportCard
│       │       ├── FollowerGrowthChart
│       │       ├── PlatformDistributionChart
│       │       └── TopPostsList
│       └── /creator → ProtectedRoute → CreatorDashboardWrapper
│           └── DashboardProvider → CreatorDashboard
│               ├── CreatorSidebar
│               ├── ContentCalendar
│               ├── CreativeStudio
│               ├── BrandGuide
│               ├── VideoGenerator
│               ├── AIInfluencerGenerator
│               └── NewPostModal
```

---

## ✅ 12. Özet

Bu uygulama, **N99 SocialHub** adıyla çalışan, çok kullanıcılı bir **sosyal medya yönetim platformudur**. Temel yetenekleri:

1. **Çok Roller Destek**: Admin, Müşteri ve İçerik Üretici rolleri
2. **Sosyal Medya Yönetimi**: Post oluşturma (Normal, Reel, Story), zamanlama, yayınlama (LimeSocial üzerinden)
3. **AI İçerik Üretimi**: Video üretimi (Kling AI), görsel üretimi (Flux Pro), konuşan influencer videoları (SadTalker)
4. **Otomasyon**: n99 iş akışları ile otomatik içerik üretimi ve paylaşım
5. **Analitik**: Etkileşim grafikleri, platform karşılaştırması, duygu analizi, hashtag performansı
6. **Müşteri Yönetimi**: Admin panelinde müşteri ekleme/düzenleme, influencer atama
7. **Raporlama**: Haftalık/aylık rapor oluşturma, PDF/CSV dışa aktarma
8. **Entegrasyon**: Instagram, Twitter/X, LinkedIn, TikTok, Metricool, LimeSocial, Canva

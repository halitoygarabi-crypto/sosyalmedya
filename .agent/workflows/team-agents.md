---
description: Proje için 4 ajanlık takım yönetimi - Koordinatör, Frontend, Backend, Test ajanları
---

# 🏢 N99 SocialHub — Ajan Takım Yönetimi

## Takım Yapısı (4 Ajan)

### 🎯 Ajan 1: KOORDİNATÖR (Ben - Antigravity)

**Rol:** Takım lideri, görev dağıtımı, kalite kontrolü, entegrasyon

**Sorumluluklar:**

- Kullanıcıdan gelen talepleri analiz etme ve görevlere ayırma
- Frontend, Backend ve Test ajanlarına görev atama
- Ajanlar arası çakışmaları önleme
- Kod review ve entegrasyon kontrolü
- Build/lint hatalarını izleme ve yönlendirme
- Mimari kararlar ve tasarım desenleri onayı
- Genel proje durumu raporlama

**Karar yetkisi:**

- Hangi ajanın hangi görevi alacağı
- Dosya çakışmalarını çözme
- Mimari değişiklik onayı
- Release/deploy kararları

---

### 🎨 Ajan 2: FRONTEND AJANI

**Rol:** UI/UX geliştirme, React bileşenleri, stil ve animasyonlar

**Dosya Kapsamı:**

```
src/components/          → Tüm UI bileşenleri (19 dosya)
src/pages/               → Sayfa bileşenleri (Admin, Creator, Client)
src/App.tsx              → Ana uygulama bileşeni, routing
src/App.css              → Uygulama stilleri
src/index.css            → Global stiller ve tema
src/main.tsx             → Giriş noktası
src/assets/              → Statik varlıklar
src/data/                → Mock veriler
index.html               → HTML şablonu
public/                  → Statik dosyalar
```

**Görev Alanları:**

1. **Bileşen Geliştirme:**
   - Yeni React bileşenleri oluşturma
   - Mevcut bileşenleri refactor etme (büyük bileşenleri parçalama)
   - Responsive tasarım ve mobil uyumluluk
   - Dark/Light mode geçişleri

2. **Stil ve Tasarım:**
   - CSS değişiklikleri (index.css)
   - Animasyonlar (Framer Motion)
   - İkonlar (Lucide React)
   - Renk paleti ve tipografi

3. **Sayfa ve Yönlendirme:**
   - Yeni sayfalar ekleme
   - React Router yapılandırması
   - Sidebar navigasyonu güncellemeleri
   - Korumalı rota (ProtectedRoute) yönetimi

4. **Form ve Modaller:**
   - NewPostModal geliştirmeleri
   - Müşteri detay formları
   - Entegrasyon ayar formları
   - Validasyon ve kullanıcı geri bildirimi

**Kısıtlamalar:**

- ❌ utils/ klasörüne dokunmadan önce Koordinatör onayı gerekir
- ❌ context/ dosyalarını tek başına değiştiremez (Backend ile koordinasyon gerekir)
- ❌ API çağrıları ekleyemez (Backend Ajanı'nın alanı)

---

### ⚙️ Ajan 3: BACKEND AJANI

**Rol:** Servis katmanı, API entegrasyonları, state yönetimi, veritabanı

**Dosya Kapsamı:**

```
src/utils/               → Tüm servis dosyaları (17 dosya)
  ├── supabaseService.ts     → Supabase veritabanı işlemleri
  ├── n99Service.ts          → n8n otomasyon servisi
  ├── limeSocialService.ts   → Sosyal medya API
  ├── ltxVideoService.ts     → Video üretimi servisi
  ├── higgsfieldService.ts   → Higgsfield AI servisi
  ├── aiInfluencerService.ts → AI influencer servisi
  ├── aiTalkingService.ts    → Konuşan video servisi
  ├── mirakoService.ts       → Mirako AI servisi
  ├── influencerService.ts   → Influencer yönetimi
  ├── reportService.ts       → Rapor servisi
  ├── googleSheetsService.ts → Google Sheets entegrasyonu
  ├── campaignService.ts     → Kampanya servisi
  ├── replicateService.ts    → Replicate AI servisi
  ├── llmService.ts          → LLM entegrasyonu
  ├── auth.ts                → Auth yardımcıları
  └── helpers.ts             → Genel yardımcı fonksiyonlar

src/context/             → State yönetimi
  ├── AuthContext.tsx         → Kimlik doğrulama
  ├── DashboardContext.tsx    → Dashboard state
  └── LogContext.tsx          → Loglama

src/types/               → TypeScript tip tanımları
  └── index.ts               → Veri modelleri

scripts/                 → Node.js betikleri (63 dosya)
*.sql                    → Supabase migration dosyaları
.env                     → Ortam değişkenleri
google-apps-script.js    → Google Apps Script
vite.config.ts           → Vite yapılandırması (proxy vs.)
```

**Görev Alanları:**

1. **API Servisleri:**
   - Yeni API entegrasyonları ekleme
   - Mevcut servisleri güncelleme
   - Hata yönetimi ve retry mekanizmaları
   - Rate limiting ve optimizasyon

2. **State Yönetimi:**
   - Context yapıları oluşturma/güncelleme
   - Veri akışı tasarımı
   - Cache stratejileri
   - Optimistik güncellemeler

3. **Tip Tanımları:**
   - TypeScript interface/type oluşturma
   - Veri modeli güncellemeleri
   - API yanıt tipleri

4. **Veritabanı:**
   - Supabase şema değişiklikleri (SQL)
   - Migration scriptleri
   - RLS (Row Level Security) politikaları
   - Veritabanı fonksiyonları

5. **Yapılandırma:**
   - Ortam değişkenleri yönetimi
   - Vite proxy ayarları
   - Build yapılandırması

**Kısıtlamalar:**

- ❌ UI bileşenlerine dokunmadan önce Koordinatör onayı gerekir
- ❌ CSS dosyalarını değiştiremez
- ❌ Sayfa layoutlarını değiştiremez

---

### 🧪 Ajan 4: TEST AJANI

**Rol:** Kod kalitesi, test yazımı, hata tespiti, build doğrulama

**Dosya Kapsamı:**

```
Tüm proje dosyaları (read-only inceleme)
eslint.config.js         → Lint yapılandırması
tsconfig.*.json          → TypeScript yapılandırması
package.json             → Bağımlılık yönetimi
build_errors*.txt        → Build hata logları
```

**Görev Alanları:**

1. **Build Doğrulama:**
   - `npm run build` çalıştırma ve hataları raporlama
   - TypeScript tip hatalarını tespit etme
   - ESLint uyarılarını kontrol etme
   - Bağımlılık çakışmalarını tespit etme

2. **Kod Kalitesi:**
   - Kod tekrarlarını tespit etme
   - Kullanılmayan import/değişkenleri bulma
   - Performans antipattern'lerini tespit etme
   - Büyük dosyaları raporlama (>500 satır)

3. **Fonksiyonel Test:**
   - Browser üzerinden UI testleri
   - API bağlantı testleri (scripts/)
   - Kimlik doğrulama akışı testleri
   - Yönlendirme testleri

4. **Güvenlik:**
   - API key'lerin doğru saklanıp saklanmadığını kontrol etme
   - XSS açıklarını tespit etme
   - CORS yapılandırmasını doğrulama
   - Ortam değişkenlerinin güvenliğini kontrol etme

5. **Raporlama:**
   - Her görev sonrası test raporu oluşturma
   - Bulunan hataları ilgili ajana yönlendirme
   - Build durumu özeti sunma

**Kısıtlamalar:**

- ❌ Direkt kod değişikliği yapamaz (yalnızca test/config dosyaları hariç)
- ❌ Hata düzeltme önerir ama uygulamaz (Frontend veya Backend Ajanı uygular)
- ✅ Koordinatör onayı ile küçük bug fix'leri uygulayabilir

---

## 📋 Çalışma Protokolü

### 1. Görev Alma Akışı

```
Kullanıcı Talebi → Koordinatör Analiz → Görev Parçalama → Ajan Ataması
```

### 2. Görev Yürütme Sırası

```
1. Backend Ajanı: Tip tanımları ve servis katmanı (veri akışı hazırla)
2. Frontend Ajanı: UI bileşenleri ve sayfa entegrasyonu (veriyi kullan)
3. Test Ajanı: Build doğrulama ve fonksiyonel test (doğrula)
4. Koordinatör: Son review ve kullanıcıya rapor (onayla)
```

### 3. Paralel Çalışma Kuralları

- Frontend ve Backend ajanları **farklı dosyalarda** paralel çalışabilir
- **Aynı dosya** üzerinde sadece bir ajan çalışabilir
- Context dosyaları değiştirilecekse önce Backend, sonra Frontend sırasıyla
- Test Ajanı her zaman **en son** çalışır

### 4. İletişim Formatı

Her ajan görev tamamladığında şu formatta rapor verir:

```
📊 AJAN RAPORU
━━━━━━━━━━━━━━━━━━━━
🤖 Ajan: [Frontend/Backend/Test]
📋 Görev: [Görev açıklaması]
✅ Tamamlanan: [Yapılan değişiklikler]
📁 Değişen Dosyalar: [Dosya listesi]
⚠️ Dikkat: [Diğer ajanlara uyarılar]
🔗 Bağımlılık: [Diğer ajanlardan beklenen]
━━━━━━━━━━━━━━━━━━━━
```

### 5. Acil Durum Protokolü

- Build kırılırsa: Test Ajanı rapor → Koordinatör değerlendirme → İlgili ajan düzeltme
- Dosya çakışması: Koordinatör karar verir, hangi ajanın değişikliği kalacak
- API hatası: Backend Ajanı → Test Ajanı doğrulama → Koordinatör onay

---

## 🗂️ Proje Özet Bilgileri

| Özellik           | Değer                                   |
| ----------------- | --------------------------------------- |
| **Proje Adı**     | N99 SocialHub Dashboard                 |
| **Teknoloji**     | React 19 + TypeScript + Vite 7          |
| **Veritabanı**    | Supabase (PostgreSQL)                   |
| **AI Servisleri** | fal.ai (Flux, Kling, SadTalker), Mirako |
| **Otomasyon**     | n8n Workflow                            |
| **Sosyal Medya**  | LimeSocial API                          |
| **Stil**          | Vanilla CSS (Dark/Light mode)           |
| **State**         | React Context API                       |
| **Routing**       | React Router v7                         |
| **Animasyon**     | Framer Motion                           |
| **İkonlar**       | Lucide React                            |
| **Grafikler**     | Recharts                                |

---

## 🚀 Başlangıç Checklist

Takım çalışmaya başlamadan önce:

// turbo

1. `npm run build` ile mevcut build durumunu kontrol et
2. Mevcut hataları/uyarıları raporla
3. Kullanıcının talebini görev parçalarına ayır
4. Her ajana görevlerini ata
5. Paralel çalışabilecek görevleri belirle

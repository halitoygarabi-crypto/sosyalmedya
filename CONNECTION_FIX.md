# Sosyal Medya Bağlantı Problemi Çözüm Rehberi

Mevcut n8n akışlarındaki temel problem, **Instagram Graph API**'nin çok sıkı güvenlik ve onay süreçlerine tabi olmasıdır. n8n üzerindeki `httpRequest` düğmeleriyle (nodes) bu süreci manuel yönetmek oldukça zordur.

## En Makul Çözüm Planı

### 1. n8n'de "Native" Düğmeleri Kullanın
Manuel HTTP request yerine n8n'in yerleşik **Instagram Business**, **LinkedIn** ve **Twitter** düğmelerini kullanın. Bu düğmeler:
- Refresh token değişimini otomatik yapar.
- OAuth sürecini n8n üzerinden çok daha kolay yönetir.

### 2. Meta Tarafındaki Eksikler (Kritik)
Instagram bağlantısının çalışmamasının en yaygın 3 sebebi:
- **İşletme Hesabı:** Instagram hesabınızın mutlaka bir **Facebook Sayfasına bağlı** bir "Professional/Business" hesabı olması gerekir.
- **App Mode:** Meta Developer App'iniz "Development" modundaysa, sadece siz (admin) giriş yapabilirsiniz. Canlıya almak için "App Review" süreci gerekebilir.
- **Redirect URI:** Meta panelinde Webhook URL'nizi (`https://n8n.polmarkai.pro/webhook/instagram-auth`) "Valid OAuth Redirect URIs" alanına eklediğinizden emin olun.

### 3. Alternatif: Köprü Servis Kullanımı (Önerilen)
Eğer Meta'nın karmaşık "App Review" süreçleriyle uğraşmak istemiyorsanız, n8n ile şu servislerden birini köprü olarak kullanmak en hızlı yöntemdir:
- **Ayrshare:** Sosyal medya API'leri için basitleştirilmiş bir katmandır. n8n düğmesi vardır.
- **Metricool:** n8n ile veri gönderip, paylaşımı Metricool dashboard'u üzerinden onaylamak (Mevcut akışlarınızda bu hazırlık var).

## Dashboard'da Yapılan Güncellemeler
- **Integrations Manager:** Artık "Bağlan" butonu gerçek bir OAuth akışı tetiklemek üzere hazırlandı.
- **New Post Modal:** Kapalı olan platform seçimleri tekrar aktif edildi.
- **n8n Auth Workflow:** `n8n-instagram-auth-v2.json` dosyası oluşturuldu. Bu dosyayı n8n'e import ederek token'ları doğrudan Supabase'e kaydedebilirsiniz.

---
**Öneri:** İlk olarak `n8n-instagram-auth-v2.json` dosyasını n8n'e import edin ve Meta Developer panelinde Redirect URI'yi güncelleyin.

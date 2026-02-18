---
description: React bileşenlerini mantıksal parçalara ayırma ve refactor etme kuralları
---

Bu workflow, büyüyen React bileşenlerini (300+ satır) daha küçük, yönetilebilir ve bağlamdan kopmayan parçalara ayırmak için kullanılır.

### Refactor Kuralları (AI Standartı)

1. **Satır Sınırı**: Bir `.tsx` dosyası 400 satırı geçtiğinde veya bir bileşen içinde 3'ten fazla ana modül (örn: Dashboard + Analytics + Archive) barındırdığında refactor sürecini başlat.
2. **Dizin Yapısı**:
   - Parçalanan bileşenleri `src/components/[ComponentName]/` klasörü altına taşı.
   - Eğer sayfa bazlı ise `src/pages/[PageName]/components/` yapısını kullan.
3. **State Yönetimi**:
   - Mümkünse karmaşık logic ve state'leri `hooks/` klasörü altına yeni bir Custom Hook olarak taşı (örn: `useCreatorDashboard.ts`).
4. **Prop Drills**: Bileşenleri bölerken çok fazla prop geçişi oluyorsa, Context API veya mevcut `DashboardContext`'i verimli kullan.
5. **Tip Tanımları**: Tipleri `src/types/index.ts` dosyasına veya ilgili klasördeki `.types.ts` dosyasına çıkar.

### Uygulama Adımları

1. **Analiz**: Dosyadaki bağımsız `render` bloklarını (örn: `activeSection === 'content' && (...)`) tespit et.
2. **Alt Bileşen Oluşturma**: Her bağımsız blok için `src/components/` altında yeni bir dosya oluştur.
3. **Prop Tanımlama**: Alt bileşenin çalışması için gereken minimum veriyi ve fonksiyonları Interface olarak tanımlayın.
4. **Entegrasyon**: Ana dosyada ilgili bloğu silip yeni oluşturduğun bileşeni import et ve çağır.
5. **Doğrulama**: `npm run dev` çıktısında hata olup olmadığını ve tasarımın bozulup bozulmadığını kontrol et.

// turbo-all 3. Büyük dosyaları küçültürken bu adımları takip et ve her adımda kullanıcıya bilgi ver.

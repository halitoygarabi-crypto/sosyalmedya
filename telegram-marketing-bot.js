import { Bot } from 'grammy';
import fs from 'fs';
import path from 'path';

// Bot token ve yetkili kullanıcı ID'si
const token = '8249050995:AAE0rwG8CycoJc15MaztNu49_EDbaxEzyzQ';
const authorizedUserId = 7564354415;

// Bot instance'ını oluştur
const bot = new Bot(token);

// Pazarlama ürün bağlamını (context) oku
let productContext = '';
try {
  const contextPath = path.resolve('.agent', 'product-marketing-context.md');
  productContext = fs.readFileSync(contextPath, 'utf8');
} catch (error) {
  console.log('Ürün bağlamı dosyası okunamadı. Bot sınırlı bağlam ile çalışacak.');
}

// Güvenlik: Yalnızca yetkili kullanıcıya yanıt ver
bot.use(async (ctx, next) => {
  if (ctx.from?.id !== authorizedUserId) {
    console.log(`Yetkisiz erişim denemesi: ID ${ctx.from?.id}`);
    return;
  }
  await next();
});

// /start komutu
bot.command('start', (ctx) => {
  const welcomeMessage = `
🚀 *N99 SocialHub Pazarlama Ajanına (Ajan 5) Hoş Geldin!*

Ben senin kişisel N99 Pazarlama ve Büyüme Uzmanınım. 32 farklı pazarlama disiplininde (SEO, Metin Yazarlığı, CRO, E-posta vb.) ustayım.

Aşağıdaki komutları kullanabilir veya bana direkt soru sorabilirsin:

/seo - Hızlı SEO tüyoları ve kelime önerileri
/copy - Landing page veya reklam metni yazdır
/ideas - Yeni müşteri bulmak için büyüme fikirleri
/help - Kullanım rehberi

_Sana nasıl yardımcı olabilirim?_
  `;
  ctx.reply(welcomeMessage, { parse_mode: 'Markdown' });
});

// /help komutu
bot.command('help', (ctx) => {
  ctx.reply(
    `Bana şu konularda her şeyi sorabilirsin:\n\n` +
    `1. *Metin Yazarlığı*: "Kayıt ol butonunun altındaki metni nasıl iyileştiririm?"\n` +
    `2. *Büyüme (Growth)*: "Mevcut ajanslara N99'u nasıl satarım?"\n` +
    `3. *Sosyal Medya*: "Bu hafta LinkedIn'de ne paylaşalım?"\n` +
    `4. *Rakipler*: "Hootsuite'ten bize geçmeleri için 3 neden say."`
  , { parse_mode: 'Markdown' });
});

// Mesaj yakalama ve yanıt verme (Basit LLM simülasyonu / Yönlendirme)
bot.on('message:text', async (ctx) => {
  const text = ctx.message.text.toLowerCase();
  
  // Basit anahtar kelime eşleşmeleri
  if (text.includes('seo') || text.includes('arama')) {
    await ctx.reply('*SEO Stratejimiz (Ajan 5):*\nN99 SocialHub için en iyi anahtar kelimeler:\n1. Ajans odaklı sosyal medya planlama aracı\n2. Hootsuite B2B alternatifleri\n3. AI influencer görseli oluşturan platform');
  } 
  else if (text.includes('copy') || text.includes('metin') || text.includes('yaz')) {
    await ctx.reply('*Metin Yazarlığı (Ajan 5):*\nÖrnek Landing Page Başlığı: "4 Farklı Platform. 1 Tek Yönetim Paneli. Ajansınızın Tüm Sosyal Medyasını AI ile Otomatikleştirin."\n\n_Daha spesifik bir bölüm için (ör: fiyatlandırma) lütfen detayı yazın._');
  }
  else if (text.includes('rakip') || text.includes('hootsuite') || text.includes('algoritma')) {
    await ctx.reply('*Rekabet (Ajan 5):*\nRakiplere (Hootsuite/Buffer) karşı en güçlü kasımız: "Ajans olarak müşterilerinize özel panel verebilmeniz ve içerik sürecini Flux/Kling AI ile otomatikleştirmenizdir." Fiyat avantajımızı mutlaka vurgulamalıyız.');
  }
  else if (text.includes('fikir') || text.includes('idea') || text.includes('growth')) {
    await ctx.reply('*Büyüme Fikri (Ajan 5):*\nBu haftaki önerim (Engineering as Marketing): Ücretsiz bir "Etkileşim Oranı Hesaplama Aracı (Engagement Calculator)" yapıp N99 ana sayfasında sunalım. Bu, küçük ajansları içeri çekecektir.');
  }
  else if (text.includes('selam') || text.includes('merhaba')) {
    await ctx.reply('Merhaba! Ben N99 SocialHub takımından Pazarlama Ajanı (Ajan 5). Büyüme ve pazarlama konusunda emrindeyim. Nereden başlayalım?');
  }
  else {
    // LLM bağlantısı yerine şimdilik fallback mesajı
    await ctx.reply('Mesajınızı aldım! Pazarlama stratejilerime dayanarak bunu Antigravity (Koordinatör) ile birlikte n8n iş akışlarımızda LLM (Gemini/Claude) servisine bağlayarak daha akıllı cevaplar verebilirim.\n\n_Şu an için /seo, /copy, /ideas gibi komutları deneyebilirsiniz._');
  }
});

// Botu başlat
bot.start({
  onStart: (botInfo) => {
    console.log(`Pazarlama Ajanı Botu (@${botInfo.username}) başarıyla başlatıldı!`);
    console.log(`Sadece onaylı ID (Kullanıcı: ${authorizedUserId}) ile iletişim kuracak.`);
  }
});

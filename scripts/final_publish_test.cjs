const https = require('https');

// 1. Üretilen Görsel ve Metin (Avyna için)
const AVYNA_POST = {
    title: 'Avyna Modern Mobilya Serisi',
    description: `Avyna ile yaşam alanlarınıza estetik bir dokunuş katın! ✨ 
Yeni modüler lüks kadife koltuk koleksiyonumuz şimdi satışta. 

🛋️ Ergonomik Tasarım
💎 El İşçiliği Kadife
🏡 Her Mekana Uygun Modüler Yapı

#Avyna #Mobilya #ModernHome #LivingRoom #InteriorDesign #LüksDekorasyon`,
    mediaUrl: 'https://v3.fal.media/files/monkey/OljA9W2W7H7Q4W_lQ9HqN.png',
    accounts: [{ platform: 'instagram', username: 'avyna_official' }]
};

// 2. LimeSocial Yayın İsteği
const postToLimeSocial = (data) => {
    const payload = JSON.stringify(data);
    const options = {
        hostname: 'api.limesocial.io',
        path: '/v1/post',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'u3SGTNhfUigMg5PSzOgSKzk947pqX3YlxH7WzBhQ2a6e07de'
        }
    };

    const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (d) => body += d);
        res.on('end', () => {
            console.log('--- Limesocial Sonuç ---');
            console.log(body);
        });
    });

    req.on('error', (e) => console.error('Hata:', e.message));
    req.write(payload);
    req.end();
};

console.log('🚀 Avyna içeriği yayına alınıyor...');
postToLimeSocial(AVYNA_POST);

/**
 * Google Apps Script — SocialHub Dashboard Entegrasyonu (v4 — JSONP & Multi-Sheet Destekli)
 * 
 * Bu script hem veri kaydetme hem de veri okuma işlemlerini yönetir.
 * CORS sorunlarını aşmak için JSONP desteği eklenmiştir.
 * 
 * KURULUM:
 * 1. Google Sheet'inizi açın
 * 2. Uzantılar > Apps Script tıklayın
 * 3. Bu kodu 'Code.gs' dosyasına yapıştırın (eski içeriği silin)
 * 4. Dosyayı kaydedin (Ctrl+S)
 * 5. Dağıt > Yeni Dağıtım > Web Uygulaması seçin
 *    - Açıklama: "SocialHub v4"
 *    - Çalıştır: "Ben" (hesap sahibinin yetkisiyle)
 *    - Erişim: "Herkes" (Anyone) -> BU ÇOK ÖNEMLİ!
 * 6. "Dağıt" butonuna basın ve izinleri onaylayın.
 * 7. Size verilen URL'yi (https://script.google.com/macros/s/...) kopyalayıp Dashboard'a yapıştırın.
 */

function doGet(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var params = e.parameter || {};
    var action = params.action || 'write';
    var sheetName = params.sheet || params.sheetName || "";
    var callback = params.callback;
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet;
    
    // Sayfa seçimi
    if (sheetName) {
      sheet = ss.getSheetByName(sheetName);
    }
    
    // Sayfa bulunamadıysa veya belirtilmediyse akıllı seçim yap
    if (!sheet) {
      if (action === 'read' || action === 'write') {
        // Eğer URL'de 'influencer' geçiyorsa veya sayfa adı verilmemişse
        // "AI Influencer" veya "influencer" ismini içeren ilk sayfayı bulmaya çalış
        var sheets = ss.getSheets();
        for (var i = 0; i < sheets.length; i++) {
          var name = sheets[i].getName().toLowerCase();
          if (name.includes('influencer')) {
            sheet = sheets[i];
            break;
          }
        }
      }
      
      // Hala bulunamadıysa aktif sayfayı kullan
      if (!sheet) sheet = ss.getActiveSheet();
    }

    // --- OKUMA İŞLEMİ (READ) ---
    if (action === 'read') {
      var rows = sheet.getDataRange().getValues();
      var data = [];

      if (rows.length > 1) {
        var headers = rows[0];
        
        // Son eklenenler ilk görünsün diye tersten oku
        for (var i = rows.length - 1; i >= 1; i--) {
          var row = rows[i];
          var entry = {};
          
          // Header'a göre map'le (daha sağlam)
          for (var j = 0; j < headers.length; j++) {
            var label = headers[j].toString().toLowerCase().trim();
            // Standart key'lere çevir
            var key = label;
            if (label.includes('date') || label.includes('tarih')) key = 'date';
            else if (label.includes('influencer')) key = 'influencerName';
            else if (label.includes('prompt') || label.includes('içerik')) key = 'prompt';
            else if (label.includes('url') || label.includes('image')) key = 'imageUrl';
            else if (label.includes('client') || label.includes('müşteri')) key = 'clientName';
            else if (label.includes('type') || label.includes('tip')) key = 'type';
            else if (label.includes('metadata') || label.includes('detay')) key = 'metadata';
            
            entry[key] = row[j];
          }
          
          // Eğer index-based mapping lazımsa fallback (eski tablolar için)
          if (!entry.imageUrl && row.length >= 4) {
             entry.date = row[0];
             entry.influencerName = row[1];
             entry.prompt = row[2];
             entry.imageUrl = row[3];
          }

          // Metadata string ise parse et
          if (entry.metadata && typeof entry.metadata === 'string' && entry.metadata.trim().startsWith('{')) {
             try {
               entry.metadata = JSON.parse(entry.metadata);
             } catch(err) {} 
          }

          data.push(entry);
        }
      }

      return createOutput(data, callback);
    }

    // --- YAZMA İŞLEMİ (WRITE) ---
    else if (action === 'write') {
      var date = params.date || new Date().toLocaleString('tr-TR');
      var prompt = params.prompt || '';
      var imageUrl = params.imageUrl || '';
      var type = params.type || 'image';
      var influencerName = params.influencerName || '';
      var clientName = params.clientName || '';
      var metadata = params.metadata || '';

      // Tablo başlıkları yoksa ekleyelim
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['Date', 'Influencer', 'Prompt', 'Image URL', 'Client', 'Type', 'Metadata']);
      }

      sheet.appendRow([date, influencerName, prompt, imageUrl, clientName, type, metadata]);

      return createOutput({ 'result': 'success', 'row': sheet.getLastRow(), 'sheet': sheet.getName() }, callback);
    }
    
    // --- TEST İŞLEMİ ---
    else if (action === 'test') {
      return createOutput({ 'result': 'ok', 'message': 'Bağlantı başarılı!', 'sheet': sheet.getName() }, callback);
    }

  } catch (e) {
    return createOutput({ 'result': 'error', 'error': e.toString() }, callback);
  } finally {
    lock.releaseLock();
  }
}

function doPost(e) {
  // POST istekleri genellikle metadata gibi uzun veriler için kullanılır
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet(); // Varsayılan
    var data;
    
    try {
      data = JSON.parse(e.postData.contents);
    } catch(err) {
      data = e.parameter;
    }

    var date = data.date || new Date().toLocaleString('tr-TR');
    var prompt = data.prompt || '';
    var imageUrl = data.imageUrl || '';
    var type = data.type || 'image';
    var influencerName = data.influencerName || '';
    var clientName = data.clientName || '';
    var metadata = typeof data.metadata === 'object' ? JSON.stringify(data.metadata) : (data.metadata || '');

    // "influencer" kelimesi geçen sayfayı bulmayı dene
    if (influencerName) {
       var sheets = ss.getSheets();
       for (var i = 0; i < sheets.length; i++) {
         if (sheets[i].getName().toLowerCase().includes('influencer')) {
           sheet = sheets[i];
           break;
         }
       }
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Date', 'Influencer', 'Prompt', 'Image URL', 'Client', 'Type', 'Metadata']);
    }

    sheet.appendRow([date, influencerName, prompt, imageUrl, clientName, type, metadata]);

    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Yardımcı fonksiyon: Çıktıyı JSON veya JSONP olarak formatlar
 */
function createOutput(data, callback) {
  var output = JSON.stringify(data);
  
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + output + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService
      .createTextOutput(output)
      .setMimeType(ContentService.MimeType.JSON);
  }
}

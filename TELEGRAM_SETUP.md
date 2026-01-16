# 🤖 Telegram Mini App Kurulum Rehberi

Block Blast oyununuzu Telegram Mini App olarak yayınlamak için adım adım rehber.

---

## 📋 Ön Hazırlık

### 1. Gereksinimler
- ✅ Telegram hesabı
- ✅ Web sunucusu (HTTPS zorunlu)
- ✅ Domain veya hosting

### 2. Oyun Hazır
- ✅ Telegram WebApp SDK entegre edildi
- ✅ Kullanıcı kimlik doğrulama eklendi
- ✅ Haptic feedback desteği var
- ✅ Skor paylaşma özelliği var

---

## 🚀 Adım 1: Telegram Bot Oluşturma

### 1.1 BotFather'ı Açın
1. Telegram'da [@BotFather](https://t.me/BotFather) botunu arayın
2. `/start` komutunu gönderin

### 1.2 Yeni Bot Oluşturun
```
/newbot
```

**Sorulacak Bilgiler:**
- **Bot adı**: `Block Blast Game` (görünen isim)
- **Bot username**: `BlockBlastGameBot` (benzersiz olmalı, `bot` ile bitmeli)

**Alacağınız Bilgiler:**
- 🔑 **Bot Token**: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz` (saklay\u0131n!)
- 🔗 **Bot Link**: `https://t.me/BlockBlastGameBot`

---

## 🌐 Adım 2: Web Uygulamasını Deploy Etme

### 2.1 Hosting Seçenekleri

#### **Seçenek A: Vercel (Önerilen - Ücretsiz)**
```bash
# 1. Vercel hesabı oluşturun: https://vercel.com
# 2. Vercel CLI yükleyin
npm i -g vercel

# 3. Deploy edin
cd /path/to/block-blast-game
vercel

# 4. Production deploy
vercel --prod
```

**Sonuç**: `https://block-blast-game.vercel.app`

#### **Seçenek B: Netlify (Ücretsiz)**
```bash
# 1. Netlify hesabı oluşturun: https://netlify.com
# 2. Netlify CLI yükleyin
npm i -g netlify-cli

# 3. Build edin
pnpm build

# 4. Deploy edin
netlify deploy --prod --dir=dist/public
```

#### **Seçenek C: Kendi Sunucunuz**
```bash
# 1. Build edin
pnpm build

# 2. Dosyaları sunucuya yükleyin (dist/public klasörü)
# 3. HTTPS sertifikası ekleyin (Let's Encrypt)
# 4. Nginx/Apache yapılandırın
```

**⚠️ ÖNEMLİ**: Telegram Mini App **sadece HTTPS** ile çalışır!

---

## 🔗 Adım 3: Mini App'i Bot'a Bağlama

### 3.1 Web App URL'sini Ayarlayın

BotFather'da:
```
/newapp
```

**Sorulacak Bilgiler:**
1. **Bot seçin**: `@BlockBlastGameBot`
2. **App title**: `Block Blast`
3. **App description**: `Eğlenceli blok puzzle oyunu! Blokları yerleştir, satırları temizle, yüksek skor yap!`
4. **App photo**: Oyun ikonu (640x360 px, PNG/JPEG)
5. **Demo GIF/Video**: Oyun videosu (opsiyonel)
6. **Web App URL**: `https://block-blast-game.vercel.app`
7. **Short name**: `blockblast` (benzersiz olmalı)

**Sonuç**: Mini App oluşturuldu! 🎉

### 3.2 Test Edin
```
https://t.me/BlockBlastGameBot/blockblast
```

---

## 🎮 Adım 4: Bot Komutlarını Ayarlama

### 4.1 Komutlar Ekleyin

BotFather'da:
```
/setcommands
```

**Bot seçin**: `@BlockBlastGameBot`

**Komutları yapıştırın:**
```
start - Oyunu başlat
play - Oyunu oyna
leaderboard - Skor tablosu
help - Yardım
```

### 4.2 Bot Açıklaması

```
/setdescription
```

**Açıklama:**
```
🎮 Block Blast - Eğlenceli Blok Puzzle Oyunu!

🧩 Blokları yerleştir
🔥 Satırları temizle
🏆 Yüksek skor yap
👥 Arkadaşlarınla yarış

Hemen oyna! 👇
```

### 4.3 Kısa Açıklama

```
/setabouttext
```

**Kısa açıklama:**
```
Eğlenceli blok puzzle oyunu! Blokları yerleştir, satırları temizle, yüksek skor yap!
```

---

## 🎨 Adım 5: Görsel Öğeleri Ayarlama

### 5.1 Bot Profil Fotoğrafı

```
/setuserpic
```

**Fotoğraf gereksinimleri:**
- Boyut: 640x640 px
- Format: PNG veya JPEG
- Dosya boyutu: < 5 MB

### 5.2 Mini App İkonu

BotFather'da mini app düzenlerken:
- **App photo**: 640x360 px
- **Square photo**: 640x640 px (opsiyonel)

---

## 📱 Adım 6: Inline Mode (Opsiyonel)

Kullanıcıların oyunu diğer chatlerde paylaşabilmesi için:

```
/setinline
```

**Bot seçin**: `@BlockBlastGameBot`

**Inline placeholder**: `Oyunu paylaş...`

**Kullanım:**
```
@BlockBlastGameBot
```

---

## 🔐 Adım 7: Backend Entegrasyonu (Opsiyonel)

### 7.1 Bot Token'ı Kaydedin

`.env` dosyanıza:
```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

### 7.2 Telegram Kullanıcı Doğrulama

Backend'de (server/routers.ts):
```typescript
import crypto from 'crypto';

function verifyTelegramWebAppData(initData: string, botToken: string): boolean {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');
  
  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  
  return calculatedHash === hash;
}
```

### 7.3 Kullanıcı Bilgilerini Alma

```typescript
const initData = req.headers['x-telegram-init-data'];
if (initData && verifyTelegramWebAppData(initData, process.env.TELEGRAM_BOT_TOKEN!)) {
  const urlParams = new URLSearchParams(initData);
  const userJson = urlParams.get('user');
  const user = JSON.parse(userJson);
  // user.id, user.first_name, user.username vs.
}
```

---

## 📊 Adım 8: Analytics ve İzleme

### 8.1 Telegram Analytics

BotFather'da:
```
/mybots
→ @BlockBlastGameBot
→ Bot Settings
→ View Statistics
```

**Görebilecekleriniz:**
- Kullanıcı sayısı
- Aktif kullanıcılar
- Mesaj istatistikleri

### 8.2 Custom Analytics

Oyunda zaten var:
- Umami analytics entegre
- Skor tracking
- Kullanıcı davranışları

---

## 🚀 Adım 9: Yayınlama ve Tanıtım

### 9.1 Bot'u Yayınlayın

```
/setjoingroups
```

**Enable**: Kullanıcılar botu gruplara ekleyebilir

### 9.2 Paylaşım Linkleri

**Direkt oyun linki:**
```
https://t.me/BlockBlastGameBot/blockblast
```

**Bot linki:**
```
https://t.me/BlockBlastGameBot
```

**Paylaşım mesajı:**
```
🎮 Block Blast oynamaya başladım!

Eğlenceli blok puzzle oyunu 🧩
Hemen sen de oyna! 👇

https://t.me/BlockBlastGameBot/blockblast
```

### 9.3 Tanıtım Kanalları

1. **Telegram Grupları**: Oyun gruplarında paylaşın
2. **Sosyal Medya**: Twitter, Instagram, Facebook
3. **Arkadaşlar**: Direkt mesaj gönderin
4. **Influencer'lar**: Gaming influencer'larla iletişime geçin

---

## 🎯 Adım 10: Gelir Modeli (Opsiyonel)

### 10.1 Telegram Stars (Önerilen)

Telegram'ın kendi ödeme sistemi:
```
/setpaymentprovider
```

**Avantajlar:**
- Telegram'a entegre
- Düşük komisyon
- Kolay kullanım

### 10.2 Reklam Entegrasyonu

- Google AdSense
- Telegram Ad Platform
- Direct sponsorships

### 10.3 Premium Özellikler

- Extra bombalar
- Özel temalar
- Reklamsız deneyim
- Exclusive bloklar

---

## 📞 Destek ve Yardım

### Telegram Dokümantasyonu
- [Mini Apps Guide](https://core.telegram.org/bots/webapps)
- [Bot API](https://core.telegram.org/bots/api)
- [BotFather Commands](https://core.telegram.org/bots#6-botfather)

### Sorun Giderme

**Problem**: Mini App açılmıyor
- ✅ HTTPS kontrolü yapın
- ✅ URL'nin doğru olduğunu kontrol edin
- ✅ CORS ayarlarını kontrol edin

**Problem**: Kullanıcı bilgileri gelmiyor
- ✅ initData'yı kontrol edin
- ✅ Bot token'ı doğru mu?
- ✅ Verification fonksiyonu çalışıyor mu?

**Problem**: Haptic feedback çalışmıyor
- ✅ Telegram sürümü güncel mi?
- ✅ iOS/Android kontrolü yapın
- ✅ Console logları kontrol edin

---

## ✅ Checklist

Yayınlamadan önce kontrol edin:

- [ ] Bot oluşturuldu
- [ ] Web app deploy edildi (HTTPS)
- [ ] Mini app bot'a bağlandı
- [ ] Bot komutları ayarlandı
- [ ] Görseller yüklendi
- [ ] Test edildi (iOS ve Android)
- [ ] Analytics aktif
- [ ] Paylaşım linkleri hazır
- [ ] Tanıtım planı var

---

## 🎉 Tebrikler!

Block Blast oyununuz artık Telegram Mini App olarak yayında! 🚀

**Sonraki Adımlar:**
1. Kullanıcı geri bildirimlerini toplayın
2. Yeni özellikler ekleyin
3. Tanıtım yapın
4. Gelir modelini optimize edin

İyi şanslar! 🎮✨

# 🚀 Hızlı Başlangıç Rehberi

Block Blast oyununu 5 dakikada çalıştırın!

---

## ⚡ Hızlı Kurulum

### 1. Bağımlılıkları Yükle
```bash
pnpm install
```

### 2. Environment Variables Ayarla
```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:
```env
DATABASE_URL="mysql://user:pass@host:port/db"
MANUS_OAUTH_CLIENT_ID="your_client_id"
MANUS_OAUTH_CLIENT_SECRET="your_client_secret"
SESSION_SECRET="random_secret_key"
```

### 3. Database Migration
```bash
pnpm db:push
```

### 4. Development Server Başlat
```bash
pnpm dev
```

🎉 **Tamamlandı!** Tarayıcınızda `http://localhost:3000` açın.

---

## 🎮 İlk Oyun

1. Ana sayfada **nickname girin** (3-20 karakter)
2. **START** butonuna tıklayın
3. **Blokları sürükleyip** tahtaya yerleştirin
4. **Satırları temizleyin** ve yüksek skor yapın!

---

## 📋 Temel Komutlar

```bash
# Development
pnpm dev              # Server başlat (http://localhost:3000)

# Build
pnpm build            # Production build

# Test
pnpm test             # Testleri çalıştır
pnpm check            # Type check

# Database
pnpm db:push          # Migration çalıştır

# Code Quality
pnpm format           # Prettier ile formatla
```

---

## 🔧 Sorun Giderme

### Port 3000 Kullanımda
```bash
# .env dosyasında port değiştir
PORT=3001
```

### Database Bağlantı Hatası
```bash
# .env dosyasında DATABASE_URL'i kontrol et
# MySQL/TiDB çalıştığından emin ol
```

### Build Hatası
```bash
# node_modules'i temizle ve yeniden yükle
rm -rf node_modules
pnpm install
```

---

## 📚 Daha Fazla Bilgi

- **Detaylı Dokümantasyon**: [README.md](README.md)
- **Katkıda Bulunma**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Geliştirme Raporu**: [GELISTIRME_RAPORU.md](GELISTIRME_RAPORU.md)
- **Değişiklikler**: [DEGISIKLIKLER.md](DEGISIKLIKLER.md)

---

## 💡 İpuçları

- **Misafir Modu**: Kayıt olmadan oynayabilirsiniz
- **Bomba**: 3 bomba hakkınız var (3x3 alan temizler)
- **Kombo**: 3 saniye içinde ardışık temizlemelerle bonus kazanın
- **Level**: Her 1000 puan = 1 level, müzik değişir

---

## 🆘 Yardım

Sorun mu yaşıyorsunuz?
- GitHub Issues açın
- README.md'yi okuyun
- Dokümantasyonu kontrol edin

---

**İyi oyunlar!** 🎮✨

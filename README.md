# Block Blast - Cyberpunk Puzzle Game 🎮

Modern web teknolojileri kullanılarak geliştirilmiş, cyberpunk temalı bir blok yerleştirme puzzle oyunu.

![Block Blast](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 Özellikler

### Oyun Mekanikleri
- **8x8 Grid Sistemi**: Klasik blok yerleştirme oyunu
- **Drag & Drop**: Sürükle-bırak ile kolay oynanış
- **Satır/Sütun Temizleme**: Tam dolan satır ve sütunları temizle
- **Kombo Sistemi**: Ardışık temizlemelerle bonus puan kazan
- **Bomba Sistemi**: 3 bomba hakkı ile 3x3 alan temizle
- **Dinamik Seviye Sistemi**: Skor arttıkça seviye ve müzik değişir

### Kullanıcı Sistemi
- **OAuth Entegrasyonu**: Manus OAuth ile güvenli giriş
- **Misafir Modu**: Kayıt olmadan oynama imkanı
- **Nickname Sistemi**: Benzersiz kullanıcı adları
- **Profil Yönetimi**: Kullanıcı bilgileri ve ayarlar

### Sosyal Özellikler
- **Global Leaderboard**: Tüm oyuncular arasında sıralama
- **Arkadaş Sistemi**: Arkadaş ekleme, istek gönderme/onaylama
- **Arkadaşlar Arası Liderlik**: Sadece arkadaşlarınla yarış
- **Canlı Güncelleme**: Gerçek zamanlı skor güncellemeleri

### Başarım Sistemi
- **Çeşitli Kategoriler**: Kombo, skor, bomba, satır temizleme
- **Bildirimler**: Başarım açıldığında toast bildirimi
- **İlerleme Takibi**: Başarımlar sayfasında detaylı görüntüleme

### UI/UX
- **Cyberpunk Tema**: Neon renkler ve glow efektleri
- **Animasyonlar**: Framer Motion ile akıcı geçişler
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu
- **Dark Mode**: Göz yormayan karanlık tema
- **Ses Sistemi**: Arka plan müziği ve ses efektleri

## 🚀 Teknoloji Stack'i

### Frontend
- **React 19.2.1** - UI kütüphanesi
- **TypeScript 5.9.3** - Tip güvenliği
- **Vite 7.1.9** - Build tool
- **TailwindCSS 4.1.14** - Styling
- **Framer Motion 12.23.22** - Animasyonlar
- **@dnd-kit/core** - Drag & drop
- **@tanstack/react-query** - State management
- **Wouter** - Routing

### Backend
- **Node.js 22.13.0** - Runtime
- **Express 4.21.2** - Web framework
- **tRPC 11.8.1** - Type-safe API
- **Drizzle ORM 0.44.7** - Database ORM
- **MySQL/TiDB** - Database
- **Zod 4.1.12** - Schema validation

### Dev Tools
- **pnpm** - Package manager
- **tsx** - TypeScript execution
- **Vitest** - Testing framework
- **Prettier** - Code formatting

## 📦 Kurulum

### Gereksinimler
- Node.js 18+ (önerilen: 22.x)
- pnpm 8+
- MySQL 8+ veya TiDB

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone <repository-url>
cd block_blast_game
```

2. **Bağımlılıkları yükleyin**
```bash
pnpm install
```

3. **Environment variables ayarlayın**
`.env` dosyasını oluşturun ve aşağıdaki değişkenleri ekleyin:
```env
# Database
DATABASE_URL="mysql://user:password@host:port/database"

# OAuth (Manus)
MANUS_OAUTH_CLIENT_ID="your_client_id"
MANUS_OAUTH_CLIENT_SECRET="your_client_secret"
MANUS_OAUTH_REDIRECT_URI="http://localhost:3000/api/oauth/callback"

# Session
SESSION_SECRET="your_random_secret_key"

# Environment
NODE_ENV="development"
PORT=3000
```

4. **Veritabanı migration'larını çalıştırın**
```bash
pnpm db:push
```

5. **Development server'ı başlatın**
```bash
pnpm dev
```

Tarayıcınızda `http://localhost:3000` adresini açın.

## 🏗️ Proje Yapısı

```
block_blast_game/
├── client/                 # Frontend
│   ├── public/            # Statik dosyalar (müzik, resimler)
│   └── src/
│       ├── components/    # React bileşenleri
│       ├── hooks/         # Custom hooks
│       ├── lib/           # Yardımcı fonksiyonlar
│       └── pages/         # Sayfa bileşenleri
├── server/                # Backend
│   ├── _core/            # Temel sistem fonksiyonları
│   ├── middleware/       # Express middleware'ler
│   ├── routers.ts        # tRPC route tanımları
│   ├── db.ts             # Veritabanı işlemleri
│   └── achievements.ts   # Başarım sistemi
├── shared/               # Ortak tip tanımları
├── drizzle/             # Veritabanı şema ve migration'lar
│   ├── schema.ts        # Tablo tanımları
│   └── migrations/      # SQL migration dosyaları
├── package.json         # Proje bağımlılıkları
└── README.md           # Bu dosya
```

## 🎮 Nasıl Oynanır?

1. **Nickname Girin**: Ana sayfada 3-20 karakter arası bir nickname girin
2. **START Butonuna Basın**: Oyuna başlamak için START'a tıklayın
3. **Blokları Sürükleyin**: Alt kısımdaki blokları sürükleyip tahtaya yerleştirin
4. **Satırları Temizleyin**: Tam dolan satır veya sütunlar otomatik temizlenir
5. **Kombo Yapın**: 3 saniye içinde ardışık temizlemelerle bonus puan kazanın
6. **Bomba Kullanın**: Sıkıştığınızda bomba ile 3x3 alan temizleyin
7. **Yüksek Skor**: En yüksek skoru hedefleyin ve leaderboard'da yerinizi alın!

## 📜 Komutlar

```bash
# Development
pnpm dev              # Development server başlat
pnpm build            # Production build
pnpm start            # Production server başlat

# Database
pnpm db:push          # Migration'ları çalıştır

# Code Quality
pnpm check            # TypeScript type check
pnpm format           # Prettier ile kod formatlama
pnpm test             # Testleri çalıştır
```

## 🔒 Güvenlik

- **Rate Limiting**: API endpoint'leri için rate limiting aktif
- **Input Validation**: Zod ile tüm girdiler doğrulanıyor
- **SQL Injection Koruması**: Drizzle ORM ile parametreli sorgular
- **OAuth**: Güvenli kullanıcı kimlik doğrulama
- **Session Management**: Güvenli session cookie'leri

## 🧪 Test

```bash
# Tüm testleri çalıştır
pnpm test

# Watch mode
pnpm test --watch

# Coverage raporu
pnpm test --coverage
```

## 📈 Performans

- **Bundle Boyutu**: ~500KB (gzipped)
- **İlk Yükleme**: ~2-3 saniye
- **Lighthouse Score**: 90+ (hedef)
- **Mobil Uyumlu**: Touch events ve responsive design

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Changelog

### v1.0.0 (2026-01-16)
- ✅ İlk stabil sürüm
- ✅ Temel oyun mekanikleri
- ✅ Kullanıcı ve arkadaş sistemi
- ✅ Leaderboard ve başarımlar
- ✅ Bomba sistemi
- ✅ Rate limiting ve güvenlik iyileştirmeleri
- ✅ Kod refactoring ve custom hooks
- ✅ Error handling iyileştirmeleri

## 🐛 Bilinen Sorunlar

Şu anda bilinen kritik sorun bulunmamaktadır. Sorun bildirmek için [Issues](https://github.com/your-repo/issues) sayfasını kullanın.

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👥 Ekip

- **Geliştirici**: [Your Name]
- **Tasarım**: Cyberpunk inspired
- **Müzik**: Royalty-free background music

## 🙏 Teşekkürler

- [Manus](https://manus.im) - OAuth ve hosting
- [Radix UI](https://radix-ui.com) - UI components
- [Framer Motion](https://framer.com/motion) - Animations
- [Lucide](https://lucide.dev) - Icons

## 📞 İletişim

- **Website**: [your-website.com]
- **Email**: [your-email@example.com]
- **Discord**: [your-discord-server]

---

**Block Blast** ile eğlenceli oyunlar! 🎮✨

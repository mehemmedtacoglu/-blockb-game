# Katkıda Bulunma Rehberi

Block Blast projesine katkıda bulunmak istediğiniz için teşekkür ederiz! Bu rehber, projeye nasıl katkıda bulunabileceğinizi açıklamaktadır.

## 🚀 Başlarken

1. **Repository'yi Fork Edin**
   - GitHub'da projeyi fork edin
   - Fork'unuzu local'e clone edin

2. **Development Environment Kurun**
   ```bash
   pnpm install
   cp .env.example .env
   # .env dosyasını düzenleyin
   pnpm db:push
   pnpm dev
   ```

3. **Branch Oluşturun**
   ```bash
   git checkout -b feature/your-feature-name
   # veya
   git checkout -b fix/your-bug-fix
   ```

## 📝 Commit Mesajları

Commit mesajlarınızı [Conventional Commits](https://www.conventionalcommits.org/) formatında yazın:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Commit Tipleri

- `feat`: Yeni özellik
- `fix`: Hata düzeltme
- `docs`: Dokümantasyon değişikliği
- `style`: Kod formatı (kod mantığını etkilemeyen)
- `refactor`: Kod refactoring
- `perf`: Performans iyileştirmesi
- `test`: Test ekleme veya düzeltme
- `chore`: Build process veya yardımcı araçlar

### Örnekler

```bash
feat(game): add power-up system
fix(leaderboard): correct score sorting
docs(readme): update installation steps
refactor(hooks): extract game state to custom hook
```

## 🎨 Kod Stili

- **TypeScript** kullanın, `any` tipinden kaçının
- **Prettier** ile kod formatlayın: `pnpm format`
- **ESLint** kurallarına uyun
- **Anlamlı değişken isimleri** kullanın
- **Fonksiyonları küçük ve odaklı** tutun
- **Yorum satırları** ekleyin (özellikle karmaşık mantık için)

### Örnek İyi Kod

```typescript
// ✅ İyi
interface GameConfig {
  boardSize: number;
  maxBlocks: number;
}

function calculateScore(linesCleared: number, combo: number): number {
  const baseScore = linesCleared * 100;
  const comboBonus = combo > 1 ? (combo - 1) * 50 : 0;
  return baseScore + comboBonus;
}

// ❌ Kötü
function calc(l: any, c: any) {
  return l * 100 + (c > 1 ? (c - 1) * 50 : 0);
}
```

## 🧪 Test Yazımı

Yeni özellikler için test yazın:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateScore } from './gameLogic';

describe('calculateScore', () => {
  it('should calculate base score correctly', () => {
    expect(calculateScore(2, 0)).toBe(200);
  });

  it('should add combo bonus', () => {
    expect(calculateScore(2, 3)).toBe(300); // 200 + 100
  });
});
```

## 📋 Pull Request Süreci

1. **Değişikliklerinizi Test Edin**
   ```bash
   pnpm check      # TypeScript type check
   pnpm test       # Testleri çalıştır
   pnpm format     # Kod formatla
   ```

2. **Commit ve Push**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/your-feature-name
   ```

3. **Pull Request Açın**
   - GitHub'da Pull Request açın
   - Açıklayıcı bir başlık ve açıklama yazın
   - İlgili issue'ları referans verin (#123)
   - Screenshot ekleyin (UI değişiklikleri için)

4. **Code Review**
   - Maintainer'ların geri bildirimlerini bekleyin
   - Gerekli değişiklikleri yapın
   - Merge onayını bekleyin

## 🐛 Bug Raporu

Bug bulduğunuzda şu bilgileri ekleyin:

```markdown
### Bug Açıklaması
[Açık ve net açıklama]

### Nasıl Tekrarlanır
1. '...' sayfasına git
2. '...' butonuna tıkla
3. '...' yap
4. Hatayı gör

### Beklenen Davranış
[Ne olması gerektiği]

### Ekran Görüntüleri
[Varsa ekleyin]

### Ortam
- OS: [örn. Windows 10]
- Browser: [örn. Chrome 120]
- Version: [örn. 1.0.0]
```

## 💡 Özellik İsteği

Yeni özellik önerirken:

```markdown
### Özellik Açıklaması
[Açık ve net açıklama]

### Motivasyon
[Bu özellik neden gerekli?]

### Önerilen Çözüm
[Nasıl implement edilebilir?]

### Alternatifler
[Düşündüğünüz alternatif çözümler]
```

## 📚 Dokümantasyon

- README.md'yi güncel tutun
- Yeni özellikler için dokümantasyon ekleyin
- Kod yorumlarını Türkçe veya İngilizce yazın
- API değişikliklerini belgelendirin

## ⚠️ Dikkat Edilmesi Gerekenler

### Yapılmaması Gerekenler

- ❌ `console.log` bırakmayın (debug amaçlı olanlar hariç)
- ❌ Büyük dosyalar commit etmeyin
- ❌ Credentials veya API keys commit etmeyin
- ❌ Breaking changes yapmadan önce tartışmayın
- ❌ Test yazmadan büyük değişiklikler yapmayın

### Yapılması Gerekenler

- ✅ Küçük, odaklı PR'lar açın
- ✅ Anlamlı commit mesajları yazın
- ✅ Test yazın
- ✅ Dokümantasyon güncelleyin
- ✅ Code review'lara katılın

## 🎯 Öncelikli Alanlar

Şu alanlarda katkıya özellikle ihtiyacımız var:

1. **Test Coverage**: Unit ve E2E testler
2. **Accessibility**: Klavye navigasyonu, screen reader desteği
3. **Performance**: Optimizasyon ve caching
4. **Mobile UX**: Touch feedback, landscape mode
5. **Dokümantasyon**: API docs, tutorials

## 🤝 Davranış Kuralları

- Saygılı ve yapıcı olun
- Farklı görüşlere açık olun
- Yardımcı olmaya çalışın
- Öğrenmeye ve öğretmeye istekli olun

## 📞 İletişim

Sorularınız için:
- GitHub Issues
- Discord: [server-link]
- Email: [email]

---

Katkılarınız için teşekkürler! 🙏

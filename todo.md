# Project TODO

## Completed Features
- [x] Basic homepage layout
- [x] Dynamic level system with background changes
- [x] Score display optimization for large numbers
- [x] Drag and drop improvements
- [x] Auto-restart on game over
- [x] Background music system
- [x] Dynamic music tracks for different levels
- [x] Puzzle Mode implementation
- [x] 20 puzzle levels (Easy, Medium, Hard)
- [x] Level selection menu
- [x] Progress saving system

## Pending Features
- [x] Upgrade to full-stack (web-db-user)
- [x] Design database schema for leaderboard
- [x] Implement API endpoints for score submission
- [x] Remove Puzzle Mode completely
- [x] Fix block freezing issue
- [x] Simplify main menu (Classic Mode only)
- [x] Create Leaderboard UI component
- [x] Integrate leaderboard with game screens
- [x] Submit scores to leaderboard on game over
- [x] Add leaderboard view to main menu

## Yeni Kullanıcı İstekleri (Mobil İyileştirmeler)
- [x] Bomba özelliğini tamamen kaldır
- [x] Mobil için leaderboard butonunu daha görünür yap
- [x] Mobilde leaderboard erişimini test et

## Arkadaş Sistemi Özellikleri
- [x] Veritabanına friendships tablosu ekle
- [x] Backend API: arkadaş arama endpoint'i
- [x] Backend API: arkadaş ekleme/kaldırma endpoint'leri
- [x] Backend API: arkadaş listesi endpoint'i
- [x] Backend API: arkadaşlar arası liderlik tablosu endpoint'i
- [x] UI: Arkadaş arama ve ekleme bileşeni
- [x] UI: Arkadaş listesi bileşeni
- [x] UI: Arkadaşlar arası liderlik tablosu görünümü
- [x] Leaderboard'a arkadaş filtresi ekle
- [x] Testleri yaz ve çalıştır

## Arkadaş İstek-Onay Sistemi
- [x] Backend: addFriend'i pending status ile güncelle
- [x] Backend: Gelen istekleri getirme endpoint'i
- [x] Backend: Gönderilen istekleri getirme endpoint'i
- [x] Backend: İstek onaylama endpoint'i
- [x] Backend: İstek reddetme endpoint'i
- [x] UI: Gelen istekler bileşeni (onay/red butonları)
- [x] UI: Gönderilen istekler bileşeni (iptal butonu)
- [x] UI: FriendSearch'ü güncelle (istek gönder)
- [x] UI: Leaderboard'a istek bildirimi badge'i ekle
- [x] Testleri güncelle ve çalıştır

## Nickname Sistemi
- [x] Veritabanı: users tablosuna nickname alanı ekle
- [x] Backend: Nickname güncelleme endpoint'i
- [x] Backend: Nickname validasyonu (3-20 karakter, alfanumerik)
- [x] UI: İlk giriş nickname modal'ı
- [x] UI: Nickname değiştirme bileşeni (profil/ayarlar)
- [x] Liderlik tablosunu nickname ile güncelle
- [x] Arkadaş listesinde nickname göster
- [x] Oyun içinde nickname göster
- [x] Testleri yaz ve çalıştır

## Nickname Benzersizlik Sistemi
- [x] Veritabanı: nickname alanına unique constraint ekle
- [x] Backend: Nickname kullanılabilirlik kontrolü endpoint'i
- [x] Backend: updateNickname'de duplicate kontrolü
- [x] UI: Gerçek zamanlı nickname kontrol
- [x] UI: "Bu nickname zaten kullanılıyor" hata mesajı
- [x] UI: Alternatif nickname önerileri (görsel feedback ile)
- [x] Testleri güncelle ve çalıştır

## Kullanıcı Geri Bildirimleri - Düzeltmeler
- [x] Leaderboard arkadaşlar sekmesinde arkadaşların skorlarını göster
- [x] Her kullanıcı giriş yaptığında nickname kontrolü yap
- [x] Nickname olmayan kullanıcılar için modal göster
- [x] Arkadaş sistemi veri akışını test et

## Misafir Modu Sistemi
- [x] Blok döndürme özelliğini tamamen kaldır
- [x] Ana sayfaya "Misafir Olarak Oyna" butonu ekle
- [x] LocalStorage tabanlı nickname sistemi
- [x] Misafir nickname modal'ı oluştur
- [x] Oyun sayfasını misafir modu ile uyumlu yap
- [x] Leaderboard'ı misafirler için aç
- [x] Arkadaş sistemini sadece kayıtlı kullanıcılara sınırla
- [x] OAuth girişi opsiyonel yap
- [x] Test ve doğrulama

## Mobil Akıcılık ve Bomba Sistemi
- [x] Blok yerleştirme animasyonunu optimize et (mobil için)
- [x] Bomba sistemini geri ekle (3 hak)
- [x] Bomba UI bileşenini ekle
- [x] Bomba kullanım mantığını implement et
- [x] Mobilde test et ve akıcılığı doğrula

## Bomba Animasyonu ve Blok Gölgesi
- [x] Blok gölgesini tamamen kaldır (ghost position)
- [x] Bomba patlama animasyonu ekle (kırmızı/turuncu efekt)
- [x] Bomba 3x3 alan temizlesin (merkez + 8 komşu)
- [x] Patlama sesi ekle
- [x] Test ve doğrula

## Blok Yerleştirme Pozisyon Sorunu
- [x] calculateGridPosition fonksiyonunu düzelt
- [x] Grid snap mekanizmasını iyileştir
- [x] Blokların tam hücrelere oturmasını sağla
- [x] Test ve doğrula

## UI İyileştirmeleri
- [x] TETRIS yazısını kaldır
- [x] Mobilde simgeleri düzelt (buton boyutları)
- [x] Bomba patlama animasyonunu iyileştir (daha göz alıcı)
- [x] Test ve doğrula

## Ana Menü ve Oyun İçi Sadeleştirme
- [x] Ana menüyü basitleştir - sadece oyuna giriş butonu
- [x] Oyun içinden gereksiz butonları kaldır (zaten yok)
- [x] Block Blast yazısını kaldır (zaten yok)
- [x] Header'ı sadeleştir (Level/Score/Best/Leaderboard)
- [x] Test ve doğrula

## Başarım Sistemi
- [x] Veritabanı: achievements ve user_achievements tabloları
- [x] Backend: Başarım tanımları ve kontrol fonksiyonları
- [x] Backend: Başarım kilidi açma endpoint'i
- [x] Backend: Kullanıcı başarımlarını getirme endpoint'i
- [x] Oyun içi: Kombo takibi (ardışık satır temizleme)
- [x] Oyun içi: Hamle sayısı takibi
- [x] Oyun içi: Başarım kontrolü ve bildirim
- [x] UI: Başarım bildirimi toast/modal
- [x] UI: Başarımlar sayfası (rozet gösterimi)
- [x] UI: Game over ekranında kazanılan başarımlar (toast ile)
- [x] Test ve doğrula

## Giriş Deneyimi İyileştirmeleri
- [x] Ses tuşunu oyun içinden kaldır
- [x] Animasyonlu giriş ekranı tasarla (cyberpunk temalı)
- [x] Giriş ekranında nickname girişi ve "OYUNA BAŞLA" butonu
- [x] Nickname girildikten sonra direkt oyuna geçiş
- [x] Canlı leaderboard güncellemeleri (polling - 5 saniyede bir)
- [x] Leaderboard'da gerçek zamanlı skor değişiklikleri
- [x] Test ve doğrula

## Ses Tuşu Geri Ekleme
- [x] Ses tuşunu oyun içine geri ekle
- [x] Müzik sistemini geri getir (background music)
- [x] Level bazlı dinamik müzik değişimi
- [x] Test ve doğrula

## Misafir Modu Skor Kaydetme
- [x] Backend'de misafir kullanıcılar için skor kaydetme desteği ekle
- [x] Frontend'de oyun bittiğinde misafir kullanıcıların skorlarını kaydet
- [x] Leaderboard'da misafir kullanıcıların skorları görünsün
- [x] Test ve doğrula

## Scoreboard Temizleme ve Nickname Düzeltme
- [x] Scoreboard'daki tüm skorları sil
- [x] Nickname'lerin tam olarak girilen şekilde görünmesini sağla
- [x] Test ve doğrula

## Giriş Ekranında Girilen Nickname Kullanımı
- [x] Giriş ekranında girilen nickname'in oyunda kullanılmasını sağla
- [x] Kayıtlı kullanıcılar için de giriş ekranındaki nickname kullanılsın
- [x] Test ve doğrula

## Kod Kalitesi ve İyileştirmeler (2026-01-16)
- [x] Node modules kurulumu
- [x] Custom hooks oluşturma (useGameState, useBombSystem)
- [x] Rate limiting middleware ekleme
- [x] Error handling sistemi oluşturma
- [x] README.md dokümantasyonu
- [x] CONTRIBUTING.md rehberi
- [x] .env.example dosyası
- [x] Unit test yazımı (gameLogic.test.ts)
- [x] Vitest config güncelleme
- [x] Test coverage iyileştirme

## 5'li Blok Yerleştirme Sorunu (2026-01-16)
- [x] 5'li blokların yanlış yerleştirilmesi sorununu tespit et
- [x] Blok yerleştirme mantığını düzelt
- [x] Tüm blok şekillerini test et
- [x] Kullanıcıya teslim et

## Blok Gölgeleri ve Mobil Optimizasyon (2026-01-16)
- [x] Blok gölgelerini kaldır
- [x] Mobil için touch handling iyileştir
- [x] Tüm blok tiplerinde yerleştirme testi yap
- [x] Kullanıcıya teslim et

## Blok Renk ve Yerleştirme İyileştirmesi v2 (2026-01-16)
- [x] Blokları daha dolgun renkli yap (gradient kaldır)
- [x] Yerleştirme algoritmasını tamamen yeniden yaz
- [x] Tüm cihazlarda test et
- [x] Kullanıcıya teslim et

## Blok Yerleştirme Kritik Düzeltme (2026-01-16)
- [x] Bazen yerleşmeme sorununu çöz
- [x] Yanlış hücreye kayma sorununu çöz (1 hücre offset)
- [x] Tüm senaryolarda test et
- [x] Kullanıcıya teslim et

## Blok Yerleştirme - Sıfırdan Yeniden Yazım (2026-01-16) - KRİTİK
- [x] Mevcut algoritmanın sorununu tam olarak anla
- [x] Basit, anlaşılır yeni algoritma yaz
- [x] Her blok tipi için test et
- [x] Kullanıcıya teslim et

## Sürükleme Gölgeleri ve Tam Yerleştirme (2026-01-16) - FINAL
- [x] DraggableBlock'taki tüm gölgeleri kaldır
- [x] Sürükleme overlay gölgelerini kaldır
- [x] Yerleştirme algoritmasını daha hassas yap
- [x] Kullanıcıya teslim et

## Guest Kullanıcı Skor Kaydetme (2026-01-16)
- [x] Guest kullanıcılar için skor kaydetme API'sini güncelle
- [x] BlockBlast.tsx'de guest skor kaydetmeyi aktif et
- [x] Leaderboard'da guest skorları göster
- [x] Test et ve kullanıcıya teslim et

## Telegram Mini App Dönüşümü (2026-01-16)
- [x] Telegram WebApp SDK ekle
- [x] Telegram kullanıcı kimlik doğrulama
- [x] Telegram UI temasına uyum
- [x] Bot oluşturma rehberi hazırla
- [x] Deployment rehberi hazırla
- [x] Test ve kullanıcıya teslim

# KARACA - Teknik Servis Yönetim Sistemi

Servisfoni benzeri, tam kapsamlı bir servis yönetim uygulaması.

## Özellikler

- **Giriş Sistemi**: Şifre koruması (canonlayn)
- **Müşteri Yönetimi**: Yeni servis kaydı oluşturma
- **Teknisyen Atama**: Teknisyenlere servis yönlendirme
- **Servis Takibi**: Detaylı servis formu ve durum yönetimi
- **Para Hareketleri**: Tahsilat kaydı ve takibi
- **PDF Oluşturma**: Profesyonel servis formu PDF'i
- **İmza Sistemi**: Canvas üzerinde dijital imza
- **WhatsApp Entegrasyonu**: PDF ve imza paylaşımı
- **Offline Çalışma**: Tüm veriler LocalStorage'da saklanır

## Teknolojiler

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- react-hook-form + Zod
- jsPDF + html2canvas
- Lucide React Icons

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Üretim build'i oluştur
npm run build
```

## Kullanım Akışı

1. **Giriş**: Şifre ile giriş yap (`canonlayn`)
2. **Yeni Servis**: Müşteri ve cihaz bilgilerini gir
3. **Teknisyen Yönlendirme**: Teknisyen seç ve yönlendir
4. **Servis Detay**: Arıza tespiti, işlemler ve ödeme kaydı
5. **PDF/İmza**: Servis formunu PDF olarak kaydet veya paylaş

## Dosya Yapısı

```
app/
├── components/          # Ortak componentler
│   ├── ListItem.tsx   # Popup liste öğesi
│   ├── Popup.tsx      # iOS tarzı popup
│   └── StatusBar.tsx  # Durum çubuğu
├── lib/
│   ├── types.ts       # Tip tanımlamaları ve veriler
│   └── utils.ts       # Yardımcı fonksiyonlar
├── page.tsx           # Giriş sayfası
├── yeni-servis/       # Müşteri oluşturma
├── teknisyen-yonlendir/  # Teknisyen atama
└── servis-detay/      # Servis formu ve takip
```

## Veri Saklama

Tüm veriler tarayıcı LocalStorage'ında saklanır:
- `karaca_servisler`: Servis kayıtları
- `karaca_son_servis_no`: Otomatik artan servis numarası
- `karaca_auth`: Oturum durumu
- `sessionStorage:current_servis`: Geçici servis verisi

## Ekran Görüntüleri

- Giriş Ekranı: Mavi gradient arka planlı şifre ekranı
- Yeni Servis: iOS tarzı form popup'ları ile
- Teknisyen Yönlendirme: Özet kart ve teknisyen seçimi
- Servis Detay: Tam kapsamlı servis formu ve işlem geçmişi

## Lisans

MIT
# karaca-servis

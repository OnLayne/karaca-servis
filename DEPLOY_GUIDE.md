# GitHub Pages Deploy Rehberi

## 1. GitHub Repo Oluştur
- github.com'da yeni repo oluştur (örn: `karaca-servis`)
- Public seçeneğini işaretle

## 2. Dosyaları Yükle
Terminalde şu komutları çalıştır:

```bash
cd /home/canonlayn/CascadeProjects/karaca
git init
git add .
git commit -m "Initial commit - KARACA Servis Sistemi"
git branch -M main
git remote add origin https://github.com/kullaniciadi/karaca-servis.git
git push -u origin main
```

## 3. GitHub Pages Ayarla
- Repo'da Settings > Pages sekmesine git
- Source: Deploy from a branch
- Branch: main / root
- Save'e tıkla

## 4. Site Yayında
- 2-3 dakika sonra site aktif olur
- URL: `https://kullaniciadi.github.io/karaca-servis/`

## Özellikler
- ✅ Mobil uyumlu
- ✅ LocalStorage ile veri saklama
- ✅ 5 ana modül (Müşteri, Yüzdelik, AI, Muhasebe, Depo)
- ✅ Şifre: `canonlayn`

## Dosya Listesi
- index.html (Login)
- ana-sayfa.html (Ana menü)
- yeni-servis.html (Müşteri oluştur)
- karaca-yuzdelik.html (Hesaplama)
- karacacheat.html (AI Arıza)
- karaca-muhasebe.html (Muhasebe)
- karaca-depo.html (Stok/Depo)
- servis-detay.html (Servis detay)

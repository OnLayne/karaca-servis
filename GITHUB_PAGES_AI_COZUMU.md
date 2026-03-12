# GitHub Pages'de Gemini AI Çalıştırma Çözümleri

## 🔧 Sahada Kullanım İçin 3 Seçenek:

### 1. Cloudflare Workers (Ücretsiz - Önerilen)

**Adımlar:**
1. [Cloudflare Dashboard](https://dash.cloudflare.com/workers) → Create Worker
2. `proxy-worker.js` dosyasındaki kodu yapıştır
3. Environment Variables → `GEMINI_API_KEY` = `AIzaSyAZ5d3nzxpBSoigTJxIhW3X1R3qrSI0tFc`
4. Deploy → Worker URL'i kopyala (örn: `gemini-proxy.yourname.workers.dev`)
5. KARACA AI'da URL'i güncelle

**KARACA AI'da değiştir:**
```javascript
// Bu satırı bul:
const proxyUrl = 'https://api.allorigins.win/raw?url=';
// Şununla değiştir:
const proxyUrl = 'https://gemini-proxy.yourname.workers.dev/gemini';
```

---

### 2. Vercel Serverless Functions (Ücretsiz)

**Adımlar:**
1. [Vercel](https://vercel.com) → New Project
2. `api/gemini.js` dosyası oluştur
3. Environment Variable: `GEMINI_API_KEY`
4. Deploy → URL'i al

---

### 3. RapidAPI Proxy (Hızlı Çözüm)

**Adımlar:**
1. [RapidAPI](https://rapidapi.com) → Create API
2. Google Gemini API'yi wrap et
3. SDK'yı KARACA AI'a ekle

---

## 🚀 En Hızlı Çözüm: Cloudflare Workers

**5 dakikada hazır:**
- ✅ **Ücretsiz**
- ✅ **CORS yok**
- ✅ **GitHub Pages uyumlu**
- ✅ **Sahada çalışır**

**Worker URL örneği:**
```
https://karaca-ai-proxy.yourname.workers.dev
```

---

## 📱 Test Etmek

**Cloudflare Worker kurduktan sonra:**
1. GitHub Pages: `https://onlayne.github.io/karaca-servis/`
2. KARACA AI → Analiz Et
3. **Gemini AI çalışır!**

**Sahada kullanıma hazır!** 🎯
